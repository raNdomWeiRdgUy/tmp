'use client';

import { useState } from 'react';
import {
  TrendingUp,
  DollarSign,
  Package,
  ShoppingCart,
  Users,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Star,
  Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const VendorDashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('7d');

  // Mock data for analytics
  const salesData = {
    revenue: { value: '$12,450', change: '+12.5%', trend: 'up' },
    orders: { value: '148', change: '+8.2%', trend: 'up' },
    products: { value: '42', change: '+2', trend: 'up' },
    customers: { value: '89', change: '+15.3%', trend: 'up' },
    rating: { value: '4.8', change: '+0.2', trend: 'up' },
    views: { value: '2,345', change: '-5.1%', trend: 'down' }
  };

  const recentOrders = [
    { id: '#ORD-001', customer: 'Sarah Johnson', product: 'Wireless Headphones', amount: '$89.99', status: 'completed', date: '2 hours ago' },
    { id: '#ORD-002', customer: 'Mike Chen', product: 'Smartphone Case', amount: '$24.99', status: 'processing', date: '4 hours ago' },
    { id: '#ORD-003', customer: 'Emma Davis', product: 'Bluetooth Speaker', amount: '$159.99', status: 'shipped', date: '6 hours ago' },
    { id: '#ORD-004', customer: 'Alex Rodriguez', product: 'Power Bank', amount: '$34.99', status: 'pending', date: '8 hours ago' },
    { id: '#ORD-005', customer: 'Lisa Wang', product: 'USB Cable', amount: '$12.99', status: 'completed', date: '1 day ago' }
  ];

  const topProducts = [
    { name: 'Wireless Headphones Pro', sales: 45, revenue: '$3,599', trend: '+15%' },
    { name: 'Smartphone Case Premium', sales: 38, revenue: '$949', trend: '+8%' },
    { name: 'Bluetooth Speaker Mini', sales: 32, revenue: '$4,159', trend: '+22%' },
    { name: 'Power Bank 20000mAh', sales: 28, revenue: '$979', trend: '+5%' },
    { name: 'USB-C Cable 3ft', sales: 24, revenue: '$311', trend: '-2%' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading text-primary">Welcome back, John! 👋</h1>
          <p className="text-muted">Here's what's happening with your store today.</p>
        </div>
        <div className="flex items-center space-x-2">
          {['7d', '30d', '90d'].map((period) => (
            <Button
              key={period}
              variant={selectedPeriod === period ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedPeriod(period)}
              className={selectedPeriod === period ? 'btn-primary' : 'btn-secondary'}
            >
              {period === '7d' ? 'Last 7 days' : period === '30d' ? 'Last 30 days' : 'Last 90 days'}
            </Button>
          ))}
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="minimal-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-teal-medium" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{salesData.revenue.value}</div>
            <div className="flex items-center space-x-1 text-sm">
              {salesData.revenue.trend === 'up' ? (
                <ArrowUpRight className="h-3 w-3 text-green-600" />
              ) : (
                <ArrowDownRight className="h-3 w-3 text-red-600" />
              )}
              <span className={salesData.revenue.trend === 'up' ? 'text-green-600' : 'text-red-600'}>
                {salesData.revenue.change}
              </span>
              <span className="text-muted">from last week</span>
            </div>
          </CardContent>
        </Card>

        <Card className="minimal-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-teal-medium" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{salesData.orders.value}</div>
            <div className="flex items-center space-x-1 text-sm">
              <ArrowUpRight className="h-3 w-3 text-green-600" />
              <span className="text-green-600">{salesData.orders.change}</span>
              <span className="text-muted">from last week</span>
            </div>
          </CardContent>
        </Card>

        <Card className="minimal-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted">Active Products</CardTitle>
            <Package className="h-4 w-4 text-teal-medium" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{salesData.products.value}</div>
            <div className="flex items-center space-x-1 text-sm">
              <ArrowUpRight className="h-3 w-3 text-green-600" />
              <span className="text-green-600">{salesData.products.change}</span>
              <span className="text-muted">new this week</span>
            </div>
          </CardContent>
        </Card>

        <Card className="minimal-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted">Customers</CardTitle>
            <Users className="h-4 w-4 text-teal-medium" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{salesData.customers.value}</div>
            <div className="flex items-center space-x-1 text-sm">
              <ArrowUpRight className="h-3 w-3 text-green-600" />
              <span className="text-green-600">{salesData.customers.change}</span>
              <span className="text-muted">from last week</span>
            </div>
          </CardContent>
        </Card>

        <Card className="minimal-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-teal-medium" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{salesData.rating.value}</div>
            <div className="flex items-center space-x-1 text-sm">
              <ArrowUpRight className="h-3 w-3 text-green-600" />
              <span className="text-green-600">{salesData.rating.change}</span>
              <span className="text-muted">from last week</span>
            </div>
          </CardContent>
        </Card>

        <Card className="minimal-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted">Store Views</CardTitle>
            <Eye className="h-4 w-4 text-teal-medium" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{salesData.views.value}</div>
            <div className="flex items-center space-x-1 text-sm">
              <ArrowDownRight className="h-3 w-3 text-red-600" />
              <span className="text-red-600">{salesData.views.change}</span>
              <span className="text-muted">from last week</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card className="minimal-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-heading text-primary">Recent Orders</CardTitle>
            <Button variant="outline" size="sm" className="btn-secondary">
              View All
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 rounded-lg bg-beige-whisper">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-primary">{order.id}</span>
                    <Badge className={`text-xs ${getStatusColor(order.status)}`}>
                      {order.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-secondary">{order.customer}</p>
                  <p className="text-xs text-muted">{order.product}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-teal-dark">{order.amount}</p>
                  <p className="text-xs text-muted flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {order.date}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card className="minimal-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-heading text-primary">Top Products</CardTitle>
            <Button variant="outline" size="sm" className="btn-secondary">
              View All
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {topProducts.map((product, index) => (
              <div key={product.name} className="flex items-center justify-between p-3 rounded-lg bg-beige-whisper">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-teal-dark rounded-lg flex items-center justify-center text-white font-semibold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-primary">{product.name}</p>
                    <p className="text-sm text-muted">{product.sales} sales</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-teal-dark">{product.revenue}</p>
                  <p className={`text-xs ${product.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                    {product.trend}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="minimal-card">
        <CardHeader>
          <CardTitle className="text-lg font-heading text-primary">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button className="btn-primary h-12 flex items-center justify-center space-x-2">
              <Package className="w-4 h-4" />
              <span>Add Product</span>
            </Button>
            <Button className="btn-secondary h-12 flex items-center justify-center space-x-2">
              <ShoppingCart className="w-4 h-4" />
              <span>Manage Orders</span>
            </Button>
            <Button className="btn-secondary h-12 flex items-center justify-center space-x-2">
              <TrendingUp className="w-4 h-4" />
              <span>View Analytics</span>
            </Button>
            <Button className="btn-secondary h-12 flex items-center justify-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Customer Support</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorDashboard;
