import React, { useState, useEffect } from 'react';
import {
  Plus, Trash2, RefreshCw, Shield, ShieldCheck,
  KeyRound, Pencil, ToggleLeft, ToggleRight, X, Save,
  Eye, EyeOff, AlertCircle, Users, Bell, Clock, Check,
  Crown, ArrowUpCircle, ArrowDownCircle
} from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

// ─── Modal Shell ─────────────────────────────────────────────────────────────
const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
      <div className="flex items-center justify-between p-5 border-b">
        <h2 className="font-display font-bold text-lg text-gray-800">{title}</h2>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl"><X className="w-4 h-4 text-gray-500" /></button>
      </div>
      <div className="p-5">{children}</div>
    </div>
  </div>
);

// ─── Password Input ───────────────────────────────────────────────────────────
const PasswordInput = ({ label, name, value, onChange, placeholder, required, error }) => {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label} {required && <span className="text-red-500">*</span>}</label>
      <div className="relative">
        <input type={show ? 'text' : 'password'} name={name} value={value} onChange={onChange} placeholder={placeholder}
          className={`w-full border rounded-xl px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all ${error ? 'border-red-400' : 'border-gray-200'}`} />
        <button type="button" onClick={() => setShow(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {error && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{error}</p>}
    </div>
  );
};

// ─── Create Admin Modal ───────────────────────────────────────────────────────
const CreateAdminModal = ({ onClose, onCreated }) => {
  const [form, setForm] = useState({ username: '', name: '', password: '', role: 'admin' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.username.trim()) e.username = 'Username is required';
    else if (form.username.includes(' ')) e.username = 'No spaces allowed';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'Minimum 6 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await api.post('/admin/create', form);
      toast.success(res.data.message);
      onCreated(res.data.data);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create admin');
    } finally { setLoading(false); }
  };

  const change = (e) => { const { name, value } = e.target; setForm(p => ({ ...p, [name]: value })); if (errors[name]) setErrors(p => ({ ...p, [name]: '' })); };

  return (
    <Modal title="Create New Admin" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Username <span className="text-red-500">*</span></label>
          <input type="text" name="username" value={form.username} onChange={change} placeholder="e.g. john_doe"
            className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 ${errors.username ? 'border-red-400' : 'border-gray-200'}`} />
          {errors.username && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.username}</p>}
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
          <input type="text" name="name" value={form.name} onChange={change} placeholder="e.g. John Doe"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
        </div>
        <PasswordInput label="Password" name="password" value={form.password} onChange={change} placeholder="Min. 6 characters" required error={errors.password} />
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Role</label>
          <div className="flex gap-3">
            {['admin', 'superadmin'].map(r => (
              <button key={r} type="button" onClick={() => setForm(p => ({ ...p, role: r }))}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
                  form.role === r
                    ? r === 'superadmin' ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-orange-400 bg-orange-50 text-orange-700'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300'
                }`}>
                {r === 'superadmin' ? <ShieldCheck className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                {r === 'superadmin' ? 'Super Admin' : 'Admin'}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
          <button type="submit" disabled={loading} className="flex-1 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 rounded-xl text-sm disabled:opacity-60">
            {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Plus className="w-4 h-4" />}
            Create Admin
          </button>
        </div>
      </form>
    </Modal>
  );
};

// ─── Edit Name Modal ──────────────────────────────────────────────────────────
const EditNameModal = ({ admin, onClose, onUpdated }) => {
  const [name, setName] = useState(admin.name || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error('Name cannot be empty');
    setLoading(true);
    try {
      const res = await api.put(`/admin/${admin._id}/update-name`, { name });
      toast.success('Name updated!');
      onUpdated(res.data.data);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally { setLoading(false); }
  };

  return (
    <Modal title={`Edit Name — @${admin.username}`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name <span className="text-red-500">*</span></label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Enter full name"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
        </div>
        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
          <button type="submit" disabled={loading} className="flex-1 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 rounded-xl text-sm disabled:opacity-60">
            {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
            Save
          </button>
        </div>
      </form>
    </Modal>
  );
};

// ─── Reset Password Modal ─────────────────────────────────────────────────────
const ResetPasswordModal = ({ admin, onClose, onResolved }) => {
  const [form, setForm] = useState({ newPassword: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.newPassword) e.newPassword = 'Password is required';
    else if (form.newPassword.length < 6) e.newPassword = 'Minimum 6 characters';
    if (!form.confirmPassword) e.confirmPassword = 'Please confirm password';
    else if (form.newPassword !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    setErrors(e); return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await api.put(`/admin/${admin._id}/reset-password`, { newPassword: form.newPassword });
      if (onResolved) await onResolved();
      toast.success(`Password reset for @${admin.username}`);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset');
    } finally { setLoading(false); }
  };

  const change = (e) => { const { name, value } = e.target; setForm(p => ({ ...p, [name]: value })); if (errors[name]) setErrors(p => ({ ...p, [name]: '' })); };

  return (
    <Modal title={`Reset Password — @${admin.username}`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-yellow-700 text-xs">
          ⚠️ This immediately changes the password for <strong>@{admin.username}</strong>.
        </div>
        <PasswordInput label="New Password" name="newPassword" value={form.newPassword} onChange={change} placeholder="Min. 6 characters" required error={errors.newPassword} />
        <PasswordInput label="Confirm Password" name="confirmPassword" value={form.confirmPassword} onChange={change} placeholder="Re-enter password" required error={errors.confirmPassword} />
        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
          <button type="submit" disabled={loading} className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 rounded-xl text-sm disabled:opacity-60">
            {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <KeyRound className="w-4 h-4" />}
            Reset Password
          </button>
        </div>
      </form>
    </Modal>
  );
};

// ─── Promote Confirm Modal ────────────────────────────────────────────────────
const PromoteModal = ({ admin, onClose, onPromoted }) => {
  const [loading, setLoading] = useState(false);

  const handlePromote = async () => {
    setLoading(true);
    try {
      const res = await api.put(`/admin/${admin._id}/promote`);
      toast.success(res.data.message);
      onPromoted(admin._id);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to promote');
    } finally { setLoading(false); }
  };

  return (
    <Modal title="Promote to Super Admin" onClose={onClose}>
      <div className="space-y-4">
        <div className="flex flex-col items-center py-4">
          <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-3">
            <Crown className="w-8 h-8 text-purple-500" />
          </div>
          <p className="font-semibold text-gray-800 text-lg">@{admin.username}</p>
          {admin.name && <p className="text-gray-500 text-sm">{admin.name}</p>}
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 text-purple-700 text-sm">
          This will grant <strong>@{admin.username}</strong> full Super Admin privileges — including the ability to manage all admins, view revenue, and delete records.
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
          <button onClick={handlePromote} disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2.5 rounded-xl text-sm disabled:opacity-60">
            {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Crown className="w-4 h-4" />}
            Promote
          </button>
        </div>
      </div>
    </Modal>
  );
};


// ─── Demote Confirm Modal ─────────────────────────────────────────────────────
const DemoteModal = ({ admin, onClose, onDemoted }) => {
  const [loading, setLoading] = useState(false);

  const handleDemote = async () => {
    setLoading(true);
    try {
      const res = await api.put(`/admin/${admin._id}/demote`);
      toast.success(res.data.message);
      onDemoted(admin._id);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to demote');
    } finally { setLoading(false); }
  };

  return (
    <Modal title="Demote to Admin" onClose={onClose}>
      <div className="space-y-4">
        <div className="flex flex-col items-center py-4">
          <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mb-3">
            <ArrowDownCircle className="w-8 h-8 text-orange-500" />
          </div>
          <p className="font-semibold text-gray-800 text-lg">@{admin.username}</p>
          {admin.name && <p className="text-gray-500 text-sm">{admin.name}</p>}
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 text-orange-700 text-sm">
          This will revoke <strong>@{admin.username}</strong>'s Super Admin privileges. They will become a regular Admin.
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
          <button onClick={handleDemote} disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 rounded-xl text-sm disabled:opacity-60">
            {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <ArrowDownCircle className="w-4 h-4" />}
            Demote
          </button>
        </div>
      </div>
    </Modal>
  );
};

// ─── Admin Card ───────────────────────────────────────────────────────────────
const AdminCard = ({ a, currentAdmin, onEdit, onReset, onToggle, onDelete, onPromote, onDemote }) => {
  const isYou      = a._id === currentAdmin?.id;
  const isSuperAdm = a.role === 'superadmin';

  return (
    <div className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${
      !a.isActive ? 'opacity-50 bg-gray-50 border-gray-200' :
      isSuperAdm  ? 'bg-purple-50/50 border-purple-200' : 'bg-white border-gray-100 hover:border-orange-200 hover:shadow-sm'
    }`}>
      {/* Avatar */}
      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-base flex-shrink-0 ${isSuperAdm ? 'bg-purple-500' : 'bg-orange-400'}`}>
        {(a.name || a.username)[0].toUpperCase()}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <p className="font-semibold text-gray-800 text-sm truncate">{a.name || <span className="text-gray-400 italic text-xs">No name</span>}</p>
          {isYou && <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-medium">You</span>}
          {!a.isActive && <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">Inactive</span>}
        </div>
        <p className="text-gray-400 text-xs">@{a.username}</p>
      </div>

      {/* Actions — hidden for self */}
      {!isYou && (
        <div className="flex items-center gap-1 flex-shrink-0">
          <button onClick={() => onEdit(a)} title="Edit name" className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
          <button onClick={() => onReset(a)} title="Reset password" className="p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"><KeyRound className="w-3.5 h-3.5" /></button>
          {/* {isSuperAdm && (
            <button onClick={() => onDemote(a)} title="Demote to Admin" className="p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"><ArrowDownCircle className="w-3.5 h-3.5" /></button>
          )} */}
          {!isSuperAdm && (
            <>
              <button onClick={() => onPromote(a)} title="Promote to Super Admin" className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"><ArrowUpCircle className="w-3.5 h-3.5" /></button>
              <button onClick={() => onToggle(a)} title={a.isActive ? 'Deactivate' : 'Activate'} className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                {a.isActive ? <ToggleRight className="w-3.5 h-3.5 text-green-500" /> : <ToggleLeft className="w-3.5 h-3.5" />}
              </button>
              <button onClick={() => onDelete(a)} title="Delete" className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const AdminManagement = () => {
  const { admin: currentAdmin } = useAuth();

  const [admins,         setAdmins]         = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [showCreate,     setShowCreate]     = useState(false);
  const [editTarget,     setEditTarget]     = useState(null);
  const [resetTarget,    setResetTarget]    = useState(null);
  const [promoteTarget,  setPromoteTarget]  = useState(null);
  const [demoteTarget,   setDemoteTarget]   = useState(null);
  const [pendingResolveId, setPendingResolveId] = useState(null);
  const [resetRequests,  setResetRequests]  = useState([]);

  const fetchAdmins = async () => {
    setLoading(true);
    try { const res = await api.get('/admin/all'); setAdmins(res.data.data); }
    catch { toast.error('Failed to load admins'); }
    finally { setLoading(false); }
  };

  const fetchResetRequests = async () => {
    try { const res = await api.get('/admin/reset-requests'); setResetRequests(res.data.data); }
    catch { /* silent */ }
  };

  useEffect(() => { fetchAdmins(); fetchResetRequests(); }, []);

  const handleToggleStatus = async (admin) => {
    try {
      const res = await api.put(`/admin/${admin._id}/toggle-status`);
      setAdmins(prev => prev.map(a => a._id === admin._id ? { ...a, isActive: res.data.data.isActive } : a));
      toast.success(res.data.message);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleDelete = async (admin) => {
    if (!window.confirm(`Delete admin "@${admin.username}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/admin/${admin._id}`);
      setAdmins(prev => prev.filter(a => a._id !== admin._id));
      toast.success(`@${admin.username} deleted`);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to delete'); }
  };

  const handleDemoted = (adminId) => {
    setAdmins(prev => prev.map(a => a._id === adminId ? { ...a, role: 'admin' } : a));
  };

  const handlePromoted = (adminId) => {
    setAdmins(prev => prev.map(a => a._id === adminId ? { ...a, role: 'superadmin' } : a));
  };

  const handleResolveRequest = (reqId, adminId) => {
    const target = admins.find(a => a._id === adminId);
    if (target) { setResetTarget(target); setPendingResolveId(reqId); }
  };

  const handleDismissRequest = async (reqId) => {
    try {
      await api.put(`/admin/reset-requests/${reqId}/resolve`);
      setResetRequests(prev => prev.filter(r => r._id !== reqId));
      toast.success('Request dismissed');
    } catch { toast.error('Failed to dismiss'); }
  };

  const handleCreated  = (a)  => setAdmins(prev => [a, ...prev]);
  const handleUpdated  = (u)  => setAdmins(prev => prev.map(a => a._id === u._id ? { ...a, ...u } : a));

  const me = admins.find(a => a._id === currentAdmin?.id) || currentAdmin;

  // Current user always shown first in their column
  const sortCurrentFirst = (list) => [
    ...list.filter(a => a._id === currentAdmin?.id),
    ...list.filter(a => a._id !== currentAdmin?.id),
  ];

  const superAdmins   = sortCurrentFirst(admins.filter(a => a.role === 'superadmin'));
  const regularAdmins = sortCurrentFirst(admins.filter(a => a.role !== 'superadmin'));

  const cardProps = { currentAdmin, onEdit: setEditTarget, onReset: setResetTarget, onToggle: handleToggleStatus, onDelete: handleDelete, onPromote: setPromoteTarget, onDemote: setDemoteTarget };

  return (
    <div className="space-y-5 animate-fade-in">

      {/* ── Profile Banner ── */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
        <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
          {(me?.name || me?.username || 'A')[0].toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-bold text-lg leading-tight">{me?.name || <span className="opacity-70 italic text-base">No name set</span>}</p>
          <p className="text-white/80 text-sm">@{me?.username}</p>
        </div>
        <div className="flex-shrink-0">
          <span className="flex items-center gap-1.5 bg-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-full">
            <ShieldCheck className="w-3.5 h-3.5" /> Super Admin
          </span>
        </div>
      </div>

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-gray-800">Admin Management</h2>
          <p className="text-gray-500 text-sm mt-0.5">Manage all admin accounts and permissions.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { fetchAdmins(); fetchResetRequests(); }} className="p-2 text-gray-500 hover:text-orange-500 hover:bg-orange-50 rounded-xl transition-colors">
            <RefreshCw className="w-5 h-5" />
          </button>
          <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-2 rounded-xl text-sm shadow-sm">
            <Plus className="w-4 h-4" /> New Admin
          </button>
        </div>
      </div>

      {/* ── Password Reset Requests ── */}
      {resetRequests.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-orange-200 overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-3 bg-orange-50 border-b border-orange-200">
            <div className="relative">
              <Bell className="w-5 h-5 text-orange-500" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">{resetRequests.length}</span>
            </div>
            <p className="font-semibold text-orange-800 text-sm">Password Reset Requests — {resetRequests.length} pending</p>
          </div>
          <div className="divide-y divide-gray-50">
            {resetRequests.map(req => (
              <div key={req._id} className="flex items-center justify-between px-5 py-4 hover:bg-orange-50/30">
                <div>
                  <p className="font-semibold text-gray-800">@{req.username}</p>
                  {req.admin?.name && <p className="text-gray-500 text-xs">{req.admin.name}</p>}
                  <p className="flex items-center gap-1 text-gray-400 text-xs mt-1">
                    <Clock className="w-3 h-3" />
                    {new Date(req.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleResolveRequest(req._id, req.admin?._id)}
                    className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold px-3 py-2 rounded-xl">
                    <KeyRound className="w-3.5 h-3.5" /> Reset Password
                  </button>
                  <button onClick={() => handleDismissRequest(req._id)}
                    className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-semibold px-3 py-2 rounded-xl">
                    <Check className="w-3.5 h-3.5" /> Dismiss
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Two Column Layout ── */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-7 h-7 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-5">

          {/* Super Admins */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gray-100 bg-purple-50">
              <ShieldCheck className="w-4 h-4 text-purple-500" />
              <h3 className="font-bold text-purple-800 text-sm">Super Admins</h3>
              <span className="ml-auto text-xs bg-purple-100 text-purple-600 font-bold px-2 py-0.5 rounded-full">{superAdmins.length}</span>
            </div>
            <div className="p-3 space-y-2">
              {superAdmins.length === 0 ? (
                <p className="text-center text-gray-400 text-sm py-6">No super admins</p>
              ) : superAdmins.map(a => (
                <AdminCard key={a._id} a={a} {...cardProps} />
              ))}
            </div>
          </div>

          {/* Admins */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gray-100 bg-orange-50">
              <Shield className="w-4 h-4 text-orange-500" />
              <h3 className="font-bold text-orange-800 text-sm">Admins</h3>
              <span className="ml-auto text-xs bg-orange-100 text-orange-600 font-bold px-2 py-0.5 rounded-full">{regularAdmins.length}</span>
            </div>
            <div className="p-3 space-y-2">
              {regularAdmins.length === 0 ? (
                <div className="text-center text-gray-400 text-sm py-6">
                  <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  No admins yet
                </div>
              ) : regularAdmins.map(a => (
                <AdminCard key={a._id} a={a} {...cardProps} />
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Modals */}
      {showCreate    && <CreateAdminModal onClose={() => setShowCreate(false)} onCreated={handleCreated} />}
      {editTarget    && <EditNameModal admin={editTarget} onClose={() => setEditTarget(null)} onUpdated={handleUpdated} />}
      {promoteTarget && <PromoteModal admin={promoteTarget} onClose={() => setPromoteTarget(null)} onPromoted={handlePromoted} />}
      {demoteTarget  && <DemoteModal  admin={demoteTarget}  onClose={() => setDemoteTarget(null)}  onDemoted={handleDemoted}  />}
      {resetTarget   && (
        <ResetPasswordModal
          admin={resetTarget}
          onClose={() => { setResetTarget(null); setPendingResolveId(null); }}
          onResolved={pendingResolveId ? async () => {
            await api.put(`/admin/reset-requests/${pendingResolveId}/resolve`);
            setResetRequests(prev => prev.filter(r => r._id !== pendingResolveId));
            setPendingResolveId(null);
          } : null}
        />
      )}
    </div>
  );
};

export default AdminManagement;
