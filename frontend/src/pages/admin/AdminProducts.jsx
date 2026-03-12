import React, { useState, useEffect } from 'react';
import {
  Plus, Edit, Trash2, RefreshCw, Search, Package,
  X, Save, AlertCircle, ToggleLeft, ToggleRight, Leaf, Drumstick
} from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const CATEGORIES = ['Starters', 'Main Course', 'Desserts', 'Beverages', 'Snacks', 'Pizza', 'Burgers', 'Salads', 'Soups', 'Specials'];

const defaultForm = {
  name: '', description: '', price: '', category: 'Main Course',
  image: '', stock: '', isVeg: true, isAvailable: true, rating: 4.0
};

const ProductModal = ({ product, onClose, onSave }) => {
  const [form, setForm] = useState(product ? {
    ...product,
    price: product.price.toString(),
    stock: product.stock.toString(),
    rating: product.rating.toString()
  } : { ...defaultForm });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.description.trim()) e.description = 'Description is required';
    if (!form.price || isNaN(form.price) || Number(form.price) < 0) e.price = 'Valid price required';
    if (!form.stock || isNaN(form.stock) || Number(form.stock) < 0) e.stock = 'Valid stock required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
        rating: Number(form.rating)
      };

      if (product) {
        const res = await api.put(`/products/${product._id}`, payload);
        toast.success('Product updated!');
        onSave(res.data.data, 'update');
      } else {
        const res = await api.post('/products', payload);
        toast.success('Product added!');
        onSave(res.data.data, 'create');
      }
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  const Field = ({ label, name, type = 'text', placeholder, required }) => (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        value={form[name]}
        onChange={(e) => { setForm(p => ({ ...p, [name]: e.target.value })); errors[name] && setErrors(p => ({ ...p, [name]: '' })); }}
        placeholder={placeholder}
        className={`input ${errors[name] ? 'border-red-400' : ''}`}
      />
      {errors[name] && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors[name]}</p>}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-bounce-in" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
          <h2 className="font-display font-bold text-xl text-gray-800">
            {product ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Product Name" name="name" placeholder="e.g. Butter Chicken" required />
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Category <span className="text-red-500">*</span></label>
              <select
                value={form.category}
                onChange={(e) => setForm(p => ({ ...p, category: e.target.value }))}
                className="input"
              >
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description <span className="text-red-500">*</span></label>
            <textarea
              value={form.description}
              onChange={(e) => { setForm(p => ({ ...p, description: e.target.value })); errors.description && setErrors(p => ({ ...p, description: '' })); }}
              rows={3}
              placeholder="Describe the dish..."
              className={`input resize-none ${errors.description ? 'border-red-400' : ''}`}
            />
            {errors.description && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.description}</p>}
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <Field label="Price (₹)" name="price" type="number" placeholder="e.g. 299" required />
            <Field label="Stock" name="stock" type="number" placeholder="e.g. 50" required />
            <Field label="Rating" name="rating" type="number" placeholder="4.0" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Image URL</label>
            <input
              type="url"
              value={form.image}
              onChange={(e) => setForm(p => ({ ...p, image: e.target.value }))}
              placeholder="https://..."
              className="input"
            />
            {form.image && (
              <div className="mt-2 w-20 h-20 rounded-xl overflow-hidden border border-gray-200">
                <img src={form.image} alt="preview" className="w-full h-full object-cover" onError={e => e.target.style.display = 'none'} />
              </div>
            )}
          </div>

          {/* Toggles */}
          <div className="flex gap-4 flex-wrap">
            <button
              type="button"
              onClick={() => setForm(p => ({ ...p, isVeg: !p.isVeg }))}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 font-medium text-sm transition-all ${
                form.isVeg ? 'border-green-400 bg-green-50 text-green-700' : 'border-red-300 bg-red-50 text-red-700'
              }`}
            >
              {form.isVeg ? <Leaf className="w-4 h-4" /> : <Drumstick className="w-4 h-4" />}
              {form.isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
            </button>

            <button
              type="button"
              onClick={() => setForm(p => ({ ...p, isAvailable: !p.isAvailable }))}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 font-medium text-sm transition-all ${
                form.isAvailable ? 'border-blue-400 bg-blue-50 text-blue-700' : 'border-gray-300 bg-gray-50 text-gray-600'
              }`}
            >
              {form.isAvailable ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
              {form.isAvailable ? 'Available' : 'Unavailable'}
            </button>
          </div>
        </div>

        <div className="flex gap-3 p-6 border-t sticky bottom-0 bg-white">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {product ? 'Update Product' : 'Add Product'}
          </button>
        </div>
      </div>
    </div>
  );
};

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('All');

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/products/admin/all');
      setProducts(res.data.data);
    } catch {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/products/${id}`);
      setProducts(prev => prev.filter(p => p._id !== id));
      toast.success('Product deleted!');
    } catch {
      toast.error('Failed to delete product');
    }
  };

  const handleToggleAvailability = async (product) => {
    try {
      const res = await api.put(`/products/${product._id}`, { ...product, isAvailable: !product.isAvailable });
      setProducts(prev => prev.map(p => p._id === product._id ? res.data.data : p));
      toast.success(`${product.name} ${res.data.data.isAvailable ? 'enabled' : 'disabled'}`);
    } catch {
      toast.error('Failed to update');
    }
  };

  const handleSave = (savedProduct, type) => {
    if (type === 'create') {
      setProducts(prev => [savedProduct, ...prev]);
    } else {
      setProducts(prev => prev.map(p => p._id === savedProduct._id ? savedProduct : p));
    }
  };

  const filtered = products.filter(p => {
    const matchesSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-gray-800">Product Management</h2>
          <p className="text-gray-500 text-sm mt-0.5">{products.length} total products</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchProducts} className="p-2 text-gray-500 hover:text-orange-500 hover:bg-orange-50 rounded-xl transition-colors">
            <RefreshCw className="w-5 h-5" />
          </button>
          <button
            onClick={() => { setEditProduct(null); setShowModal(true); }}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 w-52"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {['All', ...CATEGORIES].map(c => (
              <button
                key={c}
                onClick={() => setCategoryFilter(c)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
                  categoryFilter === c
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-orange-50 hover:text-orange-600'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-7 h-7 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center text-gray-400 shadow-sm border border-gray-100">
          <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No products found</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(product => (
            <div key={product._id} className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow ${!product.isAvailable ? 'opacity-60' : ''}`}>
              {/* Image */}
              <div className="relative h-40 bg-orange-50">
                {product.image ? (
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" onError={e => { e.target.style.display = 'none' }} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">🍽️</div>
                )}
                <div className="absolute top-2 left-2 flex gap-1">
                  <span className={`badge text-xs ${product.isVeg ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {product.isVeg ? '🌿 Veg' : '🍗 Non-Veg'}
                  </span>
                </div>
                <div className="absolute top-2 right-2">
                  <span className={`badge text-xs ${product.isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {product.isAvailable ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <p className="text-xs text-orange-500 font-medium uppercase tracking-wide mb-0.5">{product.category}</p>
                <h3 className="font-semibold text-gray-800 text-base mb-1 truncate">{product.name}</h3>
                <p className="text-gray-400 text-xs mb-3 line-clamp-2">{product.description}</p>

                <div className="flex items-center justify-between mb-3">
                  <span className="text-orange-600 font-bold text-lg">₹{product.price}</span>
                  <div className="text-xs text-gray-500 text-right">
                    <p>Stock: <span className={`font-semibold ${product.stock <= 5 ? 'text-red-500' : 'text-gray-700'}`}>{product.stock}</span></p>
                    <p>⭐ {product.rating}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleToggleAvailability(product)}
                    className="flex-1 py-1.5 text-xs font-medium rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-gray-600"
                  >
                    {product.isAvailable ? 'Disable' : 'Enable'}
                  </button>
                  <button
                    onClick={() => { setEditProduct(product); setShowModal(true); }}
                    className="flex items-center gap-1 py-1.5 px-3 text-xs font-medium rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors border border-blue-200"
                  >
                    <Edit className="w-3 h-3" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(product._id, product.name)}
                    className="flex items-center gap-1 py-1.5 px-3 text-xs font-medium rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors border border-red-200"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <ProductModal
          product={editProduct}
          onClose={() => { setShowModal(false); setEditProduct(null); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default AdminProducts;
