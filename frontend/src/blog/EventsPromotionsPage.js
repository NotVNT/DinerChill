import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/blog/BlogLatestNews.css';

// Function to format date to "DD/MM/YYYY" format
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
};

// Get current date in formatted string
const getCurrentDate = () => {
  const today = new Date();
  return formatDate(today);
};

function EventsPromotionsPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Sự Kiện & Khuyến Mãi - DinerChill";
  }, []);

  // Current date for the main article
  const currentDate = getCurrentDate();

  // Sample data for promotion articles
  const promotionArticles = [
    {
      id: 101,
      title: "Mùa Hè Rực Rỡ: Giảm 30% Cho Món Hải Sản Tại Chuỗi Nhà Hàng Ocean Palace",
      excerpt: "Chương trình khuyến mãi mùa hè tại Ocean Palace với ưu đãi đặc biệt dành cho thực khách yêu thích hải sản. Áp dụng từ 01/06 đến 31/08/2023.",
      date: "01/06/2023",
      author: "Minh Tâm",
      image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=1000&auto=format&fit=crop",
      expires: "31/08/2023",
      category: "Khuyến mãi"
    },
    {
      id: 102,
      title: "Tiệc Buffet BBQ Cuối Tuần: Mua 3 Tặng 1 Tại Sài Gòn BBQ Garden",
      excerpt: "Cơ hội thưởng thức tiệc buffet BBQ cuối tuần với ưu đãi hấp dẫn khi đi nhóm 4 người. Đặt bàn trước để nhận thêm ưu đãi đồ uống.",
      date: "15/05/2023",
      author: "Quang Huy",
      image: "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?q=80&w=1000&auto=format&fit=crop",
      expires: "31/12/2023",
      category: "Khuyến mãi"
    },
    {
      id: 103,
      title: "Lễ Hội Ẩm Thực Châu Á: 50 Gian Hàng Tại Công Viên 23/9",
      excerpt: "Sự kiện ẩm thực lớn nhất năm với sự tham gia của các đầu bếp nổi tiếng và nhà hàng hàng đầu từ nhiều quốc gia châu Á.",
      date: "10/05/2023",
      author: "Thu Hà",
      image: "https://images.unsplash.com/photo-1519077336050-4ca5cac9d64f?q=80&w=1000&auto=format&fit=crop",
      startDate: "15/07/2023",
      endDate: "30/07/2023",
      category: "Sự kiện"
    },
    {
      id: 104,
      title: "Đêm Nhạc Acoustic & Ẩm Thực: Tối Thứ Sáu Tại La Cuisine",
      excerpt: "Thưởng thức âm nhạc acoustic sống động cùng ưu đãi giảm 20% tổng hóa đơn cho thực khách đặt bàn trước qua DinerChill.",
      date: "08/05/2023",
      author: "Ngọc Mai",
      image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1000&auto=format&fit=crop",
      recurrence: "Mỗi tối thứ Sáu",
      category: "Sự kiện"
    },
    {
      id: 105,
      title: "Flash Sale 12h: Đặt Bàn Qua DinerChill - Ưu Đãi Đến 50%",
      excerpt: "Chỉ trong 12 giờ duy nhất, đặt bàn qua DinerChill sẽ nhận được ưu đãi lên đến 50% tại hơn 100 nhà hàng đối tác khắp thành phố.",
      date: "05/05/2023",
      author: "Thành Trung",
      image: "https://images.unsplash.com/photo-1577004686904-1a4f118e2b9e?q=80&w=1000&auto=format&fit=crop",
      flashDate: "10/05/2023",
      category: "Khuyến mãi"
    },
    {
      id: 106,
      title: "Lớp Học Làm Bánh Trung Thu Cùng Đầu Bếp 5 Sao",
      excerpt: "Trải nghiệm làm bánh Trung thu truyền thống cùng đầu bếp từng đoạt giải thưởng quốc tế tại nhà hàng Le Monde.",
      date: "01/05/2023",
      author: "Hồng Loan",
      image: "https://images.unsplash.com/photo-1567337710282-00832b415979?q=80&w=1000&auto=format&fit=crop",
      eventDate: "15/08/2023",
      category: "Sự kiện"
    }
  ];

  return (
    <div className="blog-latest-news-container">
      <div className="blog-header">
        <h1>Sự Kiện & Khuyến Mãi</h1>
        <p>Cập nhật những sự kiện hấp dẫn và ưu đãi đặc biệt từ các nhà hàng đối tác</p>
      </div>

      <article className="blog-featured-article">
        <img 
          src="https://images.unsplash.com/photo-1571091718767-18b5b1457add?q=80&w=1000&auto=format&fit=crop" 
          alt="Lễ Hội Ẩm Thực Quốc Tế: Hơn 20 Quốc Gia Tham Dự Tại TPHCM" 
          className="blog-featured-image"
        />
        <div className="blog-featured-content">
          <h2 className="blog-featured-title">Lễ Hội Ẩm Thực Quốc Tế: Hơn 20 Quốc Gia Tham Dự Tại TPHCM</h2>
          <div className="blog-featured-meta">
            <span><i className="fa fa-calendar"></i> {currentDate}</span>
            <span><i className="fa fa-user"></i> Admin</span>
            <span><i className="fa fa-comment"></i> 0 bình luận</span>
            <span><i className="fa fa-tag"></i> Sự kiện</span>
          </div>
          <div className="blog-featured-excerpt">
            <p>Thành phố Hồ Chí Minh, {currentDate} – Sự kiện ẩm thực lớn nhất năm 2023 sắp diễn ra tại Nhà Văn hóa Thanh niên TP.HCM vào cuối tháng này. Lễ hội ẩm thực quốc tế sẽ quy tụ hơn 20 quốc gia với hơn 100 gian hàng, mang đến cho người tham dự trải nghiệm ẩm thực đa dạng từ khắp nơi trên thế giới.</p>
            <p>Lễ hội không chỉ trưng bày và phục vụ các món ăn đặc trưng từ nhiều nền ẩm thực, mà còn có các buổi trình diễn nấu ăn trực tiếp từ các đầu bếp nổi tiếng, workshop chia sẻ bí quyết nấu ăn, và các hoạt động văn hóa đặc sắc.</p>
            <p>Đặc biệt, thông qua đối tác DinerChill, thực khách có thể đặt trước vé tham dự với nhiều ưu đãi hấp dẫn, bao gồm giảm 20% giá vé và phiếu thưởng thức món ăn miễn phí tại 5 gian hàng tùy chọn trong lễ hội.</p>
          </div>
          <Link to="/blog/le-hoi-am-thuc-quoc-te" className="blog-featured-link">Đọc tiếp</Link>
        </div>
      </article>

      <div className="blog-search-container">
        <input type="text" placeholder="Tìm kiếm sự kiện, khuyến mãi..." className="blog-search-input" />
        <button className="blog-search-button">Tìm kiếm</button>
      </div>

      <div className="blog-categories">
        <h3>Danh mục</h3>
        <div className="blog-categories-tags">
          <Link to="/blog/su-kien-khuyen-mai?category=all" className="blog-category-tag active">Tất cả</Link>
          <Link to="/blog/su-kien-khuyen-mai?category=events" className="blog-category-tag">Sự kiện</Link>
          <Link to="/blog/su-kien-khuyen-mai?category=promotions" className="blog-category-tag">Khuyến mãi</Link>
          <Link to="/blog/su-kien-khuyen-mai?category=seasonal" className="blog-category-tag">Mùa lễ hội</Link>
          <Link to="/blog/su-kien-khuyen-mai?category=new" className="blog-category-tag">Nhà hàng mới</Link>
        </div>
      </div>

      <h2>Sự Kiện & Ưu Đãi Đang Diễn Ra</h2>
      <div className="blog-grid">
        {promotionArticles.map(article => (
          <div key={article.id} className="blog-card">
            <img 
              src={article.image} 
              alt={article.title} 
              className="blog-card-image"
            />
            <div className="blog-card-content">
              <h3 className="blog-card-title">{article.title}</h3>
              <div className="blog-card-meta">
                <span><i className="fa fa-calendar"></i> {article.date}</span>
                <span><i className="fa fa-user"></i> {article.author}</span>
                <span><i className="fa fa-tag"></i> {article.category}</span>
                {article.expires && (
                  <span><i className="fa fa-clock-o"></i> Hết hạn: {article.expires}</span>
                )}
                {article.eventDate && (
                  <span><i className="fa fa-clock-o"></i> Ngày: {article.eventDate}</span>
                )}
                {article.startDate && (
                  <span><i className="fa fa-clock-o"></i> {article.startDate} - {article.endDate}</span>
                )}
                {article.recurrence && (
                  <span><i className="fa fa-repeat"></i> {article.recurrence}</span>
                )}
                {article.flashDate && (
                  <span><i className="fa fa-bolt"></i> Ngày: {article.flashDate}</span>
                )}
              </div>
              <p className="blog-card-excerpt">{article.excerpt}</p>
              <Link to={`/blog/su-kien-khuyen-mai/${article.id}`} className="blog-card-link">Xem chi tiết</Link>
            </div>
          </div>
        ))}
      </div>

      <div className="blog-newsletter">
        <h3>Đăng Ký Nhận Thông Báo Ưu Đãi</h3>
        <p>Nhận thông báo về các sự kiện mới và ưu đãi đặc biệt trực tiếp vào email của bạn</p>
        <form className="blog-newsletter-form">
          <input 
            type="email" 
            placeholder="Email của bạn" 
            className="blog-newsletter-input" 
            required
          />
          <button type="submit" className="blog-newsletter-button">Đăng Ký</button>
        </form>
      </div>

      <div className="blog-pagination">
        <button className="blog-pagination-button active">1</button>
        <button className="blog-pagination-button">2</button>
        <button className="blog-pagination-button">3</button>
        <button className="blog-pagination-button">
          <i className="fa fa-angle-right"></i>
        </button>
      </div>
    </div>
  );
}

export default EventsPromotionsPage; 