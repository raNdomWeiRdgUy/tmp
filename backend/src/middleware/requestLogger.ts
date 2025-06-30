import { Request, Response, NextFunction } from 'express';
import logger from '@/config/logger';

export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();

  // Log request
  logger.http(`${req.method} ${req.url}`, {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    body: req.method !== 'GET' ? req.body : undefined,
    query: Object.keys(req.query).length > 0 ? req.query : undefined,
  });

  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function(...args: any[]) {
    const duration = Date.now() - start;

    logger.http(`${req.method} ${req.url} - ${res.statusCode}`, {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
    });

    originalEnd.apply(this, args);
  };

  next();
};
