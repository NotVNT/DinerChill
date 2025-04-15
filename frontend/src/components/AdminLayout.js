import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, Link, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import '../styles/admin_layout/admin.css';

function AdminLayout() {
  const { user, logout } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  // Lấy tiêu đề trang dựa trên đường dẫn hiện tại
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/admin') return 'Tổng quan';
    if (path.includes('/admin/restaurants')) return 'Quản lý nhà hàng';
    if (path.includes('/admin/reservations')) return 'Quản lý đặt bàn';
    if (path.includes('/admin/reviews')) return 'Quản lý đánh giá';
    if (path.includes('/admin/menus')) return 'Quản lý thực đơn';
    if (path.includes('/admin/categories')) return 'Quản lý danh mục';
    if (path.includes('/admin/promotions')) return 'Quản lý khuyến mãi';
    if (path.includes('/admin/payments')) return 'Quản lý thanh toán';
    if (path.includes('/admin/tables')) return 'Quản lý bàn';
    return 'Quản trị viên';
  };

  return (
    <div className={`admin-layout ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <div className="admin-sidebar">
        <div className="admin-logo">
          <h2>DinerChill</h2>
          <button 
            className="sidebar-toggle" 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            {sidebarCollapsed ? '→' : '←'}
          </button>
        </div>
        
        <div className="admin-user">
          <p className="admin-role">Admin</p>
        </div>
        
        <nav className="admin-nav">
          <ul>
            <li>
              <NavLink to="/admin" end>
                <i>📊</i>
                <span>Tổng quan</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/restaurants">
                <i>🍽️</i>
                <span>Quản lý nhà hàng</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/menus">
                <i>📋</i>
                <span>Quản lý thực đơn</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/categories">
                <i>📁</i>
                <span>Quản lý danh mục</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/promotions">
                <i>🏷️</i>
                <span>Quản lý khuyến mãi</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/reservations">
                <i>📅</i>
                <span>Quản lý đặt bàn</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/payments">
                <i>💰</i>
                <span>Quản lý thanh toán</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/tables">
                <i>🪑</i>
                <span>Quản lý bàn</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/reviews">
                <i>⭐</i>
                <span>Quản lý đánh giá</span>
              </NavLink>
            </li>
            <li>
              <Link to="/" className="home-btn">
                <i>🏠</i>
                <span>Trở về trang chủ</span>
              </Link>
            </li>
          </ul>
        </nav>
      </div>
      
      <div className="admin-content-wrapper">
        <div className="admin-header">
          <h1>{getPageTitle()}</h1>
          <div className="admin-header-actions">
            <span className="current-date">{new Date().toLocaleDateString('vi-VN')}</span>
            <div className="admin-profile">
              <span>{user?.name}</span>
              <button onClick={handleLogout} className="logout-btn">Đăng xuất</button>
            </div>
          </div>
        </div>
        <div className="admin-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default AdminLayout; 