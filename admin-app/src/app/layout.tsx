'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '../store/useAuthStore';
import { LayoutDashboard, ShoppingBag, FolderHeart, FileSpreadsheet, LogOut, Globe } from 'lucide-react';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  
  const { isAuthenticated, logout, user } = useAuthStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Auth routing guard checks
  useEffect(() => {
    if (mounted && pathname !== '/login' && !isAuthenticated()) {
      router.push('/login');
    }
  }, [mounted, pathname, isAuthenticated, router]);

  // Premium Spinner Animation Component
  const PremiumLoader = () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-cream w-full">
      <div className="relative w-14 h-14">
        {/* Outer pulsing soft ring */}
        <div className="absolute inset-0 rounded-full border-4 border-primary-200/50 animate-pulse"></div>
        {/* Inner rotating accent ring */}
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary-600 animate-spin"></div>
      </div>
    </div>
  );

  const renderContent = () => {
    if (!mounted) {
      return <PremiumLoader />;
    }

    if (pathname === '/login') {
      return <div className="min-h-screen bg-cream w-full">{children}</div>;
    }

    if (!isAuthenticated()) {
      return <PremiumLoader />;
    }

    const menuItems = [
      { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
      { name: 'Manage Products', href: '/products', icon: ShoppingBag },
      { name: 'Manage Categories', href: '/categories', icon: FolderHeart },
      { name: 'Track Orders', href: '/orders', icon: FileSpreadsheet },
    ];

    return (
      <div className="min-h-screen flex flex-col md:flex-row bg-cream text-charcoal w-full">
        {/* Sidebar panel */}
        <aside className="w-full md:w-64 bg-navy text-white flex flex-col justify-between flex-shrink-0">
          <div>
            {/* Logo */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <span className="font-display font-semibold tracking-wider text-sm text-cream uppercase">
                Admin Console
              </span>
              <a
                href="http://localhost:3000"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cream/60 hover:text-cream flex items-center transition-colors"
                title="Go to Storefront (Port 3000)"
              >
                <Globe size={16} />
              </a>
            </div>

            {/* Profile */}
            <div className="p-6 border-b border-white/5 bg-navy-light/20 text-xs">
              <p className="font-display font-semibold text-white/90 truncate">{user?.name || 'Administrator'}</p>
              <p className="text-white/50 truncate">{user?.email || 'admin@babyskin.com'}</p>
            </div>

            {/* Nav Menu */}
            <nav className="p-4 space-y-1.5 flex-grow">
              {menuItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center space-x-3 px-4 py-2.5 rounded-xl text-xs font-display tracking-wider uppercase font-medium transition-all
                      ${isActive 
                        ? 'bg-primary-600 text-white font-semibold shadow-sm' 
                        : 'text-white/70 hover:text-white hover:bg-white/5'}`}
                  >
                    <Icon size={16} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Sign out */}
          <div className="p-4 border-t border-white/10">
            <button
              onClick={() => {
                logout();
                router.push('/login');
              }}
              className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-xs font-display tracking-wider uppercase font-medium text-red-400 hover:text-white hover:bg-red-500/10 transition-all focus:outline-none cursor-pointer"
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Content */}
        <main className="flex-grow overflow-y-auto p-6 sm:p-10">
          {children}
        </main>
      </div>
    );
  };

  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable} h-full`}>
      <body className="min-h-screen bg-cream text-charcoal flex">
        {renderContent()}
      </body>
    </html>
  );
}
