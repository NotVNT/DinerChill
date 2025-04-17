import React, { useState, useEffect } from 'react';
import RestaurantCard from '../components/RestaurantCard';
import FilterBox from '../components/FilterBox';
import { useApp } from '../context/AppContext';

function RestaurantPage() {
  const { restaurants, loading, error } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('');
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  
  // Lọc nhà hàng dựa trên tìm kiếm và bộ lọc
  useEffect(() => {
    if (restaurants.length === 0) return;
    
    const results = restaurants.filter(restaurant => {
      const matchesSearch = restaurant.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCuisine = selectedCuisine === '' || restaurant.cuisine === selectedCuisine;
      return matchesSearch && matchesCuisine;
    });
    
    setFilteredRestaurants(results);
  }, [searchTerm, selectedCuisine, restaurants]);
  
  // Tạo các chức năng để sử dụng setSearchTerm và setSelectedCuisine
  const handleSearch = (term) => {
    setSearchTerm(term);
  };
  
  const handleCuisineSelect = (cuisine) => {
    setSelectedCuisine(cuisine);
  };
  
  // Sử dụng danh sách cuisine từ dữ liệu nhà hàng
  const cuisines = restaurants.length > 0 
    ? [...new Set(restaurants.map(restaurant => restaurant.cuisine))]
    : [];
    
  // Hiển thị danh sách các loại ẩm thực
  const renderCuisineFilters = () => {
    return (
      <div className="cuisine-filters">
        <button 
          className={selectedCuisine === '' ? 'active' : ''} 
          onClick={() => handleCuisineSelect('')}
        >
          Tất cả
        </button>
        {cuisines.map(cuisine => (
          <button 
            key={cuisine}
            className={selectedCuisine === cuisine ? 'active' : ''}
            onClick={() => handleCuisineSelect(cuisine)}
          >
            {cuisine}
          </button>
        ))}
      </div>
    );
  };

  if (loading) {
    return <div className="loading">Đang tải danh sách nhà hàng...</div>;
  }
  
  if (error) {
    return <div className="error-message">{error}</div>;
  }
  
  return (
    <div className="restaurant-page">
      <div className="container">
        <FilterBox />
      </div>
      
      <div className="search-controls">
        <input
          type="text"
          placeholder="Tìm kiếm nhà hàng..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="search-input"
        />
        {renderCuisineFilters()}
      </div>
      
      <div className="restaurant-list">
        {filteredRestaurants.length > 0 ? (
          filteredRestaurants.map(restaurant => (
            <RestaurantCard key={restaurant.id} restaurant={restaurant} />
          ))
        ) : (
          <div className="no-results">Không tìm thấy nhà hàng nào phù hợp</div>
        )}
      </div>
    </div>
  );
}

export default RestaurantPage; 