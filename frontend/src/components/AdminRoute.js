import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';

function AdminRoute({ children }) {
  const { user, authLoading } = useApp();
  const location = useLocation();
  
  // Hiển thị loading nếu đang kiểm tra xác thực
  if (authLoading) {
    return <div className="loading">Đang tải...</div>;
  }
  
  // Chuyển hướng nếu chưa đăng nhập hoặc không phải admin
  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace state={{ from: location }} />;
  }
  
  return children;
}

export default AdminRoute; 