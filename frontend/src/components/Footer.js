import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/modules/footer.css';

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-container">
        {/* Headings row */}
        <div className="footer-headings-row">
          <div className="footer-heading-col">
            <h3 className="footer-heading">Đặt chỗ & Ưu đãi</h3>
          </div>
          <div className="footer-heading-col">
            <h3 className="footer-heading">Giới thiệu</h3>
          </div>
          <div className="footer-heading-col">
            <h3 className="footer-heading">Tiện ích</h3>
          </div>
          <div className="footer-heading-col">
            <h3 className="footer-heading">Điều khoản & Chính sách</h3>
          </div>
          <div className="footer-heading-col">
            <h3 className="footer-heading">Dành cho Kinh doanh</h3>
          </div>
        </div>
        
        {/* Content row */}
        <div className="footer-content-row">
          <div className="footer-content-col">
            <p>DinerChill là nền tảng đặt chỗ trực tuyến,Giúp thực khách tìm kiếm và lựa chọn nhà hàng đúng ý,Với các đối tác nhà hàng sẽ dễ dàng và hiệu quả hơn để tăng doanh số</p>
          </div>
          
          <div className="footer-content-col">
            <ul className="footer-links">
              <li><Link to="/gioi-thieu">Tổng quan về nền tảng DinerChill</Link></li>
              <li><Link to="/huong-dan-dat-cho">Hướng dẫn đặt chỗ</Link></li>
              <li><Link to="/hoi-dap">Câu hỏi thường gặp khi đặt chỗ</Link></li>
            </ul>
          </div>
          
          <div className="footer-content-col">
            <ul className="footer-links">
              <li><Link to="/dia-diem-gan-ban">Địa điểm gần bạn</Link></li>
              <li><Link to="/tim-kiem">Tìm kiếm ngay</Link></li>
              <li><Link to="/uu-dai">Ưu đãi đang Hot</Link></li>
              <li><Link to="/kham-pha">Khám phá các Bộ sưu tập</Link></li>
            </ul>
          </div>
          
          <div className="footer-content-col">
            <ul className="footer-links">
              <li><Link to="/dieu-khoan-su-dung">Điều khoản sử dụng</Link></li>
              <li><Link to="/quy-che">Quy chế hoạt động</Link></li>
              <li><Link to="/chinh-sach-bao-mat">Chính sách bảo mật thông tin</Link></li>
              <li><Link to="/dieu-khoan-doi-tac">Điều khoản với Đối tác</Link></li>
            </ul>
          </div>
          
          <div className="footer-content-col">
            <ul className="footer-links">
              <li><Link to="/trung-tam-ho-tro" style={{color: '#D02028', fontWeight: 500}}>Trung tâm hỗ trợ Đối tác</Link></li>
              <li><Link to="/huong-dan-nha-hang">Hướng dẫn nhà hàng hợp tác</Link></li>
              <li><a href="https://forms.gle/hb2HGrGNaF5YWfQs7" target="_blank" rel="noopener noreferrer">Nhà hàng đăng ký hợp tác</a></li>
              <li><Link to="/lien-he">Liên hệ về Đầu tư & Hợp tác</Link></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;