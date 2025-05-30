import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { paymentAPI, reservationAPI } from '../../api';
import '../../styles/PaymentResultPage.css';

const PaymentResultPage = () => {
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [error, setError] = useState(null);
  const [isCancelled, setIsCancelled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const checkPaymentStatus = async () => {
      try {
        // Get all parameters from URL
        const urlParams = new URLSearchParams(location.search);
        const orderCode = urlParams.get('orderCode');
        const cancelled = urlParams.get('cancelled');
        const status = urlParams.get('status');
        const reservationId = urlParams.get('reservationId');
        const code = urlParams.get('code');
        const id = urlParams.get('id');
        
        // Check if payment was cancelled
        if (cancelled === 'true' || status === 'CANCELLED') {
          setIsCancelled(true);
          setLoading(false);
          return;
        }
        
        if (!orderCode) {
          setError('Không tìm thấy mã đơn hàng');
          setLoading(false);
          return;
        }
        
        // For successful payments (based on URL parameters), create fallback data
        // that we can display if the API call fails
        const isSuccessful = code === '00' || status === 'PAID';
        const fallbackData = isSuccessful ? {
          id: id || 'payment-id',
          orderCode: orderCode,
          amount: 5000,
          amountPaid: 5000,
          amountRemaining: 0,
          status: 'PAID',
          createdAt: new Date().toISOString(),
          reservationId: reservationId,
          reservationDate: urlParams.get('reservationDate') || null,
          partySize: urlParams.get('partySize') || null,
          transactions: [{
            reference: id || 'transaction',
            amount: 5000,
            description: `Đặt cọc #${orderCode.toString().slice(-6)}`,
            transactionDateTime: new Date().toISOString()
          }]
        } : null;
        
        try {
          // Get payment information from backend
          const response = await paymentAPI.getPaymentInfo(orderCode);
          
          if (response && response.success && response.data) {
            // Extract reservation details if available
            let paymentData = response.data;
            
            // Check if reservation data is included
            if (response.data.reservation) {
              const reservation = response.data.reservation;
              // Add reservation date and number of people
              paymentData = {
                ...paymentData,
                reservationDate: reservation.date ? `${reservation.date} ${reservation.time || ''}` : null,
                partySize: reservation.partySize || reservation.guests || null
              };
            }
            
            setPaymentStatus(paymentData);
            
            // If payment is successful and we have a reservation ID, confirm the reservation
            if (response.data.status === 'PAID' && reservationId) {
              try {
                await paymentAPI.confirmPayment({
                  reservationId,
                  paymentId: response.data.id
                });
              } catch (confirmError) {
                console.error('Error confirming reservation:', confirmError);
              }
            }
          } else {
            if (fallbackData) {
              // If API call fails but we have URL parameters indicating success,
              // use the fallback data to show success page
              setPaymentStatus(fallbackData);
              
              // Also try to confirm the reservation
              if (reservationId) {
                try {
                  await paymentAPI.confirmPayment({
                    reservationId,
                    paymentId: fallbackData.id
                  });
                  
                  // Try to get reservation details to add to the payment info
                  try {
                    const reservations = await reservationAPI.getByUser();
                    if (Array.isArray(reservations)) {
                      const targetReservation = reservations.find(r => r.id === reservationId);
                      if (targetReservation) {
                        // Update payment status with reservation details
                        setPaymentStatus(prevStatus => ({
                          ...prevStatus,
                          reservationDate: targetReservation.date ? `${targetReservation.date} ${targetReservation.time || ''}` : null,
                          partySize: targetReservation.partySize || targetReservation.guests || null
                        }));
                      }
                    }
                  } catch (reservationError) {
                    console.error('Error fetching reservation details:', reservationError);
                  }
                } catch (confirmError) {
                  console.error('Error confirming reservation with fallback data:', confirmError);
                }
              }
            } else {
              setError('Không thể lấy thông tin thanh toán');
            }
          }
        } catch (apiError) {
          console.error('Error fetching payment status:', apiError);
          
          if (fallbackData) {
            // If API call fails but we have URL parameters indicating success,
            // use the fallback data to show success page
            setPaymentStatus(fallbackData);
            
            // Also try to confirm the reservation
            if (reservationId) {
              try {
                await paymentAPI.confirmPayment({
                  reservationId,
                  paymentId: fallbackData.id
                });
              } catch (confirmError) {
                console.error('Error confirming reservation with fallback data:', confirmError);
              }
            }
          } else {
            setError('Lỗi khi kiểm tra trạng thái thanh toán');
          }
        }
      } catch (error) {
        console.error('Error in payment result page:', error);
        setError('Đã xảy ra lỗi khi xử lý kết quả thanh toán');
      } finally {
        setLoading(false);
      }
    };
    
    checkPaymentStatus();
  }, [location]);
  
  const handleBackToHome = () => {
    navigate('/');
  };

  const handleBackToRestaurants = () => {
    navigate('/');
  };
  
  const renderPaymentResult = () => {
    if (loading) {
      return (
        <div className="loading-container">
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
          <p>Đang xử lý thanh toán...</p>
        </div>
      );
    }

    if (isCancelled) {
      return (
        <div className="payment-cancelled">
          <div className="payment-icon-container cancelled">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
          </div>
          <h2>Thanh Toán Đã Bị Hủy</h2>
          <div className="payment-message">
            <p>Đặt bàn của bạn đã được hủy. Bạn có thể quay lại danh sách nhà hàng để đặt lại.</p>
          </div>
          <div className="action-buttons">
            <button onClick={handleBackToRestaurants} className="back-button">
              Quay Lại Danh Sách Nhà Hàng
            </button>
            <button onClick={() => navigate('/my-reservations')} className="back-button secondary">
              Xem Lịch Sử Đặt Chỗ
            </button>
          </div>
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="payment-error">
          <div className="payment-icon-container error">
            <i className="fas fa-exclamation"></i>
          </div>
          <h2>Đã xảy ra lỗi</h2>
          <p>{error}</p>
          <button onClick={handleBackToHome} className="back-button">Quay lại trang chủ</button>
        </div>
      );
    }
    
    if (paymentStatus) {
      // Check payment status
      const isPaid = paymentStatus.status === 'PAID' || 
                     paymentStatus.amountPaid >= paymentStatus.amount;
      
      if (isPaid) {
        return (
          <div className="payment-result success">
            <div className="success-animation">
              <svg className="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                <circle className="checkmark__circle" cx="26" cy="26" r="25" fill="none"/>
                <path className="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
              </svg>
            </div>
            <h2>Thanh toán thành công</h2>
            <div className="payment-details">
              <div className="payment-detail-item">
                <span className="detail-label">Mã đơn hàng:</span>
                <span className="detail-value">{paymentStatus.orderCode}</span>
              </div>
              <div className="payment-detail-item">
                <span className="detail-label">Mô tả:</span>
                <span className="detail-value">
                  {paymentStatus.transactions?.[0]?.description || `Thanh toán ${paymentStatus.orderCode}`}
                </span>
              </div>
              <div className="payment-detail-item">
                <span className="detail-label">Số tiền:</span>
                <span className="detail-value highlight">{paymentStatus.amount?.toLocaleString()}đ</span>
              </div>
              <div className="payment-detail-item">
                <span className="detail-label">Thời gian:</span>
                <span className="detail-value">{new Date(paymentStatus.createdAt).toLocaleString()}</span>
              </div>
              {paymentStatus.reservationDate && (
                <div className="payment-detail-item">
                  <span className="detail-label">Ngày đặt bàn:</span>
                  <span className="detail-value">{paymentStatus.reservationDate}</span>
                </div>
              )}
              {paymentStatus.partySize && (
                <div className="payment-detail-item">
                  <span className="detail-label">Số lượng người:</span>
                  <span className="detail-value">{paymentStatus.partySize} người</span>
                </div>
              )}
            </div>
            <div className="action-buttons">
              <button onClick={handleBackToHome} className="back-button primary">
                Quay lại trang chủ
              </button>
            </div>
          </div>
        );
      } else {
        return (
          <div className="payment-result pending">
            <div className="payment-icon-container pending">
              <i className="fas fa-clock"></i>
            </div>
            <h2>Thanh toán đang xử lý</h2>
            <div className="payment-details">
              <div className="payment-detail-item">
                <span className="detail-label">Mã đơn hàng:</span>
                <span className="detail-value">{paymentStatus.orderCode}</span>
              </div>
              <div className="payment-detail-item">
                <span className="detail-label">Mô tả:</span>
                <span className="detail-value">
                  {paymentStatus.transactions?.[0]?.description || `Thanh toán ${paymentStatus.orderCode}`}
                </span>
              </div>
              <div className="payment-detail-item">
                <span className="detail-label">Số tiền:</span>
                <span className="detail-value">{paymentStatus.amount?.toLocaleString()}đ</span>
              </div>
              <div className="payment-detail-item">
                <span className="detail-label">Trạng thái:</span>
                <span className="detail-value status-badge pending">{paymentStatus.status}</span>
              </div>
              {paymentStatus.reservationDate && (
                <div className="payment-detail-item">
                  <span className="detail-label">Ngày đặt bàn:</span>
                  <span className="detail-value">{paymentStatus.reservationDate}</span>
                </div>
              )}
              {paymentStatus.partySize && (
                <div className="payment-detail-item">
                  <span className="detail-label">Số lượng người:</span>
                  <span className="detail-value">{paymentStatus.partySize} người</span>
                </div>
              )}
            </div>
            <div className="action-buttons">
              <button onClick={handleBackToHome} className="back-button">
                Quay lại trang chủ
              </button>
            </div>
          </div>
        );
      }
    }
    
    return null;
  };

  return (
    <div className="payment-result-container">
      <div className="payment-result-card">
        <h1>Kết quả thanh toán</h1>
        {renderPaymentResult()}
      </div>
    </div>
  );
};

export default PaymentResultPage; 