import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import axios from 'axios';
import '../styles/ReservationPage.css';
import { restaurantsAPI } from '../services/api';
import PaymentCancelConfirmation from '../components/PaymentCancelConfirmation';

function ReservationPage() {
  const { user, addReservation, addReservationHistory } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);

  const restaurantId = queryParams.get('restaurant');
  const initialDate = queryParams.get('date') || new Date().toISOString().split('T')[0];
  const initialTime = queryParams.get('time') || '17:00';
  const initialGuests = parseInt(queryParams.get('guests')) || 2;
  const initialChildren = parseInt(queryParams.get('children')) || 0;
  const initialPromotion = queryParams.get('promotion') || '';
  const initialTableId = queryParams.get('tableId') || '';
  const initialTableCode = queryParams.get('tableCode') || '';
  const initialTableCapacity = queryParams.get('tableCapacity') || '';

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    date: initialDate,
    time: initialTime,
    guests: initialGuests,
    children: initialChildren,
    restaurant: restaurantId || '',
    specialRequests: '',
    voucher: initialPromotion,
    tableId: initialTableId,
    tableCode: initialTableCode,
    tableCapacity: initialTableCapacity,
  });

  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [showReview, setShowReview] = useState(false);
  const [showDeposit, setShowDeposit] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [depositAmount, setDepositAmount] = useState(0);
  const [initialDeposit, setInitialDeposit] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [paymentLoading, setPaymentLoading] = useState(false);
  
  // State to track if edit mode is active
  const [showEditForm, setShowEditForm] = useState(false);
  
  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState(10); // 10 seconds
  const [showTimeoutDialog, setShowTimeoutDialog] = useState(false);
  const timerRef = useRef(null);

  // Log available times when they change (for ESLint to detect usage)
  useEffect(() => {
    if (availableTimes.length > 0) {
      // This ensures availableTimes is used and will prevent the ESLint warning
      console.log(`Available time slots: ${availableTimes.length}`);
    }
  }, [availableTimes]);

  // Start the timer when the component mounts
  useEffect(() => {
    startTimer();
    return () => clearInterval(timerRef.current);
  }, []);

  // Function to start/restart the countdown timer
  const startTimer = () => {
    setTimeLeft(10); // Reset to 10 seconds
    setShowTimeoutDialog(false);
    
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setShowTimeoutDialog(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Format seconds to MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle continue button in timeout dialog
  const handleContinue = () => {
    startTimer();
  };

  // Handle go back button in timeout dialog
  const handleGoBack = () => {
    navigate('/');
  };

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone) => /^\d{10}$/.test(phone.replace(/\D/g, ''));

  const isValidTime = (date, time, openingTime, closingTime) => {
    if (!date || !time || !openingTime || !closingTime) return true;
    try {
      const reservationTime = new Date(`${date} ${time}`).getTime();
      const [openHour, openMin] = openingTime.split(':').map(Number);
      const [closeHour, closeMin] = closingTime.split(':').map(Number);
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

    return times;
  };

  // Fetch restaurant data by ID
  useEffect(() => {
    const fetchRestaurant = async () => {
      if (!restaurantId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const restaurant = await restaurantsAPI.getById(restaurantId);
        
        if (restaurant) {
          setSelectedRestaurant(restaurant);
          setFormData(prev => ({
            ...prev,
            restaurant: restaurantId,
            voucher: queryParams.get('promotion') || prev.voucher,
          }));
          
          // Set deposit - using a default value if not available
          const deposit = 100000; // Default deposit amount
          setInitialDeposit(deposit);
          setDepositAmount(deposit);
          
          // Generate time slots based on opening and closing time
          if (restaurant.openingTime && restaurant.closingTime) {
            const times = generateTimeSlots(restaurant.openingTime, restaurant.closingTime);
            setAvailableTimes(times);
            
            if (times.length > 0 && (!formData.time || !times.includes(formData.time))) {
              setFormData(prev => ({ ...prev, time: times[0] || '17:00' }));
            }
          } else {
            // Default time slots if restaurant hours are not available
            const defaultTimes = generateTimeSlots('10:00', '22:00');
            setAvailableTimes(defaultTimes);
            
            if (defaultTimes.length > 0 && (!formData.time || !defaultTimes.includes(formData.time))) {
              setFormData(prev => ({ ...prev, time: defaultTimes[0] || '17:00' }));
            }
          }
        } else {
          setError('Không tìm thấy nhà hàng với ID này.');
        }
      } catch (err) {
        console.error('Error fetching restaurant:', err);
        setError('Không thể tải thông tin nhà hàng. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurant();
  }, [restaurantId, queryParams, formData.time]);

  // Calculate discount if promotion is applied
  useEffect(() => {
    if (selectedRestaurant && formData.voucher) {
      // Default discount logic - in a real app, this would come from your promotions data
      setDiscount(10); // Default 10% discount
      const newDepositAmount = initialDeposit * (1 - 10 / 100);
      setDepositAmount(newDepositAmount);
    } else {
      setDiscount(0);
      setDepositAmount(initialDeposit);
    }
  }, [formData.voucher, selectedRestaurant, initialDeposit]);

  // Check if the URL contains a payment cancellation parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentCancelled = urlParams.get('paymentCancelled');
    
    if (paymentCancelled === 'true') {
      // Clear the URL parameter by replacing the current URL without the parameter
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.delete('paymentCancelled');
      window.history.replaceState({}, document.title, currentUrl.toString());
      
      // Navigate to the homepage
      navigate('/');
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) return 'Vui lòng nhập họ tên.';
    if (!validateEmail(formData.email)) return 'Email không hợp lệ.';
    if (!validatePhone(formData.phone)) return 'Số điện thoại phải là 10 chữ số.';
    if (!formData.date) return 'Vui lòng chọn ngày.';
    if (!formData.time) return 'Vui lòng chọn giờ.';
    if (!selectedRestaurant) return 'Không tìm thấy thông tin nhà hàng.';
    if (!isValidTime(formData.date, formData.time, selectedRestaurant.openingTime, selectedRestaurant.closingTime)) {
      return 'Thời gian đặt bàn không nằm trong giờ mở cửa.';
    }
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
    try {
      // Prepare reservation data according to your model
      const reservationData = {
        userId: user?.id || 1, // Default to 1 if no user ID available
        restaurantId: parseInt(restaurantId),
        date: formData.date,
        time: formData.time,
        partySize: formData.guests,
        status: 'pending',
        notes: formData.specialRequests
      };


      // Add reservation through API
      const response = await addReservation(reservationData);
      
      if (response.success) {
        const reservationId = response.id || `RES-${Date.now()}`;
        const updatedReservationData = {
          id: reservationId,
          restaurantId: parseInt(restaurantId),
          restaurantName: selectedRestaurant?.name,
          restaurantAddress: selectedRestaurant?.address,
          date: formData.date,
          time: formData.time,
          partySize: formData.guests,
          status: 'confirmed',
          code: reservationId,
          notes: formData.specialRequests,
        };

        // Save to reservation history
        await addReservationHistory({
          ...updatedReservationData,
          timestamp: new Date().toISOString(),
        });

        // Save to localStorage
        const existingReservations = JSON.parse(localStorage.getItem('successfulReservations') || '[]');
        localStorage.setItem('successfulReservations', JSON.stringify([...existingReservations, updatedReservationData]));

        // Create the return URL for payment cancellation
        const returnUrl = new URL(`${window.location.origin}/`);
        returnUrl.searchParams.set('paymentCancelled', 'true');
        
        // Call payment API
        try {
          const paymentResponse = await axios.post('/api/payment/create', {
            amount: depositAmount,
            orderInfo: `Đặt bàn #${reservationId} - ${selectedRestaurant?.name} - ${formData.date} ${formData.time}`,
            reservationId: reservationId,
            returnUrl: returnUrl.toString()
          });

          if (paymentResponse.data && paymentResponse.data.checkoutUrl) {
            window.location.href = paymentResponse.data.checkoutUrl;
          } else {
            setSuccessMessage(`Đặt bàn thành công với mã ${reservationId}! Vui lòng thử lại thanh toán.`);
          }
        } catch (paymentError) {
          console.error('Payment error:', paymentError);
          setSuccessMessage(`Đặt bàn thành công với mã ${reservationId}! Thanh toán không thành công, vui lòng thử lại sau.`);
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

  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);

  // Handle cancel payment button click
  const handleCancelClick = () => {
    setShowCancelConfirmation(true);
  };

  // Handle cancel confirmation
  const handleConfirmCancel = () => {
    setShowCancelConfirmation(false);
    setShowDeposit(false);
    // Redirect to payment-result page with cancelled parameter and additional details
    navigate('/payment-result?cancelled=true&status=CANCELLED&orderCode=00');
  };

  // Handle cancel dismissal
  const handleDismissCancel = () => {
    setShowCancelConfirmation(false);
  };

  if (loading) {
    return <div className="loading">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="reservation-page">
      {error && <div className="error-message">{error}</div>}
      
      {successMessage ? (
        <div className="success-message">
          <h2>Đặt bàn thành công!</h2>
          <p>{successMessage}</p>
          <div className="success-actions">
            <button 
              className="btn btn-primary" 
              onClick={() => navigate('/nha-hang')}
            >
              Quay lại trang nhà hàng
            </button>
            <button 
              className="btn btn-primary" 
              onClick={() => navigate('/thong-tin/dat-ban')}
            >
              Xem đơn đặt bàn
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="reservation-header">
            <h1>ĐẶT CHỖ ĐẾN "{selectedRestaurant?.name || 'NHÀ HÀNG'}"</h1>
          </div>
          
          <div className="countdown-panel">
            <p>Nhập thông tin chính xác trong <span className="countdown">{formatTime(timeLeft)}</span></p>
          </div>
          
          {/* Timeout Dialog */}
          {showTimeoutDialog && (
            <div className="timeout-overlay">
              <div className="timeout-dialog">
                <div className="timeout-header">
                  <h2>HẾT THỜI GIAN TẠO ĐƠN</h2>
                </div>
                <div className="timeout-content">
                  <p>Vui lòng chọn <strong>Tiếp tục</strong> để tạo lại đơn hàng</p>
                </div>
                <div className="timeout-actions">
                  <button className="btn btn-secondary" onClick={handleGoBack}>
                    Trở về trang chính
                  </button>
                  <button className="btn btn-primary" onClick={handleContinue}>
                    Tiếp tục
                  </button>
                </div>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="panels-container">
              {/* Left panel - User information */}
              <div className="info-panel">
                <div className="info-panel-header">
                  <h2>Thông tin người đặt</h2>
                </div>
                <div className="info-panel-content">
                  <div className="form-group">
                    <label>Tên liên lạc <span className="required">*</span></label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Nhập họ tên của bạn"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Số điện thoại <span className="required">*</span></label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+84xxxxxxxxx"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Email <span className="required">*</span></label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="example@email.com"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Ghi chú</label>
                    <textarea
                      name="specialRequests"
                      value={formData.specialRequests}
                      onChange={handleChange}
                      placeholder="Nhập ghi chú hoặc yêu cầu đặc biệt cho nhà hàng"
                      rows="4"
                    ></textarea>
                  </div>
                </div>
              </div>
              
              {/* Right panel - Booking information */}
              <div className="info-panel">
                <div className="info-panel-header">
                  <h2>Thông tin đặt chỗ</h2>
                  <button 
                    type="button" 
                    className="edit-button" 
                    onClick={() => setShowEditForm(!showEditForm)}
                  >
                    Chỉnh sửa
                  </button>
                </div>
                <div className="info-panel-content">
                  {!showEditForm ? (
                    // Normal display of booking information
                    <>
                      <p className="booking-info-item">{selectedRestaurant?.name}</p>
                      <p className="booking-info-item">{formData.guests} người lớn, {formData.children} trẻ em</p>
                      <p className="booking-info-item">
                        {new Date(formData.date).toLocaleDateString('vi-VN', { weekday: 'long' }).charAt(0).toUpperCase() + 
                        new Date(formData.date).toLocaleDateString('vi-VN', { weekday: 'long' }).slice(1)}, 
                        ngày {formData.date.split('-').reverse().join('/')} {formData.time}
                      </p>
                      {formData.tableId && (
                        <p className="booking-info-item">
                          <span className="table-info-label">Mã bàn: </span> 
                          <span className="table-info-value">{formData.tableCode || formData.tableCode}</span>
                          {formData.tableCapacity && (
                            <span className="table-capacity-info"> - Sức chứa: {formData.tableCapacity} người</span>
                          )}
                        </p>
                      )}
                    </>
                  ) : (
                    // Edit form for booking information
                    <div className="booking-edit-form">
                      <div className="edit-form-row">
                        <div className="edit-form-group">
                          <label><i className="fas fa-user"></i> Người lớn:</label>
                          <select
                            name="guests"
                            value={formData.guests}
                            onChange={handleChange}
                          >
                            {[...Array(10).keys()].map(num => (
                              <option key={num} value={num + 1}>{num + 1}</option>
                            ))}
                          </select>
                        </div>
                        
                        <div className="edit-form-group">
                          <label><i className="fas fa-child"></i> Trẻ em:</label>
                          <select
                            name="children"
                            value={formData.children}
                            onChange={handleChange}
                          >
                            {[...Array(11).keys()].map(num => (
                              <option key={num} value={num}>{num}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      
                      <div className="edit-form-time">
                        <label><i className="fas fa-clock"></i> Thời gian đến</label>
                      </div>
                      
                      <div className="edit-form-row">
                        <div className="edit-form-group">
                          <input
                            type="date"
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                            min={new Date().toISOString().split('T')[0]}
                          />
                        </div>
                        
                        <div className="edit-form-group">
                          <select
                            name="time"
                            value={formData.time}
                            onChange={handleChange}
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
                        type="button" 
                        className="btn-save-edit" 
                        onClick={() => setShowEditForm(false)}
                      >
                        Lưu thay đổi
                      </button>
                    </div>
                  )}
                  
                  {/* Hidden inputs to maintain form data */}
                  <input type="hidden" name="restaurant" value={formData.restaurant} />
                  <input type="hidden" name="date" value={formData.date} />
                  <input type="hidden" name="time" value={formData.time} />
                  <input type="hidden" name="guests" value={formData.guests} />
                  <input type="hidden" name="children" value={formData.children} />
                  <input type="hidden" name="voucher" value={formData.voucher || ''} />
                </div>
              </div>
            </div>
            
            <div className="action-panel">
              <button 
                type="button" 
                className="btn btn-back" 
                onClick={() => navigate(-1)}
              >
                Quay lại
              </button>
              
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={submitting || showEditForm}
              >
                {submitting ? 'Đang xử lý...' : 'Tiếp tục'}
              </button>
            </div>
          </form>
        </>
      )}
      
      {showReview && (
        <>
          <div className="modal-overlay" onClick={() => setShowReview(false)}></div>
          <div className="review-modal">
            <div className="review-header">
              <h2>Xác nhận thông tin đặt bàn</h2>
              <div className="review-header-line"></div>
            </div>
            
            <div className="review-content">
              <div className="review-section">
                <div className="section-header">
                  <h3>Thông tin nhà hàng</h3>
                </div>
                <div className="info-row">
                  <span className="info-label">Nhà hàng:</span>
                  <span className="info-value">{selectedRestaurant?.name}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Địa chỉ:</span>
                  <span className="info-value">{selectedRestaurant?.address}</span>
                </div>
              </div>
              
              <div className="review-section">
                <div className="section-header">
                  <h3>Thông tin đặt bàn</h3>
                </div>
                <div className="info-row">
                  <span className="info-label">Ngày:</span>
                  <span className="info-value">{formData.date.split('-').reverse().join('/')}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Giờ:</span>
                  <span className="info-value">{formData.time}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Số khách:</span>
                  <span className="info-value">{formData.guests} người lớn, {formData.children} trẻ em</span>
                </div>
                {formData.specialRequests && (
                  <div className="info-row">
                    <span className="info-label">Yêu cầu đặc biệt:</span>
                    <span className="info-value">{formData.specialRequests}</span>
                  </div>
                )}
              </div>
              
              <div className="review-section">
                <div className="section-header">
                  <h3>Thông tin liên hệ</h3>
                </div>
                <div className="info-row">
                  <span className="info-label">Họ tên:</span>
                  <span className="info-value">{formData.name}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Số điện thoại:</span>
                  <span className="info-value">{formData.phone}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Email:</span>
                  <span className="info-value">{formData.email}</span>
                </div>
              </div>
              
              {formData.voucher && (
                <div className="review-section">
                  <div className="section-header">
                    <h3>Ưu đãi áp dụng</h3>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Voucher:</span>
                    <span className="info-value">{formData.voucher}</span>
                  </div>
                  {discount > 0 && (
                    <div className="info-row">
                      <span className="info-label">Giảm giá:</span>
                      <span className="info-value discount-value">{discount}%</span>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="review-actions">
              <button className="btn btn-secondary" onClick={() => setShowReview(false)}>
                Quay lại
              </button>
              <button className="btn btn-primary" onClick={handleReviewContinue}>
                Xác nhận
              </button>
            </div>
          </div>
        </>
      )}
      
      {showDeposit && (
        <>
          <div className="modal-overlay" onClick={() => setShowDeposit(false)}></div>
          <div className="deposit-modal">
            <div className="deposit-header">
              <h2>Đặt cọc bàn</h2>
              <div className="deposit-header-line"></div>
            </div>
            
            <div className="deposit-content">
              <div className="deposit-amount-box">
                <div className="deposit-icon">
                  <i className="fas fa-wallet"></i>
                </div>
                <div className="deposit-amount-text">
                  <p className="deposit-amount-label">Số tiền cần đặt cọc</p>
                  <p className="deposit-amount-value">{depositAmount.toLocaleString('vi-VN')} VNĐ</p>
                </div>
              </div>
              
              {discount > 0 && initialDeposit > 0 && (
                <div className="deposit-discount">
                  <div className="discount-item">
                    <span>Giá gốc:</span>
                    <span>{initialDeposit.toLocaleString('vi-VN')} VNĐ</span>
                  </div>
                  <div className="discount-item highlight">
                    <span>Giảm giá:</span>
                    <span>-{discount}%</span>
                  </div>
                </div>
              )}
              
              <div className="deposit-info">
                <p>Bạn sẽ được chuyển đến trang thanh toán để hoàn tất đặt cọc.</p>
              </div>
            </div>
            
            <div className="deposit-actions">
              <button 
                className="btn btn-secondary" 
                onClick={handleCancelClick}
              >
                Hủy
              </button>
              <button
                className="btn btn-primary"
                onClick={handleDepositConfirm}
                disabled={paymentLoading}
              >
                {paymentLoading ? 'Đang xử lý...' : 'Thanh toán'}
              </button>
            </div>
          </div>
        </>
      )}

      {showCancelConfirmation && (
        <PaymentCancelConfirmation 
          onConfirm={handleConfirmCancel} 
          onCancel={handleDismissCancel}
        />
      )}
    </div>
  );
}

export default ReservationPage;