import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';

function ProtectedRoute({ children }) {
  const { user, authLoading } = useApp();
  const location = useLocation();
  
  // Hiển thị loading nếu đang kiểm tra xác thực
  if (authLoading) {
    return <div className="loading">Đang tải...</div>;
  }
  
  // Chuyển hướng nếu chưa đăng nhập
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  
  return children;
}

export default ProtectedRoute; 