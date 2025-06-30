'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, ShoppingCart, Menu, MapPin, User, Heart, ChevronDown, Scale } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { useApp } from '@/lib/store';
import { mockCategories } from '@/lib/mock-data';
import LoginModal from './LoginModal';
import CartSidebar from './CartSidebar';
import ProductComparison, { useProductComparison } from './ProductComparison';

const Header = () => {
  const router = useRouter();
  const { state, logout, getCartItemCount, addToSearchHistory } = useApp();
  const { getComparisonCount } = useProductComparison();
  const [searchQuery, setSearchQuery] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showCartSidebar, setShowCartSidebar] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showComparison, setShowComparison] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      addToSearchHistory(searchQuery);
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const cartItemCount = getCartItemCount();
  const comparisonCount = getComparisonCount();

  return (
    <>
      <header className="bg-gray-900 text-white">
        {/* Top Header */}
        <div className="border-b border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14">
              {/* Logo */}
              <Link href="/" className="flex items-center space-x-2">
                <div className="bg-orange-500 text-white px-2 py-1 rounded font-bold text-lg">
                  amazon
                </div>
              </Link>

              {/* Delivery Location */}
              <div className="hidden md:flex items-center space-x-2 text-sm">
                <MapPin className="w-4 h-4" />
                <div>
                  <div className="text-xs text-gray-300">Deliver to</div>
                  <div className="font-semibold">New York 10001</div>
                </div>
              </div>

              {/* Search Bar */}
              <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-4">
                <div className="flex">
                  <select className="bg-gray-200 text-gray-900 px-3 py-2 rounded-l-md border-r border-gray-300 text-sm">
                    <option>All</option>
                    {mockCategories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <Input
                    type="text"
                    placeholder="Search Amazon Clone"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 rounded-none border-none bg-white text-gray-900"
                  />
                  <Button type="submit" className="bg-orange-500 hover:bg-orange-600 rounded-l-none px-4">
                    <Search className="w-5 h-5" />
                  </Button>
                </div>
              </form>

              {/* User Menu */}
              <div className="flex items-center space-x-4">
                {/* Language Selector */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-white hover:bg-gray-800">
                      EN <ChevronDown className="w-3 h-3 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>English</DropdownMenuItem>
                    <DropdownMenuItem>Español</DropdownMenuItem>
                    <DropdownMenuItem>Français</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Account Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="text-white hover:bg-gray-800 flex items-center space-x-2">
                      <User className="w-5 h-5" />
                      <div className="text-left hidden md:block">
                        <div className="text-xs">
                          {state.user ? `Hello, ${state.user.firstName}` : 'Hello, Sign in'}
                        </div>
                        <div className="font-semibold text-sm">Account & Lists</div>
                      </div>
                      <ChevronDown className="w-3 h-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64">
                    {state.user ? (
                      <>
                        <DropdownMenuItem asChild>
                          <Link href="/account">Your Account</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/orders">Your Orders</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/wishlist">Your Wish List</Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={logout}>Sign Out</DropdownMenuItem>
                      </>
                    ) : (
                      <>
                        <DropdownMenuItem onClick={() => setShowLoginModal(true)}>
                          Sign In
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setShowLoginModal(true)}>
                          Create Account
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Wishlist */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-gray-800 hidden md:flex items-center space-x-1"
                  asChild
                >
                  <Link href="/wishlist">
                    <Heart className="w-5 h-5" />
                    <span className="text-sm">Wishlist</span>
                  </Link>
                </Button>

                {/* Comparison */}
                <Button
                  variant="ghost"
                  className="text-white hover:bg-gray-800 relative hidden md:flex"
                  onClick={() => setShowComparison(true)}
                >
                  <Scale className="w-6 h-6" />
                  {comparisonCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[1.25rem] h-5 flex items-center justify-center">
                      {comparisonCount}
                    </Badge>
                  )}
                  <span className="ml-2">Compare</span>
                </Button>

                {/* Cart */}
                <Button
                  variant="ghost"
                  className="text-white hover:bg-gray-800 relative"
                  onClick={() => setShowCartSidebar(true)}
                >
                  <ShoppingCart className="w-6 h-6" />
                  {cartItemCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[1.25rem] h-5 flex items-center justify-center">
                      {cartItemCount}
                    </Badge>
                  )}
                  <span className="ml-2 hidden md:block">Cart</span>
                </Button>

                {/* Mobile Menu */}
                <Sheet open={showMobileMenu} onOpenChange={setShowMobileMenu}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-white hover:bg-gray-800 md:hidden">
                      <Menu className="w-5 h-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80 bg-white">
                    <div className="py-4">
                      <div className="space-y-4">
                        {state.user ? (
                          <div className="pb-4 border-b">
                            <p className="font-semibold text-lg">Hello, {state.user.firstName}</p>
                          </div>
                        ) : (
                          <Button
                            onClick={() => {
                              setShowMobileMenu(false);
                              setShowLoginModal(true);
                            }}
                            className="w-full"
                          >
                            Sign In
                          </Button>
                        )}

                        <div className="space-y-2">
                          <h3 className="font-semibold text-gray-900">Shop by Category</h3>
                          {mockCategories.map((category) => (
                            <Link
                              key={category.id}
                              href={`/category/${category.slug}`}
                              className="block py-2 text-gray-700 hover:text-gray-900"
                              onClick={() => setShowMobileMenu(false)}
                            >
                              {category.name}
                            </Link>
                          ))}
                        </div>

                        {state.user && (
                          <div className="space-y-2 pt-4 border-t">
                            <Link
                              href="/account"
                              className="block py-2 text-gray-700 hover:text-gray-900"
                              onClick={() => setShowMobileMenu(false)}
                            >
                              Your Account
                            </Link>
                            <Link
                              href="/orders"
                              className="block py-2 text-gray-700 hover:text-gray-900"
                              onClick={() => setShowMobileMenu(false)}
                            >
                              Your Orders
                            </Link>
                            <Link
                              href="/wishlist"
                              className="block py-2 text-gray-700 hover:text-gray-900"
                              onClick={() => setShowMobileMenu(false)}
                            >
                              Your Wish List
                            </Link>
                            <button
                              onClick={() => {
                                logout();
                                setShowMobileMenu(false);
                              }}
                              className="block w-full text-left py-2 text-gray-700 hover:text-gray-900"
                            >
                              Sign Out
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Header - Categories */}
        <div className="bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-6 h-10 overflow-x-auto">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-white hover:bg-gray-700 whitespace-nowrap">
                    <Menu className="w-4 h-4 mr-2" />
                    All
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 bg-white">
                  <div className="py-4">
                    <h3 className="font-semibold text-lg mb-4">Shop by Department</h3>
                    <div className="space-y-2">
                      {mockCategories.map((category) => (
                        <div key={category.id}>
                          <Link
                            href={`/category/${category.slug}`}
                            className="block py-2 font-medium text-gray-900 hover:text-orange-500"
                          >
                            {category.name}
                          </Link>
                          {category.subcategories && (
                            <div className="ml-4 space-y-1">
                              {category.subcategories.map((sub) => (
                                <Link
                                  key={sub.id}
                                  href={`/category/${category.slug}/${sub.slug}`}
                                  className="block py-1 text-sm text-gray-600 hover:text-orange-500"
                                >
                                  {sub.name}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>

              {mockCategories.map((category) => (
                <Link
                  key={category.id}
                  href={`/category/${category.slug}`}
                  className="text-white hover:text-orange-300 text-sm whitespace-nowrap hidden md:block"
                >
                  {category.name}
                </Link>
              ))}

              <Link href="/deals" className="text-white hover:text-orange-300 text-sm whitespace-nowrap">
                Today's Deals
              </Link>
              <Link href="/new-arrivals" className="text-white hover:text-orange-300 text-sm whitespace-nowrap">
                New Arrivals
              </Link>
              <Link href="/customer-service" className="text-white hover:text-orange-300 text-sm whitespace-nowrap">
                Customer Service
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Login Modal */}
      <LoginModal open={showLoginModal} onOpenChange={setShowLoginModal} />

      {/* Cart Sidebar */}
      <CartSidebar open={showCartSidebar} onOpenChange={setShowCartSidebar} />

      {/* Product Comparison */}
      <ProductComparison isOpen={showComparison} onOpenChange={setShowComparison} />
    </>
  );
};

export default Header;
