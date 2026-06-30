import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, Mail, User, ShoppingBag, CheckCircle, AlertCircle, CreditCard } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useCart } from '../context/CartContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

const STORE_COORDS = { lat: 18.8078, lng: 84.3481 }; // Centurion University PKD coordinates

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

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
  const [paymentMethod, setPaymentMethod] = useState('COD');

  const [mapLoading, setMapLoading] = useState(true);
  const [distance, setDistance] = useState(null);
  const [coordinates, setCoordinates] = useState(STORE_COORDS);
  const mapContainerRef = useRef(null);   // ref so Google Maps owns the DOM node
  const mapInitialized = useRef(false);   // guard against Strict Mode double-invoke

  useEffect(() => {
    // Load Razorpay Checkout Script dynamically on mount
    const rzpScript = document.createElement('script');
    rzpScript.src = 'https://checkout.razorpay.com/v1/checkout.js';
    rzpScript.async = true;
    document.body.appendChild(rzpScript);

    return () => {
      if (document.body.contains(rzpScript)) {
        document.body.removeChild(rzpScript);
      }
    };
  }, []);

  useEffect(() => {
    if (items.length === 0) return;

    const mapKey = import.meta.env.VITE_GOOGLE_MAPS_KEY || '';
    const scriptId = 'google-maps-script';
    let mapScript = document.getElementById(scriptId);
    if (!mapScript) {
      mapScript = document.createElement('script');
      mapScript.id = scriptId;
      mapScript.src = `https://maps.googleapis.com/maps/api/js?key=${mapKey}&libraries=places`;
      mapScript.async = true;
      mapScript.defer = true;
      document.body.appendChild(mapScript);
    }

    const initMapInstance = () => {
      // Hard guard: only ever run once, even in Strict Mode double-invoke
      if (mapInitialized.current) return;
      if (!window.google) return;
      const container = mapContainerRef.current;
      if (!container) return;

      mapInitialized.current = true;
      setMapLoading(false);

      const map = new window.google.maps.Map(container, {
        center: STORE_COORDS,
        zoom: 14,
        mapTypeControl: false,
        fullscreenControl: false,
        streetViewControl: false
      });

      // Store marker (orange)
      new window.google.maps.Marker({
        position: STORE_COORDS,
        map,
        title: 'Nutrition Club Store',
        icon: { url: 'https://maps.google.com/mapfiles/ms/icons/orange-dot.png' }
      });

      // Draggable delivery marker (red)
      const deliveryMarker = new window.google.maps.Marker({
        position: STORE_COORDS,
        map,
        draggable: true,
        title: 'Your Delivery Location',
        icon: { url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png' }
      });

      const geocodePosition = (pos) => {
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: pos }, (results, status) => {
          if (status === 'OK' && results[0]) {
            setForm(prev => ({ ...prev, address: results[0].formatted_address }));
          }
        });
      };

      const updateDistance = (lat, lng) => {
        const dist = calculateDistance(STORE_COORDS.lat, STORE_COORDS.lng, lat, lng);
        setDistance(dist);
        setCoordinates({ lat, lng });
      };

      window.google.maps.event.addListener(deliveryMarker, 'dragend', () => {
        const pos = deliveryMarker.getPosition();
        geocodePosition(pos);
        updateDistance(pos.lat(), pos.lng());
      });

      window.google.maps.event.addListener(map, 'click', (event) => {
        const pos = event.latLng;
        deliveryMarker.setPosition(pos);
        geocodePosition(pos);
        updateDistance(pos.lat(), pos.lng());
      });

      updateDistance(STORE_COORDS.lat, STORE_COORDS.lng);
    };

    if (window.google) {
      initMapInstance();
    } else {
      mapScript.onload = initMapInstance;
    }
  }, [items.length]);

  const deliveryFee = distance === null ? 0 : (distance <= 5 ? 0 : Math.round((distance - 5) * 5));
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
        customer: { name: form.name.trim(), phone: form.phone.replace(/\D/g, ''), email: form.email.trim() || undefined, address: form.address.trim() },
        items: items.map(i => ({ productId: i.productId, quantity: i.quantity })),
        notes: form.notes.trim() || undefined,
        paymentMethod,
        deliveryFee,
        taxAmount: taxes,
        deliveryDistance: distance,
        deliveryCoordinates: coordinates
      };
      const res = await api.post('/orders', payload);
      
      if (res.data.razorpayOrder) {
        const orderId = res.data.data._id;
        const options = {
          key: res.data.razorpayKeyId || import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_DUMMY_KEY_FOR_LOCAL',
          amount: res.data.razorpayOrder.amount,
          currency: res.data.razorpayOrder.currency,
          name: 'Nutrition Club',
          description: 'Food Order Payment',
          order_id: res.data.razorpayOrder.id,
          handler: async function (response) {
            setLoading(true);
            try {
              const verifyPayload = {
                razorpayPaymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id,
                razorpaySignature: response.razorpay_signature
              };
              const verifyRes = await api.post('/orders/verify-payment', verifyPayload);
              clearCart();
              toast.success('Payment successful!');
              navigate('/order-success', { state: { order: verifyRes.data.data } });
            } catch (verifyErr) {
              toast.error('Payment verification failed. Please contact support.');
            } finally {
              setLoading(false);
            }
          },
          prefill: {
            name: form.name.trim(),
            contact: form.phone.trim(),
            email: form.email.trim() || undefined
          },
          theme: {
            color: '#f97316'
          },
          modal: {
            ondismiss: async function () {
              toast.error('Payment cancelled.');
              // Cancel on backend and restore stock
              await api.post(`/orders/${orderId}/cancel-payment`);
            }
          }
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        clearCart();
        navigate('/order-success', { state: { order: res.data.data } });
      }
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
                    <div className="relative mb-3">
                      <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                      <textarea name="address" value={form.address} onChange={handleChange} rows={3} placeholder="Full delivery address or select on map below..."
                        className={`input pl-10 resize-none ${errors.address ? 'border-red-400 ring-2 ring-red-100' : ''}`} />
                    </div>
                    {errors.address && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.address}</p>}

                    {/* Google Map Selector */}
                    <div className="space-y-2 mt-4">
                      <label className="block text-sm font-semibold text-gray-600">Select Delivery Location on Map</label>
                      {/* Loading spinner is OUTSIDE the map div so Google Maps solely owns its children */}
                      {mapLoading && (
                        <div className="w-full h-64 rounded-2xl border border-gray-200 bg-gray-100 flex items-center justify-center">
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
                            <span className="text-xs font-semibold text-gray-500">Loading Map...</span>
                          </div>
                        </div>
                      )}
                      {/* ref= hands this div to Google Maps; React never reconciles its children */}
                      <div
                        ref={mapContainerRef}
                        className="w-full h-64 rounded-2xl border border-gray-200 overflow-hidden shadow-inner bg-gray-100"
                        style={{ display: mapLoading ? 'none' : 'block' }}
                      />
                      {distance !== null && (
                        <div className="bg-orange-50/50 border border-orange-200 rounded-xl p-3 flex items-center justify-between text-xs text-orange-800">
                          <span className="flex items-center gap-1.5 font-medium"><MapPin className="w-4 h-4 text-orange-500" /> Delivery Distance:</span>
                          <span className="font-bold text-sm text-orange-600">{distance.toFixed(1)} km</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Order Notes (optional)</label>
                    <textarea name="notes" value={form.notes} onChange={handleChange} rows={2} placeholder="Any special instructions..."
                      className="input resize-none" />
                  </div>
                </div>
              </div>

              {/* Payment info */}
              <div className="card p-6 mb-6">
                <h2 className="font-display text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-orange-500" /> Payment Method
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {/* COD Option */}
                  <div
                    onClick={() => setPaymentMethod('COD')}
                    className={`cursor-pointer rounded-2xl border-2 p-4 flex items-start gap-3 transition-all ${
                      paymentMethod === 'COD'
                        ? 'border-orange-500 bg-orange-50/50 ring-2 ring-orange-100 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'
                    }`}
                  >
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-xl">💵</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">Cash on Delivery</p>
                      <p className="text-xs text-gray-400 mt-1 leading-normal">Pay when your order arrives at your door.</p>
                    </div>
                  </div>

                  {/* Card Option */}
                  <div
                    onClick={() => setPaymentMethod('Card')}
                    className={`cursor-pointer rounded-2xl border-2 p-4 flex items-start gap-3 transition-all ${
                      paymentMethod === 'Card'
                        ? 'border-orange-500 bg-orange-50/50 ring-2 ring-orange-100 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'
                    }`}
                  >
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-xl">💳</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">Card / Online Payment</p>
                      <p className="text-xs text-gray-400 mt-1 leading-normal">Pay securely with Credit/Debit card via Razorpay.</p>
                    </div>
                  </div>
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
                  <span>Delivery {distance !== null && `(${distance.toFixed(1)} km)`}</span>
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
              {deliveryFee > 0 ? (
                <p className="text-center text-xs text-orange-500 font-semibold mt-3">
                  ⚠️ Outside the free 5km radius (+{(distance - 5).toFixed(1)} km extra)
                </p>
              ) : distance !== null && (
                <p className="text-center text-xs text-green-600 font-semibold mt-3">
                  🎉 Free delivery within 5km! ({distance.toFixed(1)} km)
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
