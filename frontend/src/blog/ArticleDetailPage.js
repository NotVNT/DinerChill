import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import '../styles/blog/BlogLatestNews.css';

function ArticleDetailPage() {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Simulate loading article data
    setTimeout(() => {
      if (id === 'dinerchill-ra-mat') {
        setArticle({
          id: 'dinerchill-ra-mat',
          title: 'DinerChill Ra Mắt: Nền Tảng Đặt Bàn Nhà Hàng Trực Tuyến Đột Phá Tại Việt Nam',
          date: new Date().toLocaleDateString('vi-VN'),
          author: 'Admin',
          image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=1000&auto=format&fit=crop',
          content: `
            <p>Thành phố Hồ Chí Minh, ${new Date().toLocaleDateString('vi-VN')} – Thị trường ẩm thực Việt Nam vừa chào đón một "người chơi" mới đầy tiềm năng: DinerChill, website đặt bàn nhà hàng trực tuyến được kỳ vọng sẽ thay đổi cách thực khách tìm kiếm và trải nghiệm các địa điểm ăn uống. Với giao diện thân thiện, tính năng đa dạng và danh sách nhà hàng phong phú, DinerChill hứa hẹn mang đến sự tiện lợi tối đa cho người dùng và hỗ trợ hiệu quả cho các nhà hàng đối tác.</p>
            
            <h3>DinerChill: Đặt Bàn Dễ Dàng, Trải Nghiệm Hoàn Hảo</h3>
            
            <p>DinerChill được xây dựng với mục tiêu đơn giản hóa quy trình đặt bàn nhà hàng, giúp thực khách dễ dàng tìm kiếm và đặt chỗ tại các địa điểm phù hợp với sở thích và nhu cầu của mình. Ngay từ trang chủ, người dùng có thể nhanh chóng tìm kiếm nhà hàng theo:</p>
            
            <ul>
                <li><strong>Địa điểm:</strong> Với khả năng chọn khu vực cụ thể, DinerChill giúp người dùng khám phá các nhà hàng lân cận hoặc tại khu vực mong muốn.</li>
                <li><strong>Loại hình ẩm thực:</strong> Từ buffet, lẩu, nướng, hải sản, quán nhậu, món Việt, đến món Hàn, và nhiều hơn nữa, DinerChill cung cấp bộ lọc đa dạng để thực khách dễ dàng lựa chọn.</li>
                <li><strong>Hậu trường nhà hàng:</strong> Các bộ lọc như "tin tức mới nhất", "mẹo & kinh nghiệm ẩm thực", "công thức món ăn", "đánh giá & review", "sự kiện & khuyến mãi", "câu chuyện ẩm thực" cho phép người dùng tìm kiếm thông tin chi tiết về nhà hàng, từ đó đưa ra quyết định sáng suốt hơn.</li>
            </ul>
            
            <p>Bên cạnh đó, DinerChill còn tích hợp tính năng "đặt lại" giúp người dùng nhanh chóng truy cập lại các lựa chọn tìm kiếm trước đó, mang lại trải nghiệm liền mạch và tiện lợi.</p>
            
            <img src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1000&auto=format&fit=crop" alt="Nhà hàng sang trọng" class="article-image" />
            
            <h3>Lợi Ích Vượt Trội Cho Nhà Hàng Đối Tác</h3>
            
            <p>Không chỉ là một nền tảng cho thực khách, DinerChill còn là công cụ mạnh mẽ hỗ trợ các nhà hàng trong việc quản lý đặt chỗ và tiếp cận khách hàng tiềm năng. Các nhà hàng đối tác có thể:</p>
            
            <ul>
                <li><strong>Tăng cường khả năng hiển thị:</strong> Hình ảnh đẹp mắt và thông tin chi tiết về nhà hàng được hiển thị rõ ràng, thu hút sự chú ý của người dùng.</li>
                <li><strong>Quản lý đặt chỗ hiệu quả:</strong> Hệ thống đặt bàn trực tuyến giúp nhà hàng tối ưu hóa quy trình tiếp nhận và sắp xếp chỗ, giảm thiểu sai sót và tăng cường hiệu suất.</li>
                <li><strong>Tiếp cận lượng lớn khách hàng:</strong> Với lượng người dùng truy cập ngày càng tăng, DinerChill mở rộng kênh tiếp thị cho nhà hàng, giúp họ tiếp cận đối tượng khách hàng rộng lớn hơn.</li>
            </ul>
            
            <h3>Hướng Đi Tương Lai</h3>
            
            <p>Đội ngũ phát triển DinerChill cam kết không ngừng cải tiến và bổ sung các tính năng mới để mang lại trải nghiệm tốt nhất cho người dùng. Trong tương lai, DinerChill dự kiến sẽ mở rộng danh sách nhà hàng trên khắp cả nước, đồng thời phát triển thêm các tính năng độc đáo như chương trình khách hàng thân thiết, ưu đãi độc quyền, và tích hợp thanh toán trực tuyến.</p>
            
            <p>Với sự ra mắt của DinerChill, thị trường đặt bàn nhà hàng trực tuyến tại Việt Nam hứa hẹn sẽ trở nên sôi động hơn bao giờ hết, mang đến những trải nghiệm ẩm thực tiện lợi và đáng nhớ cho mọi người. Hãy truy cập DinerChill ngay hôm nay để khám phá thế giới ẩm thực phong phú và đặt bàn tại nhà hàng yêu thích của bạn!</p>
          `
        });
      } else {
        // Handle other article IDs here
        setArticle({
          id,
          title: `Bài viết ${id}`,
          date: new Date().toLocaleDateString('vi-VN'),
          author: 'Tác giả',
          image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=1000&auto=format&fit=crop',
          content: '<p>Nội dung chi tiết của bài viết sẽ được hiển thị ở đây.</p>'
        });
      }
      setLoading(false);
      document.title = "DinerChill - Bài viết";
    }, 500);
  }, [id]);

  if (loading) {
    return (
      <div className="blog-latest-news-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải bài viết...</p>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="blog-latest-news-container">
        <div className="not-found">Không tìm thấy bài viết</div>
        <Link to="/blog/tin-tuc-moi-nhat" className="blog-featured-link">Quay lại tin tức</Link>
      </div>
    );
  }

  return (
    <div className="blog-latest-news-container">
      <div className="blog-article-detail">
        <Link to="/blog/tin-tuc-moi-nhat" className="blog-back-link">
          <i className="fa fa-arrow-left"></i> Quay lại tin tức
        </Link>
        
        <article className="blog-featured-article">
          <img 
            src={article.image} 
            alt={article.title} 
            className="blog-featured-image"
          />
          <div className="blog-featured-content">
            <h1 className="blog-featured-title">{article.title}</h1>
            <div className="blog-featured-meta">
              <span><i className="fa fa-calendar"></i> {article.date}</span>
              <span><i className="fa fa-user"></i> {article.author}</span>
              <span><i className="fa fa-comment"></i> 0 bình luận</span>
            </div>
            <div className="blog-article-content" dangerouslySetInnerHTML={{ __html: article.content }}></div>
          </div>
        </article>
        
        <div className="blog-article-tags">
          <span className="blog-tag-label">Tags:</span>
          <Link to="/blog/tag/dinerchill" className="blog-tag">DinerChill</Link>
          <Link to="/blog/tag/am-thuc" className="blog-tag">Ẩm thực</Link>
          <Link to="/blog/tag/dat-ban" className="blog-tag">Đặt bàn</Link>
          <Link to="/blog/tag/nha-hang" className="blog-tag">Nhà hàng</Link>
        </div>
        
        <div className="blog-article-share">
          <span className="blog-share-label">Chia sẻ:</span>
          <a href="#" className="blog-share-button">
            <i className="fa fa-facebook"></i>
          </a>
          <a href="#" className="blog-share-button">
            <i className="fa fa-twitter"></i>
          </a>
          <a href="#" className="blog-share-button">
            <i className="fa fa-linkedin"></i>
          </a>
          <a href="#" className="blog-share-button">
            <i className="fa fa-telegram"></i>
          </a>
        </div>
        
        <div className="blog-article-author">
          <div className="blog-author-avatar">
            <img src="https://ui-avatars.com/api/?name=Admin&background=f8a100&color=fff" alt="Admin" />
          </div>
          <div className="blog-author-info">
            <h4 className="blog-author-name">Admin</h4>
            <p className="blog-author-bio">Quản trị viên của DinerChill, chuyên chia sẻ thông tin về ẩm thực, nhà hàng và các xu hướng mới trong ngành.</p>
          </div>
        </div>
        
        <div className="blog-article-comments">
          <h3>Bình luận (0)</h3>
          <form className="blog-comment-form">
            <textarea 
              placeholder="Nhập bình luận của bạn" 
              className="blog-comment-input"
              rows="4"
            ></textarea>
            <button type="submit" className="blog-comment-button">Gửi bình luận</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ArticleDetailPage; 