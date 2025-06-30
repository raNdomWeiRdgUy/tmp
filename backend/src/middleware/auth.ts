import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '@/config';
import prisma from '@/config/database';
import { AuthRequest, JwtTokenPayload, UnauthorizedError, ForbiddenError, UserRole } from '@/types';
import { asyncHandler } from './errorHandler';

export const authenticate = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = extractToken(req);

  if (!token) {
    throw new UnauthorizedError('Access token is required');
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as JwtTokenPayload;

    // Get user from database to ensure they still exist and are active
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isEmailVerified: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedError('User not found or inactive');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new UnauthorizedError('Invalid token');
    }
    if (error instanceof jwt.TokenExpiredError) {
      throw new UnauthorizedError('Token expired');
    }
    throw error;
  }
});

export const authorize = (...roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required');
    }

    if (!roles.includes(req.user.role)) {
      throw new ForbiddenError('Insufficient permissions');
    }

    next();
  };
};

export const requireEmailVerification = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    throw new UnauthorizedError('Authentication required');
  }

  if (!req.user.isEmailVerified) {
    throw new ForbiddenError('Email verification required');
  }

  next();
};

export const optionalAuth = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = extractToken(req);

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as JwtTokenPayload;

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isEmailVerified: true,
        isActive: true,
      },
    });

    if (user && user.isActive) {
      req.user = user;
    }
  } catch (error) {
    // Ignore errors for optional auth
  }

  next();
});

const extractToken = (req: AuthRequest): string | null => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  return null;
};
