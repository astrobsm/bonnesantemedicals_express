import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticateToken, AuthenticatedRequest, requireRole } from '../middleware/auth';
import Joi from 'joi';

const router = Router();

// Validation schema
const attendanceSchema = Joi.object({
  staffId: Joi.number().integer().positive().required(),
  date: Joi.date().required(),
  checkIn: Joi.date(),
  checkOut: Joi.date(),
  status: Joi.string().valid('PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'OVERTIME').default('PRESENT'),
  notes: Joi.string(),
  overtimeHours: Joi.number().min(0).default(0)
});

// Clock in/out
router.post('/clock', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { type } = req.body; // 'IN' or 'OUT'
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find staff record for current user
    const staff = await prisma.staff.findFirst({
      where: { userId: req.user!.userId }
    });

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff record not found'
      });
    }

    // Check if attendance record exists for today
    let attendance = await prisma.attendanceRecord.findFirst({
      where: {
        staffId: staff.id,
        date: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
        }
      }
    });

    const now = new Date();

    if (type === 'IN') {
      if (attendance && attendance.checkIn) {
        return res.status(400).json({
          success: false,
          message: 'Already clocked in today'
        });
      }

      // Determine status based on time
      const workStartTime = new Date(today);
      workStartTime.setHours(9, 0, 0, 0); // 9 AM
      const isLate = now > workStartTime;

      if (attendance) {
        attendance = await prisma.attendanceRecord.update({
          where: { id: attendance.id },
          data: {
            checkIn: now,
            status: isLate ? 'LATE' : 'PRESENT'
          }
        });
      } else {
        attendance = await prisma.attendanceRecord.create({
          data: {
            staffId: staff.id,
            date: today,
            checkIn: now,
            status: isLate ? 'LATE' : 'PRESENT'
          }
        });
      }
    } else if (type === 'OUT') {
      if (!attendance || !attendance.checkIn) {
        return res.status(400).json({
          success: false,
          message: 'Must clock in before clocking out'
        });
      }

      if (attendance.checkOut) {
        return res.status(400).json({
          success: false,
          message: 'Already clocked out today'
        });
      }

      // Calculate overtime
      const workHours = (now.getTime() - attendance.checkIn.getTime()) / (1000 * 60 * 60);
      const standardHours = 8;
      const overtimeHours = Math.max(0, workHours - standardHours);

      attendance = await prisma.attendanceRecord.update({
        where: { id: attendance.id },
        data: {
          checkOut: now,
          overtimeHours: overtimeHours,
          status: overtimeHours > 0 ? 'OVERTIME' : attendance.status
        }
      });
    }

    res.json({
      success: true,
      message: `Clocked ${type.toLowerCase()} successfully`,
      data: { attendance }
    });
  } catch (error) {
    console.error('Clock in/out error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clock in/out'
    });
  }
});

// Create attendance record (Admin/Manager)
router.post('/', authenticateToken, requireRole(['Admin', 'Manager']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { error, value } = attendanceSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const attendance = await prisma.attendanceRecord.create({
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

    res.status(201).json({
      success: true,
      message: 'Attendance record created successfully',
      data: { attendance }
    });
  } catch (error) {
    console.error('Create attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create attendance record'
    });
  }
});

// Get attendance records
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      staffId, 
      startDate, 
      endDate,
      status 
    } = req.query;
    
    const where: any = {};
    
    // If not admin/manager, only show own records
    if (req.user!.role === 'Staff') {
      const staff = await prisma.staff.findFirst({
        where: { userId: req.user!.userId }
      });
      if (staff) where.staffId = staff.id;
    } else if (staffId) {
      where.staffId = parseInt(staffId as string);
    }
    
    if (startDate) {
      where.date = { gte: new Date(startDate as string) };
    }
    if (endDate) {
      where.date = { ...where.date, lte: new Date(endDate as string) };
    }
    if (status) {
      where.status = status;
    }

    const attendance = await prisma.attendanceRecord.findMany({
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
      orderBy: { date: 'desc' }
    });

    const total = await prisma.attendanceRecord.count({ where });

    res.json({
      success: true,
      data: {
        attendance,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get attendance records'
    });
  }
});

// Get attendance by ID
router.get('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const attendance = await prisma.attendanceRecord.findUnique({
      where: { id: parseInt(id) },
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

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found'
      });
    }

    // Check if user can access this record
    if (req.user!.role === 'Staff') {
      const staff = await prisma.staff.findFirst({
        where: { userId: req.user!.userId }
      });
      if (!staff || attendance.staffId !== staff.id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    }

    res.json({
      success: true,
      data: { attendance }
    });
  } catch (error) {
    console.error('Get attendance by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get attendance record'
    });
  }
});

// Update attendance record
router.put('/:id', authenticateToken, requireRole(['Admin', 'Manager']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updateSchema = attendanceSchema.fork(['staffId', 'date'], (schema) => schema.optional());
    
    const { error, value } = updateSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const attendance = await prisma.attendanceRecord.update({
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
      message: 'Attendance record updated successfully',
      data: { attendance }
    });
  } catch (error) {
    console.error('Update attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update attendance record'
    });
  }
});

// Delete attendance record
router.delete('/:id', authenticateToken, requireRole(['Admin']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.attendanceRecord.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      success: true,
      message: 'Attendance record deleted successfully'
    });
  } catch (error) {
    console.error('Delete attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete attendance record'
    });
  }
});

// Get attendance summary
router.get('/summary/:staffId', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { staffId } = req.params;
    const { month, year } = req.query;

    // Check access rights
    if (req.user!.role === 'Staff') {
      const staff = await prisma.staff.findFirst({
        where: { userId: req.user!.userId }
      });
      if (!staff || staff.id !== parseInt(staffId)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    }

    const startDate = new Date(Number(year), Number(month) - 1, 1);
    const endDate = new Date(Number(year), Number(month), 0, 23, 59, 59);

    const summary = await prisma.attendanceRecord.groupBy({
      by: ['status'],
      where: {
        staffId: parseInt(staffId),
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      _count: true,
      _sum: {
        overtimeHours: true
      }
    });

    const totalOvertimeHours = await prisma.attendanceRecord.aggregate({
      where: {
        staffId: parseInt(staffId),
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      _sum: {
        overtimeHours: true
      }
    });

    res.json({
      success: true,
      data: {
        summary,
        totalOvertimeHours: totalOvertimeHours._sum.overtimeHours || 0,
        period: {
          month: Number(month),
          year: Number(year),
          startDate,
          endDate
        }
      }
    });
  } catch (error) {
    console.error('Get attendance summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get attendance summary'
    });
  }
});

export { router as attendanceRoutes };
