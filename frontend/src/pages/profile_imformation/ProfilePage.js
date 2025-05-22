import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { reservationAPI, favoriteAPI, authAPI } from '../../services/api';
import '../../styles/profile_imformation/ProfilePage.css';
import LogoutHandler from '../identity/LogoutHandler';

function ProfilePage() {
  const { user, updateProfile } = useApp();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  
  // Lưu email ban đầu để khôi phục nếu cần
  const [originalEmail, setOriginalEmail] = useState('');
  
  // Avatar state
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const fileInputRef = useRef(null);
  
  // Thêm thông báo Toast
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  
  // State cho dữ liệu thống kê
  const [stats, setStats] = useState({
    reservationsCount: 0,
    favoritesCount: 0,
    reviewsCount: 0
  });

  // Fetch dữ liệu cho Lịch sử đặt chỗ và Danh sách yêu thích
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Lấy dữ liệu đặt chỗ
        let reservations = [];
        try {
          const response = await reservationAPI.getByUser();
          if (Array.isArray(response)) {
            reservations = response;
          } else {
            console.warn('API response for reservations is not an array:', response);
          }
        } catch (apiErr) {
          console.error('API call for reservations failed:', apiErr);
        }
        const reservationsCount = reservations.length || 0;
        console.log('Reservations data:', reservations);

        // Lấy dữ liệu danh sách yêu thích
        let favorites = [];
        try {
          const response = await favoriteAPI.getByUser();
          if (Array.isArray(response)) {
            favorites = response;
          } else {
            console.warn('API response for favorites is not an array:', response);
          }
        } catch (apiErr) {
          console.error('API call for favorites failed:', apiErr);
        }
        const favoritesCount = favorites.length || 0;
        console.log('Favorites data:', favorites);

        // Đặt mặc định reviewsCount là 0 vì chưa có reviewAPI
        setStats({
          reservationsCount,
          favoritesCount,
          reviewsCount: 0
        });
      } catch (err) {
        console.error('Lỗi khi lấy dữ liệu thống kê:', err);
        setError('Không thể tải dữ liệu thống kê.');
        setToast({
          show: true,
          message: 'Không thể tải dữ liệu thống kê. Vui lòng kiểm tra console log.',
          type: 'error'
        });
        setTimeout(() => {
          setToast({ show: false, message: '', type: '' });
        }, 3000);
      }
    };

    fetchStats();
  }, []);

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setFormData(prevState => ({
        ...prevState,
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      }));
      setOriginalEmail(user.email || '');
      setAvatarPreview(user.avatar || null); // Đặt lại avatar preview từ user
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
  
  // Kiểm tra email đã tồn tại chưa
  const checkEmailExists = async (email) => {
    try {
      const response = await authAPI.checkEmail(email);
      return response.exists;
    } catch (error) {
      console.error('Lỗi kiểm tra email:', error);
      throw error;
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      // Kiểm tra nếu email đã thay đổi
      if (formData.email !== originalEmail) {
        try {
          const emailExists = await checkEmailExists(formData.email);
          if (emailExists) {
            setFormData(prev => ({
              ...prev,
              email: originalEmail
            }));
            setError('Gmail này đã tồn tại trong hệ thống');
            setToast({
              show: true,
              message: 'Gmail này đã tồn tại trong hệ thống',
              type: 'error'
            });
            setLoading(false);
            setTimeout(() => {
              setToast({ show: false, message: '', type: '' });
            }, 3000);
            return;
          }
        } catch (checkError) {
          console.error('Lỗi khi kiểm tra email:', checkError);
          setError('Không thể kiểm tra email. Vui lòng thử lại sau.');
          setLoading(false);
          return;
        }
      }
      
      // Tạo FormData nếu có file ảnh
      let updateData;
      if (avatar) {
        const formDataObj = new FormData();
        formDataObj.append('name', formData.name);
        formDataObj.append('email', formData.email);
        formDataObj.append('phone', formData.phone);
        formDataObj.append('avatar', avatar);
        
        console.log('Sending FormData with avatar:', Object.fromEntries(formDataObj));
        updateData = formDataObj;
      } else {
        updateData = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone
        };
        console.log('Sending JSON data:', updateData);
      }
      
      const response = await updateProfile(updateData);
      console.log('Update profile response:', response);
      
      if (response && response.user) {
        setSuccess(true);
        if (formData.email !== originalEmail) {
          setOriginalEmail(formData.email);
        }
        // Cập nhật user trong AppContext (giả định updateProfile trả về user mới)
        setToast({
          show: true,
          message: 'Cập nhật thông tin thành công!',
          type: 'success'
        });
      } else {
        throw new Error('Không nhận được phản hồi từ server hoặc dữ liệu không được cập nhật.');
      }
      
      setTimeout(() => {
        setToast({ show: false, message: '', type: '' });
      }, 3000);
    } catch (err) {
      console.error('Lỗi cập nhật:', err);
      let errorMessage = 'Có lỗi xảy ra khi cập nhật thông tin.';
      if (err.response && err.response.data) {
        errorMessage = err.response.data.message || errorMessage;
      } else if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      setToast({
        show: true,
        message: errorMessage,
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
            <div className="username">{user?.name || 'Người dùng'}</div>
            <div className="user-info">ID: {user?.id || 'N/A'}</div>
            <div className="user-info">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg> {user?.phone || 'Chưa có số điện thoại'}
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
                <LogoutHandler />
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
                <div className="stat-value">{stats.reservationsCount}</div>
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
                <div className="stat-value">{stats.favoritesCount}</div>
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
                <div className="stat-value">{stats.reviewsCount}</div>
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
                      required
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
                    />
                  </div>
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