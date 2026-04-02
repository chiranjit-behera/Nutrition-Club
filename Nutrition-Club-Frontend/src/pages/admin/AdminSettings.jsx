import React, { useState } from 'react';
import { User, Lock, Save, Eye, EyeOff, AlertCircle, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const Section = ({ icon: Icon, title, subtitle, children }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
    <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gray-50">
      <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
        <Icon className="w-4 h-4 text-orange-600" />
      </div>
      <div>
        <h3 className="font-display font-bold text-gray-800">{title}</h3>
        {subtitle && <p className="text-gray-400 text-xs">{subtitle}</p>}
      </div>
    </div>
    <div className="p-6">{children}</div>
  </div>
);

const PasswordInput = ({ label, name, value, onChange, placeholder, required, error }) => {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full border rounded-xl px-4 py-3 pr-11 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all bg-white text-sm ${error ? 'border-red-400 ring-2 ring-red-100' : 'border-gray-200'}`}
        />
        <button
          type="button"
          onClick={() => setShow(s => !s)}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {error && (
        <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />{error}
        </p>
      )}
    </div>
  );
};

const AdminSettings = () => {
  const { admin, setAdmin } = useAuth();
  const isSuperAdmin = admin?.role === 'superadmin';

  // Name form (superadmin only)
  const [nameForm, setNameForm] = useState({ name: admin?.name || '' });
  const [nameLoading, setNameLoading] = useState(false);

  // Password form (all roles)
  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passErrors, setPassErrors] = useState({});
  const [passLoading, setPassLoading] = useState(false);

  const handleNameSubmit = async (e) => {
    e.preventDefault();
    if (!nameForm.name.trim()) return toast.error('Name cannot be empty');
    setNameLoading(true);
    try {
      const res = await api.put('/admin/update-profile', { name: nameForm.name.trim() });
      setAdmin({ name: res.data.admin.name });
      toast.success('Name updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update name');
    } finally {
      setNameLoading(false);
    }
  };

  const validatePassword = () => {
    const errors = {};
    if (!passForm.currentPassword) errors.currentPassword = 'Current password is required';
    if (!passForm.newPassword) errors.newPassword = 'New password is required';
    else if (passForm.newPassword.length < 6) errors.newPassword = 'Minimum 6 characters';
    if (!passForm.confirmPassword) errors.confirmPassword = 'Please confirm your new password';
    else if (passForm.newPassword !== passForm.confirmPassword) errors.confirmPassword = 'Passwords do not match';
    if (passForm.currentPassword && passForm.newPassword && passForm.currentPassword === passForm.newPassword)
      errors.newPassword = 'New password must differ from current';
    setPassErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!validatePassword()) return;
    setPassLoading(true);
    try {
      await api.put('/admin/update-profile', {
        currentPassword: passForm.currentPassword,
        newPassword: passForm.newPassword
      });
      setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPassErrors({});
      toast.success('Password updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    } finally {
      setPassLoading(false);
    }
  };

  const handlePassChange = (e) => {
    const { name, value } = e.target;
    setPassForm(p => ({ ...p, [name]: value }));
    if (passErrors[name]) setPassErrors(p => ({ ...p, [name]: '' }));
  };

  const strengthLevel = passForm.newPassword.length;
  const strengthLabel = strengthLevel === 0 ? '' : strengthLevel < 4 ? 'Weak' : strengthLevel < 7 ? 'Fair' : strengthLevel < 10 ? 'Good' : 'Strong';
  const strengthColor = strengthLevel < 4 ? 'bg-red-400' : strengthLevel < 7 ? 'bg-yellow-400' : strengthLevel < 10 ? 'bg-blue-400' : 'bg-green-400';

  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">
      <div>
        <h2 className="font-display text-2xl font-bold text-gray-800">Account Settings</h2>
        <p className="text-gray-500 text-sm mt-1">
          {isSuperAdmin ? 'Update your display name and password.' : 'You can update your password below.'}
        </p>
      </div>

      {/* Profile Card */}
      <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 flex items-center gap-4">
        <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
          {(admin?.name || admin?.username || 'A')[0].toUpperCase()}
        </div>
        <div className="flex-1">
          <p className="font-semibold text-gray-800">{admin?.name || 'No name set'}</p>
          <p className="text-gray-500 text-sm">@{admin?.username}</p>
        </div>
        <span className={`badge px-3 py-1 text-xs font-semibold ${isSuperAdmin ? 'bg-purple-100 text-purple-700 border border-purple-200' : 'bg-blue-100 text-blue-700 border border-blue-200'}`}>
          <Shield className="w-3 h-3 inline mr-1" />
          {isSuperAdmin ? 'Super Admin' : 'Admin'}
        </span>
      </div>

      {/* Name — superadmin only */}
      {isSuperAdmin && (
        <Section icon={User} title="Display Name" subtitle="Update how your name appears in the panel">
          <form onSubmit={handleNameSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={nameForm.name}
                onChange={(e) => setNameForm({ name: e.target.value })}
                placeholder="e.g. John Smith"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all text-sm"
              />
              <p className="text-gray-400 text-xs mt-1.5">
                Username <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">@{admin?.username}</span> cannot be changed.
              </p>
            </div>
            <button
              type="submit"
              disabled={nameLoading}
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-5 py-2.5 rounded-xl transition-all shadow-sm disabled:opacity-60 text-sm"
            >
              {nameLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
              Save Name
            </button>
          </form>
        </Section>
      )}

      {/* Password — all roles */}
      <Section icon={Lock} title="Change Password" subtitle="You can change your own password here">
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <PasswordInput
            label="Current Password" name="currentPassword"
            value={passForm.currentPassword} onChange={handlePassChange}
            placeholder="Enter current password" required
            error={passErrors.currentPassword}
          />
          <PasswordInput
            label="New Password" name="newPassword"
            value={passForm.newPassword} onChange={handlePassChange}
            placeholder="Min. 6 characters" required
            error={passErrors.newPassword}
          />
          {passForm.newPassword && (
            <div className="flex items-center gap-2 -mt-2">
              <div className="flex gap-1 flex-1">
                {[1,2,3,4].map(i => (
                  <div key={i} className={`h-1 flex-1 rounded-full transition-all ${strengthLevel >= i * 3 ? strengthColor : 'bg-gray-200'}`} />
                ))}
              </div>
              <span className="text-xs text-gray-400">{strengthLabel}</span>
            </div>
          )}
          <PasswordInput
            label="Confirm New Password" name="confirmPassword"
            value={passForm.confirmPassword} onChange={handlePassChange}
            placeholder="Re-enter new password" required
            error={passErrors.confirmPassword}
          />
          <button
            type="submit"
            disabled={passLoading}
            className="flex items-center gap-2 bg-gray-800 hover:bg-gray-900 text-white font-semibold px-5 py-2.5 rounded-xl transition-all shadow-sm disabled:opacity-60 text-sm"
          >
            {passLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Lock className="w-4 h-4" />}
            Update Password
          </button>
        </form>
      </Section>

      {/* Info box for regular admins */}
      {!isSuperAdmin && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700 flex items-start gap-3">
          <Shield className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p>To update your display name or reset password, please contact your <strong>Super Admin</strong>.</p>
        </div>
      )}
    </div>
  );
};

export default AdminSettings;
