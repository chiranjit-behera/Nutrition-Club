import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, UtensilsCrossed, Menu, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import logo from '../assets/cutmlogo.png'; 

const Navbar = () => {
  const { totalItems } = useCart();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm border-b border-orange-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            {/* <div className="w-9 h-9 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
              <UtensilsCrossed className="w-5 h-5 text-white" />
            </div> */}
            <div className="w-9 h-9 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
              <img src={logo} className="w-15 h-10 text-white" />
            </div>
            <span className="font-display text-xl font-bold text-gray-800">
              Booking & Delivery <span className="text-orange-500">@CUTM, PKD</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {/* <Link
              to="/"
              className={`font-medium transition-colors ${location.pathname === '/' ? 'text-orange-500' : 'text-gray-600 hover:text-orange-500'}`}
            >
              Menu
            </Link> */}
            <Link
              to="/cart"
              className="relative flex items-center gap-2 btn-primary py-2 px-4 text-sm"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Cart</span>
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold animate-bounce-in">
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-orange-50"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-orange-100 px-4 py-4 space-y-3">
          <Link to="/" onClick={() => setMobileOpen(false)} className="block font-medium text-gray-700 hover:text-orange-500 py-2">
            Menu
          </Link>
          <Link to="/cart" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 btn-primary text-sm w-full justify-center">
            <ShoppingCart className="w-4 h-4" />
            Cart {totalItems > 0 && `(${totalItems})`}
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
