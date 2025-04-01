import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import RestaurantPage from './pages/RestaurantPage';
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
import './App.css';
import './styles/admin.css'; // Import CSS Admin
import FavoritesPage from './pages/profile_imformation/FavoritesPage';
import ChangePasswordPage from './pages/profile_imformation/ChangePasswordPage';
import WalletPaymentPage from './pages/profile_imformation/WalletPaymentPage';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Admin Routes */}
          <Route path="/admin" element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="restaurants" element={<AdminRestaurants />} />
            <Route path="reservations" element={<AdminReservations />} />
            <Route path="reviews" element={<AdminReviews />} />
          </Route>
          
          {/* Public Routes */}
          <Route path="/" element={
            <>
              <Header />
              <HomePage />
              <Footer />
            </>
          } />
          <Route path="/restaurants/:id" element={
            <>
              <Header />
              <RestaurantPage />
              <Footer />
            </>
          } />
          <Route path="/login" element={
            <>
              <Header />
              <LoginPage />
              <Footer />
            </>
          } />
          <Route path="/register" element={
            <>
              <Header />
              <RegisterPage />
              <Footer />
            </>
          } />
          <Route path="/forgot-password" element={
            <>
              <Header />
              <ForgotPasswordPage />
              <Footer />
            </>
          } />
          <Route path="/reset-password" element={
            <>
              <Header />
              <ResetPasswordPage />
              <Footer />
            </>
          } />
          
          {/* Protected Routes */}
          <Route path="/reservation" element={
            <ProtectedRoute>
              <Header />
              <ReservationPage />
              <Footer />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Header />
              <ProfilePage />
              <Footer />
            </ProtectedRoute>
          } />
          <Route path="/my-reservations" element={
            <ProtectedRoute>
              <Header />
              <MyReservationsPage />
              <Footer />
            </ProtectedRoute>
          } />
          <Route path="/favorites" element={
            <ProtectedRoute>
              <Header />
              <FavoritesPage />
              <Footer />
            </ProtectedRoute>
          } />
          
          {/* Sửa routes cho trang đổi mật khẩu và trang ví tiền */}
          <Route path="/change-password" element={
            <ProtectedRoute>
              <Header />
              <ChangePasswordPage />
              <Footer />
            </ProtectedRoute>
          } />
          <Route path="/linked-accounts" element={
            <ProtectedRoute>
              <Header />
              <WalletPaymentPage />
              <Footer />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;