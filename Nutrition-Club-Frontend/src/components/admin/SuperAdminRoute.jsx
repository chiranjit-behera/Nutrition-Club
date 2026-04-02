import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldOff } from 'lucide-react';

const SuperAdminRoute = ({ children }) => {
  const { admin } = useAuth();

  if (admin?.role !== 'superadmin') {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShieldOff className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="font-display text-xl font-bold text-gray-800 mb-2">Access Denied</h2>
        <p className="text-gray-500 text-sm">This page is only accessible to Super Admins.</p>
      </div>
    );
  }

  return children;
};

export default SuperAdminRoute;
