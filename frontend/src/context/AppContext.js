import React, { createContext, useState, useEffect, useContext } from 'react';
import { restaurantAPI, reservationAPI, authAPI } from '../services/api';

// Tạo context
const AppContext = createContext();

// Tạo provider component
export function AppProvider({ children }) {
  // Danh sách nhà hàng
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Danh sách đặt bàn
  const [reservations, setReservations] = useState([]);
  
  // Thông tin xác thực người dùng
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  // Kiểm tra xem người dùng đã đăng nhập chưa
  useEffect(() => {
    const checkAuth = async () => {
      setAuthLoading(true);
      try {
        // Lấy token từ localStorage
        const token = localStorage.getItem('dinerchillToken');
        
        if (!token) {
          setUser(null);
          return;
        }
        
        // Kiểm tra token với backend
        const userData = await authAPI.getCurrentUser();
        setUser(userData);
      } catch (err) {
        console.error('Auth check error:', err);
        // Xóa token không hợp lệ
        localStorage.removeItem('dinerchillToken');
        setUser(null);
      } finally {
        setAuthLoading(false);
      }
    };
    
    checkAuth();
  }, []);
  
  // Lấy danh sách nhà hàng khi component mount
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true);
        const data = await restaurantAPI.getAll();
        setRestaurants(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching restaurants:', err);
        setError('Không thể tải danh sách nhà hàng. Vui lòng thử lại sau.');
        
        // Dữ liệu mẫu nếu API bị lỗi
        setRestaurants([
          {
            id: 1,
            name: 'Nhà hàng Việt Phố',
            cuisine: 'Việt Nam',
            rating: 4.5,
            image: 'https://via.placeholder.com/300x200',
            description: 'Nhà hàng chuyên về ẩm thực Việt Nam truyền thống.'
          },
          {
            id: 2,
            name: 'Pizza Express',
            cuisine: 'Ý',
            rating: 4.3,
            image: 'https://via.placeholder.com/300x200',
            description: 'Các loại pizza và món Ý đích thực.'
          },
          {
            id: 3,
            name: 'Sushi World',
            cuisine: 'Nhật Bản',
            rating: 4.7,
            image: 'https://via.placeholder.com/300x200',
            description: 'Sushi và các món Nhật ngon tuyệt.'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRestaurants();
  }, []);
  
  // Lấy chi tiết nhà hàng theo ID
  const getRestaurantById = async (id) => {
    try {
      return await restaurantAPI.getById(id);
    } catch (err) {
      console.error(`Error fetching restaurant ${id}:`, err);
      return restaurants.find(restaurant => restaurant.id === Number(id)) || null;
    }
  };
  
  // Thêm đặt bàn mới
  const addReservation = async (reservationData) => {
    try {
      const newReservation = await reservationAPI.create(reservationData);
      setReservations(prevReservations => [...prevReservations, newReservation]);
      return newReservation;
    } catch (err) {
      console.error('Error creating reservation:', err);
      
      // Fallback lưu vào localStorage nếu API bị lỗi
      const fallbackReservation = {
        id: Date.now(),
        ...reservationData,
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      
      setReservations(prevReservations => [...prevReservations, fallbackReservation]);
      
      // Lưu vào localStorage
      const savedReservations = JSON.parse(localStorage.getItem('reservations') || '[]');
      localStorage.setItem('reservations', JSON.stringify([...savedReservations, fallbackReservation]));
      
      return fallbackReservation;
    }
  };
  
  // Hủy đặt bàn
  const cancelReservation = async (id) => {
    try {
      await reservationAPI.delete(id);
      setReservations(prevReservations => 
        prevReservations.filter(reservation => reservation.id !== id)
      );
      return true;
    } catch (err) {
      console.error(`Error deleting reservation ${id}:`, err);
      return false;
    }
  };
  
  // Thêm đánh giá nhà hàng
  const addReview = async (restaurantId, reviewData) => {
    try {
      return await restaurantAPI.addReview(restaurantId, reviewData);
    } catch (err) {
      console.error(`Error adding review for restaurant ${restaurantId}:`, err);
      throw err;
    }
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

  const changePassword = async (currentPassword, newPassword) => {
    try {
      const response = await authAPI.changePassword({
        currentPassword,
        newPassword
      });
      
      // Có thể thêm xử lý thành công ở đây nếu cần
      return response;
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  };

  // Add updateProfile function
  const updateProfile = async (userData) => {
    try {
      const updatedUser = await authAPI.updateProfile(userData);
      setUser(updatedUser); // Update the user state with new data
      return updatedUser;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  // Google Login
  const googleLogin = async (tokenId) => {
    try {
      const response = await authAPI.googleLogin(tokenId);
      setUser(response.user);
      // Lưu token vào localStorage
      localStorage.setItem('dinerchillToken', response.token);
      return true;
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    }
  };

  // Giá trị context
  const contextValue = {
    restaurants,
    loading,
    error,
    reservations,
    user,
    authLoading,
    login,
    register,
    logout,
    updateProfile,
    addReservation,
    cancelReservation,
    getRestaurantById,
    addReview,
    changePassword,
    verifyEmail,
    resendVerification,
    googleLogin,
    setUser
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

// Hook để sử dụng context
export function useApp() {
  return useContext(AppContext);
} 