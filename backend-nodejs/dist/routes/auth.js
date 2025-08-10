"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoutes = void 0;
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const auth_1 = require("../utils/auth");
const auth_2 = require("../middleware/auth");
const router = (0, express_1.Router)();
exports.authRoutes = router;
router.post('/register', async (req, res) => {
    try {
        const { username, password, role = 'User', email, fullName, phone } = req.body;
        const existingUser = await prisma_1.prisma.user.findUnique({
            where: { username }
        });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists'
            });
        }
        const hashedPassword = await (0, auth_1.hashPassword)(password);
        const user = await prisma_1.prisma.user.create({
            data: {
                username,
                hashedPassword,
                role,
                email,
                fullName,
                phone,
                status: 'pending'
            }
        });
        const token = (0, auth_1.generateToken)({
            userId: user.id,
            username: user.username,
            role: user.role
        });
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user: {
                    id: user.id,
                    username: user.username,
                    role: user.role,
                    status: user.status,
                    email: user.email,
                    fullName: user.fullName
                },
                token
            }
        });
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to register user'
        });
    }
});
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await prisma_1.prisma.user.findUnique({
            where: { username }
        });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }
        const isPasswordValid = await (0, auth_1.comparePassword)(password, user.hashedPassword);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }
        const token = (0, auth_1.generateToken)({
            userId: user.id,
            username: user.username,
            role: user.role
        });
        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user.id,
                    username: user.username,
                    role: user.role,
                    status: user.status,
                    email: user.email,
                    fullName: user.fullName
                },
                token
            }
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to login'
        });
    }
});
router.get('/me', auth_2.authenticateToken, async (req, res) => {
    try {
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: req.user.userId },
            select: {
                id: true,
                username: true,
                role: true,
                status: true,
                email: true,
                fullName: true,
                phone: true,
                profileCompleted: true,
                createdAt: true
            }
        });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        res.json({
            success: true,
            data: { user }
        });
    }
    catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get user data'
        });
    }
});
router.get('/list-users', auth_2.authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'Admin') {
            return res.status(403).json({
                success: false,
                message: 'Admin access required'
            });
        }
        const users = await prisma_1.prisma.user.findMany({
            select: {
                id: true,
                username: true,
                role: true,
                status: true,
                email: true,
                fullName: true,
                phone: true,
                profileCompleted: true,
                createdAt: true
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json({
            success: true,
            data: { users }
        });
    }
    catch (error) {
        console.error('List users error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to list users'
        });
    }
});
router.post('/approve-user/:userId', auth_2.authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'Admin') {
            return res.status(403).json({
                success: false,
                message: 'Admin access required'
            });
        }
        const { userId } = req.params;
        const user = await prisma_1.prisma.user.update({
            where: { id: parseInt(userId) },
            data: { status: 'active' },
            select: {
                id: true,
                username: true,
                role: true,
                status: true,
                email: true,
                fullName: true
            }
        });
        res.json({
            success: true,
            message: 'User approved successfully',
            data: { user }
        });
    }
    catch (error) {
        console.error('Approve user error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to approve user'
        });
    }
});
//# sourceMappingURL=auth.js.map