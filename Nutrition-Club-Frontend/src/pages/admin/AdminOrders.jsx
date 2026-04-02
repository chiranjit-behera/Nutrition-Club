import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Search, RefreshCw, Eye, CheckSquare, Square,
  AlertCircle, X, MapPin, Phone, Mail, Package,
  Trash2, ShieldAlert
} from 'lucide-react';
import {
  fetchOrders, updateOrderStatus, bulkUpdateOrderStatus,
  deleteOrder, bulkDeleteOrders,
  toggleSelectOrder, selectAllOrders, clearOrderSelection
} from '../../store/slices/ordersSlice';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = ['All','Pending','Confirmed','Preparing','Out for Delivery','Delivered','Cancelled'];
const STATUS_COLORS  = {
  Pending:'bg-yellow-100 text-yellow-700 border-yellow-200',
  Confirmed:'bg-blue-100 text-blue-700 border-blue-200',
  Preparing:'bg-purple-100 text-purple-700 border-purple-200',
  'Out for Delivery':'bg-indigo-100 text-indigo-700 border-indigo-200',
  Delivered:'bg-green-100 text-green-700 border-green-200',
  Cancelled:'bg-red-100 text-red-700 border-red-200',
};

// ── Confirm Delete Modal ──────────────────────────────────────────────────────
const DeleteConfirmModal = ({ count, onConfirm, onCancel, loading }) => (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
      <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <Trash2 className="w-7 h-7 text-red-500" />
      </div>
      <h3 className="font-display font-bold text-xl text-gray-800 text-center mb-2">
        Delete {count > 1 ? `${count} Orders` : 'Order'}?
      </h3>
      <p className="text-gray-500 text-sm text-center mb-6">
        This action <strong>cannot be undone</strong>. The {count > 1 ? 'orders' : 'order'} will be permanently removed.
      </p>
      <div className="flex gap-3">
        <button onClick={onCancel} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
        <button onClick={onConfirm} disabled={loading}
          className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 rounded-xl text-sm disabled:opacity-60">
          {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Trash2 className="w-4 h-4" />}
          Delete
        </button>
      </div>
    </div>
  </div>
);

// ── Order Detail Modal ────────────────────────────────────────────────────────
const OrderDetailModal = ({ order, onClose }) => {
  const dispatch = useDispatch();
  const [newStatus, setNewStatus] = useState(order.status);
  const [updating, setUpdating] = useState(false);

  const handleUpdate = async () => {
    if (newStatus === order.status) return;
    setUpdating(true);
    const result = await dispatch(updateOrderStatus({ id: order._id, status: newStatus }));
    if (updateOrderStatus.fulfilled.match(result)) {
      toast.success(`Status updated to ${newStatus}`);
      onClose();
    } else {
      toast.error(result.payload || 'Failed to update');
    }
    setUpdating(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="font-display font-bold text-xl text-gray-800">{order.orderNumber}</h2>
            <p className="text-gray-400 text-sm">{new Date(order.createdAt).toLocaleString('en-IN')}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl"><X className="w-5 h-5 text-gray-500" /></button>
        </div>
        <div className="p-6 space-y-5">
          <div className="bg-orange-50 rounded-xl p-4">
            <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2"><Package className="w-4 h-4 text-orange-500" />Customer Details</h3>
            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2"><span className="text-gray-400 w-16">Name:</span><span className="font-medium text-gray-800">{order.customer.name}</span></div>
              <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-orange-400" /><span>{order.customer.phone}</span></div>
              {order.customer.email && <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-orange-400" /><span>{order.customer.email}</span></div>}
              <div className="flex items-start gap-2 sm:col-span-2"><MapPin className="w-4 h-4 text-orange-400 mt-0.5" /><span>{order.customer.address}</span></div>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-gray-700 mb-3">Order Items</h3>
            <div className="border border-gray-100 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50"><tr>{['Item','Qty','Price','Total'].map(h=><th key={h} className="px-4 py-2.5 text-left text-gray-500 font-medium">{h}</th>)}</tr></thead>
                <tbody className="divide-y divide-gray-50">
                  {order.items.map((item,i) => (
                    <tr key={i}>
                      <td className="px-4 py-3 font-medium text-gray-800">{item.name}</td>
                      <td className="px-4 py-3 text-gray-600">{item.quantity}</td>
                      <td className="px-4 py-3 text-gray-600">₹{item.price}</td>
                      <td className="px-4 py-3 font-semibold text-gray-800">₹{item.subtotal}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-orange-50">
                  <tr><td colSpan={3} className="px-4 py-3 font-bold text-gray-700 text-right">Total</td><td className="px-4 py-3 font-bold text-orange-600 text-base">₹{order.totalAmount}</td></tr>
                </tfoot>
              </table>
            </div>
          </div>
          {order.notes && <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3"><p className="text-yellow-700 text-sm"><span className="font-medium">Note:</span> {order.notes}</p></div>}
          <div>
            <h3 className="font-semibold text-gray-700 mb-3">Status History</h3>
            <div className="space-y-2">
              {order.statusHistory?.slice().reverse().map((h,i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <span className={`badge text-xs px-2 py-1 border ${STATUS_COLORS[h.status] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>{h.status}</span>
                  <span className="text-gray-400">{new Date(h.timestamp).toLocaleString('en-IN')}</span>
                  {h.note && <span className="text-gray-500">— {h.note}</span>}
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-2 border-t">
            <select value={newStatus} onChange={e => setNewStatus(e.target.value)}
              className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400">
              {STATUS_OPTIONS.filter(s => s !== 'All').map(s => <option key={s}>{s}</option>)}
            </select>
            <button onClick={handleUpdate} disabled={updating || newStatus === order.status}
              className="btn-primary py-2.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed">
              {updating ? 'Updating...' : 'Update Status'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const AdminOrders = () => {
  const dispatch   = useDispatch();
  const { admin }  = useAuth();
  const isSuperAdmin = admin?.role === 'superadmin';

  const { items: orders, loading, pagination, selectedIds } = useSelector(s => s.orders);

  const [selectedStatus, setSelectedStatus] = useState('All');
  const [search,         setSearch]         = useState('');
  const [bulkStatus,     setBulkStatus]     = useState('Delivered');
  const [viewOrder,      setViewOrder]      = useState(null);
  const [page,           setPage]           = useState(1);
  const [deleteModal,    setDeleteModal]    = useState(null);
  const [deleting,       setDeleting]       = useState(false);

  const load = () => dispatch(fetchOrders({ page, status: selectedStatus }));

  useEffect(() => { load(); }, [selectedStatus, page]);

  const handleBulkStatusUpdate = async () => {
    if (!selectedIds.length) return toast.error('Select at least one order');
    const result = await dispatch(bulkUpdateOrderStatus({ orderIds: selectedIds, status: bulkStatus }));
    if (bulkUpdateOrderStatus.fulfilled.match(result)) toast.success(`${selectedIds.length} orders updated!`);
    else toast.error(result.payload || 'Bulk update failed');
  };

  const confirmDelete = async () => {
    if (!deleteModal) return;
    setDeleting(true);
    const { ids } = deleteModal;
    const action  = ids.length === 1 ? deleteOrder(ids[0]) : bulkDeleteOrders(ids);
    const result  = await dispatch(action);
    const fulfilled = ids.length === 1 ? deleteOrder.fulfilled : bulkDeleteOrders.fulfilled;
    if (fulfilled.match(result)) {
      toast.success(`${ids.length} order${ids.length > 1 ? 's' : ''} deleted`);
      setDeleteModal(null);
    } else {
      toast.error(result.payload || 'Delete failed');
    }
    setDeleting(false);
  };

  const filtered = search
    ? orders.filter(o =>
        o.orderNumber?.toLowerCase().includes(search.toLowerCase()) ||
        o.customer.name.toLowerCase().includes(search.toLowerCase()) ||
        o.customer.phone.includes(search))
    : orders;

  const allSelected = filtered.length > 0 && selectedIds.length === filtered.length;

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold text-gray-800">Order Management</h2>
        <button onClick={load} className="flex items-center gap-2 text-sm text-gray-500 hover:text-orange-500 transition-colors">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-3">
        <div className="flex flex-wrap gap-3">
          <div className="flex gap-2 overflow-x-auto">
            {STATUS_OPTIONS.map(s => (
              <button key={s} onClick={() => { setSelectedStatus(s); setPage(1); }}
                className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
                  selectedStatus === s ? 'bg-orange-500 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-orange-50 hover:text-orange-600'
                }`}>{s}</button>
            ))}
          </div>
          <div className="relative ml-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Search orders..." value={search} onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 w-52" />
          </div>
        </div>

        {/* Bulk action bar */}
        {selectedIds.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 p-3 bg-orange-50 rounded-xl border border-orange-200">
            <AlertCircle className="w-4 h-4 text-orange-500 flex-shrink-0" />
            <span className="text-sm text-orange-700 font-semibold">{selectedIds.length} selected</span>
            <select value={bulkStatus} onChange={e => setBulkStatus(e.target.value)}
              className="text-sm border border-orange-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none">
              {STATUS_OPTIONS.filter(s => s !== 'All').map(s => <option key={s}>{s}</option>)}
            </select>
            <button onClick={handleBulkStatusUpdate} className="btn-primary text-sm py-1.5 px-4">Apply Status</button>
            {isSuperAdmin && (
              <button onClick={() => setDeleteModal({ ids: selectedIds })}
                className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold px-4 py-1.5 rounded-xl ml-auto">
                <Trash2 className="w-4 h-4" /> Delete Selected
              </button>
            )}
            <button onClick={() => dispatch(clearOrderSelection())} className="text-sm text-gray-500 hover:text-gray-700">Clear</button>
          </div>
        )}

        {!isSuperAdmin && (
          <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-50 rounded-xl px-3 py-2">
            <ShieldAlert className="w-3.5 h-3.5" /> Order deletion is restricted to Super Admin only
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-7 h-7 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
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
                    <button onClick={() => allSelected ? dispatch(clearOrderSelection()) : dispatch(selectAllOrders(filtered.map(o => o._id)))}
                      className="text-gray-400 hover:text-orange-500">
                      {allSelected ? <CheckSquare className="w-4 h-4 text-orange-500" /> : <Square className="w-4 h-4" />}
                    </button>
                  </th>
                  {['Order #','Customer','Items','Amount','Status','Date','Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(order => (
                  <tr key={order._id} className={`hover:bg-orange-50/30 transition-colors ${selectedIds.includes(order._id) ? 'bg-orange-50/60' : ''}`}>
                    <td className="px-4 py-4">
                      <button onClick={() => dispatch(toggleSelectOrder(order._id))} className="text-gray-400 hover:text-orange-500">
                        {selectedIds.includes(order._id) ? <CheckSquare className="w-4 h-4 text-orange-500" /> : <Square className="w-4 h-4" />}
                      </button>
                    </td>
                    <td className="px-4 py-4"><span className="font-mono text-xs text-orange-600 font-bold bg-orange-50 px-2 py-1 rounded-lg">{order.orderNumber}</span></td>
                    <td className="px-4 py-4"><p className="font-medium text-gray-800">{order.customer.name}</p><p className="text-gray-400 text-xs">{order.customer.phone}</p></td>
                    <td className="px-4 py-4 text-gray-600">{order.items.length} item(s)</td>
                    <td className="px-4 py-4 font-bold text-gray-800">₹{order.totalAmount}</td>
                    <td className="px-4 py-4"><span className={`badge text-xs px-2.5 py-1 border ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>{order.status}</span></td>
                    <td className="px-4 py-4 text-gray-400 text-xs whitespace-nowrap">
                      {new Date(order.createdAt).toLocaleDateString('en-IN')}<br />
                      {new Date(order.createdAt).toLocaleTimeString('en-IN', { timeStyle:'short' })}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => setViewOrder(order)}
                          className="flex items-center gap-1 text-orange-500 hover:text-orange-700 font-medium text-xs bg-orange-50 hover:bg-orange-100 px-2.5 py-1.5 rounded-lg transition-colors">
                          <Eye className="w-3.5 h-3.5" /> View
                        </button>
                        {isSuperAdmin && (
                          <button onClick={() => setDeleteModal({ ids: [order._id] })}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
            <p className="text-sm text-gray-500">{pagination.total} total orders</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1}
                className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-orange-50 disabled:opacity-40">Prev</button>
              <span className="px-3 py-1.5 text-sm font-medium bg-orange-500 text-white rounded-lg">{page} / {pagination.pages}</span>
              <button onClick={() => setPage(p => Math.min(pagination.pages, p+1))} disabled={page===pagination.pages}
                className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-orange-50 disabled:opacity-40">Next</button>
            </div>
          </div>
        )}
      </div>

      {viewOrder    && <OrderDetailModal order={viewOrder} onClose={() => setViewOrder(null)} />}
      {deleteModal  && <DeleteConfirmModal count={deleteModal.ids.length} onConfirm={confirmDelete} onCancel={() => setDeleteModal(null)} loading={deleting} />}
    </div>
  );
};

export default AdminOrders;
