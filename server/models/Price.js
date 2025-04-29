const mongoose = require('mongoose');

const priceSchema = new mongoose.Schema({
  medicine: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Medicine',
    required: true
  },
  pharmacy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pharmacy',
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  unit: {
    type: String,
    required: true,
    enum: ['tablet', 'capsule', 'ml', 'mg', 'g', 'piece'],
    default: 'piece'
  },
  stock: {
    type: Number,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

// Create compound index for medicine and pharmacy
priceSchema.index({ medicine: 1, pharmacy: 1 }, { unique: true });

module.exports = mongoose.model('Price', priceSchema);

 