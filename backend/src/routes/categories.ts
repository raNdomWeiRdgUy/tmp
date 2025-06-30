import { Router, Response } from 'express';
import { param, validationResult } from 'express-validator';
import prisma from '@/config/database';
import { AuthRequest, ApiResponse, ValidationError, NotFoundError } from '@/types';
import { asyncHandler } from '@/middleware/errorHandler';
import { optionalAuth } from '@/middleware/auth';

const router = Router();

// Get all categories
router.get('/',
  optionalAuth,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      include: {
        children: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
        _count: {
          select: {
            products: {
              where: { status: 'ACTIVE' },
            },
          },
        },
      },
      orderBy: [
        { sortOrder: 'asc' },
        { name: 'asc' },
      ],
    });

    const categoriesWithCount = categories.map(category => ({
      ...category,
      productCount: category._count.products,
      children: category.children.map(child => ({
        ...child,
        productCount: 0, // You can add a separate query for child counts if needed
      })),
    }));

    const response: ApiResponse = {
      success: true,
      message: 'Categories retrieved successfully',
      data: { categories: categoriesWithCount },
    };

    res.json(response);
  })
);

// Get single category by ID
router.get('/:id',
  param('id').isString().withMessage('Category ID is required'),
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

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        children: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
        parent: true,
        _count: {
          select: {
            products: {
              where: { status: 'ACTIVE' },
            },
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundError('Category not found');
    }

    const categoryWithCount = {
      ...category,
      productCount: category._count.products,
    };

    const response: ApiResponse = {
      success: true,
      message: 'Category retrieved successfully',
      data: { category: categoryWithCount },
    };

    res.json(response);
  })
);

export default router;
