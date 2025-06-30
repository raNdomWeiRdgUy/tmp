'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/lib/store';
import {
  Minus,
  Plus,
  Trash2,
  Heart,
  Share,
  ShoppingBag,
  Truck,
  Shield,
  RotateCcw,
  ArrowLeft,
  Lock
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function CartPage() {
  const router = useRouter();
  const { state, removeFromCart, updateCartQuantity, clearCart, toggleWishlist, isInWishlist } = useApp();
  const { cart } = state;

  const [selectedItems, setSelectedItems] = useState<Set<string>>(
    new Set(cart.items.map(item => item.productId))
  );
  const [saveForLater, setSaveForLater] = useState<string[]>([]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      setSelectedItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    } else {
      updateCartQuantity(productId, newQuantity);
    }
  };

  const handleSelectItem = (productId: string, selected: boolean) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(productId);
      } else {
        newSet.delete(productId);
      }
      return newSet;
    });
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedItems(new Set(cart.items.map(item => item.productId)));
    } else {
      setSelectedItems(new Set());
    }
  };

  const handleSaveForLater = (productId: string) => {
    setSaveForLater(prev => [...prev, productId]);
    removeFromCart(productId);
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      newSet.delete(productId);
      return newSet;
    });
  };

  const handleMoveToCart = (productId: string) => {
    setSaveForLater(prev => prev.filter(id => id !== productId));
    // In a real app, you'd add the item back to cart
  };

  const selectedItemsCount = selectedItems.size;
  const selectedSubtotal = cart.items
    .filter(item => selectedItems.has(item.productId))
    .reduce((total, item) => total + (item.product.price * item.quantity), 0);

  const selectedTax = selectedSubtotal * 0.08;
  const selectedShipping = selectedSubtotal > 35 ? 0 : 5.99;
  const selectedTotal = selectedSubtotal + selectedTax + selectedShipping;

  const handleProceedToCheckout = () => {
    if (selectedItems.size === 0) return;
    router.push('/checkout');
  };

  if (cart.items.length === 0 && saveForLater.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                <ShoppingBag className="h-12 w-12 text-gray-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
              <p className="text-gray-600 mb-6">
                Looks like you haven't added any items to your cart yet.
              </p>
              <Button
                onClick={() => router.push('/')}
                className="bg-orange-500 hover:bg-orange-600"
              >
                Continue Shopping
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back to Shopping */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="text-orange-600 hover:text-orange-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Continue Shopping
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl">Shopping Cart</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="select-all"
                      checked={selectedItems.size === cart.items.length && cart.items.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                    <label htmlFor="select-all" className="text-sm cursor-pointer">
                      Select all items
                    </label>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {cart.items.map((item) => (
                  <div key={item.productId} className="border-b pb-6 last:border-b-0">
                    <div className="flex gap-4">
                      <div className="flex items-start">
                        <Checkbox
                          checked={selectedItems.has(item.productId)}
                          onCheckedChange={(checked) =>
                            handleSelectItem(item.productId, checked === true)
                          }
                        />
                      </div>

                      <div className="relative w-32 h-32 flex-shrink-0">
                        <Image
                          src={item.product.images[0]}
                          alt={item.product.title}
                          fill
                          className="object-cover rounded-md"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between">
                          <div className="flex-1">
                            <Link
                              href={`/product/${item.product.id}`}
                              className="text-lg font-medium text-gray-900 hover:text-orange-600 line-clamp-2"
                            >
                              {item.product.title}
                            </Link>

                            <p className="text-sm text-gray-500 mt-1">
                              by {item.product.seller.name}
                            </p>

                            {item.selectedVariants && (
                              <div className="mt-2 space-y-1">
                                {Object.entries(item.selectedVariants).map(([key, value]) => (
                                  <p key={key} className="text-sm text-gray-600">
                                    <span className="font-medium">{key}:</span> {value}
                                  </p>
                                ))}
                              </div>
                            )}

                            <div className="flex items-center gap-2 mt-2">
                              {item.product.inStock ? (
                                <Badge variant="outline" className="text-green-600 border-green-600">
                                  In Stock
                                </Badge>
                              ) : (
                                <Badge variant="destructive">
                                  Out of Stock
                                </Badge>
                              )}

                              {item.product.price > 35 && (
                                <Badge variant="outline" className="text-green-600 border-green-600">
                                  FREE Shipping
                                </Badge>
                              )}
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-2xl font-bold text-gray-900">
                                {formatPrice(item.product.price)}
                              </span>
                              {item.product.originalPrice && (
                                <span className="text-lg text-gray-500 line-through">
                                  {formatPrice(item.product.originalPrice)}
                                </span>
                              )}
                            </div>

                            <p className="text-sm text-gray-600">
                              Subtotal: {formatPrice(item.product.price * item.quantity)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center gap-4">
                            {/* Quantity Controls */}
                            <div className="flex items-center border rounded-md">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                                className="px-3"
                                disabled={!item.product.inStock}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>

                              <Select
                                value={item.quantity.toString()}
                                onValueChange={(value) =>
                                  handleQuantityChange(item.productId, Number.parseInt(value))
                                }
                                disabled={!item.product.inStock}
                              >
                                <SelectTrigger className="w-20 border-0 h-auto">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {Array.from({ length: Math.min(10, item.product.stockQuantity) }, (_, i) => (
                                    <SelectItem key={i + 1} value={(i + 1).toString()}>
                                      {i + 1}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>

                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                                className="px-3"
                                disabled={!item.product.inStock || item.quantity >= item.product.stockQuantity}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFromCart(item.productId)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSaveForLater(item.productId)}
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            >
                              Save for later
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleWishlist(item.product.id)}
                              className="text-gray-600 hover:text-gray-700"
                            >
                              <Heart
                                className={cn(
                                  'h-4 w-4',
                                  isInWishlist(item.product.id)
                                    ? 'text-red-500 fill-current'
                                    : 'text-gray-600'
                                )}
                              />
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-gray-600 hover:text-gray-700"
                            >
                              <Share className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {cart.items.length > 1 && (
                  <div className="flex justify-between items-center pt-4 border-t">
                    <div className="text-sm text-gray-600">
                      {selectedItemsCount} of {cart.items.length} items selected
                    </div>
                    <Button
                      variant="outline"
                      onClick={clearCart}
                      className="text-red-600 border-red-600 hover:bg-red-50"
                    >
                      Clear Cart
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Saved for Later */}
            {saveForLater.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Saved for Later ({saveForLater.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {saveForLater.map((productId) => {
                      const savedProduct = cart.items.find(item => item.productId === productId)?.product;
                      if (!savedProduct) return null;

                      return (
                        <div key={productId} className="border rounded-lg p-3">
                          <div className="aspect-square mb-2">
                            <Image
                              src={savedProduct.images[0]}
                              alt={savedProduct.title}
                              width={120}
                              height={120}
                              className="object-cover rounded w-full h-full"
                            />
                          </div>
                          <h4 className="font-medium text-sm line-clamp-2 mb-2">
                            {savedProduct.title}
                          </h4>
                          <p className="font-bold text-lg mb-2">
                            {formatPrice(savedProduct.price)}
                          </p>
                          <Button
                            size="sm"
                            onClick={() => handleMoveToCart(productId)}
                            className="w-full bg-orange-500 hover:bg-orange-600"
                          >
                            Move to Cart
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Items ({selectedItemsCount}):</span>
                    <span>{formatPrice(selectedSubtotal)}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span>Shipping & handling:</span>
                    <span>
                      {selectedShipping === 0 ? (
                        <span className="text-green-600">FREE</span>
                      ) : (
                        formatPrice(selectedShipping)
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span>Total before tax:</span>
                    <span>{formatPrice(selectedSubtotal + selectedShipping)}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span>Estimated tax:</span>
                    <span>{formatPrice(selectedTax)}</span>
                  </div>

                  <Separator />

                  <div className="flex justify-between font-bold text-lg text-red-600">
                    <span>Order total:</span>
                    <span>{formatPrice(selectedTotal)}</span>
                  </div>
                </div>

                {selectedShipping > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-sm text-yellow-800">
                      Add {formatPrice(35 - selectedSubtotal)} more to get FREE shipping!
                    </p>
                  </div>
                )}

                <Button
                  onClick={handleProceedToCheckout}
                  disabled={selectedItems.size === 0}
                  className="w-full bg-orange-500 hover:bg-orange-600"
                  size="lg"
                >
                  <Lock className="w-4 h-4 mr-2" />
                  Proceed to Checkout
                </Button>

                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-green-600" />
                    <span>Free shipping on orders over $35</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <RotateCcw className="h-4 w-4 text-blue-600" />
                    <span>30-day return policy</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-purple-600" />
                    <span>Secure checkout</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recently Viewed */}
            {state.recentlyViewed.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Recently Viewed</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {state.recentlyViewed.slice(0, 3).map((product) => (
                      <Link
                        key={product.id}
                        href={`/product/${product.id}`}
                        className="flex gap-3 p-2 rounded hover:bg-gray-50"
                      >
                        <Image
                          src={product.images[0]}
                          alt={product.title}
                          width={60}
                          height={60}
                          className="object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm line-clamp-2">
                            {product.title}
                          </h4>
                          <p className="text-orange-600 font-bold">
                            {formatPrice(product.price)}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
