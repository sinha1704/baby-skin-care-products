'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../store/useAuthStore';
import { Lock, Mail, AlertTriangle } from 'lucide-react';
import { getApiBaseUrl } from '../../utils/api';

export default function AdminLogin() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Already authenticated fallback check
  useEffect(() => {
    if (isAuthenticated()) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const apiBaseUrl = getApiBaseUrl();

    try {
      const res = await fetch(`${apiBaseUrl}/api/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error?.formErrors?.[0] || 
          data.error?.fieldErrors?.email?.[0] || 
          'Invalid administrator credentials'
        );
      }

      // Login success
      login(data.user, data.token);
      router.push('/dashboard');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'An error occurred connecting to the storefront API.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white/70 backdrop-blur-sm border border-primary-200/40 p-8 sm:p-10 rounded-3xl shadow-sm text-center">
        {/* Header logo */}
        <div>
          <span className="font-display text-lg tracking-widest text-primary-800 font-semibold block">
            NURTURE & DEW
          </span>
          <h2 className="mt-4 text-xl sm:text-2xl font-display font-medium text-primary-950">
            Admin Console Sign In
          </h2>
          <p className="mt-1.5 text-xs text-primary-700/60 font-sans">
            Connect to Customer Portal API (Port 3000) to authorize.
          </p>
        </div>

        {/* Demo login notice */}
        <div className="bg-primary-50 border border-primary-100 rounded-2xl p-4 text-[10px] text-left leading-relaxed text-primary-800 space-y-1 font-sans">
          <p className="font-semibold uppercase tracking-wider text-primary-700">Preconfigured Admin Account:</p>
          <p>• Email: <span className="font-mono">admin@babyskin.com</span></p>
          <p>• Password: <span className="font-mono">admin123</span></p>
        </div>

        {/* Login Form */}
        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          {/* Email input */}
          <div className="relative">
            <span className="absolute inset-y-0 left-4 flex items-center text-primary-600">
              <Mail size={16} />
            </span>
            <input
              type="email"
              required
              placeholder="Administrator Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-cream-light border border-primary-200 rounded-xl text-xs outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-100 transition-all duration-300"
            />
          </div>

          {/* Password input */}
          <div className="relative">
            <span className="absolute inset-y-0 left-4 flex items-center text-primary-600">
              <Lock size={16} />
            </span>
            <input
              type="password"
              required
              placeholder="Secure Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-cream-light border border-primary-200 rounded-xl text-xs outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-100 transition-all duration-300"
            />
          </div>

          {errorMsg && (
            <div className="bg-red-50 text-red-650 text-xs rounded-xl p-3 border border-red-200 flex items-start space-x-2 text-left">
              <AlertTriangle size={16} className="mt-0.5 flex-shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-primary-600 hover:bg-primary-700 text-white rounded-full font-display font-medium text-xs tracking-wider uppercase shadow-sm transition-all focus:outline-none disabled:opacity-50"
          >
            {loading ? 'Verifying Credentials...' : 'Sign In To Panel'}
          </button>
        </form>
      </div>
    </div>
  );
}
