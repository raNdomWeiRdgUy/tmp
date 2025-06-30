import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import logger from '@/config/logger';
import { AppError, ValidationError } from '@/types';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = 500;
  let message = 'Internal server error';
  let errors: any[] = [];

  logger.error('Error caught by error handler:', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
  });

  // Handle custom app errors
  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;

    if (error instanceof ValidationError) {
      errors = error.errors;
    }
  }
  // Handle Prisma errors
  else if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        statusCode = 409;
        message = 'A record with this information already exists';
        break;
      case 'P2014':
        statusCode = 400;
        message = 'The provided data violates a required relation';
        break;
      case 'P2003':
        statusCode = 400;
        message = 'Foreign key constraint failed';
        break;
      case 'P2025':
        statusCode = 404;
        message = 'Record not found';
        break;
      default:
        statusCode = 400;
        message = 'Database operation failed';
    }
  }
  // Handle Prisma validation errors
  else if (error instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    message = 'Invalid data provided';
  }
  // Handle JWT errors
  else if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }
  else if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }
  // Handle multer errors (file upload)
  else if (error.name === 'MulterError') {
    statusCode = 400;
    message = 'File upload error';
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(errors.length > 0 && { errors }),
    ...(process.env.NODE_ENV === 'development' && {
      stack: error.stack,
      details: error.message,
    }),
  });
};

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
};

export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
