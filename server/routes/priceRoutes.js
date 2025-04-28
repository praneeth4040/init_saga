const express = require('express');
const router = express.Router();
const MedicinePrice = require('../models/MedicinePrice');
const Pharmacy = require('../models/Pharmacy');
const auth = require('../middleware/auth');

// Get price comparison for a medicine
router.get('/compare/:medicineName', auth, async (req, res) => {
  try {
    const { medicineName } = req.params;
    const { maxDistance = 10000 } = req.query; // Default 10km radius

    // Get user's location from request (you'll need to implement this)
    const userLocation = req.user.location || { type: 'Point', coordinates: [0, 0] };

    // Find nearby pharmacies
    const nearbyPharmacies = await Pharmacy.find({
      location: {
        $near: {
          $geometry: userLocation,
          $maxDistance: maxDistance
        }
      }
    });

    // Get prices for the medicine from nearby pharmacies
    const prices = await MedicinePrice.find({
      medicineName: { $regex: new RegExp(medicineName, 'i') },
      pharmacy: { $in: nearbyPharmacies.map(p => p._id) }
    }).populate('pharmacy', 'name address phone');

    if (prices.length === 0) {
      return res.status(404).json({
        message: 'No prices found for this medicine in nearby pharmacies'
      });
    }

    // Find the lowest price
    const lowestPrice = prices.reduce((min, current) => 
      current.price < min.price ? current : min
    );

    res.json({
      medicineName,
      prices,
      lowestPrice,
      totalPharmacies: prices.length
    });
  } catch (error) {
    console.error('Error comparing prices:', error);
    res.status(500).json({
      message: 'Error comparing prices',
      error: error.message
    });
  }
});

// Add or update medicine price (for pharmacy owners)
router.post('/update', auth, async (req, res) => {
  try {
    const { medicineName, price, unit, pharmacyId } = req.body;

    // Check if user owns the pharmacy (you'll need to implement this)
    const pharmacy = await Pharmacy.findById(pharmacyId);
    if (!pharmacy) {
      return res.status(404).json({ message: 'Pharmacy not found' });
    }

    // Update or create price
    const medicinePrice = await MedicinePrice.findOneAndUpdate(
      { medicineName, pharmacy: pharmacyId },
      { price, unit, lastUpdated: new Date() },
      { upsert: true, new: true }
    );

    res.json({
      message: 'Price updated successfully',
      medicinePrice
    });
  } catch (error) {
    console.error('Error updating price:', error);
    res.status(500).json({
      message: 'Error updating price',
      error: error.message
    });
  }
});

module.exports = router; 