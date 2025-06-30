'use client';

import { useState } from 'react';
import {
  Heart,
  Share2,
  Filter,
  Grid,
  List,
  Plus,
  Search,
  ShoppingCart,
  Trash2,
  Star,
  Eye,
  ArrowRight,
  SortAsc,
  Tags
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const WishlistPage = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSort, setSelectedSort] = useState('recent');

  // Mock wishlist data
  const wishlistItems = [
    {
      id: 1,
      productId: 'PROD-001',
      name: 'Wireless Headphones Pro Max',
      price: 299.99,
      originalPrice: 349.99,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop',
      category: 'Electronics',
      brand: 'TechSound',
      rating: 4.8,
      reviews: 156,
      addedDate: '2024-01-10',
      inStock: true,
      discount: 14,
      tags: ['Bluetooth', 'Noise Cancelling', 'Premium'],
      notes: 'Perfect for travel and work'
    },
    {
      id: 2,
      productId: 'PROD-002',
      name: 'Smart Fitness Watch',
      price: 199.99,
      originalPrice: 249.99,
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop',
      category: 'Wearables',
      brand: 'FitTech',
      rating: 4.6,
      reviews: 89,
      addedDate: '2024-01-08',
      inStock: true,
      discount: 20,
      tags: ['Fitness', 'Health', 'GPS'],
      notes: 'For my morning runs'
    },
    {
      id: 3,
      productId: 'PROD-003',
      name: 'Premium Coffee Maker',
      price: 159.99,
      originalPrice: 179.99,
      image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=300&h=300&fit=crop',
      category: 'Home & Kitchen',
      brand: 'BrewMaster',
      rating: 4.7,
      reviews: 234,
      addedDate: '2024-01-05',
      inStock: false,
      discount: 11,
      tags: ['Coffee', 'Kitchen', 'Appliance'],
      notes: 'Upgrade for the kitchen'
    },
    {
      id: 4,
      productId: 'PROD-004',
      name: 'Ergonomic Office Chair',
      price: 399.99,
      originalPrice: 499.99,
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=300&fit=crop',
      category: 'Furniture',
      brand: 'ComfortPlus',
      rating: 4.9,
      reviews: 67,
      addedDate: '2024-01-03',
      inStock: true,
      discount: 20,
      tags: ['Office', 'Ergonomic', 'Comfort'],
      notes: 'For home office setup'
    },
    {
      id: 5,
      productId: 'PROD-005',
      name: 'Professional Camera Lens',
      price: 899.99,
      originalPrice: 999.99,
      image: 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=300&h=300&fit=crop',
      category: 'Photography',
      brand: 'LensCraft',
      rating: 4.9,
      reviews: 45,
      addedDate: '2023-12-28',
      inStock: true,
      discount: 10,
      tags: ['Photography', 'Professional', 'Lens'],
      notes: 'For landscape photography'
    },
    {
      id: 6,
      productId: 'PROD-006',
      name: 'Wireless Gaming Mouse',
      price: 79.99,
      originalPrice: 99.99,
      image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=300&h=300&fit=crop',
      category: 'Gaming',
      brand: 'GameTech',
      rating: 4.5,
      reviews: 123,
      addedDate: '2023-12-25',
      inStock: true,
      discount: 20,
      tags: ['Gaming', 'Wireless', 'RGB'],
      notes: 'Upgrade for gaming setup'
    }
  ];

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'Electronics', label: 'Electronics' },
    { value: 'Wearables', label: 'Wearables' },
    { value: 'Home & Kitchen', label: 'Home & Kitchen' },
    { value: 'Furniture', label: 'Furniture' },
    { value: 'Photography', label: 'Photography' },
    { value: 'Gaming', label: 'Gaming' }
  ];

  const filteredItems = wishlistItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (selectedSort) {
      case 'recent':
        return new Date(b.addedDate).getTime() - new Date(a.addedDate).getTime();
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'name':
        return a.name.localeCompare(b.name);
      case 'rating':
        return b.rating - a.rating;
      default:
        return 0;
    }
  });

  const handleAddToCart = (item: typeof wishlistItems[0]) => {
    // Add to cart logic
    console.log('Adding to cart:', item.name);
  };

  const handleRemoveFromWishlist = (itemId: number) => {
    // Remove from wishlist logic
    console.log('Removing from wishlist:', itemId);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getCategoryStats = () => {
    const stats = wishlistItems.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return stats;
  };

  const categoryStats = getCategoryStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading text-primary">My Wishlist</h1>
          <p className="text-muted">Save items you love for later • {wishlistItems.length} items</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" className="btn-secondary flex items-center space-x-2">
            <Share2 className="w-4 h-4" />
            <span>Share List</span>
          </Button>
          <Button className="btn-primary flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Create List</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="minimal-card">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-primary">{wishlistItems.length}</p>
            <p className="text-sm text-muted">Total Items</p>
          </CardContent>
        </Card>

        <Card className="minimal-card">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{wishlistItems.filter(i => i.inStock).length}</p>
            <p className="text-sm text-muted">In Stock</p>
          </CardContent>
        </Card>

        <Card className="minimal-card">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-orange-600">{wishlistItems.filter(i => i.discount > 0).length}</p>
            <p className="text-sm text-muted">On Sale</p>
          </CardContent>
        </Card>

        <Card className="minimal-card">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-teal-dark">
              ${wishlistItems.reduce((sum, item) => sum + item.price, 0).toFixed(2)}
            </p>
            <p className="text-sm text-muted">Total Value</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Controls */}
      <Card className="minimal-card">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted" />
                <Input
                  placeholder="Search wishlist..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                    {category.value !== 'all' && categoryStats[category.value] && (
                      <span className="ml-2 text-xs text-muted">({categoryStats[category.value]})</span>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={selectedSort} onValueChange={setSelectedSort}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="name">Name A-Z</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
              </SelectContent>
            </Select>

            {/* View Mode */}
            <div className="flex items-center border border-gray-300 rounded-lg">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-beige-whisper' : ''}`}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-beige-whisper' : ''}`}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Wishlist Items */}
      <Card className="minimal-card">
        <CardHeader>
          <CardTitle className="text-lg font-heading text-primary">
            {selectedCategory === 'all' ? 'All Items' : categories.find(c => c.value === selectedCategory)?.label}
            ({sortedItems.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedItems.map((item) => (
                <div key={item.id} className="group border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all">
                  <div className="relative">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-48 object-cover"
                    />
                    {item.discount > 0 && (
                      <Badge className="absolute top-2 left-2 bg-red-500 text-white">
                        -{item.discount}%
                      </Badge>
                    )}
                    {!item.inStock && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="bg-white px-3 py-1 rounded text-sm font-medium">Out of Stock</span>
                      </div>
                    )}
                    <Button
                      onClick={() => handleRemoveFromWishlist(item.id)}
                      className="absolute top-2 right-2 p-2 bg-white/80 hover:bg-white rounded-full"
                      size="sm"
                      variant="ghost"
                    >
                      <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                    </Button>
                  </div>

                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="font-semibold text-primary line-clamp-2">{item.name}</h3>
                      <p className="text-sm text-muted">{item.brand}</p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm">{item.rating}</span>
                      </div>
                      <span className="text-xs text-muted">({item.reviews} reviews)</span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-bold text-teal-dark">${item.price}</span>
                        {item.originalPrice > item.price && (
                          <span className="text-sm text-muted line-through">${item.originalPrice}</span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {item.tags.slice(0, 2).map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {item.notes && (
                      <p className="text-xs text-muted italic">{item.notes}</p>
                    )}

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xs text-muted">Added {formatDate(item.addedDate)}</span>
                      <Button
                        onClick={() => handleAddToCart(item)}
                        disabled={!item.inStock}
                        size="sm"
                        className="btn-primary"
                      >
                        <ShoppingCart className="w-3 h-3 mr-1" />
                        Add to Cart
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {sortedItems.map((item) => (
                <div key={item.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-beige-whisper transition-colors">
                  <div className="relative w-20 h-20 flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    {item.discount > 0 && (
                      <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs">
                        -{item.discount}%
                      </Badge>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h3 className="font-semibold text-primary">{item.name}</h3>
                        <p className="text-sm text-muted">{item.brand} • {item.category}</p>
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm">{item.rating}</span>
                          </div>
                          <span className="text-xs text-muted">({item.reviews} reviews)</span>
                        </div>
                        {item.notes && (
                          <p className="text-xs text-muted italic">{item.notes}</p>
                        )}
                      </div>

                      <div className="text-right space-y-2">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg font-bold text-teal-dark">${item.price}</span>
                            {item.originalPrice > item.price && (
                              <span className="text-sm text-muted line-through">${item.originalPrice}</span>
                            )}
                          </div>
                          <p className="text-xs text-muted">Added {formatDate(item.addedDate)}</p>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Button
                            onClick={() => handleRemoveFromWishlist(item.id)}
                            variant="ghost"
                            size="sm"
                            className="p-2"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                          <Button
                            onClick={() => handleAddToCart(item)}
                            disabled={!item.inStock}
                            size="sm"
                            className="btn-primary"
                          >
                            <ShoppingCart className="w-3 h-3 mr-1" />
                            {item.inStock ? 'Add to Cart' : 'Out of Stock'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {sortedItems.length === 0 && (
            <div className="text-center py-12">
              <Heart className="w-12 h-12 text-muted mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-primary mb-2">No items found</h3>
              <p className="text-muted mb-4">
                {searchQuery || selectedCategory !== 'all'
                  ? 'Try adjusting your filters or search terms'
                  : 'Start adding items to your wishlist to see them here'
                }
              </p>
              <Button className="btn-primary">
                Browse Products
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WishlistPage;
