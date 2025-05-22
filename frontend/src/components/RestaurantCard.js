import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import '../styles/RestaurantCard.css';

function RestaurantCard({ restaurant }) {
  const navigate = useNavigate();
  const { addToRecentlyViewed } = useApp();

  const [imageSrc, setImageSrc] = useState(restaurant?.image || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?fit=crop&w=300&h=200&q=80');

  const handleCardClick = () => {
    if (!restaurant?.id) return;
    addToRecentlyViewed(restaurant);
    const routes = {
      product: `/promotions/${restaurant.id}`,
      blog: `/blog/${restaurant.id}`,
      amenity: `/amenities/${restaurant.id}`,
    };
    const route = routes[restaurant.type] || `/restaurants/${restaurant.id}`;
    navigate(route);
  };

  const handleBooking = (e) => {
    e.stopPropagation();
    if (!restaurant?.id) return;
    navigate(`/reservation?restaurant=${restaurant.id}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCardClick();
    }
  };

  const handleImageError = () => {
    setImageSrc('https://images.unsplash.com/photo-1600585154360-0e7d76a0e0e7?fit=crop&w=300&h=200&q=80');
  };

  const renderStars = (rating) => {
    const numericRating = typeof rating === 'string' ? parseFloat(rating) : rating;
    if (isNaN(numericRating) || numericRating === 0) return null;

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

  if (!restaurant || !restaurant.id || !restaurant.name) return null;

  const discountValue = restaurant.discountPrice && restaurant.price 
    ? restaurant.price - restaurant.discountPrice 
    : null;

  return (
    <div
      className="restaurant-card"
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Xem chi tiết ${restaurant.type === 'product' ? 'sản phẩm' : restaurant.type === 'blog' ? 'bài viết' : restaurant.type === 'amenity' ? 'tiện ích' : 'nhà hàng'} ${restaurant.name}`}
    >
      <div className="card-image">
        <img src={imageSrc} alt={`Ảnh của ${restaurant.name}`} onError={handleImageError} />
        <div className="logo-overlay">DinerChill</div>
        {(restaurant.discount || discountValue) && (
          <span className="discount-badge">
            {restaurant.discount || (discountValue > 0 && `Giảm ${discountValue}K`)}
          </span>
        )}
      </div>
      <div className="card-content">
        <h3>{restaurant.name}</h3>
        <div className="rating-price">
          {typeof restaurant.rating !== 'undefined' && renderStars(restaurant.rating)}
          {(restaurant.price || restaurant.discountPrice) && (
            <span className="price">
              {restaurant.discountPrice && restaurant.price ? (
                <>
                  <span className="original-price">{restaurant.price}K</span>
                  <span className="discounted-price">{restaurant.discountPrice}K</span>
                </>
              ) : (
                `${restaurant.price || restaurant.discountPrice}K`
              )}
            </span>
          )}
        </div>
        <div className="additional-info">
          {restaurant.cuisine && <p className="cuisine">{restaurant.cuisine}</p>}
          {restaurant.offer && <p className="offer">{restaurant.offer}</p>}
          {restaurant.validUntil && <p className="valid-until">{restaurant.validUntil}</p>}
          {restaurant.location && (
            <p className="location">
              Tọa độ: {restaurant.location.latitude}, {restaurant.location.longitude}
            </p>
          )}
          {restaurant.description && <p className="description">{restaurant.description}</p>}
          {restaurant.date && <p className="date">{restaurant.date}</p>}
        </div>
        {restaurant.type !== 'product' && restaurant.type !== 'blog' && restaurant.type !== 'amenity' && (
          <button
            type="button"
            className="book-now-btn"
            onClick={handleBooking}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.stopPropagation();
                e.preventDefault();
                handleBooking(e);
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