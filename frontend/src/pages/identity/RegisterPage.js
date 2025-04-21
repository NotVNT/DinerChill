import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import '../../styles/identity/AuthPages.css';

function RegisterPage() {
  const { register, verifyEmail, resendVerification } = useApp();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  
  // Add state for password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [phoneError, setPhoneError] = useState('');

  
  // State for verification section
  const [showVerification, setShowVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  // References for the 6 verification inputs
  const verificationRefs = [
    React.useRef(null),
    React.useRef(null),
    React.useRef(null),
    React.useRef(null),
    React.useRef(null),
    React.useRef(null)
  ];
  
  // Handle countdown for resend button
  React.useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  
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
  
  // Add toggle functions for password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };
  
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(prev => !prev);
  };
  
  const handleVerificationCodeChange = (e, index) => {
    // Only allow digits
    const value = e.target.value.replace(/\D/g, '');
    
    // Update the verification code array at the specified index
    const newVerificationCode = [...verificationCode];
    newVerificationCode[index] = value.substring(0, 1); // Only take the first digit
    setVerificationCode(newVerificationCode);
    
    // Auto focus on next input if a digit was entered
    if (value !== '' && index < 5) {
      verificationRefs[index + 1].current.focus();
    }
  }
  
  // Handle backspace keys to move to previous input
  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && verificationCode[index] === '' && index > 0) {
      // If current input is empty and backspace is pressed, focus on previous input
      verificationRefs[index - 1].current.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      // Move focus to previous input on left arrow
      verificationRefs[index - 1].current.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      // Move focus to next input on right arrow
      verificationRefs[index + 1].current.focus();
    }
  }
  
  // Handle pasting verification code
  const handleVerificationPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').substring(0, 6);
    
    if (pastedData.length > 0) {
      const newVerificationCode = [...verificationCode];
      
      // Fill in the available digits from the pasted data
      for (let i = 0; i < pastedData.length && i < 6; i++) {
        newVerificationCode[i] = pastedData[i];
      }
      
      setVerificationCode(newVerificationCode);
      
      // Focus on the input after the last filled position or the last input
      const focusIndex = Math.min(pastedData.length, 5);
      verificationRefs[focusIndex].current.focus();
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Kiểm tra mật khẩu trùng khớp
    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu nhập lại không khớp.');

      return;
    }
    
    // Kiểm tra mật khẩu có đủ yêu cầu (ít nhất 6 ký tự, có cả chữ và số)
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{6,}$/;
    if (!passwordRegex.test(formData.password)) {
      setError('Mật khẩu phải có ít nhất 6 ký tự và bao gồm cả chữ và số.');
      return;
    }
    
    // Kiểm tra số điện thoại (luôn bắt buộc)
    const phoneRegex = /^0\d{9,10}$/;
    if (!phoneRegex.test(formData.phone)) {
      setPhoneError('Số điện thoại phải bắt đầu bằng số 0 và có 10-11 chữ số');
      return;
    }
    

    setLoading(true);
    setError(null);
    
    try {

      const response = await register({

        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password
      });
      

      if (response.requiresVerification) {
        // Show verification form instead of redirecting
        setShowVerification(true);
        setSuccess(response.message || 'Đăng ký thành công. Vui lòng xác thực email của bạn.');
        
        // Clear success message after 5 seconds
        setTimeout(() => {
          setSuccess(null);
        }, 5000);
      } else {
        // Direct login successful, navigate to home
        navigate('/');
      }

    } catch (err) {
      setError(err.message || 'Đăng ký không thành công. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleVerificationSubmit = async (e) => {
    e.preventDefault();
    setVerificationLoading(true);
    setError(null);
    
    try {
      // Remove all spaces when submitting the code
      const cleanCode = verificationCode.join('');
      await verifyEmail(formData.email, cleanCode);
      
      // Keep loading state for 5 seconds before showing success modal
      setTimeout(() => {
        setVerificationLoading(false);
        // Show success modal after loading completes
        setShowSuccessModal(true);
      }, 5000);
    } catch (err) {
      setError(err.message || 'Không thể xác thực email. Vui lòng kiểm tra lại mã xác thực.');
      setVerificationLoading(false);
    }
  };
  
  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    navigate('/');
  };
  
  const handleResendCode = async () => {
    if (countdown > 0) return;
    
    setResendLoading(true);
    setError(null);
    
    try {
      const response = await resendVerification(formData.email);
      setSuccess(response.message || 'Mã xác thực mới đã được gửi đến email của bạn');
      setCountdown(60); // Đếm ngược 60 giây
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 5000);
    } catch (err) {
      setError(err.message || 'Không thể gửi lại mã xác thực. Vui lòng thử lại sau.');
      
      // Clear error message after 5 seconds
      setTimeout(() => {
        setError(null);
      }, 5000);
    } finally {
      setResendLoading(false);
    }
  };
  
  // Kiểm tra xem email có phải là Gmail không
  const isGmail = formData.email && formData.email.toLowerCase().endsWith('@gmail.com');
  
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
                <h3>Xác thực email thành công!</h3>
                <button 
                  onClick={handleSuccessModalClose}
                  className="success-modal-button"
                >
                  Ok
                </button>
              </div>
            </div>
          )}
          
          {!showVerification ? (
            <>
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
                  <label htmlFor="name">Họ tên<span className="required">*</span></label>
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
                  <label htmlFor="email">Email<span className="required">*</span></label>
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
                  <label htmlFor="phone">Số điện thoại<span className="required">*</span></label>
                  <div className="input-with-icon">
                    <span className="input-icon">📱</span>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Nhập số điện thoại (bắt đầu bằng số 0)"
                      required
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
                  <label htmlFor="password">Mật khẩu<span className="required">*</span></label>
                  <div className="input-with-icon">
                    <span className="input-icon">🔒</span>
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Mật khẩu ít nhất 6 ký tự (gồm chữ và số)"
                      required
                      minLength="6"
                      autoComplete="new-password"
                    />
                    <button 
                      type="button"
                      className="password-toggle-btn"
                      onClick={togglePasswordVisibility}
                      tabIndex="-1"
                    >
                      {showPassword ? "👁️" : "👁️‍🗨️"}
                    </button>
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="confirmPassword">Xác nhận mật khẩu<span className="required">*</span></label>
                  <div className="input-with-icon">
                    <span className="input-icon">🔒</span>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Nhập lại mật khẩu"
                      required
                      minLength="6"
                      autoComplete="new-password"
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
            </>
          ) : (
            <>
              <div className="auth-header verification-header">
                <h1>Xác nhận email của bạn</h1>
                <p className="email-confirm-text">
                  Hãy xác nhận rằng <strong>{formData.email}</strong> là email của bạn
                </p>
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
              
              <form onSubmit={handleVerificationSubmit} className="auth-form verification-form">
                <div className="email-icon-container">
                  <div className="email-icon">
                    <span>✉️</span>
                  </div>
                </div>
                
                <div className="verification-message">
                  <p>Chúng tôi đã gửi mã xác thực đến email của bạn</p>
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
                </div>
                
                <div className="verification-code-section">
                  <div className="verification-code-label">
                    <span>Nhập mã xác thực</span>
                  </div>
                  
                  <div className="verification-inputs-container">
                    <input
                      type="text" 
                      ref={verificationRefs[0]}
                      maxLength="1"
                      value={verificationCode[0]}
                      onChange={(e) => handleVerificationCodeChange(e, 0)}
                      onKeyDown={(e) => handleKeyDown(e, 0)}
                      onPaste={handleVerificationPaste}
                      className="verification-code-input"
                      autoComplete="off"
                      inputMode="numeric"
                      required
                    />
                    <input
                      type="text" 
                      ref={verificationRefs[1]}
                      maxLength="1"
                      value={verificationCode[1]}
                      onChange={(e) => handleVerificationCodeChange(e, 1)}
                      onKeyDown={(e) => handleKeyDown(e, 1)}
                      className="verification-code-input"
                      autoComplete="off"
                      inputMode="numeric"
                      required
                    />
                    <input
                      type="text" 
                      ref={verificationRefs[2]}
                      maxLength="1"
                      value={verificationCode[2]}
                      onChange={(e) => handleVerificationCodeChange(e, 2)}
                      onKeyDown={(e) => handleKeyDown(e, 2)}
                      className="verification-code-input"
                      autoComplete="off"
                      inputMode="numeric"
                      required
                    />
                    <input
                      type="text" 
                      ref={verificationRefs[3]}
                      maxLength="1"
                      value={verificationCode[3]}
                      onChange={(e) => handleVerificationCodeChange(e, 3)}
                      onKeyDown={(e) => handleKeyDown(e, 3)}
                      className="verification-code-input"
                      autoComplete="off"
                      inputMode="numeric"
                      required
                    />
                    <input
                      type="text" 
                      ref={verificationRefs[4]}
                      maxLength="1"
                      value={verificationCode[4]}
                      onChange={(e) => handleVerificationCodeChange(e, 4)}
                      onKeyDown={(e) => handleKeyDown(e, 4)}
                      className="verification-code-input"
                      autoComplete="off"
                      inputMode="numeric"
                      required
                    />
                    <input
                      type="text" 
                      ref={verificationRefs[5]}
                      maxLength="1"
                      value={verificationCode[5]}
                      onChange={(e) => handleVerificationCodeChange(e, 5)}
                      onKeyDown={(e) => handleKeyDown(e, 5)}
                      className="verification-code-input"
                      autoComplete="off"
                      inputMode="numeric"
                      required
                    />
                  </div>
                  
                  <div className="verification-help">
                    <p>Vui lòng kiểm tra cả thư mục spam/junk nếu bạn không thấy email</p>
                  </div>
                </div>
                
                <button 
                  type="submit" 
                  className="auth-button verification-button"
                  disabled={verificationLoading || verificationCode.some(code => code === '')}
                >
                  {verificationLoading ? 
                    <><i className="loading-icon">⏳</i> Đang xử lý...</> : 
                    <><i className="button-icon">✅</i> Xác nhận</>
                  }
                </button>
                
                <div className="resend-link-container">
                  <button 
                    type="button" 
                    onClick={handleResendCode} 
                    disabled={resendLoading || countdown > 0}
                    className="resend-code-link"
                  >
                    {resendLoading ? 'Đang gửi...' : 
                     countdown > 0 ? `Gửi lại mã sau ${countdown}s` : 'Gửi lại mã xác thực'}
                  </button>
                </div>
              </form>
            </>
          )}

        </div>
      </div>
    </div>
  );
}

export default RegisterPage; 