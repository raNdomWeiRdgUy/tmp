'use client';

import { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Star,
  Package,
  TrendingUp,
  MoreHorizontal,
  Copy,
  Archive
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

const VendorProducts = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Mock product data
  const products = [
    {
      id: 'PROD-001',
      name: 'Wireless Headphones Pro',
      category: 'Electronics',
      price: '$89.99',
      stock: 45,
      status: 'active',
      sales: 156,
      rating: 4.8,
      views: 2345,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&h=100&fit=crop',
      lastUpdated: '2 hours ago'
    },
    {
      id: 'PROD-002',
      name: 'Smartphone Case Premium',
      category: 'Accessories',
      price: '$24.99',
      stock: 89,
      status: 'active',
      sales: 234,
      rating: 4.6,
      views: 1876,
      image: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=100&h=100&fit=crop',
      lastUpdated: '5 hours ago'
    },
    {
      id: 'PROD-003',
      name: 'Bluetooth Speaker Mini',
      category: 'Electronics',
      price: '$159.99',
      stock: 12,
      status: 'low_stock',
      sales: 98,
      rating: 4.9,
      views: 1654,
      image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=100&h=100&fit=crop',
      lastUpdated: '1 day ago'
    },
    {
      id: 'PROD-004',
      name: 'Power Bank 20000mAh',
      category: 'Electronics',
      price: '$34.99',
      stock: 0,
      status: 'out_of_stock',
      sales: 187,
      rating: 4.7,
      views: 987,
      image: 'https://images.unsplash.com/photo-1609592908489-2e98a094c8a4?w=100&h=100&fit=crop',
      lastUpdated: '3 days ago'
    },
    {
      id: 'PROD-005',
      name: 'USB-C Cable 3ft',
      category: 'Accessories',
      price: '$12.99',
      stock: 156,
      status: 'active',
      sales: 345,
      rating: 4.5,
      views: 765,
      image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=100&h=100&fit=crop',
      lastUpdated: '1 week ago'
    },
    {
      id: 'PROD-006',
      name: 'Wireless Mouse',
      category: 'Electronics',
      price: '$29.99',
      stock: 67,
      status: 'draft',
      sales: 0,
      rating: 0,
      views: 23,
      image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=100&h=100&fit=crop',
      lastUpdated: '2 days ago'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'low_stock': return 'bg-yellow-100 text-yellow-800';
      case 'out_of_stock': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Active';
      case 'low_stock': return 'Low Stock';
      case 'out_of_stock': return 'Out of Stock';
      case 'draft': return 'Draft';
      default: return status;
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category.toLowerCase() === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || product.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading text-primary">Product Management</h1>
          <p className="text-muted">Manage your inventory and product listings</p>
        </div>
        <Button className="btn-primary flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Add Product</span>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="minimal-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted text-sm">Total Products</p>
                <p className="text-2xl font-bold text-primary">42</p>
              </div>
              <Package className="w-8 h-8 text-teal-medium" />
            </div>
          </CardContent>
        </Card>

        <Card className="minimal-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted text-sm">Active Products</p>
                <p className="text-2xl font-bold text-primary">38</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="minimal-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted text-sm">Low Stock</p>
                <p className="text-2xl font-bold text-primary">3</p>
              </div>
              <Badge className="bg-yellow-500 text-white w-8 h-8 rounded-full flex items-center justify-center">
                !
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="minimal-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted text-sm">Out of Stock</p>
                <p className="text-2xl font-bold text-primary">1</p>
              </div>
              <Badge className="bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center">
                0
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="minimal-card">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="electronics">Electronics</SelectItem>
                <SelectItem value="accessories">Accessories</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="low_stock">Low Stock</SelectItem>
                <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" className="btn-secondary flex items-center space-x-2">
              <Filter className="w-4 h-4" />
              <span>More Filters</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card className="minimal-card">
        <CardHeader>
          <CardTitle className="text-lg font-heading text-primary">
            Products ({filteredProducts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-muted">Product</th>
                  <th className="text-left py-3 px-4 font-medium text-muted">Category</th>
                  <th className="text-left py-3 px-4 font-medium text-muted">Price</th>
                  <th className="text-left py-3 px-4 font-medium text-muted">Stock</th>
                  <th className="text-left py-3 px-4 font-medium text-muted">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-muted">Performance</th>
                  <th className="text-left py-3 px-4 font-medium text-muted">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="border-b border-gray-100 hover:bg-beige-whisper">
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div>
                          <p className="font-medium text-primary">{product.name}</p>
                          <p className="text-sm text-muted">{product.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-secondary">{product.category}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-semibold text-teal-dark">{product.price}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`font-medium ${
                        product.stock === 0 ? 'text-red-600' :
                        product.stock < 20 ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <Badge className={`text-xs ${getStatusColor(product.status)}`}>
                        {getStatusText(product.status)}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <Star className="w-3 h-3 text-yellow-500" />
                          <span className="text-sm">{product.rating || 'N/A'}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Eye className="w-3 h-3 text-blue-500" />
                          <span className="text-sm">{product.views}</span>
                        </div>
                        <div className="text-xs text-muted">{product.sales} sales</div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="p-2">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem className="flex items-center space-x-2">
                            <Eye className="w-4 h-4" />
                            <span>View</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="flex items-center space-x-2">
                            <Edit className="w-4 h-4" />
                            <span>Edit</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="flex items-center space-x-2">
                            <Copy className="w-4 h-4" />
                            <span>Duplicate</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="flex items-center space-x-2">
                            <Archive className="w-4 h-4" />
                            <span>Archive</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="flex items-center space-x-2 text-red-600">
                            <Trash2 className="w-4 h-4" />
                            <span>Delete</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorProducts;
