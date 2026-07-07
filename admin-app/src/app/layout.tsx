'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '../store/useAuthStore';
import { LayoutDashboard, ShoppingBag, FolderHeart, FileSpreadsheet, LogOut, Globe } from 'lucide-react';
import { Inter, Outfit } from 'next/font/google';
import { getApiBaseUrl } from '../utils/api';
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
        <aside className="w-full md:w-64 bg-white/70 backdrop-blur-md border-r border-primary-200/40 flex flex-col justify-between flex-shrink-0 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
          <div>
            {/* Logo */}
            <div className="p-6 border-b border-primary-100/50 flex items-center justify-between">
              <span className="font-display font-semibold tracking-wider text-xs text-primary-900 uppercase">
                Admin Console
              </span>
              <a
                href={getApiBaseUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-800/60 hover:text-primary-900 flex items-center transition-colors p-1.5 hover:bg-primary-50 rounded-lg"
                title="Go to Storefront"
              >
                <Globe size={15} />
              </a>
            </div>
 
            {/* Profile */}
            <div className="mx-4 my-5 p-4 rounded-2xl bg-primary-50/40 border border-primary-100/30 text-xs">
              <p className="font-display font-semibold text-primary-900 truncate">{user?.name || 'Administrator'}</p>
              <p className="text-primary-700/60 truncate mt-0.5">{user?.email || 'admin@babyskin.com'}</p>
            </div>
 
            {/* Nav Menu */}
            <nav className="px-3 space-y-1 flex-grow">
              {menuItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-display tracking-wider uppercase font-medium transition-all cursor-pointer
                      ${isActive 
                        ? 'bg-primary-800 text-white font-semibold shadow-sm' 
                        : 'text-primary-800/80 hover:text-primary-900 hover:bg-primary-50/70'}`}
                  >
                    <Icon size={15} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
 
          {/* Sign out */}
          <div className="p-4 border-t border-primary-100/50">
            <button
              onClick={() => {
                logout();
                router.push('/login');
              }}
              className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-xs font-display tracking-wider uppercase font-medium text-red-500 hover:text-white hover:bg-red-500/90 transition-all focus:outline-none cursor-pointer border border-transparent hover:border-red-600/10"
            >
              <LogOut size={15} />
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
