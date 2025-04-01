import React from 'react';
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';

function AdminLayout() {
  const { user, logout } = useApp();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="admin-layout">
      <div className="admin-sidebar">
        <div className="admin-logo">
          <h2>Admin Dashboard</h2>
        </div>
        
        <div className="admin-user">
          <p>Xin chào, {user?.name}</p>
          <button onClick={handleLogout} className="btn btn-sm">Đăng xuất</button>
        </div>
        
        <nav className="admin-nav">
          <ul>
            <li>
              <NavLink to="/admin" end>
                Tổng quan
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/users">
                Quản lý người dùng
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/restaurants">
                Quản lý nhà hàng
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/reservations">
                Quản lý đặt bàn
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/reviews">
                Quản lý đánh giá
              </NavLink>
            </li>
            <li>
              <Link to="/" className="home-btn">
                Trở về trang chủ
              </Link>
            </li>
          </ul>
        </nav>
      </div>
      
      <div className="admin-content">
        <Outlet />
      </div>
    </div>
  );
}

export default AdminLayout; 