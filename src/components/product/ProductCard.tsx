'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star, Heart, ShoppingCart, Eye, Crown, Sparkles, Diamond } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { Product } from '@/types/product';

interface ProductCardProps {
  product: Product;
  variant?: 'default' | 'premium' | 'exclusive';
}

const LuxuryProductCard = ({ product, variant = 'default' }: ProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const discountPercentage = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const isOnSale = discountPercentage > 0;
  const isPremium = variant === 'premium' || product.price > 500;
  const isExclusive = variant === 'exclusive' || product.price > 1000;
  const isWishlisted = isInWishlist(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart(product);
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isWishlisted) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const getCardVariant = () => {
    if (isExclusive) return 'emerald-card';
    if (isPremium) return 'champagne-card';
    return 'luxury-card';
  };

  const getPriceGradient = () => {
    if (isExclusive) return 'text-emerald-gradient';
    if (isPremium) return 'text-champagne-gradient';
    return 'text-white';
  };

  return (
    <Link href={`/products/${product.id}`} className="group block">
      <div
        className={`${getCardVariant()} overflow-hidden hover-rise relative transition-all duration-500 ${
          isHovered ? 'scale-[1.02]' : ''
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Premium Badge */}
        {(isPremium || isExclusive) && (
          <div className="absolute top-4 left-4 z-20">
            <Badge className={`${isExclusive ? 'emerald-card' : 'champagne-card'} px-3 py-1 text-xs font-premium`}>
              {isExclusive ? (
                <>
                  <Diamond className="w-3 h-3 mr-1" />
                  Exclusive
                </>
              ) : (
                <>
                  <Crown className="w-3 h-3 mr-1" />
                  Premium
                </>
              )}
            </Badge>
          </div>
        )}

        {/* Sale Badge */}
        {isOnSale && (
          <div className="absolute top-4 right-4 z-20">
            <Badge className="bg-gradient-to-r from-rose-gold-medium to-rose-gold-light text-white px-3 py-1 text-xs font-premium">
              -{discountPercentage}%
            </Badge>
          </div>
        )}

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistToggle}
          className={`absolute top-16 right-4 z-20 p-2 rounded-full transition-all duration-300 ${
            isWishlisted
              ? 'bg-rose-gold-medium/80 text-white backdrop-blur-md'
              : 'bg-white/10 text-white/60 hover:bg-white/20 hover:text-white backdrop-blur-md'
          } ${isHovered ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}`}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>

        {/* Product Image */}
        <div className="relative aspect-[4/5] overflow-hidden">
          {/* Loading Skeleton */}
          {imageLoading && (
            <div className="absolute inset-0 skeleton-luxury" />
          )}

          <Image
            src={product.images?.[0]?.url || '/images/placeholder-product.jpg'}
            alt={product.title}
            fill
            className={`object-cover transition-all duration-700 ${
              isHovered ? 'scale-110' : 'scale-100'
            } ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
            onLoad={() => setImageLoading(false)}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Quick Actions */}
          <div className={`absolute bottom-4 left-4 right-4 flex space-x-2 transition-all duration-300 ${
            isHovered ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}>
            <Button
              onClick={handleAddToCart}
              className="btn-luxury flex-1 py-2 text-xs"
              size="sm"
            >
              <ShoppingCart className="w-3 h-3 mr-1" />
              Add to Cart
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="btn-ghost p-2"
            >
              <Eye className="w-4 h-4" />
            </Button>
          </div>

          {/* Decorative Elements */}
          {isExclusive && (
            <div className="absolute top-2 left-2 animate-pulse">
              <Sparkles className="w-4 h-4 text-emerald-light/60" />
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-6">
          {/* Brand/Category */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-premium text-white/60 uppercase tracking-wider">
              {product.brand || 'Luxury Brand'}
            </span>
            {product.rating && (
              <div className="flex items-center space-x-1">
                <Star className="w-3 h-3 text-champagne-light fill-current" />
                <span className="text-xs text-white/60">{product.rating.toFixed(1)}</span>
              </div>
            )}
          </div>

          {/* Product Title */}
          <h3 className="font-luxury text-lg text-white mb-3 line-clamp-2 group-hover:text-emerald-light transition-colors duration-300">
            {product.title}
          </h3>

          {/* Price Section */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className={`text-xl font-premium ${getPriceGradient()}`}>
                ${product.price.toFixed(2)}
              </span>
              {product.originalPrice && (
                <span className="text-sm text-white/40 line-through">
                  ${product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>

            {/* Stock Status */}
            <div className="flex items-center space-x-1">
              <div className={`w-2 h-2 rounded-full ${
                product.inStock ? 'bg-emerald-light' : 'bg-rose-gold-medium'
              }`} />
              <span className="text-xs text-white/60">
                {product.inStock ? 'In Stock' : 'Sold Out'}
              </span>
            </div>
          </div>

          {/* Limited Edition Indicator */}
          {isExclusive && (
            <div className="mt-3 flex items-center space-x-2 text-xs text-emerald-light">
              <Diamond className="w-3 h-3" />
              <span>Limited Edition</span>
            </div>
          )}
        </div>

        {/* Premium Shimmer Effect */}
        {(isPremium || isExclusive) && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none" />
        )}

        {/* Luxury Border Glow */}
        <div className="absolute inset-0 rounded-[var(--radius-luxury)] bg-gradient-to-r from-emerald-light/20 via-champagne-light/20 to-emerald-light/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
             style={{ padding: '1px', mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', maskComposite: 'exclude' }} />
      </div>
    </Link>
  );
};

export default LuxuryProductCard;
