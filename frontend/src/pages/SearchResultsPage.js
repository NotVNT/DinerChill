import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import RestaurantCard from '../components/RestaurantCard';
import SearchBar from '../components/SearchBar';
import { restaurantsAPI } from '../api';
import '../styles/SearchResultsPage.css';

function SearchResultsPage() {
  const location = useLocation();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Parse query parameters
  const query = new URLSearchParams(location.search);
  const searchTerm = query.get('q') || '';
  const selectedDate = query.get('date') || '';
  const guestCount = query.get('guests') || '';
  const selectedTime = query.get('time') || '';

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        
        // Get all restaurants
        const allRestaurants = await restaurantsAPI.getAll();
        
        // Filter based on search parameters
        let filteredResults = allRestaurants;
        
        if (searchTerm) {
          const term = searchTerm.toLowerCase();
          filteredResults = filteredResults.filter(restaurant => 
            restaurant.name.toLowerCase().includes(term) || 
            restaurant.cuisineType?.toLowerCase().includes(term) ||
            restaurant.description?.toLowerCase().includes(term) ||
            restaurant.location?.toLowerCase().includes(term)
          );
        }
        
        // Additional filters can be applied here based on date, guests, time
        // This would depend on your API's capabilities
        
        setResults(filteredResults);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching search results:', err);
        setError('Không thể tìm kiếm nhà hàng. Vui lòng thử lại sau.');
        setLoading(false);
      }
    };
    
    fetchResults();
  }, [searchTerm, selectedDate, guestCount, selectedTime]);
  
  const renderSearchInfo = () => {
    const filters = [];
    
    if (searchTerm) filters.push(`"${searchTerm}"`);
    if (selectedDate) {
      const formattedDate = new Date(selectedDate).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      filters.push(`Ngày: ${formattedDate}`);
    }
    if (guestCount) filters.push(`${guestCount} khách`);
    if (selectedTime) filters.push(`${selectedTime}`);
    
    return filters.join(' • ');
  };

  if (loading) {
    return (
      <div className="search-results-page">
        <SearchBar />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tìm kiếm nhà hàng phù hợp...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="search-results-page">
        <SearchBar />
        <div className="error-container">
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="retry-button">
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="search-results-page">
      <SearchBar />
      
      <div className="search-results-container">
        <div className="search-results-header">
          <h1>Kết quả tìm kiếm</h1>
          <p className="search-info">{renderSearchInfo()}</p>
          <p className="results-count">Tìm thấy {results.length} nhà hàng</p>
        </div>
        
        {results.length > 0 ? (
          <div className="search-results-grid">
            {results.map(restaurant => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </div>
        ) : (
          <div className="no-results">
            <h2>Không tìm thấy kết quả phù hợp</h2>
            <p>Vui lòng thử lại với các từ khóa khác hoặc điều chỉnh các tiêu chí tìm kiếm của bạn.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchResultsPage; 