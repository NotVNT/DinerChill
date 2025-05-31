import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import '../../styles/ReservationPage.css';
import { restaurantsAPI } from '../../services/api';

function ReservationPage() {
  const { user, addReservation, addReservationHistory } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);

  const restaurantId = queryParams.get('restaurant');
  
  // Get initial date, checking if current time is after 22:00 to select next day
  const getCurrentOrNextDay = () => {
    const now = new Date();
    if (now.getHours() >= 22) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow.toISOString().split('T')[0];
    }
    return now.toISOString().split('T')[0];
  };
  
  const initialDate = queryParams.get('date') || getCurrentOrNextDay();
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
  const [discount, setDiscount] = useState(0);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [toast, setToast] = useState({ show: false, message: '', type: 'error' });
  
  // State to track if edit mode is active
  const [showEditForm, setShowEditForm] = useState(false);
  
  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes (changed from 10 seconds)
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
    setTimeLeft(300); // Reset to 5 minutes (changed from 10 seconds)
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
  const validatePhone = (phone) => {
    // Remove all non-digit characters
    const cleanedPhone = phone.replace(/\D/g, '');
    
    // Check if it's a standard 10-digit number
    if (cleanedPhone.length === 10) {
      return true;
    }
    
    // Check if it's a number with +84 prefix (resulting in 11 digits with '84' + 9 digits)
    if (cleanedPhone.length === 11 && cleanedPhone.startsWith('84')) {
      return true;
    }
    
    return false;
  };

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

  const generateTimeSlots = useCallback((openTime, closeTime) => {
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

    // Check if current date is today and if current time is after 22:00
    const today = new Date().toISOString().split('T')[0];
    const currentTime = new Date();
    const currentHourOfDay = currentTime.getHours();
    
    // If it's after 22:00, don't filter - we're already using tomorrow's date
    if (formData.date === today && currentHourOfDay < 22) {
      const filteredTimes = times.filter(time => {
        const [hour, minute] = time.split(':').map(Number);
        const timeDate = new Date(currentTime);
        timeDate.setHours(hour, minute, 0, 0);
        const diffHours = (timeDate - currentTime) / (1000 * 60 * 60);
        return diffHours >= 2;
      });
      
      // Return filtered times if there are any, otherwise return all times
      return filteredTimes.length > 0 ? filteredTimes : times;
    }

    return times;
  }, [formData.date]);

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
  }, [restaurantId, queryParams, formData.time, generateTimeSlots]); // Added generateTimeSlots as a dependency

  // Calculate discount if promotion is applied
  useEffect(() => {
    if (selectedRestaurant && formData.voucher) {
      // Default discount logic - in a real app, this would come from your promotions data
      setDiscount(10); // Default 10% discount
    } else {
      setDiscount(0);
    }
  }, [formData.voucher, selectedRestaurant]);

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
    
    // Special handling for date to prevent selecting a date earlier than the current selected date
    if (name === 'date') {
      // Don't allow selecting dates earlier than the current value
      if (value < formData.date) {
        return; // Don't update if trying to select an earlier date
      }
    }
    
    setFormData(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) return 'Vui lòng nhập họ tên.';
    if (!validateEmail(formData.email)) return 'Email không hợp lệ.';
    if (!validatePhone(formData.phone)) return 'Số điện thoại không hợp lệ. Vui lòng nhập 10 chữ số hoặc định dạng +84 và 9 chữ số.';
    if (!formData.date) return 'Vui lòng chọn ngày.';
    if (!formData.time) return 'Vui lòng chọn giờ.';
    if (!selectedRestaurant) return 'Không tìm thấy thông tin nhà hàng.';

    // Check if reservation time is at least 2 hours in the future
    const currentTime = new Date();
    const reservationTime = new Date(`${formData.date}T${formData.time}:00`);
    const timeDifferenceInHours = (reservationTime - currentTime) / (1000 * 60 * 60);
    
    if (timeDifferenceInHours < 2) {
      return 'Thời gian đặt bàn phải ít nhất 2 giờ sau thời gian hiện tại.';
    }
    
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
      // Special handling for the 2-hour time validation error
      if (validationError === 'Thời gian đặt bàn phải ít nhất 2 giờ sau thời gian hiện tại.') {
        setToast({
          show: true,
          message: validationError,
          type: 'error'
        });
      } else {
        setError(validationError);
      }
      setSubmitting(false);
      return;
    }

    setShowReview(true);
    setSubmitting(false);
  };

  const handleReviewContinue = async () => {
    setShowReview(false);
    setSubmitting(true);
    
    try {
      // Prepare reservation data for the API
      const reservationData = {
        userId: user?.id || 1, // Default to 1 if no user ID available
        restaurantId: parseInt(restaurantId),
        tableId: formData.tableId ? parseInt(formData.tableId) : null,
        date: formData.date,
        time: formData.time,
        partySize: formData.guests + formData.children, // Sum of adults and children
        notes: formData.specialRequests,
        tableCode: formData.tableCode || ''
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
          partySize: formData.guests + formData.children, // Sum of adults and children
          guests: formData.guests, // Keep original adults count
          children: formData.children, // Keep original children count
          status: 'pending',
          code: reservationId,
          notes: formData.specialRequests,
          tableCode: formData.tableCode || response.tableCode || ''
        };

        console.log("Sending reservation data to success page:", updatedReservationData);

        // Save to reservation history
        await addReservationHistory({
          ...updatedReservationData,
          timestamp: new Date().toISOString(),
        });

        // Save to localStorage for offline access
        const existingReservations = JSON.parse(localStorage.getItem('successfulReservations') || '[]');
        localStorage.setItem('successfulReservations', JSON.stringify([...existingReservations, updatedReservationData]));

        // Navigate to success page with reservation data
        navigate('/reservation-success', { state: { reservationData: updatedReservationData } });
      } else {
        // Check if the error should be shown as a toast
        if (response.showAsToast) {
          setToast({
            show: true,
            message: response.message || 'Bàn này đã được đặt vào thời gian bạn chọn',
            type: 'error'
          });
          setShowReview(false);
        } else {
          throw new Error(response.message || 'Đặt bàn không thành công.');
        }
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.showAsToast) {
        setToast({
          show: true,
          message: error.response.data.message || 'Bàn này đã được đặt vào thời gian bạn chọn',
          type: 'error'
        });
        setShowReview(false);
      } else {
        setError(error.message || 'Có lỗi xảy ra khi đặt bàn. Vui lòng thử lại sau.');
      }
      console.error('Reservation error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  // Function to hide toast after a few seconds
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast({ ...toast, show: false });
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleToggleEditForm = () => {
    // If opening the edit form, check if we need to select next day
    if (!showEditForm) {
      const now = new Date();
      if (now.getHours() >= 22) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowString = tomorrow.toISOString().split('T')[0];
        
        // Only update if current date is today
        const today = new Date().toISOString().split('T')[0];
        if (formData.date === today) {
          setFormData(prev => ({ ...prev, date: tomorrowString }));
        }
      }
    }
    
    setShowEditForm(!showEditForm);
  };

  const handleSaveEdit = () => {
    // Apply the after 22:00 logic here as well
    const now = new Date();
    if (now.getHours() >= 22) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowString = tomorrow.toISOString().split('T')[0];
      
      // Only update if current date is today
      const today = new Date().toISOString().split('T')[0];
      if (formData.date === today) {
        setFormData(prev => ({ ...prev, date: tomorrowString }));
      }
    }
    
    setShowEditForm(false);
  };

  if (loading) {
    return <div className="loading">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="reservation-page">
      {error && <div className="error-message">{error}</div>}
      
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
                onClick={handleToggleEditForm}
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
                        min={formData.date}
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
                    onClick={handleSaveEdit}
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
                {formData.tableCode && (
                  <div className="info-row">
                    <span className="info-label">Mã bàn:</span>
                    <span className="info-value">{formData.tableCode}</span>
                  </div>
                )}
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
      
      {/* Toast notification */}
      {toast.show && (
        <div className="toast-notification error">
          <div className="toast-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
          <div className="toast-message">{toast.message}</div>
          <div className="toast-close" onClick={() => setToast({...toast, show: false})}>×</div>
        </div>
      )}
    </div>
  );
}

export default ReservationPage;