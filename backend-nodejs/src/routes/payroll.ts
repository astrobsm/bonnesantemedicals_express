import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticateToken, AuthenticatedRequest, requireRole } from '../middleware/auth';
import Joi from 'joi';

const router = Router();

// Validation schema
const payrollSchema = Joi.object({
  staffId: Joi.number().integer().positive().required(),
  payPeriodStart: Joi.date().required(),
  payPeriodEnd: Joi.date().required(),
  baseSalary: Joi.number().positive().required(),
  overtimeHours: Joi.number().min(0).default(0),
  overtimeRate: Joi.number().positive().default(0),
  bonuses: Joi.number().min(0).default(0),
  deductions: Joi.number().min(0).default(0),
  taxDeduction: Joi.number().min(0).default(0),
  notes: Joi.string()
});

// Generate payroll for a staff member
router.post('/generate', authenticateToken, requireRole(['Admin', 'Manager']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { staffId, payPeriodStart, payPeriodEnd } = req.body;

    if (!staffId || !payPeriodStart || !payPeriodEnd) {
      return res.status(400).json({
        success: false,
        message: 'Staff ID and pay period dates are required'
      });
    }

    // Get staff information
    const staff = await prisma.staff.findUnique({
      where: { id: parseInt(staffId) },
      include: {
        user: {
          select: {
            fullName: true,
            username: true
          }
        }
      }
    });

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }

    // Check if payroll already exists for this period
    const existingPayroll = await prisma.payrollRecord.findFirst({
      where: {
        staffId: parseInt(staffId),
        payPeriodStart: new Date(payPeriodStart),
        payPeriodEnd: new Date(payPeriodEnd)
      }
    });

    if (existingPayroll) {
      return res.status(400).json({
        success: false,
        message: 'Payroll already exists for this period'
      });
    }

    // Calculate attendance-based data
    const attendanceRecords = await prisma.attendanceRecord.findMany({
      where: {
        staffId: parseInt(staffId),
        date: {
          gte: new Date(payPeriodStart),
          lte: new Date(payPeriodEnd)
        }
      }
    });

    const totalOvertimeHours = attendanceRecords.reduce((sum, record) => 
      sum + (record.overtimeHours || 0), 0
    );

    const workingDays = attendanceRecords.filter(record => 
      record.status === 'PRESENT' || record.status === 'LATE' || record.status === 'OVERTIME'
    ).length;

    // Calculate payments
    const baseSalary = staff.salary || 0;
    const overtimeRate = baseSalary / 160; // Assuming 160 hours per month
    const overtimePay = totalOvertimeHours * overtimeRate;
    const grossPay = baseSalary + overtimePay;
    const taxDeduction = grossPay * 0.15; // 15% tax
    const netPay = grossPay - taxDeduction;

    // Create payroll record
    const payroll = await prisma.payrollRecord.create({
      data: {
        staffId: parseInt(staffId),
        payPeriodStart: new Date(payPeriodStart),
        payPeriodEnd: new Date(payPeriodEnd),
        baseSalary,
        overtimeHours: totalOvertimeHours,
        overtimeRate,
        bonuses: 0,
        deductions: 0,
        taxDeduction,
        grossPay,
        netPay,
        workingDays,
        status: 'PENDING'
      },
      include: {
        staff: {
          include: {
            user: {
              select: {
                fullName: true,
                username: true
              }
            }
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Payroll generated successfully',
      data: { payroll }
    });
  } catch (error) {
    console.error('Generate payroll error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate payroll'
    });
  }
});

// Create manual payroll record
router.post('/', authenticateToken, requireRole(['Admin', 'Manager']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { error, value } = payrollSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    // Calculate gross and net pay
    const overtimePay = value.overtimeHours * (value.overtimeRate || 0);
    const grossPay = value.baseSalary + overtimePay + value.bonuses - value.deductions;
    const netPay = grossPay - value.taxDeduction;

    const payroll = await prisma.payrollRecord.create({
      data: {
        ...value,
        grossPay,
        netPay,
        status: 'PENDING'
      },
      include: {
        staff: {
          include: {
            user: {
              select: {
                fullName: true,
                username: true
              }
            }
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Payroll record created successfully',
      data: { payroll }
    });
  } catch (error) {
    console.error('Create payroll error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payroll record'
    });
  }
});

// Get payroll records
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      staffId, 
      status,
      startDate,
      endDate
    } = req.query;
    
    const where: any = {};
    
    // If staff user, only show own records
    if (req.user!.role === 'Staff') {
      const staff = await prisma.staff.findFirst({
        where: { userId: req.user!.userId }
      });
      if (staff) where.staffId = staff.id;
    } else if (staffId) {
      where.staffId = parseInt(staffId as string);
    }
    
    if (status) where.status = status;
    if (startDate) {
      where.payPeriodStart = { gte: new Date(startDate as string) };
    }
    if (endDate) {
      where.payPeriodEnd = { lte: new Date(endDate as string) };
    }

    const payrollRecords = await prisma.payrollRecord.findMany({
      where,
      include: {
        staff: {
          include: {
            user: {
              select: {
                fullName: true,
                username: true
              }
            }
          }
        }
      },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
      orderBy: { payPeriodStart: 'desc' }
    });

    const total = await prisma.payrollRecord.count({ where });

    res.json({
      success: true,
      data: {
        payrollRecords,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get payroll records error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payroll records'
    });
  }
});

// Get payroll record by ID
router.get('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const payroll = await prisma.payrollRecord.findUnique({
      where: { id: parseInt(id) },
      include: {
        staff: {
          include: {
            user: {
              select: {
                fullName: true,
                username: true,
                email: true
              }
            }
          }
        }
      }
    });

    if (!payroll) {
      return res.status(404).json({
        success: false,
        message: 'Payroll record not found'
      });
    }

    // Check access rights
    if (req.user!.role === 'Staff') {
      const staff = await prisma.staff.findFirst({
        where: { userId: req.user!.userId }
      });
      if (!staff || payroll.staffId !== staff.id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    }

    res.json({
      success: true,
      data: { payroll }
    });
  } catch (error) {
    console.error('Get payroll by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payroll record'
    });
  }
});

// Update payroll record
router.put('/:id', authenticateToken, requireRole(['Admin', 'Manager']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updateSchema = payrollSchema.fork(['staffId', 'payPeriodStart', 'payPeriodEnd', 'baseSalary'], (schema) => schema.optional());
    
    const { error, value } = updateSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    // Recalculate if amounts changed
    if (value.baseSalary || value.overtimeHours || value.overtimeRate || value.bonuses || value.deductions || value.taxDeduction) {
      const currentRecord = await prisma.payrollRecord.findUnique({
        where: { id: parseInt(id) }
      });

      if (!currentRecord) {
        return res.status(404).json({
          success: false,
          message: 'Payroll record not found'
        });
      }

      const baseSalary = value.baseSalary ?? currentRecord.baseSalary;
      const overtimeHours = value.overtimeHours ?? currentRecord.overtimeHours;
      const overtimeRate = value.overtimeRate ?? currentRecord.overtimeRate;
      const bonuses = value.bonuses ?? currentRecord.bonuses;
      const deductions = value.deductions ?? currentRecord.deductions;
      const taxDeduction = value.taxDeduction ?? currentRecord.taxDeduction;

      const overtimePay = overtimeHours * overtimeRate;
      const grossPay = baseSalary + overtimePay + bonuses - deductions;
      const netPay = grossPay - taxDeduction;

      value.grossPay = grossPay;
      value.netPay = netPay;
    }

    const payroll = await prisma.payrollRecord.update({
      where: { id: parseInt(id) },
      data: value,
      include: {
        staff: {
          include: {
            user: {
              select: {
                fullName: true,
                username: true
              }
            }
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Payroll record updated successfully',
      data: { payroll }
    });
  } catch (error) {
    console.error('Update payroll error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update payroll record'
    });
  }
});

// Approve payroll
router.patch('/:id/approve', authenticateToken, requireRole(['Admin', 'Manager']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const payroll = await prisma.payrollRecord.update({
      where: { id: parseInt(id) },
      data: { 
        status: 'APPROVED',
        approvedBy: req.user!.userId,
        approvedAt: new Date()
      },
      include: {
        staff: {
          include: {
            user: {
              select: {
                fullName: true,
                username: true
              }
            }
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Payroll approved successfully',
      data: { payroll }
    });
  } catch (error) {
    console.error('Approve payroll error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve payroll'
    });
  }
});

// Process payroll (mark as paid)
router.patch('/:id/process', authenticateToken, requireRole(['Admin', 'Manager']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { paymentMethod, transactionId } = req.body;

    const payroll = await prisma.payrollRecord.update({
      where: { id: parseInt(id) },
      data: { 
        status: 'PAID',
        paidAt: new Date(),
        paymentMethod,
        transactionId
      },
      include: {
        staff: {
          include: {
            user: {
              select: {
                fullName: true,
                username: true
              }
            }
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Payroll processed successfully',
      data: { payroll }
    });
  } catch (error) {
    console.error('Process payroll error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process payroll'
    });
  }
});

// Delete payroll record
router.delete('/:id', authenticateToken, requireRole(['Admin']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.payrollRecord.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      success: true,
      message: 'Payroll record deleted successfully'
    });
  } catch (error) {
    console.error('Delete payroll error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete payroll record'
    });
  }
});

// Get payroll summary
router.get('/summary/dashboard', authenticateToken, requireRole(['Admin', 'Manager']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { month, year } = req.query;
    
    const startDate = month && year 
      ? new Date(Number(year), Number(month) - 1, 1)
      : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    
    const endDate = month && year
      ? new Date(Number(year), Number(month), 0, 23, 59, 59)
      : new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0, 23, 59, 59);

    // Total payroll expenses
    const totalExpenses = await prisma.payrollRecord.aggregate({
      where: {
        payPeriodStart: { gte: startDate },
        payPeriodEnd: { lte: endDate }
      },
      _sum: {
        grossPay: true,
        netPay: true,
        taxDeduction: true
      }
    });

    // Payroll by status
    const statusBreakdown = await prisma.payrollRecord.groupBy({
      by: ['status'],
      where: {
        payPeriodStart: { gte: startDate },
        payPeriodEnd: { lte: endDate }
      },
      _count: true,
      _sum: {
        netPay: true
      }
    });

    res.json({
      success: true,
      data: {
        totalExpenses,
        statusBreakdown,
        period: {
          startDate,
          endDate
        }
      }
    });
  } catch (error) {
    console.error('Get payroll summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payroll summary'
    });
  }
});

export { router as payrollRoutes };
