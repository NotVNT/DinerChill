import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/PaymentResultPage.css';

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
        // Get orderCode from URL parameters
        const urlParams = new URLSearchParams(location.search);
        const orderCode = urlParams.get('orderCode');
        const cancelled = urlParams.get('cancelled');
        const status = urlParams.get('status');
        
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
        
        // Get payment information from backend
        const response = await axios.get(`/api/payment/info/${orderCode}`);
        
        if (response.data && response.data.success && response.data.data) {
          setPaymentStatus(response.data.data);
        } else {
          setError('Không thể lấy thông tin thanh toán');
        }
      } catch (error) {
        console.error('Error fetching payment status:', error);
        setError('Lỗi khi kiểm tra trạng thái thanh toán');
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
      return <div className="loading-spinner">Đang tải thông tin thanh toán...</div>;
    }

    if (isCancelled) {
      return (
        <div className="payment-cancelled">
          <i className="fas fa-times-circle"></i>
          <h2>Thanh Toán Đã Bị Hủy</h2>
          <p>Đặt bàn của bạn đã được hủy. Bạn có thể quay lại danh sách nhà hàng để đặt lại.</p>
          <button onClick={handleBackToRestaurants} className="back-button">
            Quay Lại Danh Sách Nhà Hàng
          </button>
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="payment-error">
          <i className="fas fa-exclamation-circle"></i>
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
      
      return (
        <div className={`payment-result ${isPaid ? 'success' : 'pending'}`}>
          {isPaid ? (
            <>
              <i className="fas fa-check-circle"></i>
              <h2>Thanh toán thành công</h2>
              <div className="payment-details">
                <p><strong>Mã đơn hàng:</strong> {paymentStatus.orderCode}</p>
                <p><strong>Mô tả:</strong> {paymentStatus.transactions?.[0]?.description || `Thanh toán ${paymentStatus.orderCode}`}</p>
                <p><strong>Số tiền:</strong> {paymentStatus.amount?.toLocaleString()}đ</p>
                <p><strong>Thời gian:</strong> {new Date(paymentStatus.createdAt).toLocaleString()}</p>
              </div>
            </>
          ) : (
            <>
              <i className="fas fa-clock"></i>
              <h2>Thanh toán đang xử lý</h2>
              <div className="payment-details">
                <p><strong>Mã đơn hàng:</strong> {paymentStatus.orderCode}</p>
                <p><strong>Mô tả:</strong> {paymentStatus.transactions?.[0]?.description || `Thanh toán ${paymentStatus.orderCode}`}</p>
                <p><strong>Số tiền:</strong> {paymentStatus.amount?.toLocaleString()}đ</p>
                <p><strong>Trạng thái:</strong> {paymentStatus.status}</p>
              </div>
            </>
          )}
          
          <button onClick={handleBackToHome} className="back-button">
            Quay lại trang chủ
          </button>
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className="payment-result-container">
      <h1>Kết quả thanh toán</h1>
      {renderPaymentResult()}
    </div>
  );
};

export default PaymentResultPage; 