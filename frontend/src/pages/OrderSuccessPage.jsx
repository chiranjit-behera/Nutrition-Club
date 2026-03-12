import React from 'react';
import { Link, useLocation, Navigate } from 'react-router-dom';
import { CheckCircle, Package, MapPin, Phone, Mail, UtensilsCrossed, Clock } from 'lucide-react';
import Navbar from '../components/Navbar';

const OrderSuccessPage = () => {
  const location = useLocation();
  const order = location.state?.order;

  if (!order) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen bg-orange-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Success Animation */}
        <div className="text-center mb-8 animate-bounce-in">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <CheckCircle className="w-14 h-14 text-green-500" />
          </div>
          <h1 className="font-display text-3xl font-bold text-gray-800 mb-2">Order Placed! 🎉</h1>
          <p className="text-gray-500 text-lg">Your delicious food is on its way!</p>
        </div>

        {/* Order Card */}
        <div className="card p-6 mb-5 animate-slide-up">
          <div className="flex items-center justify-between mb-5 pb-4 border-b border-orange-100">
            <div>
              <p className="text-sm text-gray-500 mb-1">Order Number</p>
              <p className="font-bold text-orange-600 text-xl">{order.orderNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500 mb-1">Status</p>
              <span className="badge bg-yellow-100 text-yellow-700 text-sm px-3 py-1">
                {order.status}
              </span>
            </div>
          </div>

          {/* Customer Details */}
          <div className="mb-5">
            <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Package className="w-4 h-4 text-orange-500" />
              Delivery Details
            </h3>
            <div className="bg-orange-50 rounded-xl p-4 space-y-2">
              <p className="flex items-center gap-2 text-gray-700 text-sm">
                <span className="font-medium w-24 text-gray-500">Name:</span>
                {order.customer.name}
              </p>
              <p className="flex items-center gap-2 text-gray-700 text-sm">
                <Phone className="w-4 h-4 text-orange-400" />
                {order.customer.phone}
              </p>
              {order.customer.email && (
                <p className="flex items-center gap-2 text-gray-700 text-sm">
                  <Mail className="w-4 h-4 text-orange-400" />
                  {order.customer.email}
                </p>
              )}
              <p className="flex items-start gap-2 text-gray-700 text-sm">
                <MapPin className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
                {order.customer.address}
              </p>
            </div>
          </div>

          {/* Order Items */}
          <div className="mb-5">
            <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <UtensilsCrossed className="w-4 h-4 text-orange-500" />
              Ordered Items
            </h3>
            <div className="space-y-2">
              {order.items.map((item, i) => (
                <div key={i} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="font-medium text-gray-800">{item.name}</p>
                    <p className="text-gray-400 text-xs">₹{item.price} × {item.quantity}</p>
                  </div>
                  <span className="font-semibold text-gray-700">₹{item.subtotal}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="bg-orange-500 text-white rounded-xl p-4 flex justify-between items-center">
            <span className="font-semibold">Total Amount</span>
            <span className="font-bold text-xl">₹{order.totalAmount}</span>
          </div>
        </div>

        {/* ETA */}
        <div className="card p-4 mb-6 flex items-center gap-3 border-l-4 border-orange-400 animate-slide-up">
          <Clock className="w-8 h-8 text-orange-500 flex-shrink-0" />
          <div>
            <p className="font-semibold text-gray-800">Estimated Delivery Time</p>
            <p className="text-gray-500 text-sm">30 - 45 minutes • Pay on delivery</p>
          </div>
        </div>

        <div className="text-center">
          <Link to="/" className="btn-primary inline-flex items-center gap-2 text-lg px-8">
            <UtensilsCrossed className="w-5 h-5" />
            Order More Food
          </Link>
          <p className="text-gray-400 text-sm mt-4">
            Have questions? Call us at <span className="text-orange-500 font-medium">+91 98765 43210</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
