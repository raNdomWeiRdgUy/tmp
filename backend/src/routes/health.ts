import { Router, Request, Response } from 'express';
import { checkDatabaseHealth } from '@/config/database';
import { asyncHandler } from '@/middleware/errorHandler';
import config from '@/config';

const router = Router();

// Basic health check
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const timestamp = new Date().toISOString();

  res.json({
    success: true,
    message: 'Service is healthy',
    timestamp,
    uptime: process.uptime(),
    environment: config.nodeEnv,
    version: config.apiVersion,
  });
}));

// Detailed health check
router.get('/detailed', asyncHandler(async (req: Request, res: Response) => {
  const timestamp = new Date().toISOString();
  const startTime = Date.now();

  // Check database health
  const dbHealthy = await checkDatabaseHealth();
  const dbResponseTime = Date.now() - startTime;

  // Memory usage
  const memoryUsage = process.memoryUsage();

  // CPU usage (simple approximation)
  const cpuUsage = process.cpuUsage();

  const healthStatus = {
    status: dbHealthy ? 'healthy' : 'unhealthy',
    timestamp,
    uptime: process.uptime(),
    environment: config.nodeEnv,
    version: config.apiVersion,
    services: {
      database: {
        status: dbHealthy ? 'healthy' : 'unhealthy',
        responseTime: `${dbResponseTime}ms`,
      },
    },
    system: {
      memory: {
        rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
        heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
        external: `${Math.round(memoryUsage.external / 1024 / 1024)}MB`,
      },
      cpu: {
        user: cpuUsage.user,
        system: cpuUsage.system,
      },
    },
  };

  const statusCode = dbHealthy ? 200 : 503;

  res.status(statusCode).json({
    success: dbHealthy,
    data: healthStatus,
  });
}));

// Readiness probe (for Kubernetes)
router.get('/ready', asyncHandler(async (req: Request, res: Response) => {
  const dbHealthy = await checkDatabaseHealth();

  if (dbHealthy) {
    res.json({
      success: true,
      message: 'Service is ready',
      timestamp: new Date().toISOString(),
    });
  } else {
    res.status(503).json({
      success: false,
      message: 'Service is not ready',
      timestamp: new Date().toISOString(),
    });
  }
}));

// Liveness probe (for Kubernetes)
router.get('/live', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Service is alive',
    timestamp: new Date().toISOString(),
  });
});

export default router;
