import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';

function RestaurantDetailPage() {
  const { id } = useParams();
  const { restaurants, loading, error } = useApp();
  const [restaurant, setRestaurant] = useState(null);
  
  // Lấy thông tin nhà hàng dựa trên ID
  useEffect(() => {
    if (restaurants.length > 0) {
      const foundRestaurant = restaurants.find(r => r.id === id);
      setRestaurant(foundRestaurant);
    }
  }, [id, restaurants]);
  
  if (loading) {
    return <div className="loading">Đang tải thông tin nhà hàng...</div>;
  }
  
  if (error) {
    return <div className="error-message">{error}</div>;
  }
  
  if (!restaurant) {
    return <div className="error-message">Không tìm thấy nhà hàng này</div>;
  }
  
  return (
    <div className="restaurant-detail-page">
      <div className="container">
        <div className="restaurant-header">
          <div className="restaurant-image">
            <img src={restaurant.image} alt={restaurant.name} />
          </div>
          <div className="restaurant-info">
            <h1>{restaurant.name}</h1>
            <div className="restaurant-meta">
              <span className="cuisine">{restaurant.cuisine}</span>
              <span className="separator">•</span>
              <span className="price">{restaurant.price}</span>
              <span className="separator">•</span>
              <span className="rating">
                <i className="fas fa-star"></i> {restaurant.rating}
              </span>
              <span className="separator">•</span>
              <span className="reviews">{restaurant.reviewCount} đánh giá</span>
            </div>
            <div className="restaurant-address">
              <i className="fas fa-map-marker-alt"></i> {restaurant.address}
            </div>
            <div className="restaurant-opening-hours">
              <i className="far fa-clock"></i> {restaurant.openingHours}
            </div>
          </div>
        </div>
        
        <div className="restaurant-actions">
          <button className="btn btn-primary">
            <i className="fas fa-bookmark"></i> Đặt bàn
          </button>
          <button className="btn btn-outline">
            <i className="fas fa-heart"></i> Yêu thích
          </button>
          <button className="btn btn-outline">
            <i className="fas fa-share"></i> Chia sẻ
          </button>
        </div>
        
        <div className="restaurant-description">
          <h2>Giới thiệu</h2>
          <p>{restaurant.description}</p>
        </div>
        
        <div className="restaurant-menu">
          <h2>Thực đơn nổi bật</h2>
          <div className="menu-items">
            {restaurant.menu && restaurant.menu.map((item, index) => (
              <div className="menu-item" key={index}>
                <div className="menu-item-image">
                  <img src={item.image} alt={item.name} />
                </div>
                <div className="menu-item-info">
                  <h3>{item.name}</h3>
                  <p>{item.description}</p>
                  <div className="menu-item-price">{item.price}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="restaurant-reviews">
          <h2>Đánh giá từ khách hàng</h2>
          <div className="reviews-list">
            {restaurant.reviews && restaurant.reviews.map((review, index) => (
              <div className="review" key={index}>
                <div className="review-header">
                  <div className="reviewer-name">{review.username}</div>
                  <div className="review-rating">
                    <i className="fas fa-star"></i> {review.rating}
                  </div>
                </div>
                <div className="review-date">{review.date}</div>
                <div className="review-content">{review.comment}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default RestaurantDetailPage; 