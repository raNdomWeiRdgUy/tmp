import { Request } from 'express';
import { JwtPayload } from 'jsonwebtoken';

// User Types
export interface AuthenticatedUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isEmailVerified: boolean;
}

export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface JwtTokenPayload extends JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: ValidationError[];
  meta?: PaginationMeta;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Product Types
export interface ProductFilters {
  categoryId?: string;
  sellerId?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  minRating?: number;
  search?: string;
  status?: ProductStatus;
}

export interface ProductCreateData {
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  sku: string;
  brand: string;
  weight?: number;
  dimensions?: string;
  stockQuantity: number;
  lowStockThreshold?: number;
  categoryId: string;
  sellerId: string;
  images: ProductImageData[];
  specifications: ProductSpecificationData[];
  features: string[];
  variants?: ProductVariantData[];
}

export interface ProductImageData {
  url: string;
  alt?: string;
  sortOrder?: number;
}

export interface ProductSpecificationData {
  name: string;
  value: string;
}

export interface ProductVariantData {
  name: string;
  options: VariantOption[];
}

export interface VariantOption {
  value: string;
  price?: number;
  inStock: boolean;
  image?: string;
}

// Order Types
export interface OrderCreateData {
  items: OrderItemData[];
  shippingAddressId: string;
  billingAddressId: string;
  paymentMethodId: string;
}

export interface OrderItemData {
  productId: string;
  quantity: number;
  selectedVariants?: Record<string, string>;
}

export interface OrderFilters {
  userId?: string;
  status?: OrderStatus;
  dateFrom?: Date;
  dateTo?: Date;
  minTotal?: number;
  maxTotal?: number;
}

// Cart Types
export interface CartItemData {
  productId: string;
  quantity: number;
  selectedVariants?: Record<string, string>;
}

// Review Types
export interface ReviewCreateData {
  productId: string;
  rating: number;
  title: string;
  content: string;
  images?: string[];
}

export interface ReviewFilters {
  productId?: string;
  userId?: string;
  rating?: number;
  isVerified?: boolean;
}

// Search Types
export interface SearchQuery {
  q: string;
  filters?: ProductFilters;
  pagination?: PaginationQuery;
}

export interface SearchResult {
  products: any[];
  aggregations: SearchAggregations;
  meta: PaginationMeta;
}

export interface SearchAggregations {
  categories: BucketAggregation[];
  brands: BucketAggregation[];
  priceRanges: BucketAggregation[];
  ratings: BucketAggregation[];
}

export interface BucketAggregation {
  key: string;
  count: number;
}

// File Upload Types
export interface UploadResult {
  url: string;
  publicId: string;
  width?: number;
  height?: number;
  format?: string;
  size?: number;
}

// Email Types
export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface EmailTemplate {
  name: string;
  subject: string;
  html: string;
}

// Payment Types
export interface PaymentIntentData {
  amount: number;
  currency: string;
  orderId: string;
  customerId?: string;
  paymentMethodId?: string;
}

export interface StripeWebhookEvent {
  id: string;
  type: string;
  data: {
    object: any;
  };
}

// Analytics Types
export interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  totalUsers: number;
  totalProducts: number;
  revenueGrowth: number;
  orderGrowth: number;
  userGrowth: number;
  topSellingProducts: TopSellingProduct[];
  revenueByCategory: RevenueByCategory[];
  ordersOverTime: OrdersOverTime[];
}

export interface TopSellingProduct {
  productId: string;
  title: string;
  totalQuantity: number;
  totalRevenue: number;
}

export interface RevenueByCategory {
  categoryId: string;
  categoryName: string;
  revenue: number;
  orderCount: number;
}

export interface OrdersOverTime {
  date: string;
  orderCount: number;
  revenue: number;
}

// Enums (matching Prisma schema)
export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  SELLER = 'SELLER',
  ADMIN = 'ADMIN'
}

export enum AddressType {
  HOME = 'HOME',
  WORK = 'WORK',
  OTHER = 'OTHER'
}

export enum PaymentMethodType {
  CREDIT = 'CREDIT',
  DEBIT = 'DEBIT',
  PAYPAL = 'PAYPAL',
  GIFT_CARD = 'GIFT_CARD'
}

export enum ProductStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
  DISCONTINUED = 'DISCONTINUED'
}

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  RETURNED = 'RETURNED'
}

// Error Types
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  public errors: ValidationError[];

  constructor(message: string, errors: ValidationError[]) {
    super(message, 400);
    this.errors = errors;
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Not found') {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Conflict') {
    super(message, 409);
  }
}
