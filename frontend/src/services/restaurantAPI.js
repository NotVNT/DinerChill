import axios from 'axios';

// Cấu hình base URL cho API
const BASE_URL = 'https://jsonplaceholder.typicode.com';

// Hàm ánh xạ dữ liệu từ API giả lập sang định dạng nhà hàng
const mapToRestaurant = (data) => {
  const rawRating = (data.id % 5) + 1; // Tạo rating từ 1.0 đến 5.0
  const rating = Math.min(Math.max(rawRating, 0), 5); // Đảm bảo 0 <= rating <= 5

  // Danh mục khớp với danh sách trong RestaurantPage.js
  const categories = ['Lẩu', 'Buffet', 'Hải sản', 'Lẩu & Nướng', 'Món Việt', 'Nhật Bản'];
  const category = categories[data.id % categories.length];

  return {
    id: data.id,
    name: `Nhà hàng ${data.title.slice(0, 20)}`,
    cuisine: data.body.slice(0, 20),
    rating: rating,
    image: `https://via.placeholder.com/300x200?text=Nhà+hàng+${data.id}`,
    description: data.body,
    location: `Địa chỉ giả ${data.id}, Quận ${data.id % 10 + 1}, TP. Hồ Chí Minh`,
    category: category,
    discount: data.id % 2 === 0 ? 'Đặt bàn giảm giá' : undefined,
  };
};

const restaurantAPI = {
  getAll: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/posts?_limit=6`);
      return response.data.map(mapToRestaurant);
    } catch (error) {
      throw new Error('Không thể tải danh sách nhà hàng');
    }
  },

  getById: async (id) => {
    try {
      const response = await axios.get(`${BASE_URL}/posts/${id}`);
      return mapToRestaurant(response.data);
    } catch (error) {
      throw new Error('Không thể tải chi tiết nhà hàng');
    }
  },
};

export default restaurantAPI;