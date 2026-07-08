'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '../../store/useAuthStore';
import { Mail, Lock, User, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const { login, user } = useAuthStore();
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push(redirect);
    }
  }, [user, router, redirect]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Simple delay for realistic experience
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (!email || !password || (isSignUp && !name)) {
      setError('Please fill in all required fields.');
      setLoading(false);
      return;
    }

    try {
      // Get existing registered users list
      const usersStr = localStorage.getItem('baby_skin_care_registered_customers') || '[]';
      const users = JSON.parse(usersStr);

      if (isSignUp) {
        // Sign Up Flow
        const exists = users.some((u: any) => u.email.toLowerCase() === email.toLowerCase());
        if (exists) {
          setError('An account with this email already exists.');
          setLoading(false);
          return;
        }

        // Add new user
        const newUser = { name, email: email.toLowerCase(), password };
        users.push(newUser);
        localStorage.setItem('baby_skin_care_registered_customers', JSON.stringify(users));

        // Auto-login
        login({ name, email: email.toLowerCase() }, 'mock-customer-session-token');
        setSuccess('Account created successfully! Redirecting...');
        
        setTimeout(() => {
          router.push(redirect);
        }, 1000);
      } else {
        // Sign In Flow
        // Default guest/test account check
        if (email.toLowerCase() === 'user@example.com' && password === 'password') {
          login({ name: 'Guest Customer', email: 'user@example.com' }, 'mock-customer-session-token');
          setSuccess('Logged in successfully! Redirecting...');
          setTimeout(() => router.push(redirect), 1000);
          return;
        }

        const matchedUser = users.find(
          (u: any) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
        );

        if (!matchedUser) {
          setError('Invalid email or password. Use user@example.com / password or create a new account.');
          setLoading(false);
          return;
        }

        login({ name: matchedUser.name, email: matchedUser.email }, 'mock-customer-session-token');
        setSuccess('Logged in successfully! Redirecting...');
        
        setTimeout(() => {
          router.push(redirect);
        }, 1000);
      }
    } catch (err) {
      setError('An error occurred during authentication. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-gradient-to-br from-cream via-cream-light/60 to-cream/80">
      <div className="w-full max-w-4xl bg-white/80 backdrop-blur-xl border border-primary-100 rounded-[32px] shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[600px]">
        {/* Form Column */}
        <div className="col-span-1 md:col-span-7 p-8 sm:p-12 flex flex-col justify-between">
          <div>
            <div className="mb-10">
              <Link href="/" className="font-display font-semibold text-2xl text-charcoal tracking-widest uppercase hover:opacity-80 transition-opacity">
                NURTURE & DEW
              </Link>
              <p className="text-xs text-primary-800/80 font-sans mt-2.5">
                {isSignUp ? 'Create your premium customer account' : 'Sign in to place orders and manage your account'}
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50/80 border border-red-200 text-red-700 rounded-2xl flex items-start space-x-2.5 text-xs font-sans">
                <AlertCircle size={16} className="mt-0.5 flex-shrink-0 text-red-650" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-emerald-50/80 border border-emerald-100 text-emerald-700 rounded-2xl flex items-start space-x-2.5 text-xs font-sans">
                <CheckCircle size={16} className="mt-0.5 flex-shrink-0 text-emerald-600" />
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {isSignUp && (
                <div className="space-y-2">
                  <label className="block text-[10px] font-display font-semibold text-primary-900 uppercase tracking-widest">
                    Full Name *
                  </label>
                  <div className="relative group">
                    <input
                      type="text"
                      required
                      placeholder="Baby's Parent Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 bg-cream-light/40 border border-primary-200/80 rounded-2xl text-xs outline-none focus:border-primary-600 focus:ring-4 focus:ring-primary-100/50 transition-all duration-300 placeholder:text-primary-400"
                    />
                    <User className="absolute left-4 top-4 text-primary-500 group-focus-within:text-primary-700 transition-colors" size={15} />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-[10px] font-display font-semibold text-primary-900 uppercase tracking-widest">
                  Email Address *
                </label>
                <div className="relative group">
                  <input
                    type="email"
                    required
                    placeholder="parent@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-cream-light/40 border border-primary-200/80 rounded-2xl text-xs outline-none focus:border-primary-600 focus:ring-4 focus:ring-primary-100/50 transition-all duration-300 placeholder:text-primary-400"
                  />
                  <Mail className="absolute left-4 top-4 text-primary-500 group-focus-within:text-primary-700 transition-colors" size={15} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-display font-semibold text-primary-900 uppercase tracking-widest">
                  Password *
                </label>
                <div className="relative group">
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-cream-light/40 border border-primary-200/80 rounded-2xl text-xs outline-none focus:border-primary-600 focus:ring-4 focus:ring-primary-100/50 transition-all duration-300 placeholder:text-primary-400"
                  />
                  <Lock className="absolute left-4 top-4 text-primary-500 group-focus-within:text-primary-700 transition-colors" size={15} />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white font-display font-semibold text-xs tracking-widest uppercase rounded-2xl shadow-lg hover:shadow-xl hover:shadow-primary-100/50 transition-all duration-300 flex items-center justify-center space-x-2 disabled:bg-primary-300 transform active:scale-[0.98]"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="mt-8 pt-6 border-t border-primary-100 text-center">
            <p className="text-xs text-primary-800/80 font-sans">
              {isSignUp ? 'Already have an account?' : "Don't have an account yet?"}{' '}
              <button
                onClick={() => {
                  setError('');
                  setIsSignUp(!isSignUp);
                }}
                className="font-semibold text-primary-600 hover:text-primary-800 hover:underline transition-colors focus:outline-none"
              >
                {isSignUp ? 'Sign In here' : 'Sign Up here'}
              </button>
            </p>
          </div>
        </div>

        {/* Banner Column */}
        <div className="hidden md:block md:col-span-5 relative overflow-hidden bg-charcoal">
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-90 transition-transform duration-700 hover:scale-105"
            style={{ backgroundImage: `url('/customer_login_banner.png')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/50 via-transparent to-transparent" />
          <div className="absolute inset-x-6 bottom-8 p-6 bg-charcoal/65 backdrop-blur-md rounded-2xl border border-white/10 text-white flex flex-col">
            <span className="text-[9px] font-display font-semibold uppercase tracking-widest text-primary-200 mb-1.5">
              Premium Ayurvedic Care
            </span>
            <h3 className="font-display text-lg font-medium tracking-wide mb-2 leading-snug">
              Nurturing With Natural Saffron & Cold-Pressed Oils
            </h3>
            <p className="text-[11px] text-white/75 font-sans leading-relaxed">
              Experience dermatologist-tested, hypoallergenic skin care designed specially for your baby's delicate touch.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CustomerLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[80vh] flex items-center justify-center font-display text-primary-600 animate-pulse">
        Loading login panel...
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
