import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Calendar, Clock, Users, MapPin,
  FileText, User, Phone, Mail, CheckCircle,
  AlertCircle, PartyPopper, Star, Building2, Briefcase, HelpCircle,
  ChevronRight, Plus, Sparkles, Zap, Crown, Check, Lock, Key
} from 'lucide-react';
import Navbar from '../components/Navbar';
import api from '../utils/api';
import toast from 'react-hot-toast';

const EVENT_CONFIG = {
  'birthday-event':     { label:'Birthday Event',     icon:PartyPopper, color:'from-pink-400 to-rose-500',    accent:'text-pink-600',   bg:'bg-pink-50',   border:'border-pink-200',   tiers:['Only Access','Basic','Standard','Premium'] },
  'inauguration-event': { label:'Inauguration Event', icon:Star,        color:'from-amber-400 to-orange-500', accent:'text-amber-600',  bg:'bg-amber-50',  border:'border-amber-200',  tiers:['Standard','Premium'] },
  'departmental-event': { label:'Departmental Event', icon:Building2,   color:'from-blue-400 to-indigo-500',  accent:'text-blue-600',   bg:'bg-blue-50',   border:'border-blue-200',   tiers:['Standard','Premium'] },
  'corporate-event':    { label:'Corporate Event',    icon:Briefcase,   color:'from-slate-400 to-gray-600',   accent:'text-slate-600',  bg:'bg-slate-50',  border:'border-slate-200',  tiers:['Standard','Premium'] },
  'others':             { label:'Others',             icon:HelpCircle,  color:'from-purple-400 to-violet-500',accent:'text-purple-600', bg:'bg-purple-50', border:'border-purple-200', tiers:['Standard','Premium'] },
};

const TIER_CONFIG = {
  'Only Access': { icon:Key,      color:'from-teal-400 to-emerald-500',  badge:'bg-teal-100 text-teal-700',    ring:'ring-teal-400',    border:'border-teal-300',   bg:'bg-teal-50'   },
  Basic:         { icon:Zap,      color:'from-blue-400 to-cyan-500',     badge:'bg-blue-100 text-blue-700',    ring:'ring-blue-400',    border:'border-blue-300',   bg:'bg-blue-50'   },
  Standard:      { icon:Sparkles, color:'from-orange-400 to-amber-500',  badge:'bg-orange-100 text-orange-700',ring:'ring-orange-400',  border:'border-orange-300', bg:'bg-orange-50', popular:true },
  Premium:       { icon:Crown,    color:'from-purple-500 to-pink-500',   badge:'bg-purple-100 text-purple-700',ring:'ring-purple-400',  border:'border-purple-300', bg:'bg-purple-50' },
};

// Birthday: 2-hr slots. All others: 3-hr slots.
const BIRTHDAY_SLOTS = [
  { label:'Afternoon', sub:'2 PM – 4 PM',  icon:'☀️', value:'2 PM – 4 PM'  },
  { label:'Evening',   sub:'5 PM – 7 PM',  icon:'🌆', value:'5 PM – 7 PM'  },
];
const STANDARD_SLOTS = [
  { label:'Morning',   sub:'10 AM – 1 PM', icon:'🌅', value:'10 AM – 1 PM' },
  { label:'Afternoon', sub:'2 PM – 5 PM',  icon:'☀️', value:'2 PM – 5 PM'  },
  { label:'Evening',   sub:'6 PM – 9 PM',  icon:'🌆', value:'6 PM – 9 PM'  },
];

// Same overlap map as backend — keeps UI and server in sync
// 2PM–4PM overlaps 2PM–5PM only. 5PM–7PM overlaps 6PM–9PM only.
// 2PM–5PM and 5PM–7PM are back-to-back (not overlapping).
const SLOT_OVERLAPS = {
  '2 PM – 4 PM':  ['2 PM – 4 PM',  '2 PM – 5 PM'],
  '5 PM – 7 PM':  ['5 PM – 7 PM',  '6 PM – 9 PM'],
  '10 AM – 1 PM': ['10 AM – 1 PM'],
  '2 PM – 5 PM':  ['2 PM – 5 PM',  '2 PM – 4 PM'],
  '6 PM – 9 PM':  ['6 PM – 9 PM',  '5 PM – 7 PM'],
};

const expandBlocked = (slots) => {
  const blocked = new Set();
  slots.forEach(slot => (SLOT_OVERLAPS[slot] || [slot]).forEach(s => blocked.add(s)));
  return [...blocked];
};

// ── Field helpers ─────────────────────────────────────────────────────────────
const InputField = ({ label, name, type='text', placeholder, required, icon:Icon, value, onChange, error }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
      {label}{required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <div className="relative">
      {Icon && <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />}
      <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder}
        className={`input ${Icon ? 'pl-10' : ''} ${error ? 'border-red-400 ring-2 ring-red-100' : ''}`} />
    </div>
    {error && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{error}</p>}
  </div>
);

// ── Plan Card ─────────────────────────────────────────────────────────────────
const PlanCard = ({ plan, selected, onSelect }) => {
  const [expanded, setExpanded] = useState(false);
  const cfg = TIER_CONFIG[plan.tier];
  const TIcon = cfg.icon;



  return (
    <div className={`relative rounded-2xl border-2 transition-all duration-300 overflow-hidden ${
      selected ? `${cfg.border} ring-2 ${cfg.ring} shadow-lg` : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
    } ${cfg.popular ? 'scale-[1.02]' : ''}`}>
      {cfg.popular && (
        <div className={`absolute top-0 left-0 right-0 bg-gradient-to-r ${cfg.color} text-white text-xs font-bold text-center py-1.5 tracking-wide`}>
          ⭐ MOST POPULAR
        </div>
      )}
      <div className={`p-5 ${cfg.popular ? 'pt-9' : ''}`}>
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-7 h-7 bg-gradient-to-br ${cfg.color} rounded-lg flex items-center justify-center`}>
                <TIcon className="w-4 h-4 text-white" />
              </div>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${cfg.badge}`}>{plan.tier}</span>
            </div>
            <h3 className="font-display font-bold text-gray-800 text-lg leading-tight">{plan.name}</h3>
          </div>
          {selected && <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0"><Check className="w-4 h-4 text-white" /></div>}
        </div>

        <div className="mb-3">
          <span className={`font-bold text-3xl bg-gradient-to-r ${cfg.color} bg-clip-text text-transparent`}>
            ₹{plan.price.toLocaleString('en-IN')}
          </span>
          <span className="text-gray-400 text-sm ml-1">onwards</span>
        </div>

        <p className="text-gray-500 text-sm mb-4 leading-relaxed">{plan.description}</p>

        <div className="flex gap-3 mb-4">
          {[
            { icon:Users, val:`${plan.guestsMin}–${plan.guestsMax}`, sub:'Guests' },
            { icon:Clock, val:`${plan.durationHours}h`, sub:'Duration' },
          ].map(({ icon:I, val, sub }) => (
            <div key={sub} className={`flex-1 ${cfg.bg} rounded-xl p-2.5 text-center`}>
              <I className={`w-4 h-4 mx-auto mb-1 ${cfg.badge.split(' ')[1]}`} />
              <p className="text-xs font-bold text-gray-800">{val}</p>
              <p className="text-xs text-gray-400">{sub}</p>
            </div>
          ))}
        </div>

        <div className="mb-3">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">What's Included</p>
          <ul className="space-y-1.5">
            {(expanded ? plan.features : plan.features.slice(0, 4)).map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />{f}
              </li>
            ))}
          </ul>
          {plan.features.length > 4 && (
            <button onClick={() => setExpanded(!expanded)} className="mt-2 text-xs text-orange-500 font-semibold hover:text-orange-700">
              {expanded ? '▲ Show less' : `▼ +${plan.features.length - 4} more`}
            </button>
          )}
        </div>

        {plan.addons?.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Add-ons Available</p>
            <div className="space-y-1">
              {plan.addons.map((a, i) => (
                <div key={i} className="flex justify-between text-xs bg-gray-50 rounded-lg px-3 py-1.5">
                  <span className="text-gray-600 flex items-center gap-1"><Plus className="w-3 h-3 text-gray-400" />{a.name}</span>
                  <span className="font-semibold text-gray-700">+₹{a.price.toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <button onClick={() => onSelect(plan)}
          className={`w-full py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
            selected
              ? 'bg-green-500 text-white'
              : `bg-gradient-to-r ${cfg.color} text-white hover:opacity-90 hover:shadow-md`
          }`}>
          {selected ? <><Check className="w-4 h-4" />Selected</> : <>Select {plan.tier} Plan <ChevronRight className="w-4 h-4" /></>}
        </button>
      </div>
    </div>
  );
};

// ── Slot Picker ───────────────────────────────────────────────────────────────
const SlotPicker = ({ selectedDate, selectedSlot, onSlotSelect, blockedSlots, loadingSlots, isBirthday }) => {
  const slots = isBirthday ? BIRTHDAY_SLOTS : STANDARD_SLOTS;
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        Time Slot <span className="text-red-500">*</span>
        <span className="ml-2 text-xs font-normal text-gray-400">
          ({isBirthday ? '2-hour slots' : '3-hour slots'})
        </span>
      </label>
      {!selectedDate ? (
        <p className="text-gray-400 text-sm italic bg-gray-50 rounded-xl px-4 py-3">Please select an event date first</p>
      ) : loadingSlots ? (
        <div className="flex items-center gap-2 text-gray-400 text-sm bg-gray-50 rounded-xl px-4 py-3">
          <div className="w-4 h-4 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
          Checking availability...
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {slots.map(slot => {
            const isBlocked  = blockedSlots.includes(slot.value);
            const isSelected = selectedSlot === slot.value;
            return (
              <button key={slot.value} type="button"
                disabled={isBlocked}
                onClick={() => !isBlocked && onSlotSelect(slot.value)}
                className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                  isBlocked
                    ? 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
                    : isSelected
                      ? 'border-orange-500 bg-orange-50 ring-2 ring-orange-300'
                      : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50/50 cursor-pointer'
                }`}>
                <span className="text-xl flex-shrink-0">{slot.icon}</span>
                <div className="min-w-0">
                  <p className={`text-sm font-semibold ${isBlocked ? 'text-gray-400' : 'text-gray-800'}`}>
                    {slot.label}
                    {isBlocked && <span className="ml-2 text-xs font-normal text-red-500 inline-flex items-center gap-1"><Lock className="w-3 h-3" />Booked</span>}
                  </p>
                  <p className="text-xs text-gray-400">{slot.sub}</p>
                </div>
                {isSelected && <Check className="w-4 h-4 text-orange-500 ml-auto flex-shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const BookingPage = () => {
  const { eventType } = useParams();
  const navigate = useNavigate();
  const config = EVENT_CONFIG[eventType];
  const isBirthday = eventType === 'birthday-event';

  const [step, setStep] = useState(1);
  const [plans, setPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [blockedSlots, setBlockedSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [form, setForm] = useState({
    name:'', phone:'', email:'',
    eventDate:'', eventTime:'', numberOfGuests:'',
    venue:'Celebration Hub, Inside Student Activity Center', specialRequirements:''
  });

  useEffect(() => { if (!config) navigate('/'); else fetchPlans(); }, [eventType]);

  const fetchPlans = async () => {
    setPlansLoading(true);
    try {
      const res = await api.get('/event-plans', { params: { eventType: config.label } });
      const allowed = res.data.data.filter(p => config.tiers.includes(p.tier));
      setPlans(allowed);
    } catch { toast.error('Failed to load plans'); }
    finally { setPlansLoading(false); }
  };

  const fetchAvailability = async (date) => {
    if (!date) return;
    setLoadingSlots(true);
    setBlockedSlots([]);
    try {
      const res = await api.get('/bookings/availability', { params: { date } });
      setBlockedSlots(expandBlocked(res.data.data.blocked || []));
    } catch { /* silently fail */ }
    finally { setLoadingSlots(false); }
  };

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    setForm(prev => ({
      ...prev,
      numberOfGuests: String(Math.round((plan.guestsMin + plan.guestsMax) / 2))
    }));
    setStep(2);
    setTimeout(() => window.scrollTo({ top:0, behavior:'smooth' }), 50);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    if (name === 'eventDate') {
      setForm(prev => ({ ...prev, eventDate: value, eventTime: '' }));
      fetchAvailability(value);
    }
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.phone.trim()) e.phone = 'Phone is required';
    else if (!/^[0-9]{10,15}$/.test(form.phone.replace(/\s/g,''))) e.phone = 'Enter a valid phone number';
    if (form.email && !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.eventDate) e.eventDate = 'Event date is required';
    else {
      const d = new Date(form.eventDate);
      const minD = new Date(); minD.setDate(minD.getDate() + 2); minD.setHours(0,0,0,0);
      if (d < minD) e.eventDate = 'Please book at least 2 days before the event';
    }
    if (!form.eventTime) e.eventTime = 'Please select a time slot';
    if (blockedSlots.includes(form.eventTime)) e.eventTime = 'This slot is already booked. Please choose another.';
    if (!form.numberOfGuests || Number(form.numberOfGuests) < 1) e.numberOfGuests = 'Enter number of guests';
    if (!form.venue.trim()) e.venue = 'Venue is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };


  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) { toast.error('Please fix the errors below'); return; }
    setLoading(true);
    try {
      const payload = {
        eventType: config.label,
        planTier:  selectedPlan?.tier  || 'Standard',
        planName:  selectedPlan?.name  || '',
        planPrice: selectedPlan?.price || 0,
        customer:  { name: form.name.trim(), phone: form.phone.trim(), email: form.email.trim() || undefined },
        eventDate: form.eventDate,
        eventTime: form.eventTime,
        numberOfGuests:      Number(form.numberOfGuests),
        venue:               form.venue.trim(),
        specialRequirements: form.specialRequirements.trim() || undefined,
      };
      const res = await api.post('/bookings', payload);
      navigate('/booking-success', { state: { booking: res.data.data, plan: selectedPlan } });
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit booking';
      toast.error(msg);
      if (err.response?.status === 409) {
        // Immediately mark conflicted slot + all overlapping slots as blocked
        setBlockedSlots(prev => expandBlocked([...prev, form.eventTime]));
        setForm(prev => ({ ...prev, eventTime: '' }));
        // Then re-fetch to get the full accurate list from server
        fetchAvailability(form.eventDate);
      }
    } finally { setLoading(false); }
  };

  if (!config) return null;
  const EventIcon = config.icon;
  const minBookingDate = (() => {
    const d = new Date(); d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  })();

  return (
    <div className="min-h-screen bg-orange-50">
      <Navbar />

      {/* Header */}
      <div className={`bg-gradient-to-r ${config.color} relative overflow-hidden`}>
        <div className="absolute inset-0 opacity-10 text-8xl flex items-center justify-around pointer-events-none">
          <span>✨</span><span>🎊</span><span>✨</span>
        </div>
        <div className="relative max-w-6xl mx-auto px-4 py-10">
          <Link to="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white text-sm mb-4">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <EventIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold text-white">{config.label}</h1>
              <p className="text-white/80 text-sm mt-0.5">
                {step === 1 ? 'Choose your plan' : 'Fill in your event details'}
              </p>
            </div>
          </div>
          {/* Steps */}
          <div className="flex items-center gap-3">
            {[{n:1,label:'Select Plan'},{n:2,label:'Event Details'}].map(({n,label}) => (
              <React.Fragment key={n}>
                <button onClick={() => n < step && setStep(n)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                    step===n ? 'bg-white text-gray-800 shadow-lg' : step>n ? 'bg-white/30 text-white cursor-pointer hover:bg-white/40' : 'bg-white/10 text-white/60 cursor-default'
                  }`}>
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${step>n?'bg-green-400 text-white':step===n?'bg-orange-500 text-white':'bg-white/20 text-white'}`}>
                    {step>n?'✓':n}
                  </span>
                  {label}
                </button>
                {n < 2 && <ChevronRight className="w-4 h-4 text-white/50" />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10">

        {/* ── Advance Notice Banner (both steps) ── */}
        <div className="flex items-start gap-3 bg-amber-50 border-2 border-amber-300 rounded-2xl px-5 py-4 mb-8 shadow-sm">
          <span className="text-2xl flex-shrink-0 mt-0.5">📅</span>
          <div>
            <p className="font-bold text-amber-800 text-sm">Advance Booking Required</p>
            <p className="text-amber-700 text-sm mt-0.5">
              Please book your event <strong>at least 2 days prior</strong> to the event date. Same-day and next-day bookings are not accepted.
            </p>
          </div>
        </div>

        {/* ── STEP 1: Plan Selection ────────────────────────────────────── */}
        {step === 1 && (
          <div>
            <div className="text-center mb-8">
              <h2 className="font-display text-2xl font-bold text-gray-800 mb-2">Choose Your Plan</h2>
              <p className="text-gray-500">Select the package that best fits your event. All plans include a dedicated event coordinator.</p>
            </div>

            {plansLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1,2,3].map(i => (
                  <div key={i} className="bg-white rounded-2xl p-5 animate-pulse space-y-4 h-80">
                    <div className="h-6 bg-gray-100 rounded w-1/2" />
                    <div className="h-10 bg-orange-100 rounded w-1/3" />
                    <div className="space-y-2">{Array(4).fill(0).map((_,j) => <div key={j} className="h-3 bg-gray-100 rounded" />)}</div>
                    <div className="h-10 bg-gray-100 rounded-xl" />
                  </div>
                ))}
              </div>
            ) : plans.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                <div className="text-5xl mb-4">📋</div>
                <h3 className="font-semibold text-gray-700 mb-2">No plans configured yet</h3>
                <button onClick={() => setStep(2)} className="btn-primary mt-4">Continue with Custom Enquiry</button>
              </div>
            ) : (
              <>
                <div className={`grid gap-6 items-start ${
                  plans.length <= 2 ? 'md:grid-cols-2 max-w-3xl mx-auto' :
                  plans.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2 lg:grid-cols-4'
                }`}>
                  {config.tiers.map(tier => {
                    const plan = plans.find(p => p.tier === tier);
                    return plan ? <PlanCard key={tier} plan={plan} selected={selectedPlan?._id === plan._id} onSelect={handleSelectPlan} /> : null;
                  })}
                </div>
                <div className="text-center mt-8">
                  <button onClick={() => { setSelectedPlan(null); setStep(2); }}
                    className="text-sm text-gray-400 hover:text-orange-500 underline transition-colors">
                    Skip — submit a custom enquiry instead
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── STEP 2: Form ─────────────────────────────────────────────── */}
        {step === 2 && (
          <div className="max-w-3xl mx-auto">
            {/* Selected plan summary bar */}
            {selectedPlan && (
              <div className={`${TIER_CONFIG[selectedPlan.tier].bg} border ${TIER_CONFIG[selectedPlan.tier].border} rounded-2xl p-4 mb-6 flex items-center justify-between`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 bg-gradient-to-br ${TIER_CONFIG[selectedPlan.tier].color} rounded-xl flex items-center justify-center`}>
                    {React.createElement(TIER_CONFIG[selectedPlan.tier].icon, { className:'w-5 h-5 text-white' })}
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">{selectedPlan.name}</p>
                    <p className="text-sm text-gray-500">{selectedPlan.tier} · ₹{selectedPlan.price.toLocaleString('en-IN')} · {selectedPlan.guestsMin}–{selectedPlan.guestsMax} guests</p>
                  </div>
                </div>
                <button onClick={() => setStep(1)} className="text-xs text-orange-500 font-semibold hover:text-orange-700">Change</button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Contact */}
              <div className="card p-6">
                <h2 className="font-display text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-orange-500" /> Contact Details
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <InputField label="Full Name" name="name" placeholder="John Doe" required icon={User} value={form.name} onChange={handleChange} error={errors.name} />
                  <InputField label="Phone Number" name="phone" type="tel" placeholder="9876543210" required icon={Phone} value={form.phone} onChange={handleChange} error={errors.phone} />
                  <div className="sm:col-span-2">
                    <InputField label="Email Address" name="email" type="email" placeholder="john@example.com (optional)" icon={Mail} value={form.email} onChange={handleChange} error={errors.email} />
                  </div>
                </div>
              </div>

              {/* Event Details */}
              <div className="card p-6">
                <h2 className="font-display text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-orange-500" /> Event Details
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {/* Date */}
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Event Date <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input type="date" name="eventDate" value={form.eventDate}
                        onChange={handleChange} min={minBookingDate}
                        className={`input pl-10 ${errors.eventDate ? 'border-red-400 ring-2 ring-red-100' : ''}`} />
                    </div>
                    {errors.eventDate && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.eventDate}</p>}
                  </div>

                  {/* Time Slot */}
                  <div className="sm:col-span-2">
                    <SlotPicker
                      selectedDate={form.eventDate}
                      selectedSlot={form.eventTime}
                      onSlotSelect={(val) => { setForm(p => ({...p, eventTime:val})); if(errors.eventTime) setErrors(p => ({...p, eventTime:''})); }}
                      blockedSlots={blockedSlots}
                      loadingSlots={loadingSlots}
                      isBirthday={isBirthday}
                    />
                    {errors.eventTime && <p className="text-red-500 text-xs mt-2 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.eventTime}</p>}
                  </div>

                  {/* Guests */}
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Number of Guests <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input type="number" name="numberOfGuests" value={form.numberOfGuests} onChange={handleChange} min="1"
                        placeholder={selectedPlan ? `${selectedPlan.guestsMin}–${selectedPlan.guestsMax}` : 'e.g. 50'}
                        className={`input pl-10 ${errors.numberOfGuests ? 'border-red-400 ring-2 ring-red-100' : ''}`} />
                    </div>
                    {selectedPlan && <p className="text-xs text-gray-400 mt-1">Plan covers {selectedPlan.guestsMin}–{selectedPlan.guestsMax} guests</p>}
                    {errors.numberOfGuests && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.numberOfGuests}</p>}
                  </div>

                  {/* Venue */}
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Venue / Location <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                      <textarea name="venue" value="Celebration Hub, Inside Student Activity Center" onChange={handleChange} rows={2}
                        readOnly
                        className="input pl-10 resize-none bg-gray-50 text-gray-500 cursor-not-allowed" />
                    </div>
                    {errors.venue && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.venue}</p>}
                  </div>
                </div>
              </div>

              {/* Special Requirements */}
              <div className="card p-6">
                <h2 className="font-display text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-orange-500" /> Special Requirements <span className="text-sm font-normal text-gray-400">(Optional)</span>
                </h2>
                <div className="relative">
                  <FileText className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                  <textarea name="specialRequirements" value={form.specialRequirements} onChange={handleChange} rows={3}
                    placeholder="Decorations, dietary restrictions, themes, any specific requests..."
                    className="input pl-10 resize-none" />
                </div>
              </div>

              <div className={`${config.bg} ${config.border} border rounded-2xl p-4 flex items-start gap-3`}>
                <CheckCircle className={`w-5 h-5 ${config.accent} flex-shrink-0 mt-0.5`} />
                <p className={`text-sm ${config.accent}`}>
                  Our team will review your enquiry and <strong>contact you shortly</strong> to confirm your booking.
                </p>
              </div>

              <button type="submit" disabled={loading}
                className="w-full btn-primary flex items-center justify-center gap-2 py-4 text-base disabled:opacity-60 disabled:cursor-not-allowed">
                {loading
                  ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />Submitting...</>
                  : <><CheckCircle className="w-5 h-5" />Submit Booking Enquiry</>
                }
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingPage;
