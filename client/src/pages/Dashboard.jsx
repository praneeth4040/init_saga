import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaBell, FaTrash, FaPills, FaCalendarAlt, FaClock, FaInfoCircle, FaExclamationTriangle } from 'react-icons/fa';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Dashboard.css';
import reminderService from '../services/reminderService';

const Dashboard = () => {
  const navigate = useNavigate();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'active', 'expired'

  useEffect(() => {
    fetchPrescriptions();
  }, []);
  
  // Set up reminders for all active prescriptions
  useEffect(() => {
    // Initialize audio context (will be suspended until user interaction)
    reminderService.initAudioContext();
    
    // Set up reminders for all enabled prescriptions
    prescriptions.forEach(prescription => {
      if (prescription.reminderEnabled) {
        reminderService.setupReminder(prescription);
      }
    });
    
    // Clean up all reminders when component unmounts
    return () => {
      prescriptions.forEach(prescription => {
        if (prescription._id) {
          reminderService.clearReminder(prescription._id);
        }
      });
    };
  }, [prescriptions]);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Authentication required. Please login again.');
        navigate('/login');
        return;
      }

      const response = await axios.get('http://localhost:3000/api/prescriptions', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setPrescriptions(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching prescriptions:', err);
      setError(err.response?.data?.message || 'Failed to fetch prescriptions');
      toast.error('Failed to load prescriptions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const deletePrescription = async (id) => {
    if (window.confirm('Are you sure you want to delete this prescription?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:3000/api/prescriptions/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        setPrescriptions(prev => prev.filter(p => p._id !== id));
        toast.success('Prescription deleted successfully');
      } catch (err) {
        console.error('Error deleting prescription:', err);
        toast.error('Failed to delete prescription. Please try again.');
      }
    }
  };

  const toggleReminder = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const prescription = prescriptions.find(p => p._id === id);
      
      if (!prescription) {
        toast.error('Prescription not found');
        return;
      }
      
      const updatedPrescription = {
        ...prescription,
        reminderEnabled: !prescription.reminderEnabled
      };
      
      await axios.put(
        `http://localhost:3000/api/prescriptions/${id}`,
        updatedPrescription,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      // Update local state
      setPrescriptions(prev => prev.map(p => {
        if (p._id === id) {
          return updatedPrescription;
        }
        return p;
      }));

      // Initialize audio context on user interaction
      reminderService.initAudioContext();
      
      // Handle reminder setup or clearing
      if (updatedPrescription.reminderEnabled) {
        // Request notification permission
        await reminderService.requestNotificationPermission();
        
        // Set up the reminder
        reminderService.setupReminder(updatedPrescription);
        
        toast.success('Reminder enabled - You will be notified at the scheduled times');
      } else {
        // Clear the reminder
        reminderService.clearReminder(id);
        toast.success('Reminder disabled');
      }
    } catch (err) {
      console.error('Error toggling reminder:', err);
      toast.error('Failed to update reminder. Please try again.');
    }
  };

  const getFilteredPrescriptions = () => {
    const today = new Date();
    switch (filter) {
      case 'active':
        return prescriptions.filter(p => new Date(p.endDate) >= today);
      case 'expired':
        return prescriptions.filter(p => new Date(p.endDate) < today);
      default:
        return prescriptions;
    }
  };

  const getDaysRemaining = (endDate) => {
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handlePrescriptionClick = (id) => {
    if (id) {
      navigate(`/prescription/${id}`);
    } else {
      toast.error('Invalid prescription ID');
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading prescriptions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="error-state">
          <p>{error}</p>
          <button 
            className="retry-button"
            onClick={fetchPrescriptions}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const filteredPrescriptions = getFilteredPrescriptions();

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
        <div className="header-content">
          <h1>My Prescriptions</h1>
          <div className="filter-buttons">
            <button 
              className={`filter-button ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button 
              className={`filter-button ${filter === 'active' ? 'active' : ''}`}
              onClick={() => setFilter('active')}
            >
              Active
            </button>
            <button 
              className={`filter-button ${filter === 'expired' ? 'active' : ''}`}
              onClick={() => setFilter('expired')}
            >
              Expired
            </button>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            className="add-button"
            onClick={() => navigate('/add-prescription')}
          >
            <FaPlus /> Add New Prescription
          </button>
          <button 
            style={{
              backgroundColor: '#17a2b8',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '1rem'
            }}
            onClick={() => navigate('/test-reminder')}
          >
            <FaBell /> Test Reminders
          </button>
        </div>
      </div>

      <div className="prescriptions-grid">
        {filteredPrescriptions.length === 0 ? (
          <div className="no-prescriptions">
            <FaPills size={48} />
            <p>No {filter} prescriptions found</p>
          </div>
        ) : (
          filteredPrescriptions.map(prescription => {
            const daysRemaining = getDaysRemaining(prescription.endDate);
            const isExpired = daysRemaining < 0;
            const isExpiringSoon = daysRemaining <= 7 && daysRemaining >= 0;

            return (
              <div 
                key={prescription._id} 
                className="prescription-card"
                onClick={() => handlePrescriptionClick(prescription._id)}
              >
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
                  <div className="detail-item">
                    <FaPills className="detail-icon" />
                    <div>
                      <strong>Dosage:</strong>
                      <p>{prescription.dosage}</p>
                    </div>
                  </div>

                  <div className="detail-item">
                    <FaClock className="detail-icon" />
                    <div>
                      <strong>Instructions:</strong>
                      <p>{prescription.instructions}</p>
                    </div>
                  </div>

                  <div className="detail-item">
                    <FaCalendarAlt className="detail-icon" />
                    <div>
                      <strong>Schedule:</strong>
                      <p>{prescription.medicationSchedule}</p>
                    </div>
                  </div>

                  <div className="date-range">
                    <div className="date-item">
                      <strong>Start Date:</strong>
                      <p>{new Date(prescription.startDate).toLocaleDateString()}</p>
                    </div>
                    <div className="date-item">
                      <strong>End Date:</strong>
                      <p>{new Date(prescription.endDate).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {prescription.description && (
                    <div className="notes-section">
                      <strong>Notes:</strong>
                      <p>{prescription.description}</p>
                    </div>
                  )}
                </div>

                <div className="prescription-actions" onClick={e => e.stopPropagation()}>
                  <button
                    className={`reminder-button ${prescription.reminderEnabled ? 'active' : ''}`}
                    onClick={() => toggleReminder(prescription._id)}
                  >
                    <FaBell /> {prescription.reminderEnabled ? 'Reminder On' : 'Set Reminder'}
                  </button>
                  <button
                    className="delete-button"
                    onClick={() => deletePrescription(prescription._id)}
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Dashboard;
