import React, { useState, useEffect } from 'react';
import { Search, ChevronRight, Flame } from 'lucide-react';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';

const CATEGORIES = ['All', 'Starters', 'Main Course', 'Pizza', 'Burgers', 'Snacks', 'Soups', 'Salads', 'Desserts', 'Beverages', 'Specials'];

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const { totalItems, totalPrice } = useCart();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, debouncedSearch]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedCategory !== 'All') params.category = selectedCategory;
      if (debouncedSearch) params.search = debouncedSearch;
      const res = await api.get('/products', { params });
      setProducts(res.data.data);
    } catch (err) {
      toast.error('Failed to load menu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-orange-50">
      <Navbar />

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-orange-500 via-orange-400 to-amber-400 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 left-10 text-8xl">🍕</div>
          <div className="absolute top-2 right-20 text-7xl">🍔</div>
          <div className="absolute bottom-2 left-1/3 text-6xl">🍜</div>
        </div>
        <div className="max-w-7xl mx-auto px-4 py-12 relative z-10">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-2">
              <Flame className="w-5 h-5 text-yellow-200" />
              <span className="text-orange-100 font-medium text-sm uppercase tracking-wide">Hot & Fresh</span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-3 leading-tight">
              Delicious Food,<br />Delivered Fast 🚀
            </h1>
            <p className="text-orange-100 text-lg mb-6">Order from our curated menu and get hot food at your doorstep.</p>

            {/* Search */}
            <div className="relative max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search food items..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl text-gray-800 shadow-lg focus:outline-none focus:ring-2 focus:ring-white/50 text-base"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-none">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 ${
                selectedCategory === cat
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-orange-50 hover:text-orange-600 border border-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl font-bold text-gray-800">
            {selectedCategory === 'All' ? 'Our Menu' : selectedCategory}
            {debouncedSearch && <span className="text-orange-500 ml-2">"{debouncedSearch}"</span>}
          </h2>
          {!loading && <span className="text-gray-500 text-sm">{products.length} items</span>}
        </div>

        {/* Products grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array(8).fill(0).map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-44 bg-orange-100 rounded-t-2xl"></div>
                <div className="p-4 space-y-3">
                  <div className="h-3 bg-orange-100 rounded w-1/3"></div>
                  <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-100 rounded w-full"></div>
                  <div className="flex justify-between items-center">
                    <div className="h-6 bg-orange-200 rounded w-16"></div>
                    <div className="h-9 bg-orange-100 rounded-xl w-20"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="font-display text-xl font-bold text-gray-700 mb-2">No items found</h3>
            <p className="text-gray-500">Try a different category or search term</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {products.map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>

      {/* Floating cart button */}
      {totalItems > 0 && (
        <div className="fixed bottom-6 left-0 right-0 flex justify-center z-50 px-4">
          <Link
            to="/cart"
            className="flex items-center gap-4 bg-orange-500 text-white px-6 py-4 rounded-2xl shadow-2xl hover:bg-orange-600 transition-all duration-200 animate-slide-up max-w-sm w-full"
          >
            <div className="flex items-center gap-2">
              <span className="bg-orange-400 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                {totalItems}
              </span>
              <span className="font-semibold">View Cart</span>
            </div>
            <div className="flex items-center gap-1 ml-auto">
              <span className="font-bold text-lg">₹{totalPrice.toFixed(0)}</span>
              <ChevronRight className="w-5 h-5" />
            </div>
          </Link>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-400 text-center py-6 mt-16">
        <p className="font-body text-sm">© 2024 FoodieExpress. Made with ❤️ for food lovers.</p>
      </footer>
    </div>
  );
};

export default HomePage;
