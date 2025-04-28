import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaBell, FaTrash, FaPills, FaCalendarAlt, FaClock, FaInfoCircle, FaExclamationTriangle } from 'react-icons/fa';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './PrescriptionDetail.css';

const PrescriptionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) {
      setError('Invalid prescription ID');
      setLoading(false);
      return;
    }

    // Validate MongoDB ObjectId format
    const objectIdPattern = /^[0-9a-fA-F]{24}$/;
    if (!objectIdPattern.test(id)) {
      setError('Invalid prescription ID format');
      setLoading(false);
      return;
    }

    fetchPrescriptionDetails();
  }, [id]);

  const fetchPrescriptionDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Authentication required. Please login again.');
        navigate('/login');
        return;
      }

      const response = await axios.get(`http://localhost:3000/api/prescriptions/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.data) {
        throw new Error('Prescription not found');
      }

      setPrescription(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching prescription details:', err);
      if (err.response?.status === 404) {
        setError('Prescription not found');
      } else if (err.response?.status === 401) {
        setError('Authentication required. Please login again.');
        navigate('/login');
      } else {
        setError(err.response?.data?.message || 'Failed to fetch prescription details');
      }
      toast.error('Failed to load prescription details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const deletePrescription = async () => {
    if (window.confirm('Are you sure you want to delete this prescription?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:3000/api/prescriptions/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        toast.success('Prescription deleted successfully');
        navigate('/dashboard');
      } catch (err) {
        console.error('Error deleting prescription:', err);
        toast.error('Failed to delete prescription. Please try again.');
      }
    }
  };

  const toggleReminder = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:3000/api/prescriptions/${id}`,
        {
          ...prescription,
          reminderEnabled: !prescription.reminderEnabled
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      setPrescription(prev => ({
        ...prev,
        reminderEnabled: !prev.reminderEnabled
      }));

      toast.success(
        prescription.reminderEnabled 
          ? 'Reminder disabled' 
          : 'Reminder enabled'
      );
    } catch (err) {
      console.error('Error toggling reminder:', err);
      toast.error('Failed to update reminder. Please try again.');
    }
  };

  const getDaysRemaining = (endDate) => {
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="prescription-detail-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading prescription details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="prescription-detail-container">
        <div className="error-state">
          <p>{error}</p>
          <button 
            className="retry-button"
            onClick={fetchPrescriptionDetails}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!prescription) {
    return (
      <div className="prescription-detail-container">
        <div className="error-state">
          <p>Prescription not found</p>
          <button 
            className="back-button"
            onClick={() => navigate('/dashboard')}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const daysRemaining = getDaysRemaining(prescription.endDate);
  const isExpired = daysRemaining < 0;
  const isExpiringSoon = daysRemaining <= 7 && daysRemaining >= 0;

  return (
    <div className="prescription-detail-container">
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

      <div className="prescription-detail-header">
        <button 
          className="back-button"
          onClick={() => navigate('/dashboard')}
        >
          <FaArrowLeft /> Back to Dashboard
        </button>
        <div className="header-actions">
          <button
            className={`reminder-button ${prescription.reminderEnabled ? 'active' : ''}`}
            onClick={toggleReminder}
          >
            <FaBell /> {prescription.reminderEnabled ? 'Reminder On' : 'Set Reminder'}
          </button>
          <button
            className="delete-button"
            onClick={deletePrescription}
          >
            <FaTrash /> Delete Prescription
          </button>
        </div>
      </div>

      <div className="prescription-detail-content">
        <div className="prescription-header">
          {prescription.prescriptionImage && (
            <div className="prescription-image">
              <img 
                src={prescription.prescriptionImage.url} 
                alt={prescription.tabletNames.join(', ')} 
              />
            </div>
          )}
          <div className="prescription-title">
            <div className="medicine-names">
              {prescription.tabletNames.map((name, index) => (
                <span key={index} className="medicine-name">
                  {name}
                  {index < prescription.tabletNames.length - 1 && <span className="medicine-separator">•</span>}
                </span>
              ))}
            </div>
            <div className="prescription-status">
              {isExpired ? (
                <span className="status expired">
                  <FaExclamationTriangle /> Expired
                </span>
              ) : isExpiringSoon ? (
                <span className="status warning">
                  <FaExclamationTriangle /> Medication completes in {daysRemaining} days
                </span>
              ) : (
                <span className="status active">
                  <FaInfoCircle /> Active
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="prescription-details">
          <div className="detail-section">
            <h3>Medication Details</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <FaPills className="detail-icon" />
                <div>
                  <strong>Dosage</strong>
                  <p>{prescription.dosage}</p>
                </div>
              </div>

              <div className="detail-item">
                <FaClock className="detail-icon" />
                <div>
                  <strong>Instructions</strong>
                  <p>{prescription.instructions}</p>
                </div>
              </div>

              <div className="detail-item">
                <FaCalendarAlt className="detail-icon" />
                <div>
                  <strong>Schedule</strong>
                  <p>{prescription.medicationSchedule}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="detail-section">
            <h3>Duration</h3>
            <div className="date-range">
              <div className="date-item">
                <strong>Start Date</strong>
                <p>{new Date(prescription.startDate).toLocaleDateString()}</p>
              </div>
              <div className="date-item">
                <strong>End Date</strong>
                <p>{new Date(prescription.endDate).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {prescription.description && (
            <div className="detail-section">
              <h3>Additional Notes</h3>
              <div className="notes-content">
                <p>{prescription.description}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PrescriptionDetail; 