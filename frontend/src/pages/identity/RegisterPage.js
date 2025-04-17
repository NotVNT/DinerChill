import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import '../../styles/identity/AuthPages.css';

function RegisterPage() {
  const { register } = useApp();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Nếu là trường điện thoại, kiểm tra định dạng
    if (name === 'phone' && value.trim() !== '') {
      const phoneRegex = /^0\d{9,10}$/;
      
      if (!phoneRegex.test(value)) {
        setPhoneError('Số điện thoại phải bắt đầu bằng số 0 và có 10-11 chữ số');
      } else {
        setPhoneError('');
      }
    } else if (name === 'phone') {
      setPhoneError('');
    }
    
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Kiểm tra mật khẩu trùng khớp
    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu nhập lại không khớp.');
      return;
    }
    
    // Kiểm tra số điện thoại nếu có nhập
    if (formData.phone.trim() !== '') {
      const phoneRegex = /^0\d{9,10}$/;
      
      if (!phoneRegex.test(formData.phone)) {
        setPhoneError('Số điện thoại phải bắt đầu bằng số 0 và có 10-11 chữ số');
        return;
      }
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password
      });
      
      navigate('/');
    } catch (err) {
      setError(err.message || 'Đăng ký không thành công. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Đăng ký</h1>
            <p>Tạo tài khoản để trải nghiệm dịch vụ đặt bàn tốt nhất</p>
          </div>
          
          {error && (
            <div className="auth-error">
              <i className="error-icon">⚠️</i>
              <span>{error}</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="name">Họ tên</label>
              <div className="input-with-icon">
                <span className="input-icon">👤</span>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Nhập họ tên của bạn"
                  required
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <div className="input-with-icon">
                <span className="input-icon">✉️</span>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Nhập địa chỉ email"
                  required
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="phone">Số điện thoại (không bắt buộc)</label>
              <div className="input-with-icon">
                <span className="input-icon">📱</span>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Nhập số điện thoại VN (bắt đầu bằng số 0)"
                />
              </div>
              {phoneError && (
                <div className="field-error">
                  <i className="error-icon">⚠️</i>
                  <span>{phoneError}</span>
                </div>
              )}
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
                  placeholder="Tạo mật khẩu (ít nhất 6 ký tự)"
                  required
                  minLength="6"
                  autoComplete="new-password"
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
              <div className="input-with-icon">
                <span className="input-icon">🔒</span>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Nhập lại mật khẩu"
                  required
                  minLength="6"
                  autoComplete="new-password"
                />
              </div>
            </div>
            
            <button 
              type="submit" 
              className="auth-button"
              disabled={loading || phoneError}
            >
              {loading ? 
                <><i className="loading-icon">⏳</i> Đang xử lý...</> : 
                <><i className="button-icon">📝</i> Đăng ký</>
              }
            </button>
          </form>
          
          <div className="auth-footer">
            <p>
              Đã có tài khoản? <Link to="/login" className="login-link">Đăng nhập ngay</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage; 