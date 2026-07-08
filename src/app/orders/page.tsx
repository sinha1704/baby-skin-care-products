'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../store/useAuthStore';
import { Order } from '../../data/seed';
import { formatCurrency } from '../../utils/currency';
import {
  ShoppingBag,
  PackageCheck,
  Truck,
  CircleCheck,
  Clock,
  XCircle,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  RefreshCw,
  Printer,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

const STATUS_CONFIG: Record<
  Order['status'],
  { label: string; color: string; bg: string; icon: React.ReactNode; step: number }
> = {
  Pending: {
    label: 'Order Placed',
    color: 'text-amber-700',
    bg: 'bg-amber-50 border-amber-200',
    icon: <Clock size={15} />,
    step: 1,
  },
  Paid: {
    label: 'Payment Confirmed',
    color: 'text-blue-700',
    bg: 'bg-blue-50 border-blue-200',
    icon: <PackageCheck size={15} />,
    step: 2,
  },
  Shipped: {
    label: 'Shipped',
    color: 'text-violet-700',
    bg: 'bg-violet-50 border-violet-200',
    icon: <Truck size={15} />,
    step: 3,
  },
  Delivered: {
    label: 'Delivered',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50 border-emerald-200',
    icon: <CircleCheck size={15} />,
    step: 4,
  },
  Cancelled: {
    label: 'Cancelled',
    color: 'text-red-700',
    bg: 'bg-red-50 border-red-200',
    icon: <XCircle size={15} />,
    step: 0,
  },
};

const STEPS = [
  { label: 'Placed', icon: <Clock size={14} /> },
  { label: 'Paid', icon: <PackageCheck size={14} /> },
  { label: 'Shipped', icon: <Truck size={14} /> },
  { label: 'Delivered', icon: <CircleCheck size={14} /> },
];

function OrderProgressBar({ status }: { status: Order['status'] }) {
  if (status === 'Cancelled') {
    return (
      <div className="flex items-center gap-2 text-xs text-red-600 font-display mt-2">
        <XCircle size={14} />
        <span>This order was cancelled</span>
      </div>
    );
  }
  const activeStep = STATUS_CONFIG[status].step;
  return (
    <div className="flex items-center gap-0 mt-3">
      {STEPS.map((step, idx) => {
        const stepNum = idx + 1;
        const isComplete = activeStep >= stepNum;
        const isActive = activeStep === stepNum;
        return (
          <React.Fragment key={step.label}>
            <div className="flex flex-col items-center">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all duration-300
                  ${isComplete
                    ? 'bg-primary-600 border-primary-600 text-white'
                    : 'bg-white border-primary-200 text-primary-300'
                  }
                  ${isActive ? 'ring-4 ring-primary-100' : ''}
                `}
              >
                {step.icon}
              </div>
              <span
                className={`text-[10px] mt-1 font-display tracking-wide
                  ${isComplete ? 'text-primary-700 font-semibold' : 'text-primary-300'}`}
              >
                {step.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div
                className={`h-0.5 flex-1 mx-1 rounded transition-all duration-500
                  ${activeStep > stepNum ? 'bg-primary-600' : 'bg-primary-100'}`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function OrderCard({ order, onRefresh }: { order: Order; onRefresh: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const cfg = STATUS_CONFIG[order.status];

  const handleDownloadPDF = async () => {
    if (pdfLoading) return;
    setPdfLoading(true);
    try {
      const response = await fetch(`/api/orders/${order.id}/invoice`);
      if (!response.ok) throw new Error('Download failed');
      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `NurtureDew_Invoice_${order.id}_${new Date(order.createdAt).toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(a);
      a.click();
      
      setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }, 100);
    } catch (err) {
      console.error(err);
      setErrorMessage('Failed to download invoice. Please try again.');
      setShowErrorModal(true);
    } finally {
      setPdfLoading(false);
    }
  };

  const confirmCancelOrder = async () => {
    setCancelLoading(true);
    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel' })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to cancel order');
      }
      setShowSuccessModal(true);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Error cancelling order');
      setShowErrorModal(true);
    } finally {
      setCancelLoading(false);
    }
  };

  // Check if order is eligible for cancellation (COD, not shipped/delivered/cancelled, and <24 hours old)
  const isCod = order.paymentMethod === 'COD';
  const orderTime = new Date(order.createdAt).getTime();
  const now = new Date().getTime();
  const hoursElapsed = (now - orderTime) / (1000 * 60 * 60);
  const canCancel = isCod && !['Shipped', 'Delivered', 'Cancelled'].includes(order.status) && hoursElapsed <= 24;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-2xl border border-primary-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300 printable-invoice-card-${order.id}`}
    >
      {/* Order Header */}
      <div className="px-5 py-4 sm:px-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1 no-print">
            <span className="font-display font-semibold text-primary-800 text-sm tracking-wide uppercase">
              Order #{order.id}
            </span>
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-display font-semibold border ${cfg.color} ${cfg.bg}`}
            >
              {cfg.icon}
              {cfg.label}
            </span>
            {isCod && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-display font-bold uppercase tracking-wider bg-orange-50 border border-orange-200 text-orange-700">
                Cash on Delivery
              </span>
            )}
          </div>
          <p className="text-xs text-primary-500 font-sans">
            {new Date(order.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
          <p className="text-xs text-primary-500 font-sans mt-0.5">
            {order.items.length} item{order.items.length !== 1 ? 's' : ''} · Delivering to{' '}
            <strong>{order.shippingAddress.city}</strong>
          </p>
        </div>
        <div className="flex flex-row sm:flex-col items-center sm:items-end gap-3 sm:gap-1 shrink-0 no-print">
          <p className="font-display font-bold text-lg text-primary-800">
            {formatCurrency(order.total)}
          </p>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="text-xs text-primary-600 hover:text-primary-800 font-display flex items-center gap-1 underline-offset-2 hover:underline transition-colors"
            aria-expanded={expanded}
          >
            {expanded ? (
              <>
                Hide Details <ChevronUp size={13} />
              </>
            ) : (
              <>
                View Details <ChevronDown size={13} />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="px-5 sm:px-6 pb-4 no-print">
        <OrderProgressBar status={order.status} />
      </div>

      {/* Expandable Detail Section */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="border-t border-primary-50 px-5 sm:px-6 py-4 space-y-4">
              {/* Items list */}
              <div>
                <h4 className="text-xs font-display font-semibold text-primary-500 uppercase tracking-wider mb-3">
                  Items Ordered
                </h4>
                <div className="space-y-2.5">
                  {order.items.map((item) => (
                    <div key={item.productId} className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-cream-light shrink-0 border border-primary-100">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.productName}
                            width={56}
                            height={56}
                            className="w-full h-full object-cover"
                            unoptimized={item.image.startsWith('http')}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-primary-50">
                            <ShoppingBag size={20} className="text-primary-300" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-display font-medium text-primary-800 truncate">
                          {item.productName}
                        </p>
                        <p className="text-xs text-primary-500 font-sans">
                          Qty: {item.quantity} × {formatCurrency(item.price)}
                        </p>
                      </div>
                      <p className="text-sm font-display font-semibold text-primary-700 shrink-0">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping address & payment info */}
              <div className="pt-3 border-t border-primary-50 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-xs font-display font-semibold text-primary-500 uppercase tracking-wider mb-2">
                    Delivery Address
                  </h4>
                  <p className="text-xs text-primary-700 font-sans leading-relaxed">
                    {order.shippingAddress.address}, {order.shippingAddress.city},{' '}
                    {order.shippingAddress.state} — {order.shippingAddress.postalCode}
                    <br />
                    {order.shippingAddress.country}
                  </p>
                </div>
                <div>
                  <h4 className="text-xs font-display font-semibold text-primary-500 uppercase tracking-wider mb-2">
                    Payment Details
                  </h4>
                  <p className="text-xs text-primary-700 font-sans">
                    Method: <strong>{isCod ? 'Cash on Delivery (COD)' : 'Online Card Payment'}</strong>
                    <br />
                    Status: <strong className="capitalize">{order.status === 'Paid' ? 'Paid' : 'Pending Payment'}</strong>
                  </p>
                </div>
              </div>

              {/* Order total breakdown */}
              <div className="pt-3 border-t border-primary-50 flex justify-between items-center">
                <span className="text-sm font-display font-semibold text-primary-600">
                  Order Total
                </span>
                <span className="text-base font-display font-bold text-primary-800">
                  {formatCurrency(order.total)}
                </span>
              </div>

              {/* Actions group */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                {order.status === 'Delivered' ? (
                  <button
                    onClick={() => {
                      // Temporarily add a printable class to body to isolate this order's invoice
                      const originalClass = document.body.className;
                      document.body.classList.add('print-single-invoice');
                      
                      // We can print directly
                      window.print();
                      
                      // Restore original class
                      document.body.className = originalClass;
                    }}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-primary-800 hover:bg-primary-900 text-white rounded-xl font-display font-semibold text-xs uppercase tracking-wider transition-all shadow-sm hover:shadow-md cursor-pointer"
                  >
                    <Printer size={14} /> Print / Save Invoice
                  </button>
                ) : (
                  <div className="flex-1 flex flex-col justify-center">
                    <button
                      disabled
                      className="w-full flex items-center justify-center gap-2 py-2.5 bg-gray-100 text-gray-400 border border-gray-250/20 rounded-xl font-display font-semibold text-xs uppercase tracking-wider cursor-not-allowed"
                      title="Invoice is available once the order is delivered"
                    >
                      <Printer size={14} /> Invoice Locked
                    </button>
                    <span className="text-[9px] text-primary-500 font-sans mt-1 text-center">
                      * Printable invoice will be unlocked once order is delivered
                    </span>
                  </div>
                )}

                {canCancel && (
                  <button
                    onClick={() => setShowConfirmModal(true)}
                    disabled={cancelLoading}
                    className="flex-1 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-display font-semibold text-xs uppercase tracking-wider transition-all border border-red-200 cursor-pointer disabled:opacity-60"
                  >
                    {cancelLoading ? 'Cancelling...' : 'Cancel Order (COD Limit)'}
                  </button>
                )}
              </div>
            </div>
            
            {/* Embedded styles for printing this single invoice when expanded */}
            <style jsx global>{`
              @media print {
                body.print-single-invoice * {
                  visibility: hidden;
                  background: transparent !important;
                }
                body.print-single-invoice .printable-invoice-card-${order.id},
                body.print-single-invoice .printable-invoice-card-${order.id} * {
                  visibility: visible;
                }
                body.print-single-invoice .printable-invoice-card-${order.id} {
                  position: absolute;
                  left: 0;
                  top: 0;
                  width: 100%;
                  border: none !important;
                  box-shadow: none !important;
                  padding: 0 !important;
                  margin: 0 !important;
                }
                body.print-single-invoice .no-print {
                  display: none !important;
                }
              }
            `}</style>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/40 backdrop-blur-sm no-print">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-primary-100 p-6 max-w-sm w-full shadow-2xl text-center"
            >
              <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle size={26} />
              </div>
              <h3 className="font-display font-semibold text-primary-950 text-lg mb-2">
                Cancel Order
              </h3>
              <p className="text-xs text-primary-750/80 font-sans leading-relaxed mb-6">
                Are you sure you want to cancel order <strong className="font-mono text-primary-950">#{order.id}</strong>? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 py-2.5 bg-cream border border-primary-200 text-primary-700 rounded-xl font-display font-semibold text-xs uppercase tracking-wider hover:bg-primary-50 transition-all cursor-pointer"
                >
                  Go Back
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowConfirmModal(false);
                    confirmCancelOrder();
                  }}
                  className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-display font-semibold text-xs uppercase tracking-wider hover:bg-red-700 transition-all shadow-md hover:shadow-red-200 cursor-pointer"
                >
                  Yes, Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccessModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/40 backdrop-blur-sm no-print">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-primary-100 p-6 max-w-sm w-full shadow-2xl text-center"
            >
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CircleCheck size={26} className="animate-bounce" />
              </div>
              <h3 className="font-display font-semibold text-primary-950 text-lg mb-2">
                Order Cancelled
              </h3>
              <p className="text-xs text-primary-700/80 font-sans leading-relaxed mb-6">
                Your order <strong className="font-mono text-primary-950">#{order.id}</strong> has been cancelled successfully.
              </p>
              <button
                type="button"
                onClick={() => {
                  setShowSuccessModal(false);
                  onRefresh();
                }}
                className="w-full py-2.5 bg-primary-600 text-white rounded-xl font-display font-semibold text-xs uppercase tracking-wider hover:bg-primary-700 transition-all shadow-md cursor-pointer"
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Error Modal */}
      <AnimatePresence>
        {showErrorModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/40 backdrop-blur-sm no-print">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-primary-100 p-6 max-w-sm w-full shadow-2xl text-center"
            >
              <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle size={26} />
              </div>
              <h3 className="font-display font-semibold text-primary-950 text-lg mb-2">
                Failed to Cancel
              </h3>
              <p className="text-xs text-red-600/80 font-sans leading-relaxed mb-6">
                {errorMessage}
              </p>
              <button
                type="button"
                onClick={() => setShowErrorModal(false)}
                className="w-full py-2.5 bg-primary-600 text-white rounded-xl font-display font-semibold text-xs uppercase tracking-wider hover:bg-primary-700 transition-all shadow-md cursor-pointer"
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function MyOrdersPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchOrders = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    setError('');

    try {
      const res = await fetch(`/api/orders/my?email=${encodeURIComponent(user?.email || '')}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to fetch orders');
      }
      const data: Order[] = await res.json();
      setOrders(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!mounted) return;
    if (!isAuthenticated()) {
      router.push('/login?redirect=/orders');
      return;
    }
    if (user?.email) {
      fetchOrders();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, mounted]);

  // Always render null on server (before mount) to avoid hydration mismatch
  if (!mounted) return null;
  if (!isAuthenticated()) return null;

  return (
    <div className="min-h-screen bg-cream py-8 sm:py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8 no-print">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-display font-semibold text-primary-800 tracking-wide">
                My Orders
              </h1>
              <p className="text-sm text-primary-500 font-sans mt-1">
                Showing orders for <strong>{user?.email}</strong>
              </p>
            </div>
            <button
              onClick={() => fetchOrders(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-primary-200 text-primary-700 text-sm font-display hover:bg-primary-50 transition-all duration-200 disabled:opacity-60 self-start sm:self-auto shadow-sm"
            >
              <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
              {refreshing ? 'Refreshing…' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-primary-100 p-6 animate-pulse">
                <div className="flex justify-between items-start">
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-32 bg-primary-100 rounded-full" />
                    <div className="h-3 w-48 bg-primary-50 rounded-full" />
                  </div>
                  <div className="h-5 w-20 bg-primary-100 rounded-full" />
                </div>
                <div className="mt-4 flex items-center gap-2">
                  {[1, 2, 3, 4].map((j) => (
                    <React.Fragment key={j}>
                      <div className="w-7 h-7 rounded-full bg-primary-100" />
                      {j < 4 && <div className="h-0.5 flex-1 bg-primary-50 rounded" />}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle size={28} className="text-red-400" />
            </div>
            <p className="text-primary-700 font-display font-semibold mb-1">Could not load orders</p>
            <p className="text-sm text-primary-500 font-sans mb-6">{error}</p>
            <button
              onClick={() => fetchOrders()}
              className="px-6 py-2.5 bg-primary-600 text-white rounded-full font-display text-sm hover:bg-primary-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && orders.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <ShoppingBag size={32} className="text-primary-300" />
            </div>
            <h2 className="text-xl font-display font-semibold text-primary-700 mb-2">
              No orders yet
            </h2>
            <p className="text-sm text-primary-400 font-sans mb-8 max-w-xs mx-auto">
              You haven't placed any orders yet. Start exploring our premium baby skin care products.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-7 py-3 bg-primary-600 text-white font-display font-medium text-sm rounded-full hover:bg-primary-700 transition-all duration-300 shadow-sm hover:shadow-md"
            >
              Shop Now <ArrowRight size={15} />
            </Link>
          </motion.div>
        )}

        {/* Orders List */}
        {!loading && !error && orders.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {orders.map((order, idx) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.07 }}
              >
                <OrderCard order={order} onRefresh={() => fetchOrders()} />
              </motion.div>
            ))}

            {/* Footer CTA */}
            <div className="pt-6 text-center no-print">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 text-sm text-primary-600 font-display hover:text-primary-800 transition-colors underline-offset-4 hover:underline"
              >
                Continue Shopping <ArrowRight size={14} />
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
