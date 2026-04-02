import React from 'react';
import { Link } from 'react-router-dom';
// import bannerImg from '../assets/cutmlogo.png';
import {
  Calendar, ShoppingBag, PartyPopper, Building2, Star,
  Briefcase, HelpCircle, UtensilsCrossed, Gift, ChevronRight,
  Truck, Clock, Salad
} from 'lucide-react';
import Navbar from '../components/Navbar';

const StatBadge = ({ icon: Icon, label }) => (
  <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-sm border border-white/50">
    <Icon className="w-4 h-4 text-orange-500" />
    <span className="text-sm font-medium text-gray-700">{label}</span>
  </div>
);

const EVENT_TYPES = [
  { label: 'Birthday Event', icon: PartyPopper, color: 'from-pink-400 to-rose-500', bg: 'bg-pink-50', border: 'border-pink-200', path: '/booking/birthday-event' },
  { label: 'Inauguration Event', icon: Star, color: 'from-amber-400 to-orange-500', bg: 'bg-amber-50', border: 'border-amber-200', path: '/booking/inauguration-event' },
  { label: 'Departmental Event', icon: Building2, color: 'from-blue-400 to-indigo-500', bg: 'bg-blue-50', border: 'border-blue-200', path: '/booking/departmental-event' },
  { label: 'Corporate Event', icon: Briefcase, color: 'from-slate-400 to-gray-600', bg: 'bg-slate-50', border: 'border-slate-200', path: '/booking/corporate-event' },
  { label: 'Others', icon: HelpCircle, color: 'from-purple-400 to-violet-500', bg: 'bg-purple-50', border: 'border-purple-200', path: '/booking/others' },
];

const FOOD_HIGHLIGHTS = [
  { emoji: '🎂', name: 'Plum Cake', sub: '750 gm — rich & moist' },
  { emoji: '🍰', name: 'Cool Cake', sub: '0.5 kg / 1 kg options' },
];
const GIFT_HIGHLIGHTS = [
  { emoji: '🖼️', name: 'Photo Frames', sub: 'Classic, engraved, collage' },
  { emoji: '🐘', name: 'Show Pieces', sub: 'Figurines, crystals, globes' },
  { emoji: '💡', name: 'Decorative Lights', sub: 'Fairy lights, moon lamps, neon' },
  { emoji: '🖼️', name: 'Wall Art', sub: 'Canvas prints, family tree' },
  { emoji: '🧸', name: 'Soft Toys', sub: 'Teddy bears, stuffed sets' },
];

const LandingPage = () => (
  <div className="min-h-screen bg-orange-50">
    <Navbar />

    {/* ── Hero ──────────────────────────────────────────────────── */}
    {/* <div className="relative overflow-hidden"
      style={{ backgroundImage: `url(${bannerImg})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}>
      <div className="absolute inset-0 bg-black/45 pointer-events-none" />
      <div className="relative z-10 max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white text-sm font-medium px-4 py-2 rounded-full mb-6 border border-white/30">
          <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse" />
          Events, food & gifts — all in one place
        </div>
        <h1 className="font-display text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">
          Everything for Your<br /><span className="text-yellow-200">Perfect Moment</span>
        </h1>
        <p className="text-orange-100 text-lg md:text-xl mb-8 max-w-2xl mx-auto">
          Plan your event with us or order food & gifts delivered fresh to your door.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {[{I:Calendar,l:'Event Bookings'},{I:Truck,l:'Fast Delivery'},{I:Clock,l:'30–45 min'}].map(({I,l}) => (
            <div key={l} className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-sm border border-white/50">
              <I className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-medium text-gray-700">{l}</span>
            </div>
          ))}
        </div>
      </div>
    </div> */}
    <div className="relative bg-gradient-to-br from-orange-500 via-orange-400 to-amber-300 overflow-hidden">
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-8 left-8 text-9xl">🎉</div>
        <div className="absolute top-4 right-16 text-8xl">🍕</div>
        <div className="absolute bottom-4 left-1/3 text-7xl">🎁</div>
        <div className="absolute bottom-8 right-8 text-8xl">🎂</div>
      </div>
      <div className="relative z-10 max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white text-sm font-medium px-4 py-2 rounded-full mb-6 border border-white/30">
          <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></span>
          Now serving events & deliveries
        </div>
        <h1 className="font-display text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">
          Everything for Your<br />
          <span className="text-yellow-200">Perfect Moment</span>
        </h1>
        <p className="text-orange-100 text-lg md:text-xl mb-8 max-w-2xl mx-auto">
          Book events effortlessly or order food & gifts.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <StatBadge icon={Calendar} label="Event Bookings" />
          <StatBadge icon={Salad} label="Food" />
          <StatBadge icon={Gift} label="Gifts" />
          {/* <StatBadge icon={Shield} label="Secure Payments" /> */}
        </div>
      </div>
    </div>

    <div className="max-w-6xl mx-auto px-4 py-12 space-y-16">

      {/* ══════════════════════════════════════════════════════════
          SECTION 1 — EVENT BOOKINGS
      ══════════════════════════════════════════════════════════ */}
      <section id="bookings">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-display text-3xl font-bold text-gray-800">Event Bookings</h2>
            <p className="text-gray-500 mt-0.5">Tell us about your event — we'll make it unforgettable</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {EVENT_TYPES.map(({ label, icon: Icon, color, bg, border, path }) => (
            <Link key={label} to={path}
              className={`group ${bg} ${border} border-2 rounded-2xl p-5 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col items-center text-center`}>
              <div className={`w-14 h-14 bg-gradient-to-br ${color} rounded-2xl flex items-center justify-center mb-3 shadow-md group-hover:scale-110 transition-transform duration-300`}>
                <Icon className="w-7 h-7 text-white" />
              </div>
              <p className="font-semibold text-gray-800 text-sm leading-tight mb-2">{label}</p>
              <div className={`flex items-center gap-1 text-xs font-medium bg-gradient-to-r ${color} bg-clip-text text-transparent opacity-0 group-hover:opacity-100 transition-opacity`}>
                Book Now <ChevronRight className="w-3 h-3" />
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-6 bg-violet-50 border border-violet-200 rounded-2xl p-4 flex items-start gap-3">
          <div className="w-8 h-8 bg-violet-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <HelpCircle className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-semibold text-violet-800 text-sm">How it works</p>
            <p className="text-violet-600 text-xs mt-0.5">Select your event type → Fill in the details → Submit enquiry → Our team will contact you, confirm and plan your event.</p>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SECTION 2 — DELIVERY
      ══════════════════════════════════════════════════════════ */}
      <section id="delivery">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
            <ShoppingBag className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-display text-3xl font-bold text-gray-800">Deliver</h2>
            <p className="text-gray-500 mt-0.5">Order food or gifts</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">

          {/* Food Items */}
          <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-5 flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center flex-shrink-0">
                <span className="text-3xl">🍽️</span>
              </div>
              <div>
                <h3 className="font-display text-xl font-bold text-white">Food Items</h3>
                <p className="text-orange-100 text-sm mt-0.5">Snacks, cakes & beverages</p>
              </div>
            </div>
            <div className="px-6 py-5 flex-1">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Featured Items</p>
              <div className="space-y-3">
                {FOOD_HIGHLIGHTS.map(({ emoji, name, sub }) => (
                  <div key={name} className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 shadow-sm">
                    <span className="text-2xl">{emoji}</span>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{name}</p>
                      <p className="text-gray-400 text-xs">{sub}</p>
                    </div>
                  </div>
                ))}
                {/* <p className="text-xs text-gray-400 text-center mt-1">+ starters, mains, pizzas, burgers & more</p> */}
              </div>
            </div>
            <div className="px-6 pb-5">
              <Link to="/delivery/food"
                className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold py-3 rounded-xl hover:opacity-90 hover:shadow-md transition-all">
                <UtensilsCrossed className="w-4 h-4" /> Browse Food Items <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Gift Items */}
          <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-5 flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center flex-shrink-0">
                <span className="text-3xl">🎁</span>
              </div>
              <div>
                <h3 className="font-display text-xl font-bold text-white">Gift Items</h3>
                <p className="text-emerald-100 text-sm mt-0.5">Thoughtful gifts for every occasion</p>
              </div>
            </div>
            <div className="px-6 py-5 flex-1">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Categories</p>
              <div className="grid grid-cols-2 gap-2">
                {GIFT_HIGHLIGHTS.map(({ emoji, name, sub }) => (
                  <div key={name} className="flex items-start gap-2 bg-white rounded-xl px-3 py-2.5 shadow-sm">
                    <span className="text-xl flex-shrink-0">{emoji}</span>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-800 text-xs">{name}</p>
                      <p className="text-gray-400 text-xs truncate">{sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="px-6 pb-5">
              <Link to="/delivery/gifts"
                className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold py-3 rounded-xl hover:opacity-90 hover:shadow-md transition-all">
                <Gift className="w-4 h-4" /> Browse Gift Items <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-5 bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center gap-3">
          <span className="text-2xl">💵</span>
          <p className="text-blue-700 text-sm"><strong>Direct Payment</strong> — No online payment needed. On spot payment.</p>
        </div>
      </section>

      {/* Why Us */}
      <section className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
        <h2 className="font-display text-2xl font-bold text-gray-800 text-center mb-8">Why Choose Us?</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: '🎯', title: 'Tailored Events', desc: 'Every event planned to your exact needs' },
            { icon: '🚀', title: 'Sustainable', desc: 'Food & gifts' },
            { icon: '✅', title: 'Quality Assured', desc: 'Fresh ingredients, resonable gift selections' },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="text-center">
              <div className="text-4xl mb-3">{icon}</div>
              <h3 className="font-semibold text-gray-800 mb-1">{title}</h3>
              <p className="text-gray-400 text-sm">{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>

    <footer className="bg-gray-800 text-gray-400 text-center py-6 mt-8">
      <p className="text-sm">© 2026 Booking & Delivery @CUTM, PKD. Made with ❤️ for every celebration.</p>
    </footer>
  </div>
);

export default LandingPage;
