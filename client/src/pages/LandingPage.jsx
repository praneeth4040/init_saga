import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  const handleViewMedicines = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Understand Your Prescription Medicines</h1>
          <p>Get detailed information about your medications, compare prices, and manage your treatment effectively</p>
          <button className="cta-button" onClick={handleViewMedicines}>
            {isAuthenticated ? 'View Dashboard' : 'View Your Medicines'}
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <h2>What You Can Do</h2>
        <div className="feature-grid">
          <div className="feature-card">
            <div className="feature-icon">💊</div>
            <h3>Medicine Details</h3>
            <p>Get comprehensive information about your prescribed medicines</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💰</div>
            <h3>Price Comparison</h3>
            <p>Compare medicine prices across different pharmacies</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⏰</div>
            <h3>Dosage Schedule</h3>
            <p>Set reminders for your medication schedule</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📋</div>
            <h3>Prescription History</h3>
            <p>Keep track of all your prescribed medicines</p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <h2>Simple Steps to Get Started</h2>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Upload Prescription</h3>
            <p>Share your prescription details with us</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Get Information</h3>
            <p>Receive detailed medicine information</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Compare Prices</h3>
            <p>Find the best prices for your medicines</p>
          </div>
          <div className="step">
            <div className="step-number">4</div>
            <h3>Manage Schedule</h3>
            <p>Set up your medication reminders</p>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="cta-section">
        <h2>Ready to Understand Your Medicines Better?</h2>
        <button className="cta-button" onClick={handleViewMedicines}>
          {isAuthenticated ? 'Go to Dashboard' : 'Start Now'}
        </button>
      </section>
    </div>
  );
};

export default LandingPage; 