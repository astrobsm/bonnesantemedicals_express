"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.payrollRoutes = void 0;
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const auth_1 = require("../middleware/auth");
const joi_1 = __importDefault(require("joi"));
const router = (0, express_1.Router)();
exports.payrollRoutes = router;
const payrollSchema = joi_1.default.object({
    staffId: joi_1.default.number().integer().positive().required(),
    payPeriodStart: joi_1.default.date().required(),
    payPeriodEnd: joi_1.default.date().required(),
    baseSalary: joi_1.default.number().positive().required(),
    overtimeHours: joi_1.default.number().min(0).default(0),
    overtimeRate: joi_1.default.number().positive().default(0),
    bonuses: joi_1.default.number().min(0).default(0),
    deductions: joi_1.default.number().min(0).default(0),
    taxDeduction: joi_1.default.number().min(0).default(0),
    notes: joi_1.default.string()
});
router.post('/generate', auth_1.authenticateToken, (0, auth_1.requireRole)(['Admin', 'Manager']), async (req, res) => {
    try {
        const { staffId, payPeriodStart, payPeriodEnd } = req.body;
        if (!staffId || !payPeriodStart || !payPeriodEnd) {
            return res.status(400).json({
                success: false,
                message: 'Staff ID and pay period dates are required'
            });
        }
        const staff = await prisma_1.prisma.staff.findUnique({
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
        const existingPayroll = await prisma_1.prisma.payrollRecord.findFirst({
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
        const attendanceRecords = await prisma_1.prisma.attendanceRecord.findMany({
            where: {
                staffId: parseInt(staffId),
                date: {
                    gte: new Date(payPeriodStart),
                    lte: new Date(payPeriodEnd)
                }
            }
        });
        const totalOvertimeHours = attendanceRecords.reduce((sum, record) => sum + (record.overtimeHours || 0), 0);
        const workingDays = attendanceRecords.filter(record => record.status === 'PRESENT' || record.status === 'LATE' || record.status === 'OVERTIME').length;
        const baseSalary = staff.salary || 0;
        const overtimeRate = baseSalary / 160;
        const overtimePay = totalOvertimeHours * overtimeRate;
        const grossPay = baseSalary + overtimePay;
        const taxDeduction = grossPay * 0.15;
        const netPay = grossPay - taxDeduction;
        const payroll = await prisma_1.prisma.payrollRecord.create({
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
    }
    catch (error) {
        console.error('Generate payroll error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate payroll'
        });
    }
});
router.post('/', auth_1.authenticateToken, (0, auth_1.requireRole)(['Admin', 'Manager']), async (req, res) => {
    try {
        const { error, value } = payrollSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }
        const overtimePay = value.overtimeHours * (value.overtimeRate || 0);
        const grossPay = value.baseSalary + overtimePay + value.bonuses - value.deductions;
        const netPay = grossPay - value.taxDeduction;
        const payroll = await prisma_1.prisma.payrollRecord.create({
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
    }
    catch (error) {
        console.error('Create payroll error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create payroll record'
        });
    }
});
router.get('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const { page = 1, limit = 10, staffId, status, startDate, endDate } = req.query;
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
        if (status)
            where.status = status;
        if (startDate) {
            where.payPeriodStart = { gte: new Date(startDate) };
        }
        if (endDate) {
            where.payPeriodEnd = { lte: new Date(endDate) };
        }
        const payrollRecords = await prisma_1.prisma.payrollRecord.findMany({
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
        const total = await prisma_1.prisma.payrollRecord.count({ where });
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
    }
    catch (error) {
        console.error('Get payroll records error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get payroll records'
        });
    }
});
router.get('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const payroll = await prisma_1.prisma.payrollRecord.findUnique({
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
        if (req.user.role === 'Staff') {
            const staff = await prisma_1.prisma.staff.findFirst({
                where: { userId: req.user.userId }
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
    }
    catch (error) {
        console.error('Get payroll by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get payroll record'
        });
    }
});
router.put('/:id', auth_1.authenticateToken, (0, auth_1.requireRole)(['Admin', 'Manager']), async (req, res) => {
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
        if (value.baseSalary || value.overtimeHours || value.overtimeRate || value.bonuses || value.deductions || value.taxDeduction) {
            const currentRecord = await prisma_1.prisma.payrollRecord.findUnique({
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
        const payroll = await prisma_1.prisma.payrollRecord.update({
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
    }
    catch (error) {
        console.error('Update payroll error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update payroll record'
        });
    }
});
router.patch('/:id/approve', auth_1.authenticateToken, (0, auth_1.requireRole)(['Admin', 'Manager']), async (req, res) => {
    try {
        const { id } = req.params;
        const payroll = await prisma_1.prisma.payrollRecord.update({
            where: { id: parseInt(id) },
            data: {
                status: 'APPROVED',
                approvedBy: req.user.userId,
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
    }
    catch (error) {
        console.error('Approve payroll error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to approve payroll'
        });
    }
});
router.patch('/:id/process', auth_1.authenticateToken, (0, auth_1.requireRole)(['Admin', 'Manager']), async (req, res) => {
    try {
        const { id } = req.params;
        const { paymentMethod, transactionId } = req.body;
        const payroll = await prisma_1.prisma.payrollRecord.update({
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
    }
    catch (error) {
        console.error('Process payroll error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process payroll'
        });
    }
});
router.delete('/:id', auth_1.authenticateToken, (0, auth_1.requireRole)(['Admin']), async (req, res) => {
    try {
        const { id } = req.params;
        await prisma_1.prisma.payrollRecord.delete({
            where: { id: parseInt(id) }
        });
        res.json({
            success: true,
            message: 'Payroll record deleted successfully'
        });
    }
    catch (error) {
        console.error('Delete payroll error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete payroll record'
        });
    }
});
router.get('/summary/dashboard', auth_1.authenticateToken, (0, auth_1.requireRole)(['Admin', 'Manager']), async (req, res) => {
    try {
        const { month, year } = req.query;
        const startDate = month && year
            ? new Date(Number(year), Number(month) - 1, 1)
            : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const endDate = month && year
            ? new Date(Number(year), Number(month), 0, 23, 59, 59)
            : new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0, 23, 59, 59);
        const totalExpenses = await prisma_1.prisma.payrollRecord.aggregate({
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
        const statusBreakdown = await prisma_1.prisma.payrollRecord.groupBy({
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
    }
    catch (error) {
        console.error('Get payroll summary error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get payroll summary'
        });
    }
});
//# sourceMappingURL=payroll.js.map