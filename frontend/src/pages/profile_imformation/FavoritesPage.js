import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { favoriteAPI } from '../../services/api';
import { useApp } from '../../context/AppContext';
import '../../styles/profile_imformation/FavoritesPage.css';

function FavoritesPage() {
  const { user } = useApp();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const data = await favoriteAPI.getUserFavorites();
      setFavorites(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching favorites:', err);
      setError('Không thể tải danh sách nhà hàng yêu thích của bạn. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (restaurantId) => {
    if (window.confirm('Bạn có chắc muốn xóa nhà hàng này khỏi danh sách yêu thích?')) {
      try {
        await favoriteAPI.remove(restaurantId);
        setFavorites(prev => prev.filter(favorite => favorite.restaurantId !== restaurantId));
        
        // Hiển thị thông báo thành công
        setToast({
          show: true,
          message: 'Đã xóa nhà hàng khỏi danh sách yêu thích!',
          type: 'success'
        });
        
        // Ẩn toast sau 3 giây
        setTimeout(() => {
          setToast({ show: false, message: '', type: '' });
        }, 3000);
      } catch (err) {
        console.error('Error removing favorite:', err);
        
        // Hiển thị thông báo lỗi
        setToast({
          show: true,
          message: 'Không thể xóa nhà hàng khỏi danh sách yêu thích. Vui lòng thử lại.',
          type: 'error'
        });
        
        // Ẩn toast sau 3 giây
        setTimeout(() => {
          setToast({ show: false, message: '', type: '' });
        }, 3000);
      }
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
            <div className="avatar-circle">
              {user?.avatar ? (
                <img src={user.avatar} alt="Avatar" className="avatar-image" />
              ) : (
                getInitials()
              )}
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
                <Link to="/profile">
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
                <Link to="/favorites" className="active">
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
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
              </span>
              DANH SÁCH YÊU THÍCH
            </h1>
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
          
          {loading && favorites.length === 0 ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Đang tải dữ liệu...</p>
            </div>
          ) : favorites.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
              </div>
              <h3>Bạn chưa có nhà hàng yêu thích nào</h3>
              <p>Hãy khám phá và thêm nhà hàng yêu thích của bạn ngay bây giờ</p>
              <Link to="/restaurants" className="btn-primary">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="16"></line>
                  <line x1="8" y1="12" x2="16" y2="12"></line>
                </svg>
                Khám phá nhà hàng
              </Link>
            </div>
          ) : (
            <div className="favorites-container">
              {favorites.map(favorite => (
                <div key={favorite.id} className="favorite-card">
                  <div className="favorite-image">
                    {favorite.restaurantImage ? (
                      <img src={favorite.restaurantImage} alt={favorite.restaurantName} />
                    ) : (
                      <div className="image-placeholder">
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                          <circle cx="8.5" cy="8.5" r="1.5"></circle>
                          <polyline points="21 15 16 10 5 21"></polyline>
                        </svg>
                      </div>
                    )}
                    <button 
                      className="remove-favorite-btn"
                      onClick={() => handleRemoveFavorite(favorite.restaurantId)}
                      title="Xóa khỏi danh sách yêu thích"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                      </svg>
                    </button>
                  </div>
                  
                  <div className="favorite-content">
                    <h3 className="restaurant-name">{favorite.restaurantName}</h3>
                    
                    <div className="restaurant-info">
                      <div className="info-item">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                          <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                        <span>{favorite.address || 'Chưa có địa chỉ'}</span>
                      </div>
                      
                      {favorite.cuisine && (
                        <div className="info-item">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
                            <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
                            <line x1="6" y1="1" x2="6" y2="4"></line>
                            <line x1="10" y1="1" x2="10" y2="4"></line>
                            <line x1="14" y1="1" x2="14" y2="4"></line>
                          </svg>
                          <span>{favorite.cuisine}</span>
                        </div>
                      )}
                      
                      {favorite.rating && (
                        <div className="info-item">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                          </svg>
                          <span>{favorite.rating} ({favorite.reviewCount || 0} đánh giá)</span>
                        </div>
                      )}
                      
                      {favorite.priceRange && (
                        <div className="info-item">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="1" x2="12" y2="23"></line>
                            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                          </svg>
                          <span>{favorite.priceRange}</span>
                        </div>
                      )}
                    </div>
                    
                    {favorite.description && (
                      <p className="restaurant-description">{favorite.description}</p>
                    )}
                    
                    <div className="favorite-actions">
                      <Link to={`/restaurants/${favorite.restaurantId}`} className="btn-view">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                        Xem chi tiết
                      </Link>
                      
                      <Link to={`/reservation/${favorite.restaurantId}`} className="btn-reserve">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                          <line x1="16" y1="2" x2="16" y2="6"></line>
                          <line x1="8" y1="2" x2="8" y2="6"></line>
                          <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                        Đặt bàn
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Toast notification */}
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

export default FavoritesPage; 