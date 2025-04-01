import React from 'react';
import { useNavigate } from 'react-router-dom';

function RestaurantCard({ restaurant }) {
  const navigate = useNavigate();
  
  const handleBooking = () => {
    // Chuyển đến trang đặt bàn với thông tin nhà hàng đã chọn
    navigate(`/reservation?restaurant=${restaurant.id}`);
  };
  
  return (
    <div className="restaurant-card">
      <img src={restaurant.image} alt={restaurant.name} />
      <div className="restaurant-info">
        <h3>{restaurant.name}</h3>
        <p className="cuisine">{restaurant.cuisine}</p>
        <p className="rating">⭐ {restaurant.rating}</p>
        <p className="description">{restaurant.description}</p>
        <button className="btn" onClick={handleBooking}>Đặt bàn ngay</button>
      </div>
    </div>
  );
}

export default RestaurantCard; 