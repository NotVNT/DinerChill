import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

function LoginPage() {
  const { login } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Kiểm tra nếu có redirect path
  const from = location.state?.from?.pathname || '/';
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
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
    
    try {
      await login(formData);
      // Chuyển hướng người dùng sau khi đăng nhập thành công
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Đăng nhập không thành công. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="auth-page">
      <div className="auth-container">
        <h1>Đăng nhập</h1>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Mật khẩu</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
            />
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary btn-block"
            disabled={loading}
          >
            {loading ? 'Đang xử lý...' : 'Đăng nhập'}
          </button>
        </form>
        
        <div className="auth-links">
          <p>
            Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
          </p>
          <p>
            <Link to="/forgot-password">Quên mật khẩu?</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage; 