import React, { useState, useEffect, useCallback } from 'react';
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
  const [passwordError, setPasswordError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [linkAlreadyUsed, setLinkAlreadyUsed] = useState(false);
  const [checkingLink, setCheckingLink] = useState(true);
  const [redirectCountdown, setRedirectCountdown] = useState(5);
  
  // Trạng thái hiển thị mật khẩu
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Kiểm tra tính hợp lệ của liên kết đặt lại mật khẩu
  useEffect(() => {
    async function verifyResetLink() {
      if (!email || !resetCode) {
        setError('Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.');
        setLinkAlreadyUsed(true);
        setCheckingLink(false);
        return;
      }
      
      try {
        // Kiểm tra tính hợp lệ của mã reset
        const response = await authAPI.verifyResetCode({ email, resetCode });
        setCheckingLink(false);
        
        if (!response.valid) {
          setError('Link đặt lại mật khẩu đã được sử dụng hoặc không còn hợp lệ.');
          setLinkAlreadyUsed(true);
        }
      } catch (err) {
        console.error('Lỗi kiểm tra link:', err);
        setError('Link đặt lại mật khẩu đã được sử dụng hoặc không còn hợp lệ.');
        setLinkAlreadyUsed(true);
        setCheckingLink(false);
      }
    }
    
    verifyResetLink();
  }, [email, resetCode]);
  
  // Cập nhật email và resetCode nếu URL thay đổi
  useEffect(() => {
    setFormData(prevState => ({
      ...prevState,
      email,
      resetCode
    }));
  }, [email, resetCode]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
    
    // Xóa thông báo lỗi mật khẩu khi người dùng thay đổi mật khẩu
    if (name === 'newPassword' || name === 'confirmPassword') {
      setPasswordError(null);
    }
  };
  
  // Xử lý đóng modal và chuyển hướng về trang đăng nhập
  const handleSuccessModalClose = useCallback(() => {
    setShowSuccessModal(false);
    navigate('/login', { 
      state: { message: 'Mật khẩu đã được đặt lại thành công. Vui lòng đăng nhập.' } 
    });
  }, [navigate]);
  
  // Xử lý hiển thị/ẩn mật khẩu
  const toggleNewPasswordVisibility = () => {
    setShowNewPassword(!showNewPassword);
  };
  
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };
  
  // Function to ensure loading state lasts for at least 5 seconds
  const ensureMinimumLoadingTime = async (startTime, minLoadingTime = 5000) => {
    const elapsedTime = Date.now() - startTime;
    const remainingTime = minLoadingTime - elapsedTime;
    
    if (remainingTime > 0) {
      await new Promise(resolve => setTimeout(resolve, remainingTime));
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (linkAlreadyUsed) {
      setError('Link đặt lại mật khẩu đã được sử dụng. Vui lòng yêu cầu link mới.');
      return;
    }
    
    setLoading(true);
    setError(null);
    setPasswordError(null);
    
    // Record the start time
    const startTime = Date.now();
    
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      setLoading(false);
      return;
    }
    
    if (!formData.email || !formData.resetCode) {
      setError('Link đặt lại mật khẩu không hợp lệ. Vui lòng kiểm tra email của bạn và thử lại.');
      setLoading(false);
      return;
    }
    
    try {
      await authAPI.resetPassword({
        email: formData.email,
        resetCode: formData.resetCode,
        newPassword: formData.newPassword
      });
      
      // Ensure loading for at least 5 seconds before showing success
      await ensureMinimumLoadingTime(startTime);
      
      // Đánh dấu link đã được sử dụng
      setLinkAlreadyUsed(true);
      
      // Hiển thị modal thành công thay vì chuyển hướng ngay
      setShowSuccessModal(true);
    } catch (err) {
      console.error('Reset password error:', err);
      
      // Ensure loading for at least 5 seconds before showing error
      await ensureMinimumLoadingTime(startTime);
      
      if (err.response?.data?.message === 'Mật khẩu mới không được trùng với mật khẩu hiện tại của bạn') {
        setPasswordError(err.response.data.message);
      } else if (err.response?.status === 400 && err.response?.data?.message?.includes('không hợp lệ')) {
        setLinkAlreadyUsed(true);
        setError('Link đặt lại mật khẩu đã được sử dụng hoặc không còn hợp lệ.');
      } else {
        setError(err.response?.data?.message || err.message || 'Không thể đặt lại mật khẩu. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Countdown timer and auto-redirect
  useEffect(() => {
    let timer;
    if (showSuccessModal && redirectCountdown > 0) {
      timer = setTimeout(() => {
        setRedirectCountdown(redirectCountdown - 1);
      }, 1000);
    } else if (showSuccessModal && redirectCountdown === 0) {
      handleSuccessModalClose();
    }
    return () => clearTimeout(timer);
  }, [showSuccessModal, redirectCountdown, handleSuccessModalClose]);
  
  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          {showSuccessModal && (
            <div className="success-modal-overlay">
              <div className="success-modal">
                <div className="success-modal-icon">
                  <span>✅</span>
                </div>
                <h3>Mật khẩu đã được đặt lại thành công</h3>
                <p>Bạn đã thành công đặt lại mật khẩu cho tài khoản bằng Email {formData.email}</p>
                <p>Bạn sẽ được chuyển hướng đến trang Đăng nhập trong {redirectCountdown} giây.</p>
                <button 
                  onClick={handleSuccessModalClose}
                  className="success-modal-button"
                >
                  Quay lại đăng nhập
                </button>
              </div>
            </div>
          )}
          
          <div className="auth-header">
            <h1>Đặt lại mật khẩu</h1>
          </div>
          
          {error && (
            <div className="auth-error">
              <i className="error-icon">⚠️</i>
              <span>{error}</span>
            </div>
          )}
          
          {checkingLink ? (
            <div className="auth-loading" style={{ textAlign: 'center', padding: '20px' }}>
              <i className="loading-icon" style={{ display: 'inline-block', animation: 'spin 1.5s linear infinite' }}>⏳</i>
              <p>Đang kiểm tra liên kết...</p>
            </div>
          ) : (
            <>
              {linkAlreadyUsed ? (
                <div className="auth-info" style={{ textAlign: 'center', padding: '20px' }}>
                  <p>Bạn cần yêu cầu một liên kết đặt lại mật khẩu mới để tiếp tục.</p>
                  <Link to="/forgot-password" className="auth-button" style={{ marginTop: '15px', display: 'inline-block', textDecoration: 'none' }}>
                    Yêu cầu liên kết mới
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="auth-form">
                  {passwordError && (
                    <div className="auth-error">
                      <i className="error-icon">⚠️</i>
                      <span>{passwordError}</span>
                    </div>
                  )}
                
                  <div className="form-group">
                    <label htmlFor="newPassword">Mật khẩu mới</label>
                    <div className="input-with-icon">
                      <span className="input-icon">🔒</span>
                      <input
                        type={showNewPassword ? "text" : "password"}
                        id="newPassword"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleChange}
                        required
                        minLength="6"
                        placeholder="Nhập mật khẩu mới"
                        className={passwordError ? "error" : ""}
                      />
                      <button 
                        type="button" 
                        className="password-toggle-btn"
                        onClick={toggleNewPasswordVisibility}
                        tabIndex="-1"
                      >
                        {showNewPassword ? "👁️" : "👁️‍🗨️"}
                      </button>
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
                    <div className="input-with-icon">
                      <span className="input-icon">🔒</span>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        minLength="6"
                        placeholder="Nhập lại mật khẩu mới"
                        className={passwordError ? "error" : ""}
                      />
                      <button 
                        type="button" 
                        className="password-toggle-btn"
                        onClick={toggleConfirmPasswordVisibility}
                        tabIndex="-1"
                      >
                        {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                      </button>
                    </div>
                  </div>
                  
                  <button 
                    type="submit" 
                    className="auth-button"
                    disabled={loading}
                  >
                    {loading ? 
                      <><i className="loading-icon">⏳</i> Đang xử lý...</> : 
                      <><i className="button-icon">🔑</i> Đặt lại mật khẩu</>
                    }
                  </button>
                </form>
              )}
            </>
          )}
          
          <div className="auth-footer">
            <p>
              <Link to="/login">Quay lại đăng nhập</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResetPasswordPage; 