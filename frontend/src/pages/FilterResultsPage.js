import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import RestaurantCard from '../components/RestaurantCard';
import FilterBox from '../components/FilterBox';
import { useApp } from '../context/AppContext';
import { restaurantsAPI } from '../api';
import '../styles/FilterResultsPage.css';

function FilterResultsPage() {
  const location = useLocation();
  const { filters } = useApp();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortOption, setSortOption] = useState('relevance');
  
  // Parse filter parameters from URL if present
  const query = new URLSearchParams(location.search);
  const locationParam = query.get('location') || filters.location || '';
  const distanceParam = query.get('distance') || filters.distance || 'all';
  const priceParam = query.get('price') || filters.price || 'all';
  const ratingParam = query.get('rating') || filters.rating || 'all';
  const operatingHoursParam = query.get('operatingHours') || filters.operatingHours || 'all';
  const cuisineParam = query.get('cuisine') || filters.cuisine || 'all';

  // Fetch filtered results from database
  useEffect(() => {
    const fetchFilteredResults = async () => {
      try {
        setLoading(true);
        
        // Get all restaurants from API
        const allRestaurants = await restaurantsAPI.getAll();
        
        // Apply filters
        let filteredResults = allRestaurants;
        
        // Filter by location
        if (locationParam && locationParam !== '') {
          filteredResults = filteredResults.filter(restaurant => 
            restaurant.address?.includes(locationParam) ||
            restaurant.location?.includes(locationParam)
          );
        }
        
        // Filter by distance
        if (distanceParam !== 'all') {
          filteredResults = filteredResults.filter(restaurant => {
            const distance = restaurant.distance || 0;
            return distanceParam === 'near' ? distance <= 2 :
                  distanceParam === 'under5km' ? distance <= 5 :
                  distanceParam === 'under10km' ? distance <= 10 : true;
          });
        }
        
        // Filter by price
        if (priceParam !== 'all') {
          filteredResults = filteredResults.filter(restaurant => {
            const priceRange = restaurant.priceRange || '';
            if (!priceRange) return false;
            
            // Extract numeric values from priceRange (format: "200.000đ - 500.000đ")
            const priceValues = priceRange.split('-').map(p => 
              parseInt(p.replace(/\D/g, ''), 10)
            );
            
            // Use the first number as min price and second as max price
            const minPrice = priceValues[0] || 0;
            const maxPrice = priceValues[1] || minPrice;
            
            return priceParam === 'low' ? minPrice < 100000 :
                  priceParam === 'medium' ? (minPrice >= 100000 && maxPrice < 300000) :
                  priceParam === 'high' ? (minPrice >= 300000 && maxPrice < 500000) :
                  priceParam === 'luxury' ? minPrice >= 500000 : true;
          });
        }
        
        // Filter by rating
        if (ratingParam !== 'all') {
          filteredResults = filteredResults.filter(restaurant => {
            const rating = restaurant.rating || 0;
            return ratingParam === 'above4' ? rating >= 4 :
                  ratingParam === 'above3' ? rating >= 3 : true;
          });
        }
        
        // Filter by operating hours
        if (operatingHoursParam !== 'all') {
          filteredResults = filteredResults.filter(restaurant => {
            // Convert time strings to hours (format: "11:00:00")
            const openingTime = restaurant.openingTime || '';
            const closingTime = restaurant.closingTime || '';
            
            if (!openingTime || !closingTime) return false;
            
            // Extract hours from time strings
            const openHour = parseInt(openingTime.split(':')[0], 10) || 0;
            const closeHour = parseInt(closingTime.split(':')[0], 10) || 24;
            
            return operatingHoursParam === 'morning' ? (openHour <= 6 && closeHour >= 11) :
                  operatingHoursParam === 'lunch' ? (openHour <= 11 && closeHour >= 14) :
                  operatingHoursParam === 'evening' ? (openHour <= 17 && closeHour >= 22) :
                  operatingHoursParam === 'latenight' ? (openHour <= 22 && closeHour >= 2) :
                  operatingHoursParam === '24h' ? (openHour === 0 && closeHour === 24) : true;
          });
        }
        
        // Filter by cuisine type
        if (cuisineParam !== 'all') {
          filteredResults = filteredResults.filter(restaurant => 
            restaurant.cuisineType?.toLowerCase().includes(cuisineParam.toLowerCase())
          );
        }
        
        // Apply sorting
        sortResults(filteredResults, sortOption);
        
        setResults(filteredResults);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching filtered results:', err);
        setError('Không thể tải dữ liệu nhà hàng. Vui lòng thử lại sau.');
        setLoading(false);
      }
    };
    
    fetchFilteredResults();
  }, [locationParam, distanceParam, priceParam, ratingParam, operatingHoursParam, cuisineParam, sortOption]);
  
  // Sort results based on selected option
  const sortResults = (data, sortBy) => {
    switch(sortBy) {
      case 'price-asc':
        return data.sort((a, b) => (a.averagePrice || 0) - (b.averagePrice || 0));
      case 'price-desc':
        return data.sort((a, b) => (b.averagePrice || 0) - (a.averagePrice || 0));
      case 'rating-desc':
        return data.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case 'distance-asc':
        return data.sort((a, b) => (a.distance || 0) - (b.distance || 0));
      case 'relevance':
      default:
        // Default sorting - newest or most relevant
        return data;
    }
  };
  
  // Handle sort change
  const handleSortChange = (e) => {
    setSortOption(e.target.value);
  };
  
  // Render filter information
  const renderFilterInfo = () => {
    const activeFilters = [];
    
    if (locationParam) activeFilters.push(`Khu vực: ${locationParam}`);
    
    if (distanceParam !== 'all') {
      const distanceLabels = {
        'near': 'Gần nhất',
        'under5km': 'Dưới 5km',
        'under10km': 'Dưới 10km'
      };
      activeFilters.push(`Khoảng cách: ${distanceLabels[distanceParam] || distanceParam}`);
    }
    
    if (priceParam !== 'all') {
      const priceLabels = {
        'low': 'Dưới 100.000đ',
        'medium': '100.000đ - 300.000đ',
        'high': '300.000đ - 500.000đ',
        'luxury': 'Trên 500.000đ'
      };
      activeFilters.push(`Giá: ${priceLabels[priceParam] || priceParam}`);
    }
    
    if (ratingParam !== 'all') {
      const ratingLabels = {
        'above4': 'Trên 4 sao',
        'above3': 'Trên 3 sao'
      };
      activeFilters.push(`Đánh giá: ${ratingLabels[ratingParam] || ratingParam}`);
    }
    
    if (operatingHoursParam !== 'all') {
      const hoursLabels = {
        'morning': 'Buổi sáng (6:00 - 11:00)',
        'lunch': 'Buổi trưa (11:00 - 14:00)',
        'evening': 'Buổi tối (17:00 - 22:00)',
        'latenight': 'Khuya (22:00 - 2:00)',
        '24h': 'Mở cửa 24h'
      };
      activeFilters.push(`Giờ mở cửa: ${hoursLabels[operatingHoursParam] || operatingHoursParam}`);
    }
    
    if (cuisineParam !== 'all') {
      activeFilters.push(`Loại: ${cuisineParam}`);
    }
    
    return activeFilters.join(' • ');
  };

  if (loading) {
    return (
      <div className="filter-results-page">
        <FilterBox />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải dữ liệu nhà hàng...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="filter-results-page">
        <FilterBox />
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
    <div className="filter-results-page">
      <FilterBox />
      
      <div className="filter-results-container">
        <div className="filter-results-header">
          <div className="filter-results-info">
            <h1>Kết quả lọc</h1>
            {renderFilterInfo() && (
              <p className="filter-info">{renderFilterInfo()}</p>
            )}
            <p className="results-count">Tìm thấy {results.length} nhà hàng</p>
          </div>
          
          <div className="sort-options">
            <label htmlFor="sort-select">Sắp xếp theo:</label>
            <select 
              id="sort-select" 
              value={sortOption}
              onChange={handleSortChange}
              className="sort-select"
            >
              <option value="relevance">Phù hợp nhất</option>
              <option value="rating-desc">Đánh giá cao nhất</option>
              <option value="price-asc">Giá: Thấp đến cao</option>
              <option value="price-desc">Giá: Cao đến thấp</option>
              <option value="distance-asc">Gần nhất trước</option>
            </select>
          </div>
        </div>
        
        {results.length > 0 ? (
          <div className="filter-results-grid">
            {results.map(restaurant => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </div>
        ) : (
          <div className="no-results">
            <h2>Không tìm thấy kết quả phù hợp</h2>
            <p>Vui lòng thử lại với các bộ lọc khác hoặc mở rộng tiêu chí tìm kiếm của bạn.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default FilterResultsPage; 