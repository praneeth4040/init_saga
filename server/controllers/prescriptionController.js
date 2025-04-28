const Prescription = require('../models/Prescription');
const { cloudinary } = require('../config/cloudinary');

// Create a new prescription
exports.createPrescription = async (req, res) => {
  try {
    const {
      tabletNames,
      description,
      instructions,
      dosage,
      medicationSchedule,
      startDate,
      endDate
    } = req.body;

    // Parse tabletNames if it's a string
    const parsedTabletNames = typeof tabletNames === 'string' 
      ? JSON.parse(tabletNames) 
      : tabletNames;

    const prescription = new Prescription({
      user: req.user._id,
      tabletNames: parsedTabletNames,
      description,
      instructions,
      dosage,
      medicationSchedule,
      startDate,
      endDate
    });

    // If there's an uploaded file, add it to the prescription
    if (req.file) {
      prescription.prescriptionImage = {
        url: req.file.path,
        publicId: req.file.filename
      };
    }

    await prescription.save();

    res.status(201).json({
      message: 'Prescription created successfully',
      prescription
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error creating prescription',
      error: error.message
    });
  }
};

// Get all prescriptions for a user
exports.getUserPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ user: req.user._id })
      .sort({ createdAt: -1 });

    res.json(prescriptions);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching prescriptions',
      error: error.message
    });
  }
};

// Get a single prescription
exports.getPrescription = async (req, res) => {
  try {
    // Validate MongoDB ObjectId format
    const objectIdPattern = /^[0-9a-fA-F]{24}$/;
    if (!objectIdPattern.test(req.params.id)) {
      return res.status(400).json({ 
        message: 'Invalid prescription ID format',
        error: 'The prescription ID must be a valid MongoDB ObjectId'
      });
    }

    const prescription = await Prescription.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!prescription) {
      return res.status(404).json({ 
        message: 'Prescription not found',
        error: 'No prescription found with the provided ID'
      });
    }

    res.json(prescription);
  } catch (error) {
    console.error('Error in getPrescription:', error);
    res.status(500).json({
      message: 'Error fetching prescription',
      error: error.message
    });
  }
};

// Update a prescription
exports.updatePrescription = async (req, res) => {
  try {
    const {
      tabletNames,
      description,
      instructions,
      dosage,
      medicationSchedule,
      startDate,
      endDate,
      isActive
    } = req.body;

    // Parse tabletNames if it's a string
    const parsedTabletNames = typeof tabletNames === 'string' 
      ? JSON.parse(tabletNames) 
      : tabletNames;

    const updateData = {
      tabletNames: parsedTabletNames,
      description,
      instructions,
      dosage,
      medicationSchedule,
      startDate,
      endDate,
      isActive
    };

    // If there's a new file uploaded, delete the old one and update with new
    if (req.file) {
      const prescription = await Prescription.findById(req.params.id);
      if (prescription.prescriptionImage?.publicId) {
        await cloudinary.uploader.destroy(prescription.prescriptionImage.publicId);
      }
      updateData.prescriptionImage = {
        url: req.file.path,
        publicId: req.file.filename
      };
    }

    const prescription = await Prescription.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      updateData,
      { new: true, runValidators: true }
    );

    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    res.json({
      message: 'Prescription updated successfully',
      prescription
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error updating prescription',
      error: error.message
    });
  }
};

// Delete a prescription
exports.deletePrescription = async (req, res) => {
  try {
    const prescription = await Prescription.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    // Delete the image from Cloudinary if it exists
    if (prescription.prescriptionImage?.publicId) {
      await cloudinary.uploader.destroy(prescription.prescriptionImage.publicId);
    }

    await prescription.deleteOne();

    res.json({ message: 'Prescription deleted successfully' });
  } catch (error) {
    res.status(500).json({
      message: 'Error deleting prescription',
      error: error.message
    });
  }
}; 