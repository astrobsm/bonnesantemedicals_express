import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticateToken, AuthenticatedRequest, requireRole } from '../middleware/auth';
import Joi from 'joi';

const router = Router();

// Validation schema
const staffSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().min(6),
  email: Joi.string().email(),
  fullName: Joi.string().required(),
  phone: Joi.string(),
  role: Joi.string().valid('Admin', 'Manager', 'Staff').default('Staff'),
  position: Joi.string().required(),
  department: Joi.string().required(),
  salary: Joi.number().positive(),
  hireDate: Joi.date(),
  isActive: Joi.boolean().default(true)
});

// Create staff member (Admin/Manager only)
router.post('/', authenticateToken, requireRole(['Admin', 'Manager']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { error, value } = staffSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const staffMember = await prisma.staff.create({
      data: {
        ...value,
        user: value.username ? {
          create: {
            username: value.username,
            hashedPassword: value.password ? await require('../utils/auth').hashPassword(value.password) : '',
            role: value.role || 'Staff',
            email: value.email,
            fullName: value.fullName,
            phone: value.phone,
            status: 'active'
          }
        } : undefined
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            role: true,
            email: true,
            fullName: true,
            phone: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Staff member created successfully',
      data: { staff: staffMember }
    });
  } catch (error) {
    console.error('Create staff error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create staff member'
    });
  }
});

// Get all staff members
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { page = 1, limit = 10, department, position, active } = req.query;
    
    const where: any = {};
    if (department) where.department = department;
    if (position) where.position = position;
    if (active !== undefined) where.isActive = active === 'true';

    const staff = await prisma.staff.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            role: true,
            email: true,
            fullName: true,
            phone: true,
            status: true
          }
        }
      },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.staff.count({ where });

    res.json({
      success: true,
      data: {
        staff,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get staff error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get staff members'
    });
  }
});

// Get staff member by ID
router.get('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const staff = await prisma.staff.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            role: true,
            email: true,
            fullName: true,
            phone: true,
            status: true
          }
        },
        attendanceRecords: {
          take: 10,
          orderBy: { date: 'desc' }
        },
        payrollRecords: {
          take: 5,
          orderBy: { payPeriodStart: 'desc' }
        }
      }
    });

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }

    res.json({
      success: true,
      data: { staff }
    });
  } catch (error) {
    console.error('Get staff by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get staff member'
    });
  }
});

// Update staff member
router.put('/:id', authenticateToken, requireRole(['Admin', 'Manager']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updateSchema = staffSchema.fork(['username', 'password'], (schema) => schema.optional());
    
    const { error, value } = updateSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const staff = await prisma.staff.update({
      where: { id: parseInt(id) },
      data: {
        ...value,
        user: value.email || value.fullName || value.phone ? {
          update: {
            email: value.email,
            fullName: value.fullName,
            phone: value.phone,
            role: value.role
          }
        } : undefined
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            role: true,
            email: true,
            fullName: true,
            phone: true
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Staff member updated successfully',
      data: { staff }
    });
  } catch (error) {
    console.error('Update staff error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update staff member'
    });
  }
});

// Delete staff member
router.delete('/:id', authenticateToken, requireRole(['Admin']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.staff.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      success: true,
      message: 'Staff member deleted successfully'
    });
  } catch (error) {
    console.error('Delete staff error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete staff member'
    });
  }
});

// Get staff performance metrics
router.get('/:id/performance', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;

    const where: any = { staffId: parseInt(id) };
    if (startDate) where.date = { gte: new Date(startDate as string) };
    if (endDate) where.date = { ...where.date, lte: new Date(endDate as string) };

    // Get attendance stats
    const attendanceStats = await prisma.attendanceRecord.groupBy({
      by: ['status'],
      where,
      _count: true
    });

    // Get recent performance reviews
    const performanceReviews = await prisma.performanceReview.findMany({
      where: { staffId: parseInt(id) },
      orderBy: { reviewDate: 'desc' },
      take: 5
    });

    res.json({
      success: true,
      data: {
        attendanceStats,
        performanceReviews
      }
    });
  } catch (error) {
    console.error('Get performance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get performance data'
    });
  }
});

export { router as staffRoutes };
