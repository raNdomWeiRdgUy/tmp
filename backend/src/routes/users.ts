import { Router, Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import prisma from '@/config/database';
import { AuthRequest, ApiResponse, ValidationError, NotFoundError, ConflictError, UserRole } from '@/types';
import { asyncHandler } from '@/middleware/errorHandler';
import { authenticate, authorize } from '@/middleware/auth';

const router = Router();

// Get user profile
router.get('/profile',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
        role: true,
        isEmailVerified: true,
        createdAt: true,
        updatedAt: true,
        addresses: {
          orderBy: { createdAt: 'desc' },
        },
        paymentMethods: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    const response: ApiResponse = {
      success: true,
      message: 'User profile retrieved successfully',
      data: { user },
    };

    res.json(response);
  })
);

// Update user profile
router.put('/profile',
  authenticate,
  [
    body('firstName').optional().notEmpty().withMessage('First name cannot be empty'),
    body('lastName').optional().notEmpty().withMessage('Last name cannot be empty'),
    body('phone').optional().isMobilePhone('any').withMessage('Valid phone number required'),
  ],
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError('Validation failed', errors.array().map(error => ({
        field: error.param,
        message: error.msg,
      })));
    }

    const { firstName, lastName, phone } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(phone && { phone }),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
        role: true,
        isEmailVerified: true,
        updatedAt: true,
      },
    });

    const response: ApiResponse = {
      success: true,
      message: 'Profile updated successfully',
      data: { user },
    };

    res.json(response);
  })
);

// Change password
router.put('/password',
  authenticate,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
  ],
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError('Validation failed', errors.array().map(error => ({
        field: error.param,
        message: error.msg,
      })));
    }

    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { id: true, password: true },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new ValidationError('Validation failed', [{
        field: 'currentPassword',
        message: 'Current password is incorrect',
      }]);
    }

    // Hash new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await prisma.user.update({
      where: { id: req.user!.id },
      data: { password: hashedPassword },
    });

    // Invalidate all user sessions
    await prisma.userSession.deleteMany({
      where: { userId: req.user!.id },
    });

    const response: ApiResponse = {
      success: true,
      message: 'Password changed successfully. Please login again.',
    };

    res.json(response);
  })
);

// Get user addresses
router.get('/addresses',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const addresses = await prisma.address.findMany({
      where: { userId: req.user!.id },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    const response: ApiResponse = {
      success: true,
      message: 'Addresses retrieved successfully',
      data: { addresses },
    };

    res.json(response);
  })
);

// Add new address
router.post('/addresses',
  authenticate,
  [
    body('type').isIn(['HOME', 'WORK', 'OTHER']).withMessage('Valid address type is required'),
    body('firstName').notEmpty().withMessage('First name is required'),
    body('lastName').notEmpty().withMessage('Last name is required'),
    body('address1').notEmpty().withMessage('Address line 1 is required'),
    body('city').notEmpty().withMessage('City is required'),
    body('state').notEmpty().withMessage('State is required'),
    body('zipCode').notEmpty().withMessage('ZIP code is required'),
    body('country').optional().notEmpty(),
    body('phone').optional().isMobilePhone('any'),
    body('isDefault').optional().isBoolean(),
  ],
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError('Validation failed', errors.array().map(error => ({
        field: error.param,
        message: error.msg,
      })));
    }

    const addressData = req.body;

    // If this is set as default, unset other default addresses
    if (addressData.isDefault) {
      await prisma.address.updateMany({
        where: { userId: req.user!.id, isDefault: true },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.create({
      data: {
        ...addressData,
        userId: req.user!.id,
        country: addressData.country || 'United States',
      },
    });

    const response: ApiResponse = {
      success: true,
      message: 'Address added successfully',
      data: { address },
    };

    res.status(201).json(response);
  })
);

// Update address
router.put('/addresses/:id',
  authenticate,
  param('id').isString().withMessage('Address ID is required'),
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

    // Check if address belongs to user
    const existingAddress = await prisma.address.findFirst({
      where: { id, userId: req.user!.id },
    });

    if (!existingAddress) {
      throw new NotFoundError('Address not found');
    }

    // If this is set as default, unset other default addresses
    if (updateData.isDefault) {
      await prisma.address.updateMany({
        where: { userId: req.user!.id, isDefault: true, id: { not: id } },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.update({
      where: { id },
      data: updateData,
    });

    const response: ApiResponse = {
      success: true,
      message: 'Address updated successfully',
      data: { address },
    };

    res.json(response);
  })
);

// Delete address
router.delete('/addresses/:id',
  authenticate,
  param('id').isString().withMessage('Address ID is required'),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError('Validation failed', errors.array().map(error => ({
        field: error.param,
        message: error.msg,
      })));
    }

    const { id } = req.params;

    // Check if address belongs to user
    const existingAddress = await prisma.address.findFirst({
      where: { id, userId: req.user!.id },
    });

    if (!existingAddress) {
      throw new NotFoundError('Address not found');
    }

    await prisma.address.delete({
      where: { id },
    });

    const response: ApiResponse = {
      success: true,
      message: 'Address deleted successfully',
    };

    res.json(response);
  })
);

// Get user orders
router.get('/orders',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const orders = await prisma.order.findMany({
      where: { userId: req.user!.id },
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
        shippingAddress: true,
        tracking: {
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const response: ApiResponse = {
      success: true,
      message: 'Orders retrieved successfully',
      data: { orders },
    };

    res.json(response);
  })
);

// Get single order
router.get('/orders/:id',
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
      include: {
        items: {
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
        },
        shippingAddress: true,
        billingAddress: true,
        paymentMethod: true,
        tracking: {
          orderBy: { createdAt: 'desc' },
        },
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

// Admin routes - Get all users
router.get('/',
  authenticate,
  authorize(UserRole.ADMIN),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
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
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count(),
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

export default router;
