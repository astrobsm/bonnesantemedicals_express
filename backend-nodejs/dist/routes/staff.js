"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.staffRoutes = void 0;
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const auth_1 = require("../middleware/auth");
const joi_1 = __importDefault(require("joi"));
const router = (0, express_1.Router)();
exports.staffRoutes = router;
const staffSchema = joi_1.default.object({
    username: joi_1.default.string().required(),
    password: joi_1.default.string().min(6),
    email: joi_1.default.string().email(),
    fullName: joi_1.default.string().required(),
    phone: joi_1.default.string(),
    role: joi_1.default.string().valid('Admin', 'Manager', 'Staff').default('Staff'),
    position: joi_1.default.string().required(),
    department: joi_1.default.string().required(),
    salary: joi_1.default.number().positive(),
    hireDate: joi_1.default.date(),
    isActive: joi_1.default.boolean().default(true)
});
router.post('/', auth_1.authenticateToken, (0, auth_1.requireRole)(['Admin', 'Manager']), async (req, res) => {
    try {
        const { error, value } = staffSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }
        const staffMember = await prisma_1.prisma.staff.create({
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
    }
    catch (error) {
        console.error('Create staff error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create staff member'
        });
    }
});
router.get('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const { page = 1, limit = 10, department, position, active } = req.query;
        const where = {};
        if (department)
            where.department = department;
        if (position)
            where.position = position;
        if (active !== undefined)
            where.isActive = active === 'true';
        const staff = await prisma_1.prisma.staff.findMany({
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
        const total = await prisma_1.prisma.staff.count({ where });
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
    }
    catch (error) {
        console.error('Get staff error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get staff members'
        });
    }
});
router.get('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const staff = await prisma_1.prisma.staff.findUnique({
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
    }
    catch (error) {
        console.error('Get staff by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get staff member'
        });
    }
});
router.put('/:id', auth_1.authenticateToken, (0, auth_1.requireRole)(['Admin', 'Manager']), async (req, res) => {
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
        const staff = await prisma_1.prisma.staff.update({
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
    }
    catch (error) {
        console.error('Update staff error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update staff member'
        });
    }
});
router.delete('/:id', auth_1.authenticateToken, (0, auth_1.requireRole)(['Admin']), async (req, res) => {
    try {
        const { id } = req.params;
        await prisma_1.prisma.staff.delete({
            where: { id: parseInt(id) }
        });
        res.json({
            success: true,
            message: 'Staff member deleted successfully'
        });
    }
    catch (error) {
        console.error('Delete staff error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete staff member'
        });
    }
});
router.get('/:id/performance', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { startDate, endDate } = req.query;
        const where = { staffId: parseInt(id) };
        if (startDate)
            where.date = { gte: new Date(startDate) };
        if (endDate)
            where.date = { ...where.date, lte: new Date(endDate) };
        const attendanceStats = await prisma_1.prisma.attendanceRecord.groupBy({
            by: ['status'],
            where,
            _count: true
        });
        const performanceReviews = await prisma_1.prisma.performanceReview.findMany({
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
    }
    catch (error) {
        console.error('Get performance error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get performance data'
        });
    }
});
//# sourceMappingURL=staff.js.map