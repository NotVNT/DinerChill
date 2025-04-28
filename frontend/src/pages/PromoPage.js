import React, { useState, useEffect } from 'react';
import '../styles/pages/PromoPage.css';

function PromoPage() {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8); // 8 items (2 rows of 4)

  // Use mock data directly without API call
  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setPromotions([
        {
          id: 1,
          title: 'Giảm 30% cho món ăn Hàn Quốc',
          description: 'Áp dụng cho tất cả món Hàn Quốc vào các ngày trong tuần.',
          imageUrl: '/images/promotions/korean-food-promo.jpg',
          validUntil: '2023-12-31',
          code: 'KOREA30',
          restaurants: ['Seoul BBQ', 'Kimchi House', 'K-Food']
        },
        {
          id: 2,
          title: 'Miễn phí đồ uống cho đơn trên 500k',
          description: 'Đặt bàn và đạt hoá đơn trên 500.000đ để nhận 2 nước ngọt miễn phí.',
          imageUrl: '/images/promotions/free-drinks.jpg',
          validUntil: '2023-10-15',
          code: 'FREEDRINK',
          restaurants: ['Pizza Express', 'Sushi World', 'Ocean Palace']
        },
        {
          id: 3,
          title: 'Ưu đãi sinh nhật - Giảm 50%',
          description: 'Giảm 50% cho bữa ăn trong tháng sinh nhật của bạn (áp dụng có điều kiện).',
          imageUrl: '/images/promotions/birthday-promo.jpg',
          validUntil: '2023-12-31',
          code: 'BIRTHDAY50',
          restaurants: ['Luxury Dining', 'The Garden', 'Sky Lounge']
        },
        {
          id: 4,
          title: 'Thứ 3 vui vẻ - Giảm 25% đồ nướng',
          description: 'Mỗi thứ 3 hàng tuần, giảm 25% cho tất cả các món nướng.',
          imageUrl: '/images/promotions/bbq-tuesday.jpg',
          validUntil: '2023-11-30',
          code: 'BBQTUE',
          restaurants: ['BBQ Garden', 'Grill Master', 'Flame House']
        },
        {
          id: 5,
          title: 'Combo gia đình - Giảm 15%',
          description: 'Đặt combo gia đình cho 4-6 người và nhận giảm giá 15%.',
          imageUrl: '/images/promotions/family-combo.jpg',
          validUntil: '2023-12-15',
          code: 'FAMILY15',
          restaurants: ['Family Diner', 'Happy Garden', 'Big Feast']
        },
        {
          id: 6,
          title: 'Khách hàng mới - Giảm 20% lần đầu',
          description: 'Dành cho khách hàng lần đầu đặt bàn qua ứng dụng DinerChill.',
          imageUrl: '/images/promotions/new-customer.jpg',
          validUntil: '2023-12-31',
          code: 'NEWBIE20',
          restaurants: ['Tất cả nhà hàng']
        },
        {
          id: 7,
          title: 'Giảm 40% món Nhật đặc sắc',
          description: 'Áp dụng cho các món Nhật đặc biệt vào cuối tuần.',
          imageUrl: '/images/promotions/japanese-food.jpg',
          validUntil: '2023-11-15',
          code: 'JAPAN40',
          restaurants: ['Sushi World', 'Tokyo Dining', 'Sakura Restaurant']
        },
        {
          id: 8,
          title: 'Happy Hour - Cocktail mua 1 tặng 1',
          description: 'Từ 17h-19h hàng ngày, khi mua 1 cocktail sẽ được tặng 1 miễn phí.',
          imageUrl: '/images/promotions/happy-hour.jpg',
          validUntil: '2023-12-31',
          code: 'HAPPYHOUR',
          restaurants: ['Sky Lounge', 'Ocean View Bar', 'Cocktail House']
        },
        {
          id: 9,
          title: 'Đêm lẩu - Giảm 35% sau 21h',
          description: 'Đặt bàn sau 21h và được giảm 35% cho tất cả các món lẩu.',
          imageUrl: '/images/promotions/hotpot-night.jpg',
          validUntil: '2023-10-31',
          code: 'NIGHTPOT',
          restaurants: ['Hot Pot Paradise', 'Lẩu Đêm', 'Golden Pot']
        },
        {
          id: 10,
          title: 'Đặt bàn sớm - Tặng món khai vị',
          description: 'Đặt bàn trước 3 ngày và nhận món khai vị miễn phí cho cả bàn.',
          imageUrl: '/images/promotions/appetizer.jpg',
          validUntil: '2023-12-15',
          code: 'EARLYBIRD',
          restaurants: ['Luxury Dining', 'Premium Kitchen', 'Royal Feast']
        },
        {
          id: 11,
          title: 'Buffet hải sản - Giảm 20%',
          description: 'Buffet hải sản tươi sống giảm 20% vào thứ 5 hàng tuần.',
          imageUrl: '/images/promotions/seafood-buffet.jpg',
          validUntil: '2023-11-30',
          code: 'SEAFOOD20',
          restaurants: ['Ocean Palace', 'Sea Delight', 'Fresh Catch']
        },
        {
          id: 12,
          title: 'Món chay mỗi thứ 2 - Giảm 30%',
          description: 'Giảm 30% cho tất cả các món chay vào thứ 2 đầu tiên mỗi tháng.',
          imageUrl: '/images/promotions/vegetarian.jpg',
          validUntil: '2023-12-31',
          code: 'VEGGIE30',
          restaurants: ['Green Garden', 'Peaceful Lotus', 'Herb & Spice']
        },
        {
          id: 13,
          title: 'Tiệc cưới - Tặng rượu vang',
          description: 'Đặt tiệc cưới trên 30 khách và nhận tặng 2 chai rượu vang cao cấp.',
          imageUrl: '/images/promotions/wedding.jpg',
          validUntil: '2024-01-31',
          code: 'WEDDING',
          restaurants: ['Wedding Palace', 'Love Garden', 'Ceremony Hall']
        },
        {
          id: 14,
          title: 'Sinh viên - Giảm 25% mọi ngày',
          description: 'Dành cho học sinh, sinh viên có thẻ học sinh/sinh viên hợp lệ.',
          imageUrl: '/images/promotions/student.jpg',
          validUntil: '2023-12-31',
          code: 'STUDENT25',
          restaurants: ['Fast Bites', 'Campus Dining', 'Study Hall']
        },
        {
          id: 15,
          title: 'Đặt bàn qua app - Tích điểm x2',
          description: 'Đặt bàn qua ứng dụng DinerChill và nhận gấp đôi điểm thưởng.',
          imageUrl: '/images/promotions/app-booking.jpg',
          validUntil: '2023-10-31',
          code: 'APPX2',
          restaurants: ['Tất cả nhà hàng']
        },
        {
          id: 16,
          title: 'Cuối tuần buffet - Giảm 15%',
          description: 'Tất cả các buffet vào cuối tuần được giảm 15% khi đặt trước 1 ngày.',
          imageUrl: '/images/promotions/weekend-buffet.jpg',
          validUntil: '2023-12-31',
          code: 'WEEKEND15',
          restaurants: ['Buffet Paradise', 'All You Can Eat', 'Food Fiesta']
        }
      ]);
      setLoading(false);
    }, 800); // Simulate network delay
  }, []);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Go to next page
  const nextPage = () => {
    if (currentPage < Math.ceil(promotions.length / itemsPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Go to last page
  const lastPage = () => {
    setCurrentPage(Math.ceil(promotions.length / itemsPerPage));
  };

  // Get current promotions
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = promotions.slice(indexOfFirstItem, indexOfLastItem);

  // Calculate page numbers
  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(promotions.length / itemsPerPage); i++) {
    pageNumbers.push(i);
  }

  if (loading) {
    return (
      <div className="promo-page-container">
        <div className="loading-spinner">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="promo-page-container">
      <div className="promo-header">
        <h1>Ưu Đãi Hot</h1>
        <p>Khám phá những ưu đãi hấp dẫn từ các nhà hàng hàng đầu</p>
      </div>

      <div className="promotions-grid">
        {currentItems.map((promo) => (
          <div className="promo-card" key={promo.id}>
            <div className="promo-image">
              <img 
                src={promo.imageUrl || '/images/default-promo.jpg'} 
                alt={promo.title} 
                onError={(e) => {
                  e.target.src = '/images/default-promo.jpg';
                }}
              />
            </div>
            <div className="promo-content">
              <h3>{promo.title}</h3>
              <p className="promo-description">{promo.description}</p>
              <div className="promo-details">
                <p className="promo-code">Mã: <span>{promo.code}</span></p>
                <p className="promo-validity">Hiệu lực đến: {new Date(promo.validUntil).toLocaleDateString('vi-VN')}</p>
              </div>
              <div className="promo-restaurants">
                <p>Áp dụng tại:</p>
                <ul>
                  {promo.restaurants && promo.restaurants.map((restaurant, index) => (
                    <li key={index}>{restaurant}</li>
                  ))}
                </ul>
              </div>
              <button className="promo-button">Sử dụng ngay</button>
            </div>
          </div>
        ))}
      </div>

      <div className="pagination-container">
        <div className="pagination">
          {pageNumbers.map(number => (
            <button 
              key={number} 
              onClick={() => paginate(number)}
              className={currentPage === number ? 'active' : ''}
            >
              {number}
            </button>
          ))}
          <button onClick={nextPage} className="pagination-next">»</button>
          <button onClick={lastPage} className="pagination-last">»»</button>
        </div>
      </div>
    </div>
  );
}

export default PromoPage; 