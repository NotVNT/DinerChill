import axios from 'axios';

// Sử dụng BASE_URL từ nhánh develop nhưng đổi tên thành API_URL để nhất quán với nhánh User
const API_URL = 'https://jsonplaceholder.typicode.com';

// Hàm ánh xạ dữ liệu từ API giả lập sang định dạng nhà hàng (từ nhánh develop)
const mapToRestaurant = (data) => {
  const rawRating = (data.id % 5) + 1; // Tạo rating từ 1.0 đến 5.0
  const rating = Math.min(Math.max(rawRating, 0), 5); // Đảm bảo 0 <= rating <= 5

  // Mở rộng danh sách categories để bao gồm các danh mục từ nhánh User
  const categories = [
    'Lẩu', 'Buffet', 'Hải sản', 'Nướng', 'Việt Nam', 'Nhật Bản', // Từ nhánh develop
    'Quán Nhậu', 'Chay', 'Đồ tiệc', 'Hàn Quốc', 'Món Thái', 'Trung Hoa', // Từ nhánh User
    'Tiệc cưới', 'Đồ uống', 'Luxury', 'Tourist', 'Lunch', // Thêm các danh mục khác
  ];
  const category = categories[data.id % categories.length];

  return {
    id: data.id,
    name: `Nhà hàng ${data.title.slice(0, 20)}`,
    cuisine: category, // Sử dụng category thay vì data.body để khớp với danh mục
    rating: rating,
    image: `https://via.placeholder.com/300x200?text=Nhà+hàng+${data.id}`,
    description: data.body,
    location: `Địa chỉ giả ${data.id}, Quận ${data.id % 10 + 1}, TP. Hồ Chí Minh`,
    category: category,
    discount: data.id % 2 === 0 ? 'Đặt bàn giảm giá' : undefined,
  };
};

// Hàm helper để gọi API (từ nhánh User)
const fetchData = async (endpoint, errorMessage, params = {}) => {
  try {
    const response = await axios.get(`${API_URL}${endpoint}`, { params });
    // Ánh xạ dữ liệu từ API giả lập sang định dạng nhà hàng
    return response.data.map(mapToRestaurant) || [];
  } catch (error) {
    console.error(errorMessage, error);
    return [];
  }
};

// Hàm lấy toàn bộ danh sách nhà hàng (từ nhánh User, tích hợp logic từ develop)
export const getAll = (page = 1, limit = 20) =>
  fetchData(`/posts?_page=${page}&_limit=${limit}`, 'Lỗi khi lấy toàn bộ danh sách nhà hàng:');

// Hàm lấy chi tiết nhà hàng theo ID (từ nhánh develop)
export const getById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/posts/${id}`);
    return mapToRestaurant(response.data);
  } catch (error) {
    console.error('Lỗi khi lấy chi tiết nhà hàng:', error);
    return null; // Trả về null thay vì ném lỗi để an toàn hơn
  }
};

// Hàm lấy danh sách nhà hàng ưu đãi hot (từ nhánh User)
export const getHotRestaurants = (page = 1, limit = 10) =>
  fetchData(`/posts?_page=${page}&_limit=${limit}`, 'Lỗi khi lấy danh sách nhà hàng ưu đãi hot:');

// Hàm lấy danh sách sản phẩm ưu đãi hot (từ nhánh User)
export const getHotProducts = (page = 1, limit = 10) =>
  fetchData(`/posts?_page=${page}&_limit=${limit}`, 'Lỗi khi lấy danh sách sản phẩm ưu đãi hot:');

// Hàm lấy danh sách nhà hàng được đề xuất (từ nhánh User)
export const getRecommendedRestaurants = (page = 1, limit = 10) =>
  fetchData(`/posts?_page=${page}&_limit=${limit}`, 'Lỗi khi lấy danh sách nhà hàng được đề xuất:');

// Hàm lấy danh sách nhà hàng phù hợp đặt tiệc (từ nhánh User)
export const getPartyRestaurants = (page = 1, limit = 10) =>
  fetchData(`/posts?_page=${page}&_limit=${limit}`, 'Lỗi khi lấy danh sách nhà hàng phù hợp đặt tiệc:');

// Hàm lấy danh sách địa danh nổi tiếng (từ nhánh User)
export const getFamousLocations = (page = 1, limit = 10) =>
  fetchData(`/posts?_page=${page}&_limit=${limit}`, 'Lỗi khi lấy danh sách địa danh nổi tiếng:');

// Hàm lấy danh sách nhà hàng hải sản (từ nhánh User)
export const getSeafoodRestaurants = (page = 1, limit = 10) =>
  fetchData(`/posts?_page=${page}&_limit=${limit}`, 'Lỗi khi lấy danh sách nhà hàng hải sản:');

// Hàm lấy danh sách nhà hàng món Trung (từ nhánh User)
export const getChineseRestaurants = (page = 1, limit = 10) =>
  fetchData(`/posts?_page=${page}&_limit=${limit}`, 'Lỗi khi lấy danh sách nhà hàng món Trung:');

// Hàm lấy danh sách phong cách ẩm thực phổ biến (từ nhánh User)
export const getPopularCuisines = (page = 1, limit = 10) =>
  fetchData(`/posts?_page=${page}&_limit=${limit}`, 'Lỗi khi lấy danh sách phong cách ẩm thực phổ biến:');

// Hàm lấy danh sách nhà hàng yêu thích hàng tháng (từ nhánh User)
export const getMonthlyFavorites = (page = 1, limit = 10) =>
  fetchData(`/posts?_page=${page}&_limit=${limit}`, 'Lỗi khi lấy danh sách nhà hàng yêu thích hàng tháng:');

// Hàm lấy danh sách nhà hàng theo tiện ích (từ nhánh User)
export const getAmenitiesRestaurants = (page = 1, limit = 10) =>
  fetchData(`/posts?_page=${page}&_limit=${limit}`, 'Lỗi khi lấy danh sách nhà hàng theo tiện ích:');

// Hàm lấy danh sách nhà hàng cao cấp (từ nhánh User)
export const getLuxuryRestaurants = (page = 1, limit = 10) =>
  fetchData(`/posts?_page=${page}&_limit=${limit}`, 'Lỗi khi lấy danh sách nhà hàng cao cấp:');

// Hàm lấy danh sách nhà hàng uy tín (từ nhánh User)
export const getTrustedRestaurants = (page = 1, limit = 10) =>
  fetchData(`/posts?_page=${page}&_limit=${limit}`, 'Lỗi khi lấy danh sách nhà hàng uy tín:');

// Hàm lấy danh sách nhà hàng cho du khách (từ nhánh User)
export const getTouristRestaurants = (page = 1, limit = 10) =>
  fetchData(`/posts?_page=${page}&_limit=${limit}`, 'Lỗi khi lấy danh sách nhà hàng cho du khách:');

// Hàm lấy danh sách gợi ý ăn trưa (từ nhánh User)
export const getLunchSuggestions = (page = 1, limit = 10) =>
  fetchData(`/posts?_page=${page}&_limit=${limit}`, 'Lỗi khi lấy danh sách gợi ý ăn trưa:');

// Hàm lấy danh sách nhà hàng mới trên DinerChill (từ nhánh User)
export const getNewOnDinerChill = (page = 1, limit = 10) =>
  fetchData(`/posts?_page=${page}&_limit=${limit}`, 'Lỗi khi lấy danh sách nhà hàng mới trên DinerChill:');

// Hàm lấy danh sách tin tức và blog (từ nhánh User)
export const getNewsAndBlog = (page = 1, limit = 10) =>
  fetchData(`/posts?_page=${page}&_limit=${limit}`, 'Lỗi khi lấy danh sách tin tức và blog:');