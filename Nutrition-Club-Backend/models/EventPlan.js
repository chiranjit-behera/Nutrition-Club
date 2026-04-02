const mongoose = require('mongoose');

const addonSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true, min: 0 }
}, { _id: false });

const eventPlanSchema = new mongoose.Schema({
  eventType: {
    type: String,
    required: true,
    enum: ['Birthday Event', 'Inauguration Event', 'Departmental Event', 'Corporate Event', 'Others']
  },
  tier: {
    type: String,
    required: true,
    enum: ['Only Access', 'Basic', 'Standard', 'Premium']
  },
  name:        { type: String, required: true, trim: true },
  price:       { type: Number, required: true, min: 0 },
  description: { type: String, default: '', maxlength: 300 },
  guestsMin:   { type: Number, required: true, min: 1 },
  guestsMax:   { type: Number, required: true },
  durationHours: { type: Number, required: true, min: 1 },
  features:    [{ type: String, trim: true }],
  addons:      [addonSchema],
  isActive:    { type: Boolean, default: true },
  sortOrder:   { type: Number, default: 0 }
}, { timestamps: true });

eventPlanSchema.index({ eventType: 1, tier: 1 }, { unique: true });

module.exports = mongoose.model('EventPlan', eventPlanSchema);
