const Pharmacy = require('../models/Pharmacy');
const Medicine = require('../models/Medicine');
const Price = require('../models/Price');

// Helper function to calculate distance between two points
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return distance;
};

const deg2rad = (deg) => {
  return deg * (Math.PI / 180);
};

exports.comparePrices = async (req, res) => {
  try {
    const { medicineName } = req.params;
    const { maxDistance, lat, lng } = req.query;

    // Find the medicine
    const medicine = await Medicine.findOne({
      name: { $regex: new RegExp(medicineName, 'i') }
    });

    if (!medicine) {
      return res.status(404).json({
        message: 'Medicine not found'
      });
    }

    // Find all pharmacies within the specified distance
    const pharmacies = await Pharmacy.find({});
    const nearbyPharmacies = pharmacies.filter(pharmacy => {
      const distance = calculateDistance(
        parseFloat(lat),
        parseFloat(lng),
        pharmacy.location.coordinates[1], // latitude
        pharmacy.location.coordinates[0]  // longitude
      );
      return distance <= (parseFloat(maxDistance) / 1000); // Convert meters to km
    });

    // Get prices for the medicine from nearby pharmacies
    const prices = await Price.find({
      medicine: medicine._id,
      pharmacy: { $in: nearbyPharmacies.map(p => p._id) }
    })
    .populate('pharmacy')
    .sort({ price: 1 }); // Sort by price ascending

    // Find the lowest price
    const lowestPrice = prices.length > 0 ? prices[0] : null;

    res.json({
      prices: prices.map(price => ({
        _id: price._id,
        price: price.price,
        unit: price.unit,
        lastUpdated: price.lastUpdated,
        pharmacy: {
          _id: price.pharmacy._id,
          name: price.pharmacy.name,
          address: price.pharmacy.address,
          phone: price.pharmacy.phone
        }
      })),
      lowestPrice: lowestPrice ? {
        price: lowestPrice.price,
        unit: lowestPrice.unit,
        pharmacy: {
          name: lowestPrice.pharmacy.name,
          address: lowestPrice.pharmacy.address
        }
      } : null
    });
  } catch (error) {
    console.error('Error comparing prices:', error);
    res.status(500).json({
      message: 'Error comparing prices',
      error: error.message
    });
  }
}; 