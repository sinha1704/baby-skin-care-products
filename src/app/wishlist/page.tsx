'use client';

import React, { useState, useEffect } from 'react';
import { useWishlistStore } from '../../store/useWishlistStore';
import { ProductCard } from '../../components/ProductCard';
import { Heart } from 'lucide-react';
import Link from 'next/link';

export default function Wishlist() {
  const [mounted, setMounted] = useState(false);
  const wishlistItems = useWishlistStore((state) => state.items);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center font-display text-primary-600 animate-pulse">
        Loading wishlist...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
      {/* Title */}
      <div className="border-b border-primary-200/50 pb-6 mb-10 text-center">
        <h1 className="text-3xl font-display font-semibold text-primary-950">
          Your Wishlist
        </h1>
        <p className="text-xs text-primary-700/60 font-sans mt-1">
          Keep track of your favorite baby care items for future nursery selections or gifting.
        </p>
      </div>

      {wishlistItems.length === 0 ? (
        /* Empty State */
        <div className="max-w-md mx-auto bg-white/50 border border-primary-200/40 rounded-3xl p-12 text-center shadow-sm">
          <div className="bg-primary-100 rounded-full p-4 text-primary-600 w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Heart size={28} className="text-primary-600" />
          </div>
          <h3 className="font-display font-medium text-lg text-primary-955 mb-1.5">
            Your wishlist is empty
          </h3>
          <p className="text-xs text-primary-700/60 font-sans leading-relaxed mb-6">
            Explore our collections and tap the heart icon on any product to save it here for later.
          </p>
          <Link
            href="/shop"
            className="px-6 py-2.5 bg-primary-600 text-white rounded-full text-xs font-display font-medium uppercase tracking-wide hover:bg-primary-700 active:scale-98 transition-all inline-block"
          >
            Shop Collections
          </Link>
        </div>
      ) : (
        /* Products list */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {wishlistItems.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
