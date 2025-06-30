import { Router, Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import prisma from '@/config/database';
import { AuthRequest, ApiResponse, CartItemData, ValidationError, NotFoundError } from '@/types';
import { asyncHandler } from '@/middleware/errorHandler';
import { authenticate } from '@/middleware/auth';

const router = Router();

// Get user's cart
router.get('/',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: req.user!.id },
      include: {
        product: {
          include: {
            images: {
              take: 1,
              orderBy: { sortOrder: 'asc' },
            },
            seller: {
              select: { id: true, name: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate totals
    const subtotal = cartItems.reduce((total, item) => {
      return total + (parseFloat(item.product.price.toString()) * item.quantity);
    }, 0);

    const tax = subtotal * 0.08; // 8% tax
    const shipping = subtotal > 35 ? 0 : 5.99; // Free shipping over $35
    const total = subtotal + tax + shipping;

    const cart = {
      items: cartItems,
      subtotal,
      tax,
      shipping,
      total,
      itemCount: cartItems.reduce((count, item) => count + item.quantity, 0),
    };

    const response: ApiResponse = {
      success: true,
      message: 'Cart retrieved successfully',
      data: { cart },
    };

    res.json(response);
  })
);

// Add item to cart
router.post('/add',
  authenticate,
  [
    body('productId').notEmpty().withMessage('Product ID is required'),
    body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    body('selectedVariants').optional().isObject(),
  ],
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError('Validation failed', errors.array().map(error => ({
        field: error.param,
        message: error.msg,
      })));
    }

    const { productId, quantity, selectedVariants }: CartItemData = req.body;

    // Check if product exists and is in stock
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, inStock: true, stockQuantity: true },
    });

    if (!product) {
      throw new NotFoundError('Product not found');
    }

    if (!product.inStock || product.stockQuantity < quantity) {
      throw new ValidationError('Validation failed', [{
        field: 'quantity',
        message: 'Insufficient stock available',
      }]);
    }

    // Check if item already exists in cart
    const existingCartItem = await prisma.cartItem.findUnique({
      where: {
        userId_productId: {
          userId: req.user!.id,
          productId,
        },
      },
    });

    let cartItem;
    if (existingCartItem) {
      // Update existing item
      cartItem = await prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: {
          quantity: existingCartItem.quantity + quantity,
          selectedVariants: selectedVariants || existingCartItem.selectedVariants,
        },
        include: {
          product: {
            include: {
              images: { take: 1, orderBy: { sortOrder: 'asc' } },
            },
          },
        },
      });
    } else {
      // Create new cart item
      cartItem = await prisma.cartItem.create({
        data: {
          userId: req.user!.id,
          productId,
          quantity,
          selectedVariants,
        },
        include: {
          product: {
            include: {
              images: { take: 1, orderBy: { sortOrder: 'asc' } },
            },
          },
        },
      });
    }

    const response: ApiResponse = {
      success: true,
      message: 'Item added to cart successfully',
      data: { cartItem },
    };

    res.status(201).json(response);
  })
);

// Update cart item quantity
router.put('/:id',
  authenticate,
  [
    param('id').isString().withMessage('Cart item ID is required'),
    body('quantity').isInt({ min: 0 }).withMessage('Quantity must be non-negative'),
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
    const { quantity } = req.body;

    // Check if cart item belongs to user
    const existingItem = await prisma.cartItem.findFirst({
      where: { id, userId: req.user!.id },
      include: { product: true },
    });

    if (!existingItem) {
      throw new NotFoundError('Cart item not found');
    }

    // If quantity is 0, remove the item
    if (quantity === 0) {
      await prisma.cartItem.delete({ where: { id } });

      const response: ApiResponse = {
        success: true,
        message: 'Item removed from cart',
      };

      return res.json(response);
    }

    // Check stock availability
    if (existingItem.product.stockQuantity < quantity) {
      throw new ValidationError('Validation failed', [{
        field: 'quantity',
        message: 'Insufficient stock available',
      }]);
    }

    const cartItem = await prisma.cartItem.update({
      where: { id },
      data: { quantity },
      include: {
        product: {
          include: {
            images: { take: 1, orderBy: { sortOrder: 'asc' } },
          },
        },
      },
    });

    const response: ApiResponse = {
      success: true,
      message: 'Cart item updated successfully',
      data: { cartItem },
    };

    res.json(response);
  })
);

// Remove item from cart
router.delete('/:id',
  authenticate,
  param('id').isString().withMessage('Cart item ID is required'),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError('Validation failed', errors.array().map(error => ({
        field: error.param,
        message: error.msg,
      })));
    }

    const { id } = req.params;

    // Check if cart item belongs to user
    const existingItem = await prisma.cartItem.findFirst({
      where: { id, userId: req.user!.id },
    });

    if (!existingItem) {
      throw new NotFoundError('Cart item not found');
    }

    await prisma.cartItem.delete({ where: { id } });

    const response: ApiResponse = {
      success: true,
      message: 'Item removed from cart successfully',
    };

    res.json(response);
  })
);

// Clear entire cart
router.delete('/',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    await prisma.cartItem.deleteMany({
      where: { userId: req.user!.id },
    });

    const response: ApiResponse = {
      success: true,
      message: 'Cart cleared successfully',
    };

    res.json(response);
  })
);

// Get cart item count
router.get('/count',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const count = await prisma.cartItem.aggregate({
      where: { userId: req.user!.id },
      _sum: { quantity: true },
    });

    const response: ApiResponse = {
      success: true,
      message: 'Cart count retrieved successfully',
      data: { count: count._sum.quantity || 0 },
    };

    res.json(response);
  })
);

export default router;
