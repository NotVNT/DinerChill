import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import axios from 'axios';
import '../styles/ReservationPage.css';

function ReservationPage() {
  const { restaurants, loading, addReservation, addReservationHistory } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);

  const restaurantId = queryParams.get('restaurant');
  const initialDate = queryParams.get('date') || new Date().toISOString().split('T')[0];
  const initialTime = queryParams.get('time') || '17:00';
  const initialGuests = parseInt(queryParams.get('guests')) || 2;
  const initialPromotion = queryParams.get('promotion') || '';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: initialDate,
    time: initialTime,
    guests: initialGuests,
    restaurant: restaurantId || '',
    specialRequests: '',
    voucher: initialPromotion,
  });

  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [showReview, setShowReview] = useState(false);
  const [showDeposit, setShowDeposit] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [reservationCode, setReservationCode] = useState(null);
  const [depositAmount, setDepositAmount] = useState(0); // Khởi tạo bằng 0, sẽ cập nhật từ dữ liệu nhà hàng
  const [initialDeposit, setInitialDeposit] = useState(0); // Lưu số tiền cọc ban đầu của nhà hàng
  const [discount, setDiscount] = useState(0);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState(null);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone) => /^\d{10}$/.test(phone.replace(/\D/g, ''));

  const isValidTime = (date, time, openingHours) => {
    if (!date || !time || !openingHours) return true;
    try {
      const [open, close] = openingHours.split(' - ').map(t => t.trim());
      const reservationTime = new Date(`${date} ${time}`).getTime();
      const [openHour, openMin] = open.split(':').map(Number);
      const [closeHour, closeMin] = close.split(':').map(Number);
      const openTime = new Date(date).setHours(openHour, openMin, 0, 0);
      const closeTime = new Date(date).setHours(closeHour, closeMin, 0, 0);
      return reservationTime >= openTime && reservationTime <= closeTime;
    } catch (err) {
      console.error('Error parsing opening hours:', err);
      return true;
    }
  };

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

  useEffect(() => {
    if (restaurantId && restaurants.length > 0) {
      const restaurant = restaurants.find(r => r.id === parseInt(restaurantId));
      if (restaurant) {
        setSelectedRestaurant(restaurant);
        setInitialDeposit(restaurant.booking.deposit || 0); // Lấy tiền cọc từ nhà hàng
        setDepositAmount(restaurant.booking.deposit || 0); // Khởi tạo depositAmount từ nhà hàng
        setFormData(prev => ({
          ...prev,
          restaurant: restaurantId,
          voucher: queryParams.get('promotion') || prev.voucher,
        }));
        const [openTime, closeTime] = restaurant.openingHours?.split(' - ') || ['11:00', '22:00'];
        const times = generateTimeSlots(openTime, closeTime);
        setAvailableTimes(times);
        if (!times.includes(formData.time)) {
          setFormData(prev => ({ ...prev, time: times[0] || '17:00' }));
        }
      } else {
        setError('Không tìm thấy nhà hàng với ID này.');
      }
    }
  }, [restaurantId, restaurants, queryParams, formData.time]);

  useEffect(() => {
    if (selectedRestaurant && formData.voucher) {
      const promotion = selectedRestaurant.promotions?.find(promo => promo.title === formData.voucher);
      if (promotion && promotion.discount) {
        setDiscount(promotion.discount);
        const initialDepositAmount = selectedRestaurant.booking.deposit || 0;
        const newDepositAmount = initialDepositAmount * (1 - promotion.discount / 100);
        setDepositAmount(newDepositAmount);
      } else {
        setDiscount(0);
        setDepositAmount(selectedRestaurant.booking.deposit || 0);
      }
    } else {
      setDiscount(0);
      setDepositAmount(selectedRestaurant?.booking.deposit || 0);
    }
  }, [formData.voucher, selectedRestaurant]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value,
    }));
    if (name === 'restaurant' && value) {
      const restaurant = restaurants.find(r => r.id === parseInt(value));
      setSelectedRestaurant(restaurant);
      setInitialDeposit(restaurant.booking.deposit || 0); // Cập nhật tiền cọc ban đầu
      setDepositAmount(restaurant.booking.deposit || 0); // Cập nhật depositAmount khi chọn nhà hàng
      const [openTime, closeTime] = restaurant.openingHours?.split(' - ') || ['11:00', '22:00'];
      const times = generateTimeSlots(openTime, closeTime);
      setAvailableTimes(times);
      if (!times.includes(formData.time)) {
        setFormData(prev => ({ ...prev, time: times[0] || '17:00' }));
      }
      setError(null);
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) return 'Vui lòng nhập họ tên.';
    if (!validateEmail(formData.email)) return 'Email không hợp lệ.';
    if (!validatePhone(formData.phone)) return 'Số điện thoại phải là 10 chữ số.';
    if (!formData.date) return 'Vui lòng chọn ngày.';
    if (!formData.time) return 'Vui lòng chọn giờ.';
    if (!isValidTime(formData.date, formData.time, selectedRestaurant?.openingHours)) {
      return 'Thời gian đặt bàn không nằm trong giờ mở cửa.';
    }
    if (!formData.restaurant) return 'Vui lòng chọn nhà hàng.';
    if (formData.guests < 1 || formData.guests > 20) return 'Số khách phải từ 1 đến 20.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setSubmitting(false);
      return;
    }

    setShowReview(true);
    setSubmitting(false);
  };

  const handleReviewContinue = async () => {
    setShowReview(false);
    setShowDeposit(true);
  };

  const handleDepositConfirm = async () => {
    setShowDeposit(false);
    setSubmitting(true);
    setPaymentLoading(true);
    setPaymentError(null);
    try {
      const reservationData = {
        ...formData,
        restaurantName: selectedRestaurant?.name,
        restaurantAddress: selectedRestaurant?.address,
        restaurantImage: selectedRestaurant?.image,
        discountApplied: discount,
        finalDeposit: depositAmount,
      };
      const response = await addReservation(reservationData);
      if (response.success) {
        const reservationId = response.id || `RES-${Date.now()}`;
        const updatedReservationData = {
          id: reservationId,
          restaurantId: parseInt(restaurantId),
          restaurantName: selectedRestaurant?.name,
          restaurantAddress: selectedRestaurant?.address,
          restaurantImage: selectedRestaurant?.image,
          date: formData.date,
          time: formData.time,
          guests: formData.guests,
          status: 'confirmed',
          code: reservationId,
          specialRequests: formData.specialRequests,
        };

        // Lưu vào reservation history
        await addReservationHistory({
          ...updatedReservationData,
          timestamp: new Date().toISOString(),
        });

        // Lưu vào localStorage
        const existingReservations = JSON.parse(localStorage.getItem('successfulReservations') || '[]');
        localStorage.setItem('successfulReservations', JSON.stringify([...existingReservations, updatedReservationData]));

        // Gọi API thanh toán
        const paymentResponse = await axios.post('/api/payment/create', {
          amount: depositAmount,
          orderInfo: `Đặt bàn #${reservationId} - ${selectedRestaurant?.name} - ${formData.date} ${formData.time}`,
          reservationId: reservationId,
        });

        if (paymentResponse.data && paymentResponse.data.checkoutUrl) {
          window.location.href = paymentResponse.data.checkoutUrl;
        } else {
          setPaymentError('Không thể tạo liên kết thanh toán.');
          setSuccessMessage(`Đặt bàn thành công với mã ${reservationId}! Vui lòng thử lại thanh toán.`);
          setReservationCode(reservationId);
        }
      } else {
        throw new Error(response.message || 'Đặt bàn không thành công.');
      }
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra khi đặt bàn. Vui lòng thử lại sau.');
      console.error('Reservation error:', err);
    } finally {
      setSubmitting(false);
      setPaymentLoading(false);
    }
  };

  const handleCancelReservation = () => {
    if (!reservationCode) return;

    const existingReservations = JSON.parse(localStorage.getItem('successfulReservations') || '[]');
    const updatedReservations = existingReservations.map(reservation => {
      if (reservation.code === reservationCode) {
        return { ...reservation, status: 'cancelled' };
      }
      return reservation;
    });

    localStorage.setItem('successfulReservations', JSON.stringify(updatedReservations));
    setSuccessMessage(`Đã hủy đặt bàn với mã ${reservationCode}.`);
    setReservationCode(null);
  };

  if (loading) {
    return <div className="loading">Đang tải dữ liệu...</div>;
  }

  if (!restaurants || restaurants.length === 0) {
    return (
      <div className="error-message">
        Không có nhà hàng nào để hiển thị.
        <button onClick={() => navigate('/restaurants')} className="btn btn-secondary">
          Quay lại danh sách nhà hàng
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
          {error.includes('Không tìm thấy nhà hàng') && (
            <button onClick={() => navigate('/restaurants')} className="btn btn-secondary">
              Quay lại danh sách nhà hàng
            </button>
          )}
        </div>
      )}

      {paymentError && (
        <div className="error-message">
          {paymentError}
        </div>
      )}

      {successMessage && reservationCode ? (
        <div className="success-message">
          <h2>{successMessage}</h2>
          <p>Mã đặt bàn của bạn là: <strong>{reservationCode}</strong></p>
          <p>Cảm ơn bạn đã đặt bàn! Chúng tôi đã gửi xác nhận đến email của bạn.</p>
          <p>Lưu ý: Vui lòng đến đúng giờ để nhận lại số tiền đặt cọc {depositAmount.toLocaleString('vi-VN')}đ.</p>
          <div className="success-actions">
            <button onClick={handleCancelReservation} className="btn btn-secondary">
              Hủy đặt bàn
            </button>
            <button onClick={() => navigate(`/my-reservations`)} className="btn btn-primary">
              Xem lịch sử đặt bàn
            </button>
            <button onClick={() => navigate(`/restaurants/${restaurantId}`)} className="btn btn-primary">
              Quay lại trang nhà hàng
            </button>
            <button onClick={() => navigate('/')} className="btn btn-secondary">
              Về trang chủ
            </button>
          </div>
        </div>
      ) : (
        <>
          {!showReview && !showDeposit && (
            <div>
              <button onClick={() => navigate(-1)} className="btn btn-secondary back-button">
                Quay lại
              </button>
              <form onSubmit={handleSubmit} className="reservation-form">
                <div className="form-columns">
                  <div className="form-column">
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
                  </div>
                  <div className="form-column">
                    <div className="form-group">
                      <label htmlFor="restaurant">Nhà hàng</label>
                      <select
                        id="restaurant"
                        name="restaurant"
                        value={formData.restaurant}
                        onChange={(e) => {
                          handleChange(e);
                          const restaurant = restaurants.find(r => r.id === parseInt(e.target.value));
                          setSelectedRestaurant(restaurant);
                        }}
                        required
                        disabled={!!restaurantId}
                      >
                        <option value="">Chọn nhà hàng</option>
                        {restaurants.map(restaurant => (
                          <option key={restaurant.id} value={restaurant.id}>
                            {restaurant.name}
                          </option>
                        ))}
                      </select>
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
                        <select
                          id="time"
                          name="time"
                          value={formData.time}
                          onChange={handleChange}
                          required
                        >
                          <option value="">Chọn giờ</option>
                          {availableTimes.map((time, index) => (
                            <option key={index} value={time}>
                              {time}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="form-group">
                      <label htmlFor="guests">Số khách</label>
                      <input
                        type="number"
                        id="guests"
                        name="guests"
                        min={selectedRestaurant?.booking?.minPeople || 1}
                        max={selectedRestaurant?.booking?.maxPeople || 20}
                        value={formData.guests}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="voucher">Chọn voucher (nếu có)</label>
                  <select
                    id="voucher"
                    name="voucher"
                    value={formData.voucher}
                    onChange={handleChange}
                  >
                    <option value="">Không sử dụng voucher</option>
                    {selectedRestaurant?.promotions?.length > 0 ? (
                      selectedRestaurant.promotions.map((promo, index) => (
                        <option key={index} value={promo.title}>
                          {promo.title} {promo.discount ? ` - ${promo.discount}%` : ''} {promo.price ? `(${promo.price}đ)` : ''}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>Không có voucher</option>
                    )}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="specialRequests">Ghi chú</label>
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
                  {submitting ? 'Đang xử lý...' : 'Tiếp tục'}
                </button>
              </form>
            </div>
          )}

          {(showReview || showDeposit) && <div className="modal-overlay" onClick={() => { setShowReview(false); setShowDeposit(false); }}></div>}

          {showReview && (
            <div className="review-modal">
              <h2>Xem lại thông tin đặt bàn</h2>
              <div className="review-content">
                <div className="review-section">
                  <h3>Thông tin voucher</h3>
                  {formData.voucher ? (
                    <div>
                      <p>Voucher: {formData.voucher}</p>
                      <p>Giảm giá: {discount ? `${discount}%` : 'Không có'}</p>
                    </div>
                  ) : (
                    <p>Không có voucher được chọn.</p>
                  )}
                </div>
                <div className="review-section">
                  <h3>Thông tin nhà hàng</h3>
                  {selectedRestaurant ? (
                    <div>
                      <p>Tên: {selectedRestaurant.name}</p>
                      <p>Địa chỉ: {selectedRestaurant.address}</p>
                      <p>Giờ mở cửa: {selectedRestaurant.openingHours || 'Không có thông tin'}</p>
                      <p>Đánh giá: {selectedRestaurant.rating || 0} sao ({selectedRestaurant.reviewCount || 0} đánh giá)</p>
                    </div>
                  ) : (
                    <p>Chưa chọn nhà hàng.</p>
                  )}
                </div>
                <div className="review-section">
                  <h3>Thông tin đặt bàn</h3>
                  <p>Họ tên: {formData.name}</p>
                  <p>Email: {formData.email}</p>
                  <p>Số điện thoại: {formData.phone}</p>
                  <p>Ngày: {formData.date}</p>
                  <p>Giờ: {formData.time}</p>
                  <p>Số khách: {formData.guests}</p>
                  <p>Ghi chú: {formData.specialRequests || 'Không có'}</p>
                </div>
              </div>
              <div className="review-actions">
                <button className="btn btn-secondary" onClick={() => setShowReview(false)}>
                  Chỉnh sửa
                </button>
                <button className="btn btn-primary" onClick={handleReviewContinue}>
                  Tiếp tục
                </button>
              </div>
            </div>
          )}

          {showDeposit && (
            <div className="deposit-modal">
              <h2>Đặt cọc</h2>
              <p>Vui lòng xác nhận đặt cọc để hoàn tất đặt bàn.</p>
              <div className="deposit-amount">
                <p>Số tiền đặt cọc ban đầu: {initialDeposit.toLocaleString('vi-VN')}đ</p>
                {discount > 0 && (
                  <p>Giảm giá từ voucher ({discount}%): -{(initialDeposit * (discount / 100)).toLocaleString('vi-VN')}đ</p>
                )}
                <p>Số tiền cuối cùng: {depositAmount.toLocaleString('vi-VN')}đ</p>
                <p>(Số tiền này sẽ được hoàn lại nếu bạn đến đúng giờ)</p>
              </div>
              <div className="deposit-actions">
                <button className="btn btn-secondary" onClick={() => setShowDeposit(false)}>
                  Hủy
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleDepositConfirm}
                  disabled={paymentLoading}
                >
                  {paymentLoading ? 'Đang xử lý...' : 'Xác nhận đặt cọc'}
                </button>
              </div>
              {paymentError && <div className="error-message">{paymentError}</div>}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default ReservationPage;