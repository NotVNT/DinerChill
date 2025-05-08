import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import './App.css';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import RestaurantPage from './pages/RestaurantPage';
import RestaurantDetailPage from './pages/RestaurantDetailPage';
import { AppProvider } from './context/AppContext';
import ReservationPage from './pages/ReservationPage';
import LoginPage from './pages/identity/LoginPage';
import RegisterPage from './pages/identity/RegisterPage';
import ProfilePage from './pages/profile_imformation/ProfilePage';
import MyReservationsPage from './pages/profile_imformation/MyReservationsPage';
import ForgotPasswordPage from './pages/identity/ForgotPasswordPage';
import ResetPasswordPage from './pages/identity/ResetPasswordPage';
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminRestaurants from './pages/admin/AdminRestaurants';
import AdminReservations from './pages/admin/AdminReservations';
import AdminReviews from './pages/admin/AdminReviews';
import AdminCategories from './pages/admin/AdminCategories';
import AdminPromotions from './pages/admin/AdminPromotions';
import AdminPayments from './pages/admin/AdminPayments';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import FavoritesPage from './pages/profile_imformation/FavoritesPage';
import ChangePasswordPage from './pages/profile_imformation/ChangePasswordPage';
import WalletPaymentPage from './pages/profile_imformation/WalletPaymentPage';
import AdminTables from './pages/admin/AdminTables';
import TokenHandler from './components/TokenHandler';
import LocationPage from './components/LocationPage';
import PromoPage from './pages/PromoPage';
import ReservationGuidePage from './pages/ReservationGuidePage';
import TestPaymentPage from './pages/TestPaymentPage';
import PaymentResultPage from './pages/PaymentResultPage';


// Component để cuộn lên đầu trang khi chuyển route
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  return (
    <Router>
      <AppProvider>
        <TokenHandler />
        <Routes>
          {/* Admin Routes - không có Header/Footer */}
          <Route path="/admin/*" element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="restaurants" element={<AdminRestaurants />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="promotions" element={<AdminPromotions />} />
            <Route path="reservations" element={<AdminReservations />} />
            <Route path="payments" element={<AdminPayments />} />
            <Route path="tables" element={<AdminTables />} />
            <Route path="reviews" element={<AdminReviews />} />
          </Route>
          
          {/* Public and Protected Routes - có Header/Footer */}
          <Route path="/*" element={
            <div className="App">
              <Header />
              <main className="main-content">
                <ScrollToTop />
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<HomePage />} />
                  <Route path="/restaurants" element={<RestaurantPage />} />

                  <Route path="/nha-hang" element={<RestaurantPage />} />
                  <Route path="/lau" element={<RestaurantPage />} />
                  <Route path="/buffet" element={<RestaurantPage />} />
                  <Route path="/hai-san" element={<RestaurantPage />} />
                  <Route path="/lau-nuong" element={<RestaurantPage />} />
                  <Route path="/quan-nhau" element={<RestaurantPage />} />
                  <Route path="/mon-chay" element={<RestaurantPage />} />
                  <Route path="/do-tiec" element={<RestaurantPage />} />
                  <Route path="/han-quoc" element={<RestaurantPage />} />
                  <Route path="/nhat-ban" element={<RestaurantPage />} />
                  <Route path="/mon-viet" element={<RestaurantPage />} />
                  <Route path="/mon-thai" element={<RestaurantPage />} />
                  <Route path="/mon-trung-hoa" element={<RestaurantPage />} />
                  <Route path="/tiec-cuoi" element={<RestaurantPage />} />
                  <Route path="/do-uong" element={<RestaurantPage />} />

                  <Route path="/restaurant/:id" element={<RestaurantDetailPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="/reset-password" element={<ResetPasswordPage />} />
                  <Route path="/vi-tri" element={<LocationPage />} />
                  <Route path="/khuyen-mai" element={<PromoPage />} />
                  <Route path="/huong-dan-dat-ban" element={<ReservationGuidePage />} />
                  <Route path="/test-payment" element={<TestPaymentPage />} />
                  <Route path="/payment-result" element={<PaymentResultPage />} />
                  
                  {/* Protected Routes */}
                  <Route path="/reservation" element={<ProtectedRoute><ReservationPage /></ProtectedRoute>} />
                  <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                  <Route path="/my-reservations" element={<ProtectedRoute><MyReservationsPage /></ProtectedRoute>} />
                  <Route path="/favorites" element={<ProtectedRoute><FavoritesPage /></ProtectedRoute>} />
                  <Route path="/change-password" element={<ProtectedRoute><ChangePasswordPage /></ProtectedRoute>} />
                  <Route path="/linked-accounts" element={<ProtectedRoute><WalletPaymentPage /></ProtectedRoute>} />
                  
                  {/* Route 404 */}
                  <Route path="*" element={<div className="not-found">404 - Trang không tìm thấy</div>} />
                </Routes>
              </main>
              <Footer />
            </div>
          } />
        </Routes>
      </AppProvider>
    </Router>
  );
}

export default App;