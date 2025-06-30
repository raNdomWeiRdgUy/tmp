import { Router, Response } from 'express';
import { query, param, body, validationResult } from 'express-validator';
import prisma from '@/config/database';
import { AuthRequest, ApiResponse, UserRole, ValidationError, NotFoundError } from '@/types';
import { asyncHandler } from '@/middleware/errorHandler';
import { authenticate, authorize } from '@/middleware/auth';
import logger from '@/config/logger';

const router = Router();

// Admin dashboard overview
router.get('/dashboard',
  authenticate,
  authorize(UserRole.ADMIN),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const [
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
      usersToday,
      ordersToday,
      revenueToday,
      lowStockProducts,
      pendingOrders,
      recentUsers,
      topProducts,
    ] = await Promise.all([
      // Total counts
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.product.count({ where: { status: 'ACTIVE' } }),
      prisma.order.count(),
      prisma.order.aggregate({ _sum: { total: true } }),

      // Today's metrics
      prisma.user.count({
        where: {
          role: 'CUSTOMER',
          createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        },
      }),
      prisma.order.count({
        where: {
          createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        },
      }),
      prisma.order.aggregate({
        where: {
          createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        },
        _sum: { total: true },
      }),

      // Low stock products
      prisma.product.findMany({
        where: {
          stockQuantity: { lte: prisma.product.fields.lowStockThreshold },
          status: 'ACTIVE',
        },
        select: {
          id: true,
          title: true,
          stockQuantity: true,
          lowStockThreshold: true,
        },
        take: 10,
      }),

      // Pending orders
      prisma.order.count({ where: { status: 'PENDING' } }),

      // Recent users
      prisma.user.findMany({
        where: { role: 'CUSTOMER' },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),

      // Top selling products
      prisma.orderItem.groupBy({
        by: ['productId'],
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5,
      }),
    ]);

    // Get product details for top products
    const topProductsWithDetails = await Promise.all(
      topProducts.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: { id: true, title: true, price: true },
        });
        return {
          ...product,
          totalSold: item._sum.quantity,
        };
      })
    );

    const dashboard = {
      overview: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue: parseFloat(totalRevenue._sum.total?.toString() || '0'),
        usersToday,
        ordersToday,
        revenueToday: parseFloat(revenueToday._sum.total?.toString() || '0'),
        pendingOrders,
      },
      alerts: {
        lowStockCount: lowStockProducts.length,
        lowStockProducts,
      },
      recent: {
        users: recentUsers,
        products: topProductsWithDetails,
      },
    };

    const response: ApiResponse = {
      success: true,
      message: 'Dashboard data retrieved successfully',
      data: { dashboard },
    };

    res.json(response);
  })
);

// Get analytics data
router.get('/analytics',
  authenticate,
  authorize(UserRole.ADMIN),
  [
    query('period').optional().isIn(['7d', '30d', '90d', '1y']).withMessage('Invalid period'),
    query('type').optional().isIn(['sales', 'users', 'products']).withMessage('Invalid analytics type'),
  ],
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError('Validation failed', errors.array().map(error => ({
        field: error.param,
        message: error.msg,
      })));
    }

    const period = req.query.period as string || '30d';
    const type = req.query.type as string || 'sales';

    // Calculate date range
    const periodDays = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
      '1y': 365,
    };
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - periodDays[period as keyof typeof periodDays]);

    let analytics: any = {};

    if (type === 'sales' || type === 'all') {
      // Sales analytics
      const [
        salesByDay,
        ordersByStatus,
        topCategories,
        averageOrderValue,
      ] = await Promise.all([
        // Daily sales
        prisma.$queryRaw`
          SELECT
            DATE(created_at) as date,
            COUNT(*)::int as order_count,
            SUM(total)::float as revenue
          FROM orders
          WHERE created_at >= ${startDate}
          GROUP BY DATE(created_at)
          ORDER BY date ASC
        `,

        // Orders by status
        prisma.order.groupBy({
          by: ['status'],
          where: { createdAt: { gte: startDate } },
          _count: { status: true },
        }),

        // Top categories
        prisma.$queryRaw`
          SELECT
            c.name as category_name,
            SUM(oi.quantity)::int as total_sold,
            SUM(oi.price * oi.quantity)::float as revenue
          FROM order_items oi
          JOIN products p ON oi.product_id = p.id
          JOIN categories c ON p.category_id = c.id
          JOIN orders o ON oi.order_id = o.id
          WHERE o.created_at >= ${startDate}
          GROUP BY c.id, c.name
          ORDER BY revenue DESC
          LIMIT 10
        `,

        // Average order value
        prisma.order.aggregate({
          where: { createdAt: { gte: startDate } },
          _avg: { total: true },
        }),
      ]);

      analytics.sales = {
        salesByDay,
        ordersByStatus,
        topCategories,
        averageOrderValue: parseFloat(averageOrderValue._avg.total?.toString() || '0'),
      };
    }

    if (type === 'users' || type === 'all') {
      // User analytics
      const [
        userGrowth,
        usersByRole,
        activeUsers,
      ] = await Promise.all([
        // Daily user registrations
        prisma.$queryRaw`
          SELECT
            DATE(created_at) as date,
            COUNT(*)::int as new_users
          FROM users
          WHERE created_at >= ${startDate}
          GROUP BY DATE(created_at)
          ORDER BY date ASC
        `,

        // Users by role
        prisma.user.groupBy({
          by: ['role'],
          _count: { role: true },
        }),

        // Active users (users who placed orders)
        prisma.user.count({
          where: {
            orders: {
              some: {
                createdAt: { gte: startDate },
              },
            },
          },
        }),
      ]);

      analytics.users = {
        userGrowth,
        usersByRole,
        activeUsers,
      };
    }

    if (type === 'products' || type === 'all') {
      // Product analytics
      const [
        productPerformance,
        stockLevels,
        categoryDistribution,
      ] = await Promise.all([
        // Top performing products
        prisma.$queryRaw`
          SELECT
            p.id,
            p.title,
            SUM(oi.quantity)::int as total_sold,
            SUM(oi.price * oi.quantity)::float as revenue,
            AVG(r.rating)::float as avg_rating,
            COUNT(r.id)::int as review_count
          FROM products p
          LEFT JOIN order_items oi ON p.id = oi.product_id
          LEFT JOIN orders o ON oi.order_id = o.id
          LEFT JOIN reviews r ON p.id = r.product_id
          WHERE o.created_at >= ${startDate} OR o.created_at IS NULL
          GROUP BY p.id, p.title
          ORDER BY revenue DESC NULLS LAST
          LIMIT 10
        `,

        // Stock levels
        prisma.product.groupBy({
          by: ['status'],
          _count: { status: true },
          _avg: { stockQuantity: true },
        }),

        // Products by category
        prisma.product.groupBy({
          by: ['categoryId'],
          where: { status: 'ACTIVE' },
          _count: { categoryId: true },
        }),
      ]);

      analytics.products = {
        productPerformance,
        stockLevels,
        categoryDistribution,
      };
    }

    const response: ApiResponse = {
      success: true,
      message: 'Analytics data retrieved successfully',
      data: { analytics, period, type },
    };

    res.json(response);
  })
);

// User management - Get all users
router.get('/users',
  authenticate,
  authorize(UserRole.ADMIN),
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('role').optional().isIn(['CUSTOMER', 'SELLER', 'ADMIN']),
    query('search').optional().isString(),
    query('isActive').optional().isBoolean(),
  ],
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError('Validation failed', errors.array().map(error => ({
        field: error.param,
        message: error.msg,
      })));
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (req.query.role) where.role = req.query.role;
    if (req.query.isActive !== undefined) where.isActive = req.query.isActive === 'true';
    if (req.query.search) {
      where.OR = [
        { firstName: { contains: req.query.search, mode: 'insensitive' } },
        { lastName: { contains: req.query.search, mode: 'insensitive' } },
        { email: { contains: req.query.search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isEmailVerified: true,
          isActive: true,
          createdAt: true,
          _count: {
            select: {
              orders: true,
              reviews: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    const response: ApiResponse = {
      success: true,
      message: 'Users retrieved successfully',
      data: { users },
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };

    res.json(response);
  })
);

// Update user status
router.patch('/users/:id/status',
  authenticate,
  authorize(UserRole.ADMIN),
  [
    param('id').isString().withMessage('User ID is required'),
    body('isActive').isBoolean().withMessage('isActive must be a boolean'),
  ],
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError('Validation failed', errors.array().map(error => ({
        field: error.param,
        message: error.msg,
      })));
    }

    const { id } = req.params;
    const { isActive } = req.body;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { isActive },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
      },
    });

    logger.info('User status updated by admin:', {
      adminId: req.user!.id,
      userId: id,
      newStatus: isActive,
    });

    const response: ApiResponse = {
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: { user: updatedUser },
    };

    res.json(response);
  })
);

// Seller management
router.get('/sellers',
  authenticate,
  authorize(UserRole.ADMIN),
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('isVerified').optional().isBoolean(),
    query('isActive').optional().isBoolean(),
  ],
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError('Validation failed', errors.array().map(error => ({
        field: error.param,
        message: error.msg,
      })));
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (req.query.isVerified !== undefined) where.isVerified = req.query.isVerified === 'true';
    if (req.query.isActive !== undefined) where.isActive = req.query.isActive === 'true';

    const [sellers, total] = await Promise.all([
      prisma.seller.findMany({
        where,
        skip,
        take: limit,
        include: {
          _count: {
            select: {
              products: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.seller.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    const response: ApiResponse = {
      success: true,
      message: 'Sellers retrieved successfully',
      data: { sellers },
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };

    res.json(response);
  })
);

// Update seller verification status
router.patch('/sellers/:id/verify',
  authenticate,
  authorize(UserRole.ADMIN),
  [
    param('id').isString().withMessage('Seller ID is required'),
    body('isVerified').isBoolean().withMessage('isVerified must be a boolean'),
  ],
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError('Validation failed', errors.array().map(error => ({
        field: error.param,
        message: error.msg,
      })));
    }

    const { id } = req.params;
    const { isVerified } = req.body;

    const seller = await prisma.seller.findUnique({ where: { id } });
    if (!seller) {
      throw new NotFoundError('Seller not found');
    }

    const updatedSeller = await prisma.seller.update({
      where: { id },
      data: { isVerified },
    });

    logger.info('Seller verification status updated by admin:', {
      adminId: req.user!.id,
      sellerId: id,
      isVerified,
    });

    const response: ApiResponse = {
      success: true,
      message: `Seller ${isVerified ? 'verified' : 'unverified'} successfully`,
      data: { seller: updatedSeller },
    };

    res.json(response);
  })
);

// Product management
router.get('/products',
  authenticate,
  authorize(UserRole.ADMIN),
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('status').optional().isIn(['ACTIVE', 'INACTIVE', 'OUT_OF_STOCK', 'DISCONTINUED']),
    query('categoryId').optional().isString(),
    query('sellerId').optional().isString(),
    query('lowStock').optional().isBoolean(),
  ],
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError('Validation failed', errors.array().map(error => ({
        field: error.param,
        message: error.msg,
      })));
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (req.query.status) where.status = req.query.status;
    if (req.query.categoryId) where.categoryId = req.query.categoryId;
    if (req.query.sellerId) where.sellerId = req.query.sellerId;
    if (req.query.lowStock === 'true') {
      where.stockQuantity = { lte: prisma.product.fields.lowStockThreshold };
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        include: {
          category: { select: { id: true, name: true } },
          seller: { select: { id: true, name: true, isVerified: true } },
          images: { take: 1, orderBy: { sortOrder: 'asc' } },
          _count: {
            select: {
              reviews: true,
              orderItems: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    const response: ApiResponse = {
      success: true,
      message: 'Products retrieved successfully',
      data: { products },
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };

    res.json(response);
  })
);

// Update product status
router.patch('/products/:id/status',
  authenticate,
  authorize(UserRole.ADMIN),
  [
    param('id').isString().withMessage('Product ID is required'),
    body('status').isIn(['ACTIVE', 'INACTIVE', 'OUT_OF_STOCK', 'DISCONTINUED']).withMessage('Valid status is required'),
  ],
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError('Validation failed', errors.array().map(error => ({
        field: error.param,
        message: error.msg,
      })));
    }

    const { id } = req.params;
    const { status } = req.body;

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: { status },
      include: {
        category: { select: { id: true, name: true } },
        seller: { select: { id: true, name: true } },
      },
    });

    logger.info('Product status updated by admin:', {
      adminId: req.user!.id,
      productId: id,
      newStatus: status,
    });

    const response: ApiResponse = {
      success: true,
      message: 'Product status updated successfully',
      data: { product: updatedProduct },
    };

    res.json(response);
  })
);

export default router;
