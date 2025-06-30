'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useApp } from '@/lib/store';
import { Package, Truck, RotateCcw, Search, Calendar, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock orders data
const mockOrders = [
  {
    id: 'order1',
    orderNumber: '#AMZ123456',
    date: new Date('2024-05-15'),
    status: 'delivered' as const,
    total: 299.99,
    items: [
      {
        id: 'item1',
        name: 'Wireless Bluetooth Headphones - Premium Sound Quality',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=200&fit=crop',
        price: 199.99,
        quantity: 1,
      },
      {
        id: 'item2',
        name: 'Premium Coffee Maker - 12-Cup Programmable',
        image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=200&h=200&fit=crop',
        price: 99.99,
        quantity: 1,
      }
    ],
    tracking: {
      number: 'TRK789012345',
      carrier: 'UPS',
      estimatedDelivery: new Date('2024-05-18'),
    }
  },
  {
    id: 'order2',
    orderNumber: '#AMZ789012',
    date: new Date('2024-05-10'),
    status: 'shipped' as const,
    total: 179.99,
    items: [
      {
        id: 'item3',
        name: 'Fitness Tracker Watch - Health & Sports Monitor',
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&h=200&fit=crop',
        price: 179.99,
        quantity: 1,
      }
    ],
    tracking: {
      number: 'TRK345678901',
      carrier: 'FedEx',
      estimatedDelivery: new Date('2024-05-12'),
    }
  },
  {
    id: 'order3',
    orderNumber: '#AMZ345678',
    date: new Date('2024-04-28'),
    status: 'processing' as const,
    total: 89.99,
    items: [
      {
        id: 'item4',
        name: 'Gaming Mechanical Keyboard - RGB Backlit',
        image: 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=200&h=200&fit=crop',
        price: 89.99,
        quantity: 1,
      }
    ],
  }
];

const statusConfig = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: Package },
  confirmed: { label: 'Confirmed', color: 'bg-blue-100 text-blue-800', icon: Package },
  processing: { label: 'Processing', color: 'bg-purple-100 text-purple-800', icon: Package },
  shipped: { label: 'Shipped', color: 'bg-orange-100 text-orange-800', icon: Truck },
  delivered: { label: 'Delivered', color: 'bg-green-100 text-green-800', icon: Package },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: Package },
  returned: { label: 'Returned', color: 'bg-gray-100 text-gray-800', icon: RotateCcw },
};

export default function OrdersPage() {
  const { state } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('all');

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const filteredOrders = mockOrders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.items.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

    let matchesTime = true;
    if (timeFilter === '30days') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      matchesTime = order.date >= thirtyDaysAgo;
    } else if (timeFilter === '3months') {
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      matchesTime = order.date >= threeMonthsAgo;
    }

    return matchesSearch && matchesStatus && matchesTime;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Your Orders</h2>
          <p className="text-gray-600 mt-1">
            Track packages, review purchases, and buy items again
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search orders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Order Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Orders</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Time Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="30days">Last 30 Days</SelectItem>
                <SelectItem value="3months">Last 3 Months</SelectItem>
                <SelectItem value="6months">Last 6 Months</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery || statusFilter !== 'all' || timeFilter !== 'all'
                ? 'Try adjusting your filters to find more orders.'
                : "You haven't placed any orders yet."}
            </p>
            <Button asChild className="bg-orange-500 hover:bg-orange-600">
              <Link href="/">Start Shopping</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const statusInfo = statusConfig[order.status];
            const StatusIcon = statusInfo.icon;

            return (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-4 mb-2">
                        <h3 className="text-lg font-semibold">{order.orderNumber}</h3>
                        <Badge className={cn('px-2 py-1', statusInfo.color)}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusInfo.label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Ordered {order.date.toLocaleDateString()}
                        </span>
                        <span>Total: {formatPrice(order.total)}</span>
                        {order.tracking && (
                          <span>Tracking: {order.tracking.number}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {order.status === 'delivered' && (
                        <Button variant="outline" size="sm">
                          <Star className="w-4 h-4 mr-2" />
                          Review
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                      {order.tracking && (
                        <Button variant="outline" size="sm">
                          <Truck className="w-4 h-4 mr-2" />
                          Track Package
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="grid gap-4">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={80}
                          height={80}
                          className="object-cover rounded-md"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium line-clamp-2">{item.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            Qty: {item.quantity} • {formatPrice(item.price)}
                          </p>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button size="sm" variant="outline">
                            Buy Again
                          </Button>
                          {order.status === 'delivered' && (
                            <Button size="sm" variant="outline">
                              Return
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {order.tracking && order.status === 'shipped' && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-blue-900">Package is on the way!</p>
                          <p className="text-sm text-blue-700">
                            Estimated delivery: {order.tracking.estimatedDelivery?.toLocaleDateString()}
                          </p>
                        </div>
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                          Track Package
                        </Button>
                      </div>
                    </div>
                  )}

                  {order.status === 'delivered' && (
                    <div className="mt-4 p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-green-900">Order delivered!</p>
                          <p className="text-sm text-green-700">
                            How was your shopping experience?
                          </p>
                        </div>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          <Star className="w-4 h-4 mr-2" />
                          Write Review
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {mockOrders.length}
              </div>
              <div className="text-sm text-gray-600">Total Orders</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {mockOrders.filter(o => o.status === 'delivered').length}
              </div>
              <div className="text-sm text-gray-600">Delivered</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {mockOrders.filter(o => o.status === 'shipped').length}
              </div>
              <div className="text-sm text-gray-600">In Transit</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {mockOrders.filter(o => o.status === 'processing').length}
              </div>
              <div className="text-sm text-gray-600">Processing</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
