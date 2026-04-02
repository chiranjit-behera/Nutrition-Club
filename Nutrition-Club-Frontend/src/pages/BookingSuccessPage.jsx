import React from 'react';
import { Link, useLocation, Navigate } from 'react-router-dom';
import { CheckCircle, Calendar, Clock, Users, MapPin, Phone, Mail, IndianRupee, Home } from 'lucide-react';
import Navbar from '../components/Navbar';

const BookingSuccessPage = () => {
  const location = useLocation();
  const booking = location.state?.booking;
  if (!booking) return <Navigate to="/" replace />;

  const eventDate = new Date(booking.eventDate).toLocaleDateString('en-IN', { dateStyle: 'long' });

  return (
    <div className="min-h-screen bg-orange-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-12">

        {/* Success */}
        <div className="text-center mb-8 animate-bounce-in">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <CheckCircle className="w-14 h-14 text-green-500" />
          </div>
          <h1 className="font-display text-3xl font-bold text-gray-800 mb-2">Enquiry Submitted! 🎉</h1>
          <p className="text-gray-500 text-lg">We'll contact you <strong>shortly</strong> to confirm your event.</p>
        </div>

        {/* Booking Card */}
        <div className="card p-6 mb-5 animate-slide-up">
          <div className="flex items-center justify-between pb-4 border-b border-orange-100 mb-5">
            <div>
              <p className="text-sm text-gray-400 mb-1">Booking Reference</p>
              <p className="font-bold text-orange-600 text-xl">{booking.bookingNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400 mb-1">Status</p>
              <span className="badge bg-blue-100 text-blue-700 px-3 py-1">New Enquiry</span>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 mb-5">
            <div className="bg-orange-50 rounded-xl p-4">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-2">Event Info</p>
              <p className="font-semibold text-gray-800 mb-2">{booking.eventType}</p>
              <div className="space-y-1.5 text-sm text-gray-600">
                <p className="flex items-center gap-2"><Calendar className="w-4 h-4 text-orange-400" />{eventDate}</p>
                <p className="flex items-center gap-2"><Clock className="w-4 h-4 text-orange-400" />{booking.eventTime}</p>
                <p className="flex items-center gap-2"><Users className="w-4 h-4 text-orange-400" />{booking.numberOfGuests} Guests</p>
                {/* <p className="flex items-center gap-2"><IndianRupee className="w-4 h-4 text-orange-400" />{booking.budgetRange}</p> */}
              </div>
            </div>

            <div className="bg-orange-50 rounded-xl p-4">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-2">Contact Info</p>
              <div className="space-y-1.5 text-sm text-gray-600">
                <p className="font-semibold text-gray-800">{booking.customer.name}</p>
                <p className="flex items-center gap-2"><Phone className="w-4 h-4 text-orange-400" />{booking.customer.phone}</p>
                {booking.customer.email && <p className="flex items-center gap-2"><Mail className="w-4 h-4 text-orange-400" />{booking.customer.email}</p>}
                <p className="flex items-start gap-2"><MapPin className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" /><span className="line-clamp-2">{booking.venue}</span></p>
              </div>
            </div>
          </div>

          {booking.specialRequirements && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-sm text-yellow-800">
              <span className="font-medium">Special Requirements:</span> {booking.specialRequirements}
            </div>
          )}
        </div>

        {/* Next Steps */}
        {/* <div className="card p-5 mb-6 animate-slide-up">
          <h3 className="font-semibold text-gray-800 mb-3">What happens next?</h3>
          <div className="space-y-3">
            {[
              { step: '1', text: 'Our team reviews your enquiry', color: 'bg-orange-500' },
              { step: '2', text: 'We call you within 24 hours to discuss details', color: 'bg-orange-400' },
              { step: '3', text: 'Finalize menu, venue setup and confirm booking', color: 'bg-orange-300' },
            ].map(({ step, text, color }) => (
              <div key={step} className="flex items-center gap-3">
                <div className={`w-7 h-7 ${color} rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>{step}</div>
                <p className="text-gray-600 text-sm">{text}</p>
              </div>
            ))}
          </div>
        </div> */}

        <div className="text-center">
          <Link to="/" className="btn-primary inline-flex items-center gap-2 px-8 py-3">
            <Home className="w-5 h-5" /> Back to Home
          </Link>
          <p className="text-gray-400 text-sm mt-4">Questions? Call <span className="text-orange-500 font-medium">+91 8093351822</span></p>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccessPage;
