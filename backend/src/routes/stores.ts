import { Router, Response } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import prisma from '@/config/database';
import { AuthRequest, ApiResponse, ValidationError, NotFoundError, ForbiddenError, UserRole } from '@/types';
import { asyncHandler } from '@/middleware/errorHandler';
import { authenticate, authorize } from '@/middleware/auth';
import logger from '@/config/logger';

const router = Router();

// Get all stores (public - for marketplace browsing)
router.get('/',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 }),
    query('category').optional().isString(),
    query('city').optional().isString(),
    query('search').optional().isString(),
    query('rating').optional().isFloat({ min: 0, max: 5 }),
    query('isPremium').optional().isBoolean(),
    query('sortBy').optional().isIn(['name', 'rating', 'createdAt', 'totalReviews']),
    query('sortOrder').optional().isIn(['asc', 'desc']),
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
    const sortBy = req.query.sortBy as string || 'createdAt';
    const sortOrder = req.query.sortOrder as 'asc' | 'desc' || 'desc';

    // Build where clause
    const where: any = {
      status: 'APPROVED',
      isActive: true,
    };

    if (req.query.category) {
      where.category = { contains: req.query.category, mode: 'insensitive' };
    }

    if (req.query.city) {
      where.city = { contains: req.query.city, mode: 'insensitive' };
    }

    if (req.query.search) {
      where.OR = [
        { name: { contains: req.query.search, mode: 'insensitive' } },
        { description: { contains: req.query.search, mode: 'insensitive' } },
        { category: { contains: req.query.search, mode: 'insensitive' } },
      ];
    }

    if (req.query.rating) {
      where.rating = { gte: parseFloat(req.query.rating as string) };
    }

    if (req.query.isPremium === 'true') {
      where.isPremium = true;
    }

    const [stores, total] = await Promise.all([
      prisma.store.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          seller: {
            select: { id: true, name: true, isVerified: true },
          },
          _count: {
            select: {
              products: true,
              storeReviews: true,
            },
          },
        },
      }),
      prisma.store.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    const response: ApiResponse = {
      success: true,
      message: 'Stores retrieved successfully',
      data: { stores },
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

// Get single store details (public)
router.get('/:id',
  param('id').isString().withMessage('Store ID is required'),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError('Validation failed', errors.array().map(error => ({
        field: error.param,
        message: error.msg,
      })));
    }

    const { id } = req.params;

    const store = await prisma.store.findUnique({
      where: { id },
      include: {
        seller: {
          select: { id: true, name: true, isVerified: true, email: true },
        },
        products: {
          where: { status: 'ACTIVE' },
          take: 12,
          include: {
            images: { take: 1, orderBy: { sortOrder: 'asc' } },
            reviews: { select: { rating: true } },
          },
        },
        storeReviews: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true },
            },
          },
        },
        _count: {
          select: {
            products: true,
            storeReviews: true,
          },
        },
      },
    });

    if (!store) {
      throw new NotFoundError('Store not found');
    }

    if (store.status !== 'APPROVED' || !store.isActive) {
      throw new NotFoundError('Store not available');
    }

    // Calculate product ratings
    const productsWithRating = store.products.map(product => {
      const avgRating = product.reviews.length > 0
        ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
        : 0;

      const { reviews, ...productData } = product;
      return {
        ...productData,
        rating: Math.round(avgRating * 10) / 10,
        reviewCount: reviews.length,
      };
    });

    const storeWithProducts = {
      ...store,
      products: productsWithRating,
    };

    const response: ApiResponse = {
      success: true,
      message: 'Store details retrieved successfully',
      data: { store: storeWithProducts },
    };

    res.json(response);
  })
);

// Store enrollment/registration
router.post('/enroll',
  authenticate,
  [
    body('name').notEmpty().withMessage('Store name is required'),
    body('description').optional().isString(),
    body('category').notEmpty().withMessage('Store category is required'),
    body('address').notEmpty().withMessage('Address is required'),
    body('city').notEmpty().withMessage('City is required'),
    body('state').notEmpty().withMessage('State is required'),
    body('zipCode').notEmpty().withMessage('ZIP code is required'),
    body('country').optional().isString(),
    body('phone').optional().isMobilePhone('any'),
    body('email').optional().isEmail(),
    body('website').optional().isURL(),
    body('openingHours').optional().isString(),
    body('establishedYear').optional().isInt({ min: 1800 }),
    body('licenseNumber').optional().isString(),
    body('taxId').optional().isString(),
    body('socialMedia').optional().isString(),
  ],
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError('Validation failed', errors.array().map(error => ({
        field: error.param,
        message: error.msg,
      })));
    }

    const userId = req.user!.id;

    // Check if user already has a seller profile
    let seller = await prisma.seller.findFirst({
      where: { email: req.user!.email },
    });

    // Create seller profile if it doesn't exist
    if (!seller) {
      seller = await prisma.seller.create({
        data: {
          name: `${req.user!.firstName} ${req.user!.lastName}`,
          email: req.user!.email,
          description: 'New seller',
        },
      });
    }

    const storeData = req.body;

    // Generate unique slug
    const baseSlug = storeData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    let slug = baseSlug;
    let counter = 1;
    while (await prisma.store.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const store = await prisma.store.create({
      data: {
        ...storeData,
        slug,
        sellerId: seller.id,
        country: storeData.country || 'United States',
        status: 'PENDING',
        isActive: false,
      },
      include: {
        seller: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    logger.info('New store enrollment:', {
      storeId: store.id,
      storeName: store.name,
      sellerId: seller.id,
      userId,
    });

    const response: ApiResponse = {
      success: true,
      message: 'Store enrollment submitted successfully. Your application is under review.',
      data: { store },
    };

    res.status(201).json(response);
  })
);

// Get seller's stores
router.get('/seller/my-stores',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const seller = await prisma.seller.findFirst({
      where: { email: req.user!.email },
      include: {
        stores: {
          include: {
            _count: {
              select: {
                products: true,
                storeReviews: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    const stores = seller?.stores || [];

    const response: ApiResponse = {
      success: true,
      message: 'Seller stores retrieved successfully',
      data: { stores },
    };

    res.json(response);
  })
);

// Update store (seller only)
router.put('/:id',
  authenticate,
  [
    param('id').isString().withMessage('Store ID is required'),
    body('name').optional().notEmpty(),
    body('description').optional().isString(),
    body('category').optional().notEmpty(),
    body('address').optional().notEmpty(),
    body('city').optional().notEmpty(),
    body('state').optional().notEmpty(),
    body('zipCode').optional().notEmpty(),
    body('phone').optional().isMobilePhone('any'),
    body('email').optional().isEmail(),
    body('website').optional().isURL(),
    body('openingHours').optional().isString(),
    body('socialMedia').optional().isString(),
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
    const updateData = req.body;

    // Check if store belongs to seller
    const seller = await prisma.seller.findFirst({
      where: { email: req.user!.email },
    });

    if (!seller) {
      throw new ForbiddenError('You must be a registered seller');
    }

    const store = await prisma.store.findFirst({
      where: { id, sellerId: seller.id },
    });

    if (!store) {
      throw new NotFoundError('Store not found or access denied');
    }

    const updatedStore = await prisma.store.update({
      where: { id },
      data: updateData,
      include: {
        seller: {
          select: { id: true, name: true },
        },
      },
    });

    const response: ApiResponse = {
      success: true,
      message: 'Store updated successfully',
      data: { store: updatedStore },
    };

    res.json(response);
  })
);

// Get store analytics (seller only)
router.get('/:id/analytics',
  authenticate,
  [
    param('id').isString().withMessage('Store ID is required'),
    query('period').optional().isIn(['7d', '30d', '90d', '1y']),
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
    const period = req.query.period as string || '30d';

    // Check if store belongs to seller
    const seller = await prisma.seller.findFirst({
      where: { email: req.user!.email },
    });

    if (!seller) {
      throw new ForbiddenError('You must be a registered seller');
    }

    const store = await prisma.store.findFirst({
      where: { id, sellerId: seller.id },
    });

    if (!store) {
      throw new NotFoundError('Store not found or access denied');
    }

    // Calculate date range
    const periodDays = { '7d': 7, '30d': 30, '90d': 90, '1y': 365 };
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - periodDays[period as keyof typeof periodDays]);

    const [analytics, totalOrders, totalRevenue, totalProducts] = await Promise.all([
      prisma.storeAnalytics.findMany({
        where: {
          storeId: id,
          date: { gte: startDate },
        },
        orderBy: { date: 'asc' },
      }),
      prisma.orderItem.count({
        where: {
          product: { storeId: id },
          order: { createdAt: { gte: startDate } },
        },
      }),
      prisma.orderItem.aggregate({
        where: {
          product: { storeId: id },
          order: { createdAt: { gte: startDate } },
        },
        _sum: { price: true },
      }),
      prisma.product.count({
        where: { storeId: id, status: 'ACTIVE' },
      }),
    ]);

    const summary = {
      totalOrders,
      totalRevenue: totalRevenue._sum.price || 0,
      totalProducts,
      averageRating: store.rating,
      totalReviews: store.totalReviews,
    };

    const response: ApiResponse = {
      success: true,
      message: 'Store analytics retrieved successfully',
      data: { analytics, summary, period },
    };

    res.json(response);
  })
);

// Store review endpoints
router.post('/:id/reviews',
  authenticate,
  [
    param('id').isString().withMessage('Store ID is required'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('title').isLength({ min: 1, max: 200 }).withMessage('Title must be between 1 and 200 characters'),
    body('content').isLength({ min: 10, max: 1000 }).withMessage('Content must be between 10 and 1000 characters'),
    body('images').optional().isArray(),
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
    const { rating, title, content, images = [] } = req.body;
    const userId = req.user!.id;

    // Check if store exists and is active
    const store = await prisma.store.findUnique({
      where: { id },
    });

    if (!store || store.status !== 'APPROVED' || !store.isActive) {
      throw new NotFoundError('Store not found');
    }

    // Check if user already reviewed this store
    const existingReview = await prisma.storeReview.findUnique({
      where: {
        storeId_userId: { storeId: id, userId },
      },
    });

    if (existingReview) {
      throw new ValidationError('Validation failed', [{
        field: 'review',
        message: 'You have already reviewed this store',
      }]);
    }

    // Check if user has purchased from this store
    const hasPurchased = await prisma.orderItem.findFirst({
      where: {
        product: { storeId: id },
        order: { userId, status: 'DELIVERED' },
      },
    });

    const review = await prisma.storeReview.create({
      data: {
        storeId: id,
        userId,
        rating,
        title,
        content,
        images: JSON.stringify(images),
        isVerified: !!hasPurchased,
      },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    // Update store rating
    const allReviews = await prisma.storeReview.findMany({
      where: { storeId: id },
      select: { rating: true },
    });

    const newRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await prisma.store.update({
      where: { id },
      data: {
        rating: Math.round(newRating * 10) / 10,
        totalReviews: allReviews.length,
      },
    });

    const response: ApiResponse = {
      success: true,
      message: 'Store review submitted successfully',
      data: { review },
    };

    res.status(201).json(response);
  })
);

// Admin routes for store management
router.get('/admin/pending',
  authenticate,
  authorize(UserRole.ADMIN),
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
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

    const [stores, total] = await Promise.all([
      prisma.store.findMany({
        where: { status: 'PENDING' },
        skip,
        take: limit,
        include: {
          seller: {
            select: { id: true, name: true, email: true, isVerified: true },
          },
        },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.store.count({ where: { status: 'PENDING' } }),
    ]);

    const totalPages = Math.ceil(total / limit);

    const response: ApiResponse = {
      success: true,
      message: 'Pending stores retrieved successfully',
      data: { stores },
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

// Admin approve/reject store
router.patch('/admin/:id/status',
  authenticate,
  authorize(UserRole.ADMIN),
  [
    param('id').isString().withMessage('Store ID is required'),
    body('status').isIn(['APPROVED', 'REJECTED', 'SUSPENDED']).withMessage('Valid status is required'),
    body('reason').optional().isString(),
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
    const { status, reason } = req.body;

    const store = await prisma.store.findUnique({
      where: { id },
      include: {
        seller: { select: { id: true, name: true, email: true } },
      },
    });

    if (!store) {
      throw new NotFoundError('Store not found');
    }

    const updatedStore = await prisma.store.update({
      where: { id },
      data: {
        status,
        isActive: status === 'APPROVED',
      },
    });

    logger.info('Store status updated by admin:', {
      adminId: req.user!.id,
      storeId: id,
      storeName: store.name,
      newStatus: status,
      reason,
    });

    const response: ApiResponse = {
      success: true,
      message: `Store ${status.toLowerCase()} successfully`,
      data: { store: updatedStore },
    };

    res.json(response);
  })
);

export default router;
