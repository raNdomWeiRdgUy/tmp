'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  Package,
  ShoppingCart,
  Users,
  Settings,
  Bell,
  Menu,
  X,
  Store,
  TrendingUp,
  Calendar,
  DollarSign
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const VendorLayout = ({ children }: { children: React.ReactNode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/vendor',
      icon: BarChart3,
      badge: null
    },
    {
      name: 'Products',
      href: '/vendor/products',
      icon: Package,
      badge: null
    },
    {
      name: 'Orders',
      href: '/vendor/orders',
      icon: ShoppingCart,
      badge: '3'
    },
    {
      name: 'Analytics',
      href: '/vendor/analytics',
      icon: TrendingUp,
      badge: null
    },
    {
      name: 'Customers',
      href: '/vendor/customers',
      icon: Users,
      badge: null
    },
    {
      name: 'Calendar',
      href: '/vendor/calendar',
      icon: Calendar,
      badge: null
    },
    {
      name: 'Settings',
      href: '/vendor/settings',
      icon: Settings,
      badge: null
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed left-0 top-0 z-50 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 lg:translate-x-0 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:static lg:shadow-none border-r border-gray-200`}>

        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Store className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-heading text-lg text-primary">Vendor Portal</h2>
              <p className="text-xs text-muted">Business Dashboard</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden p-2"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Vendor Info */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-beige-medium rounded-full flex items-center justify-center">
              <span className="text-white font-semibold">JD</span>
            </div>
            <div>
              <h3 className="font-semibold text-primary">John's Electronics</h3>
              <p className="text-sm text-muted">Premium Seller</p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-lg font-semibold text-teal-dark">4.8</p>
              <p className="text-xs text-muted">Rating</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-teal-dark">1.2k</p>
              <p className="text-xs text-muted">Sales</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-beige-whisper text-teal-dark border border-teal-light'
                    : 'text-secondary hover:bg-beige-whisper hover:text-teal-dark'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </div>
                {item.badge && (
                  <Badge className="bg-teal-dark text-white text-xs">
                    {item.badge}
                  </Badge>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden p-2"
                onClick={() => setIsSidebarOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl font-heading text-primary">Vendor Dashboard</h1>
                <p className="text-sm text-muted">Manage your business on ModernMart</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="relative p-2">
                <Bell className="w-5 h-5 text-secondary" />
                <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
                  2
                </Badge>
              </Button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-beige-medium rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">JD</span>
                </div>
                <span className="text-sm font-medium text-primary">John Doe</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default VendorLayout;
