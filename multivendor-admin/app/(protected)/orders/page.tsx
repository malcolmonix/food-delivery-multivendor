'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getClient } from '@/lib/graphql/client';
import { QUERY_ORDERS } from '@/lib/graphql/queries';
import { MUTATION_UPDATE_ORDER_STATUS } from '@/lib/graphql/mutations';
import { loadUser } from '@/lib/utils/auth';
import { useOrderNotifications } from '@/lib/hooks/useOrderNotifications';

interface User {
  id: string;
  name: string;
  email: string;
}

interface Restaurant {
  _id: string;
  name: string;
}

interface Order {
  _id: string;
  orderId: string;
  user: User;
  restaurant: Restaurant;
  orderStatus: string;
  paymentMethod: string;
  paidAmount: number;
  orderAmount: number;
  deliveryCharges: number;
  createdAt: string;
  completedAt: string | null;
}

interface OrdersResponse {
  orders: {
    orders: Order[];
    total: number;
  };
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  ACCEPTED: 'bg-blue-100 text-blue-800',
  PREPARING: 'bg-purple-100 text-purple-800',
  ON_THE_WAY: 'bg-indigo-100 text-indigo-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

export default function OrdersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  
  // Real-time notifications
  const { isEnabled, toggleNotifications, requestNotificationPermission } = useOrderNotifications();
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState<{
    startDate: string;
    endDate: string;
  }>({
    startDate: '',
    endDate: '',
  });
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState('');
  const [showBulkModal, setShowBulkModal] = useState(false);

  // Auth guard
  useEffect(() => {
    const user = loadUser();
    if (!user?.token) {
      router.replace('/authentication/login');
    }
  }, [router]);

  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const client = await getClient();
        const data: OrdersResponse = await client.request(QUERY_ORDERS, {
          status: statusFilter === 'ALL' ? null : statusFilter,
          page,
          limit,
        });
        setOrders(data.orders.orders);
        setTotal(data.orders.total);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [statusFilter, page]);

  // Filter orders by search query and date range (client-side)
  const filteredOrders = useMemo(() => {
    let filtered = orders;

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (o) =>
          o.orderId.toLowerCase().includes(q) ||
          o.user.name.toLowerCase().includes(q) ||
          o.user.email.toLowerCase().includes(q) ||
          o.restaurant.name.toLowerCase().includes(q)
      );
    }

    // Date range filter
    if (dateFilter.startDate || dateFilter.endDate) {
      filtered = filtered.filter((o) => {
        const orderDate = new Date(o.createdAt);
        const startDate = dateFilter.startDate ? new Date(dateFilter.startDate) : null;
        const endDate = dateFilter.endDate ? new Date(dateFilter.endDate) : null;

        if (startDate && endDate) {
          return orderDate >= startDate && orderDate <= endDate;
        } else if (startDate) {
          return orderDate >= startDate;
        } else if (endDate) {
          return orderDate <= endDate;
        }
        return true;
      });
    }

    return filtered;
  }, [orders, searchQuery, dateFilter]);

  // CSV Export functions
  const generateCSV = (orders: Order[]) => {
    const headers = [
      'Order ID',
      'Customer Name',
      'Customer Email',
      'Restaurant',
      'Status',
      'Order Amount',
      'Paid Amount',
      'Payment Method',
      'Created At',
      'Completed At',
    ];

    const rows = orders.map((order) => [
      order.orderId,
      order.user.name,
      order.user.email,
      order.restaurant.name,
      order.orderStatus,
      order.orderAmount.toFixed(2),
      order.paidAmount.toFixed(2),
      order.paymentMethod,
      formatDate(order.createdAt),
      order.completedAt ? formatDate(order.completedAt) : '',
    ]);

    return [headers, ...rows].map((row) => row.join(',')).join('\n');
  };

  const downloadCSV = (csvContent: string, filename: string) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Bulk actions
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedOrders(filteredOrders.map(order => order._id));
    } else {
      setSelectedOrders([]);
    }
  };

  const handleSelectOrder = (orderId: string, checked: boolean) => {
    if (checked) {
      setSelectedOrders(prev => [...prev, orderId]);
    } else {
      setSelectedOrders(prev => prev.filter(id => id !== orderId));
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedOrders.length === 0) return;

    try {
      const client = await getClient();
      const promises = selectedOrders.map(orderId => 
        client.request(MUTATION_UPDATE_ORDER_STATUS, {
          id: orderId,
          status: bulkAction,
        })
      );

      await Promise.all(promises);
      
      // Refresh orders
      const data: OrdersResponse = await client.request(QUERY_ORDERS, {
        status: statusFilter === 'ALL' ? null : statusFilter,
        page,
        limit,
      });
      setOrders(data.orders.orders);
      setTotal(data.orders.total);
      
      setSelectedOrders([]);
      setBulkAction('');
      setShowBulkModal(false);
      alert(`Updated ${selectedOrders.length} orders to ${bulkAction}`);
    } catch (error) {
      console.error('Bulk update failed:', error);
      alert('Failed to update orders');
    }
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleString();
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const totalPages = Math.ceil(total / limit);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading orders...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
            <p className="text-gray-600 mt-2">Manage all orders across restaurants</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={requestNotificationPermission}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Enable Browser Notifications
            </button>
            <button
              onClick={toggleNotifications}
              className={`px-4 py-2 text-sm rounded-lg font-medium ${
                isEnabled 
                  ? 'bg-green-600 text-white hover:bg-green-700' 
                  : 'bg-gray-600 text-white hover:bg-gray-700'
              }`}
            >
              {isEnabled ? '🔔 Notifications On' : '🔕 Notifications Off'}
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              Search Orders
            </label>
            <input
              id="search"
              type="text"
              placeholder="Search by order ID, customer, restaurant..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Status
            </label>
            <select
              id="status"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="ALL">All Orders</option>
              <option value="PENDING">Pending</option>
              <option value="ACCEPTED">Accepted</option>
              <option value="PREPARING">Preparing</option>
              <option value="ON_THE_WAY">On The Way</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
              From Date
            </label>
            <input
              id="startDate"
              type="date"
              value={dateFilter.startDate}
              onChange={(e) => {
                setDateFilter(prev => ({ ...prev, startDate: e.target.value }));
                setPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* End Date */}
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
              To Date
            </label>
            <input
              id="endDate"
              type="date"
              value={dateFilter.endDate}
              onChange={(e) => {
                setDateFilter(prev => ({ ...prev, endDate: e.target.value }));
                setPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Filter Actions */}
        <div className="mt-4 flex justify-between items-center">
          <div className="flex space-x-2">
            <button
              onClick={() => {
                setDateFilter({ startDate: '', endDate: '' });
                setStatusFilter('ALL');
                setSearchQuery('');
                setPage(1);
              }}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Clear Filters
            </button>
            <button
              onClick={() => {
                const csvContent = generateCSV(filteredOrders);
                downloadCSV(csvContent, `orders-${new Date().toISOString().split('T')[0]}.csv`);
              }}
              className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Export CSV
            </button>
            {selectedOrders.length > 0 && (
              <button
                onClick={() => setShowBulkModal(true)}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Bulk Actions ({selectedOrders.length})
              </button>
            )}
          </div>
          <div className="text-sm text-gray-600">
            {filteredOrders.length} of {total} orders
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={selectedOrders.length === filteredOrders.length && filteredOrders.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Restaurant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                    No orders found
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedOrders.includes(order._id)}
                        onChange={(e) => handleSelectOrder(order._id, e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{order.orderId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{order.user.name}</div>
                      <div className="text-sm text-gray-500">{order.user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{order.restaurant.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          STATUS_COLORS[order.orderStatus] || 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {order.orderStatus.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(order.paidAmount)}
                      </div>
                      <div className="text-xs text-gray-500">
                        Order: {formatCurrency(order.orderAmount)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{order.paymentMethod}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(order.createdAt)}</div>
                      {order.completedAt && (
                        <div className="text-xs text-gray-500">
                          Done: {formatDate(order.completedAt)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Link
                        href={`/orders/${order._id}`}
                        className="text-blue-600 hover:text-blue-900 font-medium"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{(page - 1) * limit + 1}</span> to{' '}
                <span className="font-medium">{Math.min(page * limit, total)}</span> of{' '}
                <span className="font-medium">{total}</span> results
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Actions Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold mb-4">Bulk Actions</h3>
            <p className="text-gray-600 mb-4">
              Update status for {selectedOrders.length} selected orders:
            </p>
            <select
              value={bulkAction}
              onChange={(e) => setBulkAction(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
            >
              <option value="">Select Status</option>
              <option value="ACCEPTED">Accept</option>
              <option value="PREPARING">Preparing</option>
              <option value="ON_THE_WAY">On The Way</option>
              <option value="DELIVERED">Delivered</option>
            </select>
            <div className="flex space-x-3">
              <button
                onClick={handleBulkAction}
                disabled={!bulkAction}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                Update Status
              </button>
              <button
                onClick={() => {
                  setShowBulkModal(false);
                  setBulkAction('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
