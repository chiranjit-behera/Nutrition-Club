import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UtensilsCrossed, Lock, User, Eye, EyeOff, LogIn, KeyRound, ArrowLeft, Send } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import logo from '../../assets/cutmlogo.png';


const AdminLogin = () => {
  const [mode, setMode]         = useState('login'); // 'login' | 'forgot'
  const [form, setForm]         = useState({ username: '', password: '' });
  const [forgotUser, setForgotUser] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (isAuthenticated) navigate('/admin/dashboard', { replace: true });

  // ── Login ──────────────────────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password) { toast.error('Please enter username and password'); return; }
    setLoading(true);
    try {
      await login(form.username, form.password);
      toast.success('Welcome back, Admin!');
      navigate('/admin/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    } finally { setLoading(false); }
  };

  // ── Forgot Password ────────────────────────────────────────────────────────
  const handleForgot = async (e) => {
    e.preventDefault();
    if (!forgotUser.trim()) { toast.error('Please enter your username'); return; }
    setLoading(true);
    try {
      const res = await api.post('/admin/forgot-password', { username: forgotUser.trim() });
      toast.success(res.data.message);
      setMode('login');
      setForgotUser('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send request');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden opacity-5 pointer-events-none">
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-orange-500 rounded-full" />
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-orange-400 rounded-full" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          {/* <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-orange-500/50">
            <UtensilsCrossed className="w-9 h-9 text-white" />
          </div> */}
          <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-orange-500/50">
            <img src={logo} className="w-15 h-15 text-white" />
          </div>
          <h1 className="font-display text-3xl font-bold text-white mb-1">Admin Panel</h1>
          <p className="text-gray-400">Booking & Delivery <span className="text-orange-500">@CUTM, PKD</span></p>
        </div>

        <div className="bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 overflow-hidden">

          {/* ── LOGIN FORM ───────────────────────────────────────────────── */}
          {mode === 'login' && (
            <div className="p-8">
              <h2 className="font-semibold text-white text-lg mb-6">Sign In to Continue</h2>
              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="text" value={form.username}
                      onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
                      placeholder="admin"
                      className="w-full bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type={showPass ? 'text' : 'password'} value={form.password}
                      onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                      placeholder="••••••••"
                      className="w-full bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded-xl pl-10 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all" />
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors">
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Forgot Password link */}
                <div className="flex justify-end">
                  <button type="button" onClick={() => setMode('forgot')}
                    className="text-xs text-orange-400 hover:text-orange-300 transition-colors flex items-center gap-1">
                    <KeyRound className="w-3 h-3" /> Forgot password?
                  </button>
                </div>

                <button type="submit" disabled={loading}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
                  {loading
                    ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : <><LogIn className="w-5 h-5" />Sign In</>}
                </button>
              </form>

              {/* <div className="mt-5 p-3 bg-gray-700/50 rounded-xl border border-gray-600">
                <p className="text-gray-400 text-xs text-center">
                  Default: <span className="text-orange-400 font-mono">admin</span> / <span className="text-orange-400 font-mono">admin123</span>
                </p>
              </div> */}
            </div>
          )}

          {/* ── FORGOT PASSWORD FORM ─────────────────────────────────────── */}
          {mode === 'forgot' && (
            <div className="p-8">
              {/* Back button */}
              <button onClick={() => setMode('login')}
                className="flex items-center gap-1.5 text-gray-400 hover:text-white text-sm mb-6 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to Sign In
              </button>

              <div className="w-12 h-12 bg-orange-500/20 rounded-2xl flex items-center justify-center mb-4">
                <KeyRound className="w-6 h-6 text-orange-400" />
              </div>
              <h2 className="font-semibold text-white text-lg mb-1">Forgot Password?</h2>
              <p className="text-gray-400 text-sm mb-6">
                Enter your username and we'll send a reset request to the <span className="text-orange-400 font-medium">Super Admin</span>. They'll reset your password and let you know.
              </p>

              <form onSubmit={handleForgot} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Your Username</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="text" value={forgotUser}
                      onChange={e => setForgotUser(e.target.value)}
                      placeholder="Enter your username"
                      autoFocus
                      className="w-full bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all" />
                  </div>
                </div>

                <button type="submit" disabled={loading}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
                  {loading
                    ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : <><Send className="w-4 h-4" />Send Reset Request</>}
                </button>
              </form>

              <div className="mt-5 p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                <p className="text-blue-300 text-xs text-center">
                  ℹ️ Super Admin will see your request in the Admin Management panel and reset your password.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
