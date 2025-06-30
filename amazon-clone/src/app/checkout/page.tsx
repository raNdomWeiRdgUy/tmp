'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/lib/store';
import type { Address, PaymentMethod } from '@/lib/types';
import {
  Lock,
  Truck,
  MapPin,
  CreditCard,
  Check,
  ArrowLeft,
  Shield
} from 'lucide-react';

type CheckoutStep = 'shipping' | 'payment' | 'review' | 'complete';

export default function CheckoutPage() {
  const router = useRouter();
  const { state, clearCart } = useApp();
  const { cart, user } = state;

  const [currentStep, setCurrentStep] = useState<CheckoutStep>('shipping');
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(
    user?.addresses.find(addr => addr.isDefault) || null
  );
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | null>(
    user?.paymentMethods.find(pm => pm.isDefault) || null
  );
  const [deliveryOption, setDeliveryOption] = useState('standard');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }
    if (cart.items.length === 0) {
      router.push('/cart');
      return;
    }
  }, [user, cart, router]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const deliveryOptions = [
    {
      id: 'standard',
      name: 'Standard Delivery',
      description: '5-7 business days',
      price: cart.subtotal > 35 ? 0 : 5.99,
    },
    {
      id: 'express',
      name: 'Express Delivery',
      description: '2-3 business days',
      price: 12.99,
    },
    {
      id: 'overnight',
      name: 'Overnight Delivery',
      description: 'Next business day',
      price: 24.99,
    },
  ];

  const selectedDeliveryPrice = deliveryOptions.find(opt => opt.id === deliveryOption)?.price || 0;
  const finalTotal = cart.subtotal + cart.tax + selectedDeliveryPrice;

  const handlePlaceOrder = async () => {
    if (!selectedAddress || !selectedPayment) return;

    setIsProcessing(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      clearCart();
      setCurrentStep('complete');
    } catch (error) {
      console.error('Order processing failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const steps = [
    { id: 'shipping', name: 'Shipping Address', icon: MapPin },
    { id: 'payment', name: 'Payment Method', icon: CreditCard },
    { id: 'review', name: 'Review Order', icon: Check },
  ];

  if (!user || cart.items.length === 0) {
    return <div>Loading...</div>;
  }

  if (currentStep === 'complete') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Card className="text-center">
            <CardContent className="p-8">
              <div className="w-16 h-16 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
              <p className="text-gray-600 mb-6">
                Thank you for your order. We'll send you a confirmation email shortly.
              </p>
              <div className="space-y-3 mb-8">
                <p className="text-sm text-gray-600">
                  <strong>Order Number:</strong> #AMZ{Math.random().toString().slice(2, 8)}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Total:</strong> {formatPrice(finalTotal)}
                </p>
              </div>
              <div className="flex gap-4 justify-center">
                <Button onClick={() => router.push('/')} className="bg-orange-500 hover:bg-orange-600">
                  Continue Shopping
                </Button>
                <Button variant="outline" onClick={() => router.push('/account/orders')}>
                  View Orders
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/cart')}
            className="text-orange-600 hover:text-orange-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Cart
          </Button>
        </div>

        {/* Simplified checkout for demo */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Checkout</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Order Items */}
                <div>
                  <h3 className="font-medium mb-3">Items in your order:</h3>
                  <div className="space-y-4">
                    {cart.items.map((item) => (
                      <div key={item.productId} className="flex gap-4 p-4 border rounded-lg">
                        <Image
                          src={item.product.images[0]}
                          alt={item.product.title}
                          width={80}
                          height={80}
                          className="object-cover rounded"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium">{item.product.title}</h4>
                          <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatPrice(item.product.price)}</p>
                          <p className="text-sm text-gray-600">
                            Total: {formatPrice(item.product.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Shipping Info */}
                <div>
                  <h3 className="font-medium mb-3">Shipping Address:</h3>
                  <div className="p-4 border rounded-lg">
                    <p className="font-medium">{user.firstName} {user.lastName}</p>
                    <p className="text-gray-600">
                      {user.addresses[0]?.address1 || '123 Main St'}<br />
                      {user.addresses[0]?.city || 'New York'}, {user.addresses[0]?.state || 'NY'} {user.addresses[0]?.zipCode || '10001'}
                    </p>
                  </div>
                </div>

                {/* Payment Info */}
                <div>
                  <h3 className="font-medium mb-3">Payment Method:</h3>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      <span>Visa ending in 4242</span>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handlePlaceOrder}
                  disabled={isProcessing}
                  className="w-full bg-orange-500 hover:bg-orange-600"
                  size="lg"
                >
                  <Lock className="w-4 h-4 mr-2" />
                  {isProcessing ? 'Processing...' : 'Place Order'}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Items ({cart.items.length}):</span>
                    <span>{formatPrice(cart.subtotal)}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span>Shipping & handling:</span>
                    <span>{formatPrice(cart.shipping)}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span>Tax:</span>
                    <span>{formatPrice(cart.tax)}</span>
                  </div>

                  <Separator />

                  <div className="flex justify-between font-bold text-lg text-red-600">
                    <span>Order total:</span>
                    <span>{formatPrice(cart.total)}</span>
                  </div>
                </div>

                <div className="pt-4 border-t text-center">
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                    <Shield className="h-4 w-4" />
                    <span>Secure checkout</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
