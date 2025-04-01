import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>DinerChill</h3>
            <p>Nền tảng đặt bàn nhà hàng trực tuyến hàng đầu Việt Nam.</p>
          </div>
          
          <div className="footer-section">
            <h3>Liên kết nhanh</h3>
            <ul>
              <li><Link to="/">Trang chủ</Link></li>
              <li><Link to="/restaurants">Nhà hàng</Link></li>
              <li><Link to="/reservation">Đặt bàn</Link></li>
              <li><Link to="/about">Về chúng tôi</Link></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h3>Liên hệ</h3>
            <p>Email: info@dinerchillvn.com</p>
            <p>SĐT: +84 123 456 789</p>
            <p>Địa chỉ: 123 Đường ABC, Quận 1, TPHCM</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} DinerChill. Tất cả quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer; 