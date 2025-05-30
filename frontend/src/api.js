const API_BASE_URL = "http://localhost:5000/api";

// Hàm helper để xử lý API request
async function fetchAPI(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  // Thêm token xác thực vào header nếu có
  const token = localStorage.getItem("dinerchillToken");

  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  try {
    console.log(`Gọi API: ${url}`);
    const response = await fetch(url, config);

    // Always attempt to parse the JSON even if the status is not OK
    // This helps us get more detailed error messages from the backend
    let data;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error("Error parsing JSON response:", jsonError);
        // If JSON parsing fails, throw a generic error with the status
        if (!response.ok) {
          throw new Error(`Lỗi ${response.status}: ${response.statusText}`);
        }
      }
    }

    if (!response.ok) {
      console.error(`Lỗi API ${endpoint}:`, response.status, response.statusText);
      // Use error message from the response data if available
      const errorMessage = data && data.message 
        ? data.message 
        : `Lỗi ${response.status}: ${response.statusText}`;
      
      return Promise.reject({
        message: errorMessage,
        status: response.status,
        data: data,
      });
    }

    // If we parsed the data successfully, return it
    if (data) {
      return data;
    }

    // If we couldn't parse the data but the response is OK, return an error
    console.error(`Lỗi API ${endpoint}: Response không phải JSON`, contentType);
    return Promise.reject({
      message: "Response không phải định dạng JSON",
      status: response.status,
    });
  } catch (error) {
    console.error("API Error:", error);
    return Promise.reject(error);
  }
}

// API xác thực người dùng
export const authAPI = {
  login: (credentials) =>
    fetchAPI("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),

  register: (userData) =>
    fetchAPI("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    }),

  verifyEmail: (email, code) =>
    fetchAPI("/auth/verify-email", {
      method: "POST",
      body: JSON.stringify({ email, code }),
    }),

  resendVerification: (email) =>
    fetchAPI("/auth/resend-verification", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  getCurrentUser: () => fetchAPI("/auth/me"),

  updateProfile: (userData) => {
    // Xác định xem userData có phải FormData
    const isFormData = userData instanceof FormData;

    if (isFormData) {
      // Sử dụng fetchWithAuth cho FormData
      return fetchWithAuth("/auth/profile", {
        method: "PUT",
        body: userData,
      });
    } else {
      // Nếu là đối tượng JSON thông thường
      return fetchAPI("/auth/profile", {
        method: "PUT",
        body: JSON.stringify(userData),
      });
    }
  },

  checkEmail: (email) =>
    fetchAPI("/auth/check-email", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  forgotPassword: (data) =>
    fetchAPI("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  verifyResetCode: (data) =>
    fetchAPI("/auth/verify-reset-code", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  resetPassword: (data) =>
    fetchAPI("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  changePassword: (data) =>
    fetchAPI("/auth/change-password", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  setPassword: (newPassword) =>
    fetchAPI("/auth/set-password", {
      method: "POST",
      body: JSON.stringify({ newPassword }),
    }),

  googleLogin: (tokenId) =>
    fetchAPI("/auth/google-login", {
      method: "POST",
      body: JSON.stringify({ tokenId }),
    }),

  zaloLogin: (tokenId) =>
    fetchAPI("/auth/zalo-login", {
      method: "POST",
      body: JSON.stringify({ tokenId }),
    }),
};

// API đặt bàn
export const reservationAPI = {
  getAll: () => fetchAPI("/reservation"),

  getByUser: () => fetchAPI("/reservation/my?include=restaurant,table,payment"),

  create: (reservationData) =>
    fetchAPI("/reservation", {
      method: "POST",
      body: JSON.stringify(reservationData),
    }),

  update: (id, reservationData) =>
    fetchAPI(`/reservation/${id}`, {
      method: "PUT",
      body: JSON.stringify(reservationData),
    }),

  delete: (id) =>
    fetchAPI(`/reservation/${id}`, {
      method: "DELETE",
    }),

  refund: (id, refundData) =>
    fetchAPI(`/reservation/${id}/refund`, {
      method: "POST",
      body: JSON.stringify(refundData),
    }),
};

// API thanh toán
export const paymentAPI = {
  createPayment: (paymentData) =>
    fetchAPI("/payment/create", {
      method: "POST",
      body: JSON.stringify(paymentData),
    }),
    
  getPaymentInfo: (orderCode) =>
    fetchAPI(`/payment/info/${orderCode}?include=reservation`),
    
  confirmPayment: (paymentData) =>
    fetchAPI("/reservation/confirm", {
      method: "POST",
      body: JSON.stringify(paymentData),
    }),
};

// Helper để gọi API với authentication
export async function fetchWithAuth(endpoint, options = {}, retryCount = 2) {
  try {
    console.log(`Gọi API: ${endpoint}`, options);

    // Get token from localStorage
    const token = localStorage.getItem("dinerchillToken");
    if (!token) {
      throw new Error("Không có token xác thực. Vui lòng đăng nhập lại.");
    }

    // Create headers with authorization
    const headers = {
      Authorization: `Bearer ${token}`,
      ...options.headers,
    };

    // Don't add content-type for FormData
    if (options.body instanceof FormData) {
      // For FormData, let the browser set the Content-Type
      delete headers["Content-Type"];
    } else if (
      !headers["Content-Type"] &&
      !(options.body instanceof FormData)
    ) {
      headers["Content-Type"] = "application/json";
    }

    // Create fetch config
    const config = {
      ...options,
      headers,
    };

    try {
      // Make API call with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...config,
        signal: controller.signal,
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
      if (fetchError.name === "AbortError") {
        throw new Error("Yêu cầu bị hủy do quá thời gian chờ");
      }

      if (fetchError.message === "Failed to fetch" && retryCount > 0) {
        console.log(`Đang thử lại kết nối (${retryCount} lần còn lại)...`);
        // Thử lại sau 1 giây
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return fetchWithAuth(endpoint, options, retryCount - 1);
      }

      throw fetchError;
    }
  } catch (error) {
    console.error(`Lỗi khi gọi API ${endpoint}:`, error);
    throw error;
  }
}

// API nhà hàng công khai
export const restaurantsAPI = {
  getAll: async () => {
    try {
      // Try different possible API endpoints
      const endpoints = [
        "/restaurants", // Standard REST endpoint
        "/restaurant", // Singular form
        "/dinerchill-restaurants", // With app prefix
      ];

      // Try each endpoint until one works
      for (const endpoint of endpoints) {
        try {
          console.log(`Thử kết nối API endpoint: ${endpoint}`);
          const response = await fetchAPI(endpoint);
          console.log(`Endpoint ${endpoint} hoạt động!`);
          return response;
        } catch (err) {
          console.log(
            `Endpoint ${endpoint} không hoạt động:`,
            err.message || err
          );
        }
      }

      // If reaching here, none of the endpoints worked
      console.error("Tất cả các endpoints đều thất bại");

      // Try to get from admin API as last resort
      try {
        console.log("Thử lấy dữ liệu từ API admin");
        const response = await fetchWithAuth("/admin/restaurants");
        return response;
      } catch (adminErr) {
        console.error("API admin cũng thất bại:", adminErr);
        throw new Error("Không thể kết nối với API");
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách nhà hàng:", error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      if (!id) {
        throw new Error("ID nhà hàng không hợp lệ");
      }

      console.log(`Đang tìm nhà hàng với ID: ${id}`);

      // Simplify endpoint list to focus on most likely working endpoints
      const endpoints = [`/restaurants/${id}`, `/admin/restaurants/${id}`];

      // Try each endpoint until one works
      for (const endpoint of endpoints) {
        try {
          console.log(`Thử kết nối API endpoint: ${endpoint}`);
          const response = await fetchAPI(endpoint);
          if (response) {
            console.log(
              `Endpoint ${endpoint} hoạt động! Đã tìm thấy nhà hàng ID ${id}`
            );

            // If we got a response but it doesn't include images, try to fetch them separately
            if (!response.images || response.images.length === 0) {
              try {
                console.log("Thử lấy thêm hình ảnh từ API");
                const imagesResponse = await fetchAPI(
                  `/restaurants/${id}/images`
                );
                if (imagesResponse && Array.isArray(imagesResponse)) {
                  console.log(
                    `Đã tìm thấy ${imagesResponse.length} hình ảnh`,
                    imagesResponse
                  );
                  response.images = imagesResponse;
                }
              } catch (imgErr) {
                console.log("Không thể lấy thêm hình ảnh:", imgErr.message);
              }
            } else {
              console.log(
                `Nhà hàng đã có ${response.images.length} hình ảnh`,
                response.images
              );
            }

            // Process image paths to ensure they're properly formatted
            if (response.images && Array.isArray(response.images)) {
              response.images = response.images.map((img) => {
                if (typeof img === "object" && img.image_path) {
                  return img;
                } else if (typeof img === "string") {
                  return { image_path: img };
                }
                return img;
              });
            }

            return response;
          }
        } catch (err) {
          console.log(
            `Endpoint ${endpoint} không hoạt động:`,
            err.message || err
          );
          // Continue to the next endpoint
        }
      }

      // All attempts failed, throw error with detailed message
      throw new Error(`Không thể tìm thấy nhà hàng với ID: ${id}`);
    } catch (error) {
      console.error(`Lỗi khi lấy thông tin nhà hàng ${id}:`, error);
      throw error;
    }
  },

  getReviews: async (id) => {
    try {
      // Reviews functionality has been removed
      console.log("Review functionality has been removed");
      return [];
    } catch (error) {
      console.error(`Lỗi khi lấy đánh giá nhà hàng ${id}:`, error);
      throw error;
    }
  },

  addReview: async (id, reviewData) => {
    try {
      // Reviews functionality has been removed
      console.log("Review functionality has been removed");
      return {
        success: false,
        message: "Review functionality has been removed",
      };
    } catch (error) {
      console.error(`Lỗi khi thêm đánh giá cho nhà hàng ${id}:`, error);
      throw error;
    }
  },

  // Use admin endpoint as fallback if needed
  updateRestaurant: async (id, data) => {
    try {
      return await fetchWithAuth(`/admin/restaurants/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error(`Lỗi khi cập nhật nhà hàng ${id}:`, error);
      throw error;
    }
  },
};

// Nhóm API cho Admin
export const adminAPI = {
  getDashboard: () => fetchWithAuth("/admin/dashboard"),

  // Users
  getUsers: () => fetchWithAuth("/admin/users"),
  getUser: (id) => fetchWithAuth(`/admin/users/${id}`),
  updateUser: (id, userData) =>
    fetchWithAuth(`/admin/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(userData),
    }),
  deleteUser: (id) =>
    fetchWithAuth(`/admin/users/${id}`, {
      method: "DELETE",
    }),

  // Promotions
  promotions: {
    getAll: () => fetchWithAuth("/admin/promotions"),
    create: (promotionData) =>
      fetchWithAuth("/admin/promotions", {
        method: "POST",
        body: JSON.stringify(promotionData),
      }),
    getById: (id) => fetchWithAuth(`/admin/promotions/${id}`),
    update: (id, promotionData) =>
      fetchWithAuth(`/admin/promotions/${id}`, {
        method: "PUT",
        body: JSON.stringify(promotionData),
      }),
    delete: (id) =>
      fetchWithAuth(`/admin/promotions/${id}`, {
        method: "DELETE",
      }),
    toggleStatus: async (id, isActive) => {
      return fetchWithAuth(`/admin/promotions/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ isActive }),
      });
    },
  },

  // Categories
  getCategories: () => fetchWithAuth("/admin/categories"),

  createCategory: (formData) =>
    fetchWithAuth("/admin/categories", {
      method: "POST",
      body: formData,
    }),

  updateCategory: (id, formData) =>
    fetchWithAuth(`/admin/categories/${id}`, {
      method: "PUT",
      body: formData,
    }),

  deleteCategory: (id) =>
    fetchWithAuth(`/admin/categories/${id}`, {
      method: "DELETE",
    }),

  // Restaurants
  getRestaurants: async () => {
    try {
      const response = await fetchWithAuth("/admin/restaurants");
      return response;
    } catch (error) {
      console.error("Lỗi khi lấy danh sách nhà hàng:", error);
      throw error;
    }
  },

  createRestaurant: async (formData) => {
    try {
      console.log(
        "Đang gửi request tạo nhà hàng mới",
        formData.get("name"),
        formData.get("cuisineType"),
        formData.has("restaurantImages")
      );

      // Tăng timeout cho việc tạo nhà hàng có hình ảnh
      const response = await fetchWithAuth(
        "/admin/restaurants",
        {
          method: "POST",
          body: formData,
        },
        3
      ); // Thêm 3 lần thử lại

      return response;
    } catch (error) {
      console.error("Lỗi khi tạo nhà hàng:", error);
      if (error.message === "Yêu cầu bị hủy do quá thời gian chờ") {
        throw new Error(
          "Không thể lưu thông tin nhà hàng: Upload hình ảnh mất nhiều thời gian, vui lòng thử giảm kích thước hình hoặc thử lại sau"
        );
      }
      throw error;
    }
  },

  updateRestaurant: async (id, formData) => {
    try {
      console.log("Đang gửi request cập nhật nhà hàng", id);

      // Tăng timeout cho việc cập nhật nhà hàng có hình ảnh
      const response = await fetchWithAuth(
        `/admin/restaurants/${id}`,
        {
          method: "PUT",
          body: formData,
        },
        3
      ); // Thêm 3 lần thử lại

      return response;
    } catch (error) {
      console.error("Lỗi khi cập nhật nhà hàng:", error);
      if (error.message === "Yêu cầu bị hủy do quá thời gian chờ") {
        throw new Error(
          "Không thể lưu thông tin nhà hàng: Upload hình ảnh mất nhiều thời gian, vui lòng thử giảm kích thước hình hoặc thử lại sau"
        );
      }
      throw error;
    }
  },

  deleteRestaurant: async (id) => {
    try {
      console.log("Đang gửi request xóa nhà hàng", id);

      const response = await fetchWithAuth(`/admin/restaurants/${id}`, {
        method: "DELETE",
      });

      return response;
    } catch (error) {
      console.error("Lỗi khi xóa nhà hàng:", error);
      throw error;
    }
  },

  // Reservations
  getReservations: () => fetchWithAuth("/admin/reservations"),
  updateReservation: (id, reservationData) =>
    fetchWithAuth(`/admin/reservations/${id}`, {
      method: "PUT",
      body: JSON.stringify(reservationData),
    }),
  deleteReservation: (id) =>
    fetchWithAuth(`/admin/reservations/${id}`, {
      method: "DELETE",
    }),

  // Reviews
  getReviews: () => fetchWithAuth("/admin/reviews"),
  deleteReview: (id) =>
    fetchWithAuth(`/admin/reviews/${id}`, {
      method: "DELETE",
    }),

  updateReviewVerification: (id, isVerified) =>
    fetchWithAuth(`/admin/reviews/${id}/verify`, {
      method: "PATCH",
      body: JSON.stringify({ isVerified }),
    }),

  // Tables
  getTables: async (filters = {}) => {
    try {
      // Thêm restaurantId vào query params
      const queryParams = new URLSearchParams();
      if (filters.restaurantId) {
        queryParams.append("restaurantId", filters.restaurantId);
      }

      const response = await fetchWithAuth("/admin/tables", {
        params: queryParams,
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  createTable: (tableData) =>
    fetchWithAuth("/admin/tables", {
      method: "POST",
      body: JSON.stringify(tableData),
    }),

  updateTable: (id, tableData) =>
    fetchWithAuth(`/admin/tables/${id}`, {
      method: "PUT",
      body: JSON.stringify(tableData),
    }),

  deleteTable: (id) =>
    fetchWithAuth(`/admin/tables/${id}`, {
      method: "DELETE",
    }),
};

// Thêm API cho danh sách yêu thích
export const favoriteAPI = {
  getUserFavorites: () => fetchAPI("/favorites"),

  add: (restaurantId) =>
    fetchAPI("/favorites", {
      method: "POST",
      body: JSON.stringify({ restaurantId }),
    }),

  remove: (restaurantId) =>
    fetchAPI(`/favorites/${restaurantId}`, {
      method: "DELETE",
    }),
};

// API for categories
export const categoriesAPI = {
  getAll: () => fetchAPI("/categories"),
  
  getById: (id) => fetchAPI(`/categories/${id}`),
  
  getRestaurantsByCategory: (categoryId) => fetchAPI(`/categories/${categoryId}/restaurants`),
  
  getRestaurantsByCategoryName: (categoryName) => fetchAPI(`/categories/name/${categoryName}/restaurants`),
};
