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
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 bg-cream/40">
      <div className="w-full max-w-md bg-white/70 backdrop-blur-md border border-primary-200/50 rounded-3xl p-8 shadow-xl">
        <div className="text-center mb-8">
          <Link href="/" className="font-display font-semibold text-2xl text-primary-950 tracking-wider">
            NURTURE & DEW
          </Link>
          <p className="text-xs text-primary-700/60 font-sans mt-2">
            {isSignUp ? 'Create your premium customer account' : 'Sign in to place orders and manage your account'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-700 rounded-2xl flex items-start space-x-2 text-xs font-sans">
            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-2xl flex items-start space-x-2 text-xs font-sans">
            <CheckCircle size={16} className="mt-0.5 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {isSignUp && (
            <div className="space-y-1.5">
              <label className="block text-[10px] font-display font-semibold text-primary-950 uppercase tracking-wider">
                Full Name *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Baby's Parent Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-cream-light/60 border border-primary-200 rounded-xl text-xs outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-100 transition-all duration-300"
                />
                <User className="absolute left-3.5 top-3.5 text-primary-600" size={14} />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-[10px] font-display font-semibold text-primary-950 uppercase tracking-wider">
              Email Address *
            </label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="parent@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-cream-light/60 border border-primary-200 rounded-xl text-xs outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-100 transition-all duration-300"
              />
              <Mail className="absolute left-3.5 top-3.5 text-primary-600" size={14} />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-display font-semibold text-primary-950 uppercase tracking-wider">
              Password *
            </label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-cream-light/60 border border-primary-200 rounded-xl text-xs outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-100 transition-all duration-300"
              />
              <Lock className="absolute left-3.5 top-3.5 text-primary-600" size={14} />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-primary-600 text-white font-display font-semibold text-xs tracking-wider uppercase rounded-xl shadow-md hover:bg-primary-700 transition-colors flex items-center justify-center space-x-2 disabled:bg-primary-300"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-primary-200/40 text-center">
          <p className="text-xs text-primary-800">
            {isSignUp ? 'Already have an account?' : "Don't have an account yet?"}{' '}
            <button
              onClick={() => {
                setError('');
                setIsSignUp(!isSignUp);
              }}
              className="font-semibold text-primary-600 hover:underline transition-colors"
            >
              {isSignUp ? 'Sign In here' : 'Sign Up here'}
            </button>
          </p>
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
