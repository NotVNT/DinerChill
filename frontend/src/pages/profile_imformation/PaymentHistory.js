import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../../styles/profile_imformation/ProfilePage.css';
import LogoutHandler from '../identity/LogoutHandler';

const PaymentHistory = () => {
  const { user, token } = useApp();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPaymentHistory = async () => {
      if (!token) return;
      
      try {
        setLoading(true);
        console.log('Fetching payment history...');
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/reservations/payments`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('Payment history response:', response.data);
        if (response.data && Array.isArray(response.data)) {
          setPayments(response.data);
        } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
          setPayments(response.data.data);
        } else {
          setPayments([]);
          console.warn('Unexpected response format:', response.data);
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching payment history:', err);
        setError('Không thể tải lịch sử đặt cọc. Vui lòng thử lại sau.');
        setLoading(false);
      }
    };

    fetchPaymentHistory();
  }, [token]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'success':
      case 'thành công':
        return 'status-success';
      case 'pending':
      case 'chờ xử lý':
        return 'status-pending';
      case 'failed':
      case 'thất bại':
        return 'status-failed';
      default:
        return '';
    }
  };

  // Get user initials for avatar
  const getInitials = () => {
    if (!user || !user.name) return '?';
    return user.name
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-sidebar">
          <div className="profile-avatar">
            <div className="avatar-circle">
              {user?.avatar ? (
                <img src={user.avatar} alt="Avatar" className="avatar-image" />
              ) : (
                getInitials()
              )}
            </div>
            <div className="username">{user?.name || 'Người dùng'}</div>
            <div className="user-info">ID: {user?.id || 'N/A'}</div>
            <div className="user-info">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg> {user?.phone || 'Chưa có số điện thoại'}
            </div>
          </div>
          
          <nav className="profile-nav">
            <ul>
              <li>
                <Link to="/profile">
                  <span className="nav-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </span>
                  Thông tin tài khoản
                </Link>
              </li>
              <li>
                <Link to="/my-reservations">
                  <span className="nav-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                  </span>
                  Lịch sử đặt chỗ
                </Link>
              </li>
              <li>
                <Link to="/favorites">
                  <span className="nav-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                  </span>
                  Danh sách yêu thích
                </Link>
              </li>
              <li>
                <Link to="/change-password">
                  <span className="nav-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                  </span>
                  Quản lý mật khẩu
                </Link>
              </li>
              <li>
                <Link to="/payment-history" className="active">
                  <span className="nav-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                      <line x1="1" y1="10" x2="23" y2="10"></line>
                    </svg>
                  </span>
                  Lịch sử đặt cọc
                </Link>
              </li>
              <li>
                <LogoutHandler />
              </li>
            </ul>
          </nav>
        </div>
        
        <div className="profile-main">
          <div className="profile-header">
            <h1>
              <span className="header-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                  <line x1="1" y1="10" x2="23" y2="10"></line>
                </svg>
              </span>
              LỊCH SỬ ĐẶT CỌC
            </h1>
          </div>
          
          {error && (
            <div className="error-message">
              <span className="message-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
              </span>
              {error}
            </div>
          )}
          
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Đang tải dữ liệu...</p>
            </div>
          ) : payments.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                  <line x1="1" y1="10" x2="23" y2="10"></line>
                </svg>
              </div>
              <h3>Bạn chưa có đơn đặt cọc nào cả</h3>
              <p>Hãy đặt bàn và thanh toán đặt cọc tại nhà hàng yêu thích</p>
              <Link to="/restaurants" className="btn-primary">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="16"></line>
                  <line x1="8" y1="12" x2="16" y2="12"></line>
                </svg>
                Đặt bàn ngay
              </Link>
            </div>
          ) : (
            <div className="payment-history-content">
              <div className="payment-history-table">
                <table>
                  <thead>
                    <tr>
                      <th>Mã giao dịch</th>
                      <th>Nhà hàng</th>
                      <th>Số tiền</th>
                      <th>Ngày giao dịch</th>
                      <th>Trạng thái</th>
                      <th>Phương thức</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment) => (
                      <tr key={payment.id}>
                        <td>{payment.transactionId || payment.id}</td>
                        <td>
                          <Link to={`/restaurant/${payment.restaurantId}`}>
                            {payment.restaurantName}
                          </Link>
                        </td>
                        <td>{formatCurrency(payment.amount)}</td>
                        <td>{formatDate(payment.createdAt)}</td>
                        <td>
                          <span className={`payment-status ${getStatusClass(payment.status)}`}>
                            {payment.status}
                          </span>
                        </td>
                        <td>{payment.paymentMethod}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentHistory;
