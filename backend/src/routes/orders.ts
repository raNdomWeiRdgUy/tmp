import { Router, Response } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import prisma from '@/config/database';
import { AuthRequest, ApiResponse, OrderCreateData, OrderFilters, ValidationError, NotFoundError, ForbiddenError, UserRole } from '@/types';
import { asyncHandler } from '@/middleware/errorHandler';
import { authenticate, authorize } from '@/middleware/auth';

const router = Router();

// Create new order
router.post('/',
  authenticate,
  [
    body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
    body('items.*.productId').notEmpty().withMessage('Product ID is required'),
    body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    body('shippingAddressId').notEmpty().withMessage('Shipping address is required'),
    body('billingAddressId').notEmpty().withMessage('Billing address is required'),
    body('paymentMethodId').notEmpty().withMessage('Payment method is required'),
  ],
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError('Validation failed', errors.array().map(error => ({
        field: error.param,
        message: error.msg,
      })));
    }

    const orderData: OrderCreateData = req.body;
    const userId = req.user!.id;

    // Verify addresses belong to user
    const [shippingAddress, billingAddress] = await Promise.all([
      prisma.address.findFirst({
        where: { id: orderData.shippingAddressId, userId },
      }),
      prisma.address.findFirst({
        where: { id: orderData.billingAddressId, userId },
      }),
    ]);

    if (!shippingAddress || !billingAddress) {
      throw new NotFoundError('Address not found');
    }

    // Verify payment method belongs to user
    const paymentMethod = await prisma.paymentMethod.findFirst({
      where: { id: orderData.paymentMethodId, userId },
    });

    if (!paymentMethod) {
      throw new NotFoundError('Payment method not found');
    }

    // Verify all products exist and calculate totals
    const productIds = orderData.items.map(item => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    if (products.length !== productIds.length) {
      throw new NotFoundError('One or more products not found');
    }

    // Check stock availability and calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of orderData.items) {
      const product = products.find(p => p.id === item.productId);
      if (!product) continue;

      if (!product.inStock || product.stockQuantity < item.quantity) {
        throw new ValidationError('Validation failed', [{
          field: 'items',
          message: `Insufficient stock for product: ${product.title}`,
        }]);
      }

      const itemTotal = parseFloat(product.price.toString()) * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price: product.price,
        selectedVariants: item.selectedVariants,
      });
    }

    const tax = subtotal * 0.08; // 8% tax
    const shipping = subtotal > 35 ? 0 : 5.99; // Free shipping over $35
    const total = subtotal + tax + shipping;

    // Generate unique order number
    const orderNumber = `AMZ${Date.now()}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;

    // Create order with transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create the order
      const newOrder = await tx.order.create({
        data: {
          userId,
          orderNumber,
          subtotal,
          tax,
          shipping,
          total,
          shippingAddressId: orderData.shippingAddressId,
          billingAddressId: orderData.billingAddressId,
          paymentMethodId: orderData.paymentMethodId,
          estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          items: {
            create: orderItems,
          },
          tracking: {
            create: {
              status: 'Order Placed',
              description: 'Your order has been successfully placed',
            },
          },
        },
        include: {
          items: {
            include: {
              product: {
                include: {
                  images: { take: 1, orderBy: { sortOrder: 'asc' } },
                },
              },
            },
          },
          shippingAddress: true,
          billingAddress: true,
          paymentMethod: true,
          tracking: { orderBy: { createdAt: 'desc' } },
        },
      });

      // Update product stock quantities
      for (const item of orderData.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stockQuantity: {
              decrement: item.quantity,
            },
          },
        });
      }

      // Clear user's cart
      await tx.cartItem.deleteMany({
        where: { userId },
      });

      return newOrder;
    });

    const response: ApiResponse = {
      success: true,
      message: 'Order created successfully',
      data: { order },
    };

    res.status(201).json(response);
  })
);

// Get user's orders
router.get('/',
  authenticate,
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 }),
    query('status').optional().isIn(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED']),
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
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const status = req.query.status as string;

    const where: any = { userId: req.user!.id };
    if (status) {
      where.status = status;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        include: {
          items: {
            include: {
              product: {
                include: {
                  images: { take: 1, orderBy: { sortOrder: 'asc' } },
                },
              },
            },
          },
          shippingAddress: true,
          tracking: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.order.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    const response: ApiResponse = {
      success: true,
      message: 'Orders retrieved successfully',
      data: { orders },
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

// Get single order
router.get('/:id',
  authenticate,
  param('id').isString().withMessage('Order ID is required'),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError('Validation failed', errors.array().map(error => ({
        field: error.param,
        message: error.msg,
      })));
    }

    const { id } = req.params;

    const order = await prisma.order.findFirst({
      where: {
        id,
        userId: req.user!.id
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: { take: 1, orderBy: { sortOrder: 'asc' } },
                seller: { select: { id: true, name: true } },
              },
            },
          },
        },
        shippingAddress: true,
        billingAddress: true,
        paymentMethod: true,
        tracking: { orderBy: { createdAt: 'asc' } },
      },
    });

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    const response: ApiResponse = {
      success: true,
      message: 'Order retrieved successfully',
      data: { order },
    };

    res.json(response);
  })
);

// Cancel order
router.patch('/:id/cancel',
  authenticate,
  param('id').isString().withMessage('Order ID is required'),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError('Validation failed', errors.array().map(error => ({
        field: error.param,
        message: error.msg,
      })));
    }

    const { id } = req.params;

    const order = await prisma.order.findFirst({
      where: { id, userId: req.user!.id },
      include: { items: true },
    });

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    if (!['PENDING', 'CONFIRMED'].includes(order.status)) {
      throw new ValidationError('Validation failed', [{
        field: 'status',
        message: 'Order cannot be cancelled in current status',
      }]);
    }

    // Update order status and restore stock
    const updatedOrder = await prisma.$transaction(async (tx) => {
      // Update order status
      const updated = await tx.order.update({
        where: { id },
        data: { status: 'CANCELLED' },
        include: {
          items: {
            include: {
              product: {
                include: { images: { take: 1, orderBy: { sortOrder: 'asc' } } },
              },
            },
          },
          tracking: { orderBy: { createdAt: 'desc' } },
        },
      });

      // Restore product stock
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stockQuantity: { increment: item.quantity },
          },
        });
      }

      // Add tracking entry
      await tx.orderTracking.create({
        data: {
          orderId: id,
          status: 'Cancelled',
          description: 'Order cancelled by customer',
        },
      });

      return updated;
    });

    const response: ApiResponse = {
      success: true,
      message: 'Order cancelled successfully',
      data: { order: updatedOrder },
    };

    res.json(response);
  })
);

// Admin routes - Get all orders
router.get('/admin/all',
  authenticate,
  authorize(UserRole.ADMIN),
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('status').optional().isIn(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED']),
    query('userId').optional().isString(),
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

    const filters: OrderFilters = {
      status: req.query.status as any,
      userId: req.query.userId as string,
    };

    const where: any = {};
    if (filters.status) where.status = filters.status;
    if (filters.userId) where.userId = filters.userId;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          items: {
            include: {
              product: {
                select: { id: true, title: true, price: true },
              },
            },
          },
          shippingAddress: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.order.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    const response: ApiResponse = {
      success: true,
      message: 'Orders retrieved successfully',
      data: { orders },
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

// Admin - Update order status
router.patch('/admin/:id/status',
  authenticate,
  authorize(UserRole.ADMIN),
  [
    param('id').isString().withMessage('Order ID is required'),
    body('status').isIn(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED']).withMessage('Valid status is required'),
    body('trackingNumber').optional().isString(),
    body('carrier').optional().isString(),
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
    const { status, trackingNumber, carrier } = req.body;

    const order = await prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    const updatedOrder = await prisma.$transaction(async (tx) => {
      // Update order
      const updated = await tx.order.update({
        where: { id },
        data: {
          status,
          ...(trackingNumber && { trackingNumber }),
          ...(carrier && { carrier }),
          ...(status === 'DELIVERED' && { deliveredAt: new Date() }),
        },
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          items: {
            include: {
              product: {
                select: { id: true, title: true, price: true },
              },
            },
          },
        },
      });

      // Add tracking entry
      const statusMessages = {
        PENDING: 'Order is pending confirmation',
        CONFIRMED: 'Order has been confirmed',
        PROCESSING: 'Order is being processed',
        SHIPPED: 'Order has been shipped',
        DELIVERED: 'Order has been delivered',
        CANCELLED: 'Order has been cancelled',
        RETURNED: 'Order has been returned',
      };

      await tx.orderTracking.create({
        data: {
          orderId: id,
          status: status,
          description: statusMessages[status as keyof typeof statusMessages],
        },
      });

      return updated;
    });

    const response: ApiResponse = {
      success: true,
      message: 'Order status updated successfully',
      data: { order: updatedOrder },
    };

    res.json(response);
  })
);

// Get order analytics (Admin only)
router.get('/admin/analytics',
  authenticate,
  authorize(UserRole.ADMIN),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const [
      totalOrders,
      totalRevenue,
      ordersToday,
      revenueToday,
      ordersByStatus,
      recentOrders,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.aggregate({
        _sum: { total: true },
      }),
      prisma.order.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
      prisma.order.aggregate({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
        _sum: { total: true },
      }),
      prisma.order.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
      prisma.order.findMany({
        take: 10,
        include: {
          user: {
            select: { firstName: true, lastName: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const analytics = {
      totalOrders,
      totalRevenue: parseFloat(totalRevenue._sum.total?.toString() || '0'),
      ordersToday,
      revenueToday: parseFloat(revenueToday._sum.total?.toString() || '0'),
      ordersByStatus: ordersByStatus.reduce((acc, item) => {
        acc[item.status] = item._count.status;
        return acc;
      }, {} as Record<string, number>),
      recentOrders,
    };

    const response: ApiResponse = {
      success: true,
      message: 'Order analytics retrieved successfully',
      data: { analytics },
    };

    res.json(response);
  })
);

export default router;
