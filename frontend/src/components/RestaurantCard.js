import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import './RestaurantCard.css';

function RestaurantCard({ restaurant }) {
  const navigate = useNavigate();
  const { addToRecentlyViewed } = useApp();

  // Xử lý click vào card (đi đến trang chi tiết và lưu vào lịch sử xem)
  const handleCardClick = () => {
    if (!restaurant?.id) return;
    addToRecentlyViewed(restaurant);
    if (restaurant.type === 'product') {
      navigate(`/promotions/${restaurant.id}`);
    } else {
      navigate(`/restaurants/${restaurant.id}`);
    }
  };

  // Xử lý click nút đặt bàn (chỉ cho nhà hàng)
  const handleBooking = () => {
    if (!restaurant?.id) return;
    navigate(`/reservation?restaurant=${restaurant.id}`);
  };

  // Xử lý sự kiện bàn phím cho accessibility
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCardClick();
    }
  };

  // Hiển thị đánh giá dạng ngôi sao
  const renderStars = (rating) => {
    // Chuyển rating thành số và kiểm tra hợp lệ
    const numericRating = typeof rating === 'string' ? parseFloat(rating) : rating;
    if (isNaN(numericRating) || numericRating == null) return null;

    const stars = Math.round(numericRating);
    const fullStars = Math.min(Math.max(stars, 0), 5);
    const emptyStars = 5 - fullStars;
    return (
      <>
        <span className="stars">{'★'.repeat(fullStars) + '☆'.repeat(emptyStars)}</span>
        <span className="rating-value">{numericRating.toFixed(1)}</span>
      </>
    );
  };

  // Kiểm tra dữ liệu restaurant để tránh lỗi
  if (!restaurant) return null;

  return (
    <div
      className="restaurant-card"
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Xem chi tiết ${restaurant.name}`}
    >
      <div className="card-image">
        <img
          src={restaurant.image || 'https://via.placeholder.com/300x200'}
          alt={restaurant.name}
          onError={(e) => (e.target.src = 'https://via.placeholder.com/300x200')}
        />
        <div className="logo-overlay">DinerChill</div>
        {restaurant.discount && (
          <span className="discount-badge">{restaurant.discount}</span>
        )}
      </div>
      <div className="card-content">
        <h3>{restaurant.name}</h3>
        <div className="rating-price">
          {typeof restaurant.rating !== 'undefined' && !isNaN(parseFloat(restaurant.rating)) && renderStars(restaurant.rating)}
          <span className="price">$$$</span>
        </div>
        {restaurant.cuisine && <p className="cuisine">{restaurant.cuisine}</p>}
        {restaurant.discount && <p className="discount">{restaurant.discount}</p>}
        {restaurant.location && <p className="location">{restaurant.location}</p>}
        {restaurant.description && <p className="description">{restaurant.description}</p>}
        {restaurant.type !== 'product' && (
          <button
            className="book-now-btn"
            onClick={(e) => {
              e.stopPropagation();
              handleBooking();
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.stopPropagation();
                e.preventDefault();
                handleBooking();
              }
            }}
            tabIndex={0}
            aria-label={`Đặt bàn ngay tại ${restaurant.name}`}
          >
            Đặt chỗ ngay
          </button>
        )}
      </div>
    </div>
  );
}

export default RestaurantCard;