const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  description: { type: String, required: true, maxlength: 500 },
  price: { type: Number, required: true, min: 0 },
  catalogType: {
    type: String,
    enum: ['Food', 'Gift'],
    required: true,
    default: 'Food'
  },
  category: {
    type: String,
    required: true,
    enum: [
      // Food categories
      'Cakes',
      // Gift categories
      'Show Piece', 'Photo Frame', 'Decorative lights', 'Wall paint photo', 'Soft toys'
    ],
    default: 'Main Course'
  },
  image: { type: String, default: '' },
  stock: { type: Number, required: true, min: 0, default: 100 },
  isAvailable: { type: Boolean, default: true },
  isVeg: { type: Boolean, default: true },
  rating: { type: Number, default: 4.0, min: 0, max: 5 }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
