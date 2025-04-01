import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

function Header() {
  const { user, logout } = useApp();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [showFoodMenu, setShowFoodMenu] = useState(false);
  const [isHoveringFood, setIsHoveringFood] = useState(false);
  const [isHoveringDropdown, setIsHoveringDropdown] = useState(false);
  const timeoutRef = useRef(null);
  const foodMenuRef = useRef(null);
  
  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (foodMenuRef.current && !foodMenuRef.current.contains(event.target)) {
        setShowFoodMenu(false);
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
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };
  
  const toggleFoodMenu = () => {
    setShowFoodMenu(!showFoodMenu);
  };
  
  return (
    <header className="site-header">
      <div className="container">
        <Link to="/" className="logo-link">
          <h1 className="logo">DinerChill</h1>
        </Link>
        <nav className="main-nav">
          <ul>
            <li><Link to="/restaurants">Nhà hàng</Link></li>
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
                Ăn uống <i className={`dropdown-arrow ${showFoodMenu ? 'open' : ''}`}>▼</i>
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
            <li><Link to="/reservation">Đặt bàn</Link></li>
          </ul>
        </nav>
        <div className="auth-nav">
          {user ? (
            <div className="user-menu">
              <span className="user-greeting" onClick={toggleMenu}>Xin chào, {user.name}</span>
              {showMenu && (
                <div className="dropdown-menu">
                  <Link to="/profile" onClick={() => setShowMenu(false)}>Thông tin tài khoản</Link>
                  {!user.isAdmin && (
                    <Link to="/my-reservations" onClick={() => setShowMenu(false)}>Đặt bàn của tôi</Link>
                  )}
                  {user.isAdmin && (
                    <Link to="/admin" onClick={() => setShowMenu(false)}>Quản trị viên</Link>
                  )}
                  <button onClick={handleLogout}>Đăng xuất</button>
                </div>
              )}
            </div>
          ) : (
            <div className="user-menu">
              <span className="account-button" onClick={toggleMenu}>Tài khoản</span>
              {showMenu && (
                <div className="dropdown-menu">
                  <Link to="/login" onClick={() => setShowMenu(false)}>Đăng nhập</Link>
                  <Link to="/register" onClick={() => setShowMenu(false)}>Đăng ký</Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header; 