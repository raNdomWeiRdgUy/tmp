import { Router, Response } from 'express';
import { query, param, body, validationResult } from 'express-validator';
import prisma from '@/config/database';
import { AuthRequest, ApiResponse, ProductFilters, ProductCreateData, ValidationError, NotFoundError, ForbiddenError, UserRole } from '@/types';
import { asyncHandler } from '@/middleware/errorHandler';
import { authenticate, authorize, optionalAuth } from '@/middleware/auth';

const router = Router();

// Get all products with filtering and pagination
router.get('/',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('search').optional().isString(),
    query('categoryId').optional().isString(),
    query('brand').optional().isString(),
    query('minPrice').optional().isFloat({ min: 0 }),
    query('maxPrice').optional().isFloat({ min: 0 }),
    query('inStock').optional().isBoolean(),
    query('minRating').optional().isFloat({ min: 0, max: 5 }),
    query('sortBy').optional().isIn(['title', 'price', 'rating', 'createdAt']),
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

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const filters: ProductFilters = {
      search: req.query.search as string,
      categoryId: req.query.categoryId as string,
      brand: req.query.brand as string,
      minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
      maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
      inStock: req.query.inStock === 'true',
      minRating: req.query.minRating ? parseFloat(req.query.minRating as string) : undefined,
    };

    const sortBy = req.query.sortBy as string || 'createdAt';
    const sortOrder = req.query.sortOrder as 'asc' | 'desc' || 'desc';

    // Build where clause
    const where: any = {
      status: 'ACTIVE',
    };

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { brand: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters.brand) {
      where.brand = { contains: filters.brand, mode: 'insensitive' };
    }

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      where.price = {};
      if (filters.minPrice !== undefined) where.price.gte = filters.minPrice;
      if (filters.maxPrice !== undefined) where.price.lte = filters.maxPrice;
    }

    if (filters.inStock) {
      where.inStock = true;
      where.stockQuantity = { gt: 0 };
    }

    // Get products with count
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          category: {
            select: { id: true, name: true, slug: true },
          },
          seller: {
            select: { id: true, name: true, isVerified: true },
          },
          images: {
            orderBy: { sortOrder: 'asc' },
            take: 1,
          },
          reviews: {
            select: { rating: true },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    // Calculate average rating for each product
    const productsWithRating = products.map(product => {
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

    const totalPages = Math.ceil(total / limit);

    const response: ApiResponse = {
      success: true,
      message: 'Products retrieved successfully',
      data: { products: productsWithRating },
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

// Get single product by ID
router.get('/:id',
  param('id').isString().withMessage('Product ID is required'),
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

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
        seller: {
          select: { id: true, name: true, isVerified: true, logo: true, description: true },
        },
        images: {
          orderBy: { sortOrder: 'asc' },
        },
        specifications: true,
        features: true,
        variants: true,
        reviews: {
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true, avatar: true },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!product) {
      throw new NotFoundError('Product not found');
    }

    // Calculate average rating
    const avgRating = product.reviews.length > 0
      ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
      : 0;

    const productWithRating = {
      ...product,
      rating: Math.round(avgRating * 10) / 10,
      reviewCount: product.reviews.length,
    };

    const response: ApiResponse = {
      success: true,
      message: 'Product retrieved successfully',
      data: { product: productWithRating },
    };

    res.json(response);
  })
);

// Create new product (Admin/Seller only)
router.post('/',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SELLER),
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('originalPrice').optional().isFloat({ min: 0 }),
    body('sku').notEmpty().withMessage('SKU is required'),
    body('brand').notEmpty().withMessage('Brand is required'),
    body('weight').optional().isFloat({ min: 0 }),
    body('stockQuantity').isInt({ min: 0 }).withMessage('Stock quantity must be a non-negative integer'),
    body('categoryId').notEmpty().withMessage('Category ID is required'),
    body('sellerId').notEmpty().withMessage('Seller ID is required'),
    body('images').isArray({ min: 1 }).withMessage('At least one image is required'),
    body('specifications').optional().isArray(),
    body('features').optional().isArray(),
  ],
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError('Validation failed', errors.array().map(error => ({
        field: error.param,
        message: error.msg,
      })));
    }

    const productData: ProductCreateData = req.body;

    // If user is a seller, ensure they can only create products for themselves
    if (req.user!.role === UserRole.SELLER && productData.sellerId !== req.user!.id) {
      throw new ForbiddenError('Sellers can only create products for themselves');
    }

    // Generate slug from title
    const slug = productData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Create product with related data
    const product = await prisma.product.create({
      data: {
        title: productData.title,
        slug: `${slug}-${Date.now()}`,
        description: productData.description,
        price: productData.price,
        originalPrice: productData.originalPrice,
        sku: productData.sku,
        brand: productData.brand,
        weight: productData.weight,
        dimensions: productData.dimensions,
        stockQuantity: productData.stockQuantity,
        lowStockThreshold: productData.lowStockThreshold || 10,
        categoryId: productData.categoryId,
        sellerId: productData.sellerId,
        images: {
          create: productData.images.map((image, index) => ({
            url: image.url,
            alt: image.alt,
            sortOrder: index,
          })),
        },
        specifications: {
          create: productData.specifications.map(spec => ({
            name: spec.name,
            value: spec.value,
          })),
        },
        features: {
          create: productData.features.map(feature => ({
            feature,
          })),
        },
        variants: productData.variants ? {
          create: productData.variants.map(variant => ({
            name: variant.name,
            options: variant.options,
          })),
        } : undefined,
      },
      include: {
        category: true,
        seller: true,
        images: true,
        specifications: true,
        features: true,
        variants: true,
      },
    });

    const response: ApiResponse = {
      success: true,
      message: 'Product created successfully',
      data: { product },
    };

    res.status(201).json(response);
  })
);

// Update product (Admin/Seller only)
router.put('/:id',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SELLER),
  param('id').isString().withMessage('Product ID is required'),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError('Validation failed', errors.array().map(error => ({
        field: error.param,
        message: error.msg,
      })));
    }

    const { id } = req.params;

    // Check if product exists and user has permission
    const existingProduct = await prisma.product.findUnique({
      where: { id },
      select: { id: true, sellerId: true },
    });

    if (!existingProduct) {
      throw new NotFoundError('Product not found');
    }

    // If user is a seller, ensure they can only update their own products
    if (req.user!.role === UserRole.SELLER && existingProduct.sellerId !== req.user!.id) {
      throw new ForbiddenError('Sellers can only update their own products');
    }

    const updateData = req.body;

    const product = await prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
        seller: true,
        images: true,
        specifications: true,
        features: true,
        variants: true,
      },
    });

    const response: ApiResponse = {
      success: true,
      message: 'Product updated successfully',
      data: { product },
    };

    res.json(response);
  })
);

// Delete product (Admin/Seller only)
router.delete('/:id',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SELLER),
  param('id').isString().withMessage('Product ID is required'),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError('Validation failed', errors.array().map(error => ({
        field: error.param,
        message: error.msg,
      })));
    }

    const { id } = req.params;

    // Check if product exists and user has permission
    const existingProduct = await prisma.product.findUnique({
      where: { id },
      select: { id: true, sellerId: true },
    });

    if (!existingProduct) {
      throw new NotFoundError('Product not found');
    }

    // If user is a seller, ensure they can only delete their own products
    if (req.user!.role === UserRole.SELLER && existingProduct.sellerId !== req.user!.id) {
      throw new ForbiddenError('Sellers can only delete their own products');
    }

    await prisma.product.delete({
      where: { id },
    });

    const response: ApiResponse = {
      success: true,
      message: 'Product deleted successfully',
    };

    res.json(response);
  })
);

export default router;
