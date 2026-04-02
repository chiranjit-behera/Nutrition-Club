import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Search, ArrowLeft, ChevronRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import { useCart } from '../context/CartContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

const FOOD_CATEGORIES = ['All','Starters','Main Course','Pizza','Burgers','Snacks','Soups','Salads','Desserts','Beverages','Specials'];
const GIFT_CATEGORIES = ['All','Photo Frames','Show Pieces','Decorative Lights','Wall Art','Soft Toys','Hampers','Combos','Seasonal'];

const DeliveryPage = () => {
  const { type } = useParams();
  const isFood = type === 'food';
  const catalogType = isFood ? 'Food' : 'Gift';
  const categories = isFood ? FOOD_CATEGORIES : GIFT_CATEGORIES;

  const [products, setProducts]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [selectedCat, setSelectedCat] = useState('All');
  const [search, setSearch]         = useState('');
  const [debSearch, setDebSearch]   = useState('');
  const { totalItems, totalPrice, syncCartStock } = useCart();

  useEffect(() => { setSelectedCat('All'); setSearch(''); }, [type]);
  useEffect(() => { const t = setTimeout(() => setDebSearch(search), 400); return () => clearTimeout(t); }, [search]);
  useEffect(() => { fetchProducts(); }, [selectedCat, debSearch, type]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = { catalogType };
      if (selectedCat !== 'All') params.category = selectedCat;
      if (debSearch) params.search = debSearch;
      const res = await api.get('/products', { params });
      setProducts(res.data.data);
      // Sync cart with fresh stock values — clamps qty if stock reduced since last visit
      syncCartStock(res.data.data);
    } catch { toast.error('Failed to load items'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-orange-50">
      <Navbar />

      {/* Banner */}
      <div className={`relative overflow-hidden ${isFood ? 'bg-gradient-to-r from-orange-500 to-red-500' : 'bg-gradient-to-r from-emerald-500 to-teal-500'}`}>
        <div className="absolute inset-0 opacity-10 select-none pointer-events-none">
          <div className="absolute top-4 left-8 text-8xl">{isFood ? '🍽️' : '🎁'}</div>
          <div className="absolute bottom-2 right-12 text-7xl">{isFood ? '🍕' : '🎂'}</div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 py-10">
          <Link to="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white text-sm mb-4">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-5xl">{isFood ? '🍽️' : '🎁'}</span>
            <div>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-white">{isFood ? 'Food Items' : 'Gift Items'}</h1>
              <p className="text-white/80 mt-1">{isFood ? 'Fresh meals, cakes & beverages — pay on delivery' : 'Thoughtful gifts for every occasion — pay on delivery'}</p>
            </div>
          </div>
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="text" placeholder={`Search ${isFood ? 'food' : 'gifts'}...`} value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-2xl text-gray-800 shadow-lg focus:outline-none focus:ring-2 focus:ring-white/50" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Category tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-8">
          {categories.map(cat => (
            <button key={cat} onClick={() => setSelectedCat(cat)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl font-medium text-sm transition-all ${
                selectedCat === cat
                  ? isFood ? 'bg-orange-500 text-white shadow-md' : 'bg-emerald-500 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-orange-50 border border-gray-200'
              }`}>{cat}</button>
          ))}
        </div>

        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl font-bold text-gray-800">
            {selectedCat === 'All' ? (isFood ? 'All Food Items' : 'All Gift Items') : selectedCat}
          </h2>
          {!loading && <span className="text-gray-400 text-sm">{products.length} item{products.length !== 1 ? 's' : ''}</span>}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array(8).fill(0).map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-44 bg-orange-100 rounded-t-2xl" />
                <div className="p-4 space-y-3">
                  <div className="h-3 bg-orange-100 rounded w-1/3" />
                  <div className="h-5 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded" />
                  <div className="flex justify-between"><div className="h-6 bg-orange-200 rounded w-16" /><div className="h-9 bg-orange-100 rounded-xl w-20" /></div>
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">{isFood ? '🔍' : '🎁'}</div>
            <h3 className="font-display text-xl font-bold text-gray-700 mb-2">No items found</h3>
            <p className="text-gray-500">Try a different category or search term</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {products.map(product => <ProductCard key={product._id} product={product} />)}
          </div>
        )}
      </div>

      {/* Floating cart */}
      {totalItems > 0 && (
        <div className="fixed bottom-6 left-0 right-0 flex justify-center z-50 px-4">
          <Link to="/cart" className="flex items-center gap-4 bg-orange-500 text-white px-6 py-4 rounded-2xl shadow-2xl hover:bg-orange-600 transition-all max-w-sm w-full animate-slide-up">
            <div className="flex items-center gap-2">
              <span className="bg-orange-400 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">{totalItems}</span>
              <span className="font-semibold">View Cart</span>
            </div>
            <div className="flex items-center gap-1 ml-auto">
              <span className="font-bold text-lg">₹{totalPrice.toFixed(0)}</span>
              <ChevronRight className="w-5 h-5" />
            </div>
          </Link>
        </div>
      )}

      <footer className="bg-gray-800 text-gray-400 text-center py-6 mt-16">
        <p className="text-sm">© 2024 FoodieExpress. Made with ❤️</p>
      </footer>
    </div>
  );
};

export default DeliveryPage;
