'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { formatCurrency } from '../../utils/currency';
import { Badge } from '../../components/ui/Badge';
import { Eye, Edit3, X, MapPin, Calendar, CreditCard, ChevronRight } from 'lucide-react';
import { getApiBaseUrl } from '../../utils/api';

interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  image: string;
}

interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  shippingAddress: {
    address: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  total: number;
  status: 'Pending' | 'Paid' | 'Shipped' | 'Delivered' | 'Cancelled';
  items: OrderItem[];
  paymentIntentId?: string;
  createdAt: string;
}

export default function AdminOrders() {
  const { token } = useAuthStore();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Detail Modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const apiBaseUrl = getApiBaseUrl();

  const fetchOrders = async () => {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };

    try {
      const res = await fetch(`${apiBaseUrl}/api/orders`, { headers });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setOrders(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchOrders();
    }
  }, [token]);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    setUpdatingStatus(true);
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };

    try {
      const res = await fetch(`${apiBaseUrl}/api/orders/${orderId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        const updatedOrder = await res.json();
        // Update local arrays
        setOrders(orders.map((o) => (o.id === orderId ? { ...o, status: newStatus as any } : o)));
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: newStatus as any });
        }
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to update order status');
      }
    } catch (err) {
      console.error(err);
      alert('Network error updating status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="font-display text-primary-655 animate-pulse">
        Loading customer order archives...
      </div>
    );
  }

  const statuses = ['ALL', 'Pending', 'Paid', 'Shipped', 'Delivered', 'Cancelled'];

  const filteredOrders = filterStatus === 'ALL'
    ? orders
    : orders.filter((o) => o.status === filterStatus);

  return (
    <div className="space-y-8 relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-semibold text-primary-955">
            Track Orders
          </h1>
          <p className="text-xs text-primary-700/60 font-sans mt-1">
            Fulfill client purchases, update dispatch states, and view transaction records.
          </p>
        </div>

        {/* Status Filters */}
        <div className="flex flex-wrap gap-1.5 bg-white/50 border border-primary-200/20 p-1 rounded-2xl">
          {statuses.map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-display font-medium uppercase tracking-wider transition-all
                ${filterStatus === status
                  ? 'bg-primary-600 text-white font-semibold shadow-xs'
                  : 'text-primary-850 hover:bg-cream-dark/40'}`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Grid/Table */}
      <div className="bg-white/70 backdrop-blur-sm border border-primary-200/40 rounded-3xl p-6 shadow-sm overflow-hidden">
        {filteredOrders.length === 0 ? (
          <p className="text-xs text-primary-700/60 font-sans italic py-4">No matching orders found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-sans">
              <thead>
                <tr className="border-b border-primary-200/30 text-primary-900 font-display font-medium uppercase tracking-wider">
                  <th className="pb-3">Order ID</th>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Address</th>
                  <th className="pb-3">Total</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary-100">
                {filteredOrders.map((ord) => (
                  <tr key={ord.id} className="text-primary-850 hover:bg-cream-light/30 transition-colors">
                    <td className="py-4 font-semibold text-primary-950">{ord.id}</td>
                    <td className="py-4">
                      <div className="font-medium text-primary-900">{ord.customerName}</div>
                      <div className="text-[10px] text-primary-700/60 font-mono truncate max-w-[150px]">
                        {ord.customerEmail}
                      </div>
                    </td>
                    <td className="py-4 truncate max-w-[200px]" title={`${ord.shippingAddress.address}, ${ord.shippingAddress.city}`}>
                      {ord.shippingAddress.city}, {ord.shippingAddress.state} {ord.shippingAddress.postalCode}
                    </td>
                    <td className="py-4 font-semibold text-primary-950">
                      {formatCurrency(ord.total)}
                    </td>
                    <td className="py-4">
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
                    <td className="py-4 text-primary-700/70">
                      {new Date(ord.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 text-right">
                      <button
                        onClick={() => setSelectedOrder(ord)}
                        className="inline-flex items-center text-primary-800 hover:text-primary-650 px-2.5 py-1.5 bg-primary-50 hover:bg-primary-100 rounded-lg transition-all"
                      >
                        <Eye size={12} className="mr-1" /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Details Modal Dialog */}
      {selectedOrder && (
        <>
          <div
            onClick={() => setSelectedOrder(null)}
            className="fixed inset-0 bg-black/30 backdrop-blur-[1px] z-40 cursor-pointer"
          />
          <div className="fixed right-0 top-0 bottom-0 w-full sm:max-w-xl bg-cream-light z-50 shadow-2xl flex flex-col h-full border-l border-primary-200/50">
            {/* Modal Header */}
            <div className="p-6 border-b border-primary-200/40 flex items-center justify-between">
              <div>
                <h3 className="font-display font-medium text-base text-primary-955">
                  Order Details: {selectedOrder.id}
                </h3>
                <span className="text-[10px] text-primary-700/60 font-sans block mt-0.5">
                  Placed on {new Date(selectedOrder.createdAt).toLocaleString()}
                </span>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-primary-700 hover:text-primary-900">
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-grow overflow-y-auto p-6 space-y-6">
              {/* Order Status Controller */}
              <div className="bg-white/60 backdrop-blur-sm border border-primary-200/30 rounded-2xl p-4 space-y-3">
                <span className="block text-[10px] font-display font-semibold text-primary-900 uppercase tracking-wider">
                  Update Delivery Status
                </span>
                <div className="flex flex-wrap gap-2">
                  {['Pending', 'Paid', 'Shipped', 'Delivered', 'Cancelled'].map((status) => (
                    <button
                      key={status}
                      disabled={updatingStatus}
                      onClick={() => handleUpdateStatus(selectedOrder.id, status)}
                      className={`px-3 py-1.5 rounded-xl text-[10px] font-display font-medium uppercase tracking-wider transition-all border
                        ${selectedOrder.status === status
                          ? 'bg-primary-655 text-white border-primary-655 font-semibold shadow-xs'
                          : 'bg-white hover:bg-cream-dark/20 text-primary-850 border-primary-200/40'}`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              {/* Shipping Address panel */}
              <div className="space-y-3">
                <h4 className="text-xs font-display font-semibold tracking-wider text-primary-900 uppercase flex items-center">
                  <MapPin size={14} className="mr-1 text-primary-600" /> Shipping Destination
                </h4>
                <div className="bg-white/40 border border-primary-200/20 p-4 rounded-2xl text-xs font-sans space-y-1 text-primary-850">
                  <p className="font-semibold text-primary-950">{selectedOrder.customerName}</p>
                  <p className="text-primary-700/60">{selectedOrder.customerEmail}</p>
                  <p className="pt-2 border-t border-primary-200/10 mt-2">{selectedOrder.shippingAddress.address}</p>
                  <p>
                    {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} -{' '}
                    <span className="font-mono">{selectedOrder.shippingAddress.postalCode}</span>
                  </p>
                  <p>{selectedOrder.shippingAddress.country}</p>
                </div>
              </div>

              {/* Payment Summary */}
              {selectedOrder.paymentIntentId && (
                <div className="space-y-3">
                  <h4 className="text-xs font-display font-semibold tracking-wider text-primary-900 uppercase flex items-center">
                    <CreditCard size={14} className="mr-1 text-primary-600" /> Payment Info
                  </h4>
                  <div className="bg-white/40 border border-primary-200/20 p-4 rounded-2xl text-xs font-mono text-primary-750">
                    <span className="text-[10px] text-primary-700/60 font-sans block mb-1">Transaction ID:</span>
                    {selectedOrder.paymentIntentId}
                  </div>
                </div>
              )}

              {/* Purchased items list */}
              <div className="space-y-3">
                <h4 className="text-xs font-display font-semibold tracking-wider text-primary-900 uppercase flex items-center">
                  Items Purchased
                </h4>
                <div className="border border-primary-250/20 rounded-2xl overflow-hidden bg-white/40 divide-y divide-primary-100">
                  {selectedOrder.items.map((item) => (
                    <div key={item.productId} className="flex items-center justify-between p-4 text-xs font-sans">
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-primary-50 overflow-hidden flex-shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={item.image?.startsWith('/') ? `${getApiBaseUrl()}${item.image}` : item.image} alt={item.productName} className="object-cover w-full h-full" />
                        </div>
                        <div className="truncate">
                          <span className="font-semibold text-primary-950 block">{item.productName}</span>
                          <span className="text-primary-700/50 block text-[10px]">
                            {formatCurrency(item.price)} × {item.quantity}
                          </span>
                        </div>
                      </div>
                      <span className="font-semibold text-primary-950 pl-3">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                  {/* Totals Summary */}
                  <div className="p-4 bg-primary-50/40 text-xs font-sans space-y-2">
                    <div className="flex justify-between text-primary-800">
                      <span>Purchased Total</span>
                      <span className="font-semibold text-primary-950">
                        {formatCurrency(selectedOrder.total)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-primary-200/40">
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-full font-display font-semibold text-xs uppercase shadow-sm transition-all"
              >
                Close View
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
