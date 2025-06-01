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

function LatestNewsPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Tin tức mới nhất - DinerChill";
  }, []);

  // Current date for the main article
  const currentDate = getCurrentDate();

  // Sample data for recent articles
  const recentArticles = [
    {
      id: 2,
      title: "Top 5 Nhà Hàng Hải Sản Được Yêu Thích Nhất Tại Sài Gòn",
      excerpt: "Khám phá những địa điểm hải sản tuyệt vời nhất tại Sài Gòn, từ những quán bình dân đến nhà hàng sang trọng, đều mang đến trải nghiệm ẩm thực khó quên.",
      date: "15/06/2023",
      author: "Minh Tuấn",
      image: "https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?q=80&w=1000&auto=format&fit=crop"
    },
    {
      id: 3,
      title: "Khám Phá Văn Hóa Ẩm Thực Đường Phố Việt Nam",
      excerpt: "Hành trình khám phá nét đẹp văn hóa ẩm thực đường phố Việt Nam, từ Bắc chí Nam với những món ăn đặc trưng của từng vùng miền.",
      date: "08/06/2023",
      author: "Thanh Hà",
      image: "https://images.unsplash.com/photo-1508359749517-84cee28cb298?q=80&w=1000&auto=format&fit=crop"
    },
    {
      id: 4,
      title: "Nghệ Thuật Plating: Khi Món Ăn Trở Thành Tác Phẩm Nghệ Thuật",
      excerpt: "Nghệ thuật trình bày món ăn không chỉ làm tăng giá trị thẩm mỹ mà còn làm phong phú trải nghiệm thưởng thức của thực khách.",
      date: "01/06/2023",
      author: "Quốc Anh",
      image: "https://images.unsplash.com/photo-1607013251379-e6eecfffe234?q=80&w=1000&auto=format&fit=crop"
    },
    {
      id: 5,
      title: "Xu Hướng Ẩm Thực Bền Vững: Nhà Hàng Xanh Tại Việt Nam",
      excerpt: "Nhà hàng xanh đang trở thành xu hướng mới tại Việt Nam, góp phần vào việc bảo vệ môi trường và phát triển bền vững.",
      date: "25/05/2023",
      author: "Hồng Nhung",
      image: "https://images.unsplash.com/photo-1572715376701-98568319fd0b?q=80&w=1000&auto=format&fit=crop"
    },
    {
      id: 6,
      title: "Những Món Ăn Việt Nam Được Yêu Thích Nhất Trên Thế Giới",
      excerpt: "Phở, bánh mì, gỏi cuốn... không chỉ nổi tiếng trong nước mà còn được yêu thích trên khắp thế giới, khẳng định vị thế của ẩm thực Việt.",
      date: "18/05/2023",
      author: "Huy Hoàng",
      image: "https://images.unsplash.com/photo-1562158728-09192098ea6e?q=80&w=1000&auto=format&fit=crop"
    },
    {
      id: 7,
      title: "Nghệ Thuật Nấu Ăn Của Đầu Bếp Michelin Star Đầu Tiên Của Việt Nam",
      excerpt: "Câu chuyện về hành trình vươn tới vị trí đầu bếp Michelin Star đầu tiên của Việt Nam và những bí quyết thành công.",
      date: "10/05/2023",
      author: "Minh Châu",
      image: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?q=80&w=1000&auto=format&fit=crop"
    }
  ];

  return (
    <div className="blog-latest-news-container">
      <div className="blog-header">
        <h1>Tin Tức Mới Nhất</h1>
        <p>Cập nhật những tin tức mới nhất về ẩm thực, nhà hàng và công nghệ đặt bàn</p>
      </div>

      <article className="blog-featured-article">
        <img 
          src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=1000&auto=format&fit=crop" 
          alt="DinerChill Ra Mắt: Nền Tảng Đặt Bàn Nhà Hàng Trực Tuyến Đột Phá Tại Việt Nam" 
          className="blog-featured-image"
        />
        <div className="blog-featured-content">
          <h2 className="blog-featured-title">DinerChill Ra Mắt: Nền Tảng Đặt Bàn Nhà Hàng Trực Tuyến Đột Phá Tại Việt Nam</h2>
          <div className="blog-featured-meta">
            <span><i className="fa fa-calendar"></i> {currentDate}</span>
            <span><i className="fa fa-user"></i> Admin</span>
            <span><i className="fa fa-comment"></i> 0 bình luận</span>
          </div>
          <div className="blog-featured-excerpt">
            <p>Thành phố Hồ Chí Minh, {currentDate} – Thị trường ẩm thực Việt Nam vừa chào đón một "người chơi" mới đầy tiềm năng: DinerChill, website đặt bàn nhà hàng trực tuyến được kỳ vọng sẽ thay đổi cách thực khách tìm kiếm và trải nghiệm các địa điểm ăn uống. Với giao diện thân thiện, tính năng đa dạng và danh sách nhà hàng phong phú, DinerChill hứa hẹn mang đến sự tiện lợi tối đa cho người dùng và hỗ trợ hiệu quả cho các nhà hàng đối tác.</p>
            <p>DinerChill được xây dựng với mục tiêu đơn giản hóa quy trình đặt bàn nhà hàng, giúp thực khách dễ dàng tìm kiếm và đặt chỗ tại các địa điểm phù hợp với sở thích và nhu cầu của mình. Ngay từ trang chủ, người dùng có thể nhanh chóng tìm kiếm nhà hàng theo địa điểm, loại hình ẩm thực, và nhiều tiêu chí khác.</p>
            <p>Không chỉ là một nền tảng cho thực khách, DinerChill còn là công cụ mạnh mẽ hỗ trợ các nhà hàng trong việc quản lý đặt chỗ và tiếp cận khách hàng tiềm năng. Các nhà hàng đối tác có thể tăng cường khả năng hiển thị, quản lý đặt chỗ hiệu quả, và tiếp cận lượng lớn khách hàng.</p>
          </div>
          <Link to="/blog/dinerchill-ra-mat" className="blog-featured-link">Đọc tiếp</Link>
        </div>
      </article>

      <h2>Bài Viết Gần Đây</h2>
      <div className="blog-grid">
        {recentArticles.map(article => (
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
              </div>
              <p className="blog-card-excerpt">{article.excerpt}</p>
              <Link to={`/blog/article/${article.id}`} className="blog-card-link">Đọc tiếp</Link>
            </div>
          </div>
        ))}
      </div>

      <div className="blog-newsletter">
        <h3>Đăng Ký Nhận Bản Tin</h3>
        <p>Nhận những tin tức mới nhất về ẩm thực và ưu đãi đặc biệt từ DinerChill</p>
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

export default LatestNewsPage; 