import React, { useState, useEffect } from 'react';
import {
  Calendar, RefreshCw, Search, Eye, X, Phone, Mail,
  MapPin, Users, Clock, FileText,
  Trash2, CheckSquare, Square, AlertCircle, ShieldAlert
} from 'lucide-react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = ['All', 'New', 'Contacted', 'Confirmed', 'Completed', 'Cancelled'];
const EVENT_TYPES = ['All', 'Birthday Event', 'Inauguration Event', 'Departmental Event', 'Corporate Event', 'Others'];

const STATUS_COLORS = {
  New: 'bg-blue-100 text-blue-700 border-blue-200',
  Contacted: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  Confirmed: 'bg-green-100 text-green-700 border-green-200',
  Completed: 'bg-purple-100 text-purple-700 border-purple-200',
  Cancelled: 'bg-red-100 text-red-700 border-red-200',
};

const EVENT_EMOJIS = {
  'Birthday Event': '🎂', 'Inauguration Event': '⭐',
  'Departmental Event': '🏢', 'Corporate Event': '💼', 'Others': '📋',
};

// ── Confirm Delete Modal ──────────────────────────────────────────────────────
const DeleteConfirmModal = ({ count, onConfirm, onCancel, loading }) => (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-bounce-in">
      <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <Trash2 className="w-7 h-7 text-red-500" />
      </div>
      <h3 className="font-display font-bold text-xl text-gray-800 text-center mb-2">
        Delete {count > 1 ? `${count} Bookings` : 'Booking'}?
      </h3>
      <p className="text-gray-500 text-sm text-center mb-6">
        This action <strong>cannot be undone</strong>. The {count > 1 ? 'bookings' : 'booking'} will be permanently removed.
      </p>
      <div className="flex gap-3">
        <button onClick={onCancel} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50">
          Cancel
        </button>
        <button onClick={onConfirm} disabled={loading}
          className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 rounded-xl text-sm disabled:opacity-60">
          {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Trash2 className="w-4 h-4" />}
          Delete
        </button>
      </div>
    </div>
  </div>
);

// ── Booking Detail Modal ──────────────────────────────────────────────────────
const BookingModal = ({ booking, onClose, onUpdate }) => {
  const [status, setStatus] = useState(booking.status);
  const [adminNotes, setAdminNotes] = useState(booking.adminNotes || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.put(`/bookings/${booking._id}`, { status, adminNotes });
      toast.success('Booking updated!');
      onUpdate(res.data.data);
      onClose();
    } catch {
      toast.error('Failed to update booking');
    } finally {
      setSaving(false);
    }
  };

  const eventDate = new Date(booking.eventDate).toLocaleDateString('en-IN', { dateStyle: 'long' });

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{EVENT_EMOJIS[booking.eventType] || '📋'}</span>
              <h2 className="font-display font-bold text-xl text-gray-800">{booking.eventType}</h2>
            </div>
            <p className="text-gray-400 text-sm mt-0.5">{booking.bookingNumber}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl"><X className="w-5 h-5 text-gray-500" /></button>
        </div>
        <div className="p-6 space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-orange-50 rounded-xl p-4">
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-3">Contact</p>
              <div className="space-y-2 text-sm">
                <p className="font-semibold text-gray-800">{booking.customer.name}</p>
                <p className="flex items-center gap-2 text-gray-600"><Phone className="w-4 h-4 text-orange-400" />{booking.customer.phone}</p>
                {booking.customer.email && <p className="flex items-center gap-2 text-gray-600"><Mail className="w-4 h-4 text-orange-400" />{booking.customer.email}</p>}
              </div>
            </div>
            <div className="bg-orange-50 rounded-xl p-4">
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-3">Event Details</p>
              <div className="space-y-2 text-sm text-gray-600">
                <p className="flex items-center gap-2"><Calendar className="w-4 h-4 text-orange-400" />{eventDate}</p>
                <p className="flex items-center gap-2"><Clock className="w-4 h-4 text-orange-400" />{booking.eventTime}</p>
                <p className="flex items-center gap-2"><Users className="w-4 h-4 text-orange-400" />{booking.numberOfGuests} guests</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-2">Venue</p>
            <p className="text-gray-700 text-sm flex items-start gap-2"><MapPin className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />{booking.venue}</p>
          </div>

          {booking.specialRequirements && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <p className="text-xs text-yellow-600 font-semibold uppercase tracking-wide mb-2">Special Requirements</p>
              <p className="text-yellow-800 text-sm">{booking.specialRequirements}</p>
            </div>
          )}
          <div className="border-t pt-4 space-y-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Update Status</label>
              <select value={status} onChange={e => setStatus(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400">
                {STATUS_OPTIONS.filter(s => s !== 'All').map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Admin Notes</label>
              <textarea value={adminNotes} onChange={e => setAdminNotes(e.target.value)} rows={3}
                placeholder="Internal notes about this booking..."
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none" />
            </div>
            <div className="flex gap-3">
              <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={handleSave} disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 rounded-xl text-sm disabled:opacity-60">
                {saving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const AdminBookings = () => {
  const { admin } = useAuth();
  const isSuperAdmin = admin?.role === 'superadmin';

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [eventFilter, setEventFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [viewBooking, setViewBooking] = useState(null);
  const [stats, setStats] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [bookingsRes, statsRes] = await Promise.all([
        api.get('/bookings', { params: { limit: 100 } }),
        api.get('/bookings/stats/overview')
      ]);
      setBookings(bookingsRes.data.data);
      setStats(statsRes.data.data);
      setSelectedIds([]);
    } catch {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleUpdate = (updated) => {
    setBookings(prev => prev.map(b => b._id === updated._id ? updated : b));
  };

  const confirmDelete = async () => {
    if (!deleteModal) return;
    setDeleting(true);
    try {
      const { ids } = deleteModal;
      if (ids.length === 1) {
        await api.delete(`/bookings/${ids[0]}`);
      } else {
        await api.delete('/bookings/bulk/delete', { data: { bookingIds: ids } });
      }
      toast.success(`${ids.length} booking${ids.length > 1 ? 's' : ''} deleted`);
      setDeleteModal(null);
      setSelectedIds([]);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    } finally {
      setDeleting(false);
    }
  };

  const filtered = bookings.filter(b => {
    const matchStatus = statusFilter === 'All' || b.status === statusFilter;
    const matchEvent = eventFilter === 'All' || b.eventType === eventFilter;
    const matchSearch = !search ||
      b.bookingNumber?.toLowerCase().includes(search.toLowerCase()) ||
      b.customer.name.toLowerCase().includes(search.toLowerCase()) ||
      b.customer.phone.includes(search);
    return matchStatus && matchEvent && matchSearch;
  });

  const toggleSelect = (id) => setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  const toggleSelectAll = () => setSelectedIds(selectedIds.length === filtered.length ? [] : filtered.map(b => b._id));
  const anySelected = selectedIds.length > 0;

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-gray-800">Bookings</h2>
          <p className="text-gray-500 text-sm mt-0.5">Event enquiries from customers</p>
        </div>
        <button onClick={fetchAll} className="p-2 text-gray-500 hover:text-orange-500 hover:bg-orange-50 rounded-xl transition-colors">
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Enquiries', value: stats.total, color: 'bg-blue-50 text-blue-600' },
            { label: 'New', value: stats.newBookings, color: 'bg-orange-50 text-orange-600' },
            { label: 'Confirmed', value: stats.confirmed, color: 'bg-green-50 text-green-600' },
            { label: 'Completed', value: stats.completed, color: 'bg-purple-50 text-purple-600' },
          ].map(({ label, value, color }) => (
            <div key={label} className={`${color} rounded-2xl p-4`}>
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-sm font-medium opacity-80">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-3">
        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex gap-2 overflow-x-auto">
            {STATUS_OPTIONS.map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${statusFilter === s ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-orange-50'
                  }`}>{s}</button>
            ))}
          </div>
          <div className="relative ml-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Search bookings..." value={search} onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 w-48" />
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto">
          {EVENT_TYPES.map(t => (
            <button key={t} onClick={() => setEventFilter(t)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${eventFilter === t ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}>
              {EVENT_EMOJIS[t] || ''} {t}
            </button>
          ))}
        </div>

        {/* Bulk action bar */}
        {anySelected && (
          <div className="flex flex-wrap items-center gap-3 p-3 bg-orange-50 rounded-xl border border-orange-200">
            <AlertCircle className="w-4 h-4 text-orange-500 flex-shrink-0" />
            <span className="text-sm text-orange-700 font-semibold">{selectedIds.length} selected</span>
            {isSuperAdmin && (
              <button
                onClick={() => setDeleteModal({ ids: selectedIds })}
                className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold px-4 py-1.5 rounded-xl transition-all ml-auto">
                <Trash2 className="w-4 h-4" /> Delete Selected
              </button>
            )}
            <button onClick={() => setSelectedIds([])} className="text-sm text-gray-500 hover:text-gray-700">Clear</button>
          </div>
        )}

        {!isSuperAdmin && (
          <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-50 rounded-xl px-3 py-2">
            <ShieldAlert className="w-3.5 h-3.5" />
            Booking deletion is restricted to Super Admin only
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
            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No bookings found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <button onClick={toggleSelectAll} className="text-gray-400 hover:text-orange-500 transition-colors">
                      {selectedIds.length > 0 && selectedIds.length === filtered.length
                        ? <CheckSquare className="w-4 h-4 text-orange-500" />
                        : <Square className="w-4 h-4" />}
                    </button>
                  </th>
                  {['Booking #', 'Event Type', 'Customer', 'Date', 'Guests', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(booking => (
                  <tr key={booking._id} className={`hover:bg-orange-50/30 transition-colors ${selectedIds.includes(booking._id) ? 'bg-orange-50/60' : ''}`}>
                    <td className="px-4 py-4">
                      <button onClick={() => toggleSelect(booking._id)} className="text-gray-400 hover:text-orange-500">
                        {selectedIds.includes(booking._id) ? <CheckSquare className="w-4 h-4 text-orange-500" /> : <Square className="w-4 h-4" />}
                      </button>
                    </td>
                    <td className="px-4 py-4">
                      <span className="font-mono text-xs text-oranZge-600 font-bold bg-orange-50 px-2 py-1 rounded-lg">{booking.bookingNumber}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="flex items-center gap-1.5 text-gray-700 font-medium">
                        {EVENT_EMOJIS[booking.eventType]} {booking.eventType}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-medium text-gray-800">{booking.customer.name}</p>
                      <p className="text-gray-400 text-xs">{booking.customer.phone}</p>
                    </td>
                    <td className="px-4 py-4 text-gray-600 whitespace-nowrap">
                      {new Date(booking.eventDate).toLocaleDateString('en-IN')}
                      <p className="text-gray-400 text-xs">{booking.eventTime}</p>
                    </td>
                    <td className="px-4 py-4 text-gray-600">{booking.numberOfGuests}</td>
                    <td className="px-4 py-4">
                      <span className={`badge text-xs px-2.5 py-1 border ${STATUS_COLORS[booking.status] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => setViewBooking(booking)}
                          className="flex items-center gap-1 text-orange-500 hover:text-orange-700 text-xs bg-orange-50 hover:bg-orange-100 px-2.5 py-1.5 rounded-lg transition-colors font-medium">
                          <Eye className="w-3.5 h-3.5" /> View
                        </button>
                        {isSuperAdmin && (
                          <button onClick={() => setDeleteModal({ ids: [booking._id] })}
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
      </div>

      {viewBooking && <BookingModal booking={viewBooking} onClose={() => setViewBooking(null)} onUpdate={handleUpdate} />}
      {deleteModal && <DeleteConfirmModal count={deleteModal.ids.length} onConfirm={confirmDelete} onCancel={() => setDeleteModal(null)} loading={deleting} />}
    </div>
  );
};

export default AdminBookings;
