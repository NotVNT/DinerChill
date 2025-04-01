import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authAPI } from '../../services/api';

function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const resetCode = searchParams.get('code') || '';
  
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    email,
    resetCode,
    newPassword: '',
    confirmPassword: ''
  });
  
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      setLoading(false);
      return;
    }
    
    try {
      await authAPI.resetPassword({
        email: formData.email,
        resetCode: formData.resetCode,
        newPassword: formData.newPassword
      });
      
      // Chuyển hướng đến trang đăng nhập
      navigate('/login', { 
        state: { message: 'Mật khẩu đã được đặt lại thành công. Vui lòng đăng nhập.' } 
      });
    } catch (err) {
      setError(err.message || 'Không thể đặt lại mật khẩu. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="auth-page">
      <div className="auth-container">
        <h1>Đặt lại mật khẩu</h1>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Nhập email của bạn"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="resetCode">Mã đặt lại</label>
            <input
              type="text"
              id="resetCode"
              name="resetCode"
              value={formData.resetCode}
              onChange={handleChange}
              required
              placeholder="Nhập mã đặt lại mật khẩu"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="newPassword">Mật khẩu mới</label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              required
              minLength="6"
              placeholder="Nhập mật khẩu mới"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              minLength="6"
              placeholder="Nhập lại mật khẩu mới"
            />
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary btn-block"
            disabled={loading}
          >
            {loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
          </button>
        </form>
        
        <div className="auth-links">
          <p>
            <Link to="/login">Quay lại đăng nhập</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ResetPasswordPage; 