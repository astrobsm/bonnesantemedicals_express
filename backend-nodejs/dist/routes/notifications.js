"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationsRoutes = void 0;
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const auth_1 = require("../middleware/auth");
const joi_1 = __importDefault(require("joi"));
const router = (0, express_1.Router)();
exports.notificationsRoutes = router;
const notificationSchema = joi_1.default.object({
    title: joi_1.default.string().required(),
    message: joi_1.default.string().required(),
    type: joi_1.default.string().valid('INFO', 'WARNING', 'ERROR', 'SUCCESS').default('INFO'),
    priority: joi_1.default.string().valid('LOW', 'MEDIUM', 'HIGH', 'URGENT').default('MEDIUM'),
    recipients: joi_1.default.array().items(joi_1.default.number().integer().positive()),
    allUsers: joi_1.default.boolean().default(false),
    roles: joi_1.default.array().items(joi_1.default.string().valid('Admin', 'Manager', 'Staff')),
    expiresAt: joi_1.default.date(),
    actionUrl: joi_1.default.string(),
    actionText: joi_1.default.string()
});
router.post('/', auth_1.authenticateToken, (0, auth_1.requireRole)(['Admin', 'Manager']), async (req, res) => {
    try {
        const { error, value } = notificationSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }
        const { recipients, allUsers, roles, ...notificationData } = value;
        let targetUserIds = [];
        if (allUsers) {
            const users = await prisma_1.prisma.user.findMany({
                where: { status: 'active' },
                select: { id: true }
            });
            targetUserIds = users.map(user => user.id);
        }
        else if (roles && roles.length > 0) {
            const users = await prisma_1.prisma.user.findMany({
                where: {
                    role: { in: roles },
                    status: 'active'
                },
                select: { id: true }
            });
            targetUserIds = users.map(user => user.id);
        }
        else if (recipients && recipients.length > 0) {
            targetUserIds = recipients;
        }
        if (targetUserIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No recipients specified'
            });
        }
        const notification = await prisma_1.prisma.notification.create({
            data: {
                ...notificationData,
                createdBy: req.user.userId,
                userNotifications: {
                    create: targetUserIds.map(userId => ({
                        userId,
                        isRead: false
                    }))
                }
            },
            include: {
                userNotifications: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                username: true,
                                fullName: true
                            }
                        }
                    }
                }
            }
        });
        res.status(201).json({
            success: true,
            message: 'Notification created successfully',
            data: { notification }
        });
    }
    catch (error) {
        console.error('Create notification error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create notification'
        });
    }
});
router.get('/my-notifications', auth_1.authenticateToken, async (req, res) => {
    try {
        const { page = 1, limit = 10, unreadOnly, type, priority } = req.query;
        const where = {
            userId: req.user.userId
        };
        if (unreadOnly === 'true') {
            where.isRead = false;
        }
        if (type || priority) {
            where.notification = {};
            if (type)
                where.notification.type = type;
            if (priority)
                where.notification.priority = priority;
        }
        const notifications = await prisma_1.prisma.userNotification.findMany({
            where,
            include: {
                notification: {
                    include: {
                        createdByUser: {
                            select: {
                                username: true,
                                fullName: true
                            }
                        }
                    }
                }
            },
            skip: (Number(page) - 1) * Number(limit),
            take: Number(limit),
            orderBy: { createdAt: 'desc' }
        });
        const total = await prisma_1.prisma.userNotification.count({ where });
        const unreadCount = await prisma_1.prisma.userNotification.count({
            where: {
                userId: req.user.userId,
                isRead: false
            }
        });
        res.json({
            success: true,
            data: {
                notifications,
                unreadCount,
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
        console.error('Get notifications error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get notifications'
        });
    }
});
router.get('/', auth_1.authenticateToken, (0, auth_1.requireRole)(['Admin', 'Manager']), async (req, res) => {
    try {
        const { page = 1, limit = 10, type, priority, createdBy } = req.query;
        const where = {};
        if (type)
            where.type = type;
        if (priority)
            where.priority = priority;
        if (createdBy)
            where.createdBy = parseInt(createdBy);
        const notifications = await prisma_1.prisma.notification.findMany({
            where,
            include: {
                createdByUser: {
                    select: {
                        username: true,
                        fullName: true
                    }
                },
                userNotifications: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                username: true,
                                fullName: true
                            }
                        }
                    }
                }
            },
            skip: (Number(page) - 1) * Number(limit),
            take: Number(limit),
            orderBy: { createdAt: 'desc' }
        });
        const total = await prisma_1.prisma.notification.count({ where });
        res.json({
            success: true,
            data: {
                notifications,
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
        console.error('Get all notifications error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get notifications'
        });
    }
});
router.patch('/:id/read', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userNotification = await prisma_1.prisma.userNotification.findFirst({
            where: {
                notificationId: parseInt(id),
                userId: req.user.userId
            }
        });
        if (!userNotification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }
        const updatedNotification = await prisma_1.prisma.userNotification.update({
            where: { id: userNotification.id },
            data: {
                isRead: true,
                readAt: new Date()
            },
            include: {
                notification: true
            }
        });
        res.json({
            success: true,
            message: 'Notification marked as read',
            data: { notification: updatedNotification }
        });
    }
    catch (error) {
        console.error('Mark notification as read error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark notification as read'
        });
    }
});
router.patch('/mark-all-read', auth_1.authenticateToken, async (req, res) => {
    try {
        await prisma_1.prisma.userNotification.updateMany({
            where: {
                userId: req.user.userId,
                isRead: false
            },
            data: {
                isRead: true,
                readAt: new Date()
            }
        });
        res.json({
            success: true,
            message: 'All notifications marked as read'
        });
    }
    catch (error) {
        console.error('Mark all notifications as read error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark all notifications as read'
        });
    }
});
router.delete('/:id', auth_1.authenticateToken, (0, auth_1.requireRole)(['Admin']), async (req, res) => {
    try {
        const { id } = req.params;
        await prisma_1.prisma.notification.delete({
            where: { id: parseInt(id) }
        });
        res.json({
            success: true,
            message: 'Notification deleted successfully'
        });
    }
    catch (error) {
        console.error('Delete notification error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete notification'
        });
    }
});
router.get('/stats/dashboard', auth_1.authenticateToken, (0, auth_1.requireRole)(['Admin', 'Manager']), async (req, res) => {
    try {
        const { days = 30 } = req.query;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - Number(days));
        const totalSent = await prisma_1.prisma.notification.count({
            where: {
                createdAt: { gte: startDate }
            }
        });
        const byType = await prisma_1.prisma.notification.groupBy({
            by: ['type'],
            where: {
                createdAt: { gte: startDate }
            },
            _count: true
        });
        const byPriority = await prisma_1.prisma.notification.groupBy({
            by: ['priority'],
            where: {
                createdAt: { gte: startDate }
            },
            _count: true
        });
        const totalUserNotifications = await prisma_1.prisma.userNotification.count({
            where: {
                createdAt: { gte: startDate }
            }
        });
        const readNotifications = await prisma_1.prisma.userNotification.count({
            where: {
                createdAt: { gte: startDate },
                isRead: true
            }
        });
        const readRate = totalUserNotifications > 0
            ? (readNotifications / totalUserNotifications) * 100
            : 0;
        res.json({
            success: true,
            data: {
                totalSent,
                byType,
                byPriority,
                readRate: Math.round(readRate * 100) / 100,
                period: {
                    days: Number(days),
                    startDate
                }
            }
        });
    }
    catch (error) {
        console.error('Get notification stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get notification statistics'
        });
    }
});
router.post('/system', auth_1.authenticateToken, (0, auth_1.requireRole)(['Admin', 'Manager']), async (req, res) => {
    try {
        const { type: notificationType } = req.body;
        let notifications = [];
        switch (notificationType) {
            case 'LOW_STOCK':
                const lowStockProducts = await prisma_1.prisma.product.findMany({
                    where: {
                        stockQuantity: {
                            lte: prisma_1.prisma.product.fields.minimumStock
                        },
                        isActive: true
                    },
                    take: 10
                });
                if (lowStockProducts.length > 0) {
                    const productNames = lowStockProducts.map(p => p.name).join(', ');
                    const notification = await prisma_1.prisma.notification.create({
                        data: {
                            title: 'Low Stock Alert',
                            message: `The following products are running low on stock: ${productNames}`,
                            type: 'WARNING',
                            priority: 'HIGH',
                            createdBy: req.user.userId,
                            actionUrl: '/products?lowStock=true',
                            actionText: 'View Products',
                            userNotifications: {
                                create: await prisma_1.prisma.user.findMany({
                                    where: {
                                        role: { in: ['Admin', 'Manager'] },
                                        status: 'active'
                                    },
                                    select: { id: true }
                                }).then(users => users.map(user => ({
                                    userId: user.id,
                                    isRead: false
                                })))
                            }
                        }
                    });
                    notifications.push(notification);
                }
                break;
            case 'ATTENDANCE_ALERT':
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const staffNotClockedIn = await prisma_1.prisma.staff.findMany({
                    where: {
                        isActive: true,
                        attendanceRecords: {
                            none: {
                                date: {
                                    gte: today,
                                    lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
                                }
                            }
                        }
                    },
                    include: {
                        user: {
                            select: { fullName: true }
                        }
                    }
                });
                if (staffNotClockedIn.length > 0) {
                    const staffNames = staffNotClockedIn.map(s => s.user?.fullName || 'Unknown').join(', ');
                    const notification = await prisma_1.prisma.notification.create({
                        data: {
                            title: 'Attendance Alert',
                            message: `The following staff members have not clocked in today: ${staffNames}`,
                            type: 'WARNING',
                            priority: 'MEDIUM',
                            createdBy: req.user.userId,
                            actionUrl: '/attendance',
                            actionText: 'View Attendance',
                            userNotifications: {
                                create: await prisma_1.prisma.user.findMany({
                                    where: {
                                        role: { in: ['Admin', 'Manager'] },
                                        status: 'active'
                                    },
                                    select: { id: true }
                                }).then(users => users.map(user => ({
                                    userId: user.id,
                                    isRead: false
                                })))
                            }
                        }
                    });
                    notifications.push(notification);
                }
                break;
            default:
                return res.status(400).json({
                    success: false,
                    message: 'Invalid notification type'
                });
        }
        res.json({
            success: true,
            message: `System notifications sent: ${notifications.length}`,
            data: { notifications }
        });
    }
    catch (error) {
        console.error('Send system notification error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send system notifications'
        });
    }
});
//# sourceMappingURL=notifications.js.map