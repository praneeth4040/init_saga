const mongoose = require('mongoose');

const medicinePriceSchema = new mongoose.Schema({
  medicineName: {
    type: String,
    required: true,
    trim: true
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
    trim: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
medicinePriceSchema.index({ medicineName: 1, pharmacy: 1 }, { unique: true });

const MedicinePrice = mongoose.model('MedicinePrice', medicinePriceSchema);

module.exports = MedicinePrice; 