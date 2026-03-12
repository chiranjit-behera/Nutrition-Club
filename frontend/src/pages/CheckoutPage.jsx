import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
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
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`input ${Icon ? 'pl-10' : ''} ${error ? 'border-red-400 ring-2 ring-red-100' : ''}`}
      />
    </div>
    {error && (
      <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
        <AlertCircle className="w-3 h-3" />{error}
      </p>
    )}
  </div>
);

const CheckoutPage = () => {
  const { items, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    notes: ''
  });

  const deliveryFee = totalPrice > 500 ? 0 : 40;
  const taxes = Math.round(totalPrice * 0.05);
  const grandTotal = totalPrice + deliveryFee + taxes;

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Name is required';
    else if (form.name.trim().length < 2) newErrors.name = 'Name must be at least 2 characters';

    if (!form.phone.trim()) newErrors.phone = 'Phone number is required';
    else if (!/^[0-9]{10,15}$/.test(form.phone.replace(/\s/g, ''))) newErrors.phone = 'Enter a valid phone number (10-15 digits)';

    if (form.email && !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(form.email)) {
      newErrors.email = 'Enter a valid email address';
    }

    if (!form.address.trim()) newErrors.address = 'Delivery address is required';
    else if (form.address.trim().length < 10) newErrors.address = 'Please provide a complete address';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async () => {
    if (items.length === 0) {
      toast.error('Your cart is empty!');
      return navigate('/');
    }

    if (!validate()) {
      toast.error('Please fix the errors before continuing');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        customer: {
          name: form.name.trim(),
          phone: form.phone.trim(),
          email: form.email.trim() || undefined,
          address: form.address.trim()
        },
        items: items.map(i => ({ productId: i.productId, quantity: i.quantity })),
        notes: form.notes.trim() || undefined
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

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-orange-50">
        <Navbar />
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="font-display text-2xl font-bold mb-4">Cart is empty</h2>
          <Link to="/" className="btn-primary">Browse Menu</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-orange-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Link to="/cart" className="p-2 hover:bg-white rounded-xl transition-colors text-gray-500">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-display text-3xl font-bold text-gray-800">Checkout</h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            <div className="card p-6">
              <h2 className="font-display text-xl font-bold text-gray-800 mb-5 flex items-center gap-2">
                <User className="w-5 h-5 text-orange-500" />
                Delivery Details
              </h2>
              <div className="space-y-4">
                <InputField
                  label="Full Name" name="name" placeholder="John Doe"
                  required icon={User}
                  value={form.name} onChange={handleChange} error={errors.name}
                />
                <InputField
                  label="Phone Number" name="phone" type="tel" placeholder="9876543210"
                  required icon={Phone}
                  value={form.phone} onChange={handleChange} error={errors.phone}
                />
                <InputField
                  label="Email Address" name="email" type="email" placeholder="john@example.com (optional)"
                  icon={Mail}
                  value={form.email} onChange={handleChange} error={errors.email}
                />
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Delivery Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                    <textarea
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      rows={3}
                      placeholder="House No., Street, Area, City, Pincode..."
                      className={`input pl-10 resize-none ${errors.address ? 'border-red-400 ring-2 ring-red-100' : ''}`}
                    />
                  </div>
                  {errors.address && (
                    <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />{errors.address}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Special Instructions (optional)
                  </label>
                  <textarea
                    name="notes"
                    value={form.notes}
                    onChange={handleChange}
                    rows={2}
                    placeholder="Any special instructions for your order..."
                    className="input resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="lg:hidden card p-5">
              <h3 className="font-bold text-gray-800 mb-3">Order Items ({items.length})</h3>
              <div className="space-y-2">
                {items.map(item => (
                  <div key={item.productId} className="flex justify-between text-sm">
                    <span className="text-gray-600">{item.name} × {item.quantity}</span>
                    <span className="font-medium">₹{(item.price * item.quantity).toFixed(0)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <div className="card p-6 sticky top-24">
              <h2 className="font-display text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-orange-500" />
                Order Summary
              </h2>

              <div className="hidden lg:block mb-4 max-h-48 overflow-y-auto">
                {items.map(item => (
                  <div key={item.productId} className="flex justify-between text-sm py-1.5 border-b border-gray-50 last:border-0">
                    <span className="text-gray-600 truncate mr-2">{item.name} × {item.quantity}</span>
                    <span className="font-medium flex-shrink-0">₹{(item.price * item.quantity).toFixed(0)}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-2 mb-4 pt-2">
                <div className="flex justify-between text-gray-600 text-sm">
                  <span>Subtotal</span>
                  <span>₹{totalPrice.toFixed(0)}</span>
                </div>
                <div className="flex justify-between text-gray-600 text-sm">
                  <span>Delivery</span>
                  {deliveryFee === 0 ? <span className="text-green-600 font-medium">FREE</span> : <span>₹{deliveryFee}</span>}
                </div>
                <div className="flex justify-between text-gray-600 text-sm">
                  <span>Taxes (5%)</span>
                  <span>₹{taxes}</span>
                </div>
                <div className="h-px bg-gray-100 my-2"></div>
                <div className="flex justify-between font-bold text-lg text-gray-800">
                  <span>Total</span>
                  <span className="text-orange-600">₹{grandTotal.toFixed(0)}</span>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4">
                <p className="text-green-700 text-xs font-medium flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  No payment required! Pay on delivery.
                </p>
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full btn-primary flex items-center justify-center gap-2 py-3.5 text-base disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Placing Order...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Place Order · ₹{grandTotal.toFixed(0)}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
