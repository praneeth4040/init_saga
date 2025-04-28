import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaBell, FaTrash, FaPills } from 'react-icons/fa';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [prescriptions, setPrescriptions] = useState(() => {
    const saved = localStorage.getItem('prescriptions');
    return saved ? JSON.parse(saved) : [];
  });

  // Save prescriptions to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('prescriptions', JSON.stringify(prescriptions));
  }, [prescriptions]);

  // Filter active prescriptions
  const activePrescriptions = prescriptions.filter(prescription => {
    const today = new Date();
    const endDate = new Date(prescription.endDate);
    return endDate >= today;
  });

  const deletePrescription = (id) => {
    if (window.confirm('Are you sure you want to delete this prescription?')) {
      setPrescriptions(prev => prev.filter(p => p.id !== id));
    }
  };

  const toggleReminder = (id) => {
    setPrescriptions(prev => prev.map(p => {
      if (p.id === id) {
        return { ...p, reminderEnabled: !p.reminderEnabled };
      }
      return p;
    }));
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>My Prescriptions</h1>
        <button 
          className="add-button"
          onClick={() => navigate('/add-prescription')}
        >
          <FaPlus /> Add New Prescription
        </button>
      </div>

      <div className="prescriptions-grid">
        {activePrescriptions.length === 0 ? (
          <div className="no-prescriptions">
            <FaPills size={48} />
            <p>No active prescriptions</p>
          </div>
        ) : (
          activePrescriptions.map(prescription => (
            <div key={prescription.id} className="prescription-card">
              {prescription.image && (
                <div className="prescription-image">
                  <img src={prescription.image} alt={prescription.medicineName} />
                </div>
              )}
              <div className="prescription-content">
                <h3>{prescription.medicineName}</h3>
                <p className="dosage">
                  <strong>Dosage:</strong> {prescription.dosage}
                </p>
                <p>
                  <strong>Timing:</strong> {prescription.timing}
                </p>
                <p>
                  <strong>Frequency:</strong> {prescription.frequency}
                </p>
                <p>
                  <strong>Start Date:</strong> {new Date(prescription.startDate).toLocaleDateString()}
                </p>
                <p>
                  <strong>End Date:</strong> {new Date(prescription.endDate).toLocaleDateString()}
                </p>
                {prescription.notes && (
                  <p className="notes">
                    <strong>Notes:</strong> {prescription.notes}
                  </p>
                )}
                <div className="prescription-actions">
                  <button
                    className={`reminder-button ${prescription.reminderEnabled ? 'active' : ''}`}
                    onClick={() => toggleReminder(prescription.id)}
                  >
                    <FaBell /> {prescription.reminderEnabled ? 'Reminder On' : 'Set Reminder'}
                  </button>
                  <button
                    className="delete-button"
                    onClick={() => deletePrescription(prescription.id)}
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Dashboard;
