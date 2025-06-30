'use client';

import Link from 'next/link';
import { Crown, Diamond, Sparkles, Mail, Phone, MapPin, Instagram, Twitter, Facebook, Youtube } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const ModernFooter = () => {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: 'Collections',
      links: [
        { name: 'Electronics', href: '/collections/electronics' },
        { name: 'Fashion', href: '/collections/fashion' },
        { name: 'Home & Garden', href: '/collections/home' },
        { name: 'Sports & Fitness', href: '/collections/sports' },
        { name: 'Books & Media', href: '/collections/books' },
      ]
    },
    {
      title: 'Services',
      links: [
        { name: 'Customer Support', href: '/support' },
        { name: 'Fast Delivery', href: '/services/delivery' },
        { name: 'Returns & Refunds', href: '/services/returns' },
        { name: 'Premium Support', href: '/services/premium' },
        { name: 'Track Orders', href: '/services/tracking' },
      ]
    },
    {
      title: 'Account',
      links: [
        { name: 'My Profile', href: '/account' },
        { name: 'Order History', href: '/account/orders' },
        { name: 'Wishlist', href: '/wishlist' },
        { name: 'Addresses', href: '/account/addresses' },
        { name: 'Payment Methods', href: '/account/payments' },
      ]
    },
    {
      title: 'Company',
      links: [
        { name: 'About Us', href: '/about' },
        { name: 'Careers', href: '/careers' },
        { name: 'Press', href: '/press' },
        { name: 'Sustainability', href: '/sustainability' },
        { name: 'Vendor Program', href: '/vendors' },
      ]
    }
  ];

  const socialLinks = [
    { name: 'Instagram', icon: Instagram, href: 'https://instagram.com/marketplace' },
    { name: 'Facebook', icon: Facebook, href: 'https://facebook.com/marketplace' },
    { name: 'Twitter', icon: Twitter, href: 'https://twitter.com/marketplace' },
    { name: 'YouTube', icon: Youtube, href: 'https://youtube.com/marketplace' },
  ];

  return (
    <footer className="relative overflow-hidden bg-white">
      {/* Background Patterns */}
      <div className="absolute inset-0 pattern-dots opacity-5" />
      <div className="absolute inset-0 bg-gradient-to-t from-gray-50 to-white" />

      {/* Main Footer Content */}
      <div className="relative">
        {/* Newsletter Section */}
        <div className="border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="modern-card bg-gradient-primary p-12 text-center">
              <div className="max-w-2xl mx-auto">
                <div className="flex items-center justify-center mb-6">
                  <Crown className="w-8 h-8 text-white mr-3" />
                  <h3 className="text-3xl font-heading text-white">Join Our Exclusive Circle</h3>
                  <Sparkles className="w-6 h-6 text-white ml-3 animate-pulse" />
                </div>
                <p className="text-lg text-white font-body mb-8">
                  Be the first to discover limited collections, private sales, and exclusive experiences curated just for you.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                  <Input
                    type="email"
                    placeholder="Enter your email address"
                    className="flex-1 bg-white/20 border-white/30 text-white placeholder:text-white/70 focus:bg-white/30 focus:border-white/50"
                  />
                  <Button className="bg-white text-dark hover:bg-gray-100 px-8 font-semibold">
                    Subscribe
                  </Button>
                </div>
                <p className="text-xs text-white/80 mt-4">
                  By subscribing, you agree to our Privacy Policy and Terms of Service
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Links Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">

            {/* Brand Section */}
            <div className="lg:col-span-1">
              <Link href="/" className="group flex items-center space-x-3 mb-6">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-primary flex items-center justify-center rounded-xl group-hover:scale-110 transition-transform duration-300">
                    <Diamond className="w-6 h-6 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1">
                    <Sparkles className="w-4 h-4 text-emerald animate-glow" />
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-heading text-black">MarketPlace</h2>
                  <p className="text-xs text-black font-body -mt-1">Modern Shopping</p>
                </div>
              </Link>

              <p className="text-black font-body mb-6 leading-relaxed">
                Redefining modern shopping through curated excellence, personalized service, and uncompromising quality.
              </p>

              {/* Contact Info */}
              <div className="space-y-3 text-sm text-black">
                <div className="flex items-center space-x-3">
                  <Phone className="w-4 h-4 text-emerald" />
                  <span className="text-black">+1 (555) MARKET</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="w-4 h-4 text-teal" />
                  <span className="text-black">support@marketplace.com</span>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="w-4 h-4 text-blue" />
                  <span className="text-black">San Francisco, CA</span>
                </div>
              </div>
            </div>

            {/* Footer Links */}
            {footerSections.map((section) => (
              <div key={section.title}>
                <h4 className="text-lg font-heading text-black mb-6">
                  {section.title}
                </h4>
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="text-black hover:text-emerald transition-colors duration-300 font-body text-sm"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-200 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col lg:flex-row items-center justify-between space-y-6 lg:space-y-0">

              {/* Copyright */}
              <div className="text-center lg:text-left">
                <p className="text-black text-sm font-body">
                  © {currentYear} MarketPlace. All rights reserved.
                </p>
                <p className="text-black/70 text-xs mt-1">
                  Crafted with excellence for discerning customers
                </p>
              </div>

              {/* Social Links */}
              <div className="flex items-center space-x-4">
                {socialLinks.map((social) => (
                  <Link
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-gray-100 hover:bg-gradient-primary transition-all duration-300 group rounded-lg"
                  >
                    <social.icon className="w-5 h-5 text-black group-hover:text-white transition-colors" />
                    <span className="sr-only">{social.name}</span>
                  </Link>
                ))}
              </div>

              {/* Legal Links */}
              <div className="flex items-center space-x-6 text-xs text-black">
                <Link href="/privacy" className="hover:text-emerald transition-colors">
                  Privacy Policy
                </Link>
                <Link href="/terms" className="hover:text-emerald transition-colors">
                  Terms of Service
                </Link>
                <Link href="/cookies" className="hover:text-emerald transition-colors">
                  Cookie Policy
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Premium Indicators */}
        <div className="border-t border-gray-200 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-wrap items-center justify-center space-x-8 text-xs text-black">
              <span className="flex items-center space-x-2">
                <Crown className="w-3 h-3 text-emerald" />
                <span className="text-black">Premium Verified</span>
              </span>
              <span className="flex items-center space-x-2">
                <Diamond className="w-3 h-3 text-teal" />
                <span className="text-black">Authenticity Guaranteed</span>
              </span>
              <span className="flex items-center space-x-2">
                <Sparkles className="w-3 h-3 text-blue" />
                <span className="text-black">Fast Delivery Service</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default ModernFooter;
