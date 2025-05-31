import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { categoriesAPI } from '../services/api';
import RestaurantCard from '../components/RestaurantCard';
import '../styles/pages/CategoryPage.css';

const DoTiec = () => {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true);
        const data = await categoriesAPI.getRestaurantsByCategoryName('Đồ tiệc');
        setRestaurants(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching restaurants:', err);
        setError('Không thể tải nhà hàng. Vui lòng thử lại sau.');
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  if (loading) return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Đang tải nhà hàng...</p>
    </div>
  );

  if (error) return (
    <div className="error-container">
      <p>{error}</p>
      <button onClick={() => navigate('/')}>Quay lại trang chủ</button>
    </div>
  );

  return (
    <div className="category-page">
      <div className="category-header">
        <h1>Đồ Tiệc</h1>
        <p>Khám phá các món đồ tiệc ngon dành cho các dịp lễ và sự kiện</p>
      </div>
      
      <div className="restaurant-grid">
        {restaurants.length > 0 ? (
          restaurants.map(restaurant => (
            <RestaurantCard key={restaurant.id} restaurant={restaurant} />
          ))
        ) : (
          <p className="no-restaurants">Không tìm thấy nhà hàng nào thuộc danh mục này.</p>
        )}
      </div>
    </div>
  );
};

export default DoTiec;
