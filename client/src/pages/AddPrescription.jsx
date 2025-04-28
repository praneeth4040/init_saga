import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaTimes } from 'react-icons/fa';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './AddPrescription.css';

const AddPrescription = () => {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [medicineInput, setMedicineInput] = useState('');
  const [medicineNames, setMedicineNames] = useState([]);
  const [formData, setFormData] = useState({
    dosage: '',
    instruction: '',
    medicationSchedule: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    notes: '',
    image: null
  });
  const [loading, setLoading] = useState(false);

  const instructionOptions = [
    'Before eating',
    'After eating',
    'Early morning',
    'Before bed',
    'With food',
    'On empty stomach',
    'As needed'
  ];

  const scheduleOptions = [
    { value: 'hourly', label: 'Once every hour' },
    { value: '2hours', label: 'Once every 2 hours' },
    { value: '3hours', label: 'Once every 3 hours' },
    { value: '4hours', label: 'Once every 4 hours' },
    { value: '6hours', label: 'Once every 6 hours' },
    { value: '8hours', label: 'Once every 8 hours' },
    { value: '12hours', label: 'Once every 12 hours' },
    { value: 'daily', label: 'Once daily' },
    { value: 'twicedaily', label: 'Twice daily' },
    { value: 'thricedaily', label: 'Three times daily' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMedicineInputChange = (e) => {
    setMedicineInput(e.target.value);
  };

  const handleMedicineInputKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const trimmedValue = medicineInput.trim();
      if (trimmedValue && !medicineNames.includes(trimmedValue)) {
        setMedicineNames([...medicineNames, trimmedValue]);
        setMedicineInput('');
        toast.success(`${trimmedValue} added to prescription`);
      } else if (medicineNames.includes(trimmedValue)) {
        toast.warning(`${trimmedValue} is already added`);
      }
    }
  };

  const removeMedicine = (index) => {
    const removedMedicine = medicineNames[index];
    setMedicineNames(medicineNames.filter((_, i) => i !== index));
    toast.info(`${removedMedicine} removed from prescription`);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error('Image size should be less than 10MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          image: reader.result
        }));
        toast.success('Image uploaded successfully');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Validate form
    if (medicineNames.length === 0 || 
        !formData.dosage || 
        !formData.instruction || 
        !formData.medicationSchedule || 
        !formData.endDate) {
      toast.error('Please fill in all required fields');
      setLoading(false);
      return;
    }

    try {
      // Create FormData object for multipart/form-data
      const formDataToSend = new FormData();
      formDataToSend.append('tabletNames', JSON.stringify(medicineNames));
      formDataToSend.append('description', formData.notes || '');
      formDataToSend.append('instructions', formData.instruction);
      formDataToSend.append('dosage', formData.dosage);
      formDataToSend.append('medicationSchedule', formData.medicationSchedule);
      formDataToSend.append('startDate', formData.startDate);
      formDataToSend.append('endDate', formData.endDate);
      
      if (formData.image) {
        // Convert base64 to blob
        const response = await fetch(formData.image);
        const blob = await response.blob();
        formDataToSend.append('prescriptionImage', blob, 'prescription.jpg');
      }

      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication required. Please login again.');
        navigate('/login');
        return;
      }

      // Make API call
      const response = await axios.post(
        'http://localhost:3000/api/prescriptions',
        formDataToSend,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data) {
        toast.success('Prescription added successfully!');
        // Navigate back to dashboard after a short delay
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      }
    } catch (err) {
      console.error('Error adding prescription:', err);
      toast.error(err.response?.data?.message || 'Failed to add prescription. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      
      <div className="dashboard-header">
        <button 
          className="back-button"
          onClick={() => navigate('/dashboard')}
        >
          <FaArrowLeft /> Back to Dashboard
        </button>
        <h1>Add New Prescription</h1>
      </div>

      <form className="prescription-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Medicine Names*</label>
          <div className="medicine-chips-container">
            <div className="medicine-chips">
              {medicineNames.map((name, index) => (
                <div key={index} className="medicine-chip">
                  {name}
                  <button
                    type="button"
                    className="chip-remove-button"
                    onClick={() => removeMedicine(index)}
                  >
                    <FaTimes />
                  </button>
                </div>
              ))}
            </div>
            <input
              ref={inputRef}
              type="text"
              value={medicineInput}
              onChange={handleMedicineInputChange}
              onKeyDown={handleMedicineInputKeyDown}
              placeholder="Type medicine name and press Enter or comma"
              className="medicine-input"
            />
          </div>
          <small className="input-help">Press Enter or comma to add a medicine</small>
        </div>

        <div className="form-group">
          <label>Dosage*</label>
          <input
            type="text"
            name="dosage"
            value={formData.dosage}
            onChange={handleInputChange}
            placeholder="e.g., 1 tablet"
            required
          />
        </div>

        <div className="form-group">
          <label>Instruction*</label>
          <select
            name="instruction"
            value={formData.instruction}
            onChange={handleInputChange}
            required
          >
            <option value="">Select instruction</option>
            {instructionOptions.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Medication Schedule*</label>
          <select
            name="medicationSchedule"
            value={formData.medicationSchedule}
            onChange={handleInputChange}
            required
          >
            <option value="">Select schedule</option>
            {scheduleOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Start Date</label>
          <input
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleInputChange}
            required
            disabled
          />
        </div>

        <div className="form-group">
          <label>End Date*</label>
          <input
            type="date"
            name="endDate"
            value={formData.endDate}
            onChange={handleInputChange}
            required
            min={formData.startDate}
          />
        </div>

        <div className="form-group">
          <label>Notes</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            placeholder="Add any special instructions or notes"
          />
        </div>

        <div className="form-group">
          <label>Medicine Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
          />
        </div>

        <button 
          type="submit" 
          className="submit-button"
          disabled={loading}
        >
          {loading ? 'Adding Prescription...' : 'Add Prescription'}
        </button>
      </form>
    </div>
  );
};

export default AddPrescription; 