import React, { createContext, useContext, useState, useEffect } from 'react';
import restaurantAPI from '../services/restaurantAPI'; // Giả lập API nhà hàng

const AppContext = createContext();

export function AppProvider({ children }) {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [recentlyViewed, setRecentlyViewed] = useState({}); // Lưu lịch sử xem theo danh mục

  // Khôi phục lịch sử xem từ localStorage khi khởi động
  useEffect(() => {
    const savedRecentlyViewed = localStorage.getItem('recentlyViewed');
    if (savedRecentlyViewed) {
      setRecentlyViewed(JSON.parse(savedRecentlyViewed));
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

  const login = (userData) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
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
      clearRecentlyViewed // Thêm hàm mới vào context
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}