import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/blog/BlogLatestNews.css';

// Function to format date to "DD/MM/YYYY" format
// eslint-disable-next-line no-unused-vars
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
};

function FoodBusinessPage() {
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Kinh doanh ăn uống - DinerChill";
  }, []);

  // Sample data for featured business article
  const featuredBusinessArticle = {
    id: 1,
    title: "Những bí quyết thành công khi kinh doanh nhà hàng năm 2024",
    excerpt: "Thị trường kinh doanh nhà hàng ngày càng cạnh tranh khốc liệt. Bài viết này chia sẻ những bí quyết giúp nhà hàng của bạn nổi bật và thu hút khách hàng trong năm 2024, từ xây dựng thương hiệu đến ứng dụng công nghệ hiện đại.",
    date: "15/05/2024",
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=1000&auto=format&fit=crop",
    link: "/blog/kinh-doanh-an-uong/bi-quyet-thanh-cong-kinh-doanh-nha-hang-2024"
  };

  // Sample data for food business articles
  const foodBusinessArticles = [
    {
      id: 2,
      title: "5 Mô hình kinh doanh ăn uống lợi nhuận cao cho người mới bắt đầu",
      excerpt: "Bạn đang muốn khởi nghiệp trong lĩnh vực ăn uống nhưng chưa biết bắt đầu từ đâu? Bài viết này phân tích 5 mô hình kinh doanh ăn uống hiệu quả, ít vốn, phù hợp cho người mới và mang lại lợi nhuận cao trong năm 2024.",
      date: "10/04/2024",
      image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1000&auto=format&fit=crop",
      category: "Khởi nghiệp"
    },
    {
      id: 3,
      title: "Chiến lược marketing hiệu quả cho nhà hàng trong thời đại số",
      excerpt: "Công nghệ số đang thay đổi cách khách hàng tìm kiếm và trải nghiệm dịch vụ ăn uống. Khám phá những chiến lược marketing hiệu quả giúp nhà hàng của bạn tiếp cận đúng khách hàng mục tiêu và tăng doanh thu.",
      date: "05/03/2024",
      image: "https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?q=80&w=1000&auto=format&fit=crop",
      category: "Marketing"
    },
    {
      id: 4,
      title: "Quản lý nhân sự hiệu quả trong kinh doanh nhà hàng",
      excerpt: "Nhân sự luôn là yếu tố then chốt quyết định thành công của một nhà hàng. Bài viết cung cấp các phương pháp tuyển dụng, đào tạo và giữ chân nhân viên giỏi, xây dựng đội ngũ chuyên nghiệp cho nhà hàng của bạn.",
      date: "22/02/2024",
      image: "https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?q=80&w=1000&auto=format&fit=crop",
      category: "Quản lý nhân sự"
    },
    {
      id: 5,
      title: "Ứng dụng công nghệ vào quản lý nhà hàng: Từ POS đến đặt bàn online",
      excerpt: "Công nghệ đang thay đổi cách vận hành của nhà hàng. Tìm hiểu cách ứng dụng các giải pháp công nghệ từ hệ thống POS, phần mềm quản lý đến nền tảng đặt bàn online để tối ưu hóa hoạt động và tăng trải nghiệm khách hàng.",
      date: "15/01/2024",
      image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=1000&auto=format&fit=crop",
      category: "Công nghệ"
    },
    {
      id: 6,
      title: "Thiết kế thực đơn thu hút và tối ưu lợi nhuận cho nhà hàng",
      excerpt: "Thực đơn không chỉ là danh sách món ăn mà còn là công cụ marketing và tối ưu lợi nhuận hiệu quả. Bài viết hướng dẫn cách thiết kế thực đơn thu hút, cân bằng giữa chi phí và giá bán, tăng doanh thu cho nhà hàng.",
      date: "08/12/2023",
      image: "https://images.unsplash.com/photo-1551218808-94e220e084d2?q=80&w=1000&auto=format&fit=crop",
      category: "Quản lý vận hành"
    },
    {
      id: 7,
      title: "Các xu hướng ẩm thực được ưa chuộng năm 2024 - Cơ hội cho nhà hàng",
      excerpt: "Nắm bắt xu hướng ẩm thực là chìa khóa để nhà hàng luôn tươi mới và thu hút khách hàng. Bài viết phân tích các xu hướng ẩm thực đang được ưa chuộng trong năm 2024 và cách nhà hàng có thể áp dụng vào kinh doanh.",
      date: "30/11/2023",
      image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1000&auto=format&fit=crop",
      category: "Xu hướng"
    }
  ];

  // Filter articles based on search term
  const filteredArticles = foodBusinessArticles.filter(article => 
    article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Categories for quick links
  const categories = [
    { name: "Kinh nghiệm mở quán", link: "/blog/kinh-nghiem-mo-quan" },
    { name: "Văn khán thần tài phong thủy", link: "/blog/van-khan-than-tai" },
    { name: "Quản lý nhà hàng", link: "/blog/quan-ly-nha-hang" },
    { name: "Mẹo vặt gia đình", link: "/blog/meo-vat-gia-dinh" },
    { name: "Công thức các món ăn giải ngày", link: "/blog/cong-thuc-mon-an" },
    { name: "Công thức hot", link: "/blog/cong-thuc-hot" },
    { name: "Thực đơn hàng ngày", link: "/blog/thuc-don-hang-ngay" },
    { name: "Món ngon mỗi ngày", link: "/blog/mon-ngon-moi-ngay" },
    { name: "Kiến thức nhà hàng", link: "/blog/kien-thuc-nha-hang" }
  ];

  return (
    <div className="blog-latest-news-container">
      <div className="blog-header">
        <h1>Kinh Doanh Ăn Uống</h1>
        <p>Các kiến thức, kinh nghiệm kinh doanh và quản lý nhà hàng hiệu quả</p>
      </div>

      {/* Search bar */}
      <div className="blog-search-container">
        <input 
          type="text" 
          placeholder="Tìm kiếm bài viết..." 
          className="blog-search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className="blog-search-button">
          <i className="fa fa-search"></i> Tìm kiếm
        </button>
      </div>

      {/* Quick links categories */}
      <div className="blog-categories">
        <h3>Chuyên mục:</h3>
        <div className="blog-categories-tags">
          {categories.map((category, index) => (
            <Link key={index} to={category.link} className="blog-category-tag">
              {category.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Featured business article */}
      <article className="blog-featured-article">
        <img 
          src={featuredBusinessArticle.image} 
          alt={featuredBusinessArticle.title} 
          className="blog-featured-image"
        />
        <div className="blog-featured-content">
          <h2 className="blog-featured-title">{featuredBusinessArticle.title}</h2>
          <div className="blog-featured-meta">
            <span><i className="fa fa-calendar"></i> {featuredBusinessArticle.date}</span>
            <span><i className="fa fa-tag"></i> Kinh doanh</span>
          </div>
          <div className="blog-featured-excerpt">
            <p>{featuredBusinessArticle.excerpt}</p>
          </div>
          <Link to={featuredBusinessArticle.link} className="blog-featured-link">Xem Ngay!</Link>
        </div>
      </article>

      <h2>Bài Blog đang HOT</h2>

      {/* Business articles list */}
      <div className="blog-grid">
        {filteredArticles.map(article => (
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
                <span><i className="fa fa-tag"></i> {article.category}</span>
              </div>
              <p className="blog-card-excerpt">{article.excerpt}</p>
              <Link to={`/blog/kinh-doanh-an-uong/${article.id}`} className="blog-card-link">Đọc tiếp</Link>
            </div>
          </div>
        ))}
      </div>

      {/* Newsletter signup */}
      <div className="blog-newsletter">
        <h3>Đăng Ký Nhận Bản Tin</h3>
        <p>Nhận thông tin kinh doanh ăn uống mới nhất và các mẹo quản lý nhà hàng hiệu quả</p>
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

      {/* Pagination */}
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

export default FoodBusinessPage; 