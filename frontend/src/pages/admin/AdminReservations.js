import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import '../../styles/admin_layout/admin_reservations.css';

function AdminReservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingReservation, setEditingReservation] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    guests: '',
    status: 'pending',
    specialRequests: ''
  });
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      setRetrying(false);
      const data = await adminAPI.getReservations();
      setReservations(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching reservations:', err);
      setError('Không thể tải danh sách đặt bàn. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (reservation) => {
    // Format date for input type="date"
    const date = new Date(reservation.date);
    const formattedDate = date.toISOString().split('T')[0];
    
    setEditingReservation(reservation);
    setFormData({
      name: reservation.user?.name || '',
      email: reservation.user?.email || '',
      phone: reservation.user?.phone || '',
      date: formattedDate,
      time: reservation.time,
      guests: reservation.partySize?.toString() || '1',
      status: reservation.status,
      specialRequests: reservation.notes || ''
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Chuẩn bị dữ liệu để cập nhật
      const reservationData = {
        userId: editingReservation.userId,
        restaurantId: editingReservation.restaurantId,
        date: formData.date,
        time: formData.time,
        partySize: parseInt(formData.guests, 10),
        status: formData.status,
        notes: formData.specialRequests,
        tableId: editingReservation.tableId
      };

      // Cập nhật thông tin người dùng nếu có thay đổi
      if (formData.name !== editingReservation.user?.name ||
          formData.email !== editingReservation.user?.email ||
          formData.phone !== editingReservation.user?.phone) {
        
        // Ghi chú: Trong trường hợp thực tế, bạn có thể muốn thêm API để cập nhật thông tin người dùng
        console.log('Thông tin người dùng đã thay đổi:', {
          name: formData.name,
          email: formData.email,
          phone: formData.phone
        });
      }

      // Thực hiện cập nhật đặt bàn
      await adminAPI.updateReservation(
        editingReservation.id, 
        reservationData
      );
      
      // Cập nhật danh sách đặt bàn
      await fetchReservations();
      
      setEditingReservation(null);
    } catch (err) {
      console.error('Error updating reservation:', err);
      setError('Không thể cập nhật đặt bàn. Vui lòng thử lại.');
    }
  };

  const handleDeleteClick = async (reservationId) => {
    if (window.confirm('Bạn có chắc muốn xóa đặt bàn này?')) {
      try {
        await adminAPI.deleteReservation(reservationId);
        setReservations(prev => prev.filter(reservation => reservation.id !== reservationId));
      } catch (err) {
        console.error('Error deleting reservation:', err);
        setError('Không thể xóa đặt bàn. Vui lòng thử lại.');
      }
    }
  };

  const formatDate = (dateString) => {
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

  // Hàm xử lý tìm kiếm, hỗ trợ tiếng Việt
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Lọc danh sách đặt bàn theo từ khóa tìm kiếm
  const filteredReservations = searchTerm.trim() === '' 
    ? reservations 
    : reservations.filter(reservation => {
        const tableCode = reservation.table?.tableCode || '';
        const customerName = reservation.user?.name || '';
        
        // Chuyển đổi cả từ khóa tìm kiếm và dữ liệu thành chữ thường và loại bỏ dấu để so sánh
        const normalizedSearchTerm = searchTerm.toLowerCase();
        const normalizedTableCode = tableCode.toLowerCase();
        const normalizedCustomerName = customerName.toLowerCase();
        
        return normalizedTableCode.includes(normalizedSearchTerm) || 
               normalizedCustomerName.includes(normalizedSearchTerm);
      });

  if (loading && reservations.length === 0) {
    return <div className="loading">Đang tải dữ liệu...</div>;
  }

  // Add a retry button when there's an error
  const handleRetry = () => {
    setRetrying(true);
    fetchReservations();
  };

  return (
    <div className="admin-reservations">
      <h1>Quản lý Đặt bàn</h1>
      
      {error && (
        <div className="error-message">
          {error}
          <button onClick={handleRetry} className="retry-button">
            {retrying ? 'Đang thử lại...' : 'Thử lại'}
          </button>
        </div>
      )}
      
      {editingReservation ? (
        <div className="edit-form">
          <h2>Cập nhật trạng thái đặt bàn</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Tên khách hàng</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Số điện thoại</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
              
              <div className="form-group">
                <label>Số người</label>
                <input
                  type="number"
                  name="guests"
                  value={formData.guests}
                  onChange={handleChange}
                  min="1"
                  required
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Ngày</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Giờ</label>
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            
            <div className="form-group">
              <label>Trạng thái</label>
              <select 
                name="status" 
                value={formData.status}
                onChange={handleChange}
                required
              >
                <option value="pending">Đang chờ</option>
                <option value="confirmed">Đã xác nhận</option>
                <option value="cancelled">Đã hủy</option>
                <option value="completed">Đã hoàn thành</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Yêu cầu đặc biệt</label>
              <textarea
                name="specialRequests"
                value={formData.specialRequests}
                onChange={handleChange}
                rows="3"
              ></textarea>
            </div>
            
            <div className="form-buttons">
              <button type="submit" className="btn btn-primary">
                Cập nhật
              </button>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => setEditingReservation(null)}
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="reservation-list">
          <h2>Danh sách đặt bàn</h2>
          
          {/* Thanh tìm kiếm */}
          <div className="search-container">
            <input
              type="text"
              placeholder="Tìm kiếm theo mã bàn, tên khách hàng..."
              value={searchTerm}
              onChange={handleSearch}
              className="search-input"
            />
          </div>
          
          {loading && <p>Đang tải dữ liệu...</p>}
          
          {!loading && filteredReservations.length === 0 ? (
            <p>Không tìm thấy đặt bàn nào.</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Mã bàn</th>
                  <th>Tên khách hàng</th>
                  <th>Nhà hàng</th>
                  <th>Ngày</th>
                  <th>Giờ</th>
                  <th>Số người</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredReservations.map(reservation => (
                  <tr key={reservation.id}>
                    <td>{reservation.table ? reservation.table.tableCode : 'Chưa phân bàn'}</td>
                    <td>
                      <div>
                        <strong>{reservation.user?.name || 'Không có tên'}</strong>
                      </div>
                      <div className="user-contact">
                        {reservation.user?.email && <small>Email: {reservation.user.email}</small>}
                        {reservation.user?.phone && <small>SĐT: {reservation.user.phone}</small>}
                      </div>
                    </td>
                    <td>{reservation.restaurant?.name || 'Không xác định'}</td>
                    <td>{formatDate(reservation.date)}</td>
                    <td>{reservation.time}</td>
                    <td>{reservation.partySize}</td>
                    <td>
                      <span className={`status-badge ${getStatusClass(reservation.status)}`}>
                        {reservation.status === 'pending' && 'Đang chờ'}
                        {reservation.status === 'confirmed' && 'Đã xác nhận'}
                        {reservation.status === 'cancelled' && 'Đã hủy'}
                        {reservation.status === 'completed' && 'Đã hoàn thành'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          onClick={() => handleEditClick(reservation)}
                          className="btn-edit"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDeleteClick(reservation.id)}
                          className="btn-delete"
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

export default AdminReservations; 