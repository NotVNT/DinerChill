import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { reservationAPI } from '../../api';
import { useApp } from '../../context/AppContext';
import '../../styles/profile_imformation/MyReservationsPage.css';
import LogoutHandler from '../identity/LogoutHandler';
import { paymentAPI } from '../../api';

// Get actual current date and time
const currentDate = new Date();

// Helper function to check if a reservation can be cancelled
const canCancelReservation = (reservation) => {
  if (reservation.status !== 'confirmed') {
    return false; // Only confirmed reservations can be cancelled
  }
  
  // Calculate time difference in hours
  const reservationDateTime = new Date(`${reservation.date}T${reservation.time}:00+07:00`);
  const timeDiffHours = (reservationDateTime - currentDate) / (1000 * 60 * 60);
  
  // Can cancel only if more than 12 hours before reservation time
  // Adding a small buffer (0.5 hours) to account for edge cases
  return timeDiffHours >= 12.5;
};

const fetchReservations = async (setReservations, setLoading, setError) => {
  try {
    setLoading(true);
    let apiData = [];
    try {
      const response = await reservationAPI.getByUser();
      console.log('Reservation API response:', response);
      if (Array.isArray(response)) {
        apiData = response;
      } else {
        console.warn('API response is not an array:', response);
      }
    } catch (apiErr) {
      console.error('API call failed:', apiErr);
    }

    const apiReservations = Array.isArray(apiData) ? apiData.map(res => {
      // Check if restaurant data is available as a nested object
      const restaurantData = res.restaurant || {};
      console.log(`Reservation ${res.id}: Restaurant data:`, restaurantData);
      
      // Check for table data in different possible locations
      let tableCode = '';
      if (res.tableCode) {
        tableCode = res.tableCode;
      } else if (res.table && res.table.code) {
        tableCode = res.table.code;
      } else if (res.table && res.table.tableCode) {
        tableCode = res.table.tableCode;
      } else if (res.table && typeof res.table === 'string') {
        tableCode = res.table; // If table is just a string
      }
      
      console.log(`Reservation ${res.id}: Table data:`, res.table, 'Extracted tableCode:', tableCode);
      
      return {
        ...res,
        source: 'api',
        // Extract restaurant data from nested object if available
        restaurantName: res.restaurantName || restaurantData.name || 'Nhà hàng không xác định',
        restaurantAddress: res.restaurantAddress || restaurantData.address || 'Địa chỉ không xác định',
        restaurantImage: res.restaurantImage || restaurantData.image || restaurantData.coverImage || '',
        depositAmount: res.finalDeposit || 0,
        refundStatus: res.refundStatus || (res.status === 'cancelled' ? 'pending' : undefined),
        partySize: res.partySize || res.guests || 0,
        tableCode: tableCode // Use the extracted tableCode
      };
    }) : [];

    const localReservations = JSON.parse(localStorage.getItem('successfulReservations') || '[]');
    const formattedLocalReservations = Array.isArray(localReservations) ? localReservations.map(res => ({
      id: res.id,
      restaurantId: res.restaurantId,
      restaurantName: res.restaurantName || 'Nhà hàng không xác định',
      restaurantImage: res.restaurantImage || '',
      restaurantAddress: res.restaurantAddress || 'Địa chỉ không xác định',
      date: res.date,
      time: res.time,
      partySize: res.partySize || res.guests || 0,
      guests: res.guests,
      children: res.children || 0,
      status: res.status || 'confirmed',
      code: res.code || res.id,
      tableCode: res.tableCode || '',
      specialRequests: res.specialRequests || '',
      depositAmount: res.finalDeposit || 0,
      source: 'local',
      refundStatus: res.refundStatus || (res.status === 'cancelled' ? 'pending' : undefined),
    })) : [];

    const mergedReservations = [
      ...apiReservations,
      ...formattedLocalReservations.filter(localRes =>
        !apiReservations.some(apiRes => apiRes.id === localRes.id)
      )
    ];

    const uniqueReservations = Array.from(new Map(mergedReservations.map(res => [res.id, res])).values());

    const updatedReservations = uniqueReservations.map(res => {
      const reservationDateTime = new Date(`${res.date}T${res.time}:00+07:00`);
      
      // Mark as completed if the reservation time has passed
      if (res.status === 'confirmed' && reservationDateTime < currentDate) {
        return { ...res, status: 'completed' };
      }
      
      // Auto-cancel pending reservations that are more than 1 hour old
      if (res.status === 'pending') {
        const createdAt = res.createdAt ? new Date(res.createdAt) : new Date(res.id); // Fallback to using ID as timestamp
        const pendingHours = (currentDate - createdAt) / (1000 * 60 * 60);
        
        if (pendingHours >= 1) {
          return { ...res, status: 'cancelled', autoCancelled: true };
        }
      }
      
      return res;
    });

    setReservations(updatedReservations);

    localStorage.setItem('successfulReservations', JSON.stringify(
      updatedReservations.filter(res => res.status === 'confirmed' || res.status === 'completed')
    ));

    setError(null);
  } catch (err) {
    console.error('Error fetching reservations:', err);
    const localReservations = JSON.parse(localStorage.getItem('successfulReservations') || '[]');
    const formattedLocalReservations = Array.isArray(localReservations) ? localReservations.map(res => ({
      id: res.id,
      restaurantId: res.restaurantId,
      restaurantName: res.restaurantName || 'Nhà hàng không xác định',
      restaurantImage: res.restaurantImage || '',
      restaurantAddress: res.restaurantAddress || 'Địa chỉ không xác định',
      date: res.date,
      time: res.time,
      partySize: res.partySize || res.guests || 0,
      guests: res.guests,
      children: res.children || 0,
      status: res.status || 'confirmed',
      code: res.code || res.id,
      tableCode: res.tableCode || '',
      specialRequests: res.specialRequests || '',
      depositAmount: res.finalDeposit || 0,
      source: 'local',
      refundStatus: res.refundStatus || (res.status === 'cancelled' ? 'pending' : undefined),
    })) : [];

    const updatedLocalReservations = formattedLocalReservations.map(res => {
      const reservationDateTime = new Date(`${res.date}T${res.time}:00+07:00`);
      if (res.status === 'confirmed' && reservationDateTime < currentDate) {
        return { ...res, status: 'completed' };
      }
      return res;
    });

    setReservations(updatedLocalReservations);
    setError('Không thể tải danh sách đặt bàn từ server. Đang hiển thị dữ liệu cục bộ.');
  } finally {
    setLoading(false);
  }
};

function MyReservationsPage() {
  const { user } = useApp();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [cancelModal, setCancelModal] = useState({ 
    show: false, 
    reservationId: null, 
    reason: '',
    isSubmitting: false
  });
  const [paymentLoading, setPaymentLoading] = useState(false);

  useEffect(() => {
    fetchReservations(setReservations, setLoading, setError);

    // Auto-refresh to check for reservations that should be auto-cancelled
    const autoRefreshInterval = setInterval(() => {
      fetchReservations(setReservations, setLoading, setError);
    }, 60000); // Check every minute

    return () => clearInterval(autoRefreshInterval);
  }, []);

  const openCancelModal = (reservationId) => {
    setCancelModal({ show: true, reservationId, reason: '', isSubmitting: false });
  };

  const closeCancelModal = () => {
    setCancelModal({ show: false, reservationId: null, reason: '', isSubmitting: false });
  };

  const confirmCancel = async () => {
    try {
      setCancelModal(prev => ({ ...prev, isSubmitting: true }));
      const reservation = reservations.find(res => res.id === cancelModal.reservationId);
      
      // Don't allow cancellation if it's less than 12 hours before the reservation time
      if (reservation.status === 'confirmed') {
        const reservationDateTime = new Date(`${reservation.date}T${reservation.time}:00+07:00`);
        const timeDiffHours = (reservationDateTime - currentDate) / (1000 * 60 * 60);
        
        if (timeDiffHours < 12.5) {
          setToast({
            show: true,
            message: 'Không thể hủy đặt bàn khi chưa đủ 12 giờ trước thời gian đặt.',
            type: 'error'
          });
          setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
          setCancelModal(prev => ({ ...prev, isSubmitting: false }));
          closeCancelModal();
          return;
        }
      }
      
      // Kiểm tra nếu trạng thái là 'pending', không cần lý do hủy
      const isPending = reservation.status === 'pending';
      
      if (!isPending && !cancelModal.reason) {
        setToast({
          show: true,
          message: 'Vui lòng chọn lý do hủy.',
          type: 'error'
        });
        setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
        setCancelModal(prev => ({ ...prev, isSubmitting: false }));
        return;
      }
      
      const reservationDateTime = new Date(`${reservation.date}T${reservation.time}:00+07:00`);
      const timeDiffHours = (reservationDateTime - currentDate) / (1000 * 60 * 60);
      const isRefundable = timeDiffHours >= 24;

      console.log('Cập nhật trạng thái đặt bàn có ID:', cancelModal.reservationId, 'sang cancelled', isPending ? '(đang chờ)' : `với lý do: ${cancelModal.reason}`);
      
      // Gọi API để cập nhật trạng thái (không xóa dữ liệu)
      const updateParams = { 
        reason: isPending ? 'Hủy đặt bàn đang chờ' : cancelModal.reason,
        status: 'cancelled',
        keepData: true,
      };
      
      const response = await reservationAPI.update(cancelModal.reservationId, updateParams);
      
      console.log('Kết quả cập nhật trạng thái:', response);

      // Xử lý hoàn tiền nếu cần và không phải đơn đang chờ
      let refundStatus = 'pending';
      if (!isPending && isRefundable && reservation.depositAmount > 0) {
        try {
          const refundResponse = await reservationAPI.refund(cancelModal.reservationId, {
            amount: reservation.depositAmount,
            reason: cancelModal.reason
          });
          refundStatus = refundResponse.status === 'success' ? 'completed' : 'rejected';
        } catch (refundErr) {
          console.error('API hoàn tiền thất bại:', refundErr);
          refundStatus = 'rejected';
          setToast({
            show: true,
            message: 'Đã hủy đặt bàn nhưng không thể xử lý hoàn tiền. Vui lòng liên hệ hỗ trợ!',
            type: 'warning'
          });
        }
      }

      // Cập nhật danh sách đặt bàn trong state
      const updatedReservations = reservations.map(res =>
        res.id === cancelModal.reservationId ? { ...res, status: 'cancelled', refundStatus } : res
      );
      setReservations(updatedReservations);

      // Cập nhật localStorage
      const syncedReservations = updatedReservations.filter(
        res => res.status === 'confirmed' || res.status === 'completed'
      );
      localStorage.setItem('successfulReservations', JSON.stringify(syncedReservations));

      // Hiển thị thông báo thành công
      setToast({
        show: true,
        message: isPending 
          ? 'Hủy đặt bàn đang chờ thành công!'
          : (isRefundable && reservation.depositAmount > 0
              ? `Hủy đặt bàn thành công! ${refundStatus === 'completed' ? `Số tiền ${reservation.depositAmount.toLocaleString('vi-VN')}đ đã được hoàn.` : 'Đang xử lý hoàn tiền.'}`
              : 'Hủy đặt bàn thành công! Trạng thái đã được cập nhật.'),
        type: 'success'
      });

      setTimeout(() => {
        setToast({ show: false, message: '', type: '' });
        closeCancelModal();
      }, 3000);
    } catch (err) {
      console.error('Lỗi khi hủy đặt bàn:', err.message, 'Chi tiết:', err.response?.data);

      // Xử lý cho trường hợp client-side
      const reservationToCancel = reservations.find(res => res.id === cancelModal.reservationId);
      if (reservationToCancel?.source === 'local') {
        const isPending = reservationToCancel.status === 'pending';
        const reservationDateTime = new Date(`${reservationToCancel.date}T${reservationToCancel.time}:00+07:00`);
        const timeDiffHours = (reservationDateTime - currentDate) / (1000 * 60 * 60);
        const isRefundable = timeDiffHours >= 24;
        let refundStatus = 'pending';

        if (!isPending && isRefundable && reservationToCancel.depositAmount > 0) {
          refundStatus = 'completed'; // Giả định hoàn tiền cục bộ
        }

        const updatedReservations = reservations.map(res =>
          res.id === cancelModal.reservationId ? { ...res, status: 'cancelled', refundStatus } : res
        );
        setReservations(updatedReservations);

        const syncedReservations = updatedReservations.filter(
          res => res.status === 'confirmed' || res.status === 'completed'
        );
        localStorage.setItem('successfulReservations', JSON.stringify(syncedReservations));

        setToast({
          show: true,
          message: isPending
            ? 'Hủy đặt bàn đang chờ thành công (cục bộ)!'
            : (isRefundable && reservationToCancel.depositAmount > 0
                ? `Hủy đặt bàn thành công (cục bộ)! ${refundStatus === 'completed' ? `Số tiền ${reservationToCancel.depositAmount.toLocaleString('vi-VN')}đ đã được hoàn.` : 'Đang xử lý hoàn tiền.'}`
                : 'Hủy đặt bàn thành công (cục bộ)! Trạng thái đã được cập nhật.'),
          type: 'success'
        });

        setTimeout(() => {
          setToast({ show: false, message: '', type: '' });
          closeCancelModal();
        }, 3000);
      } else {
        setError('Không thể hủy đặt bàn. Vui lòng thử lại.');
        setToast({
          show: true,
          message: 'Không thể hủy đặt bàn. Vui lòng thử lại.',
          type: 'error'
        });
        setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
      }
    } finally {
      setCancelModal(prev => ({ ...prev, isSubmitting: false }));
    }
  };

  const deleteReservation = (reservationId) => {
    const updatedReservations = reservations.filter(res => res.id !== reservationId);
    setReservations(updatedReservations);
    const syncedReservations = updatedReservations.filter(
      res => res.status === 'confirmed' || res.status === 'completed'
    );
    localStorage.setItem('successfulReservations', JSON.stringify(syncedReservations));
    setToast({
      show: true,
      message: 'Đã xóa đặt bàn khỏi lịch sử.',
      type: 'success'
    });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  const formatDate = (dateString) => {
    if (!dateString || isNaN(new Date(dateString).getTime())) {
      return 'Ngày không xác định';
    }
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN').format(date);
  };

  const getStatusClass = (status) => {
    switch(status) {
      case 'confirmed': return 'status-confirmed';
      case 'cancelled': return 'status-cancelled';
      case 'completed': return 'status-completed';
      default: return 'status-pending';
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'confirmed': return 'Đã xác nhận';
      case 'cancelled': return 'Đã hủy';
      case 'completed': return 'Đã hoàn thành';
      default: return 'Đang chờ';
    }
  };

  const getRefundText = (refundStatus) => {
    switch(refundStatus) {
      case 'completed': return 'Đã hoàn tiền.';
      case 'pending': return 'Đang xử lý hoàn tiền.';
      case 'rejected': return 'Không hoàn tiền do: Quy định nhà hàng (hủy sau 24h).';
      default: return '';
    }
  };

  const getInitials = () => {
    if (!user || !user.name) return '?';
    return user.name
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const handlePayDeposit = async (reservationId, restaurantName) => {
    try {
      setPaymentLoading(true);
      
      // Call the PayOS payment creation API
      const response = await paymentAPI.createPayment({
        amount: 5000, // 5,000 VND deposit amount
        orderInfo: `Đặt cọc bàn tại ${restaurantName || 'nhà hàng'}`,
        reservationId: reservationId
      });
      
      if (response && response.success) {
        // Redirect to the PayOS checkout URL
        window.location.href = response.checkoutUrl;
      } else {
        setToast({
          show: true,
          message: 'Không thể tạo liên kết thanh toán',
          type: 'error'
        });
        setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
      }
    } catch (error) {
      console.error('Error creating payment:', error);
      setToast({
        show: true,
        message: 'Đã xảy ra lỗi khi tạo thanh toán',
        type: 'error'
      });
      setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
    } finally {
      setPaymentLoading(false);
    }
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
            <div className="username">{user?.name}</div>
            <div className="user-info">ID: {user?.id}</div>
            <div className="user-info">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg> {user?.phone}
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
                <Link to="/my-reservations" className="active">
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
                <Link to="/payment-history">
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
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
              </span>
              LỊCH SỬ ĐẶT CHỖ
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
          
          {loading && reservations.length === 0 ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Đang tải dữ liệu...</p>
            </div>
          ) : reservations.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
              </div>
              <h3>Bạn chưa có đặt bàn nào</h3>
              <p>Hãy đặt bàn tại nhà hàng yêu thích của bạn ngay bây giờ</p>
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
            <div className="reservations-container">
              {reservations.map(reservation => (
                <div key={reservation.id} className="reservation-card">
                  <div className="reservation-header">
                    <div className="restaurant-info">
                      {reservation.restaurantImage && typeof reservation.restaurantImage === 'string' && reservation.restaurantImage.trim() !== '' ? (
                        <img
                          src={reservation.restaurantImage}
                          alt={reservation.restaurantName}
                          className="restaurant-image"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div
                        className="restaurant-image-placeholder"
                        style={{
                          display: reservation.restaurantImage && typeof reservation.restaurantImage === 'string' && reservation.restaurantImage.trim() !== '' ? 'none' : 'flex'
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17 9V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"></path>
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        </svg>
                      </div>
                      <div className="restaurant-details">
                        <h3>{reservation.restaurantName || 'Nhà hàng'}</h3>
                        <div className="restaurant-address">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                            <circle cx="12" cy="10" r="3"></circle>
                          </svg>
                          {reservation.restaurantAddress || 'Địa chỉ nhà hàng'}
                        </div>
                      </div>
                    </div>
                    <div className={`reservation-status ${getStatusClass(reservation.status)}`}>
                      {getStatusText(reservation.status)}
                    </div>
                  </div>
                  
                  <div className="reservation-body">
                    <div className="reservation-info-grid">
                      <div className="info-item">
                        <div className="info-label">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                          </svg>
                          Ngày
                        </div>
                        <div className="info-value">{formatDate(reservation.date)}</div>
                      </div>
                      
                      <div className="info-item">
                        <div className="info-label">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                          </svg>
                          Giờ
                        </div>
                        <div className="info-value">{reservation.time}</div>
                      </div>
                      
                      <div className="info-item">
                        <div className="info-label">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                            <circle cx="9" cy="7" r="4"></circle>
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                          </svg>
                          Số người
                        </div>
                        <div className="info-value">
                          {reservation.guests && reservation.children ? 
                            `${reservation.guests} người lớn, ${reservation.children} trẻ em` : 
                            `${reservation.partySize} người`}
                        </div>
                      </div>
                      
                      <div className="info-item">
                        <div className="info-label">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                            <path d="M15 12H9"></path>
                          </svg>
                          Mã bàn
                        </div>
                        <div className="info-value reservation-code">{reservation.tableCode || 'Chưa phân bàn'}</div>
                      </div>

                      {reservation.depositAmount > 0 && (
                        <div className="info-item">
                          <div className="info-label">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="12" y1="1" x2="12" y2="23"></line>
                              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                            </svg>
                            Tiền cọc
                          </div>
                          <div className="info-value">{reservation.depositAmount.toLocaleString('vi-VN')}đ</div>
                        </div>
                      )}
                    </div>
                    
                    {reservation.specialRequests && (
                      <div className="special-requests">
                        <div className="info-label">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="8" y1="19" x2="8" y2="21"></line>
                            <line x1="8" y1="13" x2="8" y2="17"></line>
                            <line x1="16" y1="19" x2="16" y2="21"></line>
                            <line x1="16" y1="13" x2="16" y2="17"></line>
                            <line x1="12" y1="21" x2="12" y2="23"></line>
                            <line x1="12" y1="15" x2="12" y2="19"></line>
                            <path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25"></path>
                          </svg>
                          Yêu cầu đặc biệt
                        </div>
                        <div className="special-requests-text">{reservation.specialRequests}</div>
                      </div>
                    )}

                    {reservation.status === 'cancelled' && reservation.depositAmount > 0 && reservation.refundStatus && (
                      <div className="refund-status">
                        <div className="info-label">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="1" x2="12" y2="23"></line>
                            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                          </svg>
                          Trạng thái hoàn tiền
                        </div>
                        <div className="info-value">{getRefundText(reservation.refundStatus)}</div>
                      </div>
                    )}
                  </div>
                  
                  <div className="reservation-footer">
                    {reservation.status === 'confirmed' && canCancelReservation(reservation) && (
                      <button 
                        className="btn-cancel"
                        onClick={() => openCancelModal(reservation.id)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="15" y1="9" x2="9" y2="15"></line>
                          <line x1="9" y1="9" x2="15" y2="15"></line>
                        </svg>
                        Hủy đặt bàn {reservation.depositAmount > 0 ? 'và hoàn tiền' : ''}
                      </button>
                    )}
                    {reservation.status === 'confirmed' && !canCancelReservation(reservation) && (
                      <div className="cancel-time-limit-container">
                        <div className="cancel-time-limit-info">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="8" x2="12" y2="12"></line>
                            <line x1="12" y1="16" x2="12.01" y2="16"></line>
                          </svg>
                          Không thể hủy (chưa đủ 12 giờ trước giờ đặt)
                        </div>
                        <button 
                          className="btn-delete"
                          onClick={() => deleteReservation(reservation.id)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                          </svg>
                          Xóa
                        </button>
                      </div>
                    )}
                    {reservation.status === 'completed' && (
                      <Link to={`/restaurants/${reservation.restaurantId}?tab=reviews`} className="btn-review">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                        </svg>
                        Đánh giá
                      </Link>
                    )}
                    {(reservation.status === 'completed' || reservation.status === 'cancelled') && (
                      <button 
                        className="btn-delete"
                        onClick={() => deleteReservation(reservation.id)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          <line x1="10" y1="11" x2="10" y2="17"></line>
                          <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                        Xóa
                      </button>
                    )}
                    {reservation.status === 'pending' && (
                      <div className="pending-info">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"></circle>
                          <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        Chờ xác nhận (tự động hủy sau 1 giờ nếu không được xác nhận)
                        <button 
                          className={`btn-pay-deposit ${paymentLoading ? 'loading' : ''}`}
                          onClick={() => handlePayDeposit(reservation.id, reservation.restaurantName)}
                          disabled={paymentLoading}
                        >
                          {paymentLoading ? (
                            <>
                              <div className="deposit-spinner"></div>
                              Đang xử lý...
                            </>
                          ) : (
                            <>
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                                <line x1="1" y1="10" x2="23" y2="10"></line>
                              </svg>
                              Thanh toán đặt cọc
                            </>
                          )}
                        </button>
                      </div>
                    )}
                    <Link to={`/restaurants/${reservation.restaurantId}`} className="btn-view-restaurant">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                      Xem nhà hàng
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {cancelModal.show && (
        <div className="modal-overlay" onClick={closeCancelModal}>
          <div className="modal-content cancel-reservation-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {reservations.find(r => r.id === cancelModal.reservationId)?.status === 'pending' 
                  ? 'Xác nhận hủy đặt bàn' 
                  : 'Chọn lý do hủy đặt bàn'}
              </h2>
              <button className="close-button" onClick={closeCancelModal}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            
            <div className="modal-body">
              <div className="warning-message">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
                {reservations.find(r => r.id === cancelModal.reservationId)?.status === 'pending' 
                  ? <p>Bạn có chắc chắn muốn hủy đặt bàn này? Thông tin đặt bàn vẫn được lưu trong hệ thống.</p>
                  : <p>Khi hủy đặt bàn, trạng thái sẽ được chuyển từ "Đã xác nhận" sang "Đã hủy". Thông tin đặt bàn vẫn được lưu trong hệ thống.</p>
                }
              </div>
              
              {/* Chỉ hiển thị các tùy chọn lý do nếu không phải trạng thái 'pending' */}
              {reservations.find(r => r.id === cancelModal.reservationId)?.status !== 'pending' && (
              <div className="reason-options">
                <div className={`reason-option ${cancelModal.reason === 'Đổi ý' ? 'selected' : ''}`} 
                    onClick={() => setCancelModal(prev => ({ ...prev, reason: 'Đổi ý' }))}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 2v6h-6"></path>
                    <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
                    <path d="M3 22v-6h6"></path>
                    <path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path>
                  </svg>
                  <span>Đổi ý</span>
                </div>
                
                <div className={`reason-option ${cancelModal.reason === 'Lịch trình bận' ? 'selected' : ''}`}
                    onClick={() => setCancelModal(prev => ({ ...prev, reason: 'Lịch trình bận' }))}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                  <span>Lịch trình bận</span>
                </div>
                
                <div className={`reason-option ${cancelModal.reason === 'Vấn đề khác' ? 'selected' : ''}`}
                    onClick={() => setCancelModal(prev => ({ ...prev, reason: 'Vấn đề khác' }))}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                  </svg>
                  <span>Vấn đề khác</span>
                </div>
              </div>
              )}
            </div>
            
            <div className="modal-actions">
              <button className="btn-secondary" onClick={closeCancelModal}>Quay lại</button>
              <button 
                className="btn-danger" 
                onClick={confirmCancel} 
                disabled={(reservations.find(r => r.id === cancelModal.reservationId)?.status !== 'pending' && !cancelModal.reason) || cancelModal.isSubmitting}
              >
                {cancelModal.isSubmitting ? (
                  <>
                    <span className="spinner-icon"></span>
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="15" y1="9" x2="9" y2="15"></line>
                      <line x1="9" y1="9" x2="15" y2="15"></line>
                    </svg>
                    Xác nhận hủy
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast.show && (
        <div className={`toast-notification ${toast.type}`}>
          <div className="toast-icon">
            {toast.type === 'success' ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            )}
          </div>
          <div className="toast-message">{toast.message}</div>
        </div>
      )}
    </div>
  );
}

export default MyReservationsPage;