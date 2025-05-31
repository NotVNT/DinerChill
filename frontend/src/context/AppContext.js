import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI, reservationAPI } from '../api';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [restaurants, setRestaurants] = useState([]);
  const [hotRestaurants, setHotRestaurants] = useState([]);
  const [hotProducts, setHotProducts] = useState([]);
  const [recommendedRestaurants, setRecommendedRestaurants] = useState([]);
  const [partyRestaurants, setPartyRestaurants] = useState([]);
  const [famousLocations, setFamousLocations] = useState([]);
  const [seafoodRestaurants, setSeafoodRestaurants] = useState([]);
  const [chineseRestaurants, setChineseRestaurants] = useState([]);
  const [popularCuisines, setPopularCuisines] = useState([]);
  const [monthlyFavorites, setMonthlyFavorites] = useState([]);
  const [amenitiesRestaurants, setAmenitiesRestaurants] = useState([]);
  const [luxuryRestaurants, setLuxuryRestaurants] = useState([]);
  const [trustedRestaurants, setTrustedRestaurants] = useState([]);
  const [touristRestaurants, setTouristRestaurants] = useState([]);
  const [lunchSuggestions, setLunchSuggestions] = useState([]);
  const [newOnDinerChill, setNewOnDinerChill] = useState([]);
  const [newsAndBlog, setNewsAndBlog] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [page, setPage] = useState({
    all: 1,
    hotRestaurants: 1,
    hotProducts: 1,
    recommendedRestaurants: 1,
    partyRestaurants: 1,
    famousLocations: 1,
    seafoodRestaurants: 1,
    chineseRestaurants: 1,
    popularCuisines: 1,
    monthlyFavorites: 1,
    amenitiesRestaurants: 1,
    luxuryRestaurants: 1,
    trustedRestaurants: 1,
    touristRestaurants: 1,
    lunchSuggestions: 1,
    newOnDinerChill: 1,
    newsAndBlog: 1,
  });

  const [filters, setFilters] = useState({
    location: '',
    distance: 'all',
    cuisine: 'all',
    rating: 'all',
    price: 'all',
    operatingHours: 'all',
    keyword: '',
  });

  const [locations, setLocations] = useState([]);
  const [originalData, setOriginalData] = useState([]);

  const deduplicateData = (data) => {
    const seenIds = new Set();
    return data.filter(item => {
      if (seenIds.has(item.id)) return false;
      seenIds.add(item.id);
      return true;
    });
  };

  useEffect(() => {
    try {
      const savedRecentlyViewed = localStorage.getItem('recentlyViewed');
      if (savedRecentlyViewed) {
        setRecentlyViewed(JSON.parse(savedRecentlyViewed));
      }

      const token = localStorage.getItem('dinerchillToken');
      if (token) {
        setAuthLoading(true);
        authAPI.getCurrentUser()
          .then(userData => {
            if (userData) setUser(userData);
            setAuthLoading(false);
          })
          .catch(error => {
            console.error('Lỗi khi lấy thông tin người dùng:', error);
            if (error.message && (
              error.message.includes('token') ||
              error.message.includes('unauthorized') ||
              error.message.includes('không hợp lệ') ||
              error.message.includes('hết hạn')
            )) {
              localStorage.removeItem('dinerchillToken');
            }
            setAuthLoading(false);
          });
      } else {
        setAuthLoading(false);
      }
    } catch (err) {
      console.error('Lỗi khi truy cập localStorage:', err);
      setRecentlyViewed([]);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('recentlyViewed', JSON.stringify(recentlyViewed));
    } catch (err) {
      console.error('Lỗi khi lưu vào localStorage:', err);
    }
  }, [recentlyViewed]);

  const addToRecentlyViewed = useCallback((restaurant) => {
    if (!restaurant || !restaurant.id) return;
    setRecentlyViewed(prev => {
      const updated = [...prev];
      const existingIndex = updated.findIndex(item => item.id === restaurant.id);
      if (existingIndex !== -1) updated.splice(existingIndex, 1);
      updated.unshift(restaurant);
      if (updated.length > 10) updated.pop();
      return updated;
    });
  }, []);

  const removeFromRecentlyViewed = useCallback((restaurantId) => {
    setRecentlyViewed(prev => prev.filter(item => item.id !== restaurantId));
  }, []);

  const clearRecentlyViewed = useCallback(() => {
    setRecentlyViewed([]);
    localStorage.removeItem('recentlyViewed');
  }, []);

  const applyFilters = useCallback((data) => {
    let filteredData = [...(data || [])];
    if (filters.location && filters.location !== '') {
      filteredData = filteredData.filter(item => item.address?.includes(filters.location));
    }
    if (filters.distance !== 'all') {
      filteredData = filteredData.filter(item => {
        const distance = item.distance || 0;
        return filters.distance === 'near' ? distance <= 2 :
               filters.distance === 'under5km' ? distance <= 5 :
               filters.distance === 'under10km' ? distance <= 10 : true;
      });
    }
    if (filters.cuisine && filters.cuisine !== 'all') {
      filteredData = filteredData.filter(item =>
        (item.cuisine?.toLowerCase() || '').includes(filters.cuisine.toLowerCase())
      );
    }
    if (filters.rating !== 'all') {
      filteredData = filteredData.filter(item => {
        const rating = item.rating || 0;
        return filters.rating === 'above4' ? rating >= 4 :
               filters.rating === 'above3' ? rating >= 3 : true;
      });
    }
    if (filters.price !== 'all') {
      filteredData = filteredData.filter(item => {
        const averagePrice = item.averagePrice || 0;
        return filters.price === 'low' ? averagePrice < 100000 :
               filters.price === 'medium' ? (averagePrice >= 100000 && averagePrice < 300000) :
               filters.price === 'high' ? (averagePrice >= 300000 && averagePrice < 500000) :
               filters.price === 'luxury' ? averagePrice >= 500000 : true;
      });
    }
    if (filters.operatingHours !== 'all') {
      filteredData = filteredData.filter(item => {
        const openHour = item.openHour || 0;
        const closeHour = item.closeHour || 24;
        
        return filters.operatingHours === 'morning' ? (openHour <= 6 && closeHour >= 11) :
               filters.operatingHours === 'lunch' ? (openHour <= 11 && closeHour >= 14) :
               filters.operatingHours === 'evening' ? (openHour <= 17 && closeHour >= 22) :
               filters.operatingHours === 'latenight' ? (openHour <= 22 && closeHour >= 2) :
               filters.operatingHours === '24h' ? (openHour === 0 && closeHour === 24) : true;
      });
    }
    if (filters.keyword) {
      const keywordLower = filters.keyword.toLowerCase();
      filteredData = filteredData.filter(item =>
        (item.name?.toLowerCase() || '').includes(keywordLower) ||
        (item.description?.toLowerCase() || '').includes(keywordLower) ||
        (item.cuisine?.toLowerCase() || '').includes(keywordLower)
      );
    }
    return deduplicateData(filteredData);
  }, [filters]);

  const fetchInitialData = useCallback(() => {
    setLoading(true);
    setError(null);
    try {
      // Get real locations from the database or API instead of mock data
      const defaultLocations = [
        { LocationID: 1, LocationName: 'Hồ Chí Minh' },
        { LocationID: 2, LocationName: 'Hà Nội' },
        { LocationID: 3, LocationName: 'Đà Nẵng' },
      ];
      setLocations(defaultLocations);
      
      // No need to load mock data anymore
      setRestaurants([]);
      setOriginalData([]);
      // Data will now be loaded directly by the components that need it
    } catch (err) {
      console.error('Fetch initial data error:', err);
      setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  useEffect(() => {
    setRestaurants(applyFilters(originalData));
    setHotRestaurants(applyFilters(originalData.filter(r => r.category?.toLowerCase() === 'hotrestaurants')));
    setHotProducts(applyFilters(originalData.filter(r => r.category?.toLowerCase() === 'hotproducts')));
    setRecommendedRestaurants(applyFilters(originalData.filter(r => r.category?.toLowerCase() === 'recommendedrestaurants')));
    setPartyRestaurants(applyFilters(originalData.filter(r => r.category?.toLowerCase() === 'partyrestaurants')));
    setFamousLocations(applyFilters(originalData.filter(r => r.category?.toLowerCase() === 'famouslocations')));
    setSeafoodRestaurants(applyFilters(originalData.filter(r => r.cuisine?.toLowerCase() === 'seafood')));
    setChineseRestaurants(applyFilters(originalData.filter(r => r.cuisine?.toLowerCase() === 'chinese')));
    setPopularCuisines(applyFilters(originalData.filter(r => r.cuisine?.toLowerCase() !== 'khác')));
    setMonthlyFavorites(applyFilters(originalData.filter(r => r.category?.toLowerCase() === 'monthlyfavorites')));
    setAmenitiesRestaurants(applyFilters(originalData.filter(r => r.category?.toLowerCase() === 'amenitiesrestaurants')));
    setLuxuryRestaurants(applyFilters(originalData.filter(r => r.category?.toLowerCase() === 'luxuryrestaurants')));
    setTrustedRestaurants(applyFilters(originalData.filter(r => r.category?.toLowerCase() === 'trustedrestaurants')));
    setTouristRestaurants(applyFilters(originalData.filter(r => r.category?.toLowerCase() === 'touristrestaurants')));
    setLunchSuggestions(applyFilters(originalData.filter(r => r.category?.toLowerCase() === 'lunchsuggestions')));
    setNewOnDinerChill(applyFilters(originalData.filter(r => r.category?.toLowerCase() === 'newondinerchill')));
    setNewsAndBlog(applyFilters(originalData.filter(r => r.category?.toLowerCase() === 'newsandblog')));
  }, [filters, applyFilters, originalData]);

  const loadMore = async (category) => {
    setLoading(true);
    setError(null);
    try {
      const nextPage = page[category] + 1;
      const pageSize = category === 'all' ? 20 : 10;
      const newData = originalData
        .filter(r => r.category?.toLowerCase() === category)
        .slice((nextPage - 1) * pageSize, nextPage * pageSize);

      const updateState = {
        all: () => setRestaurants(prev => deduplicateData([...prev, ...newData])),
        hotRestaurants: () => setHotRestaurants(prev => deduplicateData([...prev, ...newData])),
        hotProducts: () => setHotProducts(prev => deduplicateData([...prev, ...newData])),
        recommendedRestaurants: () => setRecommendedRestaurants(prev => deduplicateData([...prev, ...newData])),
        partyRestaurants: () => setPartyRestaurants(prev => deduplicateData([...prev, ...newData])),
        famousLocations: () => setFamousLocations(prev => deduplicateData([...prev, ...newData])),
        seafoodRestaurants: () => setSeafoodRestaurants(prev => deduplicateData([...prev, ...newData])),
        chineseRestaurants: () => setChineseRestaurants(prev => deduplicateData([...prev, ...newData])),
        popularCuisines: () => setPopularCuisines(prev => deduplicateData([...prev, ...newData])),
        monthlyFavorites: () => setMonthlyFavorites(prev => deduplicateData([...prev, ...newData])),
        amenitiesRestaurants: () => setAmenitiesRestaurants(prev => deduplicateData([...prev, ...newData])),
        luxuryRestaurants: () => setLuxuryRestaurants(prev => deduplicateData([...prev, ...newData])),
        trustedRestaurants: () => setTrustedRestaurants(prev => deduplicateData([...prev, ...newData])),
        touristRestaurants: () => setTouristRestaurants(prev => deduplicateData([...prev, ...newData])),
        lunchSuggestions: () => setLunchSuggestions(prev => deduplicateData([...prev, ...newData])),
        newOnDinerChill: () => setNewOnDinerChill(prev => deduplicateData([...prev, ...newData])),
        newsAndBlog: () => setNewsAndBlog(prev => deduplicateData([...prev, ...newData])),
      }[category];
      updateState();

      setPage(prev => ({ ...prev, [category]: nextPage }));
    } catch (err) {
      console.error('Load more error:', err);
      setError('Không thể tải thêm dữ liệu. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (userData) => {
    try {
      const isFormData = userData instanceof FormData;
      console.log('updateProfile - userData:', isFormData ? 'FormData object' : userData);
      const response = await authAPI.updateProfile(userData);
      console.log('updateProfile - response:', response);
      if (response && response.user) setUser(response.user);
      return response;
    } catch (err) {
      console.error('Update profile error:', err);
      throw err;
    }
  };

  const register = async (userData) => {
    try {
      setAuthLoading(true);
      const response = await authAPI.register(userData);
      if (!response.requiresVerification) {
        localStorage.setItem('dinerchillToken', response.token);
        setUser(response.user);
      }
      setAuthLoading(false);
      return response;
    } catch (err) {
      setAuthLoading(false);
      console.error('Register error:', err);
      throw err;
    }
  };

  const verifyEmail = async (email, code) => {
    try {
      setAuthLoading(true);
      const response = await authAPI.verifyEmail(email, code);
      if (response.token) {
        localStorage.setItem('dinerchillToken', response.token);
        setUser(response.user);
      }
      setAuthLoading(false);
      return response;
    } catch (err) {
      setAuthLoading(false);
      console.error('Email verification error:', err);
      throw err;
    }
  };

  const resendVerification = async (email) => {
    try {
      return await authAPI.resendVerification(email);
    } catch (err) {
      console.error('Resend verification error:', err);
      throw err;
    }
  };

  const googleLogin = async (tokenId) => {
    try {
      setAuthLoading(true);
      const response = await authAPI.googleLogin(tokenId);
      if (response.user && response.user.name) {
        if (response.user.name.includes('\\')) {
          response.user.name = response.user.displayName || response.user.email.split('@')[0] || 'Người dùng';
        }
      }
      setUser(response.user);
      localStorage.setItem('dinerchillToken', response.token);
      setAuthLoading(false);
      return true;
    } catch (error) {
      setAuthLoading(false);
      console.error('Google login error:', error);
      throw error;
    }
  };

  const zaloLogin = async (tokenId) => {
    try {
      setAuthLoading(true);
      const response = await authAPI.zaloLogin(tokenId);
      if (response.user && response.user.name) {
        if (response.user.name.includes('\\')) {
          response.user.name = response.user.displayName || response.user.email.split('@')[0] || 'Người dùng';
        }
      }
      setUser(response.user);
      localStorage.setItem('dinerchillToken', response.token);
      setAuthLoading(false);
      return true;
    } catch (error) {
      setAuthLoading(false);
      console.error('Zalo login error:', error);
      throw error;
    }
  };

  const login = async (userData) => {
    try {
      setAuthLoading(true);
      const response = await authAPI.login(userData);
      setUser(response.user);
      localStorage.setItem('dinerchillToken', response.token);
      setAuthLoading(false);
      return true;
    } catch (error) {
      setAuthLoading(false);
      console.error('Lỗi đăng nhập:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('dinerchillToken');
  };

  const addReservationHistory = (reservation) => {
    if (!user) return;
    console.log('Lưu lịch sử đặt chỗ:', reservation);
    setUser(prev => ({
      ...prev,
      reservationHistory: [...(prev.reservationHistory || []), reservation],
    }));
  };

  const addReservation = async (reservationData) => {
    console.log('Đặt bàn:', reservationData);
    try {
      // Sử dụng reservationAPI.create từ services/api.js
      const response = await reservationAPI.create(reservationData);
      
      return { 
        success: true, 
        message: 'Đặt bàn thành công', 
        id: response.id || `RES-${Date.now()}`,
        tableCode: response.table?.tableCode
      };
    } catch (error) {
      console.error('Error saving reservation:', error);
      
      // Kiểm tra nếu có response.data để lấy thông tin lỗi chi tiết
      const errorMessage = error.response?.data?.message || error.message || 'Đặt bàn thất bại, vui lòng thử lại';
      const showAsToast = error.response?.data?.showAsToast || false;
      
      return { 
        success: false, 
        message: errorMessage,
        showAsToast: showAsToast
      };
    }
  };

  // Lấy userName từ user (nếu có)
  const userName = user ? user.name || user.displayName || user.email?.split('@')[0] || 'Người dùng' : null;

  return (
    <AppContext.Provider value={{
      restaurants,
      hotRestaurants,
      hotProducts,
      recommendedRestaurants,
      partyRestaurants,
      famousLocations,
      seafoodRestaurants,
      chineseRestaurants,
      popularCuisines,
      monthlyFavorites,
      amenitiesRestaurants,
      luxuryRestaurants,
      trustedRestaurants,
      touristRestaurants,
      lunchSuggestions,
      newOnDinerChill,
      newsAndBlog,
      loading,
      error,
      user,
      authLoading,
      userName, // Thêm userName vào context
      login,
      logout,
      recentlyViewed,
      addToRecentlyViewed,
      removeFromRecentlyViewed,
      clearRecentlyViewed,
      loadMore,
      filters,
      setFilters,
      locations,
      register,
      verifyEmail,
      resendVerification,
      googleLogin,
      zaloLogin,
      updateProfile,
      addReservation,
      addReservationHistory,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}