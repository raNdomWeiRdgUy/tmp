'use client';

import { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useApp } from '@/lib/store';
import { mockProducts } from '@/lib/mock-data';
import { type Product, Review } from '@/lib/types';
import {
  Star,
  Heart,
  ShoppingCart,
  Minus,
  Plus,
  Share,
  Shield,
  Truck,
  RotateCcw,
  ThumbsUp,
  ThumbsDown,
  ChevronLeft,
  ChevronRight,
  Verified,
  Award,
  MapPin
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductPageProps {
  params: {
    id: string;
  };
}

export default function ProductPage({ params }: ProductPageProps) {
  const { id } = params;
  const { addToCart, isInWishlist, toggleWishlist, addToRecentlyViewed, state } = useApp();

  const [product, setProduct] = useState<Product | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 5,
    title: '',
    content: ''
  });

  useEffect(() => {
    const foundProduct = mockProducts.find(p => p.id === id);
    if (!foundProduct) {
      notFound();
    }
    setProduct(foundProduct);
    addToRecentlyViewed(foundProduct);
  }, [id, addToRecentlyViewed]);

  if (!product) {
    return <div>Loading...</div>;
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const calculateDiscount = () => {
    if (!product.originalPrice) return 0;
    return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
  };

  const handleAddToCart = async () => {
    setIsAddingToCart(true);
    try {
      addToCart(product, quantity, selectedVariants);
      await new Promise(resolve => setTimeout(resolve, 500));
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleVariantChange = (variantName: string, value: string) => {
    setSelectedVariants(prev => ({ ...prev, [variantName]: value }));
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  const renderStars = (rating: number, size = 'sm') => {
    const starSize = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              starSize,
              star <= rating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            )}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-orange-600">Home</Link>
          <span className="mx-2">/</span>
          <Link href={`/category/${product.category}`} className="hover:text-orange-600">
            {product.category}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{product.title}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square bg-white rounded-lg overflow-hidden border">
              <Image
                src={product.images[currentImageIndex]}
                alt={product.title}
                fill
                className="object-cover"
              />

              {product.images.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
                    onClick={prevImage}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
                    onClick={nextImage}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </>
              )}

              {product.originalPrice && (
                <Badge className="absolute top-4 left-4 bg-red-500 text-white">
                  -{calculateDiscount()}% OFF
                </Badge>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={cn(
                      'flex-shrink-0 w-16 h-16 rounded border-2 overflow-hidden',
                      currentImageIndex === index ? 'border-orange-500' : 'border-gray-200'
                    )}
                  >
                    <Image
                      src={image}
                      alt={`${product.title} view ${index + 1}`}
                      width={64}
                      height={64}
                      className="object-cover w-full h-full"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <p className="text-sm text-gray-500 uppercase tracking-wide mb-2">
                {product.brand}
              </p>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {product.title}
              </h1>

              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  {renderStars(product.rating, 'md')}
                  <span className="text-lg font-medium">{product.rating}</span>
                </div>
                <Link
                  href="#reviews"
                  className="text-orange-600 hover:text-orange-700 text-sm"
                >
                  ({product.reviewCount} reviews)
                </Link>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <span className="text-4xl font-bold text-gray-900">
                  {formatPrice(product.price)}
                </span>
                {product.originalPrice && (
                  <span className="text-xl text-gray-500 line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
              </div>

              <p className="text-gray-700 mb-6">{product.description}</p>
            </div>

            {/* Variants Selection */}
            {product.variants && product.variants.length > 0 && (
              <div className="space-y-4">
                {product.variants.map((variant) => (
                  <div key={variant.id}>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      {variant.name}
                    </label>
                    <Select
                      value={selectedVariants[variant.name] || ''}
                      onValueChange={(value) => handleVariantChange(variant.name, value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={`Select ${variant.name}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {variant.options.map((option) => (
                          <SelectItem
                            key={option.value}
                            value={option.value}
                            disabled={!option.inStock}
                          >
                            {option.value} {!option.inStock && '(Out of Stock)'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            )}

            {/* Quantity and Actions */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-gray-900">
                  Quantity:
                </label>
                <div className="flex items-center border rounded-md">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="px-4 py-2 min-w-[60px] text-center">
                    {quantity}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <span className="text-sm text-gray-500">
                  ({product.stockQuantity} available)
                </span>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleAddToCart}
                  disabled={!product.inStock || isAddingToCart}
                  className="flex-1 bg-orange-500 hover:bg-orange-600"
                  size="lg"
                >
                  {isAddingToCart ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      Add to Cart
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => toggleWishlist(product.id)}
                  className="px-4"
                >
                  <Heart
                    className={cn(
                      'w-5 h-5',
                      isInWishlist(product.id)
                        ? 'text-red-500 fill-current'
                        : 'text-gray-600'
                    )}
                  />
                </Button>

                <Button variant="outline" size="lg" className="px-4">
                  <Share className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Delivery Info */}
            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Truck className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium">Free Delivery</p>
                    <p className="text-sm text-gray-600">
                      {product.price > 35 ? 'Eligible for free shipping' : `Add ${formatPrice(35 - product.price)} for free shipping`}
                    </p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center gap-3">
                  <RotateCcw className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium">30-Day Returns</p>
                    <p className="text-sm text-gray-600">
                      Free returns within 30 days
                    </p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="font-medium">2-Year Warranty</p>
                    <p className="text-sm text-gray-600">
                      Manufacturer warranty included
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Seller Info */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <Award className="h-6 w-6 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium">{product.seller.name}</p>
                      <div className="flex items-center gap-2">
                        {renderStars(product.seller.rating)}
                        <span className="text-sm text-gray-600">
                          ({product.seller.reviewCount})
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Visit Store
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Product Details Tabs */}
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="specifications">Specifications</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="questions">Q&A</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Product Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Key Features</h4>
                  <ul className="space-y-2">
                    {product.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <Separator />
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-gray-700 leading-relaxed">
                    {product.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="specifications" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Technical Specifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-2 border-b last:border-b-0">
                      <span className="font-medium text-gray-900">{key}</span>
                      <span className="text-gray-700">{value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" id="reviews" className="mt-6">
            <div className="space-y-6">
              {/* Review Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Customer Reviews</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="text-center">
                      <div className="text-4xl font-bold mb-2">{product.rating}</div>
                      <div className="flex justify-center mb-2">
                        {renderStars(product.rating, 'md')}
                      </div>
                      <p className="text-gray-600">{product.reviewCount} reviews</p>
                    </div>
                    <div className="space-y-2">
                      {[5, 4, 3, 2, 1].map((stars) => {
                        const count = Math.floor(Math.random() * 50) + 10;
                        const percentage = (count / product.reviewCount) * 100;
                        return (
                          <div key={stars} className="flex items-center gap-2">
                            <span className="text-sm w-8">{stars}★</span>
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-yellow-400 h-2 rounded-full"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="text-sm text-gray-600 w-8">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Write Review */}
              {state.user && (
                <Card>
                  <CardHeader>
                    <CardTitle>Write a Review</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Rating</label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => setNewReview(prev => ({ ...prev, rating: star }))}
                            className="p-1"
                          >
                            <Star
                              className={cn(
                                'h-6 w-6',
                                star <= newReview.rating
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              )}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Title</label>
                      <Input
                        placeholder="Great product!"
                        value={newReview.title}
                        onChange={(e) => setNewReview(prev => ({ ...prev, title: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Review</label>
                      <Textarea
                        placeholder="Tell others about your experience..."
                        value={newReview.content}
                        onChange={(e) => setNewReview(prev => ({ ...prev, content: e.target.value }))}
                        rows={4}
                      />
                    </div>
                    <Button className="bg-orange-500 hover:bg-orange-600">
                      Submit Review
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Reviews List */}
              <div className="space-y-4">
                {product.reviews.map((review) => (
                  <Card key={review.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            {review.userAvatar ? (
                              <Image
                                src={review.userAvatar}
                                alt={review.userName}
                                width={40}
                                height={40}
                                className="rounded-full"
                              />
                            ) : (
                              <span className="text-sm font-medium">
                                {review.userName.charAt(0)}
                              </span>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{review.userName}</span>
                              {review.verified && (
                                <Badge variant="outline" className="text-xs">
                                  <Verified className="w-3 h-3 mr-1" />
                                  Verified Purchase
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {renderStars(review.rating)}
                              <span className="text-sm text-gray-600">
                                {new Date(review.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <h4 className="font-medium mb-2">{review.title}</h4>
                      <p className="text-gray-700 mb-4">{review.content}</p>

                      <div className="flex items-center gap-4 text-sm">
                        <button className="flex items-center gap-1 text-gray-600 hover:text-gray-900">
                          <ThumbsUp className="w-4 h-4" />
                          Helpful ({review.helpful})
                        </button>
                        <button className="flex items-center gap-1 text-gray-600 hover:text-gray-900">
                          <ThumbsDown className="w-4 h-4" />
                          Not Helpful ({review.notHelpful})
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="questions" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Questions & Answers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">No questions yet. Be the first to ask!</p>
                  <Button variant="outline">Ask a Question</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
