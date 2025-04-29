/**
 * Reminder Service
 * Handles medication reminders and alarms
 */

// Map to store active reminder timers
const activeReminders = new Map();

// Default alarm sound URL
const DEFAULT_ALARM_SOUND = '/sounds/medication-alarm.mp3';

// Audio context for playing sounds
let audioContext = null;

/**
 * Initialize the audio context (must be called after user interaction)
 */
const initAudioContext = () => {
  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      console.log('Audio context initialized');
    } catch (error) {
      console.error('Failed to initialize audio context:', error);
    }
  }
  return audioContext;
};

/**
 * Play alarm sound with text-to-speech message
 * @param {string} medicationName - Name of the medication
 * @param {string} instructions - Medication instructions
 * @param {Object} options - Optional configuration for the alarm
 * @param {string} options.customMessage - Custom message to speak instead of default
 * @param {number} options.volume - Volume level (0.0 to 1.0)
 * @param {number} options.rate - Speech rate (0.1 to 10)
 * @param {number} options.pitch - Speech pitch (0 to 2)
 * @param {string} options.voice - Voice name to use (if available)
 * @param {string} options.alarmSound - Custom alarm sound URL
 */
const playAlarm = async (medicationName, instructions, options = {}) => {
  try {
    // Initialize audio context if not already done
    const context = initAudioContext();
    if (!context) return;

    // Play alarm sound
    const alarmSound = options.alarmSound || DEFAULT_ALARM_SOUND;
    const alarmAudio = new Audio(alarmSound);
    alarmAudio.volume = options.volume || 1.0;
    
    // Start playing the alarm
    const playPromise = alarmAudio.play();
    
    // Prepare the speech message
    const speech = new SpeechSynthesisUtterance();
    
    // Use custom message if provided, otherwise use default format
    if (options.customMessage) {
      speech.text = options.customMessage;
    } else {
      speech.text = `Time to take your medication: ${medicationName}. ${instructions}`;
    }
    
    // Apply voice settings
    speech.volume = options.volume || 1.0;
    speech.rate = options.rate || 0.9;
    speech.pitch = options.pitch || 1.0;
    
    // If a specific voice is requested, try to use it
    if (options.voice) {
      const voices = window.speechSynthesis.getVoices();
      const selectedVoice = voices.find(v => v.name === options.voice);
      if (selectedVoice) {
        speech.voice = selectedVoice;
      }
    }
    
    // Wait for alarm sound to finish before speaking
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          alarmAudio.onended = () => {
            window.speechSynthesis.speak(speech);
          };
        })
        .catch(error => {
          console.error("Audio playback failed:", error);
          // If audio fails, still try to speak the message
          window.speechSynthesis.speak(speech);
        });
    } else {
      // Fallback for browsers that don't return a promise
      alarmAudio.onended = () => {
        window.speechSynthesis.speak(speech);
      };
    }

    // Show browser notification if supported
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        const notification = new Notification('Medication Reminder', {
          body: `Time to take: ${medicationName}\n${instructions}`,
          icon: '/favicon.ico',
          vibrate: [200, 100, 200],
          tag: `med-reminder-${Date.now()}`
        });
        
        // Focus the app when notification is clicked
        notification.onclick = function() {
          window.focus();
          this.close();
        };
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission();
      }
    }
    
    // Return the audio element so it can be stopped if needed
    return alarmAudio;
  } catch (error) {
    console.error('Error playing alarm:', error);
    return null;
  }
};

/**
 * Parse medication schedule string into times
 * @param {string} scheduleStr - Schedule string (e.g., "Morning, Afternoon, Evening" or "8:00 AM, 2:00 PM, 8:00 PM")
 * @returns {Array} Array of schedule objects with hour and minute
 */
const parseSchedule = (scheduleStr) => {
  if (!scheduleStr) return [];
  
  const schedules = scheduleStr.split(',').map(s => s.trim());
  return schedules.map(schedule => {
    // Check if it's a specific time format (e.g., "8:00 AM")
    const timeMatch = schedule.match(/(\d+):(\d+)\s*(AM|PM)?/i);
    
    if (timeMatch) {
      let hour = parseInt(timeMatch[1], 10);
      const minute = parseInt(timeMatch[2], 10);
      const period = timeMatch[3]?.toUpperCase();
      
      // Convert to 24-hour format
      if (period === 'PM' && hour < 12) hour += 12;
      if (period === 'AM' && hour === 12) hour = 0;
      
      return { hour, minute };
    } else {
      // Handle named times
      switch (schedule.toLowerCase()) {
        case 'morning':
          return { hour: 8, minute: 0 };
        case 'afternoon':
          return { hour: 14, minute: 0 };
        case 'evening':
          return { hour: 20, minute: 0 };
        case 'night':
          return { hour: 22, minute: 0 };
        default:
          return null;
      }
    }
  }).filter(Boolean);
};

/**
 * Calculate milliseconds until next medication time
 * @param {Object} schedule - Schedule object with hour and minute
 * @param {boolean} testMode - If true, returns a short delay for testing
 * @returns {number} Milliseconds until next occurrence
 */
const getMillisecondsUntilNextOccurrence = (schedule, testMode = false) => {
  // For test mode, return a short delay (10 seconds)
  if (testMode && schedule._isTestSchedule) {
    return schedule.delayMs || 10000; // Default to 10 seconds for tests
  }
  
  const now = new Date();
  const next = new Date();
  
  next.setHours(schedule.hour, schedule.minute, 0, 0);
  
  // If the time has already passed today, schedule for tomorrow
  if (next <= now) {
    next.setDate(next.getDate() + 1);
  }
  
  return next.getTime() - now.getTime();
};

/**
 * Set up a reminder for a prescription
 * @param {Object} prescription - Prescription object
 * @param {Object} voiceOptions - Optional voice configuration
 */
const setupReminder = (prescription, voiceOptions = {}) => {
  if (!prescription || !prescription.reminderEnabled) return;
  
  // Clear any existing reminders for this prescription
  clearReminder(prescription._id);
  
  // Use custom test schedule if provided (for testing), otherwise parse from medicationSchedule
  const schedules = prescription._testSchedule || parseSchedule(prescription.medicationSchedule);
  if (schedules.length === 0) return;
  
  // Set up timers for each schedule time
  schedules.forEach(schedule => {
    const msUntilNext = getMillisecondsUntilNextOccurrence(schedule, !!prescription._testSchedule);
    
    // Set timeout for the reminder
    const timerId = setTimeout(() => {
      // Get medication names as a readable string
      const medicationNames = prescription.tabletNames.join(', ');
      
      // Check for custom message template in the prescription
      const customMessage = prescription.reminderMessage || null;
      
      // Merge prescription-specific voice options with global options
      const mergedOptions = {
        ...voiceOptions,
        ...(prescription.voiceOptions || {}),
        customMessage
      };
      
      // Play alarm when it's time
      const alarmInstance = playAlarm(medicationNames, prescription.instructions, mergedOptions);
      
      // Store the alarm instance in case we need to stop it
      if (alarmInstance) {
        const alarmKey = `alarm-${prescription._id}-${Date.now()}`;
        activeReminders.set(alarmKey, { 
          type: 'alarm',
          instance: alarmInstance,
          timestamp: Date.now()
        });
        
        // Auto-remove after 2 minutes
        setTimeout(() => {
          activeReminders.delete(alarmKey);
        }, 120000);
      }
      
      // Set up the next day's reminder (for recurring reminders)
      if (!prescription._testSchedule) {
        setupReminder(prescription, voiceOptions);
      }
    }, msUntilNext);
    
    // Store the timer ID with metadata
    const key = `${prescription._id}-${schedule.hour}-${schedule.minute}`;
    activeReminders.set(key, { 
      type: 'timer',
      id: timerId,
      prescription: {
        id: prescription._id,
        name: prescription.tabletNames.join(', ')
      },
      schedule: {
        hour: schedule.hour,
        minute: schedule.minute
      },
      nextTrigger: Date.now() + msUntilNext
    });
    
    console.log(`Reminder set for ${prescription.tabletNames.join(', ')} at ${schedule.hour}:${schedule.minute.toString().padStart(2, '0')} (in ${Math.round(msUntilNext / 60000)} minutes)`);
  });
  
  // Return the number of reminders set up
  return schedules.length;
};

/**
 * Clear all reminders for a prescription
 * @param {string} prescriptionId - Prescription ID
 * @returns {number} Number of reminders cleared
 */
const clearReminder = (prescriptionId) => {
  if (!prescriptionId) return 0;
  
  let count = 0;
  
  // Find and clear all timers and alarms for this prescription
  for (const [key, value] of activeReminders.entries()) {
    if (key.startsWith(`${prescriptionId}-`) || 
        (value.type === 'alarm' && key.includes(`-${prescriptionId}-`))) {
      
      if (value.type === 'timer') {
        // Clear the timeout
        clearTimeout(value.id);
      } else if (value.type === 'alarm' && value.instance) {
        // Stop the audio
        try {
          value.instance.pause();
          value.instance.currentTime = 0;
        } catch (e) {
          console.error('Error stopping alarm:', e);
        }
        
        // Stop speech synthesis if it's speaking
        if (window.speechSynthesis.speaking) {
          window.speechSynthesis.cancel();
        }
      }
      
      // Remove from active reminders
      activeReminders.delete(key);
      count++;
      console.log(`Reminder cleared for ${key}`);
    }
  }
  
  return count;
};

/**
 * Request notification permissions
 * @returns {Promise} Promise that resolves with the permission status
 */
const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return 'not-supported';
  }
  
  if (Notification.permission !== 'granted') {
    return Notification.requestPermission();
  }
  
  return Notification.permission;
};

/**
 * Get all available speech synthesis voices
 * @returns {Array} Array of available voice objects
 */
const getAvailableVoices = () => {
  return window.speechSynthesis.getVoices();
};

/**
 * Get active reminders for a prescription
 * @param {string} prescriptionId - Prescription ID
 * @returns {Array} Array of active reminder objects
 */
const getActiveReminders = (prescriptionId) => {
  if (!prescriptionId) return [];
  
  const result = [];
  
  for (const [key, value] of activeReminders.entries()) {
    if (key.startsWith(`${prescriptionId}-`) && value.type === 'timer') {
      // Calculate time remaining
      const timeRemaining = value.nextTrigger - Date.now();
      
      result.push({
        id: key,
        prescription: value.prescription,
        schedule: value.schedule,
        timeRemaining,
        nextTriggerTime: new Date(value.nextTrigger).toLocaleTimeString()
      });
    }
  }
  
  return result;
};

/**
 * Test the voice with a sample message
 * @param {Object} options - Voice options
 * @returns {Promise} Promise that resolves when the test is complete
 */
const testVoice = (options = {}) => {
  return new Promise((resolve) => {
    // Initialize audio context
    initAudioContext();
    
    // Create a test message
    const speech = new SpeechSynthesisUtterance();
    speech.text = options.message || "This is a test of the medication reminder voice.";
    speech.volume = options.volume || 1.0;
    speech.rate = options.rate || 0.9;
    speech.pitch = options.pitch || 1.0;
    
    // If a specific voice is requested, try to use it
    if (options.voice) {
      const voices = window.speechSynthesis.getVoices();
      const selectedVoice = voices.find(v => v.name === options.voice);
      if (selectedVoice) {
        speech.voice = selectedVoice;
      }
    }
    
    // When the speech ends, resolve the promise
    speech.onend = () => {
      resolve(true);
    };
    
    // If there's an error, still resolve but with false
    speech.onerror = () => {
      resolve(false);
    };
    
    // Speak the message
    window.speechSynthesis.speak(speech);
  });
};

export default {
  setupReminder,
  clearReminder,
  requestNotificationPermission,
  initAudioContext,
  playAlarm,
  parseSchedule,
  getAvailableVoices,
  getActiveReminders,
  testVoice
};