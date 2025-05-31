import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import '../../styles/ResSuccesPage.css';
import { paymentAPI } from '../../services/api';

function ReservationSuccessPage() {
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Use useMemo to properly memoize the reservationData
  const reservationData = useMemo(() => location.state?.reservationData || {}, [location.state]);
  
  // Debug để kiểm tra dữ liệu nhận được
  useEffect(() => {
    console.log("Reservation data received:", reservationData);
  }, [reservationData]);
  
  // If no reservation data is passed, provide default values
  const {
    id: reservationId = '',
    restaurantName = '',
    date = '',
    time = '',
    guests = 0,
    tableCode = '',
    partySize = 0,
    children = 0
  } = reservationData;
  
  // Go to payment handler
  const handleGoToPayment = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Call the PayOS payment creation API
      const response = await paymentAPI.createPayment({
        amount: 5000, // 5,000 VND deposit amount
        orderInfo: `Đặt cọc bàn tại ${restaurantName}`,
        reservationId: reservationId
      });
      
      if (response && response.success) {
        // Redirect to the PayOS checkout URL
        window.location.href = response.checkoutUrl;
      } else {
        setError('Không thể tạo liên kết thanh toán');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error creating payment:', error);
      setError('Đã xảy ra lỗi khi tạo thanh toán');
      setLoading(false);
    }
  };

  return (
    <div className="reservation-success-page">
      <div className="success-title-container">
        <h1 className="success-title">Đặt bàn thành công!</h1>
      </div>

      <div className="success-message-box">
        <p className="success-message">
          Cảm ơn bạn đã đặt bàn tại {restaurantName}. Đơn đặt bàn của bạn đã được lưu vào hệ thống!
        </p>
      </div>

      <div className="reservation-info-container">
        <div className="reservation-info-left-border"></div>
        <div className="reservation-info-content">
          <div className="reservation-info-item">
            <div className="info-label">Mã bàn:</div>
            <div className="info-value">{tableCode || 'Chưa phân bàn'}</div>
          </div>
          <div className="reservation-info-item">
            <div className="info-label">Ngày:</div>
            <div className="info-value">{date ? date.split('-').reverse().join('/') : ''}</div>
          </div>
          <div className="reservation-info-item">
            <div className="info-label">Giờ:</div>
            <div className="info-value">{time}</div>
          </div>
          <div className="reservation-info-item">
            <div className="info-label">Số người:</div>
            <div className="info-value">
              {guests && children ? 
                `${guests} người lớn, ${children} trẻ em` : 
                `${partySize || guests} người`}
            </div>
          </div>
          <div className="reservation-info-item">
            <div className="info-label">Số tiền đặt cọc:</div>
            <div className="info-value">5.000 VND</div>
          </div>
        </div>
      </div>

      <div className="info-note-container">
        <div className="info-note">
          <span className="info-icon">ℹ</span>
          <span>Thông tin đặt bàn đã được lưu vào hệ thống. Vui lòng tiếp tục để đặt cọc.</span>
        </div>
      </div>

      <div className="payment-button-container">
        <button 
          className="payment-button" 
          onClick={handleGoToPayment}
          disabled={loading}
        >
          {loading ? (
            'Đang xử lý...'
          ) : (
            <>
              <span className="payment-icon">💳</span>
              Đi đến thanh toán
            </>
          )}
        </button>
        {error && <p className="error-message">{error}</p>}
      </div>
    </div>
  );
}

export default ReservationSuccessPage;
