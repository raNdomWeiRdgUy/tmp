'use client';

import type React from 'react';
import { createContext, useContext, useReducer, useEffect } from 'react';
import { type AppState, type User, Cart, type Product, type CartItem } from './types';
import { mockUser, mockProducts } from './mock-data';

// Initial state
const initialState: AppState = {
  user: null,
  cart: {
    items: [],
    subtotal: 0,
    tax: 0,
    shipping: 0,
    total: 0,
  },
  recentlyViewed: [],
  searchHistory: [],
  isLoading: false,
  error: null,
};

// Action types
type Action =
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'ADD_TO_CART'; payload: { product: Product; quantity: number; variants?: Record<string, string> } }
  | { type: 'REMOVE_FROM_CART'; payload: string }
  | { type: 'UPDATE_CART_QUANTITY'; payload: { productId: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'ADD_TO_RECENTLY_VIEWED'; payload: Product }
  | { type: 'ADD_TO_SEARCH_HISTORY'; payload: string }
  | { type: 'TOGGLE_WISHLIST'; payload: string };

// Calculate cart totals
const calculateCartTotals = (items: CartItem[]) => {
  const subtotal = items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  const tax = subtotal * 0.08; // 8% tax rate
  const shipping = subtotal > 35 ? 0 : 5.99; // Free shipping over $35
  const total = subtotal + tax + shipping;

  return { subtotal, tax, shipping, total };
};

// Reducer function
const appReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };

    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload };

    case 'ADD_TO_CART': {
      const existingItemIndex = state.cart.items.findIndex(
        item => item.productId === action.payload.product.id
      );

      let newItems: CartItem[];
      if (existingItemIndex >= 0) {
        // Update existing item quantity
        newItems = state.cart.items.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + action.payload.quantity }
            : item
        );
      } else {
        // Add new item
        const newItem: CartItem = {
          productId: action.payload.product.id,
          product: action.payload.product,
          quantity: action.payload.quantity,
          selectedVariants: action.payload.variants,
          addedAt: new Date(),
        };
        newItems = [...state.cart.items, newItem];
      }

      const totals = calculateCartTotals(newItems);
      return {
        ...state,
        cart: { items: newItems, ...totals },
      };
    }

    case 'REMOVE_FROM_CART': {
      const newItems = state.cart.items.filter(item => item.productId !== action.payload);
      const totals = calculateCartTotals(newItems);
      return {
        ...state,
        cart: { items: newItems, ...totals },
      };
    }

    case 'UPDATE_CART_QUANTITY': {
      const newItems = state.cart.items.map(item =>
        item.productId === action.payload.productId
          ? { ...item, quantity: Math.max(0, action.payload.quantity) }
          : item
      ).filter(item => item.quantity > 0);

      const totals = calculateCartTotals(newItems);
      return {
        ...state,
        cart: { items: newItems, ...totals },
      };
    }

    case 'CLEAR_CART':
      return {
        ...state,
        cart: {
          items: [],
          subtotal: 0,
          tax: 0,
          shipping: 0,
          total: 0,
        },
      };

    case 'ADD_TO_RECENTLY_VIEWED': {
      const filtered = state.recentlyViewed.filter(p => p.id !== action.payload.id);
      const newRecentlyViewed = [action.payload, ...filtered].slice(0, 10); // Keep last 10
      return { ...state, recentlyViewed: newRecentlyViewed };
    }

    case 'ADD_TO_SEARCH_HISTORY': {
      const filtered = state.searchHistory.filter(term => term !== action.payload);
      const newSearchHistory = [action.payload, ...filtered].slice(0, 10); // Keep last 10
      return { ...state, searchHistory: newSearchHistory };
    }

    case 'TOGGLE_WISHLIST': {
      if (!state.user) return state;

      const isInWishlist = state.user.wishlist.includes(action.payload);
      const newWishlist = isInWishlist
        ? state.user.wishlist.filter(id => id !== action.payload)
        : [...state.user.wishlist, action.payload];

      return {
        ...state,
        user: { ...state.user, wishlist: newWishlist },
      };
    }

    default:
      return state;
  }
};

// Context
const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
  // Helper functions
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  addToCart: (product: Product, quantity?: number, variants?: Record<string, string>) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  addToRecentlyViewed: (product: Product) => void;
  addToSearchHistory: (term: string) => void;
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  getCartItemCount: () => number;
} | null>(null);

// Provider component
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('amazon-clone-user');
    const savedCart = localStorage.getItem('amazon-clone-cart');
    const savedRecentlyViewed = localStorage.getItem('amazon-clone-recently-viewed');
    const savedSearchHistory = localStorage.getItem('amazon-clone-search-history');

    if (savedUser) {
      dispatch({ type: 'SET_USER', payload: JSON.parse(savedUser) });
    }
    if (savedCart) {
      const cart = JSON.parse(savedCart);
      // Restore cart items one by one to recalculate totals
      for (const item of cart.items) {
        dispatch({
          type: 'ADD_TO_CART',
          payload: {
            product: item.product,
            quantity: item.quantity,
            variants: item.selectedVariants,
          },
        });
      }
    }
    if (savedRecentlyViewed) {
      const products = JSON.parse(savedRecentlyViewed);
      for (const product of products) {
        dispatch({ type: 'ADD_TO_RECENTLY_VIEWED', payload: product });
      }
    }
    if (savedSearchHistory) {
      const history = JSON.parse(savedSearchHistory);
      for (const term of history) {
        dispatch({ type: 'ADD_TO_SEARCH_HISTORY', payload: term });
      }
    }
  }, []);

  // Save to localStorage when state changes
  useEffect(() => {
    if (state.user) {
      localStorage.setItem('amazon-clone-user', JSON.stringify(state.user));
    } else {
      localStorage.removeItem('amazon-clone-user');
    }
  }, [state.user]);

  useEffect(() => {
    localStorage.setItem('amazon-clone-cart', JSON.stringify(state.cart));
  }, [state.cart]);

  useEffect(() => {
    localStorage.setItem('amazon-clone-recently-viewed', JSON.stringify(state.recentlyViewed));
  }, [state.recentlyViewed]);

  useEffect(() => {
    localStorage.setItem('amazon-clone-search-history', JSON.stringify(state.searchHistory));
  }, [state.searchHistory]);

  // Helper functions
  const login = async (email: string, password: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // For demo purposes, accept any email/password and return mock user
      if (email && password) {
        dispatch({ type: 'SET_USER', payload: mockUser });
        dispatch({ type: 'SET_ERROR', payload: null });
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Invalid email or password' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const logout = () => {
    dispatch({ type: 'SET_USER', payload: null });
    dispatch({ type: 'CLEAR_CART' });
  };

  const addToCart = (product: Product, quantity = 1, variants?: Record<string, string>) => {
    dispatch({ type: 'ADD_TO_CART', payload: { product, quantity, variants } });
  };

  const removeFromCart = (productId: string) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: productId });
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_CART_QUANTITY', payload: { productId, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const addToRecentlyViewed = (product: Product) => {
    dispatch({ type: 'ADD_TO_RECENTLY_VIEWED', payload: product });
  };

  const addToSearchHistory = (term: string) => {
    if (term.trim()) {
      dispatch({ type: 'ADD_TO_SEARCH_HISTORY', payload: term.trim() });
    }
  };

  const toggleWishlist = (productId: string) => {
    dispatch({ type: 'TOGGLE_WISHLIST', payload: productId });
  };

  const isInWishlist = (productId: string) => {
    return state.user?.wishlist.includes(productId) || false;
  };

  const getCartItemCount = () => {
    return state.cart.items.reduce((total, item) => total + item.quantity, 0);
  };

  const value = {
    state,
    dispatch,
    login,
    logout,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    addToRecentlyViewed,
    addToSearchHistory,
    toggleWishlist,
    isInWishlist,
    getCartItemCount,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Hook to use the context
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
