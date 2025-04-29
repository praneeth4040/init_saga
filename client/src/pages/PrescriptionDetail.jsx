import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaBell, FaTrash, FaPills, FaCalendarAlt, FaClock, FaInfoCircle, FaExclamationTriangle, FaCog } from 'react-icons/fa';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './PrescriptionDetail.css';
import reminderService from '../services/reminderService';
import VoiceReminderSettings from '../components/VoiceReminderSettings';
import ReminderScheduleEditor from '../components/ReminderScheduleEditor';

const PrescriptionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const [showScheduleEditor, setShowScheduleEditor] = useState(false);
  const [activeReminders, setActiveReminders] = useState([]);

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
  
  // Set up reminders when prescription data is loaded
  useEffect(() => {
    if (prescription && prescription.reminderEnabled) {
      // Initialize audio context (will be suspended until user interaction)
      reminderService.initAudioContext();
      
      // Set up the reminder
      reminderService.setupReminder(prescription);
      
      // Get active reminders
      const reminders = reminderService.getActiveReminders(prescription._id);
      setActiveReminders(reminders);
    } else {
      setActiveReminders([]);
    }
    
    // Clean up reminders when component unmounts
    return () => {
      if (prescription && prescription._id) {
        reminderService.clearReminder(prescription._id);
      }
    };
  }, [prescription]);
  
  // Handle saving voice settings
  const handleSaveVoiceSettings = async (settings) => {
    try {
      const token = localStorage.getItem('token');
      
      // Update the prescription with voice settings
      const updatedPrescription = {
        ...prescription,
        voiceOptions: settings.voiceOptions,
        reminderMessage: settings.reminderMessage
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
      setPrescription(updatedPrescription);
      
      // Close the settings panel
      setShowVoiceSettings(false);
      
      // If reminders are enabled, update them with new settings
      if (updatedPrescription.reminderEnabled) {
        // Clear existing reminders
        reminderService.clearReminder(id);
        
        // Set up new reminders with updated settings
        reminderService.setupReminder(updatedPrescription);
        
        // Update active reminders list
        const reminders = reminderService.getActiveReminders(id);
        setActiveReminders(reminders);
      }
      
      toast.success('Voice reminder settings saved');
    } catch (err) {
      console.error('Error saving voice settings:', err);
      toast.error('Failed to save voice settings. Please try again.');
    }
  };
  
  // Handle saving schedule changes
  const handleSaveSchedule = async (newSchedule) => {
    try {
      const token = localStorage.getItem('token');
      
      // Update the prescription with new schedule
      const updatedPrescription = {
        ...prescription,
        medicationSchedule: newSchedule
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
      setPrescription(updatedPrescription);
      
      // Close the schedule editor
      setShowScheduleEditor(false);
      
      // If reminders are enabled, update them with new schedule
      if (updatedPrescription.reminderEnabled) {
        // Clear existing reminders
        reminderService.clearReminder(id);
        
        // Set up new reminders with updated schedule
        reminderService.setupReminder(updatedPrescription);
        
        // Update active reminders list
        const reminders = reminderService.getActiveReminders(id);
        setActiveReminders(reminders);
      }
      
      toast.success('Medication schedule updated');
    } catch (err) {
      console.error('Error updating schedule:', err);
      toast.error('Failed to update schedule. Please try again.');
    }
  };

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
      
      // Update the prescription with new reminder state
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
      setPrescription(updatedPrescription);

      // Initialize audio context on user interaction
      reminderService.initAudioContext();
      
      // Handle reminder setup or clearing
      if (updatedPrescription.reminderEnabled) {
        // Request notification permission
        await reminderService.requestNotificationPermission();
        
        // Set up the reminder
        const remindersSet = reminderService.setupReminder(updatedPrescription);
        
        // Update active reminders list
        const reminders = reminderService.getActiveReminders(id);
        setActiveReminders(reminders);
        
        if (remindersSet > 0) {
          toast.success(`Reminder enabled - You will be notified at ${remindersSet} scheduled times`);
          
          // Show voice settings if this is the first time enabling reminders
          if (!prescription.voiceOptions) {
            setTimeout(() => {
              setShowVoiceSettings(true);
            }, 1000);
          }
        } else {
          toast.warning('Reminder enabled, but no valid schedule times found. Please update the schedule.');
          setTimeout(() => {
            setShowScheduleEditor(true);
          }, 1000);
        }
      } else {
        // Clear the reminder
        const remindersCleared = reminderService.clearReminder(updatedPrescription._id);
        setActiveReminders([]);
        toast.success(`Reminders disabled (${remindersCleared} reminders cleared)`);
      }
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
          {prescription.reminderEnabled && (
            <button
              className="settings-button"
              onClick={() => setShowVoiceSettings(true)}
            >
              <FaCog /> Voice Settings
            </button>
          )}
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
                  <div className="schedule-container">
                    <p>{prescription.medicationSchedule}</p>
                    {prescription.reminderEnabled && (
                      <button 
                        className="edit-schedule-button"
                        onClick={() => setShowScheduleEditor(true)}
                      >
                        Edit Schedule
                      </button>
                    )}
                  </div>
                </div>
              </div>
              
              {prescription.reminderEnabled && activeReminders.length > 0 && (
                <div className="detail-item reminder-status">
                  <FaBell className="detail-icon" />
                  <div>
                    <strong>Active Reminders</strong>
                    <div className="active-reminders">
                      {activeReminders.map((reminder, index) => (
                        <div key={index} className="reminder-item">
                          <span className="reminder-time">
                            {reminder.schedule.hour}:{reminder.schedule.minute.toString().padStart(2, '0')}
                          </span>
                          <span className="reminder-next">
                            Next: {reminder.nextTriggerTime}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
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
      
      {/* Voice Settings Modal */}
      {showVoiceSettings && (
        <div className="modal-overlay">
          <div className="modal-container">
            <VoiceReminderSettings 
              prescription={prescription}
              onSave={handleSaveVoiceSettings}
              onCancel={() => setShowVoiceSettings(false)}
            />
          </div>
        </div>
      )}
      
      {/* Schedule Editor Modal */}
      {showScheduleEditor && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="schedule-editor-modal">
              <h3>Edit Medication Schedule</h3>
              <ReminderScheduleEditor 
                initialSchedule={prescription.medicationSchedule}
                onChange={handleSaveSchedule}
              />
              <button 
                className="close-button"
                onClick={() => setShowScheduleEditor(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      
      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        
        .modal-container {
          max-width: 90%;
          max-height: 90%;
          overflow-y: auto;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        
        .schedule-editor-modal {
          background-color: white;
          padding: 1.5rem;
          border-radius: 8px;
          width: 500px;
          max-width: 100%;
        }
        
        .schedule-editor-modal h3 {
          margin-top: 0;
          margin-bottom: 1.5rem;
          color: #333;
          border-bottom: 1px solid #eee;
          padding-bottom: 0.5rem;
        }
        
        .close-button {
          display: block;
          width: 100%;
          padding: 0.75rem;
          background-color: #6c757d;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          margin-top: 1rem;
        }
        
        .schedule-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        
        .edit-schedule-button {
          background-color: #6c757d;
          color: white;
          border: none;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.8rem;
          margin-left: 1rem;
        }
        
        .settings-button {
          background-color: #17a2b8;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1rem;
        }
        
        .active-reminders {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-top: 0.5rem;
        }
        
        .reminder-item {
          display: flex;
          justify-content: space-between;
          background-color: #f8f9fa;
          padding: 0.5rem;
          border-radius: 4px;
          border-left: 3px solid #28a745;
        }
        
        .reminder-time {
          font-weight: 500;
        }
        
        .reminder-next {
          color: #6c757d;
          font-size: 0.9rem;
        }
        
        .reminder-status {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px dashed #dee2e6;
        }
      `}</style>
    </div>
  );
};

export default PrescriptionDetail; 