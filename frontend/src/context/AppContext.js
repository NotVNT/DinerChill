import React, { createContext, useContext, useState, useEffect } from 'react';
import restaurantAPI from '../services/restaurantAPI'; // Giả lập API nhà hàng
import { authAPI } from '../services/api'; // API xác thực người dùng

const AppContext = createContext();

export function AppProvider({ children }) {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [recentlyViewed, setRecentlyViewed] = useState({}); // Lưu lịch sử xem theo danh mục

  // Khôi phục lịch sử xem và thông tin người dùng từ localStorage khi khởi động
  useEffect(() => {
    // Khôi phục lịch sử xem
    const savedRecentlyViewed = localStorage.getItem('recentlyViewed');
    if (savedRecentlyViewed) {
      setRecentlyViewed(JSON.parse(savedRecentlyViewed));
    }
    
    // Khôi phục thông tin người dùng
    const token = localStorage.getItem('dinerchillToken');
    if (token) {
      setLoading(true); // Đang tải khi kiểm tra người dùng
      authAPI.getCurrentUser()
        .then(userData => {
          if (userData) {
            setUser(userData);
          }
          setLoading(false);
        })
        .catch(error => {
          console.error('Lỗi khi lấy thông tin người dùng:', error);
          // Nếu token hết hạn hoặc không hợp lệ, xóa khỏi localStorage
          if (error.message && (
              error.message.includes('token') || 
              error.message.includes('unauthorized') ||
              error.message.includes('không hợp lệ') ||
              error.message.includes('hết hạn')
            )) {
            localStorage.removeItem('dinerchillToken');
          }
          setLoading(false);
        });
    }
  }, []);

  // Lưu lịch sử xem vào localStorage mỗi khi recentlyViewed thay đổi
  useEffect(() => {
    localStorage.setItem('recentlyViewed', JSON.stringify(recentlyViewed));
  }, [recentlyViewed]);

  // Hàm để thêm nhà hàng vào lịch sử xem
  const addToRecentlyViewed = (restaurant) => {
    if (!restaurant || !restaurant.id) return;

    setRecentlyViewed((prev) => {
      // Kiểm tra và đặt giá trị mặc định cho category
      const category = restaurant.category ? restaurant.category.toLowerCase() : 'khác';
      const updatedCategory = prev[category] ? [...prev[category]] : [];
      // Kiểm tra xem nhà hàng đã tồn tại trong lịch sử chưa
      const existingIndex = updatedCategory.findIndex(item => item.id === restaurant.id);
      if (existingIndex !== -1) {
        // Nếu đã tồn tại, xóa và thêm lại để đưa lên đầu
        updatedCategory.splice(existingIndex, 1);
      }
      // Thêm nhà hàng mới vào đầu danh sách
      updatedCategory.unshift(restaurant);
      // Giới hạn số lượng nhà hàng trong lịch sử (tối đa 10 nhà hàng mỗi danh mục)
      if (updatedCategory.length > 10) {
        updatedCategory.pop();
      }
      return {
        ...prev,
        [category]: updatedCategory,
      };
    });
  };

  // Hàm để xóa toàn bộ lịch sử xem
  const clearRecentlyViewed = () => {
    setRecentlyViewed({});
    localStorage.removeItem('recentlyViewed');
  };

  // Đăng nhập người dùng
  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      setUser(response.user);
      // Lưu token vào localStorage
      localStorage.setItem('dinerchillToken', response.token);
      return true;
    } catch (error) {
      console.error('Lỗi đăng nhập:', error);
      throw error;
    }
  };
  
  // Đăng ký người dùng mới
  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      // Only set user and token if the response doesn't require verification
      if (!response.requiresVerification) {
        localStorage.setItem('dinerchillToken', response.token);
        setUser(response.user);
      }
      return response;
    } catch (err) {
      console.error('Register error:', err);
      throw err;
    }
  };
  
  // Xác thực email
  const verifyEmail = async (email, code) => {
    try {
      const response = await authAPI.verifyEmail(email, code);
      if (response.token) {
        localStorage.setItem('dinerchillToken', response.token);
        setUser(response.user);
      }
      return response;
    } catch (err) {
      console.error('Email verification error:', err);
      throw err;
    }
  };
  
  // Gửi lại mã xác thực
  const resendVerification = async (email) => {
    try {
      return await authAPI.resendVerification(email);
    } catch (err) {
      console.error('Resend verification error:', err);
      throw err;
    }
  };
  
  // Đăng xuất
  const logout = () => {
    localStorage.removeItem('dinerchillToken');
    setUser(null);
  };

  // Lấy dữ liệu nhà hàng từ API và chuẩn hóa dữ liệu
  useEffect(() => {
    setLoading(true);
    restaurantAPI.getAll()
      .then(data => {
        // Chuẩn hóa dữ liệu: đảm bảo tất cả nhà hàng đều có category
        const normalizedData = data.map(restaurant => ({
          ...restaurant,
          category: restaurant.category || 'Khác',
        }));
        setRestaurants(normalizedData);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Google Login
  const googleLogin = async (tokenId) => {
    try {
      const response = await authAPI.googleLogin(tokenId);
      
      // Nếu tên người dùng từ Google có ký tự đặc biệt (như trong hình), sửa lại
      if (response.user && response.user.name) {
        // Xử lý các trường hợp tên Google bị lỗi hiển thị (ví dụ: có ký tự UTF-8 không hiển thị được)
        if (response.user.name.includes('\\')) {
          response.user.name = response.user.displayName || response.user.email.split('@')[0] || 'Người dùng';
        }
      }
      
      setUser(response.user);
      // Lưu token vào localStorage
      localStorage.setItem('dinerchillToken', response.token);
      return true;
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    }
  };

  return (
    <AppContext.Provider value={{ 
      restaurants, 
      loading, 
      error, 
      user, 
      login, 
      logout, 
      recentlyViewed, 
      addToRecentlyViewed,
      clearRecentlyViewed,
      register,
      verifyEmail,
      resendVerification,
      googleLogin
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}