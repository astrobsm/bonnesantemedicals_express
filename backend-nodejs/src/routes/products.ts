import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticateToken, AuthenticatedRequest, requireRole } from '../middleware/auth';
import Joi from 'joi';

const router = Router();

// Validation schema
const productSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string(),
  sku: Joi.string().required(),
  categoryId: Joi.number().integer().positive().required(),
  supplierId: Joi.number().integer().positive(),
  unitPrice: Joi.number().positive().required(),
  costPrice: Joi.number().positive(),
  stockQuantity: Joi.number().integer().min(0).default(0),
  minimumStock: Joi.number().integer().min(0).default(0),
  isActive: Joi.boolean().default(true),
  weight: Joi.number().positive(),
  dimensions: Joi.string(),
  barcode: Joi.string(),
  taxRate: Joi.number().min(0).max(100).default(0)
});

// Create product
router.post('/', authenticateToken, requireRole(['Admin', 'Manager']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { error, value } = productSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const product = await prisma.product.create({
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
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create product'
    });
  }
});

// Get all products
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      categoryId, 
      supplierId, 
      active,
      lowStock 
    } = req.query;
    
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { sku: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } }
      ];
    }
    
    if (categoryId) where.categoryId = parseInt(categoryId as string);
    if (supplierId) where.supplierId = parseInt(supplierId as string);
    if (active !== undefined) where.isActive = active === 'true';
    if (lowStock === 'true') {
      where.stockQuantity = { lte: prisma.product.fields.minimumStock };
    }

    const products = await prisma.product.findMany({
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

    const total = await prisma.product.count({ where });

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
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get products'
    });
  }
});

// Get product by ID
router.get('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
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
  } catch (error) {
    console.error('Get product by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get product'
    });
  }
});

// Update product
router.put('/:id', authenticateToken, requireRole(['Admin', 'Manager']), async (req: AuthenticatedRequest, res: Response) => {
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

    const product = await prisma.product.update({
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
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update product'
    });
  }
});

// Delete product
router.delete('/:id', authenticateToken, requireRole(['Admin']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.product.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete product'
    });
  }
});

// Update stock
router.patch('/:id/stock', authenticateToken, requireRole(['Admin', 'Manager', 'Staff']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { quantity, type, notes } = req.body;

    if (!quantity || !type) {
      return res.status(400).json({
        success: false,
        message: 'Quantity and type are required'
      });
    }

    const product = await prisma.product.findUnique({
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

    // Update product stock and create inventory transaction
    const [updatedProduct] = await prisma.$transaction([
      prisma.product.update({
        where: { id: parseInt(id) },
        data: { stockQuantity: newStock }
      }),
      prisma.inventoryTransaction.create({
        data: {
          productId: parseInt(id),
          type,
          quantity,
          notes,
          userId: req.user!.userId
        }
      })
    ]);

    res.json({
      success: true,
      message: 'Stock updated successfully',
      data: { product: updatedProduct }
    });
  } catch (error) {
    console.error('Update stock error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update stock'
    });
  }
});

// Get low stock products
router.get('/alerts/low-stock', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const lowStockProducts = await prisma.product.findMany({
      where: {
        stockQuantity: {
          lte: prisma.product.fields.minimumStock
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
  } catch (error) {
    console.error('Get low stock error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get low stock products'
    });
  }
});

export { router as productsRoutes };
