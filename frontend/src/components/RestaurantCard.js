import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import '../styles/RestaurantCard.css';

function RestaurantCard({ restaurant }) {
  const navigate = useNavigate();
  const { addToRecentlyViewed } = useApp();


  const [imageSrc, setImageSrc] = useState(restaurant?.image || 'https://via.placeholder.com/300x200');

  const handleCardClick = () => {
    if (!restaurant?.id) return;
    addToRecentlyViewed(restaurant);
    if (restaurant.type === 'product') {
      navigate(`/promotions/${restaurant.id}`);

    } else if (restaurant.type === 'blog') {
      navigate(`/blog/${restaurant.id}`);
    } else if (restaurant.type === 'amenity') {
      navigate(`/amenities/${restaurant.id}`);
    } else {
      navigate(`/restaurants/${restaurant.id}`);
    }
  };


  const handleBooking = () => {
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
    setImageSrc('/assets/placeholder-300x200.jpg');
  };

  const renderStars = (rating) => {

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

        <img src={imageSrc} alt={restaurant.name} onError={handleImageError} />
        <div className="logo-overlay">DinerChill</div>
        {(restaurant.discount || restaurant.discountPrice) && (
          <span className="discount-badge">
            {restaurant.discount || (restaurant.discountPrice && `Giảm ${restaurant.price - restaurant.discountPrice}K`)}
          </span>

        )}
      </div>
      <div className="card-content">
        <h3>{restaurant.name}</h3>
        <div className="rating-price">

          {typeof restaurant.rating !== 'undefined' && renderStars(restaurant.rating)}
          {(restaurant.price || restaurant.discountPrice) && (
            <span className="price">
              {restaurant.discountPrice ? (
                <>
                  <span className="original-price">{restaurant.price}K</span>
                  <span className="discounted-price">{restaurant.discountPrice}K</span>
                </>
              ) : (
                `${restaurant.price}K`
              )}
            </span>
          )}
        </div>
        {restaurant.cuisine && <p className="cuisine">{restaurant.cuisine}</p>}
        {restaurant.offer && <p className="offer">{restaurant.offer}</p>}
        {restaurant.validUntil && <p className="valid-until">{restaurant.validUntil}</p>}
        {restaurant.location && <p className="location">{restaurant.location}</p>}
        {restaurant.description && <p className="description">{restaurant.description}</p>}
        {restaurant.date && <p className="date">{restaurant.date}</p>}
        {restaurant.type !== 'product' && restaurant.type !== 'blog' && restaurant.type !== 'amenity' && (

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