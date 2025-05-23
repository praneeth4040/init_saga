import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  const handleLogout = () => {
    // Clear user data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    navigate('/');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <span className="logo-text">MediTrack</span>
          <span className="logo-subtext">Your Prescription Companion</span>
        </Link>

        <div className="menu-icon" onClick={toggleMenu}>
          <span className={isMenuOpen ? 'bar open' : 'bar'}></span>
          <span className={isMenuOpen ? 'bar open' : 'bar'}></span>
          <span className={isMenuOpen ? 'bar open' : 'bar'}></span>
        </div>

        <ul className={isMenuOpen ? 'nav-menu active' : 'nav-menu'}>
          <li className="nav-item">
            <Link to="/" className="nav-link" onClick={() => setIsMenuOpen(false)}>
              Home
            </Link>
          </li>
          
          {isAuthenticated ? (
            <>
              <li className="nav-item">
                <Link 
                  to="/add-prescription" 
                  className="nav-link add-prescription-btn"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Add Prescription
                </Link>
              </li>
              <li className="nav-item">
                <button 
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }} 
                  className="nav-link logout-btn"
                >
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li className="nav-item">
                <Link 
                  to="/login" 
                  className="nav-link"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
              </li>
              <li className="nav-item">
                <Link 
                  to="/register" 
                  className="nav-link register-btn"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Register
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar; 