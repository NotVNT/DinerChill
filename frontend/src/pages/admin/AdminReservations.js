import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';

function AdminReservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingReservation, setEditingReservation] = useState(null);
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

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      setLoading(true);
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
      name: reservation.name,
      email: reservation.email,
      phone: reservation.phone,
      date: formattedDate,
      time: reservation.time,
      guests: reservation.guests.toString(),
      status: reservation.status,
      specialRequests: reservation.specialRequests || ''
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
      // Convert guests từ string sang number
      const reservationData = {
        ...formData,
        guests: parseInt(formData.guests, 10)
      };

      const updatedReservation = await adminAPI.updateReservation(
        editingReservation.id, 
        reservationData
      );
      
      setReservations(prev => prev.map(reservation => 
        reservation.id === editingReservation.id ? updatedReservation : reservation
      ));
      
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

  if (loading && reservations.length === 0) {
    return <div className="loading">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="admin-reservations">
      <h1>Quản lý Đặt bàn</h1>
      
      {error && <div className="error-message">{error}</div>}
      
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
                  required
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
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên khách hàng</th>
              <th>Ngày</th>
              <th>Giờ</th>
              <th>Số người</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {reservations.map(reservation => (
              <tr key={reservation.id}>
                <td>{reservation.id}</td>
                <td>{reservation.name}</td>
                <td>{formatDate(reservation.date)}</td>
                <td>{reservation.time}</td>
                <td>{reservation.guests}</td>
                <td>
                  <span className={`status-badge ${getStatusClass(reservation.status)}`}>
                    {reservation.status === 'pending' && 'Đang chờ'}
                    {reservation.status === 'confirmed' && 'Đã xác nhận'}
                    {reservation.status === 'cancelled' && 'Đã hủy'}
                    {reservation.status === 'completed' && 'Đã hoàn thành'}
                  </span>
                </td>
                <td>
                  <button 
                    className="btn btn-sm btn-edit"
                    onClick={() => handleEditClick(reservation)}
                  >
                    Sửa
                  </button>
                  <button 
                    className="btn btn-sm btn-delete"
                    onClick={() => handleDeleteClick(reservation.id)}
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AdminReservations; 