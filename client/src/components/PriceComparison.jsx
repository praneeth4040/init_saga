import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import '../styles/PriceComparison.css';

const PriceComparison = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [distance, setDistance] = useState(10); // Default 10km
  const [lowestPrice, setLowestPrice] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const medicineName = searchParams.get('medicine') || '';

  useEffect(() => {
    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          // Default to Bangalore coordinates if location access is denied
          setUserLocation({
            lat: 12.9716,
            lng: 77.5946
          });
        }
      );
    } else {
      // Default to Bangalore coordinates if geolocation is not supported
      setUserLocation({
        lat: 12.9716,
        lng: 77.5946
      });
    }
  }, []);

  useEffect(() => {
    const fetchPrices = async () => {
      if (!medicineName || !userLocation) return;

      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(
          `http://localhost:3000/api/prices/compare/${encodeURIComponent(medicineName)}?maxDistance=${distance * 1000}&lat=${userLocation.lat}&lng=${userLocation.lng}`
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch prices');
        }

        const data = await response.json();
        setPrices(data.prices || []);
        setLowestPrice(data.lowestPrice);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching prices:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPrices();
  }, [medicineName, distance, userLocation]);

  const handleDistanceChange = (e) => {
    setDistance(parseInt(e.target.value));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/compare?medicine=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  if (loading) {
    return (
      <div className="price-comparison-container">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading prices...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="price-comparison-container">
        <div className="error">
          <h3>Error</h3>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="price-comparison-container">
      <form onSubmit={handleSearch} className="search-container">
        <input
          type="text"
          className="search-input"
          placeholder="Search for medications..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </form>

      {medicineName ? (
        <>
          <h2>Price Comparison for {medicineName}</h2>
          
          <div className="distance-filter">
            <label htmlFor="distance">Search radius (km):</label>
            <select id="distance" value={distance} onChange={handleDistanceChange}>
              <option value="5">5 km</option>
              <option value="10">10 km</option>
              <option value="20">20 km</option>
              <option value="50">50 km</option>
            </select>
          </div>

          {lowestPrice && (
            <div className="lowest-price-banner">
              <h3>Best Price Found!</h3>
              <p>{lowestPrice.pharmacy.name} - ₹{lowestPrice.price} {lowestPrice.unit}</p>
              <p className="pharmacy-address">{lowestPrice.pharmacy.address}</p>
            </div>
          )}

          {prices.length === 0 ? (
            <div className="no-results">
              <p>No prices found for {medicineName} within {distance}km.</p>
              <p>Try adjusting the search radius or searching for a different medication.</p>
            </div>
          ) : (
            <div className="prices-grid">
              {prices.map((price) => (
                <div key={price._id} className="price-card">
                  <h3>{price.pharmacy.name}</h3>
                  <p className="price">₹{price.price} {price.unit}</p>
                  <div className="pharmacy-details">
                    <p>{price.pharmacy.address}</p>
                    <p>Phone: {price.pharmacy.phone}</p>
                  </div>
                  <p className="last-updated">
                    Last updated: {new Date(price.lastUpdated).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="no-results">
          <h2>Search for Medications</h2>
          <p>Enter the name of the medication you're looking for in the search bar above.</p>
          <p>We'll show you prices from pharmacies near you.</p>
        </div>
      )}
    </div>
  );
};

export default PriceComparison; 