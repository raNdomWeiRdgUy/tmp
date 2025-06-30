'use client';

import { useState } from 'react';
import {
  Package,
  Search,
  Filter,
  Eye,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  User,
  Calendar,
  DollarSign,
  MoreHorizontal,
  Download,
  MessageSquare
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const VendorOrders = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedTimeframe, setSelectedTimeframe] = useState('all');

  // Mock order data
  const orders = [
    {
      id: 'ORD-2024-001',
      customer: {
        name: 'Sarah Johnson',
        email: 'sarah.j@email.com',
        avatar: 'SJ'
      },
      items: [
        { name: 'Wireless Headphones Pro', quantity: 1, price: 89.99 }
      ],
      total: 89.99,
      status: 'completed',
      priority: 'normal',
      orderDate: '2024-01-15T10:30:00',
      shippedDate: '2024-01-16T14:20:00',
      deliveredDate: '2024-01-18T16:45:00',
      shippingAddress: '123 Main St, New York, NY 10001',
      paymentMethod: 'Credit Card',
      notes: 'Customer requested expedited shipping'
    },
    {
      id: 'ORD-2024-002',
      customer: {
        name: 'Mike Chen',
        email: 'mike.chen@email.com',
        avatar: 'MC'
      },
      items: [
        { name: 'Smartphone Case Premium', quantity: 2, price: 24.99 },
        { name: 'USB-C Cable 3ft', quantity: 1, price: 12.99 }
      ],
      total: 62.97,
      status: 'processing',
      priority: 'high',
      orderDate: '2024-01-14T16:45:00',
      shippingAddress: '456 Oak Ave, Los Angeles, CA 90210',
      paymentMethod: 'PayPal',
      notes: 'Gift wrapping requested'
    },
    {
      id: 'ORD-2024-003',
      customer: {
        name: 'Emma Davis',
        email: 'emma.davis@email.com',
        avatar: 'ED'
      },
      items: [
        { name: 'Bluetooth Speaker Mini', quantity: 1, price: 159.99 }
      ],
      total: 159.99,
      status: 'shipped',
      priority: 'normal',
      orderDate: '2024-01-13T09:15:00',
      shippedDate: '2024-01-14T11:30:00',
      trackingNumber: 'TRK123456789',
      shippingAddress: '789 Pine St, Chicago, IL 60601',
      paymentMethod: 'Credit Card'
    },
    {
      id: 'ORD-2024-004',
      customer: {
        name: 'Alex Rodriguez',
        email: 'alex.r@email.com',
        avatar: 'AR'
      },
      items: [
        { name: 'Power Bank 20000mAh', quantity: 1, price: 34.99 }
      ],
      total: 34.99,
      status: 'pending',
      priority: 'urgent',
      orderDate: '2024-01-12T14:20:00',
      shippingAddress: '321 Elm St, Miami, FL 33101',
      paymentMethod: 'Credit Card',
      notes: 'Customer requested color change - need to confirm availability'
    },
    {
      id: 'ORD-2024-005',
      customer: {
        name: 'Lisa Wang',
        email: 'lisa.wang@email.com',
        avatar: 'LW'
      },
      items: [
        { name: 'USB-C Cable 3ft', quantity: 3, price: 12.99 }
      ],
      total: 38.97,
      status: 'cancelled',
      priority: 'normal',
      orderDate: '2024-01-11T11:45:00',
      cancelledDate: '2024-01-12T09:30:00',
      shippingAddress: '654 Maple Dr, Seattle, WA 98101',
      paymentMethod: 'PayPal',
      notes: 'Customer requested cancellation due to change of mind'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'processing': return <Clock className="w-4 h-4" />;
      case 'shipped': return <Truck className="w-4 h-4" />;
      case 'pending': return <AlertCircle className="w-4 h-4" />;
      case 'cancelled': return <AlertCircle className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'normal': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const orderStats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => o.status === 'processing').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    completed: orders.filter(o => o.status === 'completed').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading text-primary">Order Management</h1>
          <p className="text-muted">Track and manage your customer orders</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" className="btn-secondary flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </Button>
          <Button className="btn-primary flex items-center space-x-2">
            <Package className="w-4 h-4" />
            <span>Bulk Actions</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="minimal-card">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-primary">{orderStats.total}</p>
            <p className="text-sm text-muted">Total Orders</p>
          </CardContent>
        </Card>

        <Card className="minimal-card">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-yellow-600">{orderStats.pending}</p>
            <p className="text-sm text-muted">Pending</p>
          </CardContent>
        </Card>

        <Card className="minimal-card">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{orderStats.processing}</p>
            <p className="text-sm text-muted">Processing</p>
          </CardContent>
        </Card>

        <Card className="minimal-card">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-purple-600">{orderStats.shipped}</p>
            <p className="text-sm text-muted">Shipped</p>
          </CardContent>
        </Card>

        <Card className="minimal-card">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{orderStats.completed}</p>
            <p className="text-sm text-muted">Completed</p>
          </CardContent>
        </Card>

        <Card className="minimal-card">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-red-600">{orderStats.cancelled}</p>
            <p className="text-sm text-muted">Cancelled</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="minimal-card">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted" />
                <Input
                  placeholder="Search orders or customers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <Card className="minimal-card">
        <CardHeader>
          <CardTitle className="text-lg font-heading text-primary">
            Orders ({filteredOrders.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div key={order.id} className="border border-gray-200 rounded-lg p-4 hover:bg-beige-whisper transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Order Info */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="font-semibold text-primary">{order.id}</span>
                      <Badge className={`text-xs flex items-center space-x-1 ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span className="capitalize">{order.status}</span>
                      </Badge>
                      <span className={`text-xs font-medium ${getPriorityColor(order.priority)}`}>
                        {order.priority.toUpperCase()}
                      </span>
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-secondary mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-beige-medium rounded-full flex items-center justify-center text-white text-xs">
                          {order.customer.avatar}
                        </div>
                        <span>{order.customer.name}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(order.orderDate)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <DollarSign className="w-3 h-3" />
                        <span className="font-semibold">${order.total}</span>
                      </div>
                    </div>

                    <div className="text-sm text-muted">
                      {order.items.map((item, index) => (
                        <span key={index}>
                          {item.quantity}x {item.name}
                          {index < order.items.length - 1 && ', '}
                        </span>
                      ))}
                    </div>

                    {order.notes && (
                      <div className="mt-2 text-xs text-orange-600 bg-orange-50 p-2 rounded">
                        <MessageSquare className="w-3 h-3 inline mr-1" />
                        {order.notes}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" className="btn-secondary">
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>

                    {order.status === 'pending' && (
                      <Button size="sm" className="btn-primary">
                        Process
                      </Button>
                    )}

                    {order.status === 'processing' && (
                      <Button size="sm" className="btn-primary">
                        Ship
                      </Button>
                    )}

                    {order.trackingNumber && (
                      <Button variant="outline" size="sm" className="btn-secondary">
                        <Truck className="w-4 h-4 mr-1" />
                        Track
                      </Button>
                    )}

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="p-2">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Contact Customer
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="w-4 h-4 mr-2" />
                          Print Invoice
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {order.status !== 'cancelled' && order.status !== 'completed' && (
                          <DropdownMenuItem className="text-red-600">
                            <AlertCircle className="w-4 h-4 mr-2" />
                            Cancel Order
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorOrders;
