import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import RestaurantCard from '../components/RestaurantCard';
import '../styles/RestaurantList.css';

function RestaurantsPage() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const cuisineFromUrl = queryParams.get('cuisine');
  
  const { restaurants, loading, error } = useApp();
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  
  useEffect(() => {
    if (restaurants && restaurants.length > 0) {
      let filtered = [...restaurants];
      
      // Filter by cuisine from URL
      if (cuisineFromUrl) {
        const cuisineMap = {
          'lau': 'Lẩu',
          'buffet': 'Buffet',
          'hai-san': 'Hải sản',
          'lau-nuong': 'Lẩu & Nướng',
          'quan-nhau': 'Quán Nhậu',
          'mon-chay': 'Món chay',
          'do-tiec': 'Đồ tiệc',
          'han-quoc': 'Hàn Quốc',
          'nhat-ban': 'Nhật Bản',
          'mon-viet': 'Món Việt',
          'mon-thai': 'Món Thái',
          'mon-trung-hoa': 'Món Trung Hoa',
          'tiec-cuoi': 'Tiệc cưới',
          'do-uong': 'Đồ uống'
        };
        
        const cuisineName = cuisineMap[cuisineFromUrl] || cuisineFromUrl;
        
        filtered = filtered.filter(restaurant => 
          restaurant.cuisine?.toLowerCase().includes(cuisineName.toLowerCase()) ||
          restaurant.description?.toLowerCase().includes(cuisineName.toLowerCase()) ||
          restaurant.name?.toLowerCase().includes(cuisineName.toLowerCase())
        );
      }
      
      setFilteredRestaurants(filtered);
    }
  }, [restaurants, cuisineFromUrl]);
  
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Đang tải dữ liệu nhà hàng...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="error-container">
        <p>Lỗi: {error}</p>
        <button className="btn" onClick={() => window.location.reload()}>Thử lại</button>
      </div>
    );
  }
  
  const getCuisineTitle = () => {
    const cuisineMap = {
      'lau': 'Lẩu',
      'buffet': 'Buffet',
      'hai-san': 'Hải sản',
      'lau-nuong': 'Lẩu & Nướng',
      'quan-nhau': 'Quán Nhậu',
      'mon-chay': 'Món chay',
      'do-tiec': 'Đồ tiệc',
      'han-quoc': 'Hàn Quốc',
      'nhat-ban': 'Nhật Bản',
      'mon-viet': 'Món Việt',
      'mon-thai': 'Món Thái',
      'mon-trung-hoa': 'Món Trung Hoa',
      'tiec-cuoi': 'Tiệc cưới',
      'do-uong': 'Đồ uống'
    };
    
    return cuisineFromUrl ? cuisineMap[cuisineFromUrl] || cuisineFromUrl : 'Tất cả nhà hàng';
  };
  
  return (
    <div className="restaurant-list">
      <h2>{getCuisineTitle()}</h2>
      
      <div className="restaurant-grid">
        {filteredRestaurants.length > 0 ? (
          filteredRestaurants.map((restaurant) => (
            <RestaurantCard key={restaurant.id} restaurant={restaurant} />
          ))
        ) : (
          <p>Không tìm thấy nhà hàng nào phù hợp.</p>
        )}
      </div>
    </div>
  );
}

export default RestaurantsPage; 