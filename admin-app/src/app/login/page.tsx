'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../store/useAuthStore';
import { Lock, Mail, AlertTriangle, CheckCircle } from 'lucide-react';
import { getApiBaseUrl } from '../../utils/api';

export default function AdminLogin() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

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
    setSuccessMsg('');

    const apiBaseUrl = getApiBaseUrl();

    try {
      const res = await fetch(`${apiBaseUrl}/api/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
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
      setSuccessMsg('Logged in successfully! Redirecting to panel...');
      login(data.user, data.token);
      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'An error occurred connecting to the storefront API.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cream via-cream-light/60 to-cream/80 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full bg-white/80 backdrop-blur-xl border border-primary-100 rounded-[32px] shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[600px]">
        
        {/* Form Column */}
        <div className="col-span-1 md:col-span-7 p-8 sm:p-12 flex flex-col justify-between">
          <div>
            {/* Header logo */}
            <div className="mb-6">
              <span className="font-display text-sm tracking-widest text-primary-800 font-semibold block uppercase">
                NURTURE & DEW
              </span>
              <h2 className="mt-3 text-xl sm:text-2xl font-display font-medium text-primary-900 tracking-wide">
                Admin Console Sign In
              </h2>
              <p className="mt-1 text-xs text-primary-750/70 font-sans">
                Securely connect to store data services.
              </p>
            </div>

            {/* Demo login notice */}
            <div className="bg-primary-50/60 border border-primary-100/80 rounded-2xl p-4 text-[11px] text-left leading-relaxed text-primary-900 space-y-1.5 font-sans mb-6">
              <p className="font-semibold uppercase tracking-wider text-primary-700 text-[9px]">Preconfigured Admin Account:</p>
              <div className="flex flex-col sm:flex-row sm:space-x-6 space-y-1 sm:space-y-0">
                <p>Email: <span className="font-mono font-medium text-primary-950">admin@babyskin.com</span></p>
                <p>Password: <span className="font-mono font-medium text-primary-950">admin123</span></p>
              </div>
            </div>

            {/* Login Form */}
            <form className="space-y-4" onSubmit={handleSubmit}>
              {/* Email input */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-display font-semibold text-primary-900 uppercase tracking-widest">
                  Administrator Email
                </label>
                <div className="relative group">
                  <span className="absolute inset-y-0 left-4 flex items-center text-primary-500 group-focus-within:text-primary-600 transition-colors">
                    <Mail size={15} />
                  </span>
                  <input
                    type="email"
                    required
                    placeholder="admin@babyskin.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-cream-light/40 border border-primary-200/80 rounded-2xl text-xs outline-none focus:border-primary-600 focus:ring-4 focus:ring-primary-100/50 transition-all duration-300 placeholder:text-primary-400"
                  />
                </div>
              </div>

              {/* Password input */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-display font-semibold text-primary-900 uppercase tracking-widest">
                  Secure Password
                </label>
                <div className="relative group">
                  <span className="absolute inset-y-0 left-4 flex items-center text-primary-500 group-focus-within:text-primary-600 transition-colors">
                    <Lock size={15} />
                  </span>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-cream-light/40 border border-primary-200/80 rounded-2xl text-xs outline-none focus:border-primary-600 focus:ring-4 focus:ring-primary-100/50 transition-all duration-300 placeholder:text-primary-400"
                  />
                </div>
              </div>

              {errorMsg && (
                <div className="bg-red-50/80 text-red-700 text-xs rounded-2xl p-3.5 border border-red-200 flex items-start space-x-2 text-left font-sans animate-shake">
                  <AlertTriangle size={16} className="mt-0.5 flex-shrink-0 text-red-600" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="bg-emerald-50/80 text-emerald-700 text-xs rounded-2xl p-3.5 border border-emerald-100 flex items-start space-x-2 text-left font-sans animate-fade-in">
                  <CheckCircle size={16} className="mt-0.5 flex-shrink-0 text-emerald-600" />
                  <span>{successMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-display font-semibold text-xs tracking-widest uppercase shadow-lg hover:shadow-xl hover:shadow-primary-100/50 transition-all duration-300 focus:outline-none disabled:opacity-50 transform active:scale-[0.98]"
              >
                {loading ? 'Verifying Credentials...' : 'Sign In To Panel'}
              </button>
            </form>
          </div>

          <div className="mt-6 pt-4 text-center">
            <p className="text-[10px] text-primary-700/60 font-sans">
              Authorized personnel only. Sessions are monitored and encrypted.
            </p>
          </div>
        </div>

        {/* Banner Column */}
        <div className="hidden md:block md:col-span-5 relative overflow-hidden bg-charcoal">
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-90 transition-transform duration-700 hover:scale-105"
            style={{ backgroundImage: `url('/admin_login_banner.png')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/50 via-transparent to-transparent" />
          <div className="absolute inset-x-6 bottom-8 p-6 bg-charcoal/65 backdrop-blur-md rounded-2xl border border-white/10 text-white flex flex-col">
            <span className="text-[9px] font-display font-semibold uppercase tracking-widest text-primary-200 mb-1.5">
              Management Portal
            </span>
            <h3 className="font-display text-lg font-medium tracking-wide mb-2 leading-snug">
              Nurture & Dew Control Panel
            </h3>
            <p className="text-[11px] text-white/75 font-sans leading-relaxed">
              Configure catalogue items, manage pending customer orders, review ratings, and keep store settings up to date.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
