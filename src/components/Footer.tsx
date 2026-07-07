'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowRight, Instagram, Facebook } from 'lucide-react';

export const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  return (
    <footer className="bg-cream-dark border-t border-primary-200/50">
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand Info */}
          <div className="md:col-span-1">
            <h3 className="font-display text-lg font-semibold tracking-widest text-primary-900 mb-4">
              NURTURE & DEW
            </h3>
            <p className="text-sm text-primary-800/80 leading-relaxed font-sans max-w-xs">
              Crafted with pure organic botanicals, dermatologist tested, and pH-balanced to lovingly care for your baby's delicate skin.
            </p>
            <div className="flex space-x-4 mt-6">
              <a href="#" className="text-primary-700 hover:text-primary-900 transition-colors">
                <Instagram size={18} />
              </a>
              <a href="#" className="text-primary-700 hover:text-primary-900 transition-colors">
                <Facebook size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display text-xs font-semibold tracking-wider text-primary-900 uppercase mb-4">
              Shop Collections
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/shop?category=baby-lotion" className="text-sm text-primary-800/80 hover:text-primary-900 transition-colors">
                  Baby Lotions
                </Link>
              </li>
              <li>
                <Link href="/shop?category=baby-wash" className="text-sm text-primary-800/80 hover:text-primary-900 transition-colors">
                  Tear-Free washes
                </Link>
              </li>
              <li>
                <Link href="/shop?category=moisturising-cream" className="text-sm text-primary-800/80 hover:text-primary-900 transition-colors">
                  Dry Skin & Eczema Creams
                </Link>
              </li>
              <li>
                <Link href="/shop?category=massage-oil" className="text-sm text-primary-800/80 hover:text-primary-900 transition-colors">
                  Nourishing Massage Oils
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-display text-xs font-semibold tracking-wider text-primary-900 uppercase mb-4">
              Our Promise
            </h4>
            <ul className="space-y-2.5">
              <li>
                <a href="#philosophy" className="text-sm text-primary-800/80 hover:text-primary-900 transition-colors">
                  Ingredients Philosophy
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-primary-800/80 hover:text-primary-900 transition-colors">
                  Safety Standards
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-primary-800/80 hover:text-primary-900 transition-colors">
                  Customer Support
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter subscription */}
          <div>
            <h4 className="font-display text-xs font-semibold tracking-wider text-primary-900 uppercase mb-4">
              Join Our Family
            </h4>
            <p className="text-sm text-primary-800/80 mb-4 leading-relaxed">
              Subscribe to receive nurturing tips, skin care guides, and exclusive family offers.
            </p>
            <form onSubmit={handleSubscribe} className="relative flex items-center">
              <input
                type="email"
                placeholder="Your email address"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-3 pr-10 py-2.5 bg-white border border-primary-300/80 rounded-xl text-sm outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-100 transition-all duration-300"
              />
              <button
                type="submit"
                className="absolute right-1 bg-primary-600 hover:bg-primary-700 text-white rounded-lg p-1.5 transition-colors"
                aria-label="Submit newsletter"
              >
                <ArrowRight size={16} />
              </button>
            </form>
            {subscribed && (
              <p className="mt-2 text-xs text-primary-700 font-medium animate-pulse">
                Thank you! Welcome to the Nurture & Dew family.
              </p>
            )}
          </div>
        </div>

        <div className="border-t border-primary-300/40 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-primary-700/60 font-sans">
          <p>© 2026 Nurture & Dew. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 sm:mt-0">
            <a href="#" className="hover:text-primary-800 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-primary-800 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-primary-800 transition-colors">Shipping & Returns</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
