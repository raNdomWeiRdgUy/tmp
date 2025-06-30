import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import prisma from '@/config/database';
import config from '@/config';
import { AuthRequest, ApiResponse, LoginCredentials, RegisterData, JwtTokenPayload, ValidationError, ConflictError, UnauthorizedError } from '@/types';
import { asyncHandler } from '@/middleware/errorHandler';
import { authenticate } from '@/middleware/auth';

const router = Router();

// Validation rules
const registerValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('phone').optional().isMobilePhone('any').withMessage('Valid phone number required'),
];

const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

// Register new user
router.post('/register', registerValidation, asyncHandler(async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError('Validation failed', errors.array().map(error => ({
      field: error.param,
      message: error.msg,
    })));
  }

  const { email, password, firstName, lastName, phone }: RegisterData = req.body;

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new ConflictError('User with this email already exists');
  }

  // Hash password
  const saltRounds = 12;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phone,
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      role: true,
      isEmailVerified: true,
      createdAt: true,
    },
  });

  // Generate tokens
  const { accessToken, refreshToken } = generateTokens({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  // Store refresh token
  await prisma.userSession.create({
    data: {
      userId: user.id,
      refreshToken,
      userAgent: req.get('User-Agent'),
      ipAddress: req.ip,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
  });

  const response: ApiResponse = {
    success: true,
    message: 'User registered successfully',
    data: {
      user,
      accessToken,
      refreshToken,
    },
  };

  res.status(201).json(response);
}));

// Login user
router.post('/login', loginValidation, asyncHandler(async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError('Validation failed', errors.array().map(error => ({
      field: error.param,
      message: error.msg,
    })));
  }

  const { email, password }: LoginCredentials = req.body;

  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      password: true,
      firstName: true,
      lastName: true,
      phone: true,
      role: true,
      isEmailVerified: true,
      isActive: true,
      createdAt: true,
    },
  });

  if (!user || !user.isActive) {
    throw new UnauthorizedError('Invalid credentials');
  }

  // Check password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new UnauthorizedError('Invalid credentials');
  }

  // Generate tokens
  const { accessToken, refreshToken } = generateTokens({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  // Store refresh token
  await prisma.userSession.create({
    data: {
      userId: user.id,
      refreshToken,
      userAgent: req.get('User-Agent'),
      ipAddress: req.ip,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
  });

  // Remove password from response
  const { password: _, ...userWithoutPassword } = user;

  const response: ApiResponse = {
    success: true,
    message: 'Login successful',
    data: {
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    },
  };

  res.json(response);
}));

// Refresh token
router.post('/refresh', asyncHandler(async (req: AuthRequest, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new UnauthorizedError('Refresh token is required');
  }

  // Verify refresh token
  const decoded = jwt.verify(refreshToken, config.jwtRefreshSecret) as JwtTokenPayload;

  // Check if session exists and is valid
  const session = await prisma.userSession.findUnique({
    where: { refreshToken },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isEmailVerified: true,
          isActive: true,
        },
      },
    },
  });

  if (!session || session.expiresAt < new Date() || !session.user.isActive) {
    throw new UnauthorizedError('Invalid refresh token');
  }

  // Generate new tokens
  const { accessToken, refreshToken: newRefreshToken } = generateTokens({
    userId: session.user.id,
    email: session.user.email,
    role: session.user.role,
  });

  // Update session with new refresh token
  await prisma.userSession.update({
    where: { id: session.id },
    data: {
      refreshToken: newRefreshToken,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
  });

  const response: ApiResponse = {
    success: true,
    message: 'Token refreshed successfully',
    data: {
      user: session.user,
      accessToken,
      refreshToken: newRefreshToken,
    },
  };

  res.json(response);
}));

// Logout
router.post('/logout', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const { refreshToken } = req.body;

  if (refreshToken) {
    // Delete specific session
    await prisma.userSession.deleteMany({
      where: {
        userId: req.user!.id,
        refreshToken,
      },
    });
  } else {
    // Delete all sessions for user
    await prisma.userSession.deleteMany({
      where: {
        userId: req.user!.id,
      },
    });
  }

  const response: ApiResponse = {
    success: true,
    message: 'Logout successful',
  };

  res.json(response);
}));

// Get current user
router.get('/me', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
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
    },
  });

  const response: ApiResponse = {
    success: true,
    message: 'User retrieved successfully',
    data: { user },
  };

  res.json(response);
}));

// Helper function to generate tokens
const generateTokens = (payload: JwtTokenPayload) => {
  const accessToken = jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });

  const refreshToken = jwt.sign(payload, config.jwtRefreshSecret, {
    expiresIn: config.jwtRefreshExpiresIn,
  });

  return { accessToken, refreshToken };
};

export default router;
