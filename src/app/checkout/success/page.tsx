'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Order } from '../../../data/seed';
import { formatCurrency } from '../../../utils/currency';
import {
  CheckCircle2,
  Printer,
  ShoppingBag,
  Package,
  Home,
  FileText,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import Link from 'next/link';
import { motion } from 'framer-motion';

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      router.push('/');
      return;
    }

    // Trigger celebratory confetti explosion
    const duration = 2 * 1000;
    const end = Date.now() + duration;
    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#cb997e', '#e29578', '#ddbea9', '#ffddd2'],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#cb997e', '#e29578', '#ddbea9', '#ffddd2'],
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();

    fetch(`/api/orders/${orderId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to retrieve order');
        return res.json();
      })
      .then((data) => {
        setOrder(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [orderId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center font-display text-primary-700 animate-pulse">
        Generating order receipt...
      </div>
    );
  }

  const subtotal = order
    ? order.items.reduce((s, i) => s + i.price * i.quantity, 0)
    : 0;
  const shipping = order ? order.total - subtotal : 0;

  return (
    <div className="min-h-screen bg-cream py-10 sm:py-16 printable-area">
      {/* Print Specific styling injected directly to hide non-invoice elements */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
            background: transparent !important;
          }
          .printable-card, .printable-card * {
            visibility: visible;
          }
          .printable-card {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-3xl border border-primary-100 shadow-lg overflow-hidden printable-card"
        >
          {/* ── TOP SUCCESS HEADER ── */}
          <div className="bg-gradient-to-br from-emerald-50 to-primary-50 px-8 pt-10 pb-8 text-center border-b border-primary-100">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mx-auto mb-5 shadow-sm no-print">
              <CheckCircle2 size={38} strokeWidth={1.8} />
            </div>

            <span className="text-[11px] font-display font-bold tracking-widest uppercase text-primary-500 bg-primary-100 px-3 py-1 rounded-full no-print">
              Payment Confirmed
            </span>
            <h1 className="text-3xl font-display font-semibold text-primary-900 mt-3">
              Tax Invoice & Receipt
            </h1>
            <p className="text-sm text-primary-500 font-sans mt-1.5 no-print">
              We've sent a receipt to{' '}
              <strong className="text-primary-700">
                {order ? order.customerEmail : 'your email'}
              </strong>
            </p>
          </div>

          {/* ── ORDER DETAILS ── */}
          {order && (
            <div className="px-6 sm:px-8 py-6 space-y-5">
              {/* Order header row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-primary-700">
                  <FileText size={16} className="text-primary-400" />
                  <span className="font-display font-semibold text-sm tracking-wide">
                    Order ID: {order.id.toUpperCase()}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-xs text-primary-400 font-sans">
                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                  <span className="inline-flex items-center gap-1 text-[10px] font-display font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 mt-1">
                    Status: {order.status}
                  </span>
                </div>
              </div>

              {/* Items table */}
              <div className="bg-cream-light rounded-2xl overflow-hidden border border-primary-100">
                <div className="px-4 py-2.5 bg-primary-800 flex justify-between text-[10px] font-display font-bold text-primary-100 uppercase tracking-widest">
                  <span>Product</span>
                  <span>Amount</span>
                </div>
                <div className="divide-y divide-primary-100/60">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center px-4 py-3">
                      <div>
                        <p className="text-sm font-display font-medium text-primary-800">
                          {item.productName}
                        </p>
                        <p className="text-xs text-primary-400 font-sans">
                          {formatCurrency(item.price)} × {item.quantity}
                        </p>
                      </div>
                      <span className="font-display font-semibold text-sm text-primary-800">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="border-t border-primary-100 px-4 py-3 space-y-1.5 bg-white/40">
                  <div className="flex justify-between text-xs font-sans text-primary-600">
                    <span>Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-xs font-sans text-primary-600">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? 'Free' : formatCurrency(shipping)}</span>
                  </div>
                  <div className="flex justify-between font-display font-bold text-sm text-primary-900 pt-2 border-t border-primary-100 mt-2">
                    <span>Total Paid</span>
                    <span>{formatCurrency(order.total)}</span>
                  </div>
                </div>
              </div>

              {/* Shipping address */}
              <div className="bg-primary-50/60 rounded-2xl px-5 py-4 border border-primary-100">
                <p className="text-[10px] font-display font-bold text-primary-500 uppercase tracking-widest mb-2">
                  Delivery Address
                </p>
                <p className="text-sm font-display font-semibold text-primary-800">{order.customerName}</p>
                <p className="text-xs font-sans text-primary-600 leading-relaxed mt-0.5">
                  {order.shippingAddress.address}<br />
                  {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                  {order.shippingAddress.postalCode}<br />
                  {order.shippingAddress.country}
                </p>
              </div>

              {/* ── PRINT & SAVE INVOICE BUTTON ── */}
              <button
                onClick={handlePrint}
                className="w-full flex items-center justify-center gap-2.5 py-3.5 bg-primary-800 hover:bg-primary-900 text-white rounded-2xl font-display font-semibold text-sm tracking-wide transition-all shadow-md hover:shadow-lg no-print"
              >
                <Printer size={17} />
                Save / Print Invoice (PDF)
              </button>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-1 no-print">
                <Link
                  href="/shop"
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-display font-medium text-sm tracking-wide transition-all shadow-sm"
                >
                  <ShoppingBag size={15} />
                  Continue Shopping
                </Link>
                <Link
                  href="/orders"
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-white border border-primary-200 hover:bg-primary-50 text-primary-800 rounded-2xl font-display font-medium text-sm tracking-wide transition-all"
                >
                  <Package size={15} />
                  My Orders
                </Link>
                <Link
                  href="/"
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-cream border border-primary-100 hover:bg-primary-50 text-primary-600 rounded-2xl font-display text-sm transition-all"
                  title="Go Home"
                >
                  <Home size={15} />
                </Link>
              </div>
            </div>
          )}

          {/* If order failed to load */}
          {!order && !loading && (
            <div className="px-8 py-10 text-center no-print">
              <p className="text-primary-600 font-display mb-4">
                Order details could not be loaded, but your payment was successful.
              </p>
              <Link
                href="/orders"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-full font-display text-sm hover:bg-primary-700 transition-colors"
              >
                <Package size={15} /> View My Orders
              </Link>
            </div>
          )}
        </motion.div>

        {/* Footer note */}
        <p className="text-center text-xs text-primary-400 font-sans mt-6 no-print">
          Need help?{' '}
          <a href="mailto:support@nurturedew.in" className="underline hover:text-primary-600">
            Contact Support
          </a>
        </p>
      </div>
    </div>
  );
}

export default function CheckoutSuccess() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-20 text-center text-primary-600 font-display animate-pulse">
          Loading receipt details...
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
