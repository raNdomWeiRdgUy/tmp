'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star, Heart, ShoppingCart, Eye, Badge as BadgeIcon, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/lib/store';
import type { Product } from '@/lib/types';

interface ProductCardProps {
  product: Product;
  variant?: 'default' | 'featured' | 'trending';
}

const ModernProductCard = ({ product, variant = 'default' }: ProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const { addToCart, toggleWishlist, isInWishlist } = useApp();

  const discountPercentage = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const isOnSale = discountPercentage > 0;
  const isFeatured = variant === 'featured' || product.price > 200;
  const isTrending = variant === 'trending' || product.rating > 4.5;
  const isWishlisted = isInWishlist(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart(product);
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    toggleWishlist(product.id);
  };

  return (
    <Link href={`/product/${product.id}`} className="group block">
      <div
        className={`product-card relative transition-all duration-300 ${
          isHovered ? 'shadow-xl' : ''
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Badges */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
          {isOnSale && (
            <Badge className="bg-gradient-secondary text-white px-2 py-1 text-xs font-semibold">
              {discountPercentage}% OFF
            </Badge>
          )}
          {isFeatured && (
            <Badge className="bg-gradient-primary text-white px-2 py-1 text-xs font-semibold">
              <BadgeIcon className="w-3 h-3 mr-1" />
              Featured
            </Badge>
          )}
          {isTrending && (
            <Badge className="bg-orange-500 text-white px-2 py-1 text-xs font-semibold">
              <TrendingUp className="w-3 h-3 mr-1" />
              Trending
            </Badge>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistToggle}
          className={`absolute top-3 right-3 z-10 p-2 rounded-full transition-all duration-300 ${
            isWishlisted
              ? 'bg-red-500 text-white'
              : 'bg-white/90 text-gray-600 hover:bg-white hover:text-red-500'
          } ${isHovered ? 'scale-110' : ''}`}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>

        {/* Product Image */}
        <div className="relative aspect-square overflow-hidden rounded-t-lg bg-gray-100">
          {imageLoading && (
            <div className="absolute inset-0 skeleton animate-pulse" />
          )}

          <Image
            src={product.images?.[0] || '/images/placeholder-product.jpg'}
            alt={product.title}
            fill
            className={`object-cover transition-all duration-500 ${
              isHovered ? 'scale-105' : 'scale-100'
            } ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
            onLoad={() => setImageLoading(false)}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />

          {/* Overlay on hover */}
          <div className={`absolute inset-0 bg-black/20 transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`} />

          {/* Quick Actions */}
          <div className={`absolute bottom-3 left-3 right-3 flex gap-2 transition-all duration-300 ${
            isHovered ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}>
            <Button
              onClick={handleAddToCart}
              className="btn-primary flex-1 py-2 text-xs"
              size="sm"
            >
              <ShoppingCart className="w-3 h-3 mr-1" />
              Add to Cart
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="p-2 bg-white hover:bg-gray-50"
            >
              <Eye className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Product Info */}
        <div className="p-4">
          {/* Brand and Rating */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              {product.brand || 'Brand'}
            </span>
            {product.rating && (
              <div className="flex items-center space-x-1">
                <Star className="w-3 h-3 text-yellow-400 fill-current" />
                <span className="text-xs text-gray-600 font-medium">
                  {product.rating.toFixed(1)}
                </span>
                <span className="text-xs text-gray-400">
                  ({product.reviewCount})
                </span>
              </div>
            )}
          </div>

          {/* Product Title */}
          <h3 className="font-heading text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors duration-300">
            {product.title}
          </h3>

          {/* Price Section */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <span className="text-lg font-heading text-gray-900">
                ${product.price.toFixed(2)}
              </span>
              {product.originalPrice && (
                <span className="text-sm text-gray-400 line-through">
                  ${product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>

            {/* Stock Status */}
            <div className="flex items-center space-x-1">
              <div className={`w-2 h-2 rounded-full ${
                product.inStock ? 'bg-green-500' : 'bg-red-500'
              }`} />
              <span className="text-xs text-gray-500">
                {product.inStock ? 'In Stock' : 'Out of Stock'}
              </span>
            </div>
          </div>

          {/* Seller Info */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Sold by {product.seller.name}</span>
            {product.seller.rating && (
              <div className="flex items-center space-x-1">
                <Star className="w-3 h-3 text-yellow-400 fill-current" />
                <span>{product.seller.rating.toFixed(1)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Hover Effect Border */}
        <div className={`absolute inset-0 rounded-lg border-2 border-blue-500 transition-opacity duration-300 pointer-events-none ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`} />
      </div>
    </Link>
  );
};

export default ModernProductCard;
