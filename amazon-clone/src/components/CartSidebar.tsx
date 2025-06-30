'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useApp } from '@/lib/store';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';

interface CartSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CartSidebar: React.FC<CartSidebarProps> = ({ open, onOpenChange }) => {
  const { state, removeFromCart, updateCartQuantity } = useApp();
  const { cart } = state;

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
    } else {
      updateCartQuantity(productId, newQuantity);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  if (cart.items.length === 0) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              Shopping Cart
            </SheetTitle>
          </SheetHeader>

          <div className="flex flex-col items-center justify-center h-full space-y-4">
            <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center">
              <ShoppingBag className="h-12 w-12 text-gray-400" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900">Your cart is empty</h3>
              <p className="text-gray-600 mt-1">Add some products to get started</p>
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
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col h-full">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Shopping Cart ({cart.items.length} items)
          </SheetTitle>
        </SheetHeader>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto space-y-4 py-4">
          {cart.items.map((item) => (
            <div key={item.productId} className="flex gap-4 p-4 border rounded-lg">
              <div className="relative w-20 h-20 flex-shrink-0">
                <Image
                  src={item.product.images[0]}
                  alt={item.product.title}
                  fill
                  className="object-cover rounded-md"
                />
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm line-clamp-2 text-gray-900">
                  {item.product.title}
                </h4>

                {item.selectedVariants && (
                  <div className="mt-1 space-y-1">
                    {Object.entries(item.selectedVariants).map(([key, value]) => (
                      <div key={key} className="text-xs text-gray-600">
                        {key}: {value}
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">
                      {formatPrice(item.product.price)}
                    </span>
                    {item.product.originalPrice && (
                      <span className="text-sm text-gray-500 line-through">
                        {formatPrice(item.product.originalPrice)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 w-8 p-0"
                      onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>

                    <span className="text-sm font-medium w-8 text-center">
                      {item.quantity}
                    </span>

                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 w-8 p-0"
                      onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm font-semibold text-gray-900">
                    Subtotal: {formatPrice(item.product.price * item.quantity)}
                  </span>

                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1"
                    onClick={() => removeFromCart(item.productId)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Cart Summary */}
        <div className="border-t pt-4 space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span>{formatPrice(cart.subtotal)}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span>Shipping:</span>
              <span>
                {cart.shipping === 0 ? (
                  <span className="text-green-600">FREE</span>
                ) : (
                  formatPrice(cart.shipping)
                )}
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span>Tax:</span>
              <span>{formatPrice(cart.tax)}</span>
            </div>

            <Separator />

            <div className="flex justify-between font-semibold text-lg">
              <span>Total:</span>
              <span>{formatPrice(cart.total)}</span>
            </div>
          </div>

          {cart.shipping > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                Add {formatPrice(35 - cart.subtotal)} more to get FREE shipping!
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Button
              className="w-full bg-orange-500 hover:bg-orange-600"
              onClick={() => {
                onOpenChange(false);
                // Navigate to checkout would go here
              }}
            >
              Proceed to Checkout
            </Button>

            <Button
              variant="outline"
              className="w-full"
              asChild
            >
              <Link href="/cart" onClick={() => onOpenChange(false)}>
                View Full Cart
              </Link>
            </Button>
          </div>

          <div className="text-center">
            <Button
              variant="ghost"
              className="text-sm text-gray-600 hover:text-gray-900"
              onClick={() => onOpenChange(false)}
            >
              Continue Shopping
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CartSidebar;
