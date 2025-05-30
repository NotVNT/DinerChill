import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../../api';
import '../../styles/identity/AuthPages.css';

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSuccessBox, setShowSuccessBox] = useState(false);
  const [emailError, setEmailError] = useState('');
  const navigate = useNavigate();

  // Function to ensure loading state lasts for at least 5 seconds
  const ensureMinimumLoadingTime = async (startTime, minLoadingTime = 5000) => {
    const elapsedTime = Date.now() - startTime;
    const remainingTime = minLoadingTime - elapsedTime;
    
    if (remainingTime > 0) {
      await new Promise(resolve => setTimeout(resolve, remainingTime));
    }
  };

  // Kiểm tra định dạng email
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    
    // Nếu người dùng đã nhập email, kiểm tra định dạng
    if (value && !validateEmail(value)) {
      setEmailError('Định dạng email không hợp lệ');
    } else {
      setEmailError('');
    }
  };

  const handleOkClick = () => {
    navigate('/login');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Kiểm tra định dạng email trước khi gửi
    if (!validateEmail(email)) {
      setError('Vui lòng nhập email đúng định dạng');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    // Record the start time
    const startTime = Date.now();

    try {
      // Kiểm tra email có tồn tại không
      const checkEmailResponse = await authAPI.checkEmail(email);
      
      if (!checkEmailResponse.exists) {
        // Ensure loading for at least 5 seconds before showing error
        await ensureMinimumLoadingTime(startTime);
        setError('Không tìm thấy tài khoản với email này');
        setLoading(false);
        return;
      }

      // Gửi yêu cầu đặt lại mật khẩu
      await authAPI.forgotPassword({ email });
      
      // Ensure loading for at least 5 seconds before showing success
      await ensureMinimumLoadingTime(startTime);
      
      // Show success box instead of message
      setShowSuccessBox(true);
    } catch (err) {
      console.error('Forgot password error:', err);
      
      // Ensure loading for at least 5 seconds before showing error
      await ensureMinimumLoadingTime(startTime);
      
      setError(
        err.response?.data?.message || 
        err.message || 
        'Không thể xử lý yêu cầu. Vui lòng thử lại sau.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Success confirmation box component
  const SuccessBox = () => (
    <div className="success-confirmation-box">
      <div className="email-icon">
        <img 
          src="/email-icon.svg" 
          alt="Email Icon" 
          onError={(e) => {
            e.target.onerror = null;
            e.target.outerHTML = '<span style="font-size: 48px;">📧</span>';
          }}
        />
      </div>
      <div className="confirmation-text">
        <p>Mã xác minh đã được gửi đến địa chỉ email</p>
        <p className="user-email">{email}.</p>
        <p>Vui lòng xác minh.</p>
      </div>
      <button className="ok-button" onClick={handleOkClick}>
        OK
      </button>
    </div>
  );

  // If showing success box, display that instead of the form
  if (showSuccessBox) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-card">
            <div className="auth-header">
              <h1>Đặt lại mật khẩu</h1>
            </div>
            <SuccessBox />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Đặt lại mật khẩu</h1>
            <p>Nhập email của bạn để đặt lại mật khẩu</p>
          </div>

          {error && (
            <div className="auth-error">
              <i className="error-icon">⚠️</i>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <div className="input-with-icon">
                <span className="input-icon">✉️</span>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={handleEmailChange}
                  required
                  placeholder="Nhập email của bạn"
                  className={emailError ? "error" : ""}
                />
              </div>
              {emailError && (
                <div className="field-error">
                  <span className="error-icon">⚠️</span>
                  <span>{emailError}</span>
                </div>
              )}
            </div>

            <button type="submit" className="auth-button" disabled={loading || emailError}>
              {loading ? (
                <>
                  <i className="loading-icon">⏳</i> Đang xử lý...
                </>
              ) : (
                <>
                  <i className="button-icon">📨</i> Gửi yêu cầu
                </>
              )}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              <Link to="/login" className="back-to-login">Quay lại đăng nhập</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;