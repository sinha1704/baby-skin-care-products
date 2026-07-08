'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ShoppingBag, Heart, User, Menu, X, Search, Package, LogOut } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { useWishlistStore } from '../store/useWishlistStore';
import { useAuthStore } from '../store/useAuthStore';
import { motion, AnimatePresence } from 'framer-motion';

export const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const cartItemsCount = useCartStore((state) => state.getTotalItems());
  const wishlistCount = useWishlistStore((state) => state.items.length);
  const { user, logout } = useAuthStore();

  // Animation controller for Cart Badge bump
  const [badgeBump, setBadgeBump] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (cartItemsCount === 0) return;
    setBadgeBump(true);
    const timer = setTimeout(() => setBadgeBump(false), 300);
    return () => clearTimeout(timer);
  }, [cartItemsCount]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Shop All', href: '/shop' },
    { name: 'Our Philosophy', href: '/#philosophy' },
  ];

  // Open cart drawer from anywhere (we'll implement this by adding a toggle state to cart store, or standard dispatcher)
  // Let's use a custom event or store a boolean inside CartStore. We can add cartOpen to CartStore to open/close cart sidebar globally.
  // Wait, let's look at useCartStore. It doesn't have open/close yet. Let's see if we should add it. No, we can just trigger the cart sidebar via a simple session state, or add it to Zustand!
  // Let's create a separate store or event for opening the cart. Or we can just add a global custom event or add `cartOpen: boolean` and `setCartOpen: (open: boolean) => void` to our useCartStore.
  // Wait! Let's see if we can edit useCartStore to support `isCartOpen: boolean` and `setCartOpen: (open: boolean) => void`. That is super elegant and standard.
  // Let's check how we wrote useCartStore. It has `items`, `addItem`, etc. It does not have `isCartOpen`.
  // Wait! We can edit useCartStore later or define it in a simple global window event or a new state.
  // Let's check: we can trigger a custom event: `window.dispatchEvent(new CustomEvent('toggle-cart'))` or simply add it. Let's use `window.dispatchEvent(new CustomEvent('open-cart'))` since it doesn't require modifying the store file right away, or we can edit the store file.
  // Actually, using a custom event on window is very easy, but since Next.js runs in server components, we must ensure it is safely typed. Let's just dispatch custom events on window.

  return (
    <header className="sticky top-0 z-40 w-full glass-nav">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Mobile Menu Icon */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-primary-800 hover:text-primary-600 focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>

          {/* Elegant Serif Logo */}
          <div className="flex-1 md:flex-initial flex justify-center md:justify-start min-w-0">
            <Link href="/" className="font-display text-lg max-[370px]:text-[14px] min-[370px]:max-[400px]:text-[16px] sm:text-2xl font-semibold tracking-widest max-[370px]:tracking-normal min-[370px]:max-[400px]:tracking-wider text-primary-800 hover:opacity-90 whitespace-nowrap">
              NURTURE & DEW
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex space-x-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-sm font-display tracking-wide transition-colors duration-300 hover:text-primary-600
                    ${isActive ? 'text-primary-600 font-semibold' : 'text-primary-800/80'}`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Icons panel */}
          <div className="flex items-center space-x-2 max-[370px]:space-x-1 sm:space-x-5">
            {/* Search Icon */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="text-primary-800/85 hover:text-primary-600 transition-colors p-1"
              aria-label="Search products"
            >
              <Search size={20} />
            </button>

            {/* Customer Auth / User Profile Icon */}
            <div className="relative">
              {mounted && user ? (
                <>
                  <button
                    onClick={() => setUserMenuOpen((v) => !v)}
                    className="flex items-center gap-1.5 text-primary-800/85 hover:text-primary-600 transition-colors"
                    aria-label="User menu"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                      <span className="text-xs font-display font-bold text-primary-700">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="hidden lg:inline text-xs font-display font-medium text-primary-700 uppercase tracking-wide">
                      Hi, {user.name.split(' ')[0]}
                    </span>
                  </button>
                  <AnimatePresence>
                    {userMenuOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setUserMenuOpen(false)}
                        />
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: -8 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -8 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 top-10 z-50 w-48 bg-white rounded-2xl shadow-xl border border-primary-100 overflow-hidden"
                        >
                          <div className="px-4 py-3 border-b border-primary-50">
                            <p className="text-xs font-display font-semibold text-primary-700 truncate">{user.name}</p>
                            <p className="text-[10px] text-primary-400 font-sans truncate">{user.email}</p>
                          </div>
                          <Link
                            href="/orders"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-3 text-sm font-display text-primary-700 hover:bg-primary-50 transition-colors"
                          >
                            <Package size={15} className="text-primary-500" />
                            My Orders
                          </Link>
                          <button
                            onClick={() => {
                              logout();
                              setUserMenuOpen(false);
                              router.push('/');
                            }}
                            className="w-full flex items-center gap-2.5 px-4 py-3 text-sm font-display text-red-600 hover:bg-red-50 transition-colors border-t border-primary-50"
                          >
                            <LogOut size={15} />
                            Sign Out
                          </button>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                <Link
                  href="/login"
                  className="text-primary-800/85 hover:text-primary-600 transition-colors flex items-center"
                  title="Sign In / Register"
                >
                  <User size={20} />
                </Link>
              )}
            </div>

            {/* Wishlist Link */}
            <Link
              href="/wishlist"
              className="relative text-primary-800/85 hover:text-primary-600 transition-colors p-1"
              aria-label="Wishlist"
            >
              <Heart size={20} />
              {mounted && wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-600 text-white rounded-full text-[9px] w-4 h-4 flex items-center justify-center font-display">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Link (Triggers sidebar drawer) */}
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('open-cart'))}
              className="relative text-primary-800/85 hover:text-primary-600 transition-colors p-1 focus:outline-none"
              aria-label="Cart"
            >
              <ShoppingBag size={20} />
              {mounted && cartItemsCount > 0 && (
                <motion.span
                  animate={badgeBump ? { scale: [1, 1.3, 1] } : {}}
                  transition={{ duration: 0.3 }}
                  className="absolute -top-1 -right-1 bg-primary-600 text-white rounded-full text-[9px] w-4 h-4 flex items-center justify-center font-display"
                >
                  {cartItemsCount}
                </motion.span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Slide-down Search Bar */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="border-t border-primary-100 bg-cream-light overflow-hidden"
          >
            <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
              <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                <input
                  type="text"
                  placeholder="Search our premium skin care products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-primary-200 rounded-full text-sm outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-100 transition-all duration-300"
                  autoFocus
                />
                <div className="absolute left-4 text-primary-500">
                  <Search size={18} />
                </div>
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="absolute right-4 text-primary-500 hover:text-primary-700 text-xs uppercase tracking-widest font-display"
                >
                  Close
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Drawer Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-20 left-0 w-full bg-cream-light border-b border-primary-100 shadow-md md:hidden z-30"
          >
            <div className="px-4 pt-4 pb-6 space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-base font-display font-medium text-primary-800 hover:bg-primary-50 rounded-xl"
                >
                  {link.name}
                </Link>
              ))}
              {mounted && user && (
                <>
                  <Link
                    href="/orders"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-base font-display font-medium text-primary-800 hover:bg-primary-50 rounded-xl border-t border-primary-100 pt-3"
                  >
                    <Package size={18} className="text-primary-500" />
                    My Orders
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                      router.push('/');
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-base font-display font-medium text-red-600 hover:bg-red-50 rounded-xl text-left"
                  >
                    <LogOut size={18} />
                    Sign Out
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
