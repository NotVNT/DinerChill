import React, { useState, useEffect, useCallback} from 'react';
import { fetchWithAuth } from '../../services/api';
import '../../styles/admin_layout/admin_payment.css';

function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [inputSearchQuery, setInputSearchQuery] = useState('');
  const [filterDateRange, setFilterDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [filteredPayments, setFilteredPayments] = useState([]);

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
      if (searchQuery.trim()) {
        queryParams.append('search', searchQuery.trim());
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
  }, [filterStatus, filterDateRange, searchQuery]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  // Filter payments based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredPayments(payments);
      return;
    }
    
    const searchLower = searchQuery.trim().toLowerCase();
    const filtered = payments.filter(payment => 
      (payment.transactionId && payment.transactionId.toLowerCase().includes(searchLower)) ||
      (payment.userName && payment.userName.toLowerCase().includes(searchLower)) ||
      (payment.restaurantName && payment.restaurantName.toLowerCase().includes(searchLower))
    );
    
    setFilteredPayments(filtered);
  }, [payments, searchQuery]);

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
    setSearchQuery('');
    setInputSearchQuery('');
    setFilterDateRange({
      startDate: '',
      endDate: ''
    });
  };

  const handleSearchInputChange = (e) => {
    setInputSearchQuery(e.target.value);
  };
  
  const handleSearchSubmit = () => {
    setSearchQuery(inputSearchQuery);
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearchSubmit();
    }
  };

  const handleViewDetails = (payment) => {
    console.log('Payment details clicked:', payment);
    if (payment) {
      setSelectedPayment(payment);
      setShowDetailModal(true);
    }
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
        <div className="search-bar">
          <div className="search-input-group">
            <input
              type="text"
              placeholder="Tìm kiếm mã giao dịch, người dùng hoặc nhà hàng..."
              value={inputSearchQuery}
              onChange={handleSearchInputChange}
              onKeyPress={handleKeyPress}
              className="search-input"
            />
            <button 
              className="search-button"
              onClick={handleSearchSubmit}
            >
              Tìm kiếm
            </button>
          </div>
        </div>
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
        </div>
        <div className="filter-actions">
          <button 
            className="btn btn-secondary clear-filter-btn"
            onClick={handleClearFilters}
          >
            <span className="filter-icon">⟲</span> Xóa bộ lọc
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="payments-list">
        <h3>Danh sách thanh toán</h3>
        {filteredPayments.length === 0 ? (
          <p>Không có dữ liệu thanh toán nào.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '15%' }}>Mã giao dịch</th>
                <th style={{ width: '10%' }}>Người dùng</th>
                <th style={{ width: '20%' }}>Nhà hàng</th>
                <th style={{ width: '10%' }}>Số tiền</th>
                <th style={{ width: '15%' }}>Phương thức</th>
                <th style={{ width: '15%' }}>Ngày thanh toán</th>
                <th style={{ width: '15%' }}>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map(payment => (
                <tr 
                  key={payment.id}
                  onClick={() => handleViewDetails(payment)}
                  style={{ cursor: 'pointer' }}
                  className="payment-row"
                  role="button"
                  aria-label={`Xem chi tiết thanh toán ${payment.transactionId || 'Không có mã'}`}
                  tabIndex={0}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleViewDetails(payment);
                    }
                  }}
                >
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
              <div className="payment-detail-grid">
                {/* Cột bên trái */}
                <div className="payment-detail-left">
                  {/* Thông tin cơ bản */}
                  <div className="payment-detail-card">
                    <div className="card-header">
                      <h4>Thông tin cơ bản</h4>
                    </div>
                    <div className="card-body">
                      <div className="detail-row">
                        <span className="label">Mã giao dịch:</span>
                        <span className="value highlight">{selectedPayment.transactionId || 'N/A'}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Số tiền:</span>
                        <span className="value amount highlight">{selectedPayment.amount ? formatCurrency(selectedPayment.amount) : 'N/A'}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Trạng thái:</span>
                        <span className={`value status-badge ${getStatusBadgeClass(selectedPayment.status)}`}>
                          {getStatusText(selectedPayment.status)}
                        </span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Ngày tạo:</span>
                        <span className="value">{selectedPayment.createdAt ? formatDate(selectedPayment.createdAt) : 'N/A'}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Ngày cập nhật:</span>
                        <span className="value">{selectedPayment.updatedAt ? formatDate(selectedPayment.updatedAt) : 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Thông tin người dùng */}
                  <div className="payment-detail-card">
                    <div className="card-header">
                      <h4>Thông tin người dùng</h4>
                    </div>
                    <div className="card-body">
                      <div className="detail-row">
                        <span className="label">Tên người dùng:</span>
                        <span className="value">{selectedPayment.userName || 'N/A'}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Email:</span>
                        <span className="value">{selectedPayment.userEmail || 'N/A'}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Số điện thoại:</span>
                        <span className="value">{selectedPayment.userPhone || 'Không có'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cột bên phải */}
                <div className="payment-detail-right">
                  {/* Thông tin đặt bàn */}
                  <div className="payment-detail-card">
                    <div className="card-header">
                      <h4>Thông tin đặt bàn</h4>
                    </div>
                    <div className="card-body">
                      <div className="detail-row">
                        <span className="label">Nhà hàng:</span>
                        <span className="value">{selectedPayment.restaurantName || 'N/A'}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Ngày đặt bàn:</span>
                        <span className="value">{selectedPayment.reservationDate ? formatDate(selectedPayment.reservationDate) : 'N/A'}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Số lượng người:</span>
                        <span className="value">{selectedPayment.guestCount ? `${selectedPayment.guestCount} người` : 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Thông tin thanh toán */}
                  <div className="payment-detail-card">
                    <div className="card-header">
                      <h4>Thông tin thanh toán</h4>
                    </div>
                    <div className="card-body">
                      <div className="detail-row">
                        <span className="label">Phương thức:</span>
                        <span className="value method-badge">{getPaymentMethodText(selectedPayment.paymentMethod)}</span>
                      </div>
                      {selectedPayment.paymentDetails && (
                        <div className="payment-extra-details">
                          {(() => {
                            try {
                              // Parse paymentDetails nếu là string
                              const rawDetails = typeof selectedPayment.paymentDetails === 'string' 
                                ? JSON.parse(selectedPayment.paymentDetails) 
                                : selectedPayment.paymentDetails;
                              
                              // Tạo mapping từ tiếng Anh sang tiếng Việt và chỉ lấy những thông tin cần thiết
                              const translatedFields = {
                                'id': 'Mã giao dịch hệ thống',
                                'orderCode': 'Mã giao dịch',
                                'amount': 'Số tiền',
                                'amountPaid': 'Đã thanh toán',
                                'amountRemaining': 'Còn lại',
                                'status': 'Trạng thái',
                                'createdAt': 'Ngày tạo',
                                'description': 'Mô tả',
                                'accountNumber': 'Số tài khoản',
                                'reference': 'Mã tham chiếu',
                                'counterAccountBankName': 'Ngân hàng',
                                'counterAccountName': 'Tên tài khoản'
                              };
                              
                              // Mảng các trường cần hiển thị, theo thứ tự
                              const fieldOrder = ['orderCode', 'amount', 'amountPaid', 'status', 'reference', 'counterAccountBankName', 'counterAccountName'];
                              
                              // Lọc và hiển thị các trường theo thứ tự
                              return fieldOrder
                                .filter(key => rawDetails.hasOwnProperty(key) && rawDetails[key] !== null && rawDetails[key] !== undefined)
                                .map(key => {
                                  let displayValue = rawDetails[key];
                                  
                                  // Format các giá trị đặc biệt
                                  if (key.includes('amount') && !isNaN(displayValue)) {
                                    displayValue = displayValue.toLocaleString('vi-VN') + 'đ';
                                  } else if (key === 'status') {
                                    const statusMap = {
                                      'PAID': 'Đã thanh toán',
                                      'PENDING': 'Đang xử lý',
                                      'CANCELED': 'Đã hủy',
                                      'FAILED': 'Thất bại',
                                      'REFUNDED': 'Đã hoàn tiền'
                                    };
                                    displayValue = statusMap[displayValue] || displayValue;
                                  }
                                  
                                  return (
                                    <div className="detail-row" key={key}>
                                      <span className="label">{translatedFields[key] || key}:</span>
                                      <span className="value">
                                        {typeof displayValue === 'object' 
                                          ? JSON.stringify(displayValue) 
                                          : String(displayValue)}
                                      </span>
                                    </div>
                                  );
                                });
                            } catch (error) {
                              console.error('Error parsing payment details:', error);
                              return (
                                <div className="detail-row">
                                  <span className="label">Chi tiết gốc:</span>
                                  <span className="value">{String(selectedPayment.paymentDetails)}</span>
                                </div>
                              );
                            }
                          })()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Nút hành động */}
              <div className="action-buttons-container">
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
        </div>
      )}
    </div>
  );
}

export default AdminPayments;
