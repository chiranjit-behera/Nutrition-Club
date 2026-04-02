import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, Mail, User, ShoppingBag, CheckCircle, AlertCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useCart } from '../context/CartContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

const InputField = ({ label, name, type = 'text', placeholder, required, icon: Icon, value, onChange, error }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      {Icon && <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />}
      <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder}
        className={`input ${Icon ? 'pl-10' : ''} ${error ? 'border-red-400 ring-2 ring-red-100' : ''}`} />
    </div>
    {error && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{error}</p>}
  </div>
);

const CheckoutPage = () => {
  const { items, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '', notes: '' });

  const deliveryFee = totalPrice > 500 ? 0 : 40;
  const taxes = Math.round(totalPrice * 0.05);
  const grandTotal = totalPrice + deliveryFee + taxes;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-orange-50">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <div className="text-8xl mb-6">🛒</div>
          <h2 className="font-display text-3xl font-bold text-gray-800 mb-3">Your cart is empty</h2>
          <Link to="/" className="btn-primary inline-flex items-center gap-2 mt-4">
            <ArrowLeft className="w-4 h-4" /> Browse Menu
          </Link>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.phone.trim()) e.phone = 'Phone is required';
    else if (!/^[0-9]{10,15}$/.test(form.phone.replace(/\s/g, ''))) e.phone = 'Enter a valid phone number';
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.address.trim()) e.address = 'Delivery address is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) { toast.error('Please fix the errors below'); return; }
    setLoading(true);
    try {
      const payload = {
        customer: { name: form.name.trim(), phone: form.phone.trim(), email: form.email.trim() || undefined, address: form.address.trim() },
        items: items.map(i => ({ productId: i.productId, quantity: i.quantity })),
        notes: form.notes.trim() || undefined,
        paymentMethod: 'COD',
      };
      const res = await api.post('/orders', payload);
      clearCart();
      navigate('/order-success', { state: { order: res.data.data } });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-orange-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <Link to="/cart" className="inline-flex items-center gap-2 text-gray-500 hover:text-orange-500 mb-6 text-sm font-medium transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Cart
        </Link>
        <h1 className="font-display text-3xl font-bold text-gray-800 mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Form */}
          <div className="lg:col-span-3 space-y-6">
            <form onSubmit={handleSubmit} id="checkout-form">
              <div className="card p-6 mb-6">
                <h2 className="font-display text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-orange-500" /> Delivery Details
                </h2>
                <div className="space-y-4">
                  <InputField label="Full Name" name="name" placeholder="John Doe" required icon={User} value={form.name} onChange={handleChange} error={errors.name} />
                  <InputField label="Phone Number" name="phone" type="tel" placeholder="9876543210" required icon={Phone} value={form.phone} onChange={handleChange} error={errors.phone} />
                  <InputField label="Email Address" name="email" type="email" placeholder="john@example.com (optional)" icon={Mail} value={form.email} onChange={handleChange} error={errors.email} />
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Delivery Address <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                      <textarea name="address" value={form.address} onChange={handleChange} rows={3} placeholder="Full delivery address..."
                        className={`input pl-10 resize-none ${errors.address ? 'border-red-400 ring-2 ring-red-100' : ''}`} />
                    </div>
                    {errors.address && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.address}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Order Notes (optional)</label>
                    <textarea name="notes" value={form.notes} onChange={handleChange} rows={2} placeholder="Any special instructions..."
                      className="input resize-none" />
                  </div>
                </div>
              </div>

              {/* Payment info */}
              <div className="card p-5 flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">💵</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Cash on Delivery</p>
                  <p className="text-sm text-gray-500">Pay when your order arrives at your door.</p>
                </div>
              </div>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-2">
            <div className="card p-6 sticky top-6">
              <h2 className="font-display text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-orange-500" /> Order Summary
              </h2>
              <div className="space-y-3 mb-4 max-h-56 overflow-y-auto pr-1">
                {items.map(item => (
                  <div key={item._id} className="flex items-center gap-3">
                    <img src={item.image || 'https://via.placeholder.com/48'} alt={item.name} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 text-sm truncate">{item.name}</p>
                      <p className="text-gray-400 text-xs">×{item.quantity}</p>
                    </div>
                    <span className="font-semibold text-gray-800 text-sm">₹{(item.price * item.quantity).toFixed(0)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>₹{totalPrice.toFixed(0)}</span></div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery</span>
                  <span className={deliveryFee === 0 ? 'text-green-600 font-medium' : ''}>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</span>
                </div>
                <div className="flex justify-between text-gray-600"><span>Taxes (5%)</span><span>₹{taxes}</span></div>
                <div className="flex justify-between font-bold text-gray-800 text-base pt-2 border-t border-gray-100">
                  <span>Total</span><span className="text-orange-600">₹{grandTotal}</span>
                </div>
              </div>
              <button form="checkout-form" type="submit" disabled={loading}
                className="w-full btn-primary mt-5 flex items-center justify-center gap-2 py-3.5 text-base disabled:opacity-60 disabled:cursor-not-allowed">
                {loading
                  ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />Placing Order...</>
                  : <><CheckCircle className="w-5 h-5" />Place Order</>}
              </button>
              {deliveryFee > 0 && (
                <p className="text-center text-xs text-gray-400 mt-3">Add ₹{500 - totalPrice} more for free delivery</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
