{/* Top Announcement Bar */}
      <div className="bg-beige-pale text-primary py-2 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm font-medium text-primary">
            Free shipping on orders over $50 • Premium customer service available
          </p>
        </div>
      </div>

      {/* Main Navigation */}
      <header className={`nav-minimal sticky top-0 z-50 transition-all duration-300 ${
        isScrolled ? 'shadow-lg' : ''
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <div className="flex items-center space-x-8">
              <Link href="/" className="flex items-center space-x-3 group">
                <div className="w-10 h-10 bg-teal-dark rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-xl font-heading text-gradient-teal">ModernMart</h1>
                  <p className="text-xs text-muted -mt-1">Sleek Shopping</p>
                </div>
              </Link>

              {/* Navigation Links */}
              <nav className="hidden lg:flex items-center space-x-1">
                {[
                  { name: 'Categories', href: '/categories' },
                  { name: 'Deals', href: '/deals' },
                  { name: 'New', href: '/new' },
                  { name: 'Brands', href: '/brands' }
                ].map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="px-4 py-2 rounded-md text-sm font-medium text-secondary hover:text-teal-dark hover:bg-beige-whisper transition-all duration-200"
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-xl mx-8 hidden md:block">
              <form onSubmit={handleSearch} className="relative">
                <div className="relative flex items-center bg-white border border-gray-300 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                  <Input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 pl-11 pr-20 py-3 text-primary placeholder:text-muted border-0 bg-transparent focus:outline-none focus:ring-0"
                  />
                  <Button
                    type="submit"
                    className="absolute right-1 top-1/2 -translate-y-1/2 btn-primary px-4 py-2 text-sm rounded-md"
                  >
                    Search
                  </Button>
                </div>
              </form>
            </div>

            {/* Right Actions */}
            <div className="flex items-center space-x-2">

              {/* Vendor Portal Button */}
              <Button
                onClick={() => openAuthModal('vendor')}
                className="btn-secondary hidden lg:flex items-center space-x-2"
              >
                <Store className="w-4 h-4" />
                <span>Sell</span>
              </Button>

              {/* Wishlist */}
              <Button variant="ghost" size="sm" className="p-2 rounded-lg hover:bg-beige-whisper">
                <Heart className="w-5 h-5 text-secondary hover:text-teal-dark transition-colors" />
              </Button>

              {/* Shopping Cart */}
              <Link href="/cart">
                <Button variant="ghost" size="sm" className="p-2 rounded-lg hover:bg-beige-whisper relative">
                  <ShoppingCart className="w-5 h-5 text-secondary hover:text-teal-dark transition-colors" />
                  {cartItemCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 bg-teal-dark text-white text-xs min-w-5 h-5 flex items-center justify-center rounded-full">
                      {cartItemCount}
                    </Badge>
                  )}
                </Button>
              </Link>

              {/* Customer Sign In */}
              <Button
                onClick={() => openAuthModal('customer')}
                className="btn-primary hidden sm:flex items-center space-x-2"
              >
                <User className="w-4 h-4" />
                <span>Sign In</span>
              </Button>

              {/* Mobile Menu */}
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden p-2 rounded-lg hover:bg-beige-whisper"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <Menu className="w-5 h-5 text-secondary" />
              </Button>
            </div>
          </div>

          {/* Mobile Search */}
          <div className="md:hidden pb-4">
            <form onSubmit={handleSearch} className="relative">
              <div className="relative flex items-center bg-white border border-gray-300 rounded-lg shadow-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <Input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 pl-10 pr-16 py-2 text-primary placeholder:text-muted border-0 bg-transparent focus:outline-none focus:ring-0"
                />
                <Button
                  type="submit"
                  className="absolute right-1 top-1/2 -translate-y-1/2 btn-primary px-3 py-1 text-xs rounded-md"
                >
                  Go
                </Button>
              </div>
            </form>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/30">
          <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-lg font-heading text-primary">Menu</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-lg hover:bg-beige-whisper"
                >
                  <X className="w-5 h-5 text-primary" />
                </Button>
              </div>

              <nav className="space-y-4">
                {[
                  { name: 'Categories', href: '/categories' },
                  { name: 'Deals', href: '/deals' },
                  { name: 'New', href: '/new' },
                  { name: 'Brands', href: '/brands' },
                  { name: 'Wishlist', href: '/wishlist' },
                  { name: 'Account', href: '/account' }
                ].map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="block px-4 py-3 rounded-lg text-secondary hover:text-teal-dark hover:bg-beige-whisper transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>

              <div className="mt-8 pt-8 border-t border-gray-200 space-y-3">
                <Button
                  onClick={() => openAuthModal('customer')}
                  className="btn-primary w-full"
                >
                  Sign In
                </Button>
                <Button
                  onClick={() => openAuthModal('vendor')}
                  className="btn-secondary w-full"
                >
                  Become a Seller
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Minimalist Authentication Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 bg-black/20 flex items-center justify-center p-4">
          <div className="minimal-card w-full max-w-md p-6 relative bg-white">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                {authType === 'vendor' ? (
                  <>
                    <div className="w-8 h-8 bg-beige-medium rounded-lg flex items-center justify-center">
                      <Store className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-heading text-gradient-beige">Seller Portal</h2>
                      <p className="text-xs text-muted">Start your business</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-8 h-8 bg-teal-dark rounded-lg flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-heading text-gradient-teal">Welcome Back</h2>
                      <p className="text-xs text-muted">Sign in to continue</p>
                    </div>
                  </>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAuthModal(false)}
                className="p-2 rounded-lg hover:bg-beige-whisper"
              >
                <X className="w-4 h-4 text-primary" />
              </Button>
            </div>

            {authType === 'vendor' ? (
              // Vendor Authentication Form
              <div className="space-y-4">
                <div className="bg-beige-whisper rounded-lg p-4 mb-4">
                  <h3 className="font-semibold text-primary mb-2">Join Our Platform</h3>
                  <ul className="text-sm text-secondary space-y-1">
                    <li>• Reach thousands of customers</li>
                    <li>• Simple seller tools</li>
                    <li>• Fast payments</li>
                    <li>• Dedicated support</li>
                  </ul>
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary mb-2">
                    Business Email
                  </label>
                  <Input
                    type="email"
                    placeholder="your@business.com"
                    className="input-minimal"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">
                    Password
                  </label>
                  <Input
                    type="password"
                    placeholder="Create password"
                    className="input-minimal"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">
                    Business Name
                  </label>
                  <Input
                    type="text"
                    placeholder="Your business"
                    className="input-minimal"
                  />
                </div>
                <Button className="btn-minimal w-full">
                  <Store className="w-4 h-4 mr-2" />
                  Start Selling
                </Button>
              </div>
            ) : (
              // Customer Authentication Form
              <div className="space-y-4">
                <div className="bg-beige-whisper rounded-lg p-4 mb-4">
                  <h3 className="font-semibold text-primary mb-2">Welcome Back</h3>
                  <p className="text-sm text-secondary">
                    Sign in to access your account and continue shopping.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary mb-2">
                    Email
                  </label>
                  <Input
                    type="email"
                    placeholder="Enter email"
                    className="input-minimal"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">
                    Password
                  </label>
                  <Input
                    type="password"
                    placeholder="Enter password"
                    className="input-minimal"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="remember-me"
                      className="rounded border-gray-300"
                    />
                    <label htmlFor="remember-me" className="text-sm text-secondary">
                      Remember me
                    </label>
                  </div>
                  <button className="text-sm text-teal-dark hover:text-teal-medium">
                    Forgot?
                  </button>
                </div>
                <Button className="btn-primary w-full">
                  <User className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
              </div>
            )}

            <div className="mt-6 text-center border-t border-gray-200 pt-6">
              {authType === 'vendor' ? (
                <div>
                  <p className="text-sm text-secondary mb-3">
                    Already selling?{' '}
                    <button className="text-beige-dark hover:text-beige-medium font-medium">
                      Sign in
                    </button>
                  </p>
                  <button
                    onClick={() => setAuthType('customer')}
                    className="text-sm text-teal-dark hover:text-teal-medium font-medium"
                  >
                    Shopping instead? →
                  </button>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-secondary mb-3">
                    New here?{' '}
                    <button className="text-teal-dark hover:text-teal-medium font-medium">
                      Create account
                    </button>
                  </p>
                  <button
                    onClick={() => setAuthType('vendor')}
                    className="text-sm text-beige-dark hover:text-beige-medium font-medium"
                  >
                    Want to sell? →
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
