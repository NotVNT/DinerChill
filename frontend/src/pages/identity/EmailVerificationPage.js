import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import '../../styles/identity/AuthPages.css';

function EmailVerificationPage() {
  const { verifyEmail, resendVerification, user } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [codeInputFocused, setCodeInputFocused] = useState(false);
  const [countdown, setCountdown] = useState(0);
  
  // Refs cho input fields
  const codeInputRef = useRef(null);
  const codeInputs = useRef([]);
  
  // Thêm trạng thái để hiển thị tùy chọn bỏ qua xác thực
  const [showBypassOption, setShowBypassOption] = useState(false);
  const [bypassAttempts, setBypassAttempts] = useState(0);
  const [devTools, setDevTools] = useState(false);
  const [fetchingCode, setFetchingCode] = useState(false);
  
  // Tự động điền email từ trạng thái vị trí hoặc user object
  useEffect(() => {
    if (location.state && location.state.email) {
      setEmail(location.state.email);
    } else if (user && user.email) {
      setEmail(user.email);
    }
    
    // Hiển thị tùy chọn bỏ qua sau khi trang đã tải được 5 giây
    const timer = setTimeout(() => {
      setShowBypassOption(true);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [location.state, user]);
  
  // Đếm ngược cho nút gửi lại
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const response = await verifyEmail(email, verificationCode);
      setSuccess(response.message || 'Xác thực email thành công');
      
      // Chuyển hướng về trang chủ sau khi xác thực thành công
      setTimeout(() => {
        navigate('/', { state: { verified: true } });
      }, 2000);
    } catch (err) {
      setError(err.message || 'Không thể xác thực email. Vui lòng kiểm tra lại mã xác thực.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleResendCode = async () => {
    if (countdown > 0) return;
    
    setResendLoading(true);
    setError(null);
    setResendSuccess(false);
    
    try {
      const response = await resendVerification(email);
      setResendSuccess(true);
      setSuccess(response.message || 'Mã xác thực mới đã được gửi đến email của bạn');
      setCountdown(60); // Đếm ngược 60 giây
    } catch (err) {
      setError(err.message || 'Không thể gửi lại mã xác thực. Vui lòng thử lại sau.');
      // Nếu gặp lỗi khi gửi lại, hiển thị tùy chọn bỏ qua
      setShowBypassOption(true);
    } finally {
      setResendLoading(false);
    }
  };
  
  const handleVerificationCodeChange = (e) => {
    // Chuyển đổi mã xác thực thành chữ hoa và loại bỏ khoảng trắng
    const value = e.target.value.toUpperCase().replace(/\s/g, '');
    setVerificationCode(value);
    
    // Tự động submit nếu đủ 6 ký tự
    if (value.length === 6 && !loading) {
      setTimeout(() => {
        handleSubmit(new Event('submit'));
      }, 500);
    }
  };
  
  // Xử lý bỏ qua xác thực trong môi trường development
  const handleBypass = () => {
    setBypassAttempts(prev => prev + 1);
    
    if (bypassAttempts >= 2) {
      // Sau 3 lần click, chuyển về trang chủ
      navigate('/', { state: { bypassedVerification: true } });
    } else {
      setError(`Bạn cần nhấn thêm ${3 - bypassAttempts - 1} lần nữa để bỏ qua xác thực email (chỉ sử dụng cho mục đích test)`);
    }
  };
  
  // Mở dev tools
  const toggleDevTools = () => {
    setDevTools(!devTools);
  };
  
  // Lấy mã xác thực từ server (chỉ trong môi trường dev)
  const fetchVerificationCode = async () => {
    if (!email) {
      setError('Vui lòng nhập email trước khi lấy mã xác thực');
      return;
    }
    
    setFetchingCode(true);
    setError(null);
    
    try {
      const response = await fetch('/api/dev/verification-codes');
      const data = await response.json();
      
      if (data.success && data.codes[email]) {
        setVerificationCode(data.codes[email]);
        setSuccess(`Đã tìm thấy mã xác thực: ${data.codes[email]}`);
      } else {
        setError('Không tìm thấy mã xác thực cho email này. Hãy thử gửi lại mã.');
      }
    } catch (err) {
      console.error('Error fetching verification code:', err);
      setError('Không thể lấy mã xác thực từ server');
    } finally {
      setFetchingCode(false);
    }
  };
  
  // Kiểm tra xem email có phải là Gmail không
  const isGmail = email && email.toLowerCase().endsWith('@gmail.com');
  
  // Phần hiển thị email được che dấu một phần
  const maskedEmail = email ? email.replace(/^(.{3})(.*)(@.*)$/, '$1***$3') : '';
  
  return (
    <div className="auth-page facebook-style">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header facebook-header">
            <h1>Xác nhận email của bạn</h1>
            <p className="email-confirm-text">Hãy xác nhận rằng <strong>{email}</strong> là email của bạn</p>
          </div>
          
          {error && (
            <div className="auth-error">
              <i className="error-icon">⚠️</i>
              <span>{error}</span>
            </div>
          )}
          
          {success && (
            <div className="auth-success">
              <i className="success-icon">✅</i>
              <span>{success}</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="auth-form verification-form">
            <div className="verification-prompt">
              <div className="email-sent-icon">
                <span>✉️</span>
              </div>
              <p>
                Chúng tôi đã gửi mã xác thực đến email <strong>{maskedEmail}</strong>
                {isGmail && (
                  <a 
                    href="https://mail.google.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="open-gmail-link"
                  >
                    Mở Gmail
                  </a>
                )}
              </p>
            </div>
            
            <div className="form-group code-input-group">
              <label htmlFor="verificationCode">Nhập mã xác thực</label>
              <div className={`verification-input-container ${codeInputFocused ? 'focused' : ''}`}>
                <input
                  ref={codeInputRef}
                  type="text" 
                  id="verificationCode"
                  value={verificationCode}
                  onChange={handleVerificationCodeChange}
                  placeholder="Nhập mã xác thực 6 ký tự"
                  maxLength="6"
                  className="verification-code-input"
                  autoComplete="off"
                  onFocus={() => setCodeInputFocused(true)}
                  onBlur={() => setCodeInputFocused(false)}
                />
              </div>
              <div className="verification-help">
                <p>Vui lòng kiểm tra cả thư mục spam/junk nếu bạn không thấy email</p>
              </div>
            </div>
            
            <div className="form-actions">
              <button 
                type="submit" 
                className="auth-button verification-button"
                disabled={loading || !email || verificationCode.length < 6}
              >
                {loading ? 
                  <><i className="loading-icon">⏳</i> Đang xử lý...</> : 
                  <><i className="button-icon">✅</i> Xác nhận</>
                }
              </button>
              
              <div className="resend-code-container">
                <button 
                  type="button" 
                  onClick={handleResendCode} 
                  disabled={resendLoading || !email || countdown > 0}
                  className="resend-code-button"
                >
                  {resendLoading ? 'Đang gửi...' : 
                   countdown > 0 ? `Gửi lại mã sau ${countdown}s` : 'Gửi lại mã xác thực'}
                </button>
                {resendSuccess && (
                  <div className="resend-success">
                    <i className="success-icon">✅</i>
                    <span>Đã gửi mã xác thực mới!</span>
                  </div>
                )}
              </div>
            </div>
            
            {showBypassOption && (
              <div className="bypass-option">
                <button 
                  type="button"
                  onClick={handleBypass}
                  className="bypass-button"
                >
                  Không nhận được email? (Tùy chọn dành cho tester)
                </button>
                
                <button
                  type="button"
                  onClick={toggleDevTools}
                  className="dev-tools-button"
                >
                  {devTools ? 'Ẩn công cụ dev' : 'Công cụ dev'}
                </button>
              </div>
            )}
            
            {devTools && (
              <div className="dev-tools">
                <div className="dev-tools-panel">
                  <h4>Developer Tools</h4>
                  <button
                    type="button"
                    onClick={fetchVerificationCode}
                    disabled={fetchingCode || !email}
                    className="dev-button"
                  >
                    {fetchingCode ? 'Đang lấy mã...' : 'Lấy mã từ file system'}
                  </button>
                  <p className="dev-note">
                    <small>*Chỉ hoạt động khi server đã lưu email xuống file</small>
                  </p>
                </div>
              </div>
            )}
          </form>
          
          <div className="auth-footer verification-footer">
            <p>
              <Link to="/" className="back-link">Quay lại trang chủ</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmailVerificationPage; 