# Amazon Clone Backend API

A comprehensive Node.js backend API for an Amazon-like e-commerce platform built with Express.js, TypeScript, Prisma, and PostgreSQL.

## Features

- 🔐 JWT-based authentication with refresh tokens
- 👥 User management (customers, sellers, admins)
- 🏪 Product catalog with categories and variants
- 🛒 Shopping cart and order management
- ⭐ Reviews and ratings system
- 💳 Payment processing with Stripe
- 📧 Email notifications
- 🖼️ Image upload with Cloudinary
- 🔒 Role-based access control
- 📊 Analytics and reporting
- 🏥 Health checks and monitoring
- 📝 Request logging
- 🛡️ Security middleware (Helmet, CORS, Rate limiting)

## Tech Stack

- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** PostgreSQL with Prisma ORM
- **Cache:** Redis
- **Authentication:** JWT
- **File Upload:** Cloudinary
- **Payments:** Stripe
- **Email:** NodeMailer
- **Logging:** Winston
- **Validation:** express-validator
- **Security:** Helmet, CORS, bcryptjs

## Project Structure

```
backend/
├── src/
│   ├── config/           # Configuration files
│   │   ├── database.ts   # Prisma client setup
│   │   ├── logger.ts     # Winston logger config
│   │   └── index.ts      # Environment variables
│   ├── middleware/       # Express middleware
│   │   ├── auth.ts       # Authentication middleware
│   │   ├── errorHandler.ts # Error handling
│   │   └── requestLogger.ts # Request logging
│   ├── routes/           # API routes
│   │   ├── auth.ts       # Authentication routes
│   │   ├── users.ts      # User management
│   │   ├── products.ts   # Product catalog
│   │   ├── categories.ts # Category management
│   │   ├── orders.ts     # Order processing
│   │   ├── cart.ts       # Shopping cart
│   │   ├── reviews.ts    # Reviews and ratings
│   │   ├── payments.ts   # Payment processing
│   │   ├── upload.ts     # File uploads
│   │   ├── admin.ts      # Admin functionality
│   │   └── health.ts     # Health checks
│   ├── types/            # TypeScript types
│   │   └── index.ts      # Global type definitions
│   └── server.ts         # Main server file
├── prisma/
│   └── schema.prisma     # Database schema
├── logs/                 # Log files
├── .env.example          # Environment variables template
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
└── README.md            # This file
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/bun
- PostgreSQL database
- Redis server (optional, for caching)

### Installation

1. **Clone and navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   # or
   bun install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your configuration:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/amazon_clone_db"

   # JWT Secrets
   JWT_SECRET="your-super-secret-jwt-key"
   JWT_REFRESH_SECRET="your-refresh-token-secret"

   # Cloudinary (for image uploads)
   CLOUDINARY_CLOUD_NAME="your-cloud-name"
   CLOUDINARY_API_KEY="your-api-key"
   CLOUDINARY_API_SECRET="your-api-secret"

   # Stripe (for payments)
   STRIPE_SECRET_KEY="sk_test_your-stripe-secret-key"
   STRIPE_WEBHOOK_SECRET="whsec_your-webhook-secret"

   # Email (NodeMailer)
   SMTP_HOST="smtp.gmail.com"
   SMTP_USER="your-email@gmail.com"
   SMTP_PASS="your-app-password"
   ```

4. **Set up the database:**
   ```bash
   # Generate Prisma client
   npx prisma generate

   # Run database migrations
   npx prisma migrate dev

   # Seed the database (optional)
   npm run db:seed
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:5000`

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run db:migrate` - Run database migrations
- `npm run db:generate` - Generate Prisma client
- `npm run db:studio` - Open Prisma Studio
- `npm run db:seed` - Seed database with sample data

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - User logout
- `GET /api/v1/auth/me` - Get current user

### Users
- `GET /api/v1/users/profile` - Get user profile
- `PUT /api/v1/users/profile` - Update user profile
- `PUT /api/v1/users/password` - Change password
- `GET /api/v1/users/addresses` - Get user addresses
- `POST /api/v1/users/addresses` - Add new address
- `PUT /api/v1/users/addresses/:id` - Update address
- `DELETE /api/v1/users/addresses/:id` - Delete address
- `GET /api/v1/users/orders` - Get user orders
- `GET /api/v1/users/orders/:id` - Get specific order

### Products
- `GET /api/v1/products` - Get all products (with filters)
- `GET /api/v1/products/:id` - Get single product
- `POST /api/v1/products` - Create product (Admin/Seller)
- `PUT /api/v1/products/:id` - Update product (Admin/Seller)
- `DELETE /api/v1/products/:id` - Delete product (Admin/Seller)

### Categories
- `GET /api/v1/categories` - Get all categories
- `GET /api/v1/categories/:id` - Get single category

### Health Checks
- `GET /api/health` - Basic health check
- `GET /api/health/detailed` - Detailed health status
- `GET /api/health/ready` - Readiness probe
- `GET /api/health/live` - Liveness probe

## Database Schema

The database uses PostgreSQL with Prisma ORM. Key entities include:

- **Users** - Customer/seller/admin accounts
- **Products** - Product catalog with images, specs, variants
- **Categories** - Hierarchical product categories
- **Orders** - Order processing and tracking
- **Reviews** - Product reviews and ratings
- **Addresses** - User shipping/billing addresses
- **PaymentMethods** - Stored payment methods
- **Cart** - Shopping cart items

## Authentication

The API uses JWT-based authentication with refresh tokens:

1. **Register/Login** - Returns access token (short-lived) and refresh token (long-lived)
2. **Access Token** - Include in `Authorization: Bearer <token>` header
3. **Refresh Token** - Use `/auth/refresh` endpoint to get new access token
4. **Logout** - Invalidates refresh tokens

## Error Handling

All API responses follow a consistent format:

```json
{
  "success": boolean,
  "message": string,
  "data": object,     // On success
  "errors": array,    // On validation errors
  "meta": object      // Pagination info
}
```

HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request / Validation Error
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

## Security Features

- **JWT Authentication** with secure token storage
- **Password Hashing** with bcryptjs (12 rounds)
- **Rate Limiting** to prevent abuse
- **CORS** configuration for cross-origin requests
- **Helmet** for security headers
- **Input Validation** with express-validator
- **SQL Injection Prevention** with Prisma ORM
- **Role-based Access Control** (Customer/Seller/Admin)

## Logging

The API uses Winston for structured logging:

- **Console** - Development environment
- **Files** - Production (combined.log, error.log)
- **Levels** - error, warn, info, http, debug

## Deployment

### Environment Variables

Ensure all required environment variables are set in production:

```env
NODE_ENV=production
DATABASE_URL="your-production-database-url"
JWT_SECRET="your-production-jwt-secret"
REDIS_URL="your-redis-url"
# ... other production configs
```

### Docker

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["npm", "start"]
```

### Health Checks

The API provides health check endpoints for monitoring:

- `/api/health` - Basic health status
- `/api/health/detailed` - Detailed system information
- `/api/health/ready` - Kubernetes readiness probe
- `/api/health/live` - Kubernetes liveness probe

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run `npm run lint` and `npm test`
6. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Create an issue on GitHub
- Check the API documentation at `/api`
- Review the health status at `/api/health/detailed`
