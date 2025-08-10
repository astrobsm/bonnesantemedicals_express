"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.productsRoutes = void 0;
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const auth_1 = require("../middleware/auth");
const joi_1 = __importDefault(require("joi"));
const router = (0, express_1.Router)();
exports.productsRoutes = router;
const productSchema = joi_1.default.object({
    name: joi_1.default.string().required(),
    description: joi_1.default.string(),
    sku: joi_1.default.string().required(),
    categoryId: joi_1.default.number().integer().positive().required(),
    supplierId: joi_1.default.number().integer().positive(),
    unitPrice: joi_1.default.number().positive().required(),
    costPrice: joi_1.default.number().positive(),
    stockQuantity: joi_1.default.number().integer().min(0).default(0),
    minimumStock: joi_1.default.number().integer().min(0).default(0),
    isActive: joi_1.default.boolean().default(true),
    weight: joi_1.default.number().positive(),
    dimensions: joi_1.default.string(),
    barcode: joi_1.default.string(),
    taxRate: joi_1.default.number().min(0).max(100).default(0)
});
router.post('/', auth_1.authenticateToken, (0, auth_1.requireRole)(['Admin', 'Manager']), async (req, res) => {
    try {
        const { error, value } = productSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }
        const product = await prisma_1.prisma.product.create({
            data: value,
            include: {
                category: true,
                supplier: true
            }
        });
        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: { product }
        });
    }
    catch (error) {
        console.error('Create product error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create product'
        });
    }
});
router.get('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const { page = 1, limit = 10, search, categoryId, supplierId, active, lowStock } = req.query;
        const where = {};
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { sku: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } }
            ];
        }
        if (categoryId)
            where.categoryId = parseInt(categoryId);
        if (supplierId)
            where.supplierId = parseInt(supplierId);
        if (active !== undefined)
            where.isActive = active === 'true';
        if (lowStock === 'true') {
            where.stockQuantity = { lte: prisma_1.prisma.product.fields.minimumStock };
        }
        const products = await prisma_1.prisma.product.findMany({
            where,
            include: {
                category: true,
                supplier: true,
                inventoryTransactions: {
                    take: 5,
                    orderBy: { createdAt: 'desc' }
                }
            },
            skip: (Number(page) - 1) * Number(limit),
            take: Number(limit),
            orderBy: { createdAt: 'desc' }
        });
        const total = await prisma_1.prisma.product.count({ where });
        res.json({
            success: true,
            data: {
                products,
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
        console.error('Get products error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get products'
        });
    }
});
router.get('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const product = await prisma_1.prisma.product.findUnique({
            where: { id: parseInt(id) },
            include: {
                category: true,
                supplier: true,
                inventoryTransactions: {
                    orderBy: { createdAt: 'desc' },
                    take: 20
                },
                orderItems: {
                    include: {
                        order: {
                            select: {
                                id: true,
                                orderNumber: true,
                                status: true,
                                createdAt: true
                            }
                        }
                    },
                    take: 10,
                    orderBy: { createdAt: 'desc' }
                }
            }
        });
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        res.json({
            success: true,
            data: { product }
        });
    }
    catch (error) {
        console.error('Get product by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get product'
        });
    }
});
router.put('/:id', auth_1.authenticateToken, (0, auth_1.requireRole)(['Admin', 'Manager']), async (req, res) => {
    try {
        const { id } = req.params;
        const updateSchema = productSchema.fork(['name', 'sku', 'categoryId', 'unitPrice'], (schema) => schema.optional());
        const { error, value } = updateSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }
        const product = await prisma_1.prisma.product.update({
            where: { id: parseInt(id) },
            data: value,
            include: {
                category: true,
                supplier: true
            }
        });
        res.json({
            success: true,
            message: 'Product updated successfully',
            data: { product }
        });
    }
    catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update product'
        });
    }
});
router.delete('/:id', auth_1.authenticateToken, (0, auth_1.requireRole)(['Admin']), async (req, res) => {
    try {
        const { id } = req.params;
        await prisma_1.prisma.product.delete({
            where: { id: parseInt(id) }
        });
        res.json({
            success: true,
            message: 'Product deleted successfully'
        });
    }
    catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete product'
        });
    }
});
router.patch('/:id/stock', auth_1.authenticateToken, (0, auth_1.requireRole)(['Admin', 'Manager', 'Staff']), async (req, res) => {
    try {
        const { id } = req.params;
        const { quantity, type, notes } = req.body;
        if (!quantity || !type) {
            return res.status(400).json({
                success: false,
                message: 'Quantity and type are required'
            });
        }
        const product = await prisma_1.prisma.product.findUnique({
            where: { id: parseInt(id) }
        });
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        const newStock = type === 'IN'
            ? product.stockQuantity + quantity
            : product.stockQuantity - quantity;
        if (newStock < 0) {
            return res.status(400).json({
                success: false,
                message: 'Insufficient stock'
            });
        }
        const [updatedProduct] = await prisma_1.prisma.$transaction([
            prisma_1.prisma.product.update({
                where: { id: parseInt(id) },
                data: { stockQuantity: newStock }
            }),
            prisma_1.prisma.inventoryTransaction.create({
                data: {
                    productId: parseInt(id),
                    type,
                    quantity,
                    notes,
                    userId: req.user.userId
                }
            })
        ]);
        res.json({
            success: true,
            message: 'Stock updated successfully',
            data: { product: updatedProduct }
        });
    }
    catch (error) {
        console.error('Update stock error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update stock'
        });
    }
});
router.get('/alerts/low-stock', auth_1.authenticateToken, async (req, res) => {
    try {
        const lowStockProducts = await prisma_1.prisma.product.findMany({
            where: {
                stockQuantity: {
                    lte: prisma_1.prisma.product.fields.minimumStock
                },
                isActive: true
            },
            include: {
                category: true,
                supplier: true
            },
            orderBy: { stockQuantity: 'asc' }
        });
        res.json({
            success: true,
            data: { products: lowStockProducts }
        });
    }
    catch (error) {
        console.error('Get low stock error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get low stock products'
        });
    }
});
//# sourceMappingURL=products.js.map