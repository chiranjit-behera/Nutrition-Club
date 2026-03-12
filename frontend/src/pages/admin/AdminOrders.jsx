import React, { useState, useEffect } from 'react';
import {
  Search, Filter, RefreshCw, ChevronDown, Eye, CheckSquare,
  Square, AlertCircle, X, MapPin, Phone, Mail, Package
} from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = ['All', 'Pending', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'];

const STATUS_COLORS = {
  Pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  Confirmed: 'bg-blue-100 text-blue-700 border-blue-200',
  Preparing: 'bg-purple-100 text-purple-700 border-purple-200',
  'Out for Delivery': 'bg-indigo-100 text-indigo-700 border-indigo-200',
  Delivered: 'bg-green-100 text-green-700 border-green-200',
  Cancelled: 'bg-red-100 text-red-700 border-red-200',
};

const OrderDetailModal = ({ order, onClose, onStatusUpdate }) => {
  const [newStatus, setNewStatus] = useState(order.status);
  const [updating, setUpdating] = useState(false);

  const handleUpdate = async () => {
    if (newStatus === order.status) return;
    setUpdating(true);
    try {
      await api.put(`/orders/${order._id}/status`, { status: newStatus });
      toast.success(`Status updated to ${newStatus}`);
      onStatusUpdate(order._id, newStatus);
      onClose();
    } catch {
      toast.error('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-bounce-in" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="font-display font-bold text-xl text-gray-800">{order.orderNumber}</h2>
            <p className="text-gray-400 text-sm">{new Date(order.createdAt).toLocaleString('en-IN')}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Customer Info */}
          <div className="bg-orange-50 rounded-xl p-4">
            <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Package className="w-4 h-4 text-orange-500" />
              Customer Details
            </h3>
            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-gray-400 w-16 flex-shrink-0">Name:</span>
                <span className="font-medium text-gray-800">{order.customer.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-orange-400 flex-shrink-0" />
                <span className="text-gray-800">{order.customer.phone}</span>
              </div>
              {order.customer.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-orange-400 flex-shrink-0" />
                  <span className="text-gray-800">{order.customer.email}</span>
                </div>
              )}
              <div className="flex items-start gap-2 sm:col-span-2">
                <MapPin className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                <span className="text-gray-800">{order.customer.address}</span>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div>
            <h3 className="font-semibold text-gray-700 mb-3">Order Items</h3>
            <div className="border border-gray-100 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2.5 text-left text-gray-500 font-medium">Item</th>
                    <th className="px-4 py-2.5 text-center text-gray-500 font-medium">Qty</th>
                    <th className="px-4 py-2.5 text-right text-gray-500 font-medium">Price</th>
                    <th className="px-4 py-2.5 text-right text-gray-500 font-medium">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {order.items.map((item, i) => (
                    <tr key={i}>
                      <td className="px-4 py-3 font-medium text-gray-800">{item.name}</td>
                      <td className="px-4 py-3 text-center text-gray-600">{item.quantity}</td>
                      <td className="px-4 py-3 text-right text-gray-600">₹{item.price}</td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-800">₹{item.subtotal}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-orange-50">
                  <tr>
                    <td colSpan={3} className="px-4 py-3 font-bold text-gray-700 text-right">Total</td>
                    <td className="px-4 py-3 font-bold text-orange-600 text-right text-base">₹{order.totalAmount}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
              <p className="text-yellow-700 text-sm"><span className="font-medium">Note:</span> {order.notes}</p>
            </div>
          )}

          {/* Status History */}
          <div>
            <h3 className="font-semibold text-gray-700 mb-3">Status History</h3>
            <div className="space-y-2">
              {order.statusHistory?.slice().reverse().map((h, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <span className={`badge text-xs px-2 py-1 border ${STATUS_COLORS[h.status] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                    {h.status}
                  </span>
                  <span className="text-gray-400">{new Date(h.timestamp).toLocaleString('en-IN')}</span>
                  {h.note && <span className="text-gray-500">— {h.note}</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Update Status */}
          <div className="flex gap-3 pt-2 border-t">
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            >
              {STATUS_OPTIONS.filter(s => s !== 'All').map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <button
              onClick={handleUpdate}
              disabled={updating || newStatus === order.status}
              className="btn-primary py-2.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updating ? 'Updating...' : 'Update Status'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkStatus, setBulkStatus] = useState('Delivered');
  const [viewOrder, setViewOrder] = useState(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (selectedStatus !== 'All') params.status = selectedStatus;
      const res = await api.get('/orders', { params });
      setOrders(res.data.data);
      setPagination(res.data.pagination);
      setSelectedIds([]);
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, [selectedStatus, page]);

  const handleBulkUpdate = async () => {
    if (!selectedIds.length) return toast.error('Select at least one order');
    try {
      await api.put('/orders/bulk/status', { orderIds: selectedIds, status: bulkStatus });
      toast.success(`${selectedIds.length} orders updated!`);
      fetchOrders();
    } catch {
      toast.error('Bulk update failed');
    }
  };

  const handleStatusUpdate = (id, status) => {
    setOrders(orders.map(o => o._id === id ? { ...o, status } : o));
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    setSelectedIds(selectedIds.length === orders.length ? [] : orders.map(o => o._id));
  };

  const filtered = search
    ? orders.filter(o =>
        o.orderNumber?.toLowerCase().includes(search.toLowerCase()) ||
        o.customer.name.toLowerCase().includes(search.toLowerCase()) ||
        o.customer.phone.includes(search)
      )
    : orders;

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold text-gray-800">Order Management</h2>
        <button onClick={fetchOrders} className="flex items-center gap-2 text-sm text-gray-500 hover:text-orange-500 transition-colors">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-wrap gap-3">
          {/* Status filter */}
          <div className="flex gap-2 overflow-x-auto">
            {STATUS_OPTIONS.map(s => (
              <button
                key={s}
                onClick={() => { setSelectedStatus(s); setPage(1); }}
                className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
                  selectedStatus === s
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-orange-50 hover:text-orange-600'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative ml-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search orders..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 w-52"
            />
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedIds.length > 0 && (
          <div className="mt-3 flex items-center gap-3 p-3 bg-orange-50 rounded-xl border border-orange-200">
            <AlertCircle className="w-4 h-4 text-orange-500 flex-shrink-0" />
            <span className="text-sm text-orange-700 font-medium">{selectedIds.length} selected</span>
            <select
              value={bulkStatus}
              onChange={(e) => setBulkStatus(e.target.value)}
              className="text-sm border border-orange-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
            >
              {STATUS_OPTIONS.filter(s => s !== 'All').map(s => <option key={s}>{s}</option>)}
            </select>
            <button onClick={handleBulkUpdate} className="btn-primary text-sm py-1.5 px-4">
              Apply
            </button>
            <button onClick={() => setSelectedIds([])} className="text-sm text-gray-500 hover:text-gray-700">Clear</button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-7 h-7 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No orders found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <button onClick={toggleSelectAll} className="text-gray-400 hover:text-orange-500 transition-colors">
                      {selectedIds.length === orders.length ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                    </button>
                  </th>
                  {['Order #', 'Customer', 'Items', 'Amount', 'Status', 'Date', 'Action'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(order => (
                  <tr key={order._id} className={`hover:bg-orange-50/30 transition-colors ${selectedIds.includes(order._id) ? 'bg-orange-50/50' : ''}`}>
                    <td className="px-4 py-4">
                      <button onClick={() => toggleSelect(order._id)} className="text-gray-400 hover:text-orange-500">
                        {selectedIds.includes(order._id) ? <CheckSquare className="w-4 h-4 text-orange-500" /> : <Square className="w-4 h-4" />}
                      </button>
                    </td>
                    <td className="px-4 py-4">
                      <span className="font-mono text-xs text-orange-600 font-bold bg-orange-50 px-2 py-1 rounded-lg">{order.orderNumber}</span>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-medium text-gray-800">{order.customer.name}</p>
                      <p className="text-gray-400 text-xs">{order.customer.phone}</p>
                    </td>
                    <td className="px-4 py-4 text-gray-600">{order.items.length} item(s)</td>
                    <td className="px-4 py-4 font-bold text-gray-800">₹{order.totalAmount}</td>
                    <td className="px-4 py-4">
                      <span className={`badge text-xs px-2.5 py-1 border ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-gray-400 text-xs whitespace-nowrap">
                      {new Date(order.createdAt).toLocaleDateString('en-IN')}
                      <br />
                      {new Date(order.createdAt).toLocaleTimeString('en-IN', { timeStyle: 'short' })}
                    </td>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => setViewOrder(order)}
                        className="flex items-center gap-1.5 text-orange-500 hover:text-orange-700 font-medium text-xs bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
            <p className="text-sm text-gray-500">{pagination.total} total orders</p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-orange-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Prev
              </button>
              <span className="px-3 py-1.5 text-sm font-medium bg-orange-500 text-white rounded-lg">
                {page} / {pagination.pages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                disabled={page === pagination.pages}
                className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-orange-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {viewOrder && (
        <OrderDetailModal
          order={viewOrder}
          onClose={() => setViewOrder(null)}
          onStatusUpdate={handleStatusUpdate}
        />
      )}
    </div>
  );
};

export default AdminOrders;
