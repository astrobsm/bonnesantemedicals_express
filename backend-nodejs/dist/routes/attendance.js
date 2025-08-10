"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.attendanceRoutes = void 0;
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const auth_1 = require("../middleware/auth");
const joi_1 = __importDefault(require("joi"));
const router = (0, express_1.Router)();
exports.attendanceRoutes = router;
const attendanceSchema = joi_1.default.object({
    staffId: joi_1.default.number().integer().positive().required(),
    date: joi_1.default.date().required(),
    checkIn: joi_1.default.date(),
    checkOut: joi_1.default.date(),
    status: joi_1.default.string().valid('PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'OVERTIME').default('PRESENT'),
    notes: joi_1.default.string(),
    overtimeHours: joi_1.default.number().min(0).default(0)
});
router.post('/clock', auth_1.authenticateToken, async (req, res) => {
    try {
        const { type } = req.body;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const staff = await prisma_1.prisma.staff.findFirst({
            where: { userId: req.user.userId }
        });
        if (!staff) {
            return res.status(404).json({
                success: false,
                message: 'Staff record not found'
            });
        }
        let attendance = await prisma_1.prisma.attendanceRecord.findFirst({
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
            const workStartTime = new Date(today);
            workStartTime.setHours(9, 0, 0, 0);
            const isLate = now > workStartTime;
            if (attendance) {
                attendance = await prisma_1.prisma.attendanceRecord.update({
                    where: { id: attendance.id },
                    data: {
                        checkIn: now,
                        status: isLate ? 'LATE' : 'PRESENT'
                    }
                });
            }
            else {
                attendance = await prisma_1.prisma.attendanceRecord.create({
                    data: {
                        staffId: staff.id,
                        date: today,
                        checkIn: now,
                        status: isLate ? 'LATE' : 'PRESENT'
                    }
                });
            }
        }
        else if (type === 'OUT') {
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
            const workHours = (now.getTime() - attendance.checkIn.getTime()) / (1000 * 60 * 60);
            const standardHours = 8;
            const overtimeHours = Math.max(0, workHours - standardHours);
            attendance = await prisma_1.prisma.attendanceRecord.update({
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
    }
    catch (error) {
        console.error('Clock in/out error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to clock in/out'
        });
    }
});
router.post('/', auth_1.authenticateToken, (0, auth_1.requireRole)(['Admin', 'Manager']), async (req, res) => {
    try {
        const { error, value } = attendanceSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }
        const attendance = await prisma_1.prisma.attendanceRecord.create({
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
    }
    catch (error) {
        console.error('Create attendance error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create attendance record'
        });
    }
});
router.get('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const { page = 1, limit = 10, staffId, startDate, endDate, status } = req.query;
        const where = {};
        if (req.user.role === 'Staff') {
            const staff = await prisma_1.prisma.staff.findFirst({
                where: { userId: req.user.userId }
            });
            if (staff)
                where.staffId = staff.id;
        }
        else if (staffId) {
            where.staffId = parseInt(staffId);
        }
        if (startDate) {
            where.date = { gte: new Date(startDate) };
        }
        if (endDate) {
            where.date = { ...where.date, lte: new Date(endDate) };
        }
        if (status) {
            where.status = status;
        }
        const attendance = await prisma_1.prisma.attendanceRecord.findMany({
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
        const total = await prisma_1.prisma.attendanceRecord.count({ where });
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
    }
    catch (error) {
        console.error('Get attendance error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get attendance records'
        });
    }
});
router.get('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const attendance = await prisma_1.prisma.attendanceRecord.findUnique({
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
        if (req.user.role === 'Staff') {
            const staff = await prisma_1.prisma.staff.findFirst({
                where: { userId: req.user.userId }
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
    }
    catch (error) {
        console.error('Get attendance by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get attendance record'
        });
    }
});
router.put('/:id', auth_1.authenticateToken, (0, auth_1.requireRole)(['Admin', 'Manager']), async (req, res) => {
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
        const attendance = await prisma_1.prisma.attendanceRecord.update({
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
    }
    catch (error) {
        console.error('Update attendance error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update attendance record'
        });
    }
});
router.delete('/:id', auth_1.authenticateToken, (0, auth_1.requireRole)(['Admin']), async (req, res) => {
    try {
        const { id } = req.params;
        await prisma_1.prisma.attendanceRecord.delete({
            where: { id: parseInt(id) }
        });
        res.json({
            success: true,
            message: 'Attendance record deleted successfully'
        });
    }
    catch (error) {
        console.error('Delete attendance error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete attendance record'
        });
    }
});
router.get('/summary/:staffId', auth_1.authenticateToken, async (req, res) => {
    try {
        const { staffId } = req.params;
        const { month, year } = req.query;
        if (req.user.role === 'Staff') {
            const staff = await prisma_1.prisma.staff.findFirst({
                where: { userId: req.user.userId }
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
        const summary = await prisma_1.prisma.attendanceRecord.groupBy({
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
        const totalOvertimeHours = await prisma_1.prisma.attendanceRecord.aggregate({
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
    }
    catch (error) {
        console.error('Get attendance summary error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get attendance summary'
        });
    }
});
//# sourceMappingURL=attendance.js.map