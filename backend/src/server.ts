import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';

import config from './config';
import logger from './config/logger';
import { connectDatabase, disconnectDatabase } from './config/database';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';

// Import routes
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import productRoutes from './routes/products';
import categoryRoutes from './routes/categories';
import storeRoutes from './routes/stores';
import orderRoutes from './routes/orders';
import cartRoutes from './routes/cart';
import reviewRoutes from './routes/reviews';
import paymentRoutes from './routes/payments';
import uploadRoutes from './routes/upload';
import adminRoutes from './routes/admin';
import healthRoutes from './routes/health';

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: [config.frontendUrl, 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Request logging
app.use(requestLogger);

// Health check endpoint (before auth middleware)
app.use('/api/health', healthRoutes);

// API routes
const apiPrefix = `/api/${config.apiVersion}`;

app.use(`${apiPrefix}/auth`, authRoutes);
app.use(`${apiPrefix}/users`, userRoutes);
app.use(`${apiPrefix}/products`, productRoutes);
app.use(`${apiPrefix}/categories`, categoryRoutes);
app.use(`${apiPrefix}/stores`, storeRoutes);
app.use(`${apiPrefix}/orders`, orderRoutes);
app.use(`${apiPrefix}/cart`, cartRoutes);
app.use(`${apiPrefix}/reviews`, reviewRoutes);
app.use(`${apiPrefix}/payments`, paymentRoutes);
app.use(`${apiPrefix}/upload`, uploadRoutes);
app.use(`${apiPrefix}/admin`, adminRoutes);

// Welcome endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Amazon Clone API',
    version: config.apiVersion,
    timestamp: new Date().toISOString(),
  });
});

// API documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Amazon Clone API',
    version: config.apiVersion,
    endpoints: {
      auth: `${apiPrefix}/auth`,
      users: `${apiPrefix}/users`,
      products: `${apiPrefix}/products`,
      categories: `${apiPrefix}/categories`,
      stores: `${apiPrefix}/stores`,
      orders: `${apiPrefix}/orders`,
      cart: `${apiPrefix}/cart`,
      reviews: `${apiPrefix}/reviews`,
      payments: `${apiPrefix}/payments`,
      upload: `${apiPrefix}/upload`,
      admin: `${apiPrefix}/admin`,
      health: '/api/health',
    },
    documentation: 'https://github.com/your-repo/amazon-clone-api',
  });
});

// Error handling middleware (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);

  server.close(async () => {
    logger.info('HTTP server closed');

    try {
      await disconnectDatabase();
      logger.info('Graceful shutdown completed');
      process.exit(0);
    } catch (error) {
      logger.error('Error during graceful shutdown:', error);
      process.exit(1);
    }
  });

  // Force close after 10 seconds
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDatabase();

    // Start HTTP server
    const server = app.listen(config.port, () => {
      logger.info(`🚀 Server running on port ${config.port} in ${config.nodeEnv} mode`);
      logger.info(`📚 API documentation available at http://localhost:${config.port}/api`);
      logger.info(`🏥 Health check available at http://localhost:${config.port}/api/health`);
    });

    return server;
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Export for testing
export default app;

// Start server if this file is run directly
if (require.main === module) {
  startServer();
}

// Make server available for graceful shutdown
let server: any;
startServer().then((s) => {
  server = s;
});
