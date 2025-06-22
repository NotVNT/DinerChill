import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import "../styles/layout/logout-confirmation.css";
import LogoutConfirmation from "../pages/identity/LogoutConfirmation";

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

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
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

  const handleLogout = () => {
    setShowMenu(false);
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    logout();
    navigate("/");
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

  const goToHomePage = (e) => {
    e.preventDefault(); // Prevent default link behavior
    // Force a direct navigation to homepage with current origin
    window.location.href = window.location.origin + "/";
  };

  return (
    <header className="site-header">
      <div className="container">
        <div className="header-layout">
          <div className="logo-section">
            <a href="/" className="logo-link" onClick={goToHomePage}>
              <h1 className="logo">
                <i className="fas fa-utensils logo-icon"></i> DinerChill
              </h1>
            </a>
          </div>

          <nav className={`main-nav ${mobileMenuOpen ? "mobile-active" : ""}`}>
            <ul>
              <li
                className="food-menu-container"
                ref={foodMenuRef}
                onMouseEnter={() => setIsHoveringFood(true)}
                onMouseLeave={() => setIsHoveringFood(false)}
              >
                <span className="nav-link" onClick={toggleFoodMenu}>
                  <i className="nav-icon fas fa-utensils"></i> Ăn uống{" "}
                  <i className={`dropdown-arrow fas fa-angle-down ${showFoodMenu ? "open" : ""}`}>
                  </i>
                </span>
                {showFoodMenu && (
                  <div
                    className="food-dropdown-menu"
                    onMouseEnter={() => setIsHoveringDropdown(true)}
                    onMouseLeave={() => setIsHoveringDropdown(false)}
                  >
                    <div className="food-grid">
                      <Link to="/lau">Lẩu</Link>
                      <Link to="/buffet">Buffet</Link>
                      <Link to="/hai-san">Hải sản</Link>
                      <Link to="/lau-nuong">Lẩu & Nướng</Link>
                      <Link to="/quan-nhau">Quán Nhậu</Link>
                      <Link to="/mon-chay">Món chay</Link>
                      <Link to="/do-tiec">Đồ tiệc</Link>
                      <Link to="/han-quoc">Hàn Quốc</Link>
                      <Link to="/nhat-ban">Nhật Bản</Link>
                      <Link to="/mon-viet">Món Việt</Link>
                      <Link to="/mon-thai">Món Thái</Link>
                      <Link to="/mon-trung-hoa">Món Trung Hoa</Link>
                      <Link to="/tiec-cuoi">Tiệc cưới</Link>
                      <Link to="/do-uong">Đồ uống</Link>
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
                <span className="nav-link" onClick={toggleBlogMenu}>
                  <i className="nav-icon fas fa-newspaper"></i> Tin tức & Blog{" "}
                  <i className={`dropdown-arrow fas fa-angle-down ${showBlogMenu ? "open" : ""}`}>
                  </i>
                </span>
                {showBlogMenu && (
                  <div
                    className="food-dropdown-menu blog-dropdown-menu"
                    onMouseEnter={() => setIsHoveringBlogDropdown(true)}
                    onMouseLeave={() => setIsHoveringBlogDropdown(false)}
                  >
                    <div className="food-grid blog-grid">
                      <Link to="/blog/tin-tuc-moi-nhat">Tin tức mới nhất</Link>
                      <Link to="/blog/kinh-doanh-an-uong">Kinh doanh ăn uống</Link>
                      <Link to="/blog/dia-diem-an-uong">Địa điểm ăn uống</Link>
                      <Link to="/blog/danh-gia-review">Đánh giá & Review</Link>
                      <Link to="/blog/su-kien-khuyen-mai">Sự kiện & Khuyến mãi</Link>
                      <Link to="/blog/nha-hang-hot-trend">Nhà Hàng Hot Trend</Link>
                      <Link to="/blog/hau-truong-nha-hang">Hậu trường nhà hàng</Link>
                    </div>
                  </div>
                )}
              </li>
              <li className="nav-item">
                <Link to="/vi-tri">
                  <i className="nav-icon fas fa-map-marker-alt"></i> Vị Trí Gần Bạn
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/khuyen-mai">
                  <i className="nav-icon fas fa-gift"></i> Ưu Đãi Hot
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/huong-dan-dat-ban">
                  <i className="nav-icon fas fa-star"></i> Gợi ý
                </Link>
              </li>
            </ul>
          </nav>

          <div className="auth-nav">
            {user ? (
              <div className="user-menu">
                <span
                  className="user-greeting account-btn"
                  onClick={toggleMenu}
                >
                  <i className="account-icon fas fa-user-circle"></i> {user.name}
                </span>
                {showMenu && (
                  <div className="user-dropdown-menu">
                    <Link to="/profile" onClick={() => setShowMenu(false)}>
                      <i className="menu-icon fas fa-user"></i> Thông tin tài khoản
                    </Link>
                    {user.roleId === 1 ? (
                      <Link to="/admin" onClick={() => setShowMenu(false)}>
                        <i className="menu-icon fas fa-cogs"></i> Quản trị viên
                      </Link>
                    ) : (
                      <Link
                        to="/my-reservations"
                        onClick={() => setShowMenu(false)}
                      >
                        <i className="menu-icon fas fa-calendar-alt"></i> Đặt bàn của tôi
                      </Link>
                    )}
                    <button onClick={handleLogout}>
                      <i className="menu-icon fas fa-sign-out-alt"></i> Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="user-menu">
                <span 
                  className="account-btn"
                  onClick={toggleMenu}
                >
                  <i className="account-icon fas fa-user-circle"></i> Tài khoản
                </span>
                {showMenu && (
                  <div className="user-dropdown-menu">
                    <Link to="/login" onClick={() => setShowMenu(false)}>
                      <i className="menu-icon fas fa-sign-in-alt"></i> Đăng nhập
                    </Link>
                    <Link to="/register" onClick={() => setShowMenu(false)}>
                      <i className="menu-icon fas fa-user-plus"></i> Đăng ký
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="hamburger-menu" onClick={toggleMobileMenu}>
            <span className="hamburger-icon"></span>
          </div>
        </div>
      </div>
      {showLogoutConfirm && (
        <LogoutConfirmation onCancel={cancelLogout} onConfirm={confirmLogout} />
      )}
    </header>
  );
}

export default Header;
