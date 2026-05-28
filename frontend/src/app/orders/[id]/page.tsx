'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth-store';
import { orderApi, Order } from '@/lib/order-api';
import { LogOut } from 'lucide-react';

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const { isAuthenticated, user, logout } = useAuthStore();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }

    const fetchOrder = async () => {
      try {
        const data = await orderApi.getOrderById(parseInt(params.id));
        setOrder(data);
      } catch (error) {
        console.error('Failed to fetch order:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [isAuthenticated, params.id]);

  const handleLogout = () => {
    logout(); // Fire-and-forget
    window.location.href = '/login';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-xl">Loading order details...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-xl">Order not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-indigo-600">
                DD Computer
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/products" className="text-gray-700 hover:text-indigo-600">
                Products
              </Link>
              <Link href="/chat" className="text-gray-700 hover:text-indigo-600">
                Chat
              </Link>
              <Link href="/orders" className="text-indigo-600 font-semibold">
                Orders
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-red-600 hover:text-red-800 font-semibold"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-6">
          <Link
            href="/orders"
            className="text-indigo-600 hover:text-indigo-800 font-medium"
          >
            ← Back to Orders
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Order #{order.id}
              </h1>
              <p className="text-gray-600">
                Placed on{' '}
                {new Date(order.created_at).toLocaleDateString('th-TH', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
            <span
              className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(
                order.status
              )}`}
            >
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </span>
          </div>

          {order.shipping_address && (
            <div className="mb-4">
              <h3 className="font-semibold text-gray-900 mb-2">Shipping Address</h3>
              <p className="text-gray-600">{order.shipping_address}</p>
            </div>
          )}

          {order.phone && (
            <div className="mb-4">
              <h3 className="font-semibold text-gray-900 mb-2">Phone</h3>
              <p className="text-gray-600">{order.phone}</p>
            </div>
          )}

          {order.notes && (
            <div className="mb-4">
              <h3 className="font-semibold text-gray-900 mb-2">Notes</h3>
              <p className="text-gray-600">{order.notes}</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Order Items</h2>
          <div className="space-y-4">
            {order.items.map((item, index) => (
              <div
                key={index}
                className="flex justify-between items-center pb-4 border-b last:border-b-0"
              >
                <div>
                  <p className="font-medium text-gray-900">
                    Product ID: {item.product_id}
                  </p>
                  <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                </div>
                <p className="text-lg font-semibold text-gray-900">
                  ฿{(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t">
            <div className="flex justify-between items-center">
              <span className="text-xl font-semibold text-gray-900">Total</span>
              <span className="text-2xl font-bold text-indigo-600">
                ฿{order.total_price.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
