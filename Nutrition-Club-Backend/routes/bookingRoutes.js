// // const express = require('express');
// // const router = express.Router();
// // const Booking = require('../models/Booking');
// // const { protect, superAdminOnly } = require('../middleware/auth');

// // // ⚠️ All specific/static routes BEFORE /:id to avoid param conflicts

// // // Check slot availability (public)
// // router.get('/availability', async (req, res) => {
// //   try {
// //     const { date } = req.query;
// //     if (!date) return res.status(400).json({ success: false, message: 'date query param required' });

// //     const start = new Date(date); start.setHours(0, 0, 0, 0);
// //     const end   = new Date(date); end.setHours(23, 59, 59, 999);

// //     // New, Contacted, and Confirmed bookings all block a slot
// //     // All active bookings on this date block a slot, regardless of event type
// //     const booked = await Booking.find({
// //       eventDate: { $gte: start, $lte: end },
// //       status: { $in: ['New', 'Contacted', 'Confirmed'] }
// //     }).select('eventTime');
// //     const blocked = [...new Set(booked.map(b => b.eventTime))];
// //     res.json({ success: true, data: { date, blocked } });
// //   } catch (err) {
// //     res.status(500).json({ success: false, message: err.message });
// //   }
// // });

// // // Stats (admin)
// // router.get('/stats/overview', protect, async (req, res) => {
// //   try {
// //     const total       = await Booking.countDocuments();
// //     const newBookings = await Booking.countDocuments({ status: 'New' });
// //     const confirmed   = await Booking.countDocuments({ status: 'Confirmed' });
// //     const completed   = await Booking.countDocuments({ status: 'Completed' });
// //     const byType      = await Booking.aggregate([{ $group: { _id: '$eventType', count: { $sum: 1 } } }]);
// //     res.json({ success: true, data: { total, newBookings, confirmed, completed, byType } });
// //   } catch (err) {
// //     res.status(500).json({ success: false, message: err.message });
// //   }
// // });

// // // BULK DELETE bookings — superadmin only — BEFORE /:id
// // router.delete('/bulk/delete', protect, superAdminOnly, async (req, res) => {
// //   try {
// //     const { bookingIds } = req.body;
// //     if (!bookingIds || bookingIds.length === 0)
// //       return res.status(400).json({ success: false, message: 'No booking IDs provided' });

// //     const result = await Booking.deleteMany({ _id: { $in: bookingIds } });
// //     res.json({ success: true, message: `${result.deletedCount} booking(s) deleted` });
// //   } catch (err) {
// //     res.status(500).json({ success: false, message: err.message });
// //   }
// // });

// // // Submit booking enquiry (public)
// // router.post('/', async (req, res) => {
// //   try {
// //     const { eventDate, eventTime } = req.body;

// //     // Enforce: event must be at least 2 days from today
// //     const today = new Date(); today.setHours(0, 0, 0, 0);
// //     const minDate = new Date(today); minDate.setDate(today.getDate() + 2);
// //     const requestedDate = new Date(eventDate); requestedDate.setHours(0, 0, 0, 0);
// //     if (requestedDate < minDate) {
// //       return res.status(400).json({
// //         success: false,
// //         message: 'Please book your event at least 2 days prior to the event date.'
// //       });
// //     }

// //     // Block duplicate bookings: same date + same slot (any active status)
// //     const start = new Date(eventDate); start.setHours(0, 0, 0, 0);
// //     const end   = new Date(eventDate); end.setHours(23, 59, 59, 999);
// //     const conflict = await Booking.findOne({
// //       eventDate: { $gte: start, $lte: end },
// //       eventTime,
// //       status: { $in: ['New', 'Contacted', 'Confirmed'] }
// //     });
// //     if (conflict) {
// //       return res.status(409).json({
// //         success: false,
// //         message: `The ${eventTime} slot on this date is already booked. Please choose another slot or date.`
// //       });
// //     }

// //     const booking = new Booking(req.body);
// //     await booking.save();
// //     res.status(201).json({ success: true, data: booking, message: 'Booking enquiry submitted successfully!' });
// //   } catch (err) {
// //     res.status(400).json({ success: false, message: err.message });
// //   }
// // });

// // // Get all bookings (admin)
// // router.get('/', protect, async (req, res) => {
// //   try {
// //     const { status, eventType, page = 1, limit = 20 } = req.query;
// //     const query = {};
// //     if (status && status !== 'All') query.status = status;
// //     if (eventType && eventType !== 'All') query.eventType = eventType;
// //     const total = await Booking.countDocuments(query);
// //     const bookings = await Booking.find(query)
// //       .sort({ createdAt: -1 })
// //       .skip((page - 1) * limit)
// //       .limit(Number(limit));
// //     res.json({ success: true, data: bookings, pagination: { total, page: Number(page), pages: Math.ceil(total / limit) } });
// //   } catch (err) {
// //     res.status(500).json({ success: false, message: err.message });
// //   }
// // });

// // // Get single booking (admin)
// // router.get('/:id', protect, async (req, res) => {
// //   try {
// //     const booking = await Booking.findById(req.params.id);
// //     if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
// //     res.json({ success: true, data: booking });
// //   } catch (err) {
// //     res.status(500).json({ success: false, message: err.message });
// //   }
// // });

// // // Update booking status + admin notes (admin)
// // router.put('/:id', protect, async (req, res) => {
// //   try {
// //     const { status, adminNotes } = req.body;
// //     const booking = await Booking.findByIdAndUpdate(
// //       req.params.id,
// //       { ...(status && { status }), ...(adminNotes !== undefined && { adminNotes }) },
// //       { new: true, runValidators: true }
// //     );
// //     if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
// //     res.json({ success: true, data: booking, message: 'Booking updated' });
// //   } catch (err) {
// //     res.status(400).json({ success: false, message: err.message });
// //   }
// // });

// // // DELETE single booking — superadmin only
// // router.delete('/:id', protect, superAdminOnly, async (req, res) => {
// //   try {
// //     const booking = await Booking.findByIdAndDelete(req.params.id);
// //     if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
// //     res.json({ success: true, message: `Booking ${booking.bookingNumber} deleted` });
// //   } catch (err) {
// //     res.status(500).json({ success: false, message: err.message });
// //   }
// // });

// // module.exports = router;











// const express = require('express');
// const router = express.Router();
// const Booking = require('../models/Booking');
// const { protect, superAdminOnly } = require('../middleware/auth');

// // ── Slot overlap map ──────────────────────────────────────────────────────────
// // Birthday slots (2hr): '2 PM – 4 PM', '5 PM – 7 PM'
// // Standard slots (3hr): '10 AM – 1 PM', '2 PM – 5 PM', '6 PM – 9 PM'
// //
// // Overlap logic (start/end times, non-inclusive end):
// //   2 PM–4 PM  (14:00–16:00) overlaps  2 PM–5 PM  (14:00–17:00)  ✓
// //   2 PM–4 PM  (14:00–16:00) vs        5 PM–7 PM  (17:00–19:00)  ✗ no overlap
// //   2 PM–5 PM  (14:00–17:00) vs        5 PM–7 PM  (17:00–19:00)  ✗ back-to-back only
// //   5 PM–7 PM  (17:00–19:00) overlaps  6 PM–9 PM  (18:00–21:00)  ✓
// //   10 AM–1 PM (10:00–13:00) — no birthday overlap
// const SLOT_OVERLAPS = {
//   '2 PM – 4 PM':  ['2 PM – 4 PM',  '2 PM – 5 PM'],
//   '5 PM – 7 PM':  ['5 PM – 7 PM',  '6 PM – 9 PM'],
//   '10 AM – 1 PM': ['10 AM – 1 PM'],
//   '2 PM – 5 PM':  ['2 PM – 5 PM',  '2 PM – 4 PM'],
//   '6 PM – 9 PM':  ['6 PM – 9 PM',  '5 PM – 7 PM'],
// };

// // Given a list of booked slot strings, return all slots that are blocked
// // (including overlapping ones from the other duration group)
// function expandBlocked(bookedSlots) {
//   const blocked = new Set();
//   for (const slot of bookedSlots) {
//     const overlaps = SLOT_OVERLAPS[slot] || [slot];
//     overlaps.forEach(s => blocked.add(s));
//   }
//   return [...blocked];
// }


// // ⚠️ All specific/static routes BEFORE /:id to avoid param conflicts

// // Check slot availability (public)
// router.get('/availability', async (req, res) => {
//   try {
//     const { date } = req.query;
//     if (!date) return res.status(400).json({ success: false, message: 'date query param required' });

//     const start = new Date(date); start.setHours(0, 0, 0, 0);
//     const end   = new Date(date); end.setHours(23, 59, 59, 999);

//     // New, Contacted, and Confirmed bookings all block a slot
//     // All active bookings on this date block a slot, regardless of event type
//     const booked = await Booking.find({
//       eventDate: { $gte: start, $lte: end },
//       status: { $in: ['New', 'Contacted', 'Confirmed'] }
//     }).select('eventTime');
//     const bookedSlots = [...new Set(booked.map(b => b.eventTime))];
//     const blocked = expandBlocked(bookedSlots);
//     res.json({ success: true, data: { date, blocked } });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // Stats (admin)
// router.get('/stats/overview', protect, async (req, res) => {
//   try {
//     const total       = await Booking.countDocuments();
//     const newBookings = await Booking.countDocuments({ status: 'New' });
//     const confirmed   = await Booking.countDocuments({ status: 'Confirmed' });
//     const completed   = await Booking.countDocuments({ status: 'Completed' });
//     const byType      = await Booking.aggregate([{ $group: { _id: '$eventType', count: { $sum: 1 } } }]);
//     res.json({ success: true, data: { total, newBookings, confirmed, completed, byType } });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // BULK DELETE bookings — superadmin only — BEFORE /:id
// router.delete('/bulk/delete', protect, superAdminOnly, async (req, res) => {
//   try {
//     const { bookingIds } = req.body;
//     if (!bookingIds || bookingIds.length === 0)
//       return res.status(400).json({ success: false, message: 'No booking IDs provided' });

//     const result = await Booking.deleteMany({ _id: { $in: bookingIds } });
//     res.json({ success: true, message: `${result.deletedCount} booking(s) deleted` });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // Submit booking enquiry (public)
// router.post('/', async (req, res) => {
//   try {
//     const { eventDate, eventTime } = req.body;

//     // Enforce: event must be at least 2 days from today
//     const today = new Date(); today.setHours(0, 0, 0, 0);
//     const minDate = new Date(today); minDate.setDate(today.getDate() + 2);
//     const requestedDate = new Date(eventDate); requestedDate.setHours(0, 0, 0, 0);
//     if (requestedDate < minDate) {
//       return res.status(400).json({
//         success: false,
//         message: 'Please book your event at least 2 days prior to the event date.'
//       });
//     }

//     // Block duplicate bookings: same date + same slot (any active status)
//     const start = new Date(eventDate); start.setHours(0, 0, 0, 0);
//     const end   = new Date(eventDate); end.setHours(23, 59, 59, 999);
//     // Check for conflicts including overlapping slots from the other duration group
//     const overlappingSlots = SLOT_OVERLAPS[eventTime] || [eventTime];
//     const conflict = await Booking.findOne({
//       eventDate: { $gte: start, $lte: end },
//       eventTime: { $in: overlappingSlots },
//       status: { $in: ['New', 'Contacted', 'Confirmed'] }
//     });
//     if (conflict) {
//       return res.status(409).json({
//         success: false,
//         message: `The ${eventTime} slot on this date is already booked. Please choose another slot or date.`
//       });
//     }

//     const booking = new Booking(req.body);
//     await booking.save();
//     res.status(201).json({ success: true, data: booking, message: 'Booking enquiry submitted successfully!' });
//   } catch (err) {
//     res.status(400).json({ success: false, message: err.message });
//   }
// });

// // Get all bookings (admin)
// router.get('/', protect, async (req, res) => {
//   try {
//     const { status, eventType, page = 1, limit = 20 } = req.query;
//     const query = {};
//     if (status && status !== 'All') query.status = status;
//     if (eventType && eventType !== 'All') query.eventType = eventType;
//     const total = await Booking.countDocuments(query);
//     const bookings = await Booking.find(query)
//       .sort({ createdAt: -1 })
//       .skip((page - 1) * limit)
//       .limit(Number(limit));
//     res.json({ success: true, data: bookings, pagination: { total, page: Number(page), pages: Math.ceil(total / limit) } });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // Get single booking (admin)
// router.get('/:id', protect, async (req, res) => {
//   try {
//     const booking = await Booking.findById(req.params.id);
//     if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
//     res.json({ success: true, data: booking });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // Update booking status + admin notes (admin)
// router.put('/:id', protect, async (req, res) => {
//   try {
//     const { status, adminNotes } = req.body;
//     const booking = await Booking.findByIdAndUpdate(
//       req.params.id,
//       { ...(status && { status }), ...(adminNotes !== undefined && { adminNotes }) },
//       { new: true, runValidators: true }
//     );
//     if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
//     res.json({ success: true, data: booking, message: 'Booking updated' });
//   } catch (err) {
//     res.status(400).json({ success: false, message: err.message });
//   }
// });

// // DELETE single booking — superadmin only
// router.delete('/:id', protect, superAdminOnly, async (req, res) => {
//   try {
//     const booking = await Booking.findByIdAndDelete(req.params.id);
//     if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
//     res.json({ success: true, message: `Booking ${booking.bookingNumber} deleted` });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// module.exports = router;





const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const { protect, superAdminOnly } = require('../middleware/auth');

// ── Slot overlap map ──────────────────────────────────────────────────────────
// Birthday slots (2hr): '2 PM – 4 PM', '5 PM – 7 PM'
// Standard slots (3hr): '10 AM – 1 PM', '2 PM – 5 PM', '6 PM – 9 PM'
//
// Overlap logic (start/end times, non-inclusive end):
//   2 PM–4 PM  (14:00–16:00) overlaps  2 PM–5 PM  (14:00–17:00)  ✓
//   2 PM–4 PM  (14:00–16:00) vs        5 PM–7 PM  (17:00–19:00)  ✗ no overlap
//   2 PM–5 PM  (14:00–17:00) vs        5 PM–7 PM  (17:00–19:00)  ✗ back-to-back only
//   5 PM–7 PM  (17:00–19:00) overlaps  6 PM–9 PM  (18:00–21:00)  ✓
//   10 AM–1 PM (10:00–13:00) — no birthday overlap
const SLOT_OVERLAPS = {
  '2 PM – 4 PM':  ['2 PM – 4 PM',  '2 PM – 5 PM'],
  '5 PM – 7 PM':  ['5 PM – 7 PM',  '6 PM – 9 PM'],
  '10 AM – 1 PM': ['10 AM – 1 PM'],
  '2 PM – 5 PM':  ['2 PM – 5 PM',  '2 PM – 4 PM'],
  '6 PM – 9 PM':  ['6 PM – 9 PM',  '5 PM – 7 PM'],
};

// Given a list of booked slot strings, return all slots that are blocked
// (including overlapping ones from the other duration group)
function expandBlocked(bookedSlots) {
  const blocked = new Set();
  for (const slot of bookedSlots) {
    const overlaps = SLOT_OVERLAPS[slot] || [slot];
    overlaps.forEach(s => blocked.add(s));
  }
  return [...blocked];
}


// ⚠️ All specific/static routes BEFORE /:id to avoid param conflicts

// Check slot availability (public)
router.get('/availability', async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ success: false, message: 'date query param required' });

    const start = new Date(date); start.setHours(0, 0, 0, 0);
    const end   = new Date(date); end.setHours(23, 59, 59, 999);

    // New, Contacted, and Confirmed bookings all block a slot
    // All active bookings on this date block a slot, regardless of event type
    const booked = await Booking.find({
      eventDate: { $gte: start, $lte: end },
      status: { $in: ['New', 'Contacted', 'Confirmed'] }
    }).select('eventTime');
    const bookedSlots = [...new Set(booked.map(b => b.eventTime))];
    const blocked = expandBlocked(bookedSlots);
    res.json({ success: true, data: { date, blocked } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Stats (admin)
router.get('/stats/overview', protect, async (req, res) => {
  try {
    const total       = await Booking.countDocuments();
    const newBookings = await Booking.countDocuments({ status: 'New' });
    const confirmed   = await Booking.countDocuments({ status: 'Confirmed' });
    const completed   = await Booking.countDocuments({ status: 'Completed' });
    const byType      = await Booking.aggregate([{ $group: { _id: '$eventType', count: { $sum: 1 } } }]);

    // Revenue: sum planPrice for Confirmed + Completed bookings
    const revenueResult = await Booking.aggregate([
      { $match: { status: { $nin: ['Cancelled'] }, planPrice: { $gt: 0 } } },
      { $group: { _id: null, total: { $sum: '$planPrice' } } }
    ]);
    const bookingRevenue = revenueResult[0]?.total || 0;

    res.json({ success: true, data: { total, newBookings, confirmed, completed, byType, bookingRevenue } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// BULK DELETE bookings — superadmin only — BEFORE /:id
router.delete('/bulk/delete', protect, superAdminOnly, async (req, res) => {
  try {
    const { bookingIds } = req.body;
    if (!bookingIds || bookingIds.length === 0)
      return res.status(400).json({ success: false, message: 'No booking IDs provided' });

    const result = await Booking.deleteMany({ _id: { $in: bookingIds } });
    res.json({ success: true, message: `${result.deletedCount} booking(s) deleted` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Submit booking enquiry (public)
router.post('/', async (req, res) => {
  try {
    const { eventDate, eventTime } = req.body;

    // Enforce: event must be at least 2 days from today
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const minDate = new Date(today); minDate.setDate(today.getDate() + 2);
    const requestedDate = new Date(eventDate); requestedDate.setHours(0, 0, 0, 0);
    if (requestedDate < minDate) {
      return res.status(400).json({
        success: false,
        message: 'Please book your event at least 2 days prior to the event date.'
      });
    }

    // Block duplicate bookings: same date + same slot (any active status)
    const start = new Date(eventDate); start.setHours(0, 0, 0, 0);
    const end   = new Date(eventDate); end.setHours(23, 59, 59, 999);
    // Check for conflicts including overlapping slots from the other duration group
    const overlappingSlots = SLOT_OVERLAPS[eventTime] || [eventTime];
    const conflict = await Booking.findOne({
      eventDate: { $gte: start, $lte: end },
      eventTime: { $in: overlappingSlots },
      status: { $in: ['New', 'Contacted', 'Confirmed'] }
    });
    if (conflict) {
      return res.status(409).json({
        success: false,
        message: `The ${eventTime} slot on this date is already booked. Please choose another slot or date.`
      });
    }

    const booking = new Booking(req.body);
    await booking.save();
    res.status(201).json({ success: true, data: booking, message: 'Booking enquiry submitted successfully!' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Get all bookings (admin)
router.get('/', protect, async (req, res) => {
  try {
    const { status, eventType, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status && status !== 'All') query.status = status;
    if (eventType && eventType !== 'All') query.eventType = eventType;
    const total = await Booking.countDocuments(query);
    const bookings = await Booking.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ success: true, data: bookings, pagination: { total, page: Number(page), pages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get single booking (admin)
router.get('/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    res.json({ success: true, data: booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update booking status + admin notes (admin)
router.put('/:id', protect, async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { ...(status && { status }), ...(adminNotes !== undefined && { adminNotes }) },
      { new: true, runValidators: true }
    );
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    res.json({ success: true, data: booking, message: 'Booking updated' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE single booking — superadmin only
router.delete('/:id', protect, superAdminOnly, async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    res.json({ success: true, message: `Booking ${booking.bookingNumber} deleted` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
