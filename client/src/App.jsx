import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AddPrescription from './pages/AddPrescription';
import PrescriptionDetail from './pages/PrescriptionDetail';
import TestReminder from './pages/TestReminder';
import Chatbot from './pages/Chatbot';
import reminderService from './services/reminderService';
import './App.css';

function App() {
  // Initialize audio context and request notification permissions
  useEffect(() => {
    // Try to initialize audio context (will be suspended until user interaction)
    reminderService.initAudioContext();
    
    // Request notification permissions
    const requestPermissions = async () => {
      await reminderService.requestNotificationPermission();
    };
    
    requestPermissions();
  }, []);

  return (
    <Router>
      <div className="app">
        <Navbar />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/chatbot" element={<Chatbot />} />
          <Route path='/add-prescription' element={<AddPrescription/>}/>
          <Route path='/prescription/:id' element={<PrescriptionDetail/>}/>
          <Route path='/test-reminder' element={<TestReminder/>}/>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
