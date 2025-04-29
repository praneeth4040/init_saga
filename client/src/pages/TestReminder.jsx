import React, { useState, useEffect } from 'react';
import { FaBell, FaStop } from 'react-icons/fa';
import reminderService from '../services/reminderService';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const TestReminder = () => {
  const [seconds, setSeconds] = useState(10);
  const [testActive, setTestActive] = useState(false);

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      if (window._activeTestReminder) {
        clearTimeout(window._activeTestReminder);
        window._activeTestReminder = null;
      }
    };
  }, []);
  
  const cancelTest = () => {
    if (window._activeTestReminder) {
      clearTimeout(window._activeTestReminder);
      window._activeTestReminder = null;
      setTestActive(false);
      toast.info('Test reminder cancelled');
    }
  };
  
  const startTest = () => {
    // Initialize audio context
    reminderService.initAudioContext();
    
    // Request notification permission
    reminderService.requestNotificationPermission();
    
    // Create a test prescription with a custom schedule that includes test metadata
    const testPrescription = {
      _id: 'test-reminder',
      tabletNames: ['Test Medication'],
      instructions: 'This is a test reminder',
      reminderEnabled: true,
      medicationSchedule: 'Test Schedule',
      // We'll override the parsed schedule in setupReminder
      _testSchedule: [{
        hour: new Date().getHours(),
        minute: new Date().getMinutes(),
        _isTestSchedule: true,
        delayMs: seconds * 1000
      }],
      // Add voice options for testing
      voiceOptions: {
        volume: 1.0,
        rate: 1.0,
        pitch: 1.0
      }
    };
    
    // Clear any existing test reminders
    reminderService.clearReminder('test-reminder');
    
    // Set up the test reminder
    reminderService.setupReminder(testPrescription);
    
    // Also set a direct timeout as a backup
    const timerId = setTimeout(() => {
      // Play alarm when it's time
      reminderService.playAlarm('Test Medication', 'This is a test reminder', {
        volume: 1.0,
        rate: 1.0,
        pitch: 1.0
      });
      setTestActive(false);
    }, seconds * 1000);
    
    // Store the timer ID
    window._activeTestReminder = timerId;
    
    setTestActive(true);
    toast.success(`Test reminder set for ${seconds} seconds from now`);
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem' }}>
      <ToastContainer />
      <h1>Test Reminder</h1>
      <p>This page allows you to test the medication reminder functionality.</p>
      
      <div style={{ marginBottom: '2rem' }}>
        <label htmlFor="seconds">Test delay (seconds): </label>
        <input 
          type="number" 
          id="seconds" 
          value={seconds} 
          onChange={(e) => setSeconds(parseInt(e.target.value))} 
          min="5"
          max="60"
          style={{ marginLeft: '1rem' }}
        />
      </div>
      
      <div style={{ display: 'flex', gap: '1rem' }}>
        <button
          onClick={startTest}
          disabled={testActive}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.5rem',
            backgroundColor: testActive ? '#6c757d' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: testActive ? 'not-allowed' : 'pointer'
          }}
        >
          <FaBell /> {testActive ? 'Test in progress...' : 'Test Reminder'}
        </button>
        
        {testActive && (
          <button
            onClick={cancelTest}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            <FaStop /> Cancel Test
          </button>
        )}
      </div>
      
      {testActive && (
        <p style={{ marginTop: '1rem' }}>
          A reminder will play in approximately {seconds} seconds. Make sure your volume is turned up.
        </p>
      )}
    </div>
  );
};

export default TestReminder;