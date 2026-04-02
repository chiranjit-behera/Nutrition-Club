import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  ShoppingBag, CheckCircle, XCircle, IndianRupee,
  TrendingUp, Clock, RefreshCw, Calendar, Users
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { fetchOrders, fetchOrderStats } from '../../store/slices/ordersSlice';
import { fetchBookings } from '../../store/slices/bookingsSlice';



const EVENT_EMOJIS = {
  'Birthday Event':'🎂','Inauguration Event':'⭐',
  'Departmental Event':'🏢','Corporate Event':'💼','Others':'📋',
};

const ORDER_STATUS_COLORS = {
  Pending:'bg-yellow-100 text-yellow-700', Confirmed:'bg-blue-100 text-blue-700',
  Preparing:'bg-purple-100 text-purple-700','Out for Delivery':'bg-indigo-100 text-indigo-700',
  Delivered:'bg-green-100 text-green-700', Cancelled:'bg-red-100 text-red-700',
};
const BOOKING_STATUS_COLORS = {
  New:'bg-blue-100 text-blue-700', Contacted:'bg-yellow-100 text-yellow-700',
  Confirmed:'bg-green-100 text-green-700', Completed:'bg-purple-100 text-purple-700',
  Cancelled:'bg-red-100 text-red-700',
};

const StatCard = ({ icon:Icon, label, value, color, bg, sub }) => (
  <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <div className={`${bg} w-10 h-10 rounded-xl flex items-center justify-center mb-3`}>
      <Icon className={`w-5 h-5 ${color}`} />
    </div>
    <p className="text-2xl font-bold text-gray-800 mb-0.5">{value}</p>
    <p className="text-gray-500 text-xs">{label}</p>
    {sub && <p className="text-xs text-green-600 font-medium mt-1">{sub}</p>}
  </div>
);

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { admin } = useAuth();
  const isSuperAdmin = admin?.role === 'superadmin';
  const { items: orders,   stats: orderStats,   loading: ordersLoading   } = useSelector(s => s.orders);
  const { items: bookings, stats: bookingStats, loading: bookingsLoading } = useSelector(s => s.bookings);

  const fetchAll = () => {
    dispatch(fetchOrders({ page:1, status:'All' }));
    dispatch(fetchOrderStats());
    dispatch(fetchBookings());
  };

  useEffect(() => { fetchAll(); }, []);

  const recentOrders   = orders.slice(0, 5);
  const recentBookings = bookings.slice(0, 5);

  if (ordersLoading && bookingsLoading && !orderStats) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-gray-800">Dashboard Overview</h2>
          <p className="text-gray-500 text-sm mt-1">Welcome back! Here's what's happening today.</p>
        </div>
        <button onClick={fetchAll} className="flex items-center gap-2 text-sm text-gray-500 hover:text-orange-500 transition-colors">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Order Stats */}
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
          <ShoppingBag className="w-3.5 h-3.5" /> Orders
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <StatCard icon={ShoppingBag} label="Total Orders"   value={orderStats?.totalOrders    || 0} color="text-orange-600" bg="bg-orange-100" />
          <StatCard icon={Clock}       label="Today's Orders" value={orderStats?.todayOrders     || 0} color="text-blue-600"   bg="bg-blue-100"   sub="New today" />
          <StatCard icon={TrendingUp}  label="Pending"        value={orderStats?.pendingOrders   || 0} color="text-yellow-600" bg="bg-yellow-100" />
          <StatCard icon={CheckCircle} label="Delivered"      value={orderStats?.deliveredOrders || 0} color="text-green-600"  bg="bg-green-100" />
          <StatCard icon={XCircle}     label="Cancelled"      value={orderStats?.cancelledOrders || 0} color="text-red-600"    bg="bg-red-100" />
        </div>
      </div>

      {/* Booking Stats */}
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5" /> Event Bookings
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard icon={Calendar}    label="Total Enquiries" value={bookingStats?.total       || 0} color="text-blue-600"   bg="bg-blue-100" />
          <StatCard icon={TrendingUp}  label="New"             value={bookingStats?.newBookings  || 0} color="text-orange-600" bg="bg-orange-100" sub="Needs attention" />
          <StatCard icon={CheckCircle} label="Confirmed"       value={bookingStats?.confirmed    || 0} color="text-green-600"  bg="bg-green-100" />
          <StatCard icon={Users}       label="Completed"       value={bookingStats?.completed    || 0} color="text-purple-600" bg="bg-purple-100" />
        </div>
      </div>

      {/* Revenue Summary — superadmin only */}
      {isSuperAdmin && (
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
          <IndianRupee className="w-3.5 h-3.5" /> Revenue
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <StatCard icon={IndianRupee} label="Order Revenue"   value={`₹${(orderStats?.totalRevenue   || 0).toLocaleString('en-IN')}`} color="text-orange-600" bg="bg-orange-100" sub="Delivered orders" />
          <StatCard icon={IndianRupee} label="Booking Revenue" value={`₹${(bookingStats?.bookingRevenue || 0).toLocaleString('en-IN')}`} color="text-green-600"  bg="bg-green-100"  sub="Confirmed & completed" />
          <StatCard icon={IndianRupee} label="Total Revenue"   value={`₹${((orderStats?.totalRevenue || 0) + (bookingStats?.bookingRevenue || 0)).toLocaleString('en-IN')}`} color="text-purple-600" bg="bg-purple-100" sub="All time combined" />
        </div>
      </div>
      )}

      {/* Recent tables side by side */}
      <div className="grid lg:grid-cols-2 gap-5">

        {/* Recent Orders */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-display font-bold text-gray-800">Recent Orders</h3>
            <Link to="/admin/orders" className="text-orange-500 text-sm font-medium hover:text-orange-600">View All →</Link>
          </div>
          {recentOrders.length === 0 ? (
            <div className="p-10 text-center text-gray-400">
              <ShoppingBag className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No orders yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {recentOrders.map(order => (
                <div key={order._id} className="px-5 py-3 flex items-center justify-between hover:bg-orange-50/30 transition-colors">
                  <div className="min-w-0">
                    <p className="font-mono text-xs text-orange-600 font-bold">{order.orderNumber}</p>
                    <p className="font-medium text-gray-800 text-sm truncate">{order.customer.name}</p>
                    <p className="text-gray-400 text-xs">{order.items.length} item(s) · ₹{order.totalAmount}</p>
                  </div>
                  <div className="text-right flex-shrink-0 ml-3">
                    <span className={`badge text-xs px-2 py-0.5 ${ORDER_STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}>{order.status}</span>
                    <p className="text-gray-400 text-xs mt-1">{new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Bookings */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-display font-bold text-gray-800">Recent Bookings</h3>
            <Link to="/admin/bookings" className="text-orange-500 text-sm font-medium hover:text-orange-600">View All →</Link>
          </div>
          {recentBookings.length === 0 ? (
            <div className="p-10 text-center text-gray-400">
              <Calendar className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No bookings yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {recentBookings.map(booking => (
                <div key={booking._id} className="px-5 py-3 flex items-center justify-between hover:bg-orange-50/30 transition-colors">
                  <div className="min-w-0">
                    <p className="font-mono text-xs text-orange-600 font-bold">{booking.bookingNumber}</p>
                    <p className="font-medium text-gray-800 text-sm truncate">
                      {EVENT_EMOJIS[booking.eventType]} {booking.customer.name}
                    </p>
                    <p className="text-gray-400 text-xs">{booking.eventType} · {new Date(booking.eventDate).toLocaleDateString('en-IN')}</p>
                  </div>
                  <div className="text-right flex-shrink-0 ml-3">
                    <span className={`badge text-xs px-2 py-0.5 ${BOOKING_STATUS_COLORS[booking.status] || 'bg-gray-100 text-gray-600'}`}>{booking.status}</span>
                    <p className="text-gray-400 text-xs mt-1">{booking.numberOfGuests} guests</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
