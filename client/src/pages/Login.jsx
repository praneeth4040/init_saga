import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Auth.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle login logic here
    console.log('Login data:', formData);
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Welcome Back to MediTrack</h2>
        <p className="auth-subtitle">Sign in to manage your prescriptions and medicines</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </div>

          <div className="form-options">
            <div className="remember-me">
              <input type="checkbox" id="remember" />
              <label htmlFor="remember">Remember me</label>
            </div>
            <Link to="/forgot-password" className="forgot-password">
              Forgot Password?
            </Link>
          </div>

          <button type="submit" className="auth-button">
            Sign In
          </button>

          <div className="auth-divider">
            <span>or</span>
          </div>

          <p className="auth-switch">
            Don't have an account? <Link to="/register">Sign Up</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;