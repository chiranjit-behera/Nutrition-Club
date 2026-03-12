import React, { useState, useEffect } from 'react';
import { ShoppingBag, CheckCircle, XCircle, IndianRupee, TrendingUp, Clock, RefreshCw } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const StatCard = ({ icon: Icon, label, value, color, bg, sub }) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between mb-4">
      <div className={`${bg} p-3 rounded-xl`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
    </div>
    <p className="text-3xl font-bold text-gray-800 mb-1">{value}</p>
    <p className="text-gray-500 text-sm">{label}</p>
    {sub && <p className="text-xs text-green-600 font-medium mt-1">{sub}</p>}
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, ordersRes] = await Promise.all([
        api.get('/orders/stats/overview'),
        api.get('/orders?limit=5')
      ]);
      // console.log("Orders: ", recentOrders.data.data);
      setStats(statsRes.data.data);
      setRecentOrders(ordersRes.data.data);
    } catch {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const statusColors = {
    Pending: 'bg-yellow-100 text-yellow-700',
    Confirmed: 'bg-blue-100 text-blue-700',
    Preparing: 'bg-purple-100 text-purple-700',
    'Out for Delivery': 'bg-indigo-100 text-indigo-700',
    Delivered: 'bg-green-100 text-green-700',
    Cancelled: 'bg-red-100 text-red-700',
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-gray-800">Dashboard Overview</h2>
          <p className="text-gray-500 text-sm mt-1">Welcome back! Here's what's happening today.</p>
        </div>
        <button onClick={fetchData} className="flex items-center gap-2 text-sm text-gray-500 hover:text-orange-500 transition-colors">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard icon={ShoppingBag} label="Total Orders" value={stats?.totalOrders || 0} color="text-orange-600" bg="bg-orange-100" />
        <StatCard icon={Clock} label="Today's Orders" value={stats?.todayOrders || 0} color="text-blue-600" bg="bg-blue-100" sub="New today" />
        <StatCard icon={TrendingUp} label="Pending" value={stats?.pendingOrders || 0} color="text-yellow-600" bg="bg-yellow-100" />
        <StatCard icon={CheckCircle} label="Delivered" value={stats?.deliveredOrders || 0} color="text-green-600" bg="bg-green-100" />
        <StatCard icon={XCircle} label="Cancelled" value={stats?.cancelledOrders || 0} color="text-red-600" bg="bg-red-100" />
        <StatCard icon={IndianRupee} label="Revenue" value={`₹${(stats?.totalRevenue || 0).toLocaleString()}`} color="text-purple-600" bg="bg-purple-100" sub="All time" />
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-display font-bold text-gray-800">Recent Orders</h3>
          <a href="/admin/orders" className="text-orange-500 text-sm font-medium hover:text-orange-600">View All →</a>
        </div>

        {recentOrders.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No orders yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {['Order #', 'Customer', 'Items', 'Amount', 'Status', 'Time'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentOrders.map(order => (
                  <tr key={order._id} className="hover:bg-orange-50/30 transition-colors">
                    <td className="px-5 py-4">
                      <span className="font-mono text-xs text-orange-600 font-bold">{order.orderNumber}</span>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-medium text-gray-800 text-sm">{order.customer.name}</p>
                      <p className="text-gray-400 text-xs">{order.customer.phone}</p>
                    </td>
                    <td className="px-5 py-4 text-gray-600 text-sm">{order.items.length} item(s)</td>
                    <td className="px-5 py-4 font-bold text-gray-800">₹{order.totalAmount}</td>
                    <td className="px-5 py-4">
                      <span className={`badge text-xs px-2.5 py-1 ${statusColors[order.status] || 'bg-gray-100 text-gray-600'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-400 text-xs">
                      {new Date(order.createdAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
