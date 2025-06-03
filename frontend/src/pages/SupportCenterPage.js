import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/SupportCenterPage.css';

const CHECK_ICON = (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" style={{verticalAlign:'middle'}}>
    <circle cx="11" cy="11" r="11" fill="#D02028"/>
    <path d="M6 11.5L10 15L16 8.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const sectionCardFirst = (title, desc, img, link, linkText) => (
  <div className="card shadow-sm mb-4 border-0" style={{borderRadius:16, padding:'32px 32px 32px 32px'}}>
    <div className="scp-hero-row">
      <div className="scp-hero-content">
        <h2 className="fw-bold mb-3" style={{fontSize:'2.1rem', lineHeight:'1.2', color:'#D02028', textAlign:'left', wordBreak:'break-word'}}>{title}</h2>
        <div className="mb-4" style={{fontSize:'1.25rem', color:'#222', textAlign:'left'}}>{desc}</div>
        <button type="button" className="btn btn-danger fw-semibold px-4 py-2" style={{borderRadius:10, fontSize:'1.1rem', alignSelf:'flex-start'}}>{linkText}</button>
      </div>
      <div className="scp-hero-img">
        <img src={img} alt="section-img" style={{maxWidth:'100%',height:'auto',borderRadius:12,boxShadow:'0 2px 12px rgba(0,0,0,0.07)'}} />
      </div>
    </div>
  </div>
);

const sectionCard = (title, desc, img, link, linkText) => (
  <div className="card shadow-sm mb-4 border-0" style={{borderRadius:16, padding:'32px 24px', minHeight:220}}>
    <div style={{display:'flex',flexDirection:'row',alignItems:'center',gap:32,flexWrap:'wrap'}} className="scp-section-row">
      <div style={{flex:'1 1 0',minWidth:0}}>
        <h2 className="text-danger fw-bold mb-3" style={{fontSize:'2.1rem', lineHeight:'1.2', textAlign:'left'}}>{title}</h2>
        {desc && <div className="mb-4" style={{fontSize:'1.25rem', color:'#222', textAlign:'left'}}>{desc}</div>}
        <button type="button" className="btn btn-danger fw-semibold px-4 py-2" style={{borderRadius:10, fontSize:'1.1rem', alignSelf:'flex-start'}}>{linkText}</button>
      </div>
      <div style={{flex:'0 0 380px',maxWidth:380,minWidth:220,display:'flex',alignItems:'center',justifyContent:'flex-end'}}>
        <div style={{width:'100%',aspectRatio:'16/9',background:'#fff',borderRadius:14,overflow:'hidden',boxShadow:'0 2px 12px rgba(0,0,0,0.07)'}}>
          <img src={img} alt="section-img" style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:14}} />
        </div>
      </div>
    </div>
  </div>
);

const SupportCenterPage = () => {
  React.useEffect(() => {
    // Add Roboto font
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    document.body.style.fontFamily = 'Roboto, Arial, sans-serif';
    return () => { document.body.style.fontFamily = ''; };
  }, []);

  return (
    <div className="support-center-page bg-light" style={{minHeight:'100vh'}}>
      {/* Header section */}
      <div className="position-relative scp-hero-header"
           style={{ background: "url('/uploads/chotdeal.png') center/cover no-repeat" }}>
        <div className="position-absolute top-0 start-0 w-100 h-100 scp-hero-overlay"></div>
        <div className="container h-100 position-relative d-flex flex-row justify-content-between align-items-center scp-hero-container">
          <div className="scp-hero-left text-white" style={{zIndex:2, maxWidth: '50%', minWidth: 320}}>
            <h1 className="fw-bold mb-4" style={{fontSize: '2.2rem',textShadow:'0 2px 8px rgba(0,0,0,0.15)'}}>Bạn đã sẵn sàng Đăng ký nhà hàng hợp tác với DinerChill?</h1>
            <div className="d-flex gap-2 flex-wrap">
              <a href="https://forms.gle/BAjrYL1qVeAE3Xbc7" target="_blank" rel="noopener noreferrer" className="btn btn-light fw-semibold px-4 py-2 shadow-sm" style={{borderRadius:8,transition:'0.2s'}} >Tôi muốn Đăng ký hợp tác!</a>
              <Link to="/bang-gia" className="btn btn-outline-light fw-semibold px-4 py-2 shadow-sm" style={{borderRadius:8,transition:'0.2s'}}>Tôi muốn xem báo giá!</Link>
            </div>
          </div>
        </div>
        <div className="scp-hero-bg-img"></div>
      </div>

      {/* Main content */}
      <div className="container py-4" style={{maxWidth: 1100}}>
        {/* Section 1 */}
        {sectionCardFirst(
          'Bạn muốn thu hút thêm khách hàng đặt chỗ trực tuyến từ nền tảng DinerChill?',
          'Mời bạn cùng DinerChill khám phá ba yếu tố quan trọng có thể giúp bạn làm điều đó hiệu quả!',
          '/uploads/anh1.png',
          'https://pasgo.vn/blog/ba-yeu-to-quan-trong-de-khai-thac-hieu-qua-pasgo-cho-nha-hang-5717',
          'Xem ngay!'
        )}
        {/* Section 2 */}
        {sectionCard(
          'Chi phí trả cho nền tảng đặt chỗ nói chung và cho DinerChill có hợp lý không?',
          '',
          '/uploads/anh2.png',
          'https://pasgo.vn/blog/so-sanh-ve-chi-phi-nha-hang-su-dung-pasgo-so-voi-tu-lam-web-app-5715',
          'Xem ngay!'
        )}
        {/* Section 3 */}
        {sectionCard(
          'Vì sao nhà hàng nên chuyển đổi số và cung cấp dịch vụ đặt chỗ trực tuyến ngay?',
          '',
          '/uploads/anh3.png',
          'https://pasgo.vn/blog/tai-sao-nha-hang-nen-chuyen-doi-so-va-cung-cap-dich-vu-dat-cho-truc-tuyen-5712',
          'Tìm hiểu ngay!'
        )}
        {/* Section 4: Solutions */}
        <div className="scp-card">
          <div className="scp-title">Các giải pháp của nền tảng đặt chỗ DinerChill</div>
          <div className="scp-desc">DinerChill vừa tạo ra cộng đồng hàng triệu thực khách có nhu cầu đi ăn nhà hàng trung và cao cấp thường xuyên, đồng thời DinerChill cũng tập trung xây dựng nên phần mềm nền tảng có các công cụ, các giải pháp nhằm tăng khả năng kết nối nhà hàng với thực khách trực tuyến, quản lý sản phẩm và tài nguyên bán, quản lý chỗ ngồi, tích hợp sẵn công cụ truyền thông và tiếp thị cho nhà hàng. Dưới đây là tóm tắt về 8 giải pháp của DinerChill dành cho nhà hàng, mời bạn tìm hiểu!</div>
          <div className="scp-solutions">
            <div className="scp-solutions-col">
              <div className="scp-sol-title">1. Công cụ chuyển đổi số</div>
              <div className="scp-sol-desc">Tạo Gian hàng trực tuyến, với hồ sơ có thể cá nhân hóa</div>
            </div>
            <div className="scp-solutions-col">
              <div className="scp-sol-title">2. Công cụ truyền thông và kết nối</div>
              <div className="scp-sol-desc">Công nghệ giúp tạo ra sự kết hợp tuyệt vời này</div>
            </div>
            <div className="scp-solutions-col">
              <div className="scp-sol-title">3. Công cụ Marketing</div>
              <div className="scp-sol-desc">Định vị nhà hàng và khách hàng mục tiêu</div>
            </div>
            <div className="scp-solutions-col">
              <div className="scp-sol-title">4. Công cụ bán hàng với dịch vụ đặt chỗ trực tuyến</div>
              <div className="scp-sol-desc">Bán hàng sớm hơn mọi lúc, mọi nơi</div>
            </div>
            <div className="scp-solutions-col">
              <div className="scp-sol-title">5. Công cụ quản lý chỗ ngồi và tối ưu lấp đầy chỗ trống</div>
              <div className="scp-sol-desc">Biến những điều ai cũng hiểu thành hiện thực</div>
            </div>
            <div className="scp-solutions-col">
              <div className="scp-sol-title">6. Công cụ số hóa và tạo sản phẩm tốt</div>
              <div className="scp-sol-desc">Một trợ lý đầy tiềm năng, đáng giá và hiếm thấy</div>
            </div>
            <div className="scp-solutions-col">
              <div className="scp-sol-title">7. Công cụ giám sát và điều tiết lúc đông khách</div>
              <div className="scp-sol-desc">Khó thực hiện nếu không có công cụ phần mềm</div>
            </div>
            <div className="scp-solutions-col">
              <div className="scp-sol-title">8. Công cụ cập nhật và sửa đổi gian hàng</div>
              <div className="scp-sol-desc">Duy trì sự tươi mới và hấp dẫn dễ dàng hơn</div>
            </div>
          </div>
          <div className="scp-sol-link" style={{color:'#D02028', fontWeight:500, cursor:'default', textDecoration:'none'}}>Khám phá chi tiết các giải pháp của DinerChill</div>
        </div>
        {/* Section 5: Service Packages */}
        <div className="scp-card">
          <div className="scp-title text-center">Các gói dịch vụ của DinerChill</div>
          <div className="scp-desc text-center">Bạn đã sẵn sàng để lựa chọn gói dịch vụ phù hợp nhà hàng của mình? Cảm ơn bạn, chúng tôi tin rằng đây là một quyết định đúng đắn dành cho bạn, mời bạn tìm hiểu và lựa chọn ngay. Dưới đây là 3 gói dịch vụ của DinerChill!</div>
          <div className="scp-service-packages">
            <div className="scp-service-package">
              <div className="fw-bold" style={{fontSize:'1.1rem'}}>Gói bắt đầu</div>
              <div>Thêm kênh bán hàng, khai thác cộng đồng thực khách trên DinerChill, khai thác nền tảng chuyên về dịch vụ đặt chỗ trước khi đến để Nhà hàng có thêm khách.</div>
              <div className="fw-medium mt-2" style={{color:'#D02028'}}>Miễn phí/Mỗi tháng</div>
            </div>
            <div className="scp-service-package">
              <div className="fw-bold" style={{fontSize:'1.1rem'}}>Gói cơ bản</div>
              <div>Không chỉ giúp bạn có thêm khách hàng, bạn có thể tự mình tối ưu sản phẩm, dịch vụ, tối ưu điều hành nhà hàng của bạn dễ hơn. Phần mềm giúp bạn quản lý hiệu quả kinh doanh.</div>
              <div className="fw-medium mt-2" style={{color:'#D02028'}}>Từ 299k/Mỗi tháng</div>
            </div>
            <div className="scp-service-package">
              <div className="fw-bold" style={{fontSize:'1.1rem'}}>Gói cốt lõi</div>
              <div>Một giải pháp gần như hoàn chỉnh nhất để bạn xây dựng nhà hàng của mình kinh doanh không chỉ đông khách hơn mà còn hoạt động hiệu quả, hiệu suất, ổn định.</div>
              <div className="fw-medium mt-2" style={{color:'#D02028'}}>Từ 999k/Mỗi tháng</div>
            </div>
          </div>
          <div className="table-responsive mt-4">
            <table className="scp-service-table" style={{width:'100%'}}>
              <thead>
                <tr>
                  <th>Tác vụ</th>
                  <th>Gói bắt đầu</th>
                  <th>Gói cơ bản</th>
                  <th>Gói cốt lõi</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Cài đặt Tên Gian hàng</td>
                  <td className="scp-tick">✔</td>
                  <td className="scp-tick">✔</td>
                  <td className="scp-tick">✔</td>
                </tr>
                <tr>
                  <td>Chọn Thị trường</td>
                  <td className="scp-tick">✔</td>
                  <td className="scp-tick">✔</td>
                  <td className="scp-tick">✔</td>
                </tr>
                <tr>
                  <td>Chọn ngành Kinh doanh</td>
                  <td className="scp-tick">✔</td>
                  <td className="scp-tick">✔</td>
                  <td className="scp-tick">✔</td>
                </tr>
                <tr>
                  <td>Địa chỉ Gian hàng</td>
                  <td className="scp-tick">✔</td>
                  <td className="scp-tick">✔</td>
                  <td className="scp-tick">✔</td>
                </tr>
                <tr>
                  <td>Địa chỉ bản đồ</td>
                  <td className="scp-tick">✔</td>
                  <td className="scp-tick">✔</td>
                  <td className="scp-tick">✔</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="text-center mt-2">
            <a href="http://localhost:3000/bang-gia" className="scp-sol-link" style={{color:'#D02028', fontWeight:500, textDecoration:'underline'}}>Xem chi tiết Bảng tác vụ &amp; Báo giá</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportCenterPage;