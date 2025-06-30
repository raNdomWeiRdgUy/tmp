// User Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  addresses: Address[];
  paymentMethods: PaymentMethod[];
  orders: Order[];
  wishlist: string[]; // product IDs
  createdAt: Date;
  isAdmin?: boolean;
}

export interface Address {
  id: string;
  type: 'home' | 'work' | 'other';
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
  isDefault: boolean;
}

export interface PaymentMethod {
  id: string;
  type: 'credit' | 'debit' | 'paypal' | 'gift_card';
  last4: string;
  brand: string;
  expiryMonth: number;
  expiryYear: number;
  isDefault: boolean;
}

// Product Types
export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: string;
  subcategory?: string;
  brand: string;
  seller: Seller;
  specifications: Record<string, string>;
  features: string[];
  inStock: boolean;
  stockQuantity: number;
  rating: number;
  reviewCount: number;
  reviews: Review[];
  variants?: ProductVariant[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductVariant {
  id: string;
  name: string;
  options: VariantOption[];
}

export interface VariantOption {
  value: string;
  price?: number;
  inStock: boolean;
  image?: string;
}

export interface Seller {
  id: string;
  name: string;
  logo?: string;
  rating: number;
  reviewCount: number;
  description?: string;
  joinedDate: Date;
}

// Review Types
export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  productId: string;
  rating: number;
  title: string;
  content: string;
  images?: string[];
  verified: boolean;
  helpful: number;
  notHelpful: number;
  createdAt: Date;
}

// Cart Types
export interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
  selectedVariants?: Record<string, string>;
  addedAt: Date;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
}

// Order Types
export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  shippingAddress: Address;
  billingAddress: Address;
  paymentMethod: PaymentMethod;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  status: OrderStatus;
  tracking?: TrackingInfo;
  createdAt: Date;
  updatedAt: Date;
  estimatedDelivery: Date;
}

export interface OrderItem {
  productId: string;
  product: Product;
  quantity: number;
  price: number;
  selectedVariants?: Record<string, string>;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'returned';

export interface TrackingInfo {
  trackingNumber: string;
  carrier: string;
  status: string;
  updates: TrackingUpdate[];
}

export interface TrackingUpdate {
  status: string;
  location: string;
  date: Date;
  description: string;
}

// Category Types
export interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
  description?: string;
  parentId?: string;
  subcategories?: Category[];
  productCount: number;
}

// Search Types
export interface SearchFilters {
  category?: string;
  priceMin?: number;
  priceMax?: number;
  brand?: string;
  rating?: number;
  inStock?: boolean;
  seller?: string;
  features?: string[];
}

export interface SearchResult {
  products: Product[];
  totalCount: number;
  filters: SearchFilters;
  suggestions?: string[];
}

// App State Types
export interface AppState {
  user: User | null;
  cart: Cart;
  recentlyViewed: Product[];
  searchHistory: string[];
  isLoading: boolean;
  error: string | null;
}
