'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Crown, Star, Diamond, Sparkles, TrendingUp, Gift, Zap, ShoppingBag, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ProductCard from '@/components/product/ProductCard';
import { useProducts } from '@/hooks/useProducts';

// Hero Section Component
const LuxuryHero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const heroSlides = [
    {
      title: "Curated Luxury",
      subtitle: "Experience the extraordinary",
      description: "Discover handpicked premium collections from the world's most exclusive brands",
      cta: "Explore Collections",
      accent: "emerald",
      pattern: "dots"
    },
    {
      title: "Exclusive Boutiques",
      subtitle: "Premium marketplace reimagined",
      description: "Access limited-edition pieces and bespoke creations from luxury artisans",
      cta: "Browse Boutiques",
      accent: "champagne",
      pattern: "lines"
    },
    {
      title: "Elevated Experiences",
      subtitle: "Beyond ordinary shopping",
      description: "Personalized service, white-glove delivery, and lifetime concierge support",
      cta: "Join Premium",
      accent: "rose-gold",
      pattern: "dots"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const currentHero = heroSlides[currentSlide];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Dynamic Background Patterns */}
      <div className={`absolute inset-0 ${currentHero.pattern === 'dots' ? 'pattern-dots' : 'pattern-lines'} opacity-20`} />

      {/* Animated Background Gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-deep/20 via-platinum-dark/30 to-champagne-dark/20 animate-pulse" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto">

          {/* Premium Badge */}
          <div className="inline-flex items-center space-x-2 luxury-card px-6 py-3 mb-8 animate-float">
            <Crown className="w-5 h-5 text-champagne-light" />
            <span className="text-sm font-premium text-white/90">Exclusively Curated</span>
            <Sparkles className="w-4 h-4 text-emerald-light animate-glow" />
          </div>

          {/* Main Heading */}
          <h1 className="text-6xl md:text-8xl font-luxury text-luxury mb-6 leading-tight">
            {currentHero.title}
          </h1>

          {/* Subtitle */}
          <h2 className="text-xl md:text-2xl font-premium text-champagne-gradient mb-4">
            {currentHero.subtitle}
          </h2>

          {/* Description */}
          <p className="text-lg md:text-xl text-white/70 font-elegant mb-12 max-w-2xl mx-auto leading-relaxed">
            {currentHero.description}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Button className="btn-luxury px-12 py-4 text-lg group">
              {currentHero.cta}
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button className="btn-ghost px-8 py-4 text-lg">
              Watch Story
            </Button>
          </div>

          {/* Slide Indicators */}
          <div className="flex items-center justify-center space-x-3 mt-16">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-12 h-1 rounded-full transition-all duration-500 ${
                  index === currentSlide
                    ? 'bg-gradient-to-r from-emerald-light to-champagne-light'
                    : 'bg-white/20 hover:bg-white/40'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 left-20 animate-float" style={{ animationDelay: '1s' }}>
        <Diamond className="w-8 h-8 text-emerald-light/30" />
      </div>
      <div className="absolute bottom-32 right-16 animate-float" style={{ animationDelay: '2s' }}>
        <Star className="w-6 h-6 text-champagne-light/40" />
      </div>
      <div className="absolute top-1/3 right-32 animate-float" style={{ animationDelay: '3s' }}>
        <Sparkles className="w-10 h-10 text-rose-gold-light/20" />
      </div>
    </section>
  );
};

// Premium Categories Section
const LuxuryCategories = () => {
  const categories = [
    {
      name: "Fine Jewelry",
      description: "Handcrafted excellence",
      image: "/api/placeholder/400/500",
      icon: Diamond,
      gradient: "emerald",
      items: "2,847 pieces"
    },
    {
      name: "Designer Fashion",
      description: "Couture collections",
      image: "/api/placeholder/400/500",
      icon: Sparkles,
      gradient: "champagne",
      items: "5,234 items"
    },
    {
      name: "Luxury Watches",
      description: "Timeless craftsmanship",
      image: "/api/placeholder/400/500",
      icon: Crown,
      gradient: "platinum",
      items: "1,156 timepieces"
    },
    {
      name: "Art & Collectibles",
      description: "Museum-quality pieces",
      image: "/api/placeholder/400/500",
      icon: Star,
      gradient: "rose-gold",
      items: "823 artworks"
    }
  ];

  return (
    <section className="py-24 relative">
      <div className="luxury-grid absolute inset-0 opacity-30" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge className="emerald-card px-6 py-2 mb-6">
            <Crown className="w-4 h-4 mr-2" />
            Premium Categories
          </Badge>
          <h2 className="text-4xl md:text-6xl font-luxury text-luxury mb-6">
            Curated Collections
          </h2>
          <p className="text-xl text-white/70 font-elegant max-w-2xl mx-auto">
            Explore our meticulously selected categories featuring the world's most coveted luxury items
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {categories.map((category, index) => (
            <Link
              key={category.name}
              href={`/category/${category.name.toLowerCase().replace(/\s+/g, '-')}`}
              className="group block"
            >
              <div className="luxury-card p-8 h-full hover-rise">
                <div className="relative mb-6">
                  <div className={`w-16 h-16 ${category.gradient}-card flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <category.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2">
                    <Sparkles className="w-5 h-5 text-champagne-light/60 animate-pulse" />
                  </div>
                </div>

                <h3 className="text-xl font-luxury text-emerald-gradient mb-2">
                  {category.name}
                </h3>
                <p className="text-white/60 font-elegant mb-4">
                  {category.description}
                </p>
                <p className="text-sm text-champagne-light font-premium">
                  {category.items}
                </p>

                <div className="mt-6 flex items-center text-white/40 group-hover:text-emerald-light transition-colors">
                  <span className="text-sm font-premium">Explore</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

// Featured Products Section
const FeaturedProducts = () => {
  const { products, loading } = useProducts({ featured: true, limit: 8 });

  if (loading) {
    return (
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="luxury-card p-6 h-96 skeleton-luxury rounded-xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-deep/5 to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge className="champagne-card px-6 py-2 mb-6">
            <Star className="w-4 h-4 mr-2" />
            Handpicked Selection
          </Badge>
          <h2 className="text-4xl md:text-6xl font-luxury text-luxury mb-6">
            Featured Masterpieces
          </h2>
          <p className="text-xl text-white/70 font-elegant max-w-2xl mx-auto">
            Discover exceptional pieces chosen by our expert curators for their unparalleled quality and craftsmanship
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <div key={product.id} className="hover-luxury">
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link href="/products">
            <Button className="btn-champagne px-12 py-4 text-lg group">
              View All Collections
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

// Luxury Services Section
const LuxuryServices = () => {
  const services = [
    {
      icon: Crown,
      title: "Personal Curator",
      description: "Dedicated shopping experts for personalized recommendations",
      color: "emerald"
    },
    {
      icon: Zap,
      title: "Express Delivery",
      description: "White-glove service with same-day luxury delivery",
      color: "champagne"
    },
    {
      icon: Shield,
      title: "Authenticity Guarantee",
      description: "Every item certified authentic with lifetime verification",
      color: "platinum"
    },
    {
      icon: Gift,
      title: "Exclusive Access",
      description: "First access to limited editions and private collections",
      color: "rose-gold"
    }
  ];

  return (
    <section className="py-24 relative">
      <div className="pattern-dots absolute inset-0 opacity-10" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-luxury text-champagne-gradient mb-6">
            Elevated Service
          </h2>
          <p className="text-xl text-white/70 font-elegant max-w-2xl mx-auto">
            Experience luxury shopping redefined with our premium concierge services
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <div key={service.title} className="text-center group">
              <div className={`w-20 h-20 ${service.color}-card mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 relative`}>
                <service.icon className="w-10 h-10 text-white" />
                <div className="absolute inset-0 bg-white/10 rounded-full animate-ping opacity-20" style={{ animationDelay: `${index * 0.5}s` }} />
              </div>
              <h3 className="text-xl font-luxury text-emerald-gradient mb-3">
                {service.title}
              </h3>
              <p className="text-white/60 font-elegant">
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Main Homepage Component
export default function LuxuryHomepage() {
  return (
    <div className="min-h-screen">
      <LuxuryHero />
      <LuxuryCategories />
      <FeaturedProducts />
      <LuxuryServices />
    </div>
  );
}
