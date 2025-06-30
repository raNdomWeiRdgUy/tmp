'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useApp } from '@/lib/store';
import type { Product } from '@/lib/types';
import {
  X,
  Star,
  Plus,
  ShoppingCart,
  Heart,
  Scale,
  Check,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductComparisonProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const ProductComparison: React.FC<ProductComparisonProps> = ({ isOpen, onOpenChange }) => {
  const { addToCart, toggleWishlist, isInWishlist } = useApp();
  const [comparisonProducts, setComparisonProducts] = useState<Product[]>([]);

  useEffect(() => {
    // Load comparison products from localStorage
    const saved = localStorage.getItem('amazon-clone-comparison');
    if (saved) {
      setComparisonProducts(JSON.parse(saved));
    }
  }, [isOpen]);

  const addToComparison = (product: Product) => {
    if (comparisonProducts.length >= 4) {
      return; // Max 4 products
    }

    const updated = [...comparisonProducts, product];
    setComparisonProducts(updated);
    localStorage.setItem('amazon-clone-comparison', JSON.stringify(updated));
  };

  const removeFromComparison = (productId: string) => {
    const updated = comparisonProducts.filter(p => p.id !== productId);
    setComparisonProducts(updated);
    localStorage.setItem('amazon-clone-comparison', JSON.stringify(updated));
  };

  const clearComparison = () => {
    setComparisonProducts([]);
    localStorage.removeItem('amazon-clone-comparison');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
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
        <span className="ml-1 text-sm text-gray-600">({rating})</span>
      </div>
    );
  };

  const getUniqueSpecs = () => {
    const allSpecs = new Set<string>();
    for (const product of comparisonProducts) {
      Object.keys(product.specifications).forEach(spec => allSpecs.add(spec));
    }
    return Array.from(allSpecs).sort();
  };

  const getUniqueFeatures = () => {
    const allFeatures = new Set<string>();
    for (const product of comparisonProducts) {
      product.features.forEach(feature => allFeatures.add(feature));
    }
    return Array.from(allFeatures).sort();
  };

  if (comparisonProducts.length === 0) {
    return (
      <Sheet open={isOpen} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5" />
              Product Comparison
            </SheetTitle>
          </SheetHeader>

          <div className="flex flex-col items-center justify-center h-full space-y-4">
            <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center">
              <Scale className="h-12 w-12 text-gray-400" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900">No products to compare</h3>
              <p className="text-gray-600 mt-1">Add products to compare their features and specifications</p>
            </div>
            <Button
              onClick={() => onOpenChange(false)}
              className="bg-orange-500 hover:bg-orange-600"
            >
              Continue Shopping
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full max-w-7xl overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5" />
              Compare Products ({comparisonProducts.length})
            </SheetTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={clearComparison}
            >
              Clear All
            </Button>
          </div>
        </SheetHeader>

        <div className="mt-6">
          {/* Product Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
            {comparisonProducts.map((product) => (
              <Card key={product.id} className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 h-8 w-8 p-0 z-10"
                  onClick={() => removeFromComparison(product.id)}
                >
                  <X className="h-4 w-4" />
                </Button>

                <CardContent className="p-4">
                  <div className="aspect-square mb-3 relative">
                    <Image
                      src={product.images[0]}
                      alt={product.title}
                      fill
                      className="object-cover rounded-md"
                    />
                  </div>

                  <h3 className="font-medium text-sm line-clamp-2 mb-2">
                    {product.title}
                  </h3>

                  <div className="mb-2">
                    {renderStars(product.rating)}
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg font-bold text-gray-900">
                      {formatPrice(product.price)}
                    </span>
                    {product.originalPrice && (
                      <span className="text-sm text-gray-500 line-through">
                        {formatPrice(product.originalPrice)}
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Button
                      size="sm"
                      className="w-full bg-orange-500 hover:bg-orange-600"
                      onClick={() => addToCart(product, 1)}
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Add to Cart
                    </Button>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => toggleWishlist(product.id)}
                      >
                        <Heart
                          className={cn(
                            'w-4 h-4 mr-2',
                            isInWishlist(product.id)
                              ? 'text-red-500 fill-current'
                              : 'text-gray-600'
                          )}
                        />
                        Wishlist
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="flex-1"
                      >
                        <Link href={`/product/${product.id}`}>
                          View Details
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Add More Products */}
            {comparisonProducts.length < 4 && (
              <Card className="border-dashed border-2 border-gray-300">
                <CardContent className="p-4 h-full flex flex-col items-center justify-center text-center">
                  <Plus className="h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600 mb-3">
                    Add another product to compare
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onOpenChange(false)}
                  >
                    Browse Products
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          <Separator className="my-6" />

          {/* Detailed Comparison */}
          <div className="space-y-8">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium">Feature</th>
                      {comparisonProducts.map((product) => (
                        <th key={product.id} className="text-left p-3 font-medium min-w-48">
                          {product.brand}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="p-3 font-medium">Brand</td>
                      {comparisonProducts.map((product) => (
                        <td key={product.id} className="p-3">{product.brand}</td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="p-3 font-medium">Price</td>
                      {comparisonProducts.map((product) => (
                        <td key={product.id} className="p-3">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-green-600">
                              {formatPrice(product.price)}
                            </span>
                            {product.originalPrice && (
                              <span className="text-sm text-gray-500 line-through">
                                {formatPrice(product.originalPrice)}
                              </span>
                            )}
                          </div>
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="p-3 font-medium">Rating</td>
                      {comparisonProducts.map((product) => (
                        <td key={product.id} className="p-3">
                          {renderStars(product.rating)}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="p-3 font-medium">Reviews</td>
                      {comparisonProducts.map((product) => (
                        <td key={product.id} className="p-3">{product.reviewCount} reviews</td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="p-3 font-medium">Availability</td>
                      {comparisonProducts.map((product) => (
                        <td key={product.id} className="p-3">
                          <Badge
                            variant={product.inStock ? "outline" : "destructive"}
                            className={product.inStock ? "text-green-600 border-green-600" : ""}
                          >
                            {product.inStock ? 'In Stock' : 'Out of Stock'}
                          </Badge>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Specifications */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Specifications</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium">Specification</th>
                      {comparisonProducts.map((product) => (
                        <th key={product.id} className="text-left p-3 font-medium min-w-48">
                          {product.brand}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {getUniqueSpecs().map((spec) => (
                      <tr key={spec} className="border-b">
                        <td className="p-3 font-medium">{spec}</td>
                        {comparisonProducts.map((product) => (
                          <td key={product.id} className="p-3">
                            {product.specifications[spec] || (
                              <span className="text-gray-400 flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                N/A
                              </span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Features */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Features</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium">Feature</th>
                      {comparisonProducts.map((product) => (
                        <th key={product.id} className="text-left p-3 font-medium min-w-48">
                          {product.brand}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {getUniqueFeatures().map((feature) => (
                      <tr key={feature} className="border-b">
                        <td className="p-3 font-medium">{feature}</td>
                        {comparisonProducts.map((product) => (
                          <td key={product.id} className="p-3">
                            {product.features.includes(feature) ? (
                              <Check className="h-5 w-5 text-green-600" />
                            ) : (
                              <X className="h-5 w-5 text-red-500" />
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Seller Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Seller Information</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium">Seller Info</th>
                      {comparisonProducts.map((product) => (
                        <th key={product.id} className="text-left p-3 font-medium min-w-48">
                          {product.brand}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="p-3 font-medium">Seller Name</td>
                      {comparisonProducts.map((product) => (
                        <td key={product.id} className="p-3">{product.seller.name}</td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="p-3 font-medium">Seller Rating</td>
                      {comparisonProducts.map((product) => (
                        <td key={product.id} className="p-3">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span>{product.seller.rating}</span>
                            <span className="text-sm text-gray-600">
                              ({product.seller.reviewCount})
                            </span>
                          </div>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

// Hook to use comparison functionality
export const useProductComparison = () => {
  const [comparisonProducts, setComparisonProducts] = useState<Product[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('amazon-clone-comparison');
    if (saved) {
      setComparisonProducts(JSON.parse(saved));
    }
  }, []);

  const addToComparison = (product: Product) => {
    if (comparisonProducts.length >= 4 || comparisonProducts.some(p => p.id === product.id)) {
      return false;
    }

    const updated = [...comparisonProducts, product];
    setComparisonProducts(updated);
    localStorage.setItem('amazon-clone-comparison', JSON.stringify(updated));
    return true;
  };

  const removeFromComparison = (productId: string) => {
    const updated = comparisonProducts.filter(p => p.id !== productId);
    setComparisonProducts(updated);
    localStorage.setItem('amazon-clone-comparison', JSON.stringify(updated));
  };

  const isInComparison = (productId: string) => {
    return comparisonProducts.some(p => p.id === productId);
  };

  const getComparisonCount = () => comparisonProducts.length;

  return {
    comparisonProducts,
    addToComparison,
    removeFromComparison,
    isInComparison,
    getComparisonCount,
  };
};

export default ProductComparison;
