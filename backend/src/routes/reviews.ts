import { Router, Response } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import prisma from '@/config/database';
import { AuthRequest, ApiResponse, ReviewCreateData, ReviewFilters, ValidationError, NotFoundError, ConflictError } from '@/types';
import { asyncHandler } from '@/middleware/errorHandler';
import { authenticate, optionalAuth } from '@/middleware/auth';

const router = Router();

// Get reviews for a product
router.get('/product/:productId',
  [
    param('productId').isString().withMessage('Product ID is required'),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 }),
    query('rating').optional().isInt({ min: 1, max: 5 }),
    query('verified').optional().isBoolean(),
    query('sortBy').optional().isIn(['createdAt', 'rating', 'helpful']),
    query('sortOrder').optional().isIn(['asc', 'desc']),
  ],
  optionalAuth,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError('Validation failed', errors.array().map(error => ({
        field: error.param,
        message: error.msg,
      })));
    }

    const { productId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const filters: ReviewFilters = {
      productId,
      rating: req.query.rating ? parseInt(req.query.rating as string) : undefined,
      isVerified: req.query.verified === 'true' ? true : undefined,
    };

    const sortBy = req.query.sortBy as string || 'createdAt';
    const sortOrder = req.query.sortOrder as 'asc' | 'desc' || 'desc';

    // Build where clause
    const where: any = { productId };
    if (filters.rating) where.rating = filters.rating;
    if (filters.isVerified !== undefined) where.isVerified = filters.isVerified;

    const [reviews, total, averageRating] = await Promise.all([
      prisma.review.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
        },
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.review.count({ where }),
      prisma.review.aggregate({
        where: { productId },
        _avg: { rating: true },
        _count: { rating: true },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    // Get rating distribution
    const ratingDistribution = await prisma.review.groupBy({
      by: ['rating'],
      where: { productId },
      _count: { rating: true },
    });

    const distribution = [1, 2, 3, 4, 5].map(rating => ({
      rating,
      count: ratingDistribution.find(r => r.rating === rating)?._count.rating || 0,
    }));

    const response: ApiResponse = {
      success: true,
      message: 'Reviews retrieved successfully',
      data: {
        reviews,
        summary: {
          averageRating: averageRating._avg.rating || 0,
          totalReviews: averageRating._count.rating,
          distribution,
        },
      },
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

// Get single review
router.get('/:id',
  param('id').isString().withMessage('Review ID is required'),
  optionalAuth,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError('Validation failed', errors.array().map(error => ({
        field: error.param,
        message: error.msg,
      })));
    }

    const { id } = req.params;

    const review = await prisma.review.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        product: {
          select: {
            id: true,
            title: true,
            images: {
              take: 1,
              orderBy: { sortOrder: 'asc' },
            },
          },
        },
      },
    });

    if (!review) {
      throw new NotFoundError('Review not found');
    }

    const response: ApiResponse = {
      success: true,
      message: 'Review retrieved successfully',
      data: { review },
    };

    res.json(response);
  })
);

// Create review
router.post('/',
  authenticate,
  [
    body('productId').notEmpty().withMessage('Product ID is required'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('title').isLength({ min: 1, max: 200 }).withMessage('Title must be between 1 and 200 characters'),
    body('content').isLength({ min: 10, max: 2000 }).withMessage('Content must be between 10 and 2000 characters'),
    body('images').optional().isArray().withMessage('Images must be an array'),
  ],
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError('Validation failed', errors.array().map(error => ({
        field: error.param,
        message: error.msg,
      })));
    }

    const reviewData: ReviewCreateData = req.body;
    const userId = req.user!.id;

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: reviewData.productId },
      select: { id: true, title: true },
    });

    if (!product) {
      throw new NotFoundError('Product not found');
    }

    // Check if user already reviewed this product
    const existingReview = await prisma.review.findUnique({
      where: {
        userId_productId: {
          userId,
          productId: reviewData.productId,
        },
      },
    });

    if (existingReview) {
      throw new ConflictError('You have already reviewed this product');
    }

    // Check if user has purchased this product (for verified reviews)
    const hasPurchased = await prisma.orderItem.findFirst({
      where: {
        productId: reviewData.productId,
        order: {
          userId,
          status: 'DELIVERED',
        },
      },
    });

    const review = await prisma.review.create({
      data: {
        userId,
        productId: reviewData.productId,
        rating: reviewData.rating,
        title: reviewData.title,
        content: reviewData.content,
        images: reviewData.images || [],
        isVerified: !!hasPurchased,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        product: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    const response: ApiResponse = {
      success: true,
      message: 'Review created successfully',
      data: { review },
    };

    res.status(201).json(response);
  })
);

// Update review
router.put('/:id',
  authenticate,
  [
    param('id').isString().withMessage('Review ID is required'),
    body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('title').optional().isLength({ min: 1, max: 200 }).withMessage('Title must be between 1 and 200 characters'),
    body('content').optional().isLength({ min: 10, max: 2000 }).withMessage('Content must be between 10 and 2000 characters'),
    body('images').optional().isArray().withMessage('Images must be an array'),
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

    // Check if review exists and belongs to user
    const existingReview = await prisma.review.findFirst({
      where: { id, userId: req.user!.id },
    });

    if (!existingReview) {
      throw new NotFoundError('Review not found or you do not have permission to edit this review');
    }

    const review = await prisma.review.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        product: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    const response: ApiResponse = {
      success: true,
      message: 'Review updated successfully',
      data: { review },
    };

    res.json(response);
  })
);

// Delete review
router.delete('/:id',
  authenticate,
  param('id').isString().withMessage('Review ID is required'),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError('Validation failed', errors.array().map(error => ({
        field: error.param,
        message: error.msg,
      })));
    }

    const { id } = req.params;

    // Check if review exists and belongs to user
    const existingReview = await prisma.review.findFirst({
      where: { id, userId: req.user!.id },
    });

    if (!existingReview) {
      throw new NotFoundError('Review not found or you do not have permission to delete this review');
    }

    await prisma.review.delete({
      where: { id },
    });

    const response: ApiResponse = {
      success: true,
      message: 'Review deleted successfully',
    };

    res.json(response);
  })
);

// Mark review as helpful/not helpful
router.post('/:id/helpful',
  authenticate,
  [
    param('id').isString().withMessage('Review ID is required'),
    body('helpful').isBoolean().withMessage('Helpful must be a boolean'),
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
    const { helpful } = req.body;

    const review = await prisma.review.findUnique({
      where: { id },
    });

    if (!review) {
      throw new NotFoundError('Review not found');
    }

    // Prevent users from rating their own reviews
    if (review.userId === req.user!.id) {
      throw new ValidationError('Validation failed', [{
        field: 'review',
        message: 'You cannot rate your own review',
      }]);
    }

    // Update helpful/not helpful counts
    const updateData = helpful
      ? { helpful: { increment: 1 } }
      : { notHelpful: { increment: 1 } };

    const updatedReview = await prisma.review.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        helpful: true,
        notHelpful: true,
      },
    });

    const response: ApiResponse = {
      success: true,
      message: 'Review rating updated successfully',
      data: { review: updatedReview },
    };

    res.json(response);
  })
);

// Get user's reviews
router.get('/user/my-reviews',
  authenticate,
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 }),
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

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { userId: req.user!.id },
        skip,
        take: limit,
        include: {
          product: {
            select: {
              id: true,
              title: true,
              images: {
                take: 1,
                orderBy: { sortOrder: 'asc' },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.review.count({
        where: { userId: req.user!.id },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    const response: ApiResponse = {
      success: true,
      message: 'User reviews retrieved successfully',
      data: { reviews },
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

// Get products user can review (purchased but not reviewed)
router.get('/user/can-review',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    // Get delivered orders for the user
    const deliveredOrders = await prisma.order.findMany({
      where: {
        userId: req.user!.id,
        status: 'DELIVERED',
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                images: {
                  take: 1,
                  orderBy: { sortOrder: 'asc' },
                },
              },
            },
          },
        },
      },
    });

    // Get all products from delivered orders
    const deliveredProducts = deliveredOrders.flatMap(order =>
      order.items.map(item => ({
        ...item.product,
        orderId: order.id,
        orderDate: order.createdAt,
      }))
    );

    // Get products already reviewed by user
    const existingReviews = await prisma.review.findMany({
      where: { userId: req.user!.id },
      select: { productId: true },
    });

    const reviewedProductIds = new Set(existingReviews.map(r => r.productId));

    // Filter out already reviewed products
    const productsToReview = deliveredProducts.filter(
      product => !reviewedProductIds.has(product.id)
    );

    // Remove duplicates
    const uniqueProducts = productsToReview.reduce((acc, product) => {
      if (!acc.some(p => p.id === product.id)) {
        acc.push(product);
      }
      return acc;
    }, [] as typeof productsToReview);

    const response: ApiResponse = {
      success: true,
      message: 'Products available for review retrieved successfully',
      data: { products: uniqueProducts },
    };

    res.json(response);
  })
);

export default router;
