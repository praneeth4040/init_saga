import React, { useState, useEffect } from 'react';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newPrescription, setNewPrescription] = useState({
    tabletImage: null,
    tabletNames: [],
    dosage: '',
    time: '',
    instructions: '',
    startDate: '',
    endDate: '',
    description: ''
  });
  const [tabletNameInput, setTabletNameInput] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPrescription((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTabletNameAdd = () => {
    if (tabletNameInput.trim()) {
      setNewPrescription((prev) => ({
        ...prev,
        tabletNames: [...prev.tabletNames, tabletNameInput]
      }));
      setTabletNameInput('');
    }
  };

  const handleImageUpload = (e) => {
    setNewPrescription((prev) => ({
      ...prev,
      tabletImage: URL.createObjectURL(e.target.files[0])
    }));
  };

  const addPrescription = (e) => {
    e.preventDefault();
    if (
      newPrescription.tabletNames.length > 0 &&
      newPrescription.dosage &&
      newPrescription.time &&
      newPrescription.instructions &&
      newPrescription.startDate &&
      newPrescription.endDate &&
      newPrescription.description
    ) {
      setPrescriptions((prev) => [
        ...prev,
        { ...newPrescription, id: prev.length + 1, alarmSet: false }
      ]);
      setNewPrescription({
        tabletImage: null,
        tabletNames: [],
        dosage: '',
        time: '',
        instructions: '',
        startDate: '',
        endDate: '',
        description: ''
      });
      setShowForm(false);
    }
  };

  const toggleAlarm = (id) => {
    const prescription = prescriptions.find((p) => p.id === id);
    if (prescription) {
      const alarmTime = new Date();
      const [hours, minutes] = prescription.time.split(':');
      alarmTime.setHours(hours, minutes, 0);

      const now = new Date();
      const timeDifference = alarmTime - now;

      if (timeDifference > 0) {
        setTimeout(() => {
          const audio = new Audio('/beep.mp3'); // Add a beep sound file in your public folder
          audio.play();
        }, timeDifference);
      }
    }
  };

  useEffect(() => {
    const now = new Date();
    setPrescriptions((prev) =>
      prev.filter((prescription) => new Date(prescription.endDate) >= now)
    );
  }, [prescriptions]);

  return (
    <div className="dashboard-container">
      <h2>Your Prescriptions</h2>
      <button className="add-button" onClick={() => setShowForm(!showForm)}>
        {showForm ? 'Close Form' : 'Add Prescription'}
      </button>

      {showForm && (
        <form className="add-prescription-form" onSubmit={addPrescription}>
          <h3>Add New Prescription</h3>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            required
          />
          <div className="tablet-names">
            <input
              type="text"
              value={tabletNameInput}
              onChange={(e) => setTabletNameInput(e.target.value)}
              placeholder="Tablet Name"
            />
            <button type="button" onClick={handleTabletNameAdd}>
              Add Tablet
            </button>
          </div>
          <ul>
            {newPrescription.tabletNames.map((name, index) => (
              <li key={index}>{name}</li>
            ))}
          </ul>
          <input
            type="text"
            name="dosage"
            value={newPrescription.dosage}
            onChange={handleInputChange}
            placeholder="Dosage (e.g., 500mg)"
            required
          />
          <input
            type="time"
            name="time"
            value={newPrescription.time}
            onChange={handleInputChange}
            required
          />
          <select
            name="instructions"
            value={newPrescription.instructions}
            onChange={handleInputChange}
            required
          >
            <option value="">Select Instructions</option>
            <option value="Early Morning">Early Morning</option>
            <option value="Evening">Evening</option>
            <option value="After Meals">After Meals</option>
          </select>
          <input
            type="date"
            name="startDate"
            value={newPrescription.startDate}
            onChange={handleInputChange}
            required
          />
          <input
            type="date"
            name="endDate"
            value={newPrescription.endDate}
            onChange={handleInputChange}
            required
          />
          <textarea
            name="description"
            value={newPrescription.description}
            onChange={handleInputChange}
            placeholder="Description"
            required
          ></textarea>
          <button type="submit" className="add-button">
            Save Prescription
          </button>
        </form>
      )}

      <div className="prescription-list">
        {prescriptions.map((prescription) => (
          <div key={prescription.id} className="prescription-card">
            {prescription.tabletImage && (
              <img
                src={prescription.tabletImage}
                alt="Tablet"
                className="tablet-image"
              />
            )}
            <h3>Tablets: {prescription.tabletNames.join(', ')}</h3>
            <p>Dosage: {prescription.dosage}</p>
            <p>Time: {prescription.time}</p>
            <p>Instructions: {prescription.instructions}</p>
            <p>Start Date: {prescription.startDate}</p>
            <p>End Date: {prescription.endDate}</p>
            <p>Description: {prescription.description}</p>
            <button
              className={`alarm-button ${prescription.alarmSet ? 'active' : ''}`}
              onClick={() => toggleAlarm(prescription.id)}
            >
              {prescription.alarmSet ? 'Alarm On' : 'Set Alarm'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;