import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/blog/BlogLatestNews.css';

// Function to format date to "DD/MM/YYYY" format
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
};

function HotTrendRestaurantsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Nhà Hàng Hot Trend - DinerChill";
  }, []);

  // Sample data for featured trending restaurant
  const featuredRestaurant = {
    id: 1,
    title: "Phở Fusion - Nhà hàng phở hiện đại đầu tiên tại Việt Nam",
    address: "218 Lê Thánh Tôn, Quận 1, TP.HCM",
    excerpt: "Phở Fusion đang tạo nên một làn sóng mới trong văn hóa ẩm thực Việt với những món phở sáng tạo kết hợp tinh hoa ẩm thực thế giới. Nhà hàng nổi bật với không gian hiện đại, cách phục vụ độc đáo và menu phở đa dạng từ phở truyền thống đến phở fusion với hương vị châu Âu, Nhật Bản, Hàn Quốc...",
    date: "01/10/2024",
    image: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?q=80&w=1000&auto=format&fit=crop",
    link: "/restaurant/pho-fusion"
  };

  // Sample data for hot trend restaurants
  const hotTrendRestaurants = [
    {
      id: 2,
      title: "Nhà hàng chay thuần Việt VEGI GARDEN",
      excerpt: "Nằm trong top những nhà hàng chay được yêu thích nhất hiện nay, VEGI GARDEN mang đến trải nghiệm ẩm thực chay tinh tế với không gian xanh mát, thực đơn đa dạng từ các món chay truyền thống đến hiện đại, sáng tạo.",
      date: "28/09/2024",
      image: "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?q=80&w=1000&auto=format&fit=crop",
      location: "Quận 2, TP.HCM",
      trends: ["Ẩm thực chay", "Không gian xanh", "Bền vững"]
    },
    {
      id: 3,
      title: "URBAN BBQ - Nướng kiểu Mỹ giữa lòng Hà Nội",
      excerpt: "URBAN BBQ đang tạo nên cơn sốt với phong cách BBQ Mỹ đích thực: sườn nướng, thịt heo xông khói, gà nướng BBQ sauce... Không gian được thiết kế theo phong cách Mỹ vintage với âm nhạc sôi động, là điểm đến lý tưởng cho các nhóm bạn và gia đình.",
      date: "15/09/2024",
      image: "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?q=80&w=1000&auto=format&fit=crop",
      location: "Hà Nội",
      trends: ["BBQ Mỹ", "Vintage", "Cocktail"]
    },
    {
      id: 4,
      title: "SUSHI OMAKASE by Chef Kenji - Trải nghiệm Omakase cao cấp",
      excerpt: "Nhà hàng SUSHI OMAKASE by Chef Kenji mang đến trải nghiệm ẩm thực Nhật Bản đỉnh cao với thực đơn Omakase do đầu bếp Kenji với hơn 20 năm kinh nghiệm tại Tokyo thực hiện. Đây là một trong những nhà hàng Nhật được săn đón nhiều nhất hiện nay.",
      date: "05/09/2024",
      image: "https://images.unsplash.com/photo-1553621042-f6e147245754?q=80&w=1000&auto=format&fit=crop",
      location: "Quận 1, TP.HCM",
      trends: ["Omakase", "Fine dining", "Trải nghiệm"]
    },
    {
      id: 5,
      title: "CLOUD DINING - Nhà hàng trên tầng thượng với view 360 độ",
      excerpt: "CLOUD DINING - nhà hàng nằm trên tầng 35 của tòa nhà cao nhất Đà Nẵng đang trở thành điểm đến hot nhất thành phố. Với view 360 độ ngắm toàn cảnh thành phố và biển, cùng thực đơn fusion Á - Âu sáng tạo, đây là trải nghiệm ẩm thực không thể bỏ qua.",
      date: "01/09/2024",
      image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=1000&auto=format&fit=crop",
      location: "Đà Nẵng",
      trends: ["Rooftop", "Fusion", "View đẹp"]
    },
    {
      id: 6,
      title: "FARM TO TABLE - Nhà hàng với vườn rau hữu cơ riêng",
      excerpt: "FARM TO TABLE đang dẫn đầu xu hướng ẩm thực bền vững với mô hình nhà hàng kết hợp vườn rau hữu cơ riêng. Tất cả nguyên liệu đều được trồng tại vườn của nhà hàng hoặc thu mua từ các trang trại địa phương, đảm bảo độ tươi ngon và an toàn.",
      date: "20/08/2024",
      image: "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?q=80&w=1000&auto=format&fit=crop",
      location: "Hà Nội",
      trends: ["Organic", "Farm to table", "Bền vững"]
    },
    {
      id: 7,
      title: "SPICE ROUTE - Hành trình ẩm thực Ấn Độ đích thực",
      excerpt: "SPICE ROUTE đang làm mưa làm gió với những món ăn Ấn Độ đích thực. Từ Tandoori, Curry đến Naan, tất cả đều được chế biến bởi đầu bếp người Ấn với công thức gia truyền. Không gian nhà hàng được thiết kế theo phong cách Ấn Độ truyền thống đầy màu sắc.",
      date: "10/08/2024",
      image: "https://images.unsplash.com/photo-1517244683847-7456b63c5969?q=80&w=1000&auto=format&fit=crop",
      location: "TP.HCM",
      trends: ["Ẩm thực Ấn", "Gia vị", "Văn hóa"]
    },
    {
      id: 8,
      title: "DIGITAL DINING - Nhà hàng kết hợp công nghệ tương tác",
      excerpt: "DIGITAL DINING mang đến trải nghiệm ăn uống kết hợp công nghệ chưa từng có. Với bàn ăn tương tác, thực đơn 3D hologram và robot phục vụ, nhà hàng đang tạo nên một cơn sốt trong giới trẻ và những người yêu công nghệ.",
      date: "01/08/2024",
      image: "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?q=80&w=1000&auto=format&fit=crop",
      location: "Hà Nội",
      trends: ["Công nghệ", "Tương tác", "Robot"]
    },
    {
      id: 9,
      title: "WINE & DINE - Nhà hàng với hầm rượu vang 1000 chai",
      excerpt: "WINE & DINE không chỉ nổi tiếng với những món ăn Âu tinh tế mà còn gây ấn tượng với hầm rượu vang hơn 1000 chai từ khắp nơi trên thế giới. Đây là thiên đường cho những người sành rượu vang và là điểm hẹn lý tưởng cho các buổi gặp gỡ sang trọng.",
      date: "15/07/2024",
      image: "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?q=80&w=1000&auto=format&fit=crop",
      location: "TP.HCM",
      trends: ["Rượu vang", "Fine dining", "Sang trọng"]
    }
  ];

  // Filter hot trend restaurants based on search term
  const filteredRestaurants = hotTrendRestaurants.filter(restaurant => 
    restaurant.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    restaurant.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
    restaurant.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    restaurant.trends.some(trend => trend.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Categories for quick links
  const categories = [
    { name: "Fusion Cuisine", link: "/blog/fusion-cuisine" },
    { name: "Fine Dining", link: "/blog/fine-dining" },
    { name: "Nhà hàng View đẹp", link: "/blog/view-dep" },
    { name: "Ẩm thực bền vững", link: "/blog/am-thuc-ben-vung" },
    { name: "Công nghệ & Ẩm thực", link: "/blog/cong-nghe-am-thuc" },
    { name: "Farm to Table", link: "/blog/farm-to-table" },
    { name: "Nhà hàng Rooftop", link: "/blog/rooftop" },
    { name: "Ẩm thực chay", link: "/blog/am-thuc-chay" },
    { name: "Nhà hàng Omakase", link: "/blog/omakase" },
    { name: "Craft Beer & Gastropub", link: "/blog/craft-beer-gastropub" }
  ];

  return (
    <div className="blog-latest-news-container">
      <div className="blog-header">
        <h1>Nhà Hàng Hot Trend</h1>
        <p>Khám phá những nhà hàng đang tạo xu hướng mới trong làng ẩm thực</p>
      </div>

      {/* Search bar */}
      <div className="blog-search-container">
        <input 
          type="text" 
          placeholder="Tìm kiếm nhà hàng hot trend..." 
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
        <h3>Xu hướng:</h3>
        <div className="blog-categories-tags">
          {categories.map((category, index) => (
            <Link key={index} to={category.link} className="blog-category-tag">
              {category.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Featured trending restaurant */}
      <article className="blog-featured-article">
        <img 
          src={featuredRestaurant.image} 
          alt={featuredRestaurant.title} 
          className="blog-featured-image"
        />
        <div className="blog-featured-content">
          <h2 className="blog-featured-title">{featuredRestaurant.title}</h2>
          <div className="blog-featured-meta">
            <span><i className="fa fa-map-marker"></i> {featuredRestaurant.address}</span>
            <span><i className="fa fa-calendar"></i> {featuredRestaurant.date}</span>
          </div>
          <div className="blog-featured-excerpt">
            <p>{featuredRestaurant.excerpt}</p>
          </div>
          <Link to={featuredRestaurant.link} className="blog-featured-link">Xem Ngay!</Link>
        </div>
      </article>

      <h2>Nhà Hàng Đang Tạo Xu Hướng</h2>

      {/* Hot trend restaurants list */}
      <div className="blog-grid">
        {filteredRestaurants.map(restaurant => (
          <div key={restaurant.id} className="blog-card">
            <img 
              src={restaurant.image} 
              alt={restaurant.title} 
              className="blog-card-image"
            />
            <div className="blog-card-content">
              <h3 className="blog-card-title">{restaurant.title}</h3>
              <div className="blog-card-meta">
                <span><i className="fa fa-calendar"></i> {restaurant.date}</span>
                <span><i className="fa fa-map-marker"></i> {restaurant.location}</span>
              </div>
              <p className="blog-card-excerpt">{restaurant.excerpt}</p>
              <div style={{ marginBottom: '0.8rem' }}>
                {restaurant.trends.map((trend, index) => (
                  <span key={index} style={{ 
                    display: 'inline-block', 
                    background: '#f0f0f0', 
                    padding: '2px 8px', 
                    borderRadius: '12px', 
                    fontSize: '0.75rem', 
                    color: '#666',
                    margin: '0 4px 4px 0' 
                  }}>
                    #{trend}
                  </span>
                ))}
              </div>
              <Link to={`/blog/nha-hang-hot-trend/${restaurant.id}`} className="blog-card-link">Xem chi tiết</Link>
            </div>
          </div>
        ))}
      </div>

      {/* Newsletter signup */}
      <div className="blog-newsletter">
        <h3>Đăng Ký Nhận Bản Tin</h3>
        <p>Nhận thông tin về những nhà hàng hot trend mới nhất và ưu đãi đặc biệt từ DinerChill</p>
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

export default HotTrendRestaurantsPage; 