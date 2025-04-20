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
  
  verifyEmail: (email, code) => fetchAPI('/auth/verify-email', {
    method: 'POST',
    body: JSON.stringify({ email, code })
  }),
  
  resendVerification: (email) => fetchAPI('/auth/resend-verification', {
    method: 'POST',
    body: JSON.stringify({ email })
  }),
  
  getCurrentUser: () => fetchAPI('/auth/me'),
  
  updateProfile: (userData) => fetchAPI('/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(userData)
  }),
  
  checkEmail: (email) => fetchAPI('/auth/check-email', {
    method: 'POST',
    body: JSON.stringify({ email })
  }),
  
  forgotPassword: (data) => fetchAPI('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  
  verifyResetCode: (data) => fetchAPI('/auth/verify-reset-code', {
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
  
  setPassword: (newPassword) => fetchAPI('/auth/set-password', {
    method: 'POST',
    body: JSON.stringify({ newPassword })
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
export async function fetchWithAuth(endpoint, options = {}, retryCount = 2) {
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
    
    try {
      // Make API call with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...config,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      // Handle response
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          // If can't parse JSON, use status text
          throw new Error(`Lỗi ${response.status}: ${response.statusText}`);
        }
        
        // Create an error object with response data
        const error = new Error(errorData.message || `Lỗi ${response.status}`);
        error.response = { data: errorData, status: response.status };
        throw error;
      }
      
      // Parse successful response
      const result = await response.json();
      console.log(`Kết quả từ API ${endpoint}:`, result);
      return result;
    } catch (fetchError) {
      if (fetchError.name === 'AbortError') {
        throw new Error('Yêu cầu bị hủy do quá thời gian chờ');
      }
      
      if (fetchError.message === 'Failed to fetch' && retryCount > 0) {
        console.log(`Đang thử lại kết nối (${retryCount} lần còn lại)...`);
        // Thử lại sau 1 giây
        await new Promise(resolve => setTimeout(resolve, 1000));
        return fetchWithAuth(endpoint, options, retryCount - 1);
      }
      
      throw fetchError;
    }

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
  
  // Promotions
  promotions: {
    getAll: () => fetchWithAuth('/admin/promotions'),
    create: (promotionData) => fetchWithAuth('/admin/promotions', {
      method: 'POST',
      body: JSON.stringify(promotionData)
    }),
    getById: (id) => fetchWithAuth(`/admin/promotions/${id}`),
    update: (id, promotionData) => fetchWithAuth(`/admin/promotions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(promotionData)
    }),
    delete: (id) => fetchWithAuth(`/admin/promotions/${id}`, {
      method: 'DELETE'
    }),
    toggleStatus: async (id, isActive) => {
      try {
        return await fetchWithAuth(`/admin/promotions/${id}/status`, {
          method: 'PATCH',
          body: JSON.stringify({ isActive })
        });
      } catch (error) {
        if (error.message === 'Failed to fetch') {
          console.error('Lỗi kết nối tới máy chủ khi cập nhật trạng thái');
          throw new Error('Không thể kết nối tới máy chủ. Vui lòng kiểm tra kết nối mạng hoặc thử lại sau.');
        }
        throw error;
      }
    }
  },
  
  // Categories
  getCategories: () => fetchWithAuth('/admin/categories'),
  
  createCategory: (formData) => fetchWithAuth('/admin/categories', {
    method: 'POST',
    body: formData
  }),
  
  updateCategory: (id, formData) => fetchWithAuth(`/admin/categories/${id}`, {
    method: 'PUT',
    body: formData
  }),
  
  deleteCategory: (id) => fetchWithAuth(`/admin/categories/${id}`, {
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
      
      // Tăng timeout cho việc tạo nhà hàng có hình ảnh
      const response = await fetchWithAuth('/admin/restaurants', {
        method: 'POST',
        body: formData
      }, 3); // Thêm 3 lần thử lại
      
      return response;
    } catch (error) {
      console.error('Lỗi khi tạo nhà hàng:', error);
      if (error.message === 'Yêu cầu bị hủy do quá thời gian chờ') {
        throw new Error('Không thể lưu thông tin nhà hàng: Upload hình ảnh mất nhiều thời gian, vui lòng thử giảm kích thước hình hoặc thử lại sau');
      }
      throw error;
    }
  },
  
  updateRestaurant: async (id, formData) => {
    try {
      console.log('Đang gửi request cập nhật nhà hàng', id);
      
      // Tăng timeout cho việc cập nhật nhà hàng có hình ảnh
      const response = await fetchWithAuth(`/admin/restaurants/${id}`, {
        method: 'PUT',
        body: formData
      }, 3); // Thêm 3 lần thử lại
      
      return response;
    } catch (error) {
      console.error('Lỗi khi cập nhật nhà hàng:', error);
      if (error.message === 'Yêu cầu bị hủy do quá thời gian chờ') {
        throw new Error('Không thể lưu thông tin nhà hàng: Upload hình ảnh mất nhiều thời gian, vui lòng thử giảm kích thước hình hoặc thử lại sau');
      }
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
  }),

  updateReviewVerification: (id, isVerified) => fetchWithAuth(`/admin/reviews/${id}/verify`, {
    method: 'PATCH',
    body: JSON.stringify({ isVerified })
  }),


  // Tables
  getTables: async (filters = {}) => {
    try {
      // Thêm restaurantId vào query params
      const queryParams = new URLSearchParams();
      if (filters.restaurantId) {
        queryParams.append('restaurantId', filters.restaurantId);
      }
      
      const response = await fetchWithAuth('/admin/tables', {
        params: queryParams
      });
      return response;
    } catch (error) {
      throw error;
    }
  },
  
  createTable: (tableData) => fetchWithAuth('/admin/tables', {
    method: 'POST',
    body: JSON.stringify(tableData)
  }),
  
  updateTable: (id, tableData) => fetchWithAuth(`/admin/tables/${id}`, {
    method: 'PUT',
    body: JSON.stringify(tableData)
  }),
  
  deleteTable: (id) => fetchWithAuth(`/admin/tables/${id}`, {
    method: 'DELETE'
  }),
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