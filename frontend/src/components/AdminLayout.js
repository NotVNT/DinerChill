import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, Link, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import '../styles/admin_layout/admin.css';

function AdminLayout() {
  const { user, logout } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // For handling notifications
  useEffect(() => {
    // Load existing notifications from local storage
    const savedNotifications = localStorage.getItem('adminNotifications');
    if (savedNotifications) {
      const parsedNotifications = JSON.parse(savedNotifications);
      setNotifications(parsedNotifications);
      
      // Count unread notifications
      const unread = parsedNotifications.filter(notification => !notification.read).length;
      setUnreadCount(unread);
    }
  }, []);

  // Listen for custom events to add new notifications
  useEffect(() => {
    const handleNewNotification = (event) => {
      const newNotification = event.detail;
      
      setNotifications(prevNotifications => {
        const updatedNotifications = [
          { 
            id: Date.now(), 
            ...newNotification, 
            timestamp: new Date().toISOString(),
            read: false
          },
          ...prevNotifications
        ].slice(0, 20); // Keep only last 20 notifications
        
        // Save to localStorage
        localStorage.setItem('adminNotifications', JSON.stringify(updatedNotifications));
        
        return updatedNotifications;
      });
      
      setUnreadCount(prevCount => prevCount + 1);
    };
    
    window.addEventListener('newAdminNotification', handleNewNotification);
    
    return () => {
      window.removeEventListener('newAdminNotification', handleNewNotification);
    };
  }, []);

  const markAllAsRead = () => {
    const updatedNotifications = notifications.map(notification => ({
      ...notification,
      read: true
    }));
    
    setNotifications(updatedNotifications);
    setUnreadCount(0);
    localStorage.setItem('adminNotifications', JSON.stringify(updatedNotifications));
  };

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
    if (path.includes('/admin/categories')) return 'Quản lý danh mục';
    if (path.includes('/admin/promotions')) return 'Quản lý khuyến mãi';
    if (path.includes('/admin/payments')) return 'Quản lý thanh toán';
    if (path.includes('/admin/tables')) return 'Quản lý bàn';
    return 'Quản trị viên';
  };

  // Format time for notifications
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + 
           ' ' + date.toLocaleDateString('vi-VN');
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
            
            {/* Notification Icon */}
            <div className="notification-dropdown">
              <button 
                className="notification-icon" 
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  if (!showNotifications && unreadCount > 0) {
                    markAllAsRead();
                  }
                }}
                aria-label="Thông báo"
              >
                <i className="bi bi-bell-fill"></i>
                {unreadCount > 0 && (
                  <span className="notification-badge">{unreadCount}</span>
                )}
              </button>
              
              {showNotifications && (
                <div className="notification-menu">
                  <div className="notification-header">
                    <h3>Thông báo</h3>
                    {notifications.length > 0 && (
                      <button className="clear-all" onClick={() => {
                        setNotifications([]);
                        setUnreadCount(0);
                        localStorage.setItem('adminNotifications', JSON.stringify([]));
                      }}>
                        Xóa tất cả
                      </button>
                    )}
                  </div>
                  <div className="notification-list">
                    {notifications.length > 0 ? (
                      notifications.map(notification => (
                        <div 
                          key={notification.id} 
                          className={`notification-item ${!notification.read ? 'unread' : ''}`}
                        >
                          <div className="notification-content">
                            <div className="notification-message">{notification.message}</div>
                            <div className="notification-time">{formatTime(notification.timestamp)}</div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="empty-notifications">Không có thông báo mới</div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
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