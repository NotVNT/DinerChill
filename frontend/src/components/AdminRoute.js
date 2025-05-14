import React from 'react';
import { useApp } from '../context/AppContext';

function AdminRoute({ children }) {
  const { user, authLoading } = useApp();
  
  // Hiển thị loading nếu đang kiểm tra xác thực
  if (authLoading) {
    return <div className="loading">Đang tải...</div>;
  }
  
  // Hiển thị thông báo access denied nếu chưa đăng nhập hoặc không phải admin
  if (!user || (user.role !== 'admin' && user.roleId !== 1)) {
    return (
      <div className="access-denied" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        textAlign: 'center',
        padding: '20px'
      }}>
        <h1>Access Denied</h1>
        <p>Bạn không có quyền truy cập trang này.</p>
        <button 
          onClick={() => window.location.href = '/'} 
          style={{
            padding: '10px 20px',
            marginTop: '20px',
            backgroundColor: '#ff6b6b',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Quay về trang chủ
        </button>
      </div>
    );
  }
  
  return children;
}

export default AdminRoute; 