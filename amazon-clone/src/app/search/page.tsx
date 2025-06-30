'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import ProductCard from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { mockProducts, mockCategories } from '@/lib/mock-data';
import { Product, type SearchFilters } from '@/lib/types';
import { Filter, X, SlidersHorizontal, Star, Grid, List } from 'lucide-react';
import { cn } from '@/lib/utils';

type SortOption = 'relevance' | 'price-low' | 'price-high' | 'rating' | 'newest' | 'popularity';
type ViewMode = 'grid' | 'list';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';

  const [filters, setFilters] = useState<SearchFilters>({
    priceMin: 0,
    priceMax: 1000,
    rating: 0,
    inStock: false,
  });

  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let products = mockProducts;

    // Search filter
    if (query) {
      products = products.filter(product =>
        product.title.toLowerCase().includes(query.toLowerCase()) ||
        product.description.toLowerCase().includes(query.toLowerCase()) ||
        product.brand.toLowerCase().includes(query.toLowerCase()) ||
        product.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      );
    }

    // Category filter
    if (filters.category) {
      products = products.filter(product => product.category === filters.category);
    }

    // Price filter
    products = products.filter(product =>
      product.price >= (filters.priceMin || 0) &&
      product.price <= (filters.priceMax || 1000)
    );

    // Brand filter
    if (filters.brand) {
      products = products.filter(product => product.brand === filters.brand);
    }

    // Rating filter
    if (filters.rating && filters.rating > 0) {
      products = products.filter(product => product.rating >= filters.rating);
    }

    // Stock filter
    if (filters.inStock) {
      products = products.filter(product => product.inStock);
    }

    // Seller filter
    if (filters.seller) {
      products = products.filter(product => product.seller.name === filters.seller);
    }

    // Features filter
    if (filters.features && filters.features.length > 0) {
      products = products.filter(product =>
        filters.features!.some(feature =>
          product.features.some(pFeature =>
            pFeature.toLowerCase().includes(feature.toLowerCase())
          )
        )
      );
    }

    // Sort products
    switch (sortBy) {
      case 'price-low':
        products.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        products.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        products.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'popularity':
        products.sort((a, b) => b.reviewCount - a.reviewCount);
        break;
      default: // relevance
        // Keep original order for relevance
        break;
    }

    return products;
  }, [query, filters, sortBy]);

  // Get unique values for filters
  const availableBrands = useMemo(() => {
    const brands = new Set(mockProducts.map(p => p.brand));
    return Array.from(brands).sort();
  }, []);

  const availableSellers = useMemo(() => {
    const sellers = new Set(mockProducts.map(p => p.seller.name));
    return Array.from(sellers).sort();
  }, []);

  const availableFeatures = useMemo(() => {
    const features = new Set(mockProducts.flatMap(p => p.features));
    return Array.from(features).sort();
  }, []);

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handlePriceRangeChange = (value: number[]) => {
    setFilters(prev => ({
      ...prev,
      priceMin: value[0],
      priceMax: value[1],
    }));
  };

  const clearFilters = () => {
    setFilters({
      priceMin: 0,
      priceMax: 1000,
      rating: 0,
      inStock: false,
    });
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.category) count++;
    if (filters.brand) count++;
    if (filters.seller) count++;
    if (filters.rating && filters.rating > 0) count++;
    if (filters.inStock) count++;
    if (filters.features && filters.features.length > 0) count += filters.features.length;
    if (filters.priceMin !== 0 || filters.priceMax !== 1000) count++;
    return count;
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
      </div>
    );
  };

  const FilterSidebar = () => (
    <div className="space-y-6">
      {/* Price Range */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Price Range</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Slider
            value={[filters.priceMin || 0, filters.priceMax || 1000]}
            onValueChange={handlePriceRangeChange}
            max={1000}
            min={0}
            step={10}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-gray-600">
            <span>{formatPrice(filters.priceMin || 0)}</span>
            <span>{formatPrice(filters.priceMax || 1000)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {mockCategories.map((category) => (
              <div key={category.id} className="flex items-center space-x-2">
                <Checkbox
                  id={category.id}
                  checked={filters.category === category.id}
                  onCheckedChange={(checked) =>
                    handleFilterChange('category', checked ? category.id : undefined)
                  }
                />
                <label
                  htmlFor={category.id}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {category.name} ({category.productCount})
                </label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Brands */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Brands</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {availableBrands.slice(0, 10).map((brand) => (
              <div key={brand} className="flex items-center space-x-2">
                <Checkbox
                  id={brand}
                  checked={filters.brand === brand}
                  onCheckedChange={(checked) =>
                    handleFilterChange('brand', checked ? brand : undefined)
                  }
                />
                <label
                  htmlFor={brand}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {brand}
                </label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Customer Rating */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Customer Rating</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex items-center space-x-2">
                <Checkbox
                  id={`rating-${rating}`}
                  checked={filters.rating === rating}
                  onCheckedChange={(checked) =>
                    handleFilterChange('rating', checked ? rating : 0)
                  }
                />
                <label
                  htmlFor={`rating-${rating}`}
                  className="flex items-center space-x-1 cursor-pointer"
                >
                  {renderStars(rating)}
                  <span className="text-sm">& Up</span>
                </label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sellers */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Sellers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {availableSellers.slice(0, 5).map((seller) => (
              <div key={seller} className="flex items-center space-x-2">
                <Checkbox
                  id={seller}
                  checked={filters.seller === seller}
                  onCheckedChange={(checked) =>
                    handleFilterChange('seller', checked ? seller : undefined)
                  }
                />
                <label
                  htmlFor={seller}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {seller}
                </label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Other Options */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Availability</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="inStock"
              checked={filters.inStock}
              onCheckedChange={(checked) =>
                handleFilterChange('inStock', checked)
              }
            />
            <label
              htmlFor="inStock"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              In Stock Only
            </label>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Results Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {query ? `Search results for "${query}"` : 'All Products'}
              </h1>
              <p className="text-gray-600 mt-1">
                {filteredProducts.length} results found
              </p>
            </div>

            <div className="flex items-center gap-4">
              {/* View Mode Toggle */}
              <div className="flex border rounded-md">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>

              {/* Sort */}
              <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Best Match</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Customer Rating</SelectItem>
                  <SelectItem value="newest">Newest Arrivals</SelectItem>
                  <SelectItem value="popularity">Most Popular</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active Filters */}
          {getActiveFilterCount() > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-gray-600">Active filters:</span>

              {filters.category && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Category: {mockCategories.find(c => c.id === filters.category)?.name}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => handleFilterChange('category', undefined)}
                  />
                </Badge>
              )}

              {filters.brand && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Brand: {filters.brand}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => handleFilterChange('brand', undefined)}
                  />
                </Badge>
              )}

              {filters.rating && filters.rating > 0 && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {filters.rating}+ Stars
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => handleFilterChange('rating', 0)}
                  />
                </Badge>
              )}

              {(filters.priceMin !== 0 || filters.priceMax !== 1000) && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {formatPrice(filters.priceMin || 0)} - {formatPrice(filters.priceMax || 1000)}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => handlePriceRangeChange([0, 1000])}
                  />
                </Badge>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-orange-600 hover:text-orange-700"
              >
                Clear all
              </Button>
            </div>
          )}
        </div>

        <div className="flex gap-8">
          {/* Desktop Filters Sidebar */}
          <aside className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-4">
              <FilterSidebar />
            </div>
          </aside>

          {/* Mobile Filters */}
          <Sheet open={showMobileFilters} onOpenChange={setShowMobileFilters}>
            <SheetTrigger asChild>
              <Button variant="outline" className="lg:hidden mb-4">
                <Filter className="h-4 w-4 mr-2" />
                Filters {getActiveFilterCount() > 0 && `(${getActiveFilterCount()})`}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <FilterSidebar />
              </div>
            </SheetContent>
          </Sheet>

          {/* Products Grid/List */}
          <div className="flex-1">
            {filteredProducts.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No products found
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Try adjusting your search or filter criteria
                  </p>
                  <Button onClick={clearFilters} variant="outline">
                    Clear filters
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className={cn(
                viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                  : 'space-y-4'
              )}>
                {filteredProducts.map((product) => (
                  viewMode === 'grid' ? (
                    <ProductCard key={product.id} product={product} />
                  ) : (
                    <Card key={product.id} className="p-4">
                      <div className="flex gap-4">
                        <div className="w-32 h-32 flex-shrink-0">
                          <img
                            src={product.images[0]}
                            alt={product.title}
                            className="w-full h-full object-cover rounded-md"
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-lg mb-2 line-clamp-2">
                            {product.title}
                          </h3>
                          <div className="flex items-center gap-2 mb-2">
                            {renderStars(product.rating)}
                            <span className="text-sm text-gray-600">
                              ({product.reviewCount})
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                            {product.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-2xl font-bold text-gray-900">
                                {formatPrice(product.price)}
                              </span>
                              {product.originalPrice && (
                                <span className="text-lg text-gray-500 line-through">
                                  {formatPrice(product.originalPrice)}
                                </span>
                              )}
                            </div>
                            <Button className="bg-orange-500 hover:bg-orange-600">
                              Add to Cart
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  )
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
