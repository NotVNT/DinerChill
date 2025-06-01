import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/blog/BlogLatestNews.css';

// Function to format date to "DD/MM/YYYY" format
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
};

function ReviewsRatingsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Đánh giá & Review - DinerChill";
  }, []);

  // Sample data for featured review
  const featuredReview = {
    id: 1,
    title: "Review: Nhà hàng The Log - Thiên đường ẩm thực Á Âu giữa lòng Sài Gòn",
    address: "15 Nguyễn Thiện Thuật, Quận 3, TP.HCM",
    excerpt: "Không gian sang trọng, menu đa dạng và dịch vụ chuyên nghiệp, The Log đang trở thành điểm đến yêu thích của nhiều thực khách sành ăn tại Sài Gòn. Cùng DinerChill trải nghiệm và đánh giá chi tiết về nhà hàng hot trend này!",
    date: "15/05/2024",
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=1000&auto=format&fit=crop",
    link: "/blog/danh-gia-review/nha-hang-the-log",
    rating: 4.8
  };

  // Sample data for restaurant reviews
  const restaurantReviews = [
    {
      id: 2,
      title: "Đánh giá Quán Bò Tơ Tây Ninh: Thiên đường thịt bò tươi ngon giữa Sài Gòn",
      excerpt: "Quán Bò Tơ Tây Ninh nổi tiếng với những món ăn từ thịt bò tươi ngon, đặc biệt là bò tơ Tây Ninh được chọn lọc kỹ càng. Cùng DinerChill đánh giá chi tiết về chất lượng món ăn, giá cả và dịch vụ tại quán.",
      date: "02/06/2024",
      image: "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1000&auto=format&fit=crop",
      location: "Quận 1, TP.HCM",
      rating: 4.5
    },
    {
      id: 3,
      title: "Trải nghiệm ẩm thực tại Nhà hàng chay An Nhiên - Điểm đến cho người ăn chay",
      excerpt: "Nhà hàng chay An Nhiên mang đến trải nghiệm ẩm thực thuần chay tinh tế với những món ăn được chế biến công phu. DinerChill sẽ đánh giá chi tiết về không gian, thực đơn và chất lượng phục vụ tại nhà hàng này.",
      date: "15/04/2024",
      image: "https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?q=80&w=1000&auto=format&fit=crop",
      location: "Quận 2, TP.HCM",
      rating: 4.3
    },
    {
      id: 4,
      title: "Review King BBQ Buffet: Thiên đường nướng Hàn Quốc đáng đồng tiền",
      excerpt: "King BBQ Buffet là một trong những chuỗi nhà hàng buffet nướng Hàn Quốc phổ biến tại Việt Nam. Cùng DinerChill khám phá và đánh giá chi tiết về chất lượng thực phẩm, giá cả và dịch vụ tại đây.",
      date: "20/03/2024",
      image: "https://images.unsplash.com/photo-1632442830895-af6393892595?q=80&w=1000&auto=format&fit=crop",
      location: "Nhiều chi nhánh tại TP.HCM",
      rating: 4.0
    },
    {
      id: 5,
      title: "Đánh giá Nhà hàng Phố Biển: Thiên đường hải sản tươi ngon tại Hà Nội",
      excerpt: "Nhà hàng Phố Biển tự hào mang đến những món hải sản tươi ngon nhất từ biển cả. DinerChill sẽ đánh giá chi tiết về chất lượng, giá cả và không gian tại nhà hàng hải sản nổi tiếng này.",
      date: "10/02/2024",
      image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1000&auto=format&fit=crop",
      location: "Hà Nội",
      rating: 4.6
    },
    {
      id: 6,
      title: "Review Gogi House: Nhà hàng Hàn Quốc bình dân được yêu thích",
      excerpt: "Gogi House là chuỗi nhà hàng Hàn Quốc phổ biến với giá cả phải chăng và không gian trẻ trung. Cùng DinerChill đánh giá chi tiết về menu, chất lượng món ăn và dịch vụ tại Gogi House.",
      date: "05/01/2024",
      image: "https://images.unsplash.com/photo-1484980972926-edee96e0960d?q=80&w=1000&auto=format&fit=crop",
      location: "Nhiều chi nhánh toàn quốc",
      rating: 4.2
    },
    {
      id: 7,
      title: "Đánh giá Secret Garden - Nhà hàng View đẹp giữa lòng Sài Gòn",
      excerpt: "Secret Garden nổi tiếng với không gian xanh mát trên tầng thượng và những món ăn Việt Nam đậm đà. DinerChill sẽ đánh giá chi tiết về không gian, thực đơn và chất lượng dịch vụ tại nhà hàng này.",
      date: "20/12/2023",
      image: "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?q=80&w=1000&auto=format&fit=crop",
      location: "Quận 1, TP.HCM",
      rating: 4.4
    }
  ];

  // Filter reviews based on search term
  const filteredReviews = restaurantReviews.filter(review => 
    review.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    review.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
    review.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Categories for quick links
  const categories = [
    { name: "Nhà hàng cao cấp", link: "/blog/danh-gia-review/nha-hang-cao-cap" },
    { name: "Quán ăn bình dân", link: "/blog/danh-gia-review/quan-an-binh-dan" },
    { name: "Buffet & Lẩu", link: "/blog/danh-gia-review/buffet-lau" },
    { name: "Món Việt", link: "/blog/danh-gia-review/mon-viet" },
    { name: "Ẩm thực châu Á", link: "/blog/danh-gia-review/am-thuc-chau-a" },
    { name: "Ẩm thực phương Tây", link: "/blog/danh-gia-review/am-thuc-phuong-tay" },
    { name: "Ăn chay", link: "/blog/danh-gia-review/an-chay" },
    { name: "Cafe & Dessert", link: "/blog/danh-gia-review/cafe-dessert" },
    { name: "Bar & Pub", link: "/blog/danh-gia-review/bar-pub" },
    { name: "Đánh giá mới nhất", link: "/blog/danh-gia-review/moi-nhat" }
  ];

  // Render star ratings
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={`full-${i}`} className="star full-star">★</span>);
    }
    
    if (hasHalfStar) {
      stars.push(<span key="half" className="star half-star">★</span>);
    }
    
    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<span key={`empty-${i}`} className="star empty-star">☆</span>);
    }
    
    return <div className="review-stars">{stars} <span className="review-rating-value">({rating}/5)</span></div>;
  };

  return (
    <div className="blog-latest-news-container">
      <div className="blog-header">
        <h1>Đánh Giá & Review</h1>
        <p>Khám phá những nhà hàng tốt nhất qua đánh giá chân thực từ DinerChill</p>
      </div>

      {/* Search bar */}
      <div className="blog-search-container">
        <input 
          type="text" 
          placeholder="Tìm kiếm đánh giá nhà hàng..." 
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

      {/* Featured review */}
      <article className="blog-featured-article">
        <img 
          src={featuredReview.image} 
          alt={featuredReview.title} 
          className="blog-featured-image"
        />
        <div className="blog-featured-content">
          <h2 className="blog-featured-title">{featuredReview.title}</h2>
          <div className="blog-featured-meta">
            <span><i className="fa fa-map-marker"></i> {featuredReview.address}</span>
            <span><i className="fa fa-calendar"></i> {featuredReview.date}</span>
          </div>
          <div className="featured-review-rating">
            {renderStars(featuredReview.rating)}
          </div>
          <div className="blog-featured-excerpt">
            <p>{featuredReview.excerpt}</p>
          </div>
          <Link to={featuredReview.link} className="blog-featured-link">Đọc Đánh Giá</Link>
        </div>
      </article>

      <h2>Đánh Giá Mới Nhất</h2>

      {/* Reviews list */}
      <div className="blog-grid">
        {filteredReviews.map(review => (
          <div key={review.id} className="blog-card">
            <img 
              src={review.image} 
              alt={review.title} 
              className="blog-card-image"
            />
            <div className="blog-card-content">
              <h3 className="blog-card-title">{review.title}</h3>
              <div className="blog-card-meta">
                <span><i className="fa fa-calendar"></i> {review.date}</span>
                <span><i className="fa fa-map-marker"></i> {review.location}</span>
              </div>
              <div className="review-card-rating">
                {renderStars(review.rating)}
              </div>
              <p className="blog-card-excerpt">{review.excerpt}</p>
              <Link to={`/blog/danh-gia-review/${review.id}`} className="blog-card-link">Đọc Chi Tiết</Link>
            </div>
          </div>
        ))}
      </div>

      {/* Newsletter signup */}
      <div className="blog-newsletter">
        <h3>Đăng Ký Nhận Bản Tin</h3>
        <p>Nhận thông tin về đánh giá nhà hàng mới và ưu đãi đặc biệt từ DinerChill</p>
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

export default ReviewsRatingsPage; 