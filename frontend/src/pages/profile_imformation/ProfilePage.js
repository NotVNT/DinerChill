import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import '../../styles/profile_imformation/ProfilePage.css';

function ProfilePage() {
  const { user, updateProfile } = useApp();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    birthDay: '01',
    birthMonth: '01',
    birthYear: '1990',
    gender: 'Nam'
  });
  
  // Avatar state
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const fileInputRef = useRef(null);
  
  // Thêm thông báo Toast
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  
  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setFormData(prevState => ({
        ...prevState,
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        // Add other fields if they exist in your user object
      }));
    }
  }, [user]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      // Tạo FormData nếu có file ảnh
      let updateData;
      if (avatar) {
        const formData = new FormData();
        formData.append('name', formData.name);
        formData.append('phone', formData.phone);
        formData.append('avatar', avatar);
        updateData = formData;
      } else {
        updateData = {
          name: formData.name,
          phone: formData.phone,
        };
      }
      
      await updateProfile(updateData);
      setSuccess(true);
      
      // Hiện toast thông báo
      setToast({
        show: true,
        message: 'Cập nhật thông tin thành công!',
        type: 'success'
      });
      
      // Ẩn toast sau 3 giây
      setTimeout(() => {
        setToast({ show: false, message: '', type: '' });
      }, 3000);
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra khi cập nhật thông tin. Vui lòng thử lại.');
      setToast({
        show: true,
        message: 'Có lỗi xảy ra khi cập nhật thông tin.',
        type: 'error'
      });
      
      setTimeout(() => {
        setToast({ show: false, message: '', type: '' });
      }, 3000);
    } finally {
      setLoading(false);
    }
  };
  
  // Get user initials for avatar
  const getInitials = () => {
    if (!user || !user.name) return '?';
    return user.name
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-sidebar">
          <div className="profile-avatar">
            <div className="avatar-circle" onClick={triggerFileInput}>
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" className="avatar-image" />
              ) : user?.avatar ? (
                <img src={user.avatar} alt="Avatar" className="avatar-image" />
              ) : (
                getInitials()
              )}
              <div className="avatar-overlay">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                  <circle cx="12" cy="13" r="4"></circle>
                </svg>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleAvatarChange} 
                style={{ display: 'none' }} 
                accept="image/*"
              />
            </div>
            <div className="username">{user?.name}</div>
            <div className="user-info">ID: {user?.id}</div>
            <div className="user-info">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg> {user?.phone}
            </div>
          </div>
          
          <nav className="profile-nav">
            <ul>
              <li>
                <Link to="/profile" className="active">
                  <span className="nav-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </span>
                  Thông tin tài khoản
                </Link>
              </li>
              <li>
                <Link to="/my-reservations">
                  <span className="nav-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                  </span>
                  Lịch sử đặt chỗ
                </Link>
              </li>
              <li>
                <Link to="/favorites">
                  <span className="nav-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                  </span>
                  Danh sách yêu thích
                </Link>
              </li>
              <li>
                <Link to="/change-password">
                  <span className="nav-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                  </span>
                  Quản lý mật khẩu
                </Link>
              </li>
              <li>
                <Link to="/linked-accounts">
                  <span className="nav-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                      <line x1="1" y1="10" x2="23" y2="10"></line>
                    </svg>
                  </span>
                  Ví tiền/Thanh toán
                </Link>
              </li>
              <li>
                <Link to="/logout" className="logout-btn">
                  <span className="nav-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                      <polyline points="16 17 21 12 16 7"></polyline>
                      <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                  </span>
                  Thoát
                </Link>
              </li>
            </ul>
          </nav>
        </div>
        
        <div className="profile-main">
          <div className="profile-header">
            <h1>
              <span className="header-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </span>
              THÔNG TIN TÀI KHOẢN
            </h1>
          </div>
          
          <div className="profile-stats">
            <div className="stat-card">
              <div className="stat-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
              </div>
              <div className="stat-content">
                <div className="stat-value">{user?.reservations?.length || 0}</div>
                <div className="stat-label">Lượt đặt bàn</div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
              </div>
              <div className="stat-content">
                <div className="stat-value">{user?.favorites?.length || 0}</div>
                <div className="stat-label">Nhà hàng yêu thích</div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
              </div>
              <div className="stat-content">
                <div className="stat-value">{user?.reviews?.length || 0}</div>
                <div className="stat-label">Đánh giá</div>
              </div>
            </div>
          </div>
          
          {error && (
            <div className="error-message">
              <span className="message-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
              </span>
              {error}
            </div>
          )}
          
          {success && (
            <div className="success-message">
              <span className="message-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </span>
              Cập nhật thông tin thành công!
            </div>
          )}
          
          <form className="profile-form" onSubmit={handleSubmit}>
            <div className="profile-card">
              <div className="profile-card-header">
                <h2>
                  <span className="section-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </span>
                  Thông tin cá nhân
                </h2>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Họ tên</label>
                  <div className="input-with-icon">
                    <span className="input-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                    </span>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="profile-card">
              <div className="profile-card-header">
                <h2>
                  <span className="section-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                      <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                  </span>
                  Thông tin liên hệ
                </h2>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <div className="input-with-icon">
                    <span className="input-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                        <polyline points="22,6 12,13 2,6"></polyline>
                      </svg>
                    </span>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled
                    />
                  </div>
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="phone">Số điện thoại</label>
                  <div className="input-with-icon">
                    <span className="input-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                      </svg>
                    </span>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="profile-card">
              <div className="profile-card-header">
                <h2>
                  <span className="section-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                  </span>
                  Thông tin cá nhân bổ sung
                </h2>
              </div>
              
              <div className="form-group">
                <label>Ngày sinh</label>
                <div className="date-selectors">
                  <select 
                    name="birthDay" 
                    value={formData.birthDay}
                    onChange={handleChange}
                  >
                    {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                      <option key={day} value={day < 10 ? `0${day}` : day}>
                        {day}
                      </option>
                    ))}
                  </select>
                  
                  <select 
                    name="birthMonth" 
                    value={formData.birthMonth}
                    onChange={handleChange}
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                      <option key={month} value={month < 10 ? `0${month}` : month}>
                        Tháng {month}
                      </option>
                    ))}
                  </select>
                  
                  <select 
                    name="birthYear" 
                    value={formData.birthYear}
                    onChange={handleChange}
                  >
                    {Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i).map(year => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="form-group">
                <label>Giới tính</label>
                <div className="gender-options">
                  <label className="gender-option">
                    <input
                      type="radio"
                      name="gender"
                      value="Nam"
                      checked={formData.gender === 'Nam'}
                      onChange={handleChange}
                    />
                    Nam
                  </label>
                  <label className="gender-option">
                    <input
                      type="radio"
                      name="gender"
                      value="Nữ"
                      checked={formData.gender === 'Nữ'}
                      onChange={handleChange}
                    />
                    Nữ
                  </label>
                </div>
              </div>
            </div>
            
            <div className="form-actions">
              <button 
                type="submit" 
                className="btn-update"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin">
                      <line x1="12" y1="2" x2="12" y2="6"></line>
                      <line x1="12" y1="18" x2="12" y2="22"></line>
                      <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
                      <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
                      <line x1="2" y1="12" x2="6" y2="12"></line>
                      <line x1="18" y1="12" x2="22" y2="12"></line>
                      <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
                      <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
                    </svg>
                    Đang cập nhật...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                      <polyline points="17 21 17 13 7 13 7 21"></polyline>
                      <polyline points="7 3 7 8 15 8"></polyline>
                    </svg>
                    Cập nhật
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      {/* Thêm component Toast vào render */}
      {toast.show && (
        <div className={`toast-notification ${toast.type}`}>
          <div className="toast-icon">
            {toast.type === 'success' ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            )}
          </div>
          <div className="toast-message">{toast.message}</div>
        </div>
      )}
    </div>
  );
}

export default ProfilePage; 