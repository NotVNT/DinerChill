import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { fetchWithAuth } from '../../services/api';

function AdminDashboard() {
  const { user } = useApp();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Kiểm tra nếu không phải admin thì chuyển hướng
    if (user && user.role !== 'admin') {
      navigate('/');
      return;
    }

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const data = await fetchWithAuth('/admin/dashboard');
        setDashboardData(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching admin dashboard:', err);
        setError('Không thể tải dữ liệu tổng quan. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, navigate]);

  if (loading) {
    return <div className="loading">Đang tải dữ liệu...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="admin-dashboard">
      <div className="container">
        <h1>Trang Quản Trị Viên</h1>
        
        <div className="dashboard-stats">
          <div className="stat-card">
            <h3>Nhà hàng</h3>
            <p className="stat-number">{dashboardData?.totalRestaurants || 0}</p>
            <button 
              className="btn btn-primary" 
              onClick={() => navigate('/admin/restaurants')}
            >
              Quản lý nhà hàng
            </button>
          </div>
          
          <div className="stat-card">
            <h3>Đặt bàn</h3>
            <p className="stat-number">{dashboardData?.totalReservations || 0}</p>
            <div className="sub-stats">
              <p>Đang chờ: {dashboardData?.reservationStats?.pending || 0}</p>
              <p>Đã xác nhận: {dashboardData?.reservationStats?.confirmed || 0}</p>
              <p>Đã hủy: {dashboardData?.reservationStats?.cancelled || 0}</p>
            </div>
            <button 
              className="btn btn-primary" 
              onClick={() => navigate('/admin/reservations')}
            >
              Quản lý đặt bàn
            </button>
          </div>
          
          <div className="stat-card">
            <h3>Đánh giá</h3>
            <p className="stat-number">{dashboardData?.totalReviews || 0}</p>
            <button 
              className="btn btn-primary" 
              onClick={() => navigate('/admin/reviews')}
            >
              Quản lý đánh giá
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard; 