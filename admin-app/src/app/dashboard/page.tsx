'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore } from '../../store/useAuthStore';
import { formatCurrency } from '../../utils/currency';
import { Badge } from '../../components/ui/Badge';
import { DollarSign, FileText, AlertTriangle, Folders, ShoppingBag } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  price: number;
  stock: number;
  images: string[];
}

interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  total: number;
  status: 'Pending' | 'Paid' | 'Shipped' | 'Delivered' | 'Cancelled';
  createdAt: string;
}

export default function AdminDashboard() {
  const { token } = useAuthStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      };

      try {
        // Fetch products
        const pRes = await fetch(`${apiBaseUrl}/api/products`);
        if (pRes.ok) {
          const pData = await pRes.json();
          setProducts(pData);
        }

        // Fetch categories
        const cRes = await fetch(`${apiBaseUrl}/api/categories`);
        if (cRes.ok) {
          const cData = await cRes.json();
          setCategories(cData);
        }

        // Fetch orders (needs token)
        const oRes = await fetch(`${apiBaseUrl}/api/orders`, { headers });
        if (oRes.ok) {
          const oData = await oRes.json();
          setOrders(oData);
        }
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchData();
    }
  }, [token]);

  if (loading) {
    return (
      <div className="font-display text-primary-650 animate-pulse">
        Loading dashboard metrics...
      </div>
    );
  }

  // Calculate statistics
  const totalSales = orders
    .filter((o) => ['Paid', 'Shipped', 'Delivered'].includes(o.status))
    .reduce((sum, o) => sum + o.total, 0);

  const totalOrdersCount = orders.length;
  const outOfStockCount = products.filter((p) => p.stock === 0).length;
  const totalCategoriesCount = categories.length;
  const recentOrders = orders.slice(0, 5);

  const statCards = [
    {
      name: 'Total Revenue',
      value: formatCurrency(totalSales),
      icon: DollarSign,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    },
    {
      name: 'Total Orders',
      value: totalOrdersCount.toString(),
      icon: FileText,
      color: 'bg-blue-50 text-blue-700 border-blue-100',
    },
    {
      name: 'Out of Stock Items',
      value: outOfStockCount.toString(),
      icon: AlertTriangle,
      color: outOfStockCount > 0 ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-gray-50 text-gray-500 border-gray-100',
    },
    {
      name: 'Active Categories',
      value: totalCategoriesCount.toString(),
      icon: Folders,
      color: 'bg-purple-50 text-purple-700 border-purple-100',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-semibold text-primary-950">
          Dashboard Overview
        </h1>
        <p className="text-xs text-primary-700/60 font-sans mt-1">
          Real-time summary of sales performance, orders tracking, and stock alerts.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.name}
              className="p-6 bg-white/70 backdrop-blur-sm border rounded-3xl shadow-sm flex items-center space-x-4 border-primary-250/20"
            >
              <div className={`p-3 rounded-2xl ${card.color} border`}>
                <Icon size={20} />
              </div>
              <div>
                <span className="block text-xs font-display text-primary-700/60 font-medium uppercase tracking-wider">
                  {card.name}
                </span>
                <span className="block text-xl font-display font-semibold text-primary-950 mt-0.5">
                  {card.value}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Grid panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Orders table */}
        <div className="lg:col-span-8 bg-white/70 backdrop-blur-sm border border-primary-200/40 rounded-3xl p-6 shadow-sm">
          <div className="flex justify-between items-center pb-4 border-b border-primary-200/20 mb-6">
            <h3 className="font-display font-medium text-sm text-primary-955 uppercase tracking-wide">
              Recent Transactions
            </h3>
            <Link href="/orders" className="text-xs font-display font-medium text-primary-600 hover:underline">
              Manage Orders →
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <p className="text-xs text-primary-700/60 font-sans italic py-4">No transactions found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs font-sans">
                <thead>
                  <tr className="border-b border-primary-200/30 text-primary-900 font-display font-medium uppercase tracking-wider">
                    <th className="pb-3">Order ID</th>
                    <th className="pb-3">Customer</th>
                    <th className="pb-3">Total</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary-100">
                  {recentOrders.map((ord) => (
                    <tr key={ord.id} className="text-primary-850">
                      <td className="py-3.5 font-semibold text-primary-950">{ord.id}</td>
                      <td className="py-3.5">{ord.customerName}</td>
                      <td className="py-3.5 font-medium">{formatCurrency(ord.total)}</td>
                      <td className="py-3.5">
                        <Badge
                          variant={
                            ord.status === 'Delivered' ? 'success' :
                            ord.status === 'Shipped' ? 'info' :
                            ord.status === 'Paid' ? 'primary' :
                            ord.status === 'Pending' ? 'warning' : 'error'
                          }
                        >
                          {ord.status}
                        </Badge>
                      </td>
                      <td className="py-3.5 text-primary-700/70">
                        {new Date(ord.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Low Stock Warnings */}
        <div className="lg:col-span-4 bg-white/70 backdrop-blur-sm border border-primary-200/40 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-display font-medium text-sm text-primary-955 uppercase tracking-wide pb-4 border-b border-primary-200/20 mb-6">
              Low Stock Warnings
            </h3>

            <div className="space-y-4">
              {products.filter((p) => p.stock <= 25).length === 0 ? (
                <p className="text-xs text-primary-700/60 font-sans italic py-4">All items fully stocked.</p>
              ) : (
                products
                  .filter((p) => p.stock <= 25)
                  .slice(0, 4)
                  .map((p) => (
                    <div key={p.id} className="flex justify-between items-center text-xs">
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-primary-50 overflow-hidden flex-shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={p.images[0]?.startsWith('/') ? `http://localhost:3000${p.images[0]}` : p.images[0]} alt={p.name} className="object-cover w-full h-full" />
                        </div>
                        <span className="truncate text-primary-850 font-medium">{p.name}</span>
                      </div>
                      <span className={`font-semibold font-mono pl-3 ${p.stock === 0 ? 'text-red-500' : 'text-amber-500'}`}>
                        {p.stock === 0 ? 'OUT' : `${p.stock} Left`}
                      </span>
                    </div>
                  ))
              )}
            </div>
          </div>

          <Link
            href="/products"
            className="w-full inline-flex items-center justify-center py-2.5 bg-primary-50 border border-primary-200 rounded-xl font-display font-semibold text-xs text-primary-850 uppercase transition-all text-center mt-6 hover:bg-primary-100"
          >
            Manage Catalog
          </Link>
        </div>
      </div>
    </div>
  );
}
