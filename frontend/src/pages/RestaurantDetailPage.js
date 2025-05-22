import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { getById as getRestaurantById, updateRestaurant } from '../services/restaurantAPI';
import { mockdata, useMockData } from '../components/mockData';
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
        let data;
        if (useMockData) {
          data = mockdata.find((item) => item.id === parseInt(id));
          if (!data) throw new Error(`Không tìm thấy nhà hàng với ID: ${id} trong dữ liệu mẫu`);
        } else {
          data = await getRestaurantById(id);
          if (!data) throw new Error(`Không thể lấy dữ liệu nhà hàng từ API với ID: ${id}`);
        }
        setRestaurant(data);
        addToRecentlyViewed(data);

        const { openTime, closeTime } = data || {};
        if (
          typeof openTime === 'string' &&
          typeof closeTime === 'string' &&
          openTime.match(/^\d{2}:\d{2}$/) &&
          closeTime.match(/^\d{2}:\d{2}$/)
        ) {
          const times = generateTimeSlots(openTime, closeTime);
          setAvailableTimes(times);
          setFormData((prev) => ({ ...prev, time: times[0] || '' }));
        } else {
          setAvailableTimes([]);
          setFormData((prev) => ({ ...prev, time: '' }));
          console.warn('openTime hoặc closeTime không hợp lệ:', { openTime, closeTime });
        }
      } catch (err) {
        setError(err.message);
        setRestaurant(null);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurant();
  }, [id, addToRecentlyViewed]); // Loại bỏ useMockData khỏi danh sách phụ thuộc

  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    setIsFavorite(favorites.includes(parseInt(id)));
    setFavoriteList(favorites);
  }, [id]);

  useEffect(() => {
    let isMounted = true;
    if (navigator.geolocation && !userLocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (isMounted) {
            const { latitude, longitude } = position.coords;
            setUserLocation(`${latitude},${longitude}`);
          }
        },
        (err) => {
          console.log('Không thể lấy vị trí người dùng:', err.message);
          if (isMounted) setUserLocation(null);
        }
      );
    } else {
      console.log('Trình duyệt không hỗ trợ định vị.');
      if (isMounted) setUserLocation(null);
    }
    return () => { isMounted = false; };
  }, [userLocation]);

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

    const lastTime = times[times.length - 1];
    const [lastHour, lastMinute] = lastTime.split(':').map(Number);
    if (lastHour > closeHour || (lastHour === closeHour && lastMinute > closeMinute)) {
      times.pop();
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
      }).toString();
      navigate(`/reservation?${query}`);
    } catch (err) {
      console.error('Lỗi khi chuyển hướng:', err);
      setNotification('Có lỗi khi chuyển hướng đến trang đặt bàn. Vui lòng thử lại.');
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
    if (userName && reviewForm.rating && reviewForm.comment) {
      const newReview = {
        username: userName,
        rating: reviewForm.rating,
        comment: reviewForm.comment,
        date: new Date().toISOString().split('T')[0],
      };
      
      try {
        const updatedReviews = [...(restaurant.reviews || []), newReview];
        if (!useMockData) {
          await updateRestaurant(id, { ...restaurant, reviews: updatedReviews });
        }
        setRestaurant((prev) => ({
          ...prev,
          reviews: updatedReviews,
        }));
        setReviewForm({ rating: 0, comment: '' });
        setNotification('Đánh giá của bạn đã được gửi!');
        setTimeout(() => setNotification(null), 2000);
      } catch (err) {
        setNotification('Có lỗi khi gửi đánh giá. Vui lòng thử lại.');
        console.error('Lỗi khi gửi đánh giá:', err);
        setTimeout(() => setNotification(null), 2000);
      }
    } else {
      setNotification('Vui lòng điền đầy đủ thông tin đánh giá.');
      setTimeout(() => setNotification(null), 2000);
    }
  };

  const handleToggleReservationForm = () => {
    setShowReservationForm((prev) => !prev);
    if (!showReservationForm) {
      document.getElementById('booking-section')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (loading) {
    return <div className="loading">Đang tải thông tin nhà hàng...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!restaurant) {
    return <div className="error-message">Không tìm thấy nhà hàng này. ID: {id}</div>;
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
  const menuImages = (restaurant.menu || []).map(item => item.image);
  const detailImages = restaurant.detailImages || [];

  return (
    <div className="restaurant-detail-page">
      {notification && (
        <div className="notification">
          {notification}
        </div>
      )}

      <div className="restaurant-banner">
        <img
          src={restaurant.image}
          alt={restaurant.name}
          className="banner-image"
        />
        <div className="banner-overlay">
          <h1>{restaurant.name}</h1>
          <p>{restaurant.address || 'Địa chỉ không có'}</p>
          <p>Đánh giá: {restaurant.rating || 0} sao ({restaurant.reviewCount || 0} đánh giá)</p>
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
            <p><i className="fas fa-utensils"></i> Loại hình: {restaurant.cuisine || 'Chưa cập nhật'}</p>
            <p><i className="fas fa-money-bill-wave"></i> Giá: {restaurant.priceRange || 'Chưa cập nhật'}</p>
            <p><i className="fas fa-clock"></i> Giờ mở cửa: {restaurant.openTime || 'Chưa cập nhật'} - {restaurant.closeTime || 'Chưa cập nhật'}</p>
          </div>
        </section>

        <section id="content-summary-section" className="content-section">
          <h2>Tổng quan</h2>
          <div className="content-summary-card">
            <p><strong>Phù hợp:</strong> {restaurant.suitableFor || 'Chưa cập nhật'}</p>
            <p><strong>Món đặc sắc:</strong> {restaurant.signatureDish || 'Chưa cập nhật'}</p>
            <p><strong>Không gian:</strong> {restaurant.ambiance || 'Chưa cập nhật'}</p>
            <p><strong>Chỗ để xe:</strong> {restaurant.parking || 'Chưa cập nhật'}</p>
            <p><strong>Điểm đặc trưng:</strong> {restaurant.highlight || 'Chưa cập nhật'}</p>
          </div>
        </section>

        <section id="rules-section" className="content-section">
          <h2>Quy định</h2>
          <div className="rules-card">
            {Array.isArray(restaurant.rules) && (restaurant.rules.length > 0) ? (
              restaurant.rules.map((rule, index) => (
                <p key={index}>{rule}</p>
              ))
            ) : (
              <p>Chưa có quy định nào được cung cấp.</p>
            )}
          </div>
        </section>

        <section id="parking-section" className="content-section">
          <h2>Đỗ xe</h2>
          <div className="parking-card">
            <p>{restaurant.parkingDetails || 'Chưa có thông tin về chỗ để xe.'}</p>
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

        <section id="details-section" className="content-section">
          <h2>{restaurant.name} - {restaurant.address}</h2>
          <div className="details-card">
            <p>{restaurant.introduction || 'Chưa có thông tin giới thiệu.'}</p>
            {(restaurant.detailImages || []).map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`${restaurant.name} - Hình minh họa ${index + 1}`}
                className="detail-image"
                onClick={() => handleImageClick(index, 'details')}
              />
            ))}
          </div>
        </section>

        {showReservationForm && (
          <section id="booking-section" className="content-section fixed-booking">
            <div className="booking-header">
              <h2>Đặt chỗ</h2>
              <button className="close-reservation-btn" onClick={() => setShowReservationForm(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="booking-card">
              <div className="form-group">
                <i className="fas fa-users"></i>
                <label>Số người:</label>
                <input
                  type="number"
                  name="guests"
                  min="1"
                  value={formData.guests}
                  onChange={handleFormChange}
                />
              </div>
              <div className="form-group">
                <i className="fas fa-calendar-alt"></i>
                <label>Ngày:</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleFormChange}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="form-group">
                <i className="fas fa-clock"></i>
                <label>Giờ:</label>
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
              <button className="btn btn-book-now" onClick={handleBookNow} disabled={!formData.time}>
                Đặt ngay
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

        <section id="menu-section" className="content-section">
          <h2>Thực đơn</h2>
          <div className="menu-carousel">
            {(restaurant.menu || []).map((item, index) => (
              <div
                className="menu-item"
                key={index}
                onClick={() => handleImageClick(index, 'menu')}
              >
                <img src={item.image} alt={`${restaurant.name} - Thực đơn ${index + 1}`} className="menu-image" />
              </div>
            ))}
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
                <img src={img.image_url} alt={`${restaurant.name} - Ảnh ${index + 1}`} className="grid-image" />
              </div>
            ))}
            {remainingImagesCount > 0 && (
              <div className="image-item remaining" onClick={() => handleImageClick(0, 'images')}>
                <div className="remaining-count">+{remainingImagesCount}</div>
                <img src={images[8].image_url} alt={`${restaurant.name} - Ảnh bổ sung`} className="grid-image" />
              </div>
            )}
          </div>
        </section>

        {selectedImage && (
          <>
            <div className="modal-overlay" onClick={closeImageModal}></div>
            <div className="modal image-modal">
              <button className="modal-prev" onClick={prevImage}>
                <i className="fas fa-chevron-left"></i>
              </button>
              <div className="modal-content">
                <img
                  src={
                    selectedImageSource === 'menu'
                      ? menuImages[currentModalImageIndex]
                      : selectedImageSource === 'details'
                      ? detailImages[currentModalImageIndex]
                      : images[currentModalImageIndex].image_url
                  }
                  alt="Hình ảnh"
                  className="modal-image"
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

        <section id="reviews-section" className="content-section">
          <h2>Đánh giá</h2>
          <div className="reviews-list">
            {restaurant.reviews && restaurant.reviews.length > 0 ? (
              restaurant.reviews.map((review, index) => (
                <div className="review-card" key={index}>
                  <div className="review-header">
                    <span>{review.username}</span>
                    <span className="review-rating">{review.rating} sao</span>
                  </div>
                  <p className="review-comment">{review.comment}</p>
                  <p className="review-date">{review.date}</p>
                </div>
              ))
            ) : (
              <p>Chưa có đánh giá nào.</p>
            )}
          </div>
          <div className="review-form">
            <h3>Để lại đánh giá</h3>
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