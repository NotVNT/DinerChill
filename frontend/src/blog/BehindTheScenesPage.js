import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/blog/BlogLatestNews.css';

// Function to format date to "DD/MM/YYYY" format
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
};

function BehindTheScenesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Hậu Trường Nhà Hàng - DinerChill";
  }, []);

  // Sample data for featured behind the scenes article
  const featuredArticle = {
    id: 1,
    title: "Một ngày làm việc của đầu bếp tại nhà hàng 5 sao Gourmet Palace",
    address: "196 Nguyễn Thái Học, Quận 1, TP.HCM",
    excerpt: "Khám phá nhịp sống hối hả trong căn bếp của một nhà hàng 5 sao nổi tiếng tại Sài Gòn. Từ 4 giờ sáng đến tận khuya, các đầu bếp đứng sau những món ăn tuyệt hảo phải trải qua những thử thách gì? Cùng DinerChill khám phá hành trình từ nguyên liệu thô đến những tác phẩm nghệ thuật ẩm thực trên bàn ăn.",
    date: "05/10/2024",
    image: "https://images.unsplash.com/photo-1577106263724-2c8e03bfe9cf?q=80&w=1000&auto=format&fit=crop",
    link: "/blog/hau-truong-nha-hang/dau-bep-nha-hang-5-sao"
  };

  // Sample data for behind the scenes articles
  const behindTheScenesArticles = [
    {
      id: 2,
      title: "Bí mật nguyên liệu của nhà hàng hải sản Biển Xanh",
      excerpt: "Cùng đi chợ với đầu bếp trưởng nhà hàng Biển Xanh từ 3 giờ sáng để tìm hiểu cách chọn hải sản tươi ngon nhất. Những bí quyết chọn mua, bảo quản và sơ chế hải sản mà các đầu bếp chuyên nghiệp áp dụng hàng ngày.",
      date: "30/09/2024",
      image: "https://images.unsplash.com/photo-1579113800032-c38bd7635818?q=80&w=1000&auto=format&fit=crop",
      location: "Vũng Tàu",
      tags: ["Hải sản", "Nguyên liệu", "Chợ đầu mối"]
    },
    {
      id: 3,
      title: "Công nghệ bếp hiện đại tại chuỗi nhà hàng FastGourmet",
      excerpt: "Khám phá hệ thống bếp trị giá hàng tỷ đồng tại chuỗi nhà hàng FastGourmet. Từ lò nướng thông minh đến robot hỗ trợ, công nghệ đang thay đổi cách vận hành của các nhà hàng hiện đại như thế nào?",
      date: "22/09/2024",
      image: "https://images.unsplash.com/photo-1581299894341-367e6517569c?q=80&w=1000&auto=format&fit=crop",
      location: "Hà Nội",
      tags: ["Công nghệ", "Bếp hiện đại", "Robot"]
    },
    {
      id: 4,
      title: "Quản lý nhân sự trong nhà hàng: Thách thức và giải pháp",
      excerpt: "Phỏng vấn các quản lý nhà hàng về những thách thức trong việc tuyển dụng, đào tạo và giữ chân nhân viên giỏi. Làm thế nào để xây dựng một đội ngũ nhân viên chuyên nghiệp, tận tâm trong môi trường nhà hàng?",
      date: "15/09/2024",
      image: "https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?q=80&w=1000&auto=format&fit=crop",
      location: "TP.HCM",
      tags: ["Nhân sự", "Quản lý", "Đào tạo"]
    },
    {
      id: 5,
      title: "Hậu trường quản lý kho và chuỗi cung ứng tại Veggie House",
      excerpt: "Làm thế nào nhà hàng chay lớn nhất Đà Nẵng quản lý nguồn nguyên liệu organic? Khám phá hệ thống kho lạnh, quy trình kiểm soát chất lượng và mối quan hệ với các trang trại hữu cơ địa phương.",
      date: "10/09/2024",
      image: "https://images.unsplash.com/photo-1565895405138-6c3a1555da6a?q=80&w=1000&auto=format&fit=crop",
      location: "Đà Nẵng",
      tags: ["Organic", "Quản lý kho", "Chuỗi cung ứng"]
    },
    {
      id: 6,
      title: "Câu chuyện của những người rửa chén trong nhà hàng cao cấp",
      excerpt: "Họ là những người thầm lặng góp phần tạo nên trải nghiệm ẩm thực hoàn hảo. Cùng lắng nghe câu chuyện của những người rửa chén tại các nhà hàng cao cấp và vai trò quan trọng của họ trong guồng máy hoạt động của nhà hàng.",
      date: "05/09/2024",
      image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=1000&auto=format&fit=crop",
      location: "TP.HCM",
      tags: ["Hậu phương", "Nhân viên", "Câu chuyện thật"]
    },
    {
      id: 7,
      title: "Đằng sau những món ăn đẹp như tranh vẽ: Nghệ thuật trang trí món ăn",
      excerpt: "Bí quyết trang trí món ăn từ các đầu bếp hàng đầu. Khám phá quá trình sáng tạo, những công cụ đặc biệt và kỹ thuật được sử dụng để tạo nên những tác phẩm nghệ thuật ẩm thực trên đĩa.",
      date: "01/09/2024",
      image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=1000&auto=format&fit=crop",
      location: "Hà Nội",
      tags: ["Food styling", "Nghệ thuật", "Sáng tạo"]
    },
    {
      id: 8,
      title: "Một đêm trong nhà hàng buffet: Từ chuẩn bị đến dọn dẹp",
      excerpt: "Theo chân đội ngũ nhân viên tại nhà hàng buffet BBQ Garden từ lúc chuẩn bị mở cửa đến khi đóng cửa. Khám phá những công việc không ngừng nghỉ để đảm bảo thực khách luôn có trải nghiệm buffet hoàn hảo.",
      date: "25/08/2024",
      image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1000&auto=format&fit=crop",
      location: "TP.HCM",
      tags: ["Buffet", "Vận hành", "Hậu trường"]
    },
    {
      id: 9,
      title: "Đối mặt với khủng hoảng: Cách nhà hàng xử lý phàn nàn của khách hàng",
      excerpt: "Phỏng vấn các chuyên gia quan hệ khách hàng trong ngành nhà hàng về cách xử lý tình huống khó khăn. Những bài học kinh nghiệm và quy trình xử lý khủng hoảng từ các nhà hàng hàng đầu.",
      date: "20/08/2024",
      image: "https://images.unsplash.com/photo-1551879400-111a9087cd86?q=80&w=1000&auto=format&fit=crop",
      location: "Hà Nội",
      tags: ["Dịch vụ khách hàng", "Xử lý khủng hoảng", "Kinh nghiệm"]
    }
  ];

  // Filter articles based on search term
  const filteredArticles = behindTheScenesArticles.filter(article => 
    article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Categories for quick links
  const categories = [
    { name: "Đầu bếp & Ẩm thực", link: "/blog/dau-bep" },
    { name: "Quản lý nhà hàng", link: "/blog/quan-ly-nha-hang" },
    { name: "Công nghệ bếp", link: "/blog/cong-nghe-bep" },
    { name: "Nguồn nguyên liệu", link: "/blog/nguyen-lieu" },
    { name: "Câu chuyện nhân viên", link: "/blog/cau-chuyen-nhan-vien" },
    { name: "Vận hành nhà hàng", link: "/blog/van-hanh" },
    { name: "Dịch vụ khách hàng", link: "/blog/dich-vu-khach-hang" },
    { name: "Nghệ thuật ẩm thực", link: "/blog/nghe-thuat-am-thuc" },
    { name: "Thiết kế & Không gian", link: "/blog/thiet-ke-khong-gian" },
    { name: "Bí quyết kinh doanh", link: "/blog/bi-quyet-kinh-doanh" }
  ];

  return (
    <div className="blog-latest-news-container">
      <div className="blog-header">
        <h1>Hậu Trường Nhà Hàng</h1>
        <p>Khám phá những câu chuyện chưa kể từ phía sau cánh cửa nhà hàng</p>
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
        <h3>Chủ đề:</h3>
        <div className="blog-categories-tags">
          {categories.map((category, index) => (
            <Link key={index} to={category.link} className="blog-category-tag">
              {category.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Featured behind the scenes article */}
      <article className="blog-featured-article">
        <img 
          src={featuredArticle.image} 
          alt={featuredArticle.title} 
          className="blog-featured-image"
        />
        <div className="blog-featured-content">
          <h2 className="blog-featured-title">{featuredArticle.title}</h2>
          <div className="blog-featured-meta">
            <span><i className="fa fa-map-marker"></i> {featuredArticle.address}</span>
            <span><i className="fa fa-calendar"></i> {featuredArticle.date}</span>
          </div>
          <div className="blog-featured-excerpt">
            <p>{featuredArticle.excerpt}</p>
          </div>
          <Link to={featuredArticle.link} className="blog-featured-link">Xem Ngay!</Link>
        </div>
      </article>

      <h2>Khám Phá Hậu Trường Nhà Hàng</h2>

      {/* Behind the scenes articles list */}
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
                <span><i className="fa fa-map-marker"></i> {article.location}</span>
              </div>
              <p className="blog-card-excerpt">{article.excerpt}</p>
              <div style={{ marginBottom: '0.8rem' }}>
                {article.tags.map((tag, index) => (
                  <span key={index} style={{ 
                    display: 'inline-block', 
                    background: '#f0f0f0', 
                    padding: '2px 8px', 
                    borderRadius: '12px', 
                    fontSize: '0.75rem', 
                    color: '#666',
                    margin: '0 4px 4px 0' 
                  }}>
                    #{tag}
                  </span>
                ))}
              </div>
              <Link to={`/blog/hau-truong-nha-hang/${article.id}`} className="blog-card-link">Xem chi tiết</Link>
            </div>
          </div>
        ))}
      </div>

      {/* Newsletter signup */}
      <div className="blog-newsletter">
        <h3>Đăng Ký Nhận Bản Tin</h3>
        <p>Nhận thông tin về những câu chuyện hậu trường nhà hàng mới nhất và ưu đãi đặc biệt từ DinerChill</p>
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

export default BehindTheScenesPage; 