import axios from 'axios';

// Sử dụng BASE_URL từ nhánh develop nhưng đổi tên thành API_URL để nhất quán với nhánh User
const API_URL = 'http://localhost:5000/api';

// Hàm ánh xạ dữ liệu từ API sang định dạng nhà hàng
const mapToRestaurant = (data) => {
  const rawRating = (data.rating || (data.id % 5) + 1); // Sử dụng rating từ API nếu có, nếu không dùng logic ngẫu nhiên
  const rating = Math.min(Math.max(rawRating, 0), 5); // Đảm bảo 0 <= rating <= 5

  // Danh sách categories khớp với AppContext.js
  const categories = [
    'all',
    'hotRestaurants',
    'hotProducts',
    'recommendedRestaurants',
    'partyRestaurants',
    'famousLocations',
    'seafoodRestaurants',
    'chineseRestaurants',
    'popularCuisines',
    'monthlyFavorites',
    'amenitiesRestaurants',
    'luxuryRestaurants',
    'trustedRestaurants',
    'touristRestaurants',
    'lunchSuggestions',
    'newOnDinerChill',
    'newsAndBlog',
  ];
  const category = data.category || categories[data.id % categories.length]; // Sử dụng category từ API nếu có

  return {
    id: data.id,
    name: data.name || `Nhà hàng ID-${data.id}`, // Sử dụng name từ API nếu có
    cuisine: data.cuisine || category,
    rating: rating,
    reviewCount: data.reviewCount || (data.id % 100 + 20), // Sử dụng reviewCount từ API nếu có
    image: data.image || `https://images.unsplash.com/photo-1600585154340-be6161a56a0c?fit=crop&w=300&h=200&q=80&id=${data.id}`,
    mainImage: data.mainImage || `https://images.unsplash.com/photo-1600585154340-be6161a56a0c?fit=crop&w=300&h=200&q=80&id=${data.id}`,
    images: data.images || [
      { image_url: `https://images.unsplash.com/photo-1600585154340-be6161a56a0c?fit=crop&w=300&h=200&q=80&id=${data.id}` },
      { image_url: `https://images.unsplash.com/photo-1600585154360-0e7d76a0e0e7?fit=crop&w=300&h=200&q=80&id=${data.id}-2` },
    ],
    description: data.description || data.body || 'Không có mô tả',
    address: data.address || `Địa chỉ giả ${data.id}, Quận ${data.id % 10 + 1}, TP. Hồ Chí Minh`,
    location: data.location || { latitude: 10.7769 + (data.id % 10) * 0.001, longitude: 106.7009 + (data.id % 10) * 0.001 },
    category: category,
    discount: data.discount,
    promotions: data.promotions || [],
    menu: data.menu || [],
    reviews: data.reviews || [],
    similarRestaurants: data.similarRestaurants || [],
    openingHours: data.openingHours || (data.id % 2 === 0 ? "10:00 - 22:00" : "11:00 - 23:00"),
    openTime: data.openTime || (data.id % 2 === 0 ? "10:00" : "11:00"),
    closeTime: data.closeTime || (data.id % 2 === 0 ? "22:00" : "23:00"),
    capacity: data.capacity || (50 + (data.id % 50)),
    booking: data.booking || { minPeople: 1, maxPeople: 10, availableTimes: ["10:00", "12:00", "18:00"] },
    contact: data.contact || { phone: `028 ${1000 + data.id}` },
    distance: data.distance || ((data.id % 10) + 0.5),
    createdAt: data.createdAt || "2025-05-15T03:30:00.000Z",
    updatedAt: data.updatedAt || "2025-05-15T04:00:00.000Z",
    introduction: data.introduction || data.body || 'Không có thông tin giới thiệu',
    detailImages: data.detailImages || [],
    suitableFor: data.suitableFor || '',
    signatureDish: data.signatureDish || '',
    ambiance: data.ambiance || '',
    parking: data.parking || '',
    parkingDetails: data.parkingDetails || '',
    highlight: data.highlight || '',
    amenities: data.amenities || {},
    operatingHours: data.operatingHours || [],
    rules: data.rules || [],
    priceRange: data.priceRange || '',
  };
};

// Hàm helper để gọi API (hỗ trợ GET, POST, PUT, DELETE)
const fetchData = async (method, endpoint, errorMessage, params = {}, data = null) => {
  try {
    const config = { method, url: `${API_URL}${endpoint}`, params };
    if (data) config.data = data;
    const response = await axios(config);

    // Kiểm tra và ánh xạ dữ liệu
    if (method === 'get') {
      if (!Array.isArray(response.data)) {
        console.error(`${errorMessage} Dữ liệu trả về không phải mảng:`, response.data);
        return [];
      }
      return response.data.map(mapToRestaurant);
    }
    return response.data;
  } catch (error) {
    console.error(errorMessage, error);
    if (method === 'get') return [];
    throw error; // Ném lỗi để xử lý ở nơi gọi
  }
};

// Hàm lấy toàn bộ danh sách nhà hàng
export const getAll = (page = 1, limit = 20) =>
  fetchData('get', `/posts?_page=${page}&_limit=${limit}`, 'Lỗi khi lấy toàn bộ danh sách nhà hàng:');

// Hàm lấy chi tiết nhà hàng theo ID
export const getById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/posts/${id}`);
    return mapToRestaurant(response.data);
  } catch (error) {
    console.error('Lỗi khi lấy chi tiết nhà hàng:', error);
    return null;
  }
};

// Hàm tạo nhà hàng mới
export const createRestaurant = async (restaurantData) => {
  try {
    const response = await axios.post(`${API_URL}/posts`, restaurantData);
    return mapToRestaurant(response.data);
  } catch (error) {
    console.error('Lỗi khi tạo nhà hàng mới:', error);
    throw error;
  }
};

// Hàm cập nhật nhà hàng
export const updateRestaurant = async (id, restaurantData) => {
  try {
    const response = await axios.put(`${API_URL}/posts/${id}`, restaurantData);
    return mapToRestaurant(response.data);
  } catch (error) {
    console.error('Lỗi khi cập nhật nhà hàng:', error);
    throw error;
  }
};

// Hàm xóa nhà hàng
export const deleteRestaurant = async (id) => {
  try {
    await axios.delete(`${API_URL}/posts/${id}`);
    return true;
  } catch (error) {
    console.error('Lỗi khi xóa nhà hàng:', error);
    throw error;
  }
};

// Hàm tạo đặt bàn
export const createReservation = async (reservationData) => {
  try {
    const response = await axios.post(`${API_URL}/reservations`, reservationData);
    return response.data;
  } catch (error) {
    console.error('Lỗi khi tạo đặt bàn:', error);
    throw error;
  }
};

// Hàm lấy danh sách nhà hàng ưu đãi hot
export const getHotRestaurants = (page = 1, limit = 10) =>
  fetchData('get', `/posts?_page=${page}&_limit=${limit}`, 'Lỗi khi lấy danh sách nhà hàng ưu đãi hot:');

// Hàm lấy danh sách sản phẩm ưu đãi hot
export const getHotProducts = (page = 1, limit = 10) =>
  fetchData('get', `/posts?_page=${page}&_limit=${limit}`, 'Lỗi khi lấy danh sách sản phẩm ưu đãi hot:');

// Hàm lấy danh sách nhà hàng được đề xuất
export const getRecommendedRestaurants = (page = 1, limit = 10) =>
  fetchData('get', `/posts?_page=${page}&_limit=${limit}`, 'Lỗi khi lấy danh sách nhà hàng được đề xuất:');

// Hàm lấy danh sách nhà hàng phù hợp đặt tiệc
export const getPartyRestaurants = (page = 1, limit = 10) =>
  fetchData('get', `/posts?_page=${page}&_limit=${limit}`, 'Lỗi khi lấy danh sách nhà hàng phù hợp đặt tiệc:');

// Hàm lấy danh sách địa danh nổi tiếng
export const getFamousLocations = (page = 1, limit = 10) =>
  fetchData('get', `/posts?_page=${page}&_limit=${limit}`, 'Lỗi khi lấy danh sách địa danh nổi tiếng:');

// Hàm lấy danh sách nhà hàng hải sản
export const getSeafoodRestaurants = (page = 1, limit = 10) =>
  fetchData('get', `/posts?_page=${page}&_limit=${limit}`, 'Lỗi khi lấy danh sách nhà hàng hải sản:');

// Hàm lấy danh sách nhà hàng món Trung
export const getChineseRestaurants = (page = 1, limit = 10) =>
  fetchData('get', `/posts?_page=${page}&_limit=${limit}`, 'Lỗi khi lấy danh sách nhà hàng món Trung:');

// Hàm lấy danh sách phong cách ẩm thực phổ biến
export const getPopularCuisines = (page = 1, limit = 10) =>
  fetchData('get', `/posts?_page=${page}&_limit=${limit}`, 'Lỗi khi lấy danh sách phong cách ẩm thực phổ biến:');

// Hàm lấy danh sách nhà hàng yêu thích hàng tháng
export const getMonthlyFavorites = (page = 1, limit = 10) =>
  fetchData('get', `/posts?_page=${page}&_limit=${limit}`, 'Lỗi khi lấy danh sách nhà hàng yêu thích hàng tháng:');

// Hàm lấy danh sách nhà hàng theo tiện ích
export const getAmenitiesRestaurants = (page = 1, limit = 10) =>
  fetchData('get', `/posts?_page=${page}&_limit=${limit}`, 'Lỗi khi lấy danh sách nhà hàng theo tiện ích:');

// Hàm lấy danh sách nhà hàng cao cấp
export const getLuxuryRestaurants = (page = 1, limit = 10) =>
  fetchData('get', `/posts?_page=${page}&_limit=${limit}`, 'Lỗi khi lấy danh sách nhà hàng cao cấp:');

// Hàm lấy danh sách nhà hàng uy tín
export const getTrustedRestaurants = (page = 1, limit = 10) =>
  fetchData('get', `/posts?_page=${page}&_limit=${limit}`, 'Lỗi khi lấy danh sách nhà hàng uy tín:');

// Hàm lấy danh sách nhà hàng cho du khách
export const getTouristRestaurants = (page = 1, limit = 10) =>
  fetchData('get', `/posts?_page=${page}&_limit=${limit}`, 'Lỗi khi lấy danh sách nhà hàng cho du khách:');

// Hàm lấy danh sách gợi ý ăn trưa
export const getLunchSuggestions = (page = 1, limit = 10) =>
  fetchData('get', `/posts?_page=${page}&_limit=${limit}`, 'Lỗi khi lấy danh sách gợi ý ăn trưa:');

// Hàm lấy danh sách nhà hàng mới trên DinerChill
export const getNewOnDinerChill = (page = 1, limit = 10) =>
  fetchData('get', `/posts?_page=${page}&_limit=${limit}`, 'Lỗi khi lấy danh sách nhà hàng mới trên DinerChill:');

// Hàm lấy danh sách tin tức và blog
export const getNewsAndBlog = (page = 1, limit = 10) =>
  fetchData('get', `/posts?_page=${page}&_limit=${limit}`, 'Lỗi khi lấy danh sách tin tức và blog:');