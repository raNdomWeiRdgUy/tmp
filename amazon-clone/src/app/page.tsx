'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, TrendingUp, Star, Zap, Shield, Truck, Users, Award, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ProductCard from '@/components/product/ProductCard';
import { mockProducts, featuredDeals } from '@/lib/mock-data';

// Modern Hero Section
const ModernHero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const heroSlides = [
    {
      title: "Discover Amazing Products",
      subtitle: "Shop the latest trends",
      description: "Find everything you need from trusted sellers worldwide with fast shipping and great prices",
      cta: "Shop Now",
      image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop"
    },
    {
      title: "Start Selling Today",
      subtitle: "Join our marketplace",
      description: "Reach millions of customers and grow your business with our powerful seller tools",
      cta: "Become a Seller",
      image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop"
    },
    {
      title: "Fast & Secure Delivery",
      subtitle: "We've got you covered",
      description: "Free shipping on orders over $50, secure payments, and hassle-free returns",
      cta: "Learn More",
      image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600&fit=crop"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const currentHero = heroSlides[currentSlide];

  return (
    <section className="relative bg-gradient-hero min-h-[600px] flex items-center overflow-hidden">
      <div className="hero-pattern absolute inset-0" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          {/* Content */}
          <div className="text-white animate-fade-in-up">
            <Badge className="bg-white/20 text-white mb-4 border-0">
              <TrendingUp className="w-4 h-4 mr-2" />
              Trending Now
            </Badge>

            <h1 className="text-5xl md:text-6xl font-heading mb-4 leading-tight">
              {currentHero.title}
            </h1>

            <h2 className="text-xl md:text-2xl font-medium mb-6 text-white/90">
              {currentHero.subtitle}
            </h2>

            <p className="text-lg text-white/80 mb-8 max-w-lg leading-relaxed">
              {currentHero.description}
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button className="btn-primary text-lg px-8 py-4">
                {currentHero.cta}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button className="bg-white/20 text-white border-white/30 hover:bg-white/30 text-lg px-8 py-4">
                Watch Demo
              </Button>
            </div>
          </div>

          {/* Image */}
          <div className="relative animate-slide-in-right">
            <div className="modern-card overflow-hidden">
              <img
                src={currentHero.image}
                alt={currentHero.title}
                className="w-full h-96 object-cover"
              />
            </div>
          </div>
        </div>

        {/* Slide Navigation */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-2">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide ? 'bg-white' : 'bg-white/40'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

// Featured Categories
const FeaturedCategories = () => {
  const categories = [
    {
      name: "Electronics",
      description: "Latest gadgets & tech",
      image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=300&h=200&fit=crop",
      itemCount: "15,420 products",
      color: "blue"
    },
    {
      name: "Fashion",
      description: "Trending styles",
      image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=300&h=200&fit=crop",
      itemCount: "22,830 products",
      color: "pink"
    },
    {
      name: "Home & Garden",
      description: "Beautiful spaces",
      image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=200&fit=crop",
      itemCount: "8,920 products",
      color: "green"
    },
    {
      name: "Sports & Fitness",
      description: "Stay active",
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=200&fit=crop",
      itemCount: "6,540 products",
      color: "orange"
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-heading text-gray-900 mb-4">
            Shop by Category
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover products from our most popular categories
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <Link key={category.name} href={`/category/${category.name.toLowerCase()}`}>
              <div className="modern-card group cursor-pointer">
                <div className="relative overflow-hidden rounded-t-lg">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-heading text-gray-900 mb-2">
                    {category.name}
                  </h3>
                  <p className="text-gray-600 mb-3">{category.description}</p>
                  <p className="text-sm text-gray-500">{category.itemCount}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

// Featured Products
const FeaturedProducts = () => {
  const products = mockProducts.slice(0, 8);

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Badge className="bg-gradient-primary text-white mb-4">
            <Star className="w-4 h-4 mr-2" />
            Featured Products
          </Badge>
          <h2 className="text-3xl md:text-4xl font-heading text-gray-900 mb-4">
            Best Sellers
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover our most popular products loved by customers worldwide
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product.id} className="animate-fade-in-up">
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button className="btn-primary px-8 py-3">
            View All Products
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
};

// Features Section
const FeaturesSection = () => {
  const features = [
    {
      icon: Truck,
      title: "Fast Delivery",
      description: "Free shipping on orders over $50 with tracking",
      color: "blue"
    },
    {
      icon: Shield,
      title: "Secure Payments",
      description: "Your payment information is safe with us",
      color: "green"
    },
    {
      icon: Users,
      title: "24/7 Support",
      description: "Round-the-clock customer service support",
      color: "purple"
    },
    {
      icon: Award,
      title: "Quality Guarantee",
      description: "30-day money-back guarantee on all products",
      color: "orange"
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-heading text-gray-900 mb-4">
            Why Choose Us
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We're committed to providing the best shopping experience
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={feature.title} className="text-center group">
              <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-heading text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Call to Action Section
const CTASection = () => {
  return (
    <section className="py-16 bg-gradient-primary">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="text-white">
          <h2 className="text-3xl md:text-4xl font-heading mb-4">
            Ready to Start Selling?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of successful sellers on our platform and reach millions of customers worldwide
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold">
              Start Selling Today
            </Button>
            <Button className="bg-white/20 text-white border-white/30 hover:bg-white/30 px-8 py-4 text-lg">
              Learn More
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

// Main Homepage Component
export default function ModernHomepage() {
  return (
    <div className="min-h-screen">
      <ModernHero />
      <FeaturedCategories />
      <FeaturedProducts />
      <FeaturesSection />
      <CTASection />
    </div>
  );
}
