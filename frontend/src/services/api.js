const API_BASE_URL = 'http://localhost:5000/api';

// Hàm helper để xử lý API request
async function fetchAPI(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Thêm token xác thực vào header nếu có
  const token = localStorage.getItem('dinerchillToken');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers
  };
  
  const config = {
    ...options,
    headers
  };
  
  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const error = await response.json();
      return Promise.reject(error);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
}

// API xác thực người dùng
export const authAPI = {
  login: (credentials) => fetchAPI('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  }),
  
  register: (userData) => fetchAPI('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData)
  }),
  
  getCurrentUser: () => fetchAPI('/auth/me'),
  
  updateProfile: (userData) => fetchAPI('/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(userData)
  }),
  
  forgotPassword: (data) => fetchAPI('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  
  resetPassword: (data) => fetchAPI('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  
  changePassword: (data) => fetchAPI('/auth/change-password', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
};

// API của nhà hàng
export const restaurantAPI = {
  getAll: () => fetchAPI('/restaurants'),
  
  getById: (id) => fetchAPI(`/restaurants/${id}`),
  
  getReviews: (id) => fetchAPI(`/restaurants/${id}/reviews`),
  
  addReview: (id, reviewData) => fetchAPI(`/restaurants/${id}/reviews`, {
    method: 'POST',
    body: JSON.stringify(reviewData)
  })
};

// API đặt bàn
export const reservationAPI = {
  getAll: () => fetchAPI('/reservations'),
  
  getByUser: () => fetchAPI('/reservations/user'),
  
  create: (reservationData) => fetchAPI('/reservations', {
    method: 'POST',
    body: JSON.stringify(reservationData)
  }),
  
  update: (id, reservationData) => fetchAPI(`/reservations/${id}`, {
    method: 'PUT',
    body: JSON.stringify(reservationData)
  }),
  
  delete: (id) => fetchAPI(`/reservations/${id}`, {
    method: 'DELETE'
  })
};

// Helper để gọi API với authentication
export async function fetchWithAuth(endpoint, options = {}) {
  try {
    console.log(`Gọi API: ${endpoint}`, options);
    
    // Get token from localStorage
    const token = localStorage.getItem('dinerchillToken');
    if (!token) {
      throw new Error('Không có token xác thực. Vui lòng đăng nhập lại.');
    }
    
    // Create headers with authorization
    const headers = {
      'Authorization': `Bearer ${token}`,
      ...options.headers
    };
    
    // Don't add content-type for FormData
    if (options.body instanceof FormData) {
      // For FormData, let the browser set the Content-Type
      delete headers['Content-Type'];
    } else if (!headers['Content-Type'] && !(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }
    
    // Create fetch config
    const config = {
      ...options,
      headers
    };
    
    // Make API call
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    // Handle response
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        // If can't parse JSON, use status text
        throw new Error(`Lỗi ${response.status}: ${response.statusText}`);
      }
      
      // Throw error with message from server
      throw new Error(errorData.message || `Lỗi ${response.status}`);
    }
    
    // Parse successful response
    const result = await response.json();
    console.log(`Kết quả từ API ${endpoint}:`, result);
    return result;
  } catch (error) {
    console.error(`Lỗi khi gọi API ${endpoint}:`, error);
    throw error;
  }
}

// Nhóm API cho Admin
export const adminAPI = {
  getDashboard: () => fetchWithAuth('/admin/dashboard'),
  
  // Users
  getUsers: () => fetchWithAuth('/admin/users'),
  getUser: (id) => fetchWithAuth(`/admin/users/${id}`),
  updateUser: (id, userData) => fetchWithAuth(`/admin/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(userData)
  }),
  deleteUser: (id) => fetchWithAuth(`/admin/users/${id}`, {
    method: 'DELETE'
  }),
  
  // Restaurants
  getRestaurants: async () => {
    try {
      const response = await fetchWithAuth('/admin/restaurants');
      return response;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách nhà hàng:', error);
      throw error;
    }
  },
  
  createRestaurant: async (formData) => {
    try {
      console.log('Đang gửi request tạo nhà hàng mới', 
        formData.get('name'), 
        formData.get('cuisineType'),
        formData.has('restaurantImages')
      );
      
      const response = await fetchWithAuth('/admin/restaurants', {
        method: 'POST',
        body: formData
      });
      
      return response;
    } catch (error) {
      console.error('Lỗi khi tạo nhà hàng:', error);
      throw error;
    }
  },
  
  updateRestaurant: async (id, formData) => {
    try {
      console.log('Đang gửi request cập nhật nhà hàng', id);
      
      const response = await fetchWithAuth(`/admin/restaurants/${id}`, {
        method: 'PUT',
        body: formData
      });
      
      return response;
    } catch (error) {
      console.error('Lỗi khi cập nhật nhà hàng:', error);
      throw error;
    }
  },
  
  deleteRestaurant: async (id) => {
    try {
      console.log('Đang gửi request xóa nhà hàng', id);
      
      const response = await fetchWithAuth(`/admin/restaurants/${id}`, {
        method: 'DELETE'
      });
      
      return response;
    } catch (error) {
      console.error('Lỗi khi xóa nhà hàng:', error);
      throw error;
    }
  },
  
  // Reservations
  getReservations: () => fetchWithAuth('/admin/reservations'),
  updateReservation: (id, reservationData) => fetchWithAuth(`/admin/reservations/${id}`, {
    method: 'PUT',
    body: JSON.stringify(reservationData)
  }),
  deleteReservation: (id) => fetchWithAuth(`/admin/reservations/${id}`, {
    method: 'DELETE'
  }),
  
  // Reviews
  getReviews: () => fetchWithAuth('/admin/reviews'),
  deleteReview: (id) => fetchWithAuth(`/admin/reviews/${id}`, {
    method: 'DELETE'
  })
};

// Thêm API cho danh sách yêu thích
export const favoriteAPI = {
  getUserFavorites: () => fetchAPI('/favorites'),
  
  add: (restaurantId) => fetchAPI('/favorites', {
    method: 'POST',
    body: JSON.stringify({ restaurantId })
  }),
  
  remove: (restaurantId) => fetchAPI(`/favorites/${restaurantId}`, {
    method: 'DELETE'
  })
}; 