import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';

import LandingPage from './pages/LandingPage';
import BookingPage from './pages/BookingPage';
import BookingSuccessPage from './pages/BookingSuccessPage';
import DeliveryPage from './pages/DeliveryPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderSuccessPage from './pages/OrderSuccessPage';

import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminOrders from './pages/admin/AdminOrders';
import AdminProducts from './pages/admin/AdminProducts';
import AdminBookings from './pages/admin/AdminBookings';
import AdminEventPlans from './pages/admin/AdminEventPlans';
import AdminSettings from './pages/admin/AdminSettings';
import AdminManagement from './pages/admin/AdminManagement';
import AdminLayout from './components/admin/AdminLayout';
import ProtectedRoute from './components/admin/ProtectedRoute';
import SuperAdminRoute from './components/admin/SuperAdminRoute';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Toaster position="top-right" toastOptions={{
            duration: 3000,
            style: { borderRadius: '12px', fontFamily: 'DM Sans, sans-serif' },
            success: { iconTheme: { primary: '#f97316', secondary: '#fff' } },
          }} />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/booking/:eventType" element={<BookingPage />} />
            <Route path="/booking-success" element={<BookingSuccessPage />} />
            <Route path="/delivery/:type" element={<DeliveryPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/order-success" element={<OrderSuccessPage />} />

            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="bookings" element={<AdminBookings />} />
              <Route path="event-plans" element={<AdminEventPlans />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="admins" element={<SuperAdminRoute><AdminManagement /></SuperAdminRoute>} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
