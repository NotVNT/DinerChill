import React, { useState, useEffect, useCallback } from 'react';
import { fetchWithAuth } from '../../services/api';

function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDateRange, setFilterDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      
      // Build query parameters
      let queryParams = new URLSearchParams();
      if (filterStatus !== 'all') {
        queryParams.append('status', filterStatus);
      }
      if (filterDateRange.startDate) {
        queryParams.append('startDate', filterDateRange.startDate);
      }
      if (filterDateRange.endDate) {
        queryParams.append('endDate', filterDateRange.endDate);
      }
      
      const data = await fetchWithAuth(`/admin/payments?${queryParams.toString()}`);
      setPayments(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching payments:', error);
      setError('Không thể tải danh sách thanh toán');
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterDateRange]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const handleStatusChange = (e) => {
    setFilterStatus(e.target.value);
  };

  const handleDateRangeChange = (e) => {
    const { name, value } = e.target;
    setFilterDateRange({
      ...filterDateRange,
      [name]: value
    });
  };

  const handleClearFilters = () => {
    setFilterStatus('all');
    setFilterDateRange({
      startDate: '',
      endDate: ''
    });
  };

  const handleViewDetails = (payment) => {
    setSelectedPayment(payment);
    setShowDetailModal(true);
  };

  const handleCloseModal = () => {
    setShowDetailModal(false);
    setSelectedPayment(null);
  };

  const handleUpdatePaymentStatus = async (paymentId, newStatus) => {
    try {
      await fetchWithAuth(`/admin/payments/${paymentId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      // Update the selected payment if it's the one being displayed
      if (selectedPayment && selectedPayment.id === paymentId) {
        setSelectedPayment({
          ...selectedPayment,
          status: newStatus
        });
      }
      
      // Refresh the payments list
      fetchPayments();
    } catch (error) {
      console.error('Error updating payment status:', error);
      setError('Không thể cập nhật trạng thái thanh toán');
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending': return 'status-pending';
      case 'completed': return 'status-completed';
      case 'failed': return 'status-failed';
      case 'refunded': return 'status-refunded';
      default: return '';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Đang xử lý';
      case 'completed': return 'Đã hoàn thành';
      case 'failed': return 'Thất bại';
      case 'refunded': return 'Đã hoàn tiền';
      default: return status;
    }
  };

  const formatCurrency = (amount) => {
    return amount.toLocaleString('vi-VN') + 'đ';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getPaymentMethodText = (method) => {
    switch (method) {
      case 'credit_card': return 'Thẻ tín dụng';
      case 'bank_transfer': return 'Chuyển khoản';
      case 'momo': return 'Ví MoMo';
      case 'zalopay': return 'ZaloPay';
      case 'cash': return 'Tiền mặt';
      default: return method;
    }
  };

  if (loading && !showDetailModal) {
    return <div className="loading">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="admin-payments">
      <div className="admin-section-header">
        <h2>Quản lý thanh toán</h2>
        <div className="filter-controls">
          <div className="filter-group">
            <label htmlFor="status-filter">Trạng thái:</label>
            <select
              id="status-filter"
              value={filterStatus}
              onChange={handleStatusChange}
            >
              <option value="all">Tất cả</option>
              <option value="pending">Đang xử lý</option>
              <option value="completed">Đã hoàn thành</option>
              <option value="failed">Thất bại</option>
              <option value="refunded">Đã hoàn tiền</option>
            </select>
          </div>
          <div className="filter-group">
            <label htmlFor="start-date">Từ ngày:</label>
            <input
              type="date"
              id="start-date"
              name="startDate"
              value={filterDateRange.startDate}
              onChange={handleDateRangeChange}
            />
          </div>
          <div className="filter-group">
            <label htmlFor="end-date">Đến ngày:</label>
            <input
              type="date"
              id="end-date"
              name="endDate"
              value={filterDateRange.endDate}
              onChange={handleDateRangeChange}
              min={filterDateRange.startDate}
            />
          </div>
          <button 
            className="btn btn-secondary"
            onClick={handleClearFilters}
          >
            Xóa bộ lọc
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="payments-list">
        <h3>Danh sách thanh toán</h3>
        {payments.length === 0 ? (
          <p>Không có dữ liệu thanh toán nào.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Mã thanh toán</th>
                <th>Người dùng</th>
                <th>Nhà hàng</th>
                <th>Số tiền</th>
                <th>Phương thức</th>
                <th>Ngày thanh toán</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {payments.map(payment => (
                <tr key={payment.id}>
                  <td>{payment.transactionId}</td>
                  <td>{payment.userName}</td>
                  <td>{payment.restaurantName}</td>
                  <td className="amount">{formatCurrency(payment.amount)}</td>
                  <td>{getPaymentMethodText(payment.paymentMethod)}</td>
                  <td>{formatDate(payment.createdAt)}</td>
                  <td>
                    <span className={`status-badge ${getStatusBadgeClass(payment.status)}`}>
                      {getStatusText(payment.status)}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-info mr-2"
                      onClick={() => handleViewDetails(payment)}
                    >
                      Chi tiết
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Payment Detail Modal */}
      {showDetailModal && selectedPayment && (
        <div className="modal-overlay">
          <div className="payment-detail-modal">
            <div className="modal-header">
              <h3>Chi tiết thanh toán</h3>
              <button className="close-btn" onClick={handleCloseModal}>×</button>
            </div>
            <div className="modal-body">
              <div className="payment-detail-section">
                <h4>Thông tin cơ bản</h4>
                <div className="detail-row">
                  <span className="label">Mã giao dịch:</span>
                  <span className="value">{selectedPayment.transactionId}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Số tiền:</span>
                  <span className="value amount">{formatCurrency(selectedPayment.amount)}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Trạng thái:</span>
                  <span className={`value status-badge ${getStatusBadgeClass(selectedPayment.status)}`}>
                    {getStatusText(selectedPayment.status)}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="label">Ngày tạo:</span>
                  <span className="value">{formatDate(selectedPayment.createdAt)}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Ngày cập nhật:</span>
                  <span className="value">{formatDate(selectedPayment.updatedAt)}</span>
                </div>
              </div>

              <div className="payment-detail-section">
                <h4>Thông tin người dùng</h4>
                <div className="detail-row">
                  <span className="label">Tên người dùng:</span>
                  <span className="value">{selectedPayment.userName}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Email:</span>
                  <span className="value">{selectedPayment.userEmail}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Số điện thoại:</span>
                  <span className="value">{selectedPayment.userPhone || 'Không có'}</span>
                </div>
              </div>

              <div className="payment-detail-section">
                <h4>Thông tin đặt bàn</h4>
                <div className="detail-row">
                  <span className="label">Nhà hàng:</span>
                  <span className="value">{selectedPayment.restaurantName}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Ngày đặt bàn:</span>
                  <span className="value">{formatDate(selectedPayment.reservationDate)}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Số lượng người:</span>
                  <span className="value">{selectedPayment.guestCount} người</span>
                </div>
              </div>

              <div className="payment-detail-section">
                <h4>Thông tin thanh toán</h4>
                <div className="detail-row">
                  <span className="label">Phương thức:</span>
                  <span className="value">{getPaymentMethodText(selectedPayment.paymentMethod)}</span>
                </div>
                {selectedPayment.paymentDetails && (
                  <div className="payment-extra-details">
                    {Object.entries(selectedPayment.paymentDetails).map(([key, value]) => (
                      <div className="detail-row" key={key}>
                        <span className="label">{key}:</span>
                        <span className="value">{value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {selectedPayment.status === 'completed' && (
                <div className="action-buttons">
                  <button
                    className="btn btn-warning"
                    onClick={() => handleUpdatePaymentStatus(selectedPayment.id, 'refunded')}
                  >
                    Hoàn tiền
                  </button>
                </div>
              )}

              {selectedPayment.status === 'pending' && (
                <div className="action-buttons">
                  <button
                    className="btn btn-success mr-2"
                    onClick={() => handleUpdatePaymentStatus(selectedPayment.id, 'completed')}
                  >
                    Xác nhận thanh toán
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleUpdatePaymentStatus(selectedPayment.id, 'failed')}
                  >
                    Đánh dấu thất bại
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPayments; 