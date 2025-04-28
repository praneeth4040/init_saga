const express = require('express');
const router = express.Router();
const prescriptionController = require('../controllers/prescriptionController');
const auth = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

// All routes are protected with authentication
router.use(auth);

// Create a new prescription with image upload
router.post('/', upload.single('prescriptionImage'), prescriptionController.createPrescription);

// Get all prescriptions for the logged-in user
router.get('/', prescriptionController.getUserPrescriptions);

// Get a single prescription
router.get('/:id', prescriptionController.getPrescription);

// Update a prescription with image upload
router.put('/:id', upload.single('prescriptionImage'), prescriptionController.updatePrescription);

// Delete a prescription
router.delete('/:id', prescriptionController.deletePrescription);

module.exports = router; 