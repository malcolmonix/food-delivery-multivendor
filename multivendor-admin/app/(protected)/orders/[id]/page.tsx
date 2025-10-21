'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { getClient } from '@/lib/graphql/client';
import { QUERY_ORDER } from '@/lib/graphql/queries';
import { MUTATION_UPDATE_ORDER_STATUS, MUTATION_CANCEL_ORDER } from '@/lib/graphql/mutations';
import { loadUser } from '@/lib/utils/auth';
import OrderTimeline from '@/components/OrderTimeline';

interface User {
  id: string;
  name: string;
  email: string;
}

interface Restaurant {
  _id: string;
  name: string;
  address: string;
  phone: string;
}

interface OrderItem {
  id: string;
  title: string;
  quantity: number;
  variation: string | null;
  addons: string | null;
  price: number;
}

interface Address {
  deliveryAddress: string;
  latitude: number | null;
  longitude: number | null;
}

interface Order {
  _id: string;
  orderId: string;
  user: User;
  restaurant: Restaurant;
  items: OrderItem[];
  deliveryAddress: Address;
  orderStatus: string;
  paymentMethod: string;
  paidAmount: number;
  orderAmount: number;
  deliveryCharges: number;
  tipping: number | null;
  taxationAmount: number;
  createdAt: string;
  deliveryTime: string | null;
  completedAt: string | null;
  reason: string | null;
}

interface OrderResponse {
  order: Order;
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  ACCEPTED: 'bg-blue-100 text-blue-800 border-blue-200',
  PREPARING: 'bg-purple-100 text-purple-800 border-purple-200',
  ON_THE_WAY: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  DELIVERED: 'bg-green-100 text-green-800 border-green-200',
  CANCELLED: 'bg-red-100 text-red-800 border-red-200',
};

const ALL_STATUSES = ['PENDING', 'ACCEPTED', 'PREPARING', 'ON_THE_WAY', 'DELIVERED', 'CANCELLED'];

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<Order | null>(null);
  const [updating, setUpdating] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  // Auth guard
  useEffect(() => {
    const user = loadUser();
    if (!user?.token) {
      router.replace('/authentication/login');
    }
  }, [router]);

  // Fetch order
  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      try {
        const client = await getClient();
        const data: OrderResponse = await client.request(QUERY_ORDER, { id: orderId });
        setOrder(data.order);
      } catch (error) {
        console.error('Failed to fetch order:', error);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const updateStatus = async (newStatus: string) => {
    if (!order || updating) return;

    setUpdating(true);
    try {
      const client = await getClient();
      await client.request(MUTATION_UPDATE_ORDER_STATUS, {
        id: order._id,
        status: newStatus,
      });

      // Refresh order data
      const data: OrderResponse = await client.request(QUERY_ORDER, { id: orderId });
      setOrder(data.order);
      alert(`Order status updated to ${newStatus}`);
    } catch (error: any) {
      console.error('Failed to update order status:', error);
      alert(`Failed to update status: ${error.message || 'Unknown error'}`);
    } finally {
      setUpdating(false);
    }
  };

  const cancelOrder = async () => {
    if (!order || !cancelReason.trim() || updating) return;

    setUpdating(true);
    try {
      const client = await getClient();
      await client.request(MUTATION_CANCEL_ORDER, {
        id: order._id,
        reason: cancelReason,
      });

      // Refresh order data
      const data: OrderResponse = await client.request(QUERY_ORDER, { id: orderId });
      setOrder(data.order);
      setShowCancelModal(false);
      setCancelReason('');
      alert('Order cancelled successfully');
    } catch (error: any) {
      console.error('Failed to cancel order:', error);
      alert(`Failed to cancel order: ${error.message || 'Unknown error'}`);
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleString();
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading order...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Order not found</p>
        </div>
        <Link href="/orders" className="mt-4 inline-block text-blue-600 hover:text-blue-900">
          ← Back to Orders
        </Link>
      </div>
    );
  }

  const canChangeStatus = !['DELIVERED', 'CANCELLED'].includes(order.orderStatus);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <Link href="/orders" className="text-blue-600 hover:text-blue-900 text-sm mb-2 inline-block">
          ← Back to Orders
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Order {order.orderId}</h1>
            <p className="text-gray-600 mt-1">Created {formatDate(order.createdAt)}</p>
          </div>
          <div
            className={`px-4 py-2 rounded-lg border-2 font-semibold ${
              STATUS_COLORS[order.orderStatus] || 'bg-gray-100 text-gray-800 border-gray-200'
            }`}
          >
            {order.orderStatus.replace('_', ' ')}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold">Order Items</h2>
            </div>
            <div className="p-6">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 text-sm font-medium text-gray-700">Item</th>
                    <th className="text-left py-2 text-sm font-medium text-gray-700">Quantity</th>
                    <th className="text-right py-2 text-sm font-medium text-gray-700">Price</th>
                    <th className="text-right py-2 text-sm font-medium text-gray-700">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item) => (
                    <tr key={item.id} className="border-b">
                      <td className="py-3">
                        <div className="font-medium">{item.title}</div>
                        {item.variation && (
                          <div className="text-sm text-gray-500">Variation: {item.variation}</div>
                        )}
                        {item.addons && (
                          <div className="text-sm text-gray-500">Addons: {item.addons}</div>
                        )}
                      </td>
                      <td className="py-3">{item.quantity}</td>
                      <td className="py-3 text-right">{formatCurrency(item.price)}</td>
                      <td className="py-3 text-right font-medium">
                        {formatCurrency(item.price * item.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2">
                    <td colSpan={3} className="py-2 text-right font-medium">
                      Subtotal:
                    </td>
                    <td className="py-2 text-right">{formatCurrency(order.orderAmount)}</td>
                  </tr>
                  <tr>
                    <td colSpan={3} className="py-2 text-right font-medium">
                      Delivery Charges:
                    </td>
                    <td className="py-2 text-right">{formatCurrency(order.deliveryCharges)}</td>
                  </tr>
                  <tr>
                    <td colSpan={3} className="py-2 text-right font-medium">
                      Tax:
                    </td>
                    <td className="py-2 text-right">{formatCurrency(order.taxationAmount)}</td>
                  </tr>
                  {order.tipping && order.tipping > 0 && (
                    <tr>
                      <td colSpan={3} className="py-2 text-right font-medium">
                        Tip:
                      </td>
                      <td className="py-2 text-right">{formatCurrency(order.tipping)}</td>
                    </tr>
                  )}
                  <tr className="border-t-2">
                    <td colSpan={3} className="py-3 text-right text-lg font-bold">
                      Total Paid:
                    </td>
                    <td className="py-3 text-right text-lg font-bold">
                      {formatCurrency(order.paidAmount)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Timeline / Status History */}
          <OrderTimeline
            orderId={order._id}
            currentStatus={order.orderStatus}
            createdAt={order.createdAt}
            completedAt={order.completedAt}
          />

          {/* Cancellation Reason */}
          {order.reason && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="font-semibold text-red-900 mb-2">Cancellation Reason:</h3>
              <p className="text-red-800">{order.reason}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Customer</h3>
            <div className="space-y-2">
              <div className="font-medium">{order.user.name}</div>
              <div className="text-sm text-gray-600">{order.user.email}</div>
            </div>
          </div>

          {/* Restaurant Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Restaurant</h3>
            <div className="space-y-2">
              <div className="font-medium">{order.restaurant.name}</div>
              <div className="text-sm text-gray-600">{order.restaurant.address}</div>
              {order.restaurant.phone && (
                <div className="text-sm text-gray-600">{order.restaurant.phone}</div>
              )}
            </div>
          </div>

          {/* Delivery Address */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Delivery Address</h3>
            <div className="text-sm text-gray-700">{order.deliveryAddress.deliveryAddress}</div>
            {order.deliveryAddress.latitude && order.deliveryAddress.longitude && (
              <a
                href={`https://www.google.com/maps?q=${order.deliveryAddress.latitude},${order.deliveryAddress.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-900 text-sm mt-2 inline-block"
              >
                View on Map →
              </a>
            )}
          </div>

          {/* Payment Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Payment</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Method:</span>
                <span className="font-medium">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="font-medium text-green-600">Paid</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          {canChangeStatus && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Update Status</h3>
              <div className="space-y-2">
                {ALL_STATUSES.filter((s) => s !== order.orderStatus && s !== 'CANCELLED').map(
                  (status) => (
                    <button
                      key={status}
                      onClick={() => updateStatus(status)}
                      disabled={updating}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                    >
                      Mark as {status.replace('_', ' ')}
                    </button>
                  )
                )}
                <button
                  onClick={() => setShowCancelModal(true)}
                  disabled={updating}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  Cancel Order
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold mb-4">Cancel Order</h3>
            <p className="text-gray-600 mb-4">
              Please provide a reason for cancelling this order:
            </p>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Enter cancellation reason..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent mb-4"
              rows={4}
            />
            <div className="flex space-x-3">
              <button
                onClick={cancelOrder}
                disabled={!cancelReason.trim() || updating}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                Confirm Cancel
              </button>
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelReason('');
                }}
                disabled={updating}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
