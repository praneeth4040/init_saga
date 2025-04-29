import React, { useState, useEffect } from 'react';
import { FaPlus, FaTrash, FaClock } from 'react-icons/fa';

const ReminderScheduleEditor = ({ initialSchedule, onChange }) => {
  const [scheduleItems, setScheduleItems] = useState([]);
  const [presetMode, setPresetMode] = useState(true);
  const [selectedPreset, setSelectedPreset] = useState('standard');

  // Preset schedule options
  const presets = {
    standard: {
      label: 'Standard (Morning, Afternoon, Evening)',
      value: 'Morning, Afternoon, Evening'
    },
    twice: {
      label: 'Twice Daily (Morning, Evening)',
      value: 'Morning, Evening'
    },
    once: {
      label: 'Once Daily (Morning)',
      value: 'Morning'
    },
    fourTimes: {
      label: 'Four Times Daily',
      value: '8:00 AM, 12:00 PM, 4:00 PM, 8:00 PM'
    },
    bedtime: {
      label: 'Bedtime Only',
      value: '10:00 PM'
    }
  };

  // Initialize with the provided schedule
  useEffect(() => {
    if (initialSchedule) {
      // Check if it matches any preset
      const matchingPreset = Object.entries(presets).find(
        ([_, preset]) => preset.value === initialSchedule
      );

      if (matchingPreset) {
        setSelectedPreset(matchingPreset[0]);
        setPresetMode(true);
      } else {
        // Parse custom schedule
        const times = initialSchedule.split(',').map(time => time.trim());
        setScheduleItems(times.map(time => ({ time })));
        setPresetMode(false);
      }
    } else {
      // Default to standard preset
      setSelectedPreset('standard');
      setPresetMode(true);
    }
  }, [initialSchedule]);

  // Update parent component when schedule changes
  useEffect(() => {
    if (presetMode) {
      onChange(presets[selectedPreset].value);
    } else {
      const scheduleString = scheduleItems
        .map(item => item.time)
        .join(', ');
      onChange(scheduleString);
    }
  }, [presetMode, selectedPreset, scheduleItems, onChange]);

  const handlePresetChange = (e) => {
    setSelectedPreset(e.target.value);
  };

  const toggleMode = () => {
    if (presetMode) {
      // Switching to custom mode - initialize with current preset values
      const times = presets[selectedPreset].value.split(',').map(time => time.trim());
      setScheduleItems(times.map(time => ({ time })));
    }
    setPresetMode(!presetMode);
  };

  const addScheduleItem = () => {
    setScheduleItems([...scheduleItems, { time: '8:00 AM' }]);
  };

  const updateScheduleItem = (index, time) => {
    const newItems = [...scheduleItems];
    newItems[index].time = time;
    setScheduleItems(newItems);
  };

  const removeScheduleItem = (index) => {
    const newItems = [...scheduleItems];
    newItems.splice(index, 1);
    setScheduleItems(newItems);
  };

  return (
    <div className="schedule-editor">
      <div className="mode-toggle">
        <button
          type="button"
          className={`mode-button ${presetMode ? 'active' : ''}`}
          onClick={() => setPresetMode(true)}
        >
          Use Preset
        </button>
        <button
          type="button"
          className={`mode-button ${!presetMode ? 'active' : ''}`}
          onClick={() => setPresetMode(false)}
        >
          Custom Schedule
        </button>
      </div>

      {presetMode ? (
        <div className="preset-section">
          <label htmlFor="preset-select">Choose a preset schedule:</label>
          <select
            id="preset-select"
            value={selectedPreset}
            onChange={handlePresetChange}
            className="preset-select"
          >
            {Object.entries(presets).map(([key, preset]) => (
              <option key={key} value={key}>
                {preset.label}
              </option>
            ))}
          </select>
          <p className="preset-value">
            <FaClock /> {presets[selectedPreset].value}
          </p>
        </div>
      ) : (
        <div className="custom-section">
          <div className="schedule-items">
            {scheduleItems.map((item, index) => (
              <div key={index} className="schedule-item">
                <input
                  type="text"
                  value={item.time}
                  onChange={(e) => updateScheduleItem(index, e.target.value)}
                  placeholder="e.g., 8:00 AM or Morning"
                  className="time-input"
                />
                <button
                  type="button"
                  onClick={() => removeScheduleItem(index)}
                  className="remove-button"
                  aria-label="Remove time"
                >
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>
          
          <button
            type="button"
            onClick={addScheduleItem}
            className="add-button"
          >
            <FaPlus /> Add Time
          </button>
          
          <p className="schedule-help">
            Enter times like "8:00 AM" or named times like "Morning", "Afternoon", etc.
          </p>
        </div>
      )}

      <style jsx>{`
        .schedule-editor {
          margin-bottom: 1.5rem;
        }
        
        .mode-toggle {
          display: flex;
          margin-bottom: 1rem;
          border-radius: 4px;
          overflow: hidden;
        }
        
        .mode-button {
          flex: 1;
          padding: 0.5rem;
          border: 1px solid #ddd;
          background-color: #f8f9fa;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .mode-button.active {
          background-color: #007bff;
          color: white;
          border-color: #007bff;
        }
        
        .preset-section, .custom-section {
          padding: 1rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          background-color: #f8f9fa;
        }
        
        label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
        }
        
        .preset-select {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 1rem;
          margin-bottom: 0.5rem;
        }
        
        .preset-value {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem;
          background-color: white;
          border-radius: 4px;
          border: 1px solid #ddd;
          margin-top: 0.5rem;
        }
        
        .schedule-items {
          margin-bottom: 1rem;
        }
        
        .schedule-item {
          display: flex;
          margin-bottom: 0.5rem;
        }
        
        .time-input {
          flex: 1;
          padding: 0.5rem;
          border: 1px solid #ddd;
          border-radius: 4px 0 0 4px;
          font-size: 1rem;
        }
        
        .remove-button {
          padding: 0.5rem;
          background-color: #dc3545;
          color: white;
          border: none;
          border-radius: 0 4px 4px 0;
          cursor: pointer;
        }
        
        .add-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background-color: #28a745;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          margin-bottom: 0.5rem;
        }
        
        .schedule-help {
          font-size: 0.8rem;
          color: #6c757d;
          margin-top: 0.5rem;
        }
      `}</style>
    </div>
  );
};

export default ReminderScheduleEditor;