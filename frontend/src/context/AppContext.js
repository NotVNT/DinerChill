import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getAll, getHotRestaurants, getHotProducts, getRecommendedRestaurants, getPartyRestaurants, getFamousLocations, getSeafoodRestaurants, getChineseRestaurants, getPopularCuisines, getMonthlyFavorites, getAmenitiesRestaurants, getLuxuryRestaurants, getTrustedRestaurants, getTouristRestaurants, getLunchSuggestions, getNewOnDinerChill, getNewsAndBlog } from '../services/restaurantAPI';

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
  const [recentlyViewed, setRecentlyViewed] = useState({});
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
    location: 'Hồ Chí Minh',
    distance: 'all',
    cuisine: 'all',
    rating: 'all',
  });

  const [locations, setLocations] = useState([]); // Thêm state mới để lưu danh sách khu vực

  const [originalData, setOriginalData] = useState({
    restaurants: [],
    hotRestaurants: [],
    hotProducts: [],
    recommendedRestaurants: [],
    partyRestaurants: [],
    famousLocations: [],
    seafoodRestaurants: [],
    chineseRestaurants: [],
    popularCuisines: [],
    monthlyFavorites: [],
    amenitiesRestaurants: [],
    luxuryRestaurants: [],
    trustedRestaurants: [],
    touristRestaurants: [],
    lunchSuggestions: [],
    newOnDinerChill: [],
    newsAndBlog: [],
  });

  const normalizeData = (data) => data.map(item => ({
    ...item,
    category: item.category || 'Khác',
  }));

  useEffect(() => {
    try {
      const savedRecentlyViewed = localStorage.getItem('recentlyViewed');
      if (savedRecentlyViewed) {
        setRecentlyViewed(JSON.parse(savedRecentlyViewed));
      }
    } catch (err) {
      console.error('Lỗi khi truy cập localStorage:', err);
      setRecentlyViewed({});
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('recentlyViewed', JSON.stringify(recentlyViewed));
    } catch (err) {
      console.error('Lỗi khi lưu vào localStorage:', err);
    }
  }, [recentlyViewed]);

  const addToRecentlyViewed = (restaurant) => {
    if (!restaurant || !restaurant.id) return;

    setRecentlyViewed((prev) => {
      const category = restaurant.category ? restaurant.category.toLowerCase() : 'khác';
      const updatedCategory = prev[category] ? [...prev[category]] : [];
      const existingIndex = updatedCategory.findIndex(item => item.id === restaurant.id);
      if (existingIndex !== -1) {
        updatedCategory.splice(existingIndex, 1);
      }
      updatedCategory.unshift(restaurant);
      if (updatedCategory.length > 10) {
        updatedCategory.pop();
      }
      return {
        ...prev,
        [category]: updatedCategory,
      };
    });
  };

  const removeFromRecentlyViewed = (restaurantId, category) => {
    setRecentlyViewed((prev) => {
      const normalizedCategory = category ? category.toLowerCase() : 'khác';
      const updatedCategory = prev[normalizedCategory] ? [...prev[normalizedCategory]] : [];
      const filteredCategory = updatedCategory.filter(item => item.id !== restaurantId);
      return {
        ...prev,
        [normalizedCategory]: filteredCategory,
      };
    });
  };

  const clearRecentlyViewed = () => {
    setRecentlyViewed({});
    localStorage.removeItem('recentlyViewed');
  };

  const applyFilters = useCallback((data) => {
    let filteredData = [...data];

    if (filters.location && filters.location !== '') {
      filteredData = filteredData.filter(item => item.location === filters.location);
    }

    if (filters.distance !== 'all') {
      filteredData = filteredData.filter((item) => {
        const distance = item.distance || 0;
        if (filters.distance === 'near') return distance <= 2;
        if (filters.distance === 'under5km') return distance <= 5;
        if (filters.distance === 'under10km') return distance <= 10;
        return true;
      });
    }

    if (filters.cuisine && filters.cuisine !== 'all') {
      filteredData = filteredData.filter((item) => {
        const cuisine = item.cuisine?.toLowerCase() || '';
        return cuisine.includes(filters.cuisine.toLowerCase());
      });
    }

    if (filters.rating !== 'all') {
      filteredData = filteredData.filter((item) => {
        const rating = item.rating || 0;
        if (filters.rating === 'above4') return rating >= 4;
        if (filters.rating === 'above3') return rating >= 3;
        return true;
      });
    }

    return filteredData;
  }, [filters]);

  const fetchInitialData = useCallback(async () => {
    setLoading(true);
    try {
      const [
        allRestaurants,
        hotRestaurantsData,
        hotProductsData,
        recommendedRestaurantsData,
        partyRestaurantsData,
        famousLocationsData,
        seafoodRestaurantsData,
        chineseRestaurantsData,
        popularCuisinesData,
        monthlyFavoritesData,
        amenitiesRestaurantsData,
        luxuryRestaurantsData,
        trustedRestaurantsData,
        touristRestaurantsData,
        lunchSuggestionsData,
        newOnDinerChillData,
        newsAndBlogData,
      ] = await Promise.all([
        getAll(page.all, 20),
        getHotRestaurants(page.hotRestaurants, 10),
        getHotProducts(page.hotProducts, 10),
        getRecommendedRestaurants(page.recommendedRestaurants, 10),
        getPartyRestaurants(page.partyRestaurants, 10),
        getFamousLocations(page.famousLocations, 10),
        getSeafoodRestaurants(page.seafoodRestaurants, 10),
        getChineseRestaurants(page.chineseRestaurants, 10),
        getPopularCuisines(page.popularCuisines, 10),
        getMonthlyFavorites(page.monthlyFavorites, 10),
        getAmenitiesRestaurants(page.amenitiesRestaurants, 10),
        getLuxuryRestaurants(page.luxuryRestaurants, 10),
        getTrustedRestaurants(page.trustedRestaurants, 10),
        getTouristRestaurants(page.touristRestaurants, 10),
        getLunchSuggestions(page.lunchSuggestions, 10),
        getNewOnDinerChill(page.newOnDinerChill, 10),
        getNewsAndBlog(page.newsAndBlog, 10),
      ]);

      // Giả lập dữ liệu khu vực (thay bằng API thật nếu có)
      const mockLocations = [
        { LocationID: 1, LocationName: 'Hồ Chí Minh' },
        { LocationID: 2, LocationName: 'Hà Nội' },
        { LocationID: 3, LocationName: 'Đà Nẵng' },
      ];
      setLocations(mockLocations);

      setOriginalData({
        restaurants: normalizeData(allRestaurants),
        hotRestaurants: normalizeData(hotRestaurantsData),
        hotProducts: normalizeData(hotProductsData),
        recommendedRestaurants: normalizeData(recommendedRestaurantsData),
        partyRestaurants: normalizeData(partyRestaurantsData),
        famousLocations: normalizeData(famousLocationsData),
        seafoodRestaurants: normalizeData(seafoodRestaurantsData),
        chineseRestaurants: normalizeData(chineseRestaurantsData),
        popularCuisines: normalizeData(popularCuisinesData),
        monthlyFavorites: normalizeData(monthlyFavoritesData),
        amenitiesRestaurants: normalizeData(amenitiesRestaurantsData),
        luxuryRestaurants: normalizeData(luxuryRestaurantsData),
        trustedRestaurants: normalizeData(trustedRestaurantsData),
        touristRestaurants: normalizeData(touristRestaurantsData),
        lunchSuggestions: normalizeData(lunchSuggestionsData),
        newOnDinerChill: normalizeData(newOnDinerChillData),
        newsAndBlog: normalizeData(newsAndBlogData),
      });

      setRestaurants(normalizeData(allRestaurants));
      setHotRestaurants(normalizeData(hotRestaurantsData));
      setHotProducts(normalizeData(hotProductsData));
      setRecommendedRestaurants(normalizeData(recommendedRestaurantsData));
      setPartyRestaurants(normalizeData(partyRestaurantsData));
      setFamousLocations(normalizeData(famousLocationsData));
      setSeafoodRestaurants(normalizeData(seafoodRestaurantsData));
      setChineseRestaurants(normalizeData(chineseRestaurantsData));
      setPopularCuisines(normalizeData(popularCuisinesData));
      setMonthlyFavorites(normalizeData(monthlyFavoritesData));
      setAmenitiesRestaurants(normalizeData(amenitiesRestaurantsData));
      setLuxuryRestaurants(normalizeData(luxuryRestaurantsData));
      setTrustedRestaurants(normalizeData(trustedRestaurantsData));
      setTouristRestaurants(normalizeData(touristRestaurantsData));
      setLunchSuggestions(normalizeData(lunchSuggestionsData));
      setNewOnDinerChill(normalizeData(newOnDinerChillData));
      setNewsAndBlog(normalizeData(newsAndBlogData));
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }, [
    page.all,
    page.hotRestaurants,
    page.hotProducts,
    page.recommendedRestaurants,
    page.partyRestaurants,
    page.famousLocations,
    page.seafoodRestaurants,
    page.chineseRestaurants,
    page.popularCuisines,
    page.monthlyFavorites,
    page.amenitiesRestaurants,
    page.luxuryRestaurants,
    page.trustedRestaurants,
    page.touristRestaurants,
    page.lunchSuggestions,
    page.newOnDinerChill,
    page.newsAndBlog,
  ]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  useEffect(() => {
    setRestaurants(applyFilters(originalData.restaurants));
    setHotRestaurants(applyFilters(originalData.hotRestaurants));
    setHotProducts(applyFilters(originalData.hotProducts));
    setRecommendedRestaurants(applyFilters(originalData.recommendedRestaurants));
    setPartyRestaurants(applyFilters(originalData.partyRestaurants));
    setFamousLocations(applyFilters(originalData.famousLocations));
    setSeafoodRestaurants(applyFilters(originalData.seafoodRestaurants));
    setChineseRestaurants(applyFilters(originalData.chineseRestaurants));
    setPopularCuisines(applyFilters(originalData.popularCuisines));
    setMonthlyFavorites(applyFilters(originalData.monthlyFavorites));
    setAmenitiesRestaurants(applyFilters(originalData.amenitiesRestaurants));
    setLuxuryRestaurants(applyFilters(originalData.luxuryRestaurants));
    setTrustedRestaurants(applyFilters(originalData.trustedRestaurants));
    setTouristRestaurants(applyFilters(originalData.touristRestaurants));
    setLunchSuggestions(applyFilters(originalData.lunchSuggestions));
    setNewOnDinerChill(applyFilters(originalData.newOnDinerChill));
    setNewsAndBlog(applyFilters(originalData.newsAndBlog));
  }, [
    filters,
    applyFilters,
    originalData.restaurants,
    originalData.hotRestaurants,
    originalData.hotProducts,
    originalData.recommendedRestaurants,
    originalData.partyRestaurants,
    originalData.famousLocations,
    originalData.seafoodRestaurants,
    originalData.chineseRestaurants,
    originalData.popularCuisines,
    originalData.monthlyFavorites,
    originalData.amenitiesRestaurants,
    originalData.luxuryRestaurants,
    originalData.trustedRestaurants,
    originalData.touristRestaurants,
    originalData.lunchSuggestions,
    originalData.newOnDinerChill,
    originalData.newsAndBlog,
  ]);

  const loadMore = async (category) => {
    setLoading(true);
    try {
      const nextPage = page[category] + 1;
      let newData;

      switch (category) {
        case 'all':
          newData = await getAll(nextPage, 20);
          setRestaurants((prev) => [...prev, ...normalizeData(newData)]);
          setOriginalData((prev) => ({
            ...prev,
            restaurants: [...prev.restaurants, ...normalizeData(newData)],
          }));
          break;
        case 'hotRestaurants':
          newData = await getHotRestaurants(nextPage, 10);
          setHotRestaurants((prev) => [...prev, ...normalizeData(newData)]);
          setOriginalData((prev) => ({
            ...prev,
            hotRestaurants: [...prev.hotRestaurants, ...normalizeData(newData)],
          }));
          break;
        case 'hotProducts':
          newData = await getHotProducts(nextPage, 10);
          setHotProducts((prev) => [...prev, ...normalizeData(newData)]);
          setOriginalData((prev) => ({
            ...prev,
            hotProducts: [...prev.hotProducts, ...normalizeData(newData)],
          }));
          break;
        case 'recommendedRestaurants':
          newData = await getRecommendedRestaurants(nextPage, 10);
          setRecommendedRestaurants((prev) => [...prev, ...normalizeData(newData)]);
          setOriginalData((prev) => ({
            ...prev,
            recommendedRestaurants: [...prev.recommendedRestaurants, ...normalizeData(newData)],
          }));
          break;
        case 'partyRestaurants':
          newData = await getPartyRestaurants(nextPage, 10);
          setPartyRestaurants((prev) => [...prev, ...normalizeData(newData)]);
          setOriginalData((prev) => ({
            ...prev,
            partyRestaurants: [...prev.partyRestaurants, ...normalizeData(newData)],
          }));
          break;
        case 'famousLocations':
          newData = await getFamousLocations(nextPage, 10);
          setFamousLocations((prev) => [...prev, ...normalizeData(newData)]);
          setOriginalData((prev) => ({
            ...prev,
            famousLocations: [...prev.famousLocations, ...normalizeData(newData)],
          }));
          break;
        case 'seafoodRestaurants':
          newData = await getSeafoodRestaurants(nextPage, 10);
          setSeafoodRestaurants((prev) => [...prev, ...normalizeData(newData)]);
          setOriginalData((prev) => ({
            ...prev,
            seafoodRestaurants: [...prev.seafoodRestaurants, ...normalizeData(newData)],
          }));
          break;
        case 'chineseRestaurants':
          newData = await getChineseRestaurants(nextPage, 10);
          setChineseRestaurants((prev) => [...prev, ...normalizeData(newData)]);
          setOriginalData((prev) => ({
            ...prev,
            chineseRestaurants: [...prev.chineseRestaurants, ...normalizeData(newData)],
          }));
          break;
        case 'popularCuisines':
          newData = await getPopularCuisines(nextPage, 10);
          setPopularCuisines((prev) => [...prev, ...normalizeData(newData)]);
          setOriginalData((prev) => ({
            ...prev,
            popularCuisines: [...prev.popularCuisines, ...normalizeData(newData)],
          }));
          break;
        case 'monthlyFavorites':
          newData = await getMonthlyFavorites(nextPage, 10);
          setMonthlyFavorites((prev) => [...prev, ...normalizeData(newData)]);
          setOriginalData((prev) => ({
            ...prev,
            monthlyFavorites: [...prev.monthlyFavorites, ...normalizeData(newData)],
          }));
          break;
        case 'amenitiesRestaurants':
          newData = await getAmenitiesRestaurants(nextPage, 10);
          setAmenitiesRestaurants((prev) => [...prev, ...normalizeData(newData)]);
          setOriginalData((prev) => ({
            ...prev,
            amenitiesRestaurants: [...prev.amenitiesRestaurants, ...normalizeData(newData)],
          }));
          break;
        case 'luxuryRestaurants':
          newData = await getLuxuryRestaurants(nextPage, 10);
          setLuxuryRestaurants((prev) => [...prev, ...normalizeData(newData)]);
          setOriginalData((prev) => ({
            ...prev,
            luxuryRestaurants: [...prev.luxuryRestaurants, ...normalizeData(newData)],
          }));
          break;
        case 'trustedRestaurants':
          newData = await getTrustedRestaurants(nextPage, 10);
          setTrustedRestaurants((prev) => [...prev, ...normalizeData(newData)]);
          setOriginalData((prev) => ({
            ...prev,
            trustedRestaurants: [...prev.trustedRestaurants, ...normalizeData(newData)],
          }));
          break;
        case 'touristRestaurants':
          newData = await getTouristRestaurants(nextPage, 10);
          setTouristRestaurants((prev) => [...prev, ...normalizeData(newData)]);
          setOriginalData((prev) => ({
            ...prev,
            touristRestaurants: [...prev.touristRestaurants, ...normalizeData(newData)],
          }));
          break;
        case 'lunchSuggestions':
          newData = await getLunchSuggestions(nextPage, 10);
          setLunchSuggestions((prev) => [...prev, ...normalizeData(newData)]);
          setOriginalData((prev) => ({
            ...prev,
            lunchSuggestions: [...prev.lunchSuggestions, ...normalizeData(newData)],
          }));
          break;
        case 'newOnDinerChill':
          newData = await getNewOnDinerChill(nextPage, 10);
          setNewOnDinerChill((prev) => [...prev, ...normalizeData(newData)]);
          setOriginalData((prev) => ({
            ...prev,
            newOnDinerChill: [...prev.newOnDinerChill, ...normalizeData(newData)],
          }));
          break;
        case 'newsAndBlog':
          newData = await getNewsAndBlog(nextPage, 10);
          setNewsAndBlog((prev) => [...prev, ...normalizeData(newData)]);
          setOriginalData((prev) => ({
            ...prev,
            newsAndBlog: [...prev.newsAndBlog, ...normalizeData(newData)],
          }));
          break;
        default:
          break;
      }

      setPage((prev) => ({ ...prev, [category]: nextPage }));
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const login = (userData) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
  };

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
      login,
      logout,
      recentlyViewed,
      addToRecentlyViewed,
      removeFromRecentlyViewed,
      clearRecentlyViewed,
      loadMore,
      filters,
      setFilters,
      locations, // Export locations để các component khác sử dụng
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}