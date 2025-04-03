import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
// Xóa import TopBar
// import TopBar from './components/TopBar';
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
import AdminUsers from './pages/admin/AdminUsers';
import AdminRestaurants from './pages/admin/AdminRestaurants';
import AdminReservations from './pages/admin/AdminReservations';
import AdminReviews from './pages/admin/AdminReviews';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import FavoritesPage from './pages/profile_imformation/FavoritesPage';
import ChangePasswordPage from './pages/profile_imformation/ChangePasswordPage';
import WalletPaymentPage from './pages/profile_imformation/WalletPaymentPage';

function App() {
  return (
    <Router>
      <AppProvider>
        <Routes>
          {/* Admin Routes - không có Header/Footer */}
          <Route path="/admin/*" element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }>
            {/* Thêm routes con cho admin */}
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="restaurants" element={<AdminRestaurants />} />
            <Route path="reservations" element={<AdminReservations />} />
            <Route path="reviews" element={<AdminReviews />} />
          </Route>
          
          {/* Public and Protected Routes - có Header/Footer */}
          <Route path="/*" element={
            <div className="App">
              <Header />
              <main className="main-content">
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<HomePage />} />
                  <Route path="/restaurants" element={<RestaurantPage />} />
                  <Route path="/restaurant/:id" element={<RestaurantDetailPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="/reset-password" element={<ResetPasswordPage />} />
                  
                  {/* Protected Routes */}
                  <Route path="/reservation" element={<ProtectedRoute><ReservationPage /></ProtectedRoute>} />
                  <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                  <Route path="/my-reservations" element={<ProtectedRoute><MyReservationsPage /></ProtectedRoute>} />
                  <Route path="/favorites" element={<ProtectedRoute><FavoritesPage /></ProtectedRoute>} />
                  
                  {/* Sửa routes cho trang đổi mật khẩu và trang ví tiền */}
                  <Route path="/change-password" element={<ProtectedRoute><ChangePasswordPage /></ProtectedRoute>} />
                  <Route path="/linked-accounts" element={<ProtectedRoute><WalletPaymentPage /></ProtectedRoute>} />
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