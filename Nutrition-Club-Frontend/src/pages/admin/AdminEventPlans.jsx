// import React, { useState, useEffect } from 'react';
// import { Key,
//   Plus, Pencil, Trash2, X, AlertCircle, ChevronDown, ChevronUp,
//   Zap, Sparkles, Crown, Check, RefreshCw, Users, Clock, IndianRupee
// } from 'lucide-react';
// import api from '../../utils/api';
// import toast from 'react-hot-toast';

// const EVENT_TYPES = ['Birthday Event', 'Inauguration Event', 'Departmental Event', 'Corporate Event', 'Others'];
// const TIERS = ['Only Access', 'Basic', 'Standard', 'Premium'];

// const TIER_CONFIG = {
//   'Only Access': { icon: Key, color: 'from-teal-400 to-emerald-400', badge: 'bg-teal-100 text-teal-700', border: 'border-teal-200' },
//   Basic:    { icon: Zap,      color: 'from-blue-400 to-cyan-400',    badge: 'bg-blue-100 text-blue-700',    border: 'border-blue-200' },
//   Standard: { icon: Sparkles, color: 'from-orange-400 to-amber-400', badge: 'bg-orange-100 text-orange-700',border: 'border-orange-200' },
//   Premium:  { icon: Crown,    color: 'from-purple-500 to-pink-500',  badge: 'bg-purple-100 text-purple-700',border: 'border-purple-200' },
// };

// const EMPTY_FORM = {
//   eventType: 'Birthday Event', tier: 'Basic', name: '', price: '',
//   description: '', guestsMin: '', guestsMax: '', durationHours: '',
//   features: [''], addons: [{ name: '', price: '' }], isActive: true, sortOrder: 0
// };

// // ── Plan Modal ────────────────────────────────────────────────────────────────
// const PlanModal = ({ plan, onClose, onSave }) => {
//   const isEdit = !!plan?._id;
//   const [form, setForm] = useState(plan
//     ? { ...plan, price: String(plan.price), guestsMin: String(plan.guestsMin), guestsMax: String(plan.guestsMax), durationHours: String(plan.durationHours), features: [...plan.features], addons: plan.addons.map(a => ({ ...a, price: String(a.price) })) }
//     : { ...EMPTY_FORM }
//   );
//   const [errors, setErrors] = useState({});
//   const [saving, setSaving] = useState(false);

//   const validate = () => {
//     const e = {};
//     if (!form.name.trim()) e.name = 'Plan name is required';
//     if (!form.price || isNaN(form.price) || Number(form.price) < 0) e.price = 'Enter valid price';
//     if (!form.description.trim()) e.description = 'Description is required';
//     if (!form.guestsMin || Number(form.guestsMin) < 1) e.guestsMin = 'Enter min guests';
//     if (!form.guestsMax || Number(form.guestsMax) < Number(form.guestsMin)) e.guestsMax = 'Max must be ≥ min';
//     if (!form.durationHours || Number(form.durationHours) < 1) e.durationHours = 'Enter duration';
//     const validFeatures = form.features.filter(f => f.trim());
//     if (validFeatures.length === 0) e.features = 'Add at least one feature';
//     setErrors(e);
//     return Object.keys(e).length === 0;
//   };

//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setForm(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
//     if (errors[name]) setErrors(p => ({ ...p, [name]: '' }));
//   };

//   const setFeature = (i, val) => setForm(p => { const f = [...p.features]; f[i] = val; return { ...p, features: f }; });
//   const addFeature = () => setForm(p => ({ ...p, features: [...p.features, ''] }));
//   const removeFeature = (i) => setForm(p => ({ ...p, features: p.features.filter((_, idx) => idx !== i) }));

//   const setAddon = (i, field, val) => setForm(p => {
//     const a = [...p.addons]; a[i] = { ...a[i], [field]: val }; return { ...p, addons: a };
//   });
//   const addAddon = () => setForm(p => ({ ...p, addons: [...p.addons, { name: '', price: '' }] }));
//   const removeAddon = (i) => setForm(p => ({ ...p, addons: p.addons.filter((_, idx) => idx !== i) }));

//   const handleSubmit = async () => {
//     if (!validate()) return;
//     setSaving(true);
//     try {
//       const payload = {
//         ...form,
//         price: Number(form.price), guestsMin: Number(form.guestsMin),
//         guestsMax: Number(form.guestsMax), durationHours: Number(form.durationHours),
//         features: form.features.filter(f => f.trim()),
//         addons: form.addons.filter(a => a.name.trim()).map(a => ({ name: a.name.trim(), price: Number(a.price) || 0 }))
//       };
//       const res = isEdit
//         ? await api.put(`/event-plans/${plan._id}`, payload)
//         : await api.post('/event-plans', payload);
//       toast.success(isEdit ? 'Plan updated!' : 'Plan created!');
//       onSave(res.data.data);
//       onClose();
//     } catch (err) {
//       toast.error(err.response?.data?.message || 'Failed to save plan');
//     } finally {
//       setSaving(false);
//     }
//   };

//   const Input = ({ label, name, type='text', placeholder, req, error: errKey }) => (
//     <div>
//       <label className="block text-xs font-semibold text-gray-600 mb-1">{label}{req && <span className="text-red-400 ml-0.5">*</span>}</label>
//       <input type={type} name={name} value={form[name]} onChange={handleChange} placeholder={placeholder}
//         className={`w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 ${errors[errKey || name] ? 'border-red-400' : 'border-gray-200'}`} />
//       {errors[errKey || name] && <p className="text-red-500 text-xs mt-1">{errors[errKey || name]}</p>}
//     </div>
//   );

//   return (
//     <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
//       <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
//         <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-white z-10">
//           <h2 className="font-display font-bold text-lg text-gray-800">{isEdit ? 'Edit Plan' : 'Create New Plan'}</h2>
//           <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl"><X className="w-5 h-5" /></button>
//         </div>
//         <div className="p-5 space-y-5">
//           {/* Event Type + Tier */}
//           <div className="grid grid-cols-2 gap-3">
//             <div>
//               <label className="block text-xs font-semibold text-gray-600 mb-1">Event Type <span className="text-red-400">*</span></label>
//               <select name="eventType" value={form.eventType} onChange={handleChange}
//                 className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" disabled={isEdit}>
//                 {EVENT_TYPES.map(t => <option key={t}>{t}</option>)}
//               </select>
//             </div>
//             <div>
//               <label className="block text-xs font-semibold text-gray-600 mb-1">Tier <span className="text-red-400">*</span></label>
//               <div className="flex gap-2">
//                 {TIERS.map(t => {
//                   const cfg = TIER_CONFIG[t];
//                   const TIcon = cfg.icon;
//                   return (
//                     <button key={t} type="button" onClick={() => !isEdit && setForm(p => ({ ...p, tier: t }))} disabled={isEdit}
//                       className={`flex-1 flex flex-col items-center gap-0.5 py-2 rounded-xl border-2 text-xs font-semibold transition-all ${
//                         form.tier === t ? `${cfg.border} ${cfg.badge}` : 'border-gray-200 text-gray-400'
//                       } ${isEdit ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
//                       <TIcon className="w-3.5 h-3.5" />{t}
//                     </button>
//                   );
//                 })}
//               </div>
//             </div>
//           </div>

//           {/* Basic info */}
//           <div className="grid grid-cols-2 gap-3">
//             <div className="col-span-2"><Input label="Plan Name" name="name" placeholder='e.g. "Birthday Starter"' req /></div>
//             <Input label="Price (₹)" name="price" type="number" placeholder="9999" req />
//             <Input label="Duration (hours)" name="durationHours" type="number" placeholder="4" req />
//             <Input label="Min Guests" name="guestsMin" type="number" placeholder="10" req />
//             <Input label="Max Guests" name="guestsMax" type="number" placeholder="50" req errKey="guestsMax" />
//           </div>

//           <div>
//             <label className="block text-xs font-semibold text-gray-600 mb-1">Description <span className="text-red-400">*</span></label>
//             <textarea name="description" value={form.description} onChange={handleChange} rows={2}
//               placeholder="Short description of this plan..."
//               className={`w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none ${errors.description ? 'border-red-400' : 'border-gray-200'}`} />
//             {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
//           </div>

//           {/* Features */}
//           <div>
//             <div className="flex items-center justify-between mb-2">
//               <label className="text-xs font-semibold text-gray-600">What's Included (Features) <span className="text-red-400">*</span></label>
//               <button onClick={addFeature} className="text-xs text-orange-500 font-semibold flex items-center gap-1 hover:text-orange-700">
//                 <Plus className="w-3.5 h-3.5" /> Add Feature
//               </button>
//             </div>
//             {errors.features && <p className="text-red-500 text-xs mb-2">{errors.features}</p>}
//             <div className="space-y-2">
//               {form.features.map((f, i) => (
//                 <div key={i} className="flex gap-2">
//                   <div className="flex items-center w-5 h-9 justify-center text-green-500 flex-shrink-0"><Check className="w-4 h-4" /></div>
//                   <input value={f} onChange={e => setFeature(i, e.target.value)} placeholder={`Feature ${i+1}...`}
//                     className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
//                   {form.features.length > 1 && (
//                     <button onClick={() => removeFeature(i)} className="p-2 text-gray-300 hover:text-red-500 transition-colors"><X className="w-4 h-4" /></button>
//                   )}
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Add-ons */}
//           <div>
//             <div className="flex items-center justify-between mb-2">
//               <label className="text-xs font-semibold text-gray-600">Add-ons (Optional)</label>
//               <button onClick={addAddon} className="text-xs text-orange-500 font-semibold flex items-center gap-1 hover:text-orange-700">
//                 <Plus className="w-3.5 h-3.5" /> Add Option
//               </button>
//             </div>
//             <div className="space-y-2">
//               {form.addons.map((addon, i) => (
//                 <div key={i} className="flex gap-2">
//                   <input value={addon.name} onChange={e => setAddon(i, 'name', e.target.value)} placeholder="Add-on name..."
//                     className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
//                   <input value={addon.price} onChange={e => setAddon(i, 'price', e.target.value)} placeholder="₹" type="number"
//                     className="w-24 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
//                   <button onClick={() => removeAddon(i)} className="p-2 text-gray-300 hover:text-red-500 transition-colors"><X className="w-4 h-4" /></button>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Active toggle */}
//           <label className="flex items-center gap-3 cursor-pointer">
//             <div className={`relative w-10 h-6 rounded-full transition-colors ${form.isActive ? 'bg-orange-500' : 'bg-gray-300'}`}
//               onClick={() => setForm(p => ({ ...p, isActive: !p.isActive }))}>
//               <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.isActive ? 'translate-x-5' : 'translate-x-1'}`} />
//             </div>
//             <span className="text-sm font-medium text-gray-700">Plan is active (visible to customers)</span>
//           </label>
//         </div>

//         <div className="flex gap-3 p-5 border-t">
//           <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
//           <button onClick={handleSubmit} disabled={saving}
//             className="flex-1 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 rounded-xl text-sm disabled:opacity-60">
//             {saving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
//             {isEdit ? 'Save Changes' : 'Create Plan'}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// // ── Main Page ─────────────────────────────────────────────────────────────────
// const AdminEventPlans = () => {
//   const [plans, setPlans] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [activeEventType, setActiveEventType] = useState('Birthday Event');
//   const [modal, setModal] = useState(null); // null | 'add' | plan object
//   const [expandedPlan, setExpandedPlan] = useState(null);

//   const fetchPlans = async () => {
//     setLoading(true);
//     try {
//       const res = await api.get('/event-plans/admin/all');
//       setPlans(res.data.data);
//     } catch { toast.error('Failed to load plans'); }
//     finally { setLoading(false); }
//   };

//   useEffect(() => { fetchPlans(); }, []);

//   const handleSave = (saved) => {
//     setPlans(prev => {
//       const exists = prev.find(p => p._id === saved._id);
//       return exists ? prev.map(p => p._id === saved._id ? saved : p) : [...prev, saved];
//     });
//   };

//   const handleDelete = async (plan) => {
//     if (!window.confirm(`Delete "${plan.name}"?`)) return;
//     try {
//       await api.delete(`/event-plans/${plan._id}`);
//       setPlans(prev => prev.filter(p => p._id !== plan._id));
//       toast.success('Plan deleted');
//     } catch { toast.error('Failed to delete'); }
//   };

//   const visiblePlans = plans.filter(p => p.eventType === activeEventType);
//   const EVENT_EMOJIS = { 'Birthday Event': '🎂', 'Inauguration Event': '⭐', 'Departmental Event': '🏢', 'Corporate Event': '💼', 'Others': '📋' };

//   return (
//     <div className="space-y-5 animate-fade-in">
//       <div className="flex items-center justify-between">
//         <div>
//           <h2 className="font-display text-2xl font-bold text-gray-800">Event Plans</h2>
//           <p className="text-gray-500 text-sm mt-0.5">Manage Basic, Standard & Premium plans per event type</p>
//         </div>
//         <div className="flex gap-2">
//           <button onClick={fetchPlans} className="p-2 text-gray-500 hover:text-orange-500 hover:bg-orange-50 rounded-xl transition-colors"><RefreshCw className="w-5 h-5" /></button>
//           <button onClick={() => setModal('add')}
//             className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-sm">
//             <Plus className="w-4 h-4" /> Add Plan
//           </button>
//         </div>
//       </div>

//       {/* Event type tabs */}
//       <div className="flex gap-2 overflow-x-auto pb-1">
//         {EVENT_TYPES.map(et => {
//           const count = plans.filter(p => p.eventType === et).length;
//           return (
//             <button key={et} onClick={() => setActiveEventType(et)}
//               className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all border-2 ${
//                 activeEventType === et ? 'bg-orange-500 text-white border-orange-500 shadow-md' : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300'
//               }`}>
//               {EVENT_EMOJIS[et]} {et}
//               <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${activeEventType === et ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>{count}/4</span>
//             </button>
//           );
//         })}
//       </div>

//       {/* Plans grid */}
//       {loading ? (
//         <div className="grid md:grid-cols-3 gap-5">
//           {[1,2,3].map(i => <div key={i} className="bg-white rounded-2xl p-5 animate-pulse h-48 space-y-3"><div className="h-6 bg-gray-100 rounded w-1/2"/><div className="h-8 bg-orange-100 rounded w-1/3"/><div className="h-3 bg-gray-50 rounded"/><div className="h-3 bg-gray-50 rounded w-3/4"/></div>)}
//         </div>
//       ) : (
//         <div className="grid md:grid-cols-3 gap-5">
//           {TIERS.map(tier => {
//             const plan = visiblePlans.find(p => p.tier === tier);
//             const cfg = TIER_CONFIG[tier];
//             const TIcon = cfg.icon;

//             if (!plan) return (
//               <div key={tier} onClick={() => setModal({ ...EMPTY_FORM, eventType: activeEventType, tier, features: [''], addons: [{ name: '', price: '' }] })}
//                 className="border-2 border-dashed border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-orange-300 hover:bg-orange-50/50 transition-all min-h-[180px] group">
//                 <div className={`w-12 h-12 bg-gradient-to-br ${cfg.color} rounded-xl flex items-center justify-center opacity-40 group-hover:opacity-70 transition-opacity`}>
//                   <TIcon className="w-6 h-6 text-white" />
//                 </div>
//                 <div className="text-center">
//                   <p className="font-semibold text-gray-400 group-hover:text-orange-500 transition-colors">{tier} Plan</p>
//                   <p className="text-xs text-gray-300 mt-1">Click to create</p>
//                 </div>
//                 <Plus className="w-5 h-5 text-gray-300 group-hover:text-orange-400" />
//               </div>
//             );

//             const isExpanded = expandedPlan === plan._id;
//             return (
//               <div key={tier} className={`bg-white rounded-2xl border-2 ${cfg.border} overflow-hidden shadow-sm`}>
//                 <div className={`bg-gradient-to-r ${cfg.color} p-4`}>
//                   <div className="flex items-center justify-between">
//                     <div className="flex items-center gap-2">
//                       <TIcon className="w-5 h-5 text-white" />
//                       <span className="font-bold text-white">{plan.tier}</span>
//                       {!plan.isActive && <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full">Hidden</span>}
//                     </div>
//                     <div className="flex gap-1">
//                       <button onClick={() => setModal(plan)} className="p-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"><Pencil className="w-3.5 h-3.5 text-white" /></button>
//                       <button onClick={() => handleDelete(plan)} className="p-1.5 bg-white/20 hover:bg-red-400/60 rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5 text-white" /></button>
//                     </div>
//                   </div>
//                   <p className="text-white font-display font-bold text-lg mt-2 leading-tight">{plan.name}</p>
//                   <p className="text-white/80 text-2xl font-bold mt-1">₹{plan.price.toLocaleString('en-IN')}</p>
//                 </div>

//                 <div className="p-4">
//                   <div className="flex gap-3 mb-3">
//                     <div className="flex-1 bg-gray-50 rounded-xl p-2 text-center">
//                       <Users className="w-3.5 h-3.5 mx-auto text-gray-400 mb-0.5" />
//                       <p className="text-xs font-bold text-gray-700">{plan.guestsMin}–{plan.guestsMax}</p>
//                       <p className="text-xs text-gray-400">Guests</p>
//                     </div>
//                     <div className="flex-1 bg-gray-50 rounded-xl p-2 text-center">
//                       <Clock className="w-3.5 h-3.5 mx-auto text-gray-400 mb-0.5" />
//                       <p className="text-xs font-bold text-gray-700">{plan.durationHours}h</p>
//                       <p className="text-xs text-gray-400">Duration</p>
//                     </div>
//                     <div className="flex-1 bg-gray-50 rounded-xl p-2 text-center">
//                       <Plus className="w-3.5 h-3.5 mx-auto text-gray-400 mb-0.5" />
//                       <p className="text-xs font-bold text-gray-700">{plan.addons?.length || 0}</p>
//                       <p className="text-xs text-gray-400">Add-ons</p>
//                     </div>
//                   </div>

//                   <p className="text-xs text-gray-500 mb-3 line-clamp-2">{plan.description}</p>

//                   <button onClick={() => setExpandedPlan(isExpanded ? null : plan._id)}
//                     className="w-full flex items-center justify-between text-xs text-gray-500 hover:text-orange-500 bg-gray-50 hover:bg-orange-50 px-3 py-2 rounded-xl transition-all font-medium">
//                     <span>{plan.features.length} features included</span>
//                     {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
//                   </button>

//                   {isExpanded && (
//                     <div className="mt-3 space-y-1">
//                       {plan.features.map((f, i) => (
//                         <div key={i} className="flex items-start gap-2 text-xs text-gray-600">
//                           <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" />{f}
//                         </div>
//                       ))}
//                       {plan.addons?.length > 0 && (
//                         <div className="mt-3 pt-2 border-t">
//                           <p className="text-xs font-bold text-gray-400 mb-1.5">ADD-ONS</p>
//                           {plan.addons.map((a, i) => (
//                             <div key={i} className="flex justify-between text-xs text-gray-500 py-0.5">
//                               <span>+ {a.name}</span><span className="font-semibold">₹{a.price.toLocaleString('en-IN')}</span>
//                             </div>
//                           ))}
//                         </div>
//                       )}
//                     </div>
//                   )}
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       )}

//       {(modal === 'add' || (modal && typeof modal === 'object')) && (
//         <PlanModal
//           plan={modal === 'add' ? null : modal}
//           onClose={() => setModal(null)}
//           onSave={handleSave}
//         />
//       )}
//     </div>
//   );
// };

// export default AdminEventPlans;











import React, { useState, useEffect } from 'react';
import { Key,
  Plus, Pencil, Trash2, X, AlertCircle, ChevronDown, ChevronUp,
  Zap, Sparkles, Crown, Check, RefreshCw, Users, Clock, IndianRupee
} from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const EVENT_TYPES = ['Birthday Event', 'Inauguration Event', 'Departmental Event', 'Corporate Event', 'Others'];
const TIERS = ['Only Access', 'Basic', 'Standard', 'Premium'];

const TIER_CONFIG = {
  'Only Access': { icon: Key, color: 'from-teal-400 to-emerald-400', badge: 'bg-teal-100 text-teal-700', border: 'border-teal-200' },
  Basic:    { icon: Zap,      color: 'from-blue-400 to-cyan-400',    badge: 'bg-blue-100 text-blue-700',    border: 'border-blue-200' },
  Standard: { icon: Sparkles, color: 'from-orange-400 to-amber-400', badge: 'bg-orange-100 text-orange-700',border: 'border-orange-200' },
  Premium:  { icon: Crown,    color: 'from-purple-500 to-pink-500',  badge: 'bg-purple-100 text-purple-700',border: 'border-purple-200' },
};

const EMPTY_FORM = {
  eventType: 'Birthday Event', tier: 'Basic', name: '', price: '',
  description: '', guestsMin: '', guestsMax: '', durationHours: '',
  features: [''], addons: [{ name: '', price: '' }], isActive: true, sortOrder: 0
};

// ── Standalone Input — defined OUTSIDE PlanModal to prevent focus loss on re-render
const PlanInput = ({ label, name, type='text', placeholder, req, error: errKey, form, errors, onChange }) => (
  <div>
    <label className="block text-xs font-semibold text-gray-600 mb-1">
      {label}{req && <span className="text-red-400 ml-0.5">*</span>}
    </label>
    <input
      type={type}
      name={name}
      value={form[name] ?? ''}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 ${
        errors[errKey || name] ? 'border-red-400' : 'border-gray-200'
      }`}
    />
    {errors[errKey || name] && <p className="text-red-500 text-xs mt-1">{errors[errKey || name]}</p>}
  </div>
);

// ── Plan Modal ────────────────────────────────────────────────────────────────
const PlanModal = ({ plan, onClose, onSave }) => {
  const isEdit = !!plan?._id;
  const [form, setForm] = useState(plan
    ? { ...plan, price: String(plan.price), guestsMin: String(plan.guestsMin), guestsMax: String(plan.guestsMax), durationHours: String(plan.durationHours), features: [...plan.features], addons: plan.addons.map(a => ({ ...a, price: String(a.price) })) }
    : { ...EMPTY_FORM }
  );
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Plan name is required';
    if (!form.price || isNaN(form.price) || Number(form.price) < 0) e.price = 'Enter valid price';
    if (!form.description.trim()) e.description = 'Description is required';
    if (!form.guestsMin || Number(form.guestsMin) < 1) e.guestsMin = 'Enter min guests';
    if (!form.guestsMax || Number(form.guestsMax) < Number(form.guestsMin)) e.guestsMax = 'Max must be ≥ min';
    if (!form.durationHours || Number(form.durationHours) < 1) e.durationHours = 'Enter duration';
    const validFeatures = form.features.filter(f => f.trim());
    if (validFeatures.length === 0) e.features = 'Add at least one feature';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: '' }));
  };

  const setFeature = (i, val) => setForm(p => { const f = [...p.features]; f[i] = val; return { ...p, features: f }; });
  const addFeature = () => setForm(p => ({ ...p, features: [...p.features, ''] }));
  const removeFeature = (i) => setForm(p => ({ ...p, features: p.features.filter((_, idx) => idx !== i) }));

  const setAddon = (i, field, val) => setForm(p => {
    const a = [...p.addons]; a[i] = { ...a[i], [field]: val }; return { ...p, addons: a };
  });
  const addAddon = () => setForm(p => ({ ...p, addons: [...p.addons, { name: '', price: '' }] }));
  const removeAddon = (i) => setForm(p => ({ ...p, addons: p.addons.filter((_, idx) => idx !== i) }));

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price), guestsMin: Number(form.guestsMin),
        guestsMax: Number(form.guestsMax), durationHours: Number(form.durationHours),
        features: form.features.filter(f => f.trim()),
        addons: form.addons.filter(a => a.name.trim()).map(a => ({ name: a.name.trim(), price: Number(a.price) || 0 }))
      };
      const res = isEdit
        ? await api.put(`/event-plans/${plan._id}`, payload)
        : await api.post('/event-plans', payload);
      toast.success(isEdit ? 'Plan updated!' : 'Plan created!');
      onSave(res.data.data);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save plan');
    } finally {
      setSaving(false);
    }
  };



  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-white z-10">
          <h2 className="font-display font-bold text-lg text-gray-800">{isEdit ? 'Edit Plan' : 'Create New Plan'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5 space-y-5">
          {/* Event Type + Tier */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Event Type <span className="text-red-400">*</span></label>
              <select name="eventType" value={form.eventType} onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" disabled={isEdit}>
                {EVENT_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Tier <span className="text-red-400">*</span></label>
              <div className="flex gap-2">
                {TIERS.map(t => {
                  const cfg = TIER_CONFIG[t];
                  const TIcon = cfg.icon;
                  return (
                    <button key={t} type="button" onClick={() => !isEdit && setForm(p => ({ ...p, tier: t }))} disabled={isEdit}
                      className={`flex-1 flex flex-col items-center gap-0.5 py-2 rounded-xl border-2 text-xs font-semibold transition-all ${
                        form.tier === t ? `${cfg.border} ${cfg.badge}` : 'border-gray-200 text-gray-400'
                      } ${isEdit ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                      <TIcon className="w-3.5 h-3.5" />{t}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Basic info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2"><PlanInput label="Plan Name" name="name" placeholder='e.g. "Birthday Starter"' req  form={form} errors={errors} onChange={handleChange} /></div>
            <PlanInput label="Price (₹)" name="price" type="number" placeholder="9999" req  form={form} errors={errors} onChange={handleChange} />
            <PlanInput label="Duration (hours)" name="durationHours" type="number" placeholder="4" req  form={form} errors={errors} onChange={handleChange} />
            <PlanInput label="Min Guests" name="guestsMin" type="number" placeholder="10" req  form={form} errors={errors} onChange={handleChange} />
            <PlanInput label="Max Guests" name="guestsMax" type="number" placeholder="50" req errKey="guestsMax"  form={form} errors={errors} onChange={handleChange} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Description <span className="text-red-400">*</span></label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={2}
              placeholder="Short description of this plan..."
              className={`w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none ${errors.description ? 'border-red-400' : 'border-gray-200'}`} />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
          </div>

          {/* Features */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-gray-600">What's Included (Features) <span className="text-red-400">*</span></label>
              <button onClick={addFeature} className="text-xs text-orange-500 font-semibold flex items-center gap-1 hover:text-orange-700">
                <Plus className="w-3.5 h-3.5" /> Add Feature
              </button>
            </div>
            {errors.features && <p className="text-red-500 text-xs mb-2">{errors.features}</p>}
            <div className="space-y-2">
              {form.features.map((f, i) => (
                <div key={i} className="flex gap-2">
                  <div className="flex items-center w-5 h-9 justify-center text-green-500 flex-shrink-0"><Check className="w-4 h-4" /></div>
                  <input value={f} onChange={e => setFeature(i, e.target.value)} placeholder={`Feature ${i+1}...`}
                    className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                  {form.features.length > 1 && (
                    <button onClick={() => removeFeature(i)} className="p-2 text-gray-300 hover:text-red-500 transition-colors"><X className="w-4 h-4" /></button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Add-ons */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-gray-600">Add-ons (Optional)</label>
              <button onClick={addAddon} className="text-xs text-orange-500 font-semibold flex items-center gap-1 hover:text-orange-700">
                <Plus className="w-3.5 h-3.5" /> Add Option
              </button>
            </div>
            <div className="space-y-2">
              {form.addons.map((addon, i) => (
                <div key={i} className="flex gap-2">
                  <input value={addon.name} onChange={e => setAddon(i, 'name', e.target.value)} placeholder="Add-on name..."
                    className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                  <input value={addon.price} onChange={e => setAddon(i, 'price', e.target.value)} placeholder="₹" type="number"
                    className="w-24 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                  <button onClick={() => removeAddon(i)} className="p-2 text-gray-300 hover:text-red-500 transition-colors"><X className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          </div>

          {/* Active toggle */}
          <label className="flex items-center gap-3 cursor-pointer">
            <div className={`relative w-10 h-6 rounded-full transition-colors ${form.isActive ? 'bg-orange-500' : 'bg-gray-300'}`}
              onClick={() => setForm(p => ({ ...p, isActive: !p.isActive }))}>
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.isActive ? 'translate-x-5' : 'translate-x-1'}`} />
            </div>
            <span className="text-sm font-medium text-gray-700">Plan is active (visible to customers)</span>
          </label>
        </div>

        <div className="flex gap-3 p-5 border-t">
          <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
          <button onClick={handleSubmit} disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 rounded-xl text-sm disabled:opacity-60">
            {saving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            {isEdit ? 'Save Changes' : 'Create Plan'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const AdminEventPlans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeEventType, setActiveEventType] = useState('Birthday Event');
  const [modal, setModal] = useState(null); // null | 'add' | plan object
  const [expandedPlan, setExpandedPlan] = useState(null);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const res = await api.get('/event-plans/admin/all');
      setPlans(res.data.data);
    } catch { toast.error('Failed to load plans'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPlans(); }, []);

  const handleSave = (saved) => {
    setPlans(prev => {
      const exists = prev.find(p => p._id === saved._id);
      return exists ? prev.map(p => p._id === saved._id ? saved : p) : [...prev, saved];
    });
  };

  const handleDelete = async (plan) => {
    if (!window.confirm(`Delete "${plan.name}"?`)) return;
    try {
      await api.delete(`/event-plans/${plan._id}`);
      setPlans(prev => prev.filter(p => p._id !== plan._id));
      toast.success('Plan deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const visiblePlans = plans.filter(p => p.eventType === activeEventType);
  const EVENT_EMOJIS = { 'Birthday Event': '🎂', 'Inauguration Event': '⭐', 'Departmental Event': '🏢', 'Corporate Event': '💼', 'Others': '📋' };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-gray-800">Event Plans</h2>
          <p className="text-gray-500 text-sm mt-0.5">Manage Basic, Standard & Premium plans per event type</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchPlans} className="p-2 text-gray-500 hover:text-orange-500 hover:bg-orange-50 rounded-xl transition-colors"><RefreshCw className="w-5 h-5" /></button>
          <button onClick={() => setModal('add')}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-sm">
            <Plus className="w-4 h-4" /> Add Plan
          </button>
        </div>
      </div>

      {/* Event type tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {EVENT_TYPES.map(et => {
          const count = plans.filter(p => p.eventType === et).length;
          return (
            <button key={et} onClick={() => setActiveEventType(et)}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all border-2 ${
                activeEventType === et ? 'bg-orange-500 text-white border-orange-500 shadow-md' : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300'
              }`}>
              {EVENT_EMOJIS[et]} {et}
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${activeEventType === et ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>{count}/3</span>
            </button>
          );
        })}
      </div>

      {/* Plans grid */}
      {loading ? (
        <div className="grid md:grid-cols-3 gap-5">
          {[1,2,3].map(i => <div key={i} className="bg-white rounded-2xl p-5 animate-pulse h-48 space-y-3"><div className="h-6 bg-gray-100 rounded w-1/2"/><div className="h-8 bg-orange-100 rounded w-1/3"/><div className="h-3 bg-gray-50 rounded"/><div className="h-3 bg-gray-50 rounded w-3/4"/></div>)}
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-5">
          {TIERS.map(tier => {
            const plan = visiblePlans.find(p => p.tier === tier);
            const cfg = TIER_CONFIG[tier];
            const TIcon = cfg.icon;

            if (!plan) return (
              <div key={tier} onClick={() => setModal({ ...EMPTY_FORM, eventType: activeEventType, tier, features: [''], addons: [{ name: '', price: '' }] })}
                className="border-2 border-dashed border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-orange-300 hover:bg-orange-50/50 transition-all min-h-[180px] group">
                <div className={`w-12 h-12 bg-gradient-to-br ${cfg.color} rounded-xl flex items-center justify-center opacity-40 group-hover:opacity-70 transition-opacity`}>
                  <TIcon className="w-6 h-6 text-white" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-gray-400 group-hover:text-orange-500 transition-colors">{tier} Plan</p>
                  <p className="text-xs text-gray-300 mt-1">Click to create</p>
                </div>
                <Plus className="w-5 h-5 text-gray-300 group-hover:text-orange-400" />
              </div>
            );

            const isExpanded = expandedPlan === plan._id;
            return (
              <div key={tier} className={`bg-white rounded-2xl border-2 ${cfg.border} overflow-hidden shadow-sm`}>
                <div className={`bg-gradient-to-r ${cfg.color} p-4`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TIcon className="w-5 h-5 text-white" />
                      <span className="font-bold text-white">{plan.tier}</span>
                      {!plan.isActive && <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full">Hidden</span>}
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => setModal(plan)} className="p-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"><Pencil className="w-3.5 h-3.5 text-white" /></button>
                      <button onClick={() => handleDelete(plan)} className="p-1.5 bg-white/20 hover:bg-red-400/60 rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5 text-white" /></button>
                    </div>
                  </div>
                  <p className="text-white font-display font-bold text-lg mt-2 leading-tight">{plan.name}</p>
                  <p className="text-white/80 text-2xl font-bold mt-1">₹{plan.price.toLocaleString('en-IN')}</p>
                </div>

                <div className="p-4">
                  <div className="flex gap-3 mb-3">
                    <div className="flex-1 bg-gray-50 rounded-xl p-2 text-center">
                      <Users className="w-3.5 h-3.5 mx-auto text-gray-400 mb-0.5" />
                      <p className="text-xs font-bold text-gray-700">{plan.guestsMin}–{plan.guestsMax}</p>
                      <p className="text-xs text-gray-400">Guests</p>
                    </div>
                    <div className="flex-1 bg-gray-50 rounded-xl p-2 text-center">
                      <Clock className="w-3.5 h-3.5 mx-auto text-gray-400 mb-0.5" />
                      <p className="text-xs font-bold text-gray-700">{plan.durationHours}h</p>
                      <p className="text-xs text-gray-400">Duration</p>
                    </div>
                    <div className="flex-1 bg-gray-50 rounded-xl p-2 text-center">
                      <Plus className="w-3.5 h-3.5 mx-auto text-gray-400 mb-0.5" />
                      <p className="text-xs font-bold text-gray-700">{plan.addons?.length || 0}</p>
                      <p className="text-xs text-gray-400">Add-ons</p>
                    </div>
                  </div>

                  <p className="text-xs text-gray-500 mb-3 line-clamp-2">{plan.description}</p>

                  <button onClick={() => setExpandedPlan(isExpanded ? null : plan._id)}
                    className="w-full flex items-center justify-between text-xs text-gray-500 hover:text-orange-500 bg-gray-50 hover:bg-orange-50 px-3 py-2 rounded-xl transition-all font-medium">
                    <span>{plan.features.length} features included</span>
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  {isExpanded && (
                    <div className="mt-3 space-y-1">
                      {plan.features.map((f, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-gray-600">
                          <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" />{f}
                        </div>
                      ))}
                      {plan.addons?.length > 0 && (
                        <div className="mt-3 pt-2 border-t">
                          <p className="text-xs font-bold text-gray-400 mb-1.5">ADD-ONS</p>
                          {plan.addons.map((a, i) => (
                            <div key={i} className="flex justify-between text-xs text-gray-500 py-0.5">
                              <span>+ {a.name}</span><span className="font-semibold">₹{a.price.toLocaleString('en-IN')}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {(modal === 'add' || (modal && typeof modal === 'object')) && (
        <PlanModal
          plan={modal === 'add' ? null : modal}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default AdminEventPlans;
