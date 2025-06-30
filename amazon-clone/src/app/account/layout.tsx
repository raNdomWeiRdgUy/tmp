'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Header from '@/components/Header';
import { Card, CardContent } from '@/components/ui/card';
import { useApp } from '@/lib/store';
import { User, Package, MapPin, CreditCard, Heart, Settings, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const accountNavigation = [
  {
    name: 'Profile',
    href: '/account',
    icon: User,
    description: 'Manage your personal information',
  },
  {
    name: 'Orders',
    href: '/account/orders',
    icon: Package,
    description: 'View and track your orders',
  },
  {
    name: 'Addresses',
    href: '/account/addresses',
    icon: MapPin,
    description: 'Manage shipping addresses',
  },
  {
    name: 'Payment Methods',
    href: '/account/payments',
    icon: CreditCard,
    description: 'Add and edit payment methods',
  },
  {
    name: 'Wishlist',
    href: '/account/wishlist',
    icon: Heart,
    description: 'Items you want to buy later',
  },
  {
    name: 'Settings',
    href: '/account/settings',
    icon: Settings,
    description: 'Account preferences and privacy',
  },
];

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { state } = useApp();

  useEffect(() => {
    if (!state.user) {
      router.push('/');
    }
  }, [state.user, router]);

  if (!state.user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Your Account</h1>
          <p className="text-gray-600 mt-2">
            Welcome back, {state.user.firstName}! Manage your account and orders.
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Navigation Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-0">
                <nav className="space-y-1">
                  {accountNavigation.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          'flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors',
                          isActive
                            ? 'bg-orange-50 text-orange-700 border-r-2 border-orange-500'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        )}
                      >
                        <Icon className={cn(
                          'mr-3 h-5 w-5',
                          isActive ? 'text-orange-500' : 'text-gray-400'
                        )} />
                        <div>
                          <div className="font-medium">{item.name}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {item.description}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </nav>

                <div className="p-4 border-t">
                  <div className="flex items-center">
                    <HelpCircle className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <div className="font-medium text-sm">Need Help?</div>
                      <Link href="/help" className="text-xs text-orange-600 hover:text-orange-700">
                        Contact Support
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
