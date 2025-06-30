'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/lib/store';
import type { Product } from '@/lib/types';
import { Star, Heart, ShoppingCart, Scale } from 'lucide-react';
import { useProductComparison } from './ProductComparison';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  compact?: boolean;
  showDiscount?: boolean;
  className?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  compact = false,
  showDiscount = false,
  className
}) => {
  const { addToCart, isInWishlist, toggleWishlist, addToRecentlyViewed } = useApp();
  const { addToComparison, isInComparison } = useProductComparison();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [imageError, setImageError] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const calculateDiscount = () => {
    if (!product.originalPrice) return 0;
    return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsAddingToCart(true);
    try {
      addToCart(product, 1);
      // Add a small delay for UX feedback
      await new Promise(resolve => setTimeout(resolve, 500));
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  const handleProductView = () => {
    addToRecentlyViewed(product);
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              'h-4 w-4',
              star <= rating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            )}
          />
        ))}
        <span className="ml-1 text-sm text-gray-600">({product.reviewCount})</span>
      </div>
    );
  };

  const cardContent = (
    <Card className={cn(
      'group cursor-pointer transition-all duration-200 hover:shadow-lg border-0 shadow-sm',
      compact ? 'h-80' : 'h-96',
      className
    )}>
      <CardContent className="p-4 flex flex-col h-full">
        {/* Image */}
        <div className={cn(
          'relative overflow-hidden rounded-lg bg-gray-100 mb-3',
          compact ? 'h-32' : 'h-48'
        )}>
          {!imageError ? (
            <Image
              src={product.images[0]}
              alt={product.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-200"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <span className="text-gray-400 text-sm">No image</span>
            </div>
          )}

          {/* Discount Badge */}
          {showDiscount && product.originalPrice && (
            <Badge className="absolute top-2 left-2 bg-red-500 text-white">
              -{calculateDiscount()}%
            </Badge>
          )}

          {/* Stock Status */}
          {!product.inStock && (
            <Badge variant="destructive" className="absolute top-2 right-2">
              Out of Stock
            </Badge>
          )}

          {/* Wishlist Button */}
          <Button
            size="sm"
            variant="ghost"
            className="absolute top-2 right-2 h-8 w-8 p-0 bg-white/80 hover:bg-white"
            onClick={handleToggleWishlist}
          >
            <Heart
              className={cn(
                'h-4 w-4',
                isInWishlist(product.id)
                  ? 'text-red-500 fill-current'
                  : 'text-gray-600'
              )}
            />
          </Button>


        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col">
          {/* Brand */}
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
            {product.brand}
          </p>

          {/* Title */}
          <h3 className={cn(
            'font-medium text-gray-900 line-clamp-2 mb-2',
            compact ? 'text-sm' : 'text-base'
          )}>
            {product.title}
          </h3>

          {/* Rating */}
          <div className="mb-2">
            {renderStars(product.rating)}
          </div>

          {/* Seller */}
          <p className="text-xs text-gray-500 mb-2">
            by {product.seller.name}
          </p>

          {/* Price */}
          <div className="flex items-center gap-2 mb-3">
            <span className={cn(
              'font-bold text-gray-900',
              compact ? 'text-lg' : 'text-xl'
            )}>
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-gray-500 line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>

          {/* Free Shipping */}
          {product.price > 35 && (
            <p className="text-xs text-green-600 mb-3">
              Free shipping
            </p>
          )}

          {/* Actions */}
          <div className="mt-auto space-y-2">
            <Button
              className="w-full bg-orange-500 hover:bg-orange-600"
              onClick={handleAddToCart}
              disabled={!product.inStock || isAddingToCart}
              size={compact ? 'sm' : 'default'}
            >
              {isAddingToCart ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Adding...
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                </>
              )}
            </Button>

            <Button
              variant="outline"
              size={compact ? 'sm' : 'default'}
              className="w-full"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                addToComparison(product);
              }}
              disabled={isInComparison(product.id)}
            >
              <Scale className="w-4 h-4 mr-2" />
              {isInComparison(product.id) ? 'In Comparison' : 'Compare'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Link
      href={`/product/${product.id}`}
      onClick={handleProductView}
      className="block h-full"
    >
      {cardContent}
    </Link>
  );
};

export default ProductCard;
