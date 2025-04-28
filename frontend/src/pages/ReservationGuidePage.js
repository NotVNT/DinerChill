import React from 'react';
import '../styles/pages/ReservationGuidePage.css';

function ReservationGuidePage() {
  return (
    <div className="reservation-guide-container">
      <div className="guide-header">
        <h1>Hướng dẫn đặt bàn nhận ưu đãi</h1>
        <p className="guide-subtitle">
          <a href="/dat-ban" className="guide-link">
            Xem chi tiết hướng dẫn <span className="link-text">tại đây</span>
          </a>
        </p>
      </div>

      <div className="guide-steps">
        <div className="steps-container">
          {/* Step 1 */}
          <div className="guide-step">
            <div className="step-arrow">→</div>
            <div className="step-content">
              <h3>Truy cập trang web hoặc ứng dụng PasGo</h3>
              <div className="step-number">
                <span>1</span>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="guide-step"> 
            <div className="step-arrow">→</div>
            <div className="step-content">
              <h3>Đăng nhập hoặc tạo tài khoản</h3>
              <div className="step-number">
                <span>2</span>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="guide-step">
            <div className="step-arrow">→</div>
            <div className="step-content">
              <h3>Tìm kiếm nhà hàng</h3>
              <div className="step-number">
                <span>3</span>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="guide-step">
            <div className="step-arrow">→</div>
            <div className="step-content">
              <h3>Chọn nhà hàng</h3>
              <div className="step-number">
                <span>4</span>
              </div>
            </div>
          </div>

          {/* Step 5 */}
          <div className="guide-step">
            <div className="step-arrow">→</div>
            <div className="step-content">
              <h3>Đặt chỗ trực tuyến<br />Chỉ với vài cú chạm</h3>
              <div className="step-number">
                <span>5</span>
              </div>
            </div>
          </div>

          {/* Step 6 */}
          <div className="guide-step">
            <div className="step-arrow">→</div>
            <div className="step-content">
              <h3>Xác nhận & phản hồi</h3>
              <div className="step-number">
                <span>6</span>
              </div>
            </div>
          </div>

          {/* Step 7 */}
          <div className="guide-step">
            <div className="step-content">
              <h3>Chờ đến và quản lý đặt chỗ</h3>
              <div className="step-number">
                <span>7</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="reservation-benefits">
        <h2>Lợi ích khi đặt bàn qua DinerChill</h2>
        <div className="benefits-grid">
          <div className="benefit-card">
            <div className="benefit-icon">⏱️</div>
            <h3>Tiết kiệm thời gian</h3>
            <p>Đặt bàn chỉ trong vài phút, không cần gọi điện</p>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon">🎁</div>
            <h3>Ưu đãi độc quyền</h3>
            <p>Nhận ưu đãi đặc biệt chỉ dành cho khách đặt qua ứng dụng</p>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon">✅</div>
            <h3>Đảm bảo có chỗ</h3>
            <p>Không lo lắng về việc phải chờ đợi khi đến nhà hàng</p>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon">📱</div>
            <h3>Quản lý đặt chỗ dễ dàng</h3>
            <p>Xem lịch sử, hủy hoặc thay đổi đặt chỗ mọi lúc mọi nơi</p>
          </div>
        </div>
      </div>

      <div className="reservation-cta">
        <h2>Sẵn sàng đặt bàn?</h2>
        <p>Chỉ mất vài phút để có một trải nghiệm ẩm thực tuyệt vời</p>
        <a href="/dat-ban" className="cta-button">Đặt bàn ngay</a>
      </div>
    </div>
  );
}

export default ReservationGuidePage; 