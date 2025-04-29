import React, { useState, useEffect } from 'react';
import { FaVolumeUp, FaPlay, FaSave, FaTimes } from 'react-icons/fa';
import reminderService from '../services/reminderService';

const VoiceReminderSettings = ({ prescription, onSave, onCancel }) => {
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState('');
  const [volume, setVolume] = useState(1.0);
  const [rate, setRate] = useState(0.9);
  const [pitch, setPitch] = useState(1.0);
  const [customMessage, setCustomMessage] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [messageTemplate, setMessageTemplate] = useState('');

  // Load available voices
  useEffect(() => {
    // Initialize speech synthesis
    if ('speechSynthesis' in window) {
      // Chrome loads voices asynchronously
      const loadVoices = () => {
        const availableVoices = reminderService.getAvailableVoices();
        if (availableVoices.length > 0) {
          setVoices(availableVoices);
          
          // Set default voice (prefer English)
          const defaultVoice = availableVoices.find(voice => 
            voice.lang.startsWith('en-') && voice.default
          ) || availableVoices[0];
          
          if (defaultVoice) {
            setSelectedVoice(defaultVoice.name);
          }
        }
      };

      // Load voices
      loadVoices();
      
      // Chrome loads voices asynchronously
      if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = loadVoices;
      }
    }
  }, []);

  // Initialize with prescription settings if available
  useEffect(() => {
    if (prescription) {
      // Set default message template
      const defaultTemplate = `Time to take your medication: ${prescription.tabletNames.join(', ')}. ${prescription.instructions || ''}`;
      setMessageTemplate(defaultTemplate);
      
      // If prescription has voice settings, use them
      if (prescription.voiceOptions) {
        const options = prescription.voiceOptions;
        if (options.voice) setSelectedVoice(options.voice);
        if (options.volume) setVolume(options.volume);
        if (options.rate) setRate(options.rate);
        if (options.pitch) setPitch(options.pitch);
      }
      
      // If prescription has a custom message, use it
      if (prescription.reminderMessage) {
        setCustomMessage(prescription.reminderMessage);
      }
    }
  }, [prescription]);

  const handleTestVoice = async () => {
    if (isPlaying) return;
    
    setIsPlaying(true);
    
    const options = {
      voice: selectedVoice,
      volume: volume,
      rate: rate,
      pitch: pitch,
      message: customMessage || messageTemplate
    };
    
    await reminderService.testVoice(options);
    
    setIsPlaying(false);
  };

  const handleSave = () => {
    const voiceOptions = {
      voice: selectedVoice,
      volume: volume,
      rate: rate,
      pitch: pitch
    };
    
    onSave({
      voiceOptions,
      reminderMessage: customMessage
    });
  };

  return (
    <div className="voice-settings-container">
      <h3>Voice Reminder Settings</h3>
      
      <div className="settings-group">
        <label htmlFor="voice-select">Voice:</label>
        <select 
          id="voice-select"
          value={selectedVoice}
          onChange={(e) => setSelectedVoice(e.target.value)}
          className="voice-select"
        >
          {voices.map(voice => (
            <option key={voice.name} value={voice.name}>
              {voice.name} ({voice.lang})
            </option>
          ))}
        </select>
      </div>
      
      <div className="settings-group">
        <label htmlFor="volume-slider">
          <FaVolumeUp /> Volume: {Math.round(volume * 100)}%
        </label>
        <input 
          type="range"
          id="volume-slider"
          min="0"
          max="1"
          step="0.1"
          value={volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          className="slider"
        />
      </div>
      
      <div className="settings-group">
        <label htmlFor="rate-slider">
          Speed: {rate}x
        </label>
        <input 
          type="range"
          id="rate-slider"
          min="0.5"
          max="2"
          step="0.1"
          value={rate}
          onChange={(e) => setRate(parseFloat(e.target.value))}
          className="slider"
        />
      </div>
      
      <div className="settings-group">
        <label htmlFor="pitch-slider">
          Pitch: {pitch}
        </label>
        <input 
          type="range"
          id="pitch-slider"
          min="0.5"
          max="1.5"
          step="0.1"
          value={pitch}
          onChange={(e) => setPitch(parseFloat(e.target.value))}
          className="slider"
        />
      </div>
      
      <div className="settings-group">
        <label htmlFor="custom-message">Custom Message (optional):</label>
        <textarea 
          id="custom-message"
          value={customMessage}
          onChange={(e) => setCustomMessage(e.target.value)}
          placeholder={messageTemplate}
          className="custom-message"
          rows="3"
        />
        <p className="message-help">
          Leave blank to use the default message format.
        </p>
      </div>
      
      <div className="settings-actions">
        <button 
          className="test-button"
          onClick={handleTestVoice}
          disabled={isPlaying}
        >
          <FaPlay /> {isPlaying ? 'Playing...' : 'Test Voice'}
        </button>
        
        <button 
          className="save-button"
          onClick={handleSave}
        >
          <FaSave /> Save Settings
        </button>
        
        <button 
          className="cancel-button"
          onClick={onCancel}
        >
          <FaTimes /> Cancel
        </button>
      </div>
      
      <style jsx>{`
        .voice-settings-container {
          background-color: white;
          border-radius: 8px;
          padding: 1.5rem;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          max-width: 500px;
          margin: 0 auto;
        }
        
        h3 {
          margin-top: 0;
          margin-bottom: 1.5rem;
          color: #333;
          border-bottom: 1px solid #eee;
          padding-bottom: 0.5rem;
        }
        
        .settings-group {
          margin-bottom: 1.5rem;
        }
        
        label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: #555;
        }
        
        .voice-select {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 1rem;
        }
        
        .slider {
          width: 100%;
          margin-top: 0.5rem;
        }
        
        .custom-message {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 1rem;
          font-family: inherit;
          resize: vertical;
        }
        
        .message-help {
          font-size: 0.8rem;
          color: #777;
          margin-top: 0.25rem;
        }
        
        .settings-actions {
          display: flex;
          gap: 1rem;
          margin-top: 2rem;
        }
        
        button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
          transition: background-color 0.2s;
        }
        
        .test-button {
          background-color: #6c757d;
          color: white;
        }
        
        .test-button:hover {
          background-color: #5a6268;
        }
        
        .test-button:disabled {
          background-color: #adb5bd;
          cursor: not-allowed;
        }
        
        .save-button {
          background-color: #28a745;
          color: white;
          flex: 1;
        }
        
        .save-button:hover {
          background-color: #218838;
        }
        
        .cancel-button {
          background-color: #dc3545;
          color: white;
        }
        
        .cancel-button:hover {
          background-color: #c82333;
        }
      `}</style>
    </div>
  );
};

export default VoiceReminderSettings;