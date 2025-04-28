import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import '../styles/layout/logout-confirmation.css';
import LogoutConfirmation from '../pages/identity/LogoutConfirmation';

function Header() {
  const { user, logout } = useApp();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [showFoodMenu, setShowFoodMenu] = useState(false);
  const [isHoveringFood, setIsHoveringFood] = useState(false);
  const [isHoveringDropdown, setIsHoveringDropdown] = useState(false);
  const timeoutRef = useRef(null);
  const foodMenuRef = useRef(null);
  const [showBlogMenu, setShowBlogMenu] = useState(false);
  const [isHoveringBlog, setIsHoveringBlog] = useState(false);
  const [isHoveringBlogDropdown, setIsHoveringBlogDropdown] = useState(false);
  const blogMenuRef = useRef(null);
  const blogTimeoutRef = useRef(null);
  const [isHoveringUser, setIsHoveringUser] = useState(false);
  const [isHoveringUserDropdown, setIsHoveringUserDropdown] = useState(false);
  const userTimeoutRef = useRef(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (foodMenuRef.current && !foodMenuRef.current.contains(event.target)) {
        setShowFoodMenu(false);
      }
      
      if (blogMenuRef.current && !blogMenuRef.current.contains(event.target)) {
        setShowBlogMenu(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Effect to control food menu visibility based on hover states
  useEffect(() => {
    if (isHoveringFood || isHoveringDropdown) {
      // If hovering over either element, clear any timeout and show the menu
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      setShowFoodMenu(true);
    } else {
      // If not hovering over either, set a timeout to hide the menu
      timeoutRef.current = setTimeout(() => {
        setShowFoodMenu(false);
      }, 100);
    }

    // Cleanup timeout when component unmounts or effect runs again
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isHoveringFood, isHoveringDropdown]);
  
  // Add a new effect for blog menu dropdown
  useEffect(() => {
    if (isHoveringBlog || isHoveringBlogDropdown) {
      // If hovering over either element, clear any timeout and show the menu
      if (blogTimeoutRef.current) {
        clearTimeout(blogTimeoutRef.current);
        blogTimeoutRef.current = null;
      }
      setShowBlogMenu(true);
    } else {
      // If not hovering over either, set a timeout to hide the menu
      blogTimeoutRef.current = setTimeout(() => {
        setShowBlogMenu(false);
      }, 100);
    }

    // Cleanup timeout when component unmounts or effect runs again
    return () => {
      if (blogTimeoutRef.current) {
        clearTimeout(blogTimeoutRef.current);
      }
    };
  }, [isHoveringBlog, isHoveringBlogDropdown]);
  
  // Thêm effect để kiểm soát hiển thị user menu khi hover
  useEffect(() => {
    if (isHoveringUser || isHoveringUserDropdown) {
      if (userTimeoutRef.current) {
        clearTimeout(userTimeoutRef.current);
        userTimeoutRef.current = null;
      }
      setShowMenu(true);
    } else {
      userTimeoutRef.current = setTimeout(() => {
        setShowMenu(false);
      }, 100);
    }

    return () => {
      if (userTimeoutRef.current) {
        clearTimeout(userTimeoutRef.current);
      }
    };
  }, [isHoveringUser, isHoveringUserDropdown]);
  
  const handleLogout = () => {
    setShowMenu(false);
    setShowLogoutConfirm(true);
  };
  
  const confirmLogout = () => {
    logout();
    navigate('/');
    setShowLogoutConfirm(false);
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };
  
  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };
  
  const toggleFoodMenu = () => {
    setShowFoodMenu(!showFoodMenu);
  };
  
  const toggleBlogMenu = () => {
    setShowBlogMenu(!showBlogMenu);
  };
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  return (
    <header className="site-header">
      <div className="container">
        <div className="logo-container">
          <Link to="/" className="logo-link">
            <h1 className="logo">DinerChill</h1>
          </Link>
          
          <div className="hamburger-menu" onClick={toggleMobileMenu}>
            <span className="hamburger-icon"></span>
          </div>
        </div>
        <nav className={`main-nav ${mobileMenuOpen ? 'mobile-active' : ''}`}>
          <ul>
            <li className="nav-item">
              <Link to="/nha-hang">
                <i className="nav-icon">🏠</i> Nhà hàng
              </Link>
            </li>
            <li 
              className="food-menu-container" 
              ref={foodMenuRef}
              onMouseEnter={() => setIsHoveringFood(true)}
              onMouseLeave={() => setIsHoveringFood(false)}
            >
              <span 
                className="nav-link"
                onClick={toggleFoodMenu}
              >
                <i className="nav-icon">🍽️</i> Ăn uống <i className={`dropdown-arrow ${showFoodMenu ? 'open' : ''}`}>▼</i>
              </span>
              {showFoodMenu && (
                <div 
                  className="food-dropdown-menu"
                  onMouseEnter={() => setIsHoveringDropdown(true)}
                  onMouseLeave={() => setIsHoveringDropdown(false)}
                >
                  <div className="food-grid">
                    <Link to="/cuisine/lau">Lẩu</Link>
                    <Link to="/cuisine/buffet">Buffet</Link>
                    <Link to="/cuisine/hai-san">Hải sản</Link>
                    <Link to="/cuisine/lau-nuong">Lẩu & Nướng</Link>
                    <Link to="/cuisine/quan-nhau">Quán Nhậu</Link>
                    <Link to="/cuisine/mon-chay">Món chay</Link>
                    <Link to="/cuisine/do-tiec">Đồ tiệc</Link>
                    <Link to="/cuisine/han-quoc">Hàn Quốc</Link>
                    <Link to="/cuisine/nhat-ban">Nhật Bản</Link>
                    <Link to="/cuisine/mon-viet">Món Việt</Link>
                    <Link to="/cuisine/mon-thai">Món Thái</Link>
                    <Link to="/cuisine/mon-trung-hoa">Món Trung Hoa</Link>
                    <Link to="/cuisine/tiec-cuoi">Tiệc cưới</Link>
                    <Link to="/cuisine/do-uong">Đồ uống</Link>
                  </div>
                </div>
              )}
            </li>
            <li 
              className="food-menu-container blog-menu-container" 
              ref={blogMenuRef}
              onMouseEnter={() => setIsHoveringBlog(true)}
              onMouseLeave={() => setIsHoveringBlog(false)}
            >
              <span 
                className="nav-link"
                onClick={toggleBlogMenu}
              >
                <i className="nav-icon">📰</i> Tin tức & Blog <i className={`dropdown-arrow ${showBlogMenu ? 'open' : ''}`}>▼</i>
              </span>
              {showBlogMenu && (
                <div 
                  className="food-dropdown-menu blog-dropdown-menu"
                  onMouseEnter={() => setIsHoveringBlogDropdown(true)}
                  onMouseLeave={() => setIsHoveringBlogDropdown(false)}
                >
                  <div className="food-grid blog-grid">
                    <Link to="/blog/tin-tuc-moi-nhat">Tin tức mới nhất</Link>
                    <Link to="/blog/meo-kinh-nghiem">Mẹo & Kinh nghiệm ẩm thực</Link>
                    <Link to="/blog/cong-thuc">Công thức món ăn</Link>
                    <Link to="/blog/danh-gia-review">Đánh giá & Review</Link>
                    <Link to="/blog/su-kien-khuyen-mai">Sự kiện & Khuyến mãi</Link>
                    <Link to="/blog/cau-chuyen-am-thuc">Câu chuyện ẩm thực</Link>
                    <Link to="/blog/hau-truong-nha-hang">Hậu trường nhà hàng</Link>
                  </div>
                </div>
              )}
            </li>
            <li className="nav-item">
              <Link to="/vi-tri">
                <i className="nav-icon">📍</i> Vị Trí Gần Bạn
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/dat-ban">
                <i className="nav-icon">📅</i> Đặt bàn
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/khuyen-mai">
                <i className="nav-icon">🎁</i> Ưu Đãi Hot
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/huong-dan-dat-ban">
                <i className="nav-icon">🌟</i> Gợi ý
              </Link>
            </li>
          </ul>
        </nav>
        <div className="auth-nav">
          {user ? (
            <div className="user-menu">
              <span className="user-greeting account-btn" onClick={toggleMenu}>
                <i className="account-icon">👤</i> {user.name}
              </span>
              {showMenu && (
                <div className="dropdown-menu">
                  <Link to="/profile" onClick={() => setShowMenu(false)}>
                    <i className="menu-icon">👤</i> Thông tin tài khoản
                  </Link>
                  {user.role === 'admin' ? (
                    <Link to="/admin" onClick={() => setShowMenu(false)}>
                      <i className="menu-icon">⚙️</i> Quản trị viên
                    </Link>
                  ) : (
                    <Link to="/my-reservations" onClick={() => setShowMenu(false)}>
                      <i className="menu-icon">📅</i> Đặt bàn của tôi
                    </Link>
                  )}
                  <button onClick={handleLogout}>
                    <i className="menu-icon">🚪</i> Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div 
              className="user-menu"
              onMouseEnter={() => setIsHoveringUser(true)}
              onMouseLeave={() => setIsHoveringUser(false)}
            >
              <span className="account-btn">
                <i className="account-icon">👤</i> Tài khoản
              </span>
              <div 
                className="dropdown-menu"
                onMouseEnter={() => setIsHoveringUserDropdown(true)}
                onMouseLeave={() => setIsHoveringUserDropdown(false)}
              >
                <Link to="/login">
                  <i className="menu-icon">🔑</i> Đăng nhập
                </Link>
                <Link to="/register">
                  <i className="menu-icon">📝</i> Đăng ký
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
      {showLogoutConfirm && (
        <LogoutConfirmation
          onCancel={cancelLogout}
          onConfirm={confirmLogout}
        />
      )}
    </header>
  );
}

export default Header; 