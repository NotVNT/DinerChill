// src/services/restaurantAPI.js
import axios from 'axios';

const API_URL = 'https://your-api-endpoint.com/api';

// Hàm helper để gọi API
const fetchData = async (endpoint, errorMessage, params = {}) => {
  try {
    const response = await axios.get(`${API_URL}${endpoint}`, { params });
    return response.data || [];
  } catch (error) {
    console.error(errorMessage, error);
    return [];
  }
};

// Hàm lấy danh sách nhà hàng ưu đãi hot
export const getHotRestaurants = (page = 1, limit = 10) =>
  fetchData(`/restaurants/hot?page=${page}&limit=${limit}`, 'Lỗi khi lấy danh sách nhà hàng ưu đãi hot:');

// Hàm lấy danh sách sản phẩm ưu đãi hot
export const getHotProducts = (page = 1, limit = 10) =>
  fetchData(`/products/hot?page=${page}&limit=${limit}`, 'Lỗi khi lấy danh sách sản phẩm ưu đãi hot:');

// Hàm lấy danh sách nhà hàng được đề xuất
export const getRecommendedRestaurants = (page = 1, limit = 10) =>
  fetchData(`/restaurants/recommended?page=${page}&limit=${limit}`, 'Lỗi khi lấy danh sách nhà hàng được đề xuất:');

// Hàm lấy danh sách nhà hàng phù hợp đặt tiệc
export const getPartyRestaurants = (page = 1, limit = 10) =>
  fetchData(`/restaurants/party?page=${page}&limit=${limit}`, 'Lỗi khi lấy danh sách nhà hàng phù hợp đặt tiệc:');

// Hàm lấy danh sách địa danh nổi tiếng
export const getFamousLocations = (page = 1, limit = 10) =>
  fetchData(`/restaurants/locations?page=${page}&limit=${limit}`, 'Lỗi khi lấy danh sách địa danh nổi tiếng:');

// Hàm lấy danh sách nhà hàng hải sản
export const getSeafoodRestaurants = (page = 1, limit = 10) =>
  fetchData(`/restaurants/seafood?page=${page}&limit=${limit}`, 'Lỗi khi lấy danh sách nhà hàng hải sản:');

// Hàm lấy danh sách nhà hàng món Trung
export const getChineseRestaurants = (page = 1, limit = 10) =>
  fetchData(`/restaurants/chinese?page=${page}&limit=${limit}`, 'Lỗi khi lấy danh sách nhà hàng món Trung:');

// Hàm lấy danh sách phong cách ẩm thực phổ biến
export const getPopularCuisines = (page = 1, limit = 10) =>
  fetchData(`/restaurants/cuisines?page=${page}&limit=${limit}`, 'Lỗi khi lấy danh sách phong cách ẩm thực phổ biến:');

// Hàm lấy danh sách nhà hàng yêu thích hàng tháng
export const getMonthlyFavorites = (page = 1, limit = 10) =>
  fetchData(`/restaurants/monthly-favorites?page=${page}&limit=${limit}`, 'Lỗi khi lấy danh sách nhà hàng yêu thích hàng tháng:');

// Hàm lấy danh sách nhà hàng theo tiện ích
export const getAmenitiesRestaurants = (page = 1, limit = 10) =>
  fetchData(`/restaurants/amenities?page=${page}&limit=${limit}`, 'Lỗi khi lấy danh sách nhà hàng theo tiện ích:');

// Hàm lấy danh sách nhà hàng cao cấp
export const getLuxuryRestaurants = (page = 1, limit = 10) =>
  fetchData(`/restaurants/luxury?page=${page}&limit=${limit}`, 'Lỗi khi lấy danh sách nhà hàng cao cấp:');

// Hàm lấy danh sách nhà hàng uy tín
export const getTrustedRestaurants = (page = 1, limit = 10) =>
  fetchData(`/restaurants/trusted?page=${page}&limit=${limit}`, 'Lỗi khi lấy danh sách nhà hàng uy tín:');

// Hàm lấy danh sách nhà hàng cho du khách
export const getTouristRestaurants = (page = 1, limit = 10) =>
  fetchData(`/restaurants/tourist?page=${page}&limit=${limit}`, 'Lỗi khi lấy danh sách nhà hàng cho du khách:');

// Hàm lấy danh sách gợi ý ăn trưa
export const getLunchSuggestions = (page = 1, limit = 10) =>
  fetchData(`/products/lunch?page=${page}&limit=${limit}`, 'Lỗi khi lấy danh sách gợi ý ăn trưa:');

// Hàm lấy danh sách nhà hàng mới trên DinerChill
export const getNewOnDinerChill = (page = 1, limit = 10) =>
  fetchData(`/restaurants/new-on-dinerchill?page=${page}&limit=${limit}`, 'Lỗi khi lấy danh sách nhà hàng mới trên DinerChill:');

// Hàm lấy danh sách tin tức và blog
export const getNewsAndBlog = (page = 1, limit = 10) =>
  fetchData(`/blog?page=${page}&limit=${limit}`, 'Lỗi khi lấy danh sách tin tức và blog:');

// Hàm lấy toàn bộ danh sách nhà hàng
export const getAll = (page = 1, limit = 20) =>
  fetchData(`/restaurants?page=${page}&limit=${limit}`, 'Lỗi khi lấy toàn bộ danh sách nhà hàng:');