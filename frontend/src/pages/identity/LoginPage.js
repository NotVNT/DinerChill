import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import '../../styles/identity/AuthPages.css';

function LoginPage() {
  const { login } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Kiểm tra nếu có redirect path
  const from = location.state?.from?.pathname || '/';
  
  const [formData, setFormData] = useState({
    emailOrPhone: '',
    password: ''
  });
  
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  
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
      // Tăng số lần thử đăng nhập
      setLoginAttempts(prevAttempts => prevAttempts + 1);
      
      // Xử lý lỗi tùy thuộc vào số lần thử đăng nhập
      if (err.message && err.message.includes('đăng nhập bằng Google')) {
        setError('Tài khoản hoặc mật khẩu đăng nhập không chính xác');
      } else if (loginAttempts >= 1) { // Đã thử 1 lần trước đó, đây là lần thứ 2+
        setError('Tài khoản hoặc mật khẩu đăng nhập không chính xác. Vui lòng nhấn "Quên mật khẩu?" để đặt lại mật khẩu mới.');
      } else {
        setError('Tài khoản hoặc mật khẩu đăng nhập không chính xác');
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Hàm xử lý khi người dùng nhấn đăng nhập với Google
  const handleGoogleLogin = () => {
    window.location.href = `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/google`;
  };
  
  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Đăng nhập</h1>
            <p>Chào mừng trở lại! Đăng nhập để tiếp tục</p>
          </div>
          
          {error && (
            <div className="auth-error">
              <i className="error-icon">⚠️</i>
              <span>{error}</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="emailOrPhone">Tài khoản</label>
              <div className="input-with-icon">
                <span className="input-icon">✉️</span>
                <input
                  type="text"
                  id="emailOrPhone"
                  name="emailOrPhone"
                  value={formData.emailOrPhone}
                  onChange={handleChange}
                  placeholder="Nhập email hoặc số điện thoại"
                  required
                  autoComplete="username"
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Mật khẩu</label>
              <div className="input-with-icon">
                <span className="input-icon">🔒</span>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Nhập mật khẩu"
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>
            
            <div className="forgot-password">
              <Link to="/forgot-password">Quên mật khẩu?</Link>
            </div>
            
            <button 
              type="submit" 
              className="auth-button"
              disabled={loading}
            >
              {loading ? 
                <><i className="loading-icon">⏳</i> Đang xử lý...</> : 
                <><i className="button-icon">🔑</i> Đăng nhập</>
              }
            </button>
          </form>
          
          <div className="auth-divider">
            <span>HOẶC</span>
          </div>
          
          <div className="social-login">
            <button 
              type="button"
              className="google-login-button"
              onClick={handleGoogleLogin}
            >
              <img 
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
                alt="Google logo" 
                className="google-logo"
              />
              <span>Đăng nhập với Google</span>
            </button>
          </div>
          
          <div className="auth-footer">
            <p>
              Chưa có tài khoản? <Link to="/register" className="register-link">Đăng ký ngay</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage; 