'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, ShoppingBag, Plus, Minus, Trash } from 'lucide-react';
import { useCartStore, CartItem } from '../store/useCartStore';
import { formatCurrency } from '../utils/currency';
import { motion, AnimatePresence } from 'framer-motion';

export const CartSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const { items, updateQuantity, removeItem, getSubtotal, getTotalItems } = useCartStore();

  useEffect(() => {
    setMounted(true);
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-cart', handleOpen);
    return () => window.removeEventListener('open-cart', handleOpen);
  }, []);

  // Lock scroll when cart is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!mounted) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Dark Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black z-50 cursor-pointer"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full sm:max-w-md bg-cream-light z-50 shadow-2xl flex flex-col h-full border-l border-primary-200/50"
          >
            {/* Header */}
            <div className="p-6 border-b border-primary-200/40 flex items-center justify-between">
              <div className="flex items-center space-x-2.5 text-primary-900">
                <ShoppingBag size={20} />
                <h3 className="font-display font-medium text-lg">
                  Your Cart ({getTotalItems()})
                </h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-primary-800/70 hover:text-primary-900 transition-colors p-1"
                aria-label="Close cart"
              >
                <X size={22} />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <div className="bg-primary-100 rounded-full p-4 text-primary-600 mb-4">
                    <ShoppingBag size={32} />
                  </div>
                  <h4 className="font-display font-medium text-primary-900 mb-1">
                    Your cart is empty
                  </h4>
                  <p className="text-xs text-primary-700/60 font-sans max-w-[240px] mb-6">
                    Add our ultra-mild, soothing skin care products to begin caring for your baby's skin.
                  </p>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      window.location.href = '/shop';
                    }}
                    className="px-6 py-2.5 bg-primary-600 text-white rounded-full text-xs font-display font-medium tracking-wide uppercase hover:bg-primary-700 active:scale-98 transition-all"
                  >
                    Shop Collections
                  </button>
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={item.id}
                    className="flex space-x-4 bg-white/70 backdrop-blur-sm p-4 rounded-2xl border border-primary-200/40"
                  >
                    {/* Product Image */}
                    <div className="w-20 h-20 relative bg-primary-50 rounded-xl overflow-hidden flex-shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.image}
                        alt={item.name}
                        className="object-cover w-full h-full"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <h4 className="font-display text-sm font-medium text-primary-950 line-clamp-1">
                            {item.name}
                          </h4>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors pl-2"
                            aria-label="Remove item"
                          >
                            <Trash size={15} />
                          </button>
                        </div>
                        <p className="text-xs text-primary-700/80 font-sans mt-0.5">
                          {formatCurrency(item.price)}
                        </p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border border-primary-200/60 bg-cream-light/60 rounded-full px-2.5 py-0.5">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="text-primary-800/85 hover:text-primary-900 transition-colors p-1"
                            disabled={item.quantity <= 1}
                          >
                            <Minus size={12} />
                          </button>
                          <span className="px-3 text-xs font-semibold text-primary-950 min-w-[20px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="text-primary-800/85 hover:text-primary-900 transition-colors p-1"
                            disabled={item.quantity >= item.stock}
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                        <span className="text-sm font-semibold text-primary-950">
                          {formatCurrency(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer Summary */}
            {items.length > 0 && (
              <div className="p-6 border-t border-primary-200/40 bg-white/40 backdrop-blur-sm space-y-4">
                <div className="flex justify-between items-center text-sm font-sans text-primary-800/90">
                  <span>Subtotal</span>
                  <span className="font-semibold text-base text-primary-950">
                    {formatCurrency(getSubtotal())}
                  </span>
                </div>
                <p className="text-[10px] text-primary-700/60 leading-relaxed font-sans">
                  Shipping and taxes will be calculated at checkout. Stripe test checkout supported.
                </p>
                <div className="pt-2">
                  <Link
                    href="/checkout"
                    onClick={() => setIsOpen(false)}
                    className="w-full inline-flex items-center justify-center px-6 py-3.5 bg-primary-600 text-white hover:bg-primary-700 active:scale-98 rounded-full font-display font-medium text-sm tracking-wide uppercase shadow-sm transition-all text-center"
                  >
                    Proceed to Checkout
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
