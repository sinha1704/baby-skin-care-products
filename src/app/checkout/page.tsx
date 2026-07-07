'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '../../store/useCartStore';
import { useAuthStore } from '../../store/useAuthStore';
import { formatCurrency } from '../../utils/currency';
import { getStripe } from '../../utils/stripe';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { ShoppingBag, ShieldCheck, CreditCard, ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

// Stripe Card Element Styling
const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: '#2d2a29',
      fontFamily: 'Inter, sans-serif',
      fontSmoothing: 'antialiased',
      fontSize: '14px',
      '::placeholder': {
        color: '#a0aec0',
      },
    },
    invalid: {
      color: '#e53e3e',
      iconColor: '#e53e3e',
    },
  },
};

export default function Checkout() {
  const router = useRouter();
  const { items, getSubtotal, clearCart } = useCartStore();

  const { user } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);

  // Form Fields
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Payment State
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [paymentIntent, setPaymentIntent] = useState<{
    clientSecret: string;
    isSimulated: boolean;
  } | null>(null);

  // Simulated Card Info (for sandbox mode)
  const [simulatedCard, setSimulatedCard] = useState({
    number: '',
    expiry: '',
    cvv: '',
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect if not logged in
  useEffect(() => {
    if (mounted && !user) {
      router.push('/login?redirect=/checkout');
    }
  }, [user, mounted, router]);

  // Pre-fill name and email once user state is loaded
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: prev.name || user.name,
        email: prev.email || user.email
      }));
    }
  }, [user]);

  if (!mounted) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center font-display text-primary-600 animate-pulse">
        Initializing secure checkout...
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <div className="bg-primary-100 rounded-full p-4 text-primary-600 w-16 h-16 flex items-center justify-center mx-auto mb-6">
          <ShoppingBag size={28} />
        </div>
        <h2 className="font-display font-medium text-lg text-primary-950 mb-2">
          Your cart is empty
        </h2>
        <p className="text-xs text-primary-700/60 font-sans mb-6 leading-relaxed">
          You must add items to your cart before proceeding to checkout.
        </p>
        <button
          onClick={() => router.push('/shop')}
          className="px-6 py-2.5 bg-primary-600 text-white rounded-full text-xs font-display font-medium uppercase tracking-wide hover:bg-primary-700 transition-colors"
        >
          Return to Shop
        </button>
      </div>
    );
  }

  const subtotal = getSubtotal();
  const shipping = subtotal >= 999 ? 0 : 99; // Free shipping over ₹999
  const total = subtotal + shipping;

  const validateStep1 = () => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = 'Full name is required';
    if (!formData.email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Invalid email address';
    }
    if (!formData.address.trim()) errors.address = 'Street address is required';
    if (!formData.city.trim()) errors.city = 'City is required';
    if (!formData.state.trim()) errors.state = 'State/Province is required';
    if (!formData.postalCode.trim()) {
      errors.postalCode = 'PIN code is required';
    } else if (!/^\d{6}$/.test(formData.postalCode.trim())) {
      errors.postalCode = 'PIN code must be exactly 6 digits';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep1()) return;

    setPaymentLoading(true);
    setPaymentError('');

    try {
      // Fetch stripe payment intent
      const res = await fetch('/api/checkout/stripe-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: total,
          email: formData.email,
        }),
      });

      if (!res.ok) throw new Error('Failed to load payment channel');

      const data = await res.json();
      setPaymentIntent({
        clientSecret: data.clientSecret,
        isSimulated: data.isSimulated,
      });

      setStep(2);
    } catch (err: any) {
      console.error(err);
      setPaymentError(err.message || 'Unable to establish secure checkout. Try again.');
    } finally {
      setPaymentLoading(false);
    }
  };

  // Submit Simulated Payment Order
  const handleSimulatedPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!simulatedCard.number || !simulatedCard.expiry || !simulatedCard.cvv) {
      setPaymentError('Please fill in all simulated card details');
      return;
    }

    setPaymentLoading(true);
    setPaymentError('');

    try {
      // Submit order details to our Mock Order Database API
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: formData.name,
          customerEmail: formData.email,
          shippingAddress: {
            address: formData.address,
            city: formData.city,
            state: formData.state,
            postalCode: formData.postalCode,
            country: formData.country,
          },
          total: total,
          items: items.map(item => ({
            productId: item.id,
            productName: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image
          })),
          paymentIntentId: paymentIntent?.clientSecret || 'simulated_intent_id'
        }),
      });

      if (!res.ok) throw new Error('Failed to process simulated order');
      const order = await res.json();

      // Clear the Shopping Cart
      clearCart();
      router.push(`/checkout/success?orderId=${order.id}`);
    } catch (err: any) {
      console.error(err);
      setPaymentError(err.message || 'Error processing order');
      setPaymentLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      {/* Page Title */}
      <div className="border-b border-primary-200/50 pb-6 mb-10 text-center">
        <h1 className="text-3xl font-display font-semibold text-primary-950">
          Secure Checkout
        </h1>
        <div className="flex items-center justify-center space-x-2 mt-2 text-xs text-primary-700/60 font-sans">
          <span className={`${step === 1 ? 'text-primary-800 font-semibold' : ''}`}>1. Shipping Info</span>
          <span>→</span>
          <span className={`${step === 2 ? 'text-primary-800 font-semibold' : ''}`}>2. Secure Payment</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Side: Forms */}
        <div className="lg:col-span-7">
          {step === 1 ? (
            /* STEP 1: Shipping Details Form */
            <form onSubmit={handleStep1Submit} className="bg-white/60 backdrop-blur-sm border border-primary-200/40 rounded-3xl p-6 sm:p-8 space-y-6">
              <h2 className="font-display font-medium text-lg text-primary-950 border-b border-primary-200/20 pb-3 flex items-center">
                <CheckCircle2 size={18} className="text-primary-600 mr-2" />
                Shipping & Contact Details
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-display font-semibold text-primary-900 uppercase tracking-wider mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full px-4 py-2.5 bg-white border rounded-xl text-xs outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-100 transition-all ${
                      formErrors.name ? 'border-red-300' : 'border-primary-200'
                    }`}
                  />
                  {formErrors.name && <p className="mt-1 text-[10px] text-red-500">{formErrors.name}</p>}
                </div>

                <div>
                  <label className="block text-[10px] font-display font-semibold text-primary-900 uppercase tracking-wider mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`w-full px-4 py-2.5 bg-white border rounded-xl text-xs outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-100 transition-all ${
                      formErrors.email ? 'border-red-300' : 'border-primary-200'
                    }`}
                  />
                  {formErrors.email && <p className="mt-1 text-[10px] text-red-500">{formErrors.email}</p>}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-display font-semibold text-primary-900 uppercase tracking-wider mb-1">
                  Street Address
                </label>
                <input
                  type="text"
                  placeholder="123 Main St, Apt 4B"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className={`w-full px-4 py-2.5 bg-white border rounded-xl text-xs outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-100 transition-all ${
                    formErrors.address ? 'border-red-300' : 'border-primary-200'
                  }`}
                />
                {formErrors.address && <p className="mt-1 text-[10px] text-red-500">{formErrors.address}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-display font-semibold text-primary-900 uppercase tracking-wider mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    placeholder="New York"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className={`w-full px-4 py-2.5 bg-white border rounded-xl text-xs outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-100 transition-all ${
                      formErrors.city ? 'border-red-300' : 'border-primary-200'
                    }`}
                  />
                  {formErrors.city && <p className="mt-1 text-[10px] text-red-500">{formErrors.city}</p>}
                </div>

                <div>
                  <label className="block text-[10px] font-display font-semibold text-primary-900 uppercase tracking-wider mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Maharashtra"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className={`w-full px-4 py-2.5 bg-white border rounded-xl text-xs outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-100 transition-all ${
                      formErrors.state ? 'border-red-300' : 'border-primary-200'
                    }`}
                  />
                  {formErrors.state && <p className="mt-1 text-[10px] text-red-500">{formErrors.state}</p>}
                </div>

                <div>
                  <label className="block text-[10px] font-display font-semibold text-primary-900 uppercase tracking-wider mb-1">
                    PIN Code (6 digits)
                  </label>
                  <input
                    type="text"
                    placeholder="400001"
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    className={`w-full px-4 py-2.5 bg-white border rounded-xl text-xs outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-100 transition-all ${
                      formErrors.postalCode ? 'border-red-300' : 'border-primary-200'
                    }`}
                  />
                  {formErrors.postalCode && <p className="mt-1 text-[10px] text-red-500">{formErrors.postalCode}</p>}
                </div>
              </div>

              {paymentError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl p-4">
                  {paymentError}
                </div>
              )}

              <button
                type="submit"
                disabled={paymentLoading}
                className="w-full inline-flex items-center justify-center px-6 py-3.5 bg-primary-600 hover:bg-primary-700 text-white rounded-full font-display font-medium text-xs tracking-wider uppercase shadow-sm transition-all"
              >
                {paymentLoading ? 'Connecting...' : 'Proceed to Payment'}
                <ArrowRight size={14} className="ml-2" />
              </button>
            </form>
          ) : (
            /* STEP 2: Secure Payment Form */
            <div className="space-y-6">
              {paymentIntent?.isSimulated ? (
                /* Simulated Sandbox Payment Form */
                <form onSubmit={handleSimulatedPaymentSubmit} className="bg-white/60 backdrop-blur-sm border border-primary-200/40 rounded-3xl p-6 sm:p-8 space-y-6">
                  <h2 className="font-display font-medium text-lg text-primary-955 border-b border-primary-200/20 pb-3 flex items-center">
                    <CreditCard size={18} className="text-primary-600 mr-2" />
                    Simulated Sandbox Payment
                  </h2>

                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-[11px] text-amber-850 leading-relaxed font-sans">
                    <strong>Demo Mode Active:</strong> Stripe keys are using placeholders. You can test the checkout flow offline by entering mock card numbers.
                  </div>

                  <div>
                    <label className="block text-[10px] font-display font-semibold text-primary-900 uppercase tracking-wider mb-1">
                      Simulated Card Number
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="4242 4242 4242 4242"
                      value={simulatedCard.number}
                      onChange={(e) => setSimulatedCard({ ...simulatedCard, number: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white border border-primary-200 rounded-xl text-xs outline-none focus:border-primary-600 focus:ring-2"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-display font-semibold text-primary-900 uppercase tracking-wider mb-1">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="MM/YY"
                        value={simulatedCard.expiry}
                        onChange={(e) => setSimulatedCard({ ...simulatedCard, expiry: e.target.value })}
                        className="w-full px-4 py-2.5 bg-white border border-primary-200 rounded-xl text-xs outline-none focus:border-primary-600 focus:ring-2"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-display font-semibold text-primary-900 uppercase tracking-wider mb-1">
                        CVV / CVC
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="123"
                        value={simulatedCard.cvv}
                        onChange={(e) => setSimulatedCard({ ...simulatedCard, cvv: e.target.value })}
                        className="w-full px-4 py-2.5 bg-white border border-primary-200 rounded-xl text-xs outline-none focus:border-primary-600 focus:ring-2"
                      />
                    </div>
                  </div>

                  {paymentError && (
                    <div className="bg-red-50 text-red-600 text-xs rounded-xl p-3 border border-red-200">
                      {paymentError}
                    </div>
                  )}

                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="w-1/3 py-3 bg-cream border border-primary-200 rounded-full font-display font-medium text-xs text-primary-850 uppercase transition-all"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={paymentLoading}
                      className="w-2/3 py-3 bg-primary-800 hover:bg-primary-900 text-white rounded-full font-display font-semibold text-xs uppercase shadow-md transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {paymentLoading ? 'Authorizing Mock Order...' : `Pay ${formatCurrency(total)}`}
                    </button>
                  </div>
                </form>
              ) : (
                /* Real Stripe Elements Form */
                <Elements stripe={getStripe()} options={{ clientSecret: paymentIntent?.clientSecret }}>
                  <RealStripePaymentForm
                    clientSecret={paymentIntent?.clientSecret || ''}
                    formData={formData}
                    total={total}
                    items={items}
                    setStep={setStep}
                    clearCart={clearCart}
                  />
                </Elements>
              )}
            </div>
          )}
        </div>

        {/* Right Side: Order Summary Panel */}
        <div className="lg:col-span-5">
          <div className="bg-white/60 border border-primary-200/40 rounded-3xl p-6 space-y-6 sticky top-28">
            <h3 className="font-display font-semibold text-primary-950 text-base pb-3 border-b border-primary-200/30 flex items-center">
              <ShoppingBag size={16} className="text-primary-600 mr-2" />
              Order Summary
            </h3>

            {/* Product items list */}
            <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.id} className="flex items-center space-x-3 text-xs">
                  <div className="w-12 h-12 rounded-lg bg-primary-50 overflow-hidden flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.image} alt={item.name} className="object-cover w-full h-full" />
                  </div>
                  <div className="flex-grow min-w-0">
                    <h4 className="font-display font-medium text-primary-950 truncate">{item.name}</h4>
                    <span className="text-primary-700/60 font-sans">Qty: {item.quantity}</span>
                  </div>
                  <span className="font-semibold text-primary-950">{formatCurrency(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="space-y-3.5 pt-4 border-t border-primary-200/30 text-xs">
              <div className="flex justify-between font-sans text-primary-800">
                <span>Subtotal</span>
                <span className="font-medium text-primary-950">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between font-sans text-primary-800">
                <span>Shipping</span>
                <span>{shipping === 0 ? 'Free' : formatCurrency(shipping)}</span>
              </div>
              <div className="flex justify-between font-display font-semibold text-sm text-primary-950 pt-2 border-t border-primary-200/20">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>

            <div className="bg-cream-light/60 p-4 rounded-2xl flex items-start space-x-3 text-[10px] leading-relaxed text-primary-800">
              <ShieldCheck size={18} className="text-emerald-700 mt-0.5 flex-shrink-0" />
              <div>
                <strong>Secure Payment Protection:</strong> Payments are processed via encrypted SSL servers. Stripe test credentials supported.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Inner Component: Handles Real Stripe Card Elements Submission
interface RealStripeFormProps {
  clientSecret: string;
  formData: any;
  total: number;
  items: any[];
  setStep: (step: 1 | 2) => void;
  clearCart: () => void;
}

function RealStripePaymentForm({
  clientSecret,
  formData,
  total,
  items,
  setStep,
  clearCart,
}: RealStripeFormProps) {
  const router = useRouter();
  const stripe = useStripe();
  const elements = useElements();

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) return;

    setLoading(true);
    setErrorMsg('');

    try {
      // Confirm payment with Stripe SDK
      const { paymentIntent, error } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: formData.name,
            email: formData.email,
          },
        },
      });

      if (error) {
        throw new Error(error.message || 'Payment authentication failed');
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Create order record on database
        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerName: formData.name,
            customerEmail: formData.email,
            shippingAddress: {
              address: formData.address,
              city: formData.city,
              state: formData.state,
              postalCode: formData.postalCode,
              country: formData.country,
            },
            total: total,
            items: items.map(item => ({
              productId: item.id,
              productName: item.name,
              price: item.price,
              quantity: item.quantity,
              image: item.image
            })),
            paymentIntentId: paymentIntent.id
          }),
        });

        if (!res.ok) throw new Error('Order creation logging failed');
        const order = await res.json();

        clearCart();
        router.push(`/checkout/success?orderId=${order.id}`);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Error processing credit card payment.');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white/60 backdrop-blur-sm border border-primary-200/40 rounded-3xl p-6 sm:p-8 space-y-6">
      <h2 className="font-display font-medium text-lg text-primary-955 border-b border-primary-200/20 pb-3 flex items-center">
        <CreditCard size={18} className="text-primary-600 mr-2" />
        Credit Card Payment
      </h2>

      <div className="p-4 bg-white border border-primary-200 rounded-2xl">
        <CardElement options={CARD_ELEMENT_OPTIONS} />
      </div>

      {errorMsg && (
        <div className="bg-red-50 text-red-600 text-xs rounded-xl p-3 border border-red-200">
          {errorMsg}
        </div>
      )}

      <div className="flex space-x-4">
        <button
          type="button"
          onClick={() => setStep(1)}
          className="w-1/3 py-3 bg-cream border border-primary-200 rounded-full font-display font-medium text-xs text-primary-850 uppercase transition-all"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={loading || !stripe}
          className="w-2/3 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-full font-display font-semibold text-xs uppercase shadow-sm transition-all"
        >
          {loading ? 'Authorizing Payment...' : `Pay ${formatCurrency(total)}`}
        </button>
      </div>
    </form>
  );
}
