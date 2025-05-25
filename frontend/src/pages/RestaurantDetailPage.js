import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { restaurantsAPI } from '../services/api';
import '../styles/RestaurantDetailPage.css';

function RestaurantDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { addToRecentlyViewed, userName } = useApp();
  const [restaurant, setRestaurant] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [notification, setNotification] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [formData, setFormData] = useState({
    guests: 2,
    children: 0,
    date: new Date().toISOString().split('T')[0],
    time: '',
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedImageSource, setSelectedImageSource] = useState(null);
  const [selectedPromotion, setSelectedPromotion] = useState(null);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [reviewForm, setReviewForm] = useState({ rating: 0, comment: '' });
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const [favoriteList, setFavoriteList] = useState([]);
  const [currentModalImageIndex, setCurrentModalImageIndex] = useState(0);
  const [showReservationForm, setShowReservationForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const showReservation = searchParams.get('showReservation');
    if (showReservation === 'true') {
      setShowReservationForm(true);
      document.getElementById('booking-section')?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [location]);

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        setLoading(true);
        const data = await restaurantsAPI.getById(id);
        if (!data) throw new Error(`Không thể tìm thấy nhà hàng với ID: ${id}`);
        
        setRestaurant(data);
        
        if (data && data.id) {
          addToRecentlyViewed(data);
        }

        // Generate time slots based on opening and closing time
        if (data.openingTime && data.closingTime) {
          const times = generateTimeSlots(data.openingTime, data.closingTime);
          setAvailableTimes(times);
          setFormData((prev) => ({ ...prev, time: times[0] || '' }));
        } else {
          setAvailableTimes([]);
          setFormData((prev) => ({ ...prev, time: '' }));
        }
      } catch (err) {
        console.error('Lỗi tìm nhà hàng:', err);
        setError(err.message);
        setRestaurant(null);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurant();
  }, [id, addToRecentlyViewed]);

  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    setIsFavorite(favorites.includes(parseInt(id)));
    setFavoriteList(favorites);
  }, [id]);

  useEffect(() => {
    let isMounted = true;
    
    const getUserLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            if (isMounted) {
              const { latitude, longitude } = position.coords;
              setUserLocation(`${latitude},${longitude}`);
            }
          },
          (err) => {
            console.log('Không thể lấy vị trí người dùng:', err.message);
            if (isMounted) setUserLocation('');
          }
        );
      } else {
        console.log('Trình duyệt không hỗ trợ định vị.');
        if (isMounted) setUserLocation('');
      }
    };
    
    if (userLocation === null) {
      getUserLocation();
    }
    
    return () => { isMounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const generateTimeSlots = (openTime, closeTime) => {
    const times = [];
    const [openHour, openMinute] = openTime.split(':').map(Number);
    const [closeHour, closeMinute] = closeTime.split(':').map(Number);

    let currentHour = openHour;
    let currentMinute = openMinute;

    while (
      (currentHour < closeHour) ||
      (currentHour === closeHour && currentMinute <= closeMinute)
    ) {
      const timeString = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
      times.push(timeString);

      currentMinute += 30;
      if (currentMinute >= 60) {
        currentMinute = 0;
        currentHour += 1;
      }
    }

    return times;
  };

  const handleFavorite = () => {
    const favorites = [...favoriteList];
    const favoriteData = {
      id: parseInt(id),
      name: restaurant.name,
      image: restaurant.image,
      address: restaurant.address,
    };

    if (isFavorite) {
      const updatedFavorites = favorites.filter(favId => favId !== parseInt(id));
      localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
      const existingFavoriteDetails = JSON.parse(localStorage.getItem('favoriteDetails') || '[]');
      const updatedFavoriteDetails = existingFavoriteDetails.filter(fav => fav.id !== parseInt(id));
      localStorage.setItem('favoriteDetails', JSON.stringify(updatedFavoriteDetails));
      setFavoriteList(updatedFavorites);
      setNotification('Đã bỏ yêu thích nhà hàng.');
      console.log(`Đã xóa ${restaurant.name} khỏi danh sách yêu thích của tài khoản.`);
    } else {
      favorites.push(parseInt(id));
      localStorage.setItem('favorites', JSON.stringify(favorites));
      const existingFavoriteDetails = JSON.parse(localStorage.getItem('favoriteDetails') || '[]');
      if (!existingFavoriteDetails.some(fav => fav.id === parseInt(id))) {
        localStorage.setItem('favoriteDetails', JSON.stringify([...existingFavoriteDetails, favoriteData]));
      }
      setFavoriteList(favorites);
      setNotification('Đã thêm vào danh sách yêu thích.');
      console.log(`Đã thêm ${restaurant.name} vào danh sách yêu thích của tài khoản.`);
    }
    setIsFavorite(!isFavorite);
    setTimeout(() => setNotification(null), 2000);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setNotification('Đã sao chép liên kết chia sẻ!');
      setTimeout(() => setNotification(null), 2000);
    }).catch(err => {
      console.error('Lỗi khi sao chép liên kết:', err);
      setNotification('Không thể sao chép liên kết. Vui lòng thử lại.');
      setTimeout(() => setNotification(null), 2000);
    });
  };

  const handleOpenGoogleMaps = () => {
    if (!restaurant?.address) {
      setNotification('Địa chỉ nhà hàng không có sẵn.');
      return;
    }
    const encodedDestination = encodeURIComponent(restaurant.address);
    let googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodedDestination}`;
    if (userLocation) {
      const encodedOrigin = encodeURIComponent(userLocation);
      googleMapsUrl += `&origin=${encodedOrigin}`;
    }
    window.open(googleMapsUrl, '_blank');
  };

  const handleFormChange = (e) => {
    e.stopPropagation();
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBookNow = () => {
    try {
      const query = new URLSearchParams({
        restaurant: id,
        date: formData.date,
        time: formData.time,
        guests: formData.guests.toString(),
        children: formData.children.toString(),
      }).toString();
      navigate(`/reservation?${query}`);
    } catch (err) {
      console.error('Lỗi khi chuyển hướng:', err);
      setNotification('Có lỗi khi chuyển hướng đến trang đặt bàn. Vui lòng thử lại.');
      setTimeout(() => setNotification(null), 2000);
    }
  };

  const handleImageClick = (index, source) => {
    setCurrentModalImageIndex(index);
    setSelectedImageSource(source);
    setSelectedImage(true);
  };

  const closeImageModal = () => {
    setSelectedImage(null);
    setSelectedImageSource(null);
    setCurrentModalImageIndex(0);
  };

  const nextImage = () => {
    let images;
    if (selectedImageSource === 'menu') {
      images = (restaurant.menu || []).map(item => item.image);
    } else if (selectedImageSource === 'details') {
      images = restaurant.detailImages || [];
    } else {
      images = restaurant.images || [];
    }
    setCurrentModalImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    let images;
    if (selectedImageSource === 'menu') {
      images = (restaurant.menu || []).map(item => item.image);
    } else if (selectedImageSource === 'details') {
      images = restaurant.detailImages || [];
    } else {
      images = restaurant.images || [];
    }
    setCurrentModalImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handlePromotionClick = (e, promo) => {
    e.stopPropagation();
    setSelectedPromotion(promo);
  };

  const closePromotionModal = () => {
    setSelectedPromotion(null);
  };

  const applyPromotionAndBook = (promo) => {
    if (!promo) {
      setNotification('Không có ưu đãi nào được chọn.');
      return;
    }
    try {
      const query = new URLSearchParams({
        restaurant: id,
        date: formData.date,
        time: formData.time,
        guests: formData.guests.toString(),
        children: formData.children.toString(),
        promotion: promo.title || '',
      }).toString();
      console.log('Navigating with query:', query);
      navigate(`/reservation?${query}`);
    } catch (err) {
      console.error('Lỗi khi chuyển hướng:', err);
      setNotification('Có lỗi khi chuyển hướng. Vui lòng thử lại.');
    }
    closePromotionModal();
  };

  const handleReviewChange = (e) => {
    const { name, value } = e.target;
    setReviewForm((prev) => ({ ...prev, [name]: name === 'rating' ? parseInt(value) : value }));
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    try {
      alert('Tính năng đánh giá đã bị vô hiệu hóa');
      // Reset form
      setReviewForm({ rating: 0, comment: '' });
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Có lỗi xảy ra khi gửi đánh giá');
    }
  };

  const handleToggleReservationForm = () => {
    setShowReservationForm((prev) => !prev);
    if (!showReservationForm) {
      document.getElementById('booking-section')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  // Function to get proper image URL
  const getImageUrl = (image) => {
    if (!image) return '';
    
    // If it's an object with image_path property (from RestaurantImage model)
    if (typeof image === 'object' && image.image_path) {
      const path = image.image_path;
      
      // If it's a full URL already
      if (path.startsWith('http')) {
        return path;
      }
      
      // Handle uploads directory paths
      if (path.includes('uploads/') || path.includes('uploads\\')) {
        // Remove any /api prefix if present
        return `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/uploads/${path.split('uploads/').pop().split('uploads\\').pop()}`;
      }
      
      // Default case - just append to API URL
      return `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/${path.replace(/^\//, '')}`;
    }
    
    // If image is a string (direct path)
    if (typeof image === 'string') {
      // If it's a full URL already
      if (image.startsWith('http')) {
        return image;
      }
      
      // Handle uploads directory paths
      if (image.includes('uploads/') || image.includes('uploads\\')) {
        return `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/uploads/${image.split('uploads/').pop().split('uploads\\').pop()}`;
      }
      
      // Default case
      return `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/${image.replace(/^\//, '')}`;
    }
    
    return '';
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Đang tải thông tin nhà hàng...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <div className="error-actions">
          <button className="btn" onClick={() => navigate('/restaurants')}>
            Quay lại danh sách nhà hàng
          </button>
          <button className="btn" onClick={() => window.location.reload()}>
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="error-container">
        <p className="error-message">Không tìm thấy nhà hàng với ID: {id}</p>
        <button className="btn" onClick={() => navigate('/restaurants')}>
          Quay lại danh sách nhà hàng
        </button>
      </div>
    );
  }

  const promotions = restaurant.promotions || [];
  const currentDate = new Date();
  const currentDay = currentDate.toLocaleDateString('vi-VN', { weekday: 'long' });
  const currentHour = currentDate.getHours();
  const currentMinute = currentDate.getMinutes();

  const amenitiesEntries = restaurant.amenities ? Object.entries(restaurant.amenities) : [];
  const displayedAmenities = showAllAmenities ? amenitiesEntries : amenitiesEntries.slice(0, 6);
  const images = restaurant.images || [];
  const visibleImages = images.slice(0, 9);
  const remainingImagesCount = images.length - 9;

  // Get first image for banner if available
  const bannerImage = restaurant.images && restaurant.images.length > 0 
    ? getImageUrl(restaurant.images[0]) 
    : '';

  return (
    <div className="restaurant-detail-page">
      {notification && (
        <div className="notification">
          {notification}
        </div>
      )}

      <div className="back-button-container">
        <button className="back-button" onClick={handleGoBack}>
          <i className="back-icon">←</i> Quay về
        </button>
      </div>

      <div className="restaurant-banner">
        <img
          src={bannerImage}
          alt={restaurant.name}
          className="banner-image"
          onError={(e) => { e.target.src = '/placeholder-restaurant.jpg'; }}
        />
        <div className="banner-overlay">
          <h1>{restaurant.name}</h1>
          <p>{restaurant.address || 'Địa chỉ không có'}</p>
          <div className="banner-actions">
            <button className="btn btn-outline" onClick={handleFavorite}>
              <i className={`fas fa-heart ${isFavorite ? 'favorite-active' : ''}`}></i>
              {isFavorite ? 'Bỏ yêu thích' : 'Yêu thích'}
            </button>
            <button className="btn btn-outline" onClick={handleShare}>
              <i className="fas fa-share"></i> Chia sẻ
            </button>
            <button className="btn btn-outline" onClick={handleToggleReservationForm}>
              <i className="fas fa-calendar-alt"></i> Đặt bàn
            </button>
          </div>
        </div>
      </div>

      <div className="container">
        <section id="summary-section" className="content-section">
          <h2>Thông tin tóm tắt</h2>
          <div className="summary-card">
            <p><i className="fas fa-map-marker-alt"></i> Địa chỉ: {restaurant.address || 'Chưa cập nhật'}</p>
            <p><i className="fas fa-utensils"></i> Loại hình: {restaurant.cuisineType || 'Chưa cập nhật'}</p>
            <p><i className="fas fa-money-bill-wave"></i> Giá: {restaurant.priceRange || 'Chưa cập nhật'}</p>
            <p><i className="fas fa-clock"></i> Giờ mở cửa: {restaurant.openingTime || 'Chưa cập nhật'} - {restaurant.closingTime || 'Chưa cập nhật'}</p>
            <p><i className="fas fa-phone"></i> Điện thoại: {restaurant.phone || 'Chưa cập nhật'}</p>
            <p><i className="fas fa-envelope"></i> Email: {restaurant.email || 'Chưa cập nhật'}</p>
          </div>
        </section>

        <section id="description-section" className="content-section">
          <h2>Mô tả</h2>
          <div className="description-card">
            <p>{restaurant.description || 'Chưa có thông tin mô tả.'}</p>
          </div>
        </section>

        <section id="amenities-section" className="content-section">
          <h2>Tiện ích</h2>
          <div className="amenities-card">
            {(amenitiesEntries.length > 0) ? (
              <>
                <div className="amenities-list">
                  {displayedAmenities.map(([key, value]) => (
                    <div key={key} className="amenity-item">
                      <i className={`fas ${value ? 'fa-check' : 'fa-times'}`}></i>
                      <span>{key}: {value ? 'Có' : 'Không'}</span>
                    </div>
                  ))}
                </div>
                {amenitiesEntries.length > 6 && (
                  <button
                    className="btn btn-show-more"
                    onClick={() => setShowAllAmenities(!showAllAmenities)}
                  >
                    {showAllAmenities ? 'Thu gọn' : 'Xem thêm'}
                  </button>
                )}
              </>
            ) : (
              <p>Chưa có thông tin tiện ích.</p>
            )}
          </div>
        </section>

        <section id="operating-hours-section" className="content-section">
          <h2>Giờ hoạt động</h2>
          <div className="operating-hours-card">
            {(restaurant.operatingHours || []).map((day, index) => {
              const [startTime, endTime] = (day.time || '').split(' - ');
              const [startHour, startMin] = startTime ? startTime.split(':').map(Number) : [0, 0];
              const [endHour, endMin] = endTime ? endTime.split(':').map(Number) : [0, 0];
              const isCurrentDay = day.day.toLowerCase() === currentDay.toLowerCase();
              const isWithinTime = (isCurrentDay && startTime && endTime && (
                (currentHour > startHour && currentHour < endHour) ||
                (currentHour === startHour && currentMinute >= startMin) ||
                (currentHour === endHour && currentMinute <= endMin)
              ));

              return (
                <p
                  key={index}
                  className={`${isCurrentDay ? 'current-day' : ''} ${isWithinTime ? 'current-time' : ''}`}
                >
                  {day.day}: {day.time || 'Chưa cập nhật'}
                </p>
              );
            }) || <p>Chưa có thông tin giờ hoạt động.</p>}
          </div>
        </section>

        <section id="images-section" className="content-section">
          <h2>Hình ảnh</h2>
          <div className="image-grid">
            {visibleImages.map((img, index) => (
              <div
                key={index}
                className="image-item"
                onClick={() => handleImageClick(index, 'images')}
              >
                <img 
                  src={getImageUrl(img)} 
                  alt={`${restaurant.name} - Ảnh ${index + 1}`} 
                  className="grid-image"
                  onError={(e) => { e.target.src = '/placeholder-image.jpg'; }}
                />
              </div>
            ))}
            {remainingImagesCount > 0 && (
              <div className="image-item remaining" onClick={() => handleImageClick(0, 'images')}>
                <div className="remaining-count">+{remainingImagesCount}</div>
                <img 
                  src={getImageUrl(images[8])} 
                  alt={`${restaurant.name} - Ảnh bổ sung`} 
                  className="grid-image" 
                />
              </div>
            )}
          </div>
        </section>

        {selectedImage && restaurant.images && restaurant.images.length > 0 && (
          <>
            <div className="modal-overlay" onClick={closeImageModal}></div>
            <div className="modal image-modal">
              <button className="modal-prev" onClick={prevImage}>
                <i className="fas fa-chevron-left"></i>
              </button>
              <div className="modal-content">
                <img
                  src={getImageUrl(restaurant.images[currentModalImageIndex])}
                  alt="Hình ảnh"
                  className="modal-image"
                  onError={(e) => { e.target.src = '/placeholder-image.jpg'; }}
                />
                <button className="close-modal" onClick={closeImageModal}>×</button>
              </div>
              <button className="modal-next" onClick={nextImage}>
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>
          </>
        )}

        <section id="map-section" className="content-section">
          <h2>Chỉ đường</h2>
          <div className="map-card">
            <p>Địa chỉ: {restaurant.address || 'Không có thông tin'}</p>
            <button className="btn btn-book-now" onClick={handleOpenGoogleMaps}>
              Xem trên Google Maps
            </button>
          </div>
        </section>

        {showReservationForm && (
          <section id="booking-section" className="content-section fixed-booking">
            <div className="booking-header">
              <h2>Đặt chỗ (Để có chỗ trước khi đến)</h2>
              <button className="close-reservation-btn" onClick={() => setShowReservationForm(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="booking-card">
              <p className="reservation-subtitle">Đặt bàn giữ chỗ</p>
              
              <div className="form-row">
                <div className="form-group-half">
                  <label><i className="fas fa-user"></i> Người lớn:</label>
                  <select
                    name="guests"
                    value={formData.guests}
                    onChange={handleFormChange}
                  >
                    {[...Array(10).keys()].map(num => (
                      <option key={num} value={num + 1}>{num + 1}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group-half">
                  <label><i className="fas fa-child"></i> Trẻ em:</label>
                  <select
                    name="children"
                    value={formData.children}
                    onChange={handleFormChange}
                  >
                    {[...Array(11).keys()].map(num => (
                      <option key={num} value={num}>{num}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="form-group-time">
                <div className="time-label">
                  <i className="fas fa-clock"></i> Thời gian đến
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group-half">
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleFormChange}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                
                <div className="form-group-half">
                  <select
                    name="time"
                    value={formData.time}
                    onChange={handleFormChange}
                  >
                    {availableTimes.length > 0 ? (
                      availableTimes.map((time, index) => (
                        <option key={index} value={time}>
                          {time}
                        </option>
                      ))
                    ) : (
                      <option value="">Không có khung giờ khả dụng</option>
                    )}
                  </select>
                </div>
              </div>
              
              <button 
                className="btn-reserve-now" 
                onClick={handleBookNow} 
                disabled={!formData.time}
              >
                Đặt chỗ ngay
              </button>
            </div>
          </section>
        )}

        <section id="promotions-section" className="content-section">
          <h2>Ưu đãi</h2>
          <div className="promotions-grid">
            {promotions.length > 0 ? (
              promotions.map((promo, index) => (
                <div className="promotion-card" key={index}>
                  <img src={promo.image || restaurant.image} alt={promo.title || 'Ưu đãi'} className="promotion-image" />
                  <div className="promotion-info">
                    <h3>{promo.title || 'Không có tiêu đề'}</h3>
                    <p>Giá: {promo.price || 'Liên hệ'}</p>
                    <p>Giảm: {promo.discount ? `${promo.discount}%` : 'Không có'}</p>
                    <p>Hiệu lực đến: {promo.validUntil || 'Không xác định'}</p>
                  </div>
                  <button
                    className="btn btn-choose"
                    onClick={(e) => handlePromotionClick(e, promo)}
                  >
                    Chọn ngay
                  </button>
                </div>
              ))
            ) : (
              <p>Chưa có ưu đãi nào.</p>
            )}
          </div>
        </section>

        {selectedPromotion && (
          <>
            <div className="modal-overlay" onClick={closePromotionModal}></div>
            <div className="modal">
              <div className="modal-content">
                <h2>{selectedPromotion.title || 'Không có tiêu đề'}</h2>
                <p>{selectedPromotion.description || 'Không có mô tả'}</p>
                <p>Giá: {selectedPromotion.price || 'Liên hệ'}</p>
                <p>Giảm: {selectedPromotion.discount ? `${selectedPromotion.discount}%` : 'Không có'}</p>
                <p>Hiệu lực đến: {selectedPromotion.validUntil || 'Không xác định'}</p>
                <div className="modal-actions">
                  <button className="btn btn-secondary" onClick={closePromotionModal}>
                    Đóng
                  </button>
                  <button className="btn btn-book-now" onClick={() => applyPromotionAndBook(selectedPromotion)}>
                    Đặt ngay
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        <section id="reviews-section" className="content-section">
          <h2>Đánh giá từ khách hàng</h2>
          <div className="reviews-list">
            <p>Tính năng đánh giá đã bị vô hiệu hóa</p>
          </div>
          
          <div className="review-form">
            <h3>Gửi đánh giá của bạn</h3>
            <form onSubmit={handleSubmitReview}>
              <div className="form-group">
                <label>Tên của bạn:</label>
                <input
                  type="text"
                  name="username"
                  value={userName || 'Người dùng mặc định'}
                  disabled
                />
              </div>
              <div className="form-group">
                <label>Đánh giá:</label>
                <select
                  name="rating"
                  value={reviewForm.rating}
                  onChange={handleReviewChange}
                  required
                >
                  <option value="0" disabled>Chọn số sao</option>
                  <option value="1">1 sao</option>
                  <option value="2">2 sao</option>
                  <option value="3">3 sao</option>
                  <option value="4">4 sao</option>
                  <option value="5">5 sao</option>
                </select>
              </div>
              <div className="form-group">
                <label>Bình luận:</label>
                <textarea
                  name="comment"
                  value={reviewForm.comment}
                  onChange={handleReviewChange}
                  rows="3"
                  required
                ></textarea>
              </div>
              <button type="submit" className="btn btn-book-now">
                Gửi đánh giá
              </button>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}

export default RestaurantDetailPage;