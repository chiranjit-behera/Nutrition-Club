// const mongoose = require('mongoose');

// const BIRTHDAY_SLOTS = ['2 PM – 4 PM', '5 PM – 7 PM'];
// const STANDARD_SLOTS = ['10 AM – 1 PM', '2 PM – 5 PM', '6 PM – 9 PM'];
// const ALL_TIME_SLOTS  = [...BIRTHDAY_SLOTS, ...STANDARD_SLOTS];

// const bookingSchema = new mongoose.Schema({
//   bookingNumber: { type: String, unique: true },
//   eventType: {
//     type: String,
//     required: true,
//     enum: ['Birthday Event', 'Inauguration Event', 'Departmental Event', 'Corporate Event', 'Others']
//   },
//   planTier: {
//     type: String,
//     required: true,
//     enum: ['Only Access', 'Basic', 'Standard', 'Premium']
//   },
//   planName: { type: String, default: '' },
//   customer: {
//     name:  { type: String, required: true, trim: true },
//     phone: { type: String, required: true, match: [/^[0-9]{10,15}$/, 'Invalid phone'] },
//     email: { type: String, trim: true, lowercase: true }
//   },
//   eventDate:      { type: Date,   required: true },
//   eventTime:      { type: String, required: true, enum: ALL_TIME_SLOTS },
//   numberOfGuests: { type: Number, required: true, min: 1 },
//   venue:          { type: String, required: true, trim: true },
//   specialRequirements: { type: String, trim: true, default: '' },
//   status: {
//     type: String,
//     enum: ['New', 'Contacted', 'Confirmed', 'Completed', 'Cancelled'],
//     default: 'New'
//   },
//   adminNotes: { type: String, default: '' }
// }, { timestamps: true });

// bookingSchema.pre('save', async function (next) {
//   if (this.isNew) {
//     const count = await mongoose.model('Booking').countDocuments();
//     this.bookingNumber = `BKG-${Date.now().toString().slice(-6)}-${(count + 1).toString().padStart(4, '0')}`;
//   }
//   next();
// });

// module.exports = mongoose.model('Booking', bookingSchema);
// module.exports.BIRTHDAY_SLOTS  = BIRTHDAY_SLOTS;
// module.exports.STANDARD_SLOTS  = STANDARD_SLOTS;
// module.exports.ALL_TIME_SLOTS  = ALL_TIME_SLOTS;





const mongoose = require('mongoose');

const BIRTHDAY_SLOTS = ['2 PM – 4 PM', '5 PM – 7 PM'];
const STANDARD_SLOTS = ['10 AM – 1 PM', '2 PM – 5 PM', '6 PM – 9 PM'];
const ALL_TIME_SLOTS  = [...BIRTHDAY_SLOTS, ...STANDARD_SLOTS];

const bookingSchema = new mongoose.Schema({
  bookingNumber: { type: String, unique: true },
  eventType: {
    type: String,
    required: true,
    enum: ['Birthday Event', 'Inauguration Event', 'Departmental Event', 'Corporate Event', 'Others']
  },
  planTier: {
    type: String,
    required: true,
    enum: ['Only Access', 'Basic', 'Standard', 'Premium']
  },
  planName:  { type: String, default: '' },
  planPrice: { type: Number, default: 0 },
  customer: {
    name:  { type: String, required: true, trim: true },
    phone: { type: String, required: true, match: [/^[0-9]{10,15}$/, 'Invalid phone'] },
    email: { type: String, trim: true, lowercase: true }
  },
  eventDate:      { type: Date,   required: true },
  eventTime:      { type: String, required: true, enum: ALL_TIME_SLOTS },
  numberOfGuests: { type: Number, required: true, min: 1 },
  venue:          { type: String, required: true, trim: true },
  specialRequirements: { type: String, trim: true, default: '' },
  status: {
    type: String,
    enum: ['New', 'Contacted', 'Confirmed', 'Completed', 'Cancelled'],
    default: 'New'
  },
  adminNotes: { type: String, default: '' }
}, { timestamps: true });

bookingSchema.pre('save', async function (next) {
  if (this.isNew) {
    const count = await mongoose.model('Booking').countDocuments();
    this.bookingNumber = `BKG-${Date.now().toString().slice(-6)}-${(count + 1).toString().padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);
module.exports.BIRTHDAY_SLOTS  = BIRTHDAY_SLOTS;
module.exports.STANDARD_SLOTS  = STANDARD_SLOTS;
module.exports.ALL_TIME_SLOTS  = ALL_TIME_SLOTS;
