import React, { useState, useEffect } from 'react';
import RestaurantCard from '../components/RestaurantCard';
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
  
  // Lấy danh sách các loại ẩm thực từ dữ liệu nhà hàng
  const cuisines = restaurants.length > 0 
    ? [...new Set(restaurants.map(restaurant => restaurant.cuisine))]
    : [];

  if (loading) {
    return <div className="loading">Đang tải danh sách nhà hàng...</div>;
  }
  
  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="restaurant-page">
      <h1>Nhà hàng nổi bật</h1>
      
      <div className="filters">
        <input 
          type="text" 
          placeholder="Tìm kiếm nhà hàng..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select 
          value={selectedCuisine}
          onChange={(e) => setSelectedCuisine(e.target.value)}
        >
          <option value="">Tất cả ẩm thực</option>
          {cuisines.map(cuisine => (
            <option key={cuisine} value={cuisine}>{cuisine}</option>
          ))}
        </select>
      </div>
      
      {filteredRestaurants.length === 0 ? (
        <div className="no-results">
          <p>Không tìm thấy nhà hàng phù hợp. Vui lòng thử tìm kiếm khác.</p>
        </div>
      ) : (
        <div className="restaurant-grid">
          {filteredRestaurants.map(restaurant => (
            <RestaurantCard key={restaurant.id} restaurant={restaurant} />
          ))}
        </div>
      )}
    </div>
  );
}

export default RestaurantPage; 