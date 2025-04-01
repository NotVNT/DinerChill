import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

function ReservationPage() {
  const { restaurants, loading, addReservation } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const restaurantId = queryParams.get('restaurant');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    guests: 2,
    restaurant: restaurantId || '',
    specialRequests: ''
  });
  
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Cập nhật restaurantId khi URL thay đổi
  useEffect(() => {
    if (restaurantId) {
      setFormData(prev => ({...prev, restaurant: restaurantId}));
    }
  }, [restaurantId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    
    try {
      // Gọi API để đặt bàn
      await addReservation(formData);
      
      // Hiển thị thông báo thành công
      setSubmitted(true);
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        date: '',
        time: '',
        guests: 2,
        restaurant: '',
        specialRequests: ''
      });
    } catch (err) {
      setError('Có lỗi xảy ra khi đặt bàn. Vui lòng thử lại sau.');
      console.error('Reservation error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="loading">Đang tải dữ liệu...</div>;
  }

  if (submitted) {
    return (
      <div className="reservation-success">
        <h1>Đặt bàn thành công!</h1>
        <p>Cảm ơn bạn đã đặt bàn tại DinerChill. Chúng tôi sẽ liên hệ với bạn sớm để xác nhận đặt chỗ.</p>
        <button 
          className="btn btn-primary"
          onClick={() => navigate('/')}
        >
          Về trang chủ
        </button>
      </div>
    );
  }

  return (
    <div className="reservation-page">
      <h1>Đặt bàn</h1>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="reservation-form">
        <div className="form-group">
          <label htmlFor="name">Họ tên</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="phone">Số điện thoại</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="date">Ngày</label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="time">Giờ</label>
            <input
              type="time"
              id="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="guests">Số khách</label>
            <input
              type="number"
              id="guests"
              name="guests"
              min="1"
              max="20"
              value={formData.guests}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="restaurant">Nhà hàng</label>
          <select
            id="restaurant"
            name="restaurant"
            value={formData.restaurant}
            onChange={handleChange}
            required
          >
            <option value="">Chọn nhà hàng</option>
            {restaurants.map(restaurant => (
              <option key={restaurant.id} value={restaurant.id}>
                {restaurant.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="specialRequests">Yêu cầu đặc biệt</label>
          <textarea
            id="specialRequests"
            name="specialRequests"
            value={formData.specialRequests}
            onChange={handleChange}
            rows="3"
          ></textarea>
        </div>
        
        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={submitting}
        >
          {submitting ? 'Đang xử lý...' : 'Đặt bàn'}
        </button>
      </form>
    </div>
  );
}

export default ReservationPage; 