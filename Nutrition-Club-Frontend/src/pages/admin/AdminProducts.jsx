import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Search, RefreshCw, Package, UtensilsCrossed, Gift, X, AlertCircle } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

// const FOOD_CATEGORIES = ['Starters', 'Main Course', 'Pizza', 'Burgers', 'Snacks', 'Soups', 'Salads', 'Cakes', 'Desserts', 'Beverages', 'Specials'];
// const GIFT_CATEGORIES = ['Hampers', 'Flowers', 'Personalised', 'Combos', 'Seasonal'];
const FOOD_CATEGORIES = ['Cakes'];
const GIFT_CATEGORIES = ['Show Piece', 'Photo Frame', 'Decorative lights', 'Wall paint photo', 'Soft toys']

const EMPTY_FORM = { name: '', description: '', price: '', category: '', catalogType: 'Food', stock: '100', isAvailable: true, isVeg: true, image: '' };

const InputField = ({ label, name, type = 'text', placeholder, required, value, onChange, error, children }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-1">{label}{required && <span className="text-red-500 ml-1">*</span>}</label>
    {children || (
      <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder}
        className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 ${error ? 'border-red-400 ring-2 ring-red-100' : 'border-gray-200'}`} />
    )}
    {error && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{error}</p>}
  </div>
);

const ProductModal = ({ product, onClose, onSave }) => {
  const isEdit = !!product?._id;
  const [form, setForm] = useState(product ? { ...product, price: String(product.price), stock: String(product.stock) } : EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const categories = form.catalogType === 'Food' ? FOOD_CATEGORIES : GIFT_CATEGORIES;

  useEffect(() => {
    if (!categories.includes(form.category)) setForm(p => ({ ...p, category: categories[0] }));
  }, [form.catalogType]);

  console.log(form.category)

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.description.trim()) e.description = 'Description is required';
    if (!form.price || isNaN(form.price) || Number(form.price) <= 0) e.price = 'Enter a valid price';
    if (!form.category) e.category = 'Select a category';
    if (form.stock === '' || isNaN(form.stock) || Number(form.stock) < 0) e.stock = 'Enter valid stock';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: '' }));
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = { ...form, price: Number(form.price), stock: Number(form.stock) };
      const res = isEdit
        ? await api.put(`/products/${product._id}`, payload)
        : await api.post('/products', payload);
      toast.success(isEdit ? 'Product updated!' : 'Product created!');
      onSave(res.data.data);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-white z-10">
          <h2 className="font-display font-bold text-lg text-gray-800">{isEdit ? 'Edit Product' : 'Add New Product'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl"><X className="w-5 h-5 text-gray-500" /></button>
        </div>
        <div className="p-5 space-y-4">
          {/* Catalog Type Selector */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Catalog Type <span className="text-red-500">*</span></label>
            <div className="grid grid-cols-2 gap-3">
              {['Food', 'Gift'].map(ct => (
                <button key={ct} type="button" onClick={() => setForm(p => ({ ...p, catalogType: ct }))}
                  className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all text-sm font-semibold ${form.catalogType === ct ? (ct === 'Food' ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-emerald-500 bg-emerald-50 text-emerald-700') : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}>
                  {ct === 'Food' ? <UtensilsCrossed className="w-4 h-4" /> : <Gift className="w-4 h-4" />}
                  {ct} Items
                </button>
              ))}
            </div>
          </div>

          <InputField label="Product Name" name="name" placeholder="e.g. Butter Chicken" required value={form.name} onChange={handleChange} error={errors.name} />
          <InputField label="Description" name="description" required error={errors.description}>
            <textarea name="description" value={form.description} onChange={handleChange} rows={2} placeholder="Brief description..."
              className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none ${errors.description ? 'border-red-400' : 'border-gray-200'}`} />
          </InputField>

          <div className="grid grid-cols-2 gap-3">
            <InputField label="Price (₹)" name="price" type="number" placeholder="199" required value={form.price} onChange={handleChange} error={errors.price} />
            <InputField label="Stock" name="stock" type="number" placeholder="100" required value={form.stock} onChange={handleChange} error={errors.stock} />
          </div>

          <InputField label="Category" name="category" required error={errors.category}>
            <select name="category" value={form.category} onChange={handleChange}
              className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 ${errors.category ? 'border-red-400' : 'border-gray-200'}`}>
              <option value="">Select category</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </InputField>

          <InputField label="Image URL (optional)" name="image" placeholder="https://..." value={form.image} onChange={handleChange} />

          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="isAvailable" checked={form.isAvailable} onChange={handleChange} className="w-4 h-4 accent-orange-500" />
              <span className="text-sm font-medium text-gray-700">Available</span>
            </label>
            {form.catalogType === 'Food' && (
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="isVeg" checked={form.isVeg} onChange={handleChange} className="w-4 h-4 accent-green-500" />
                <span className="text-sm font-medium text-gray-700">Vegetarian</span>
              </label>
            )}
          </div>
        </div>
        <div className="flex gap-3 p-5 border-t">
          <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
          <button onClick={handleSubmit} disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 rounded-xl text-sm disabled:opacity-60">
            {saving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            {isEdit ? 'Save Changes' : 'Add Product'}
          </button>
        </div>
      </div>
    </div>
  );
};

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCatalog, setActiveCatalog] = useState('Food');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [modalProduct, setModalProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const categories = activeCatalog === 'Food' ? FOOD_CATEGORIES : GIFT_CATEGORIES;

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/products/admin/all', { params: { catalogType: activeCatalog } });
      setProducts(res.data.data);
    } catch {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { setCategoryFilter('All'); fetchProducts(); }, [activeCatalog]);

  const filtered = products.filter(p => {
    const matchCat = categoryFilter === 'All' || p.category === categoryFilter;
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleSave = (saved) => {
    if (saved.catalogType !== activeCatalog) return fetchProducts();
    setProducts(prev => {
      const exists = prev.find(p => p._id === saved._id);
      return exists ? prev.map(p => p._id === saved._id ? saved : p) : [saved, ...prev];
    });
  };

  const handleDelete = async (product) => {
    if (!window.confirm(`Delete "${product.name}"?`)) return;
    try {
      await api.delete(`/products/${product._id}`);
      setProducts(prev => prev.filter(p => p._id !== product._id));
      toast.success('Product deleted');
    } catch {
      toast.error('Failed to delete product');
    }
  };

  const openAdd = () => { setModalProduct({ ...EMPTY_FORM, catalogType: activeCatalog, category: categories[0] }); setShowModal(true); };
  const openEdit = (p) => { setModalProduct(p); setShowModal(true); };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-gray-800">Products</h2>
          <p className="text-gray-500 text-sm mt-0.5">Manage your Food and Gift catalogs</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchProducts} className="p-2 text-gray-500 hover:text-orange-500 hover:bg-orange-50 rounded-xl transition-colors">
            <RefreshCw className="w-5 h-5" />
          </button>
          <button onClick={openAdd} className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-sm transition-all">
            <Plus className="w-4 h-4" /> Add Product
          </button>
        </div>
      </div>

      {/* Catalog Tabs */}
      <div className="flex gap-3">
        {[
          { key: 'Food', icon: UtensilsCrossed, emoji: '🍽️', color: 'orange' },
          { key: 'Gift', icon: Gift, emoji: '🎁', color: 'emerald' },
        ].map(({ key, icon: Icon, emoji, color }) => (
          <button key={key} onClick={() => setActiveCatalog(key)}
            className={`flex items-center gap-2.5 px-5 py-3 rounded-xl font-semibold text-sm transition-all border-2 ${activeCatalog === key
                ? color === 'orange' ? 'bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-200' : 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-200'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
              }`}>
            <span className="text-base">{emoji}</span>
            {key} Items
            <span className={`text-xs px-1.5 py-0.5 rounded-lg font-bold ${activeCatalog === key ? 'bg-white/20' : 'bg-gray-100'}`}>
              {products.filter(p => p.catalogType === key).length || (activeCatalog === key ? products.length : '—')}
            </span>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-3">
        <div className="flex gap-2 flex-wrap items-center">
          <div className="flex gap-2 overflow-x-auto flex-1">
            {['All', ...categories].map(cat => (
              <button key={cat} onClick={() => setCategoryFilter(cat)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${categoryFilter === cat ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-orange-50'
                  }`}>{cat}</button>
            ))}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 w-40" />
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array(8).fill(0).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 animate-pulse space-y-3">
              <div className="h-36 bg-gray-100 rounded-xl"></div>
              <div className="h-4 bg-gray-100 rounded w-3/4"></div>
              <div className="h-3 bg-gray-50 rounded"></div>
              <div className="flex justify-between"><div className="h-5 bg-orange-100 rounded w-16"></div><div className="h-8 bg-gray-100 rounded-xl w-20"></div></div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 text-center border border-gray-100">
          <div className="text-5xl mb-4">{activeCatalog === 'Food' ? '🍽️' : '🎁'}</div>
          <p className="text-gray-500 font-medium mb-4">No {activeCatalog.toLowerCase()} products found</p>
          <button onClick={openAdd} className="btn-primary">Add First Product</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(product => (
            <div key={product._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group">
              <div className="relative h-36 bg-gradient-to-br from-orange-100 to-amber-50 overflow-hidden">
                {product.image ? (
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">
                    {activeCatalog === 'Food' ? '🍽️' : '🎁'}
                  </div>
                )}
                <div className="absolute top-2 left-2 flex gap-1">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${product.isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                    {product.isAvailable ? 'Active' : 'Hidden'}
                  </span>
                  {activeCatalog === 'Food' && (
                    <span className={`text-xs px-2 py-0.5 rounded-lg font-bold ${product.isVeg ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                      {product.isVeg ? 'VEG' : 'NON-VEG'}
                    </span>
                  )}
                </div>
              </div>
              <div className="p-3">
                <p className="text-xs text-orange-500 font-semibold uppercase tracking-wide mb-1">{product.category}</p>
                <p className="font-semibold text-gray-800 text-sm leading-tight line-clamp-1 mb-1">{product.name}</p>
                <p className="text-gray-400 text-xs line-clamp-2 mb-2">{product.description}</p>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-orange-600">₹{product.price}</span>
                    <span className="text-gray-400 text-xs ml-2">Stock: {product.stock}</span>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(product)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDelete(product)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && modalProduct && (
        <ProductModal product={modalProduct} onClose={() => { setShowModal(false); setModalProduct(null); }} onSave={handleSave} />
      )}
    </div>
  );
};

export default AdminProducts;
