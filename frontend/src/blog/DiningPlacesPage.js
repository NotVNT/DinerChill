import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/blog/BlogLatestNews.css';

// Function to format date to "DD/MM/YYYY" format
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
};

function DiningPlacesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Địa điểm ăn uống - DinerChill";
  }, []);

  // Sample data for featured restaurant
  const featuredRestaurant = {
    id: 1,
    title: "Nhà hàng Hầm Rượu Lộc Vàng",
    address: "Số 306 Bông Sao, Phường 5, Quận 8, TP.HCM",
    excerpt: "Không gian sang trọng với các món đặc sản miền Nam, phù hợp cho những buổi tiệc gia đình hoặc gặp mặt bạn bè. Nhà hàng nổi tiếng với các món ăn được chế biến từ nguyên liệu tươi ngon.",
    date: "20/05/2023",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1000&auto=format&fit=crop",
    link: "/restaurant/ham-ruou-loc-vang"
  };

  // Sample data for popular dining places
  const popularDiningPlaces = [
    {
      id: 2,
      title: "14+ quán ăn ngon Quận 1 được SĂN LÙNG nhiều nhất Sài Gòn và địa chỉ",
      excerpt: "Chuyến du lịch Sài Gòn chỉ trọn vẹn khi bạn đã được thưởng thức những món ngon trứ danh tại Quận 1. Nếu bạn chưa biết nên ăn gì ở Quận 1, tìm quán ăn ngon Quận 1? Hãy để DinerChill bật mí 14+ món ngon Quận 1 nổi tiếng và địa chỉ.",
      date: "02/04/2023",
      image: "https://images.unsplash.com/photo-1508424757105-b6d5ad9329d0?q=80&w=1000&auto=format&fit=crop",
      location: "Quận 1, TP.HCM"
    },
    {
      id: 3,
      title: "Các quán BUFFET CHAY Hà Nội ngon đồng khách bậc nhất Hà Thành",
      excerpt: "Nhà hàng buffet Chay Vị Lai, Tinh Thực Quán, Bảo Living Thủi Hà, quán Chay Vegito, Om Tara Vegan, Hương Tịch Vegan, Chay Thiện Tâm Ân, Chay Tâm Tuệ Bì... và những quán buffet chay ngon ở Hà Nội rất được yêu thích. Đặc biệt là vào dịp rằm.",
      date: "15/10/2024",
      image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1000&auto=format&fit=crop",
      location: "Hà Nội"
    },
    {
      id: 4,
      title: "Top 20+ nhà hàng ngon nổi tiếng Sài Gòn được nhiều người yêu thích nhất",
      excerpt: "Đây là địa chỉ các nhà hàng ngon Sài Gòn, nổi tiếng bởi đồ ăn ngon dễ, dịch vụ chu đáo - mà bạn nên thử một lần trong đời. Những nhà hàng này đã chinh phục không biết bao thực khách kén tính đến Sài Thành rồi.",
      date: "13/05/2023",
      image: "https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?q=80&w=1000&auto=format&fit=crop",
      location: "TP.HCM"
    },
    {
      id: 5,
      title: "Thưởng thức đặc sản dê rẻ giữa lòng Hà Nội",
      excerpt: "Nếu người ta thèm món dê ngon thì không thể nào không nghĩ tới đặc sản dê Ninh Bình. Nhưng ở Hà Nội cũng có những quán dê ngon không kém, giá cả lại phải chăng. Hãy cùng DinerChill khám phá địa chỉ quán dê ngon ở Hà Nội nhé!",
      date: "05/08/2024",
      image: "https://images.unsplash.com/photo-1534766555764-ce878a5e3a2b?q=80&w=1000&auto=format&fit=crop",
      location: "Hà Nội"
    },
    {
      id: 6,
      title: "Top 15 nhà hàng hải sản Đà Nẵng ngon, rẻ được review nhiều nhất",
      excerpt: "Đà Nẵng là thiên đường hải sản tươi ngon với giá cả phải chăng. Nếu bạn đang tìm kiếm những nhà hàng hải sản Đà Nẵng chất lượng, hãy tham khảo danh sách do DinerChill tổng hợp từ đánh giá của thực khách.",
      date: "22/07/2024",
      image: "https://images.unsplash.com/photo-1579631542720-3a87824fff86?q=80&w=1000&auto=format&fit=crop",
      location: "Đà Nẵng"
    },
    {
      id: 7,
      title: "10 quán lẩu nướng không khói Hà Nội được yêu thích nhất",
      excerpt: "Thưởng thức lẩu nướng không khói là trải nghiệm tuyệt vời cho những ngày se lạnh tại Hà Nội. Cùng DinerChill khám phá những địa chỉ quán lẩu nướng không khói ngon, chất lượng và được yêu thích nhất tại Thủ đô.",
      date: "18/09/2023",
      image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?q=80&w=1000&auto=format&fit=crop",
      location: "Hà Nội"
    }
  ];

  // Filter dining places based on search term
  const filteredDiningPlaces = popularDiningPlaces.filter(place => 
    place.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    place.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
    place.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Categories for quick links
  const categories = [
    { name: "Kinh nghiệm mở quán", link: "/blog/kinh-nghiem-mo-quan" },
    { name: "Văn khán thần tài phong thủy", link: "/blog/van-khan-than-tai" },
    { name: "Quán lý nhà hàng", link: "/blog/quan-ly-nha-hang" },
    { name: "Món ngon gia đình", link: "/blog/mon-ngon-gia-dinh" },
    { name: "Công thức các món ăn giải ngày", link: "/blog/cong-thuc-mon-an" },
    { name: "Công thức hot", link: "/blog/cong-thuc-hot" },
    { name: "Thực đơn hàng ngày", link: "/blog/thuc-don-hang-ngay" },
    { name: "Món ngon mỗi ngày", link: "/blog/mon-ngon-moi-ngay" },
    { name: "Món ngon mỗi ngày từ thịt gà", link: "/blog/mon-ngon-tu-thit-ga" },
    { name: "Kiến thức nhà hàng", link: "/blog/kien-thuc-nha-hang" }
  ];

  return (
    <div className="blog-latest-news-container">
      <div className="blog-header">
        <h1>Địa Điểm Ăn Uống</h1>
        <p>Khám phá những địa điểm ăn uống nổi tiếng và được yêu thích nhất</p>
      </div>

      {/* Search bar */}
      <div className="blog-search-container">
        <input 
          type="text" 
          placeholder="Tìm kiếm địa điểm ăn uống..." 
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

      {/* Featured restaurant */}
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

      <h2>Bài Blog đang HOT</h2>

      {/* Dining places list */}
      <div className="blog-grid">
        {filteredDiningPlaces.map(place => (
          <div key={place.id} className="blog-card">
            <img 
              src={place.image} 
              alt={place.title} 
              className="blog-card-image"
            />
            <div className="blog-card-content">
              <h3 className="blog-card-title">{place.title}</h3>
              <div className="blog-card-meta">
                <span><i className="fa fa-calendar"></i> {place.date}</span>
                <span><i className="fa fa-map-marker"></i> {place.location}</span>
              </div>
              <p className="blog-card-excerpt">{place.excerpt}</p>
              <Link to={`/blog/dia-diem-an-uong/${place.id}`} className="blog-card-link">Đọc tiếp</Link>
            </div>
          </div>
        ))}
      </div>

      {/* Newsletter signup */}
      <div className="blog-newsletter">
        <h3>Đăng Ký Nhận Bản Tin</h3>
        <p>Nhận thông tin về địa điểm ăn uống mới và ưu đãi đặc biệt từ DinerChill</p>
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

export default DiningPlacesPage; 