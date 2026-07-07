'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { Product } from '../data/seed';
import { useCartStore } from '../store/useCartStore';
import { useWishlistStore } from '../store/useWishlistStore';
import { formatCurrency } from '../utils/currency';
import { motion } from 'framer-motion';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [mounted, setMounted] = useState(false);
  const addItem = useCartStore((state) => state.addItem);
  const { toggleWishlist, hasItem } = useWishlistStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const isWishlisted = mounted ? hasItem(product.id) : false;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="group relative bg-white/60 backdrop-blur-sm rounded-3xl border border-primary-200/40 p-4 hover:shadow-md transition-all duration-300 flex flex-col justify-between h-full"
    >
      <Link href={`/product/${product.slug}`} className="flex flex-col h-full">
        {/* Image Display */}
        <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-cream-light mb-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.images[0] || 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be'}
            alt={product.name}
            className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-500"
          />

          {/* Wishlist Icon */}
          <button
            onClick={handleWishlistToggle}
            className="absolute top-3 right-3 bg-white/90 hover:bg-white text-primary-800 hover:text-red-500 rounded-full p-2 shadow-sm transition-all focus:outline-none"
            aria-label="Toggle wishlist"
          >
            <Heart
              size={16}
              className={`transition-colors duration-300 ${
                isWishlisted ? 'fill-red-500 text-red-500' : 'text-primary-800/80'
              }`}
            />
          </button>

          {/* Out of Stock Ribbon */}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/35 backdrop-blur-[2px] flex items-center justify-center">
              <span className="bg-red-500 text-white text-[10px] font-display font-medium uppercase tracking-wider px-3.5 py-1.5 rounded-full">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        {/* Info Area */}
        <div className="flex-grow flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-display tracking-wider uppercase font-medium text-primary-700 bg-primary-100/60 px-2 py-0.5 rounded-full">
                {product.categoryId === 'cat-lotion' ? 'Lotion' : 
                 product.categoryId === 'cat-wash' ? 'Wash' : 
                 product.categoryId === 'cat-cream' ? 'Cream' : 'Oil'}
              </span>
              <div className="flex items-center text-amber-500 text-xs">
                <Star size={12} className="fill-amber-500 mr-0.5" />
                <span className="font-semibold text-primary-950">{product.rating}</span>
              </div>
            </div>

            <h3 className="font-display font-medium text-primary-950 text-sm sm:text-base line-clamp-2 leading-snug group-hover:text-primary-700 transition-colors">
              {product.name}
            </h3>
          </div>

          <div className="flex items-center justify-between mt-4 pt-3 border-t border-primary-200/20">
            <span className="font-display font-semibold text-primary-950 text-base">
              {formatCurrency(product.price)}
            </span>
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="bg-primary-600 hover:bg-primary-700 text-white rounded-full p-2 shadow-sm transition-all focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-primary-300"
              aria-label="Add to cart"
            >
              <ShoppingCart size={15} />
            </button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};
