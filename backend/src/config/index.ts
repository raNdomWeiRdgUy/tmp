import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

interface Config {
  // Server
  nodeEnv: string;
  port: number;
  apiVersion: string;

  // Database
  databaseUrl: string;

  // Redis
  redisUrl: string;

  // JWT
  jwtSecret: string;
  jwtExpiresIn: string;
  jwtRefreshSecret: string;
  jwtRefreshExpiresIn: string;

  // Cloudinary
  cloudinary: {
    cloudName: string;
    apiKey: string;
    apiSecret: string;
  };

  // Stripe
  stripe: {
    secretKey: string;
    webhookSecret: string;
    publishableKey: string;
  };

  // Email
  email: {
    from: string;
    fromName: string;
    smtp: {
      host: string;
      port: number;
      user: string;
      pass: string;
    };
  };

  // Frontend
  frontendUrl: string;

  // Rate Limiting
  rateLimit: {
    windowMs: number;
    maxRequests: number;
  };

  // File Upload
  upload: {
    maxFileSize: number;
    allowedImageTypes: string[];
  };

  // Admin
  admin: {
    email: string;
    password: string;
  };

  // OAuth
  google: {
    clientId: string;
    clientSecret: string;
  };
  facebook: {
    appId: string;
    appSecret: string;
  };
}

const config: Config = {
  // Server
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  apiVersion: process.env.API_VERSION || 'v1',

  // Database
  databaseUrl: process.env.DATABASE_URL || '',

  // Redis
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',

  // JWT
  jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-token-secret',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',

  // Cloudinary
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  },

  // Stripe
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
  },

  // Email
  email: {
    from: process.env.EMAIL_FROM || 'noreply@amazonclone.com',
    fromName: process.env.EMAIL_FROM_NAME || 'Amazon Clone',
    smtp: {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || '',
    },
  },

  // Frontend
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },

  // File Upload
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10), // 5MB
    allowedImageTypes: (process.env.ALLOWED_IMAGE_TYPES || 'image/jpeg,image/png,image/webp').split(','),
  },

  // Admin
  admin: {
    email: process.env.ADMIN_EMAIL || 'admin@amazonclone.com',
    password: process.env.ADMIN_PASSWORD || 'admin123456',
  },

  // OAuth
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  },
  facebook: {
    appId: process.env.FACEBOOK_APP_ID || '',
    appSecret: process.env.FACEBOOK_APP_SECRET || '',
  },
};

// Validate required environment variables
const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
];

const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingEnvVars.join(', ')}`
  );
}

export default config;
