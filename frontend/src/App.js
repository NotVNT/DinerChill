import React, { Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
} from "react-router-dom";
import "./App.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Chatbox from "./components/Chatbox";
import HomePage from "./pages/HomePage";
import RestaurantDetailPage from "./pages/RestaurantDetailPage";
import SearchResultsPage from "./filter/SearchResultsPage";
import FilterResultsPage from "./filter/FilterResultsPage";
import { AppProvider } from "./context/AppContext";
import ReservationPage from "./pages/application/ReservationPage";
import ReservationSuccessPage from "./pages/application/ReservationSuccessPage";
import LoginPage from "./pages/identity/LoginPage";
import RegisterPage from "./pages/identity/RegisterPage";
import ProfilePage from "./pages/profile_imformation/ProfilePage";
import MyReservationsPage from "./pages/profile_imformation/MyReservationsPage";
import ForgotPasswordPage from "./pages/identity/ForgotPasswordPage";
import ResetPasswordPage from "./pages/identity/ResetPasswordPage";
import AdminLayout from "./components/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminRestaurants from "./pages/admin/AdminRestaurants";
import AdminReservations from "./pages/admin/AdminReservations";
import AdminReviews from "./pages/admin/AdminReviews";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminPromotions from "./pages/admin/AdminPromotions";
import AdminPayments from "./pages/admin/AdminPayments";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import FavoritesPage from "./pages/profile_imformation/FavoritesPage";
import ChangePasswordPage from "./pages/profile_imformation/ChangePasswordPage";
import PaymentHistory from "./pages/profile_imformation/PaymentHistory";
import AdminTables from "./pages/admin/AdminTables";
import TokenHandler from "./components/TokenHandler";
import LocationPage from "./components/LocationPage";
import PromoPage from "./pages/application/PromoPage";
import ReservationGuidePage from "./pages/ReservationGuidePage";
import PaymentResultPage from "./pages/application/PaymentResultPage";
import ScrollToTop from "./components/ScrollToTop";
import TableSelectionPage from "./pages/application/TableSelectionPage";
import LatestNewsPage from "./blog/LatestNewsPage";
import ArticleDetailPage from "./blog/ArticleDetailPage";
import DiningPlacesPage from "./blog/DiningPlacesPage";
import HotTrendRestaurantsPage from "./blog/HotTrendRestaurantsPage";
import BehindTheScenesPage from "./blog/BehindTheScenesPage";
import ReviewsRatingsPage from "./blog/ReviewsRatingsPage";
import FoodBusinessPage from "./blog/FoodBusinessPage";
import EventsPromotionsPage from "./blog/EventsPromotionsPage";
import AdminAmenities from "./pages/admin/AdminAmenities";
import ScrollToTopButton from "./components/ScrollToTopButton";

// Lazy load category components
const Lau = React.lazy(() => import("./filter/categories/Lau"));
const Buffet = React.lazy(() => import("./filter/categories/Buffet"));
const HaiSan = React.lazy(() => import("./filter/categories/Hai_San"));
const LauNuong = React.lazy(() => import("./filter/categories/Lau_Nuong"));
const QuanNhau = React.lazy(() => import("./filter/categories/Quan_Nhau"));
const MonChay = React.lazy(() => import("./filter/categories/Mon_Chay"));
const DoTiec = React.lazy(() => import("./filter/categories/Do_tiec"));
const HanQuoc = React.lazy(() => import("./filter/categories/Han_Quoc"));
const NhatBan = React.lazy(() => import("./filter/categories/Nhat_Ban"));
const MonViet = React.lazy(() => import("./filter/categories/Mon_Viet"));
const MonThai = React.lazy(() => import("./filter/categories/Mon_Thai"));
const MonTrungHoa = React.lazy(() =>
  import("./filter/categories/Mon_TrungHoa")
);
const TiecCuoi = React.lazy(() => import("./filter/categories/Tiec_Cuoi"));
const DoUong = React.lazy(() => import("./filter/categories/Do_Uong"));

// Loading component for suspense
const Loading = () => (
  <div className="loading-container">
    <div className="loading-spinner"></div>
    <p>Đang tải...</p>
  </div>
);

// Layout cho ứng dụng (có Header và Footer)
function AppLayout() {
  return (
    <div className="App">
      <Header />
      <main className="main-content">
        <Outlet />
      </main>
      <Footer />
      <Chatbox />
      <ScrollToTopButton />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppProvider>
        <TokenHandler />
        <ScrollToTop />
        <Routes>
          {/* Root path with HomePage - highest priority */}
          <Route
            exact
            path="/"
            element={
              <div className="App">
                <Header />
                <main className="main-content">
                  <HomePage />
                </main>
                <Footer />
                <Chatbox />
                <ScrollToTopButton />
              </div>
            }
          />

          {/* Admin Routes - không có Header/Footer */}
          <Route
            path="/admin/*"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="restaurants" element={<AdminRestaurants />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="amenities" element={<AdminAmenities />} />
            <Route path="amenities" element={<AdminAmenities />} />
            <Route path="promotions" element={<AdminPromotions />} />
            <Route path="reservations" element={<AdminReservations />} />
            <Route path="payments" element={<AdminPayments />} />
            <Route path="tables" element={<AdminTables />} />
            <Route path="reviews" element={<AdminReviews />} />
          </Route>

          {/* All other routes */}
          <Route path="/*" element={<AppLayout />}>
            <Route path="restaurant/:id" element={<RestaurantDetailPage />} />
            <Route path="restaurants/:id" element={<RestaurantDetailPage />} />
            <Route
              path="restaurant/:id/tables"
              element={<TableSelectionPage />}
            />
            <Route path="search" element={<SearchResultsPage />} />
            <Route path="filter-results" element={<FilterResultsPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="forgot-password" element={<ForgotPasswordPage />} />
            <Route path="reset-password" element={<ResetPasswordPage />} />
            <Route path="vi-tri" element={<LocationPage />} />
            <Route path="khuyen-mai" element={<PromoPage />} />
            <Route
              path="huong-dan-dat-ban"
              element={<ReservationGuidePage />}
            />
            <Route path="payment-result" element={<PaymentResultPage />} />
            <Route
              path="payment"
              element={
                <ProtectedRoute>
                  <PaymentResultPage />
                </ProtectedRoute>
              }
            />

            {/* Blog Routes */}
            <Route path="blog/tin-tuc-moi-nhat" element={<LatestNewsPage />} />
            <Route
              path="blog/dinerchill-ra-mat"
              element={<ArticleDetailPage />}
            />
            <Route
              path="blog/dinerchill-ra-mat"
              element={<ArticleDetailPage />}
            />
            <Route path="blog/article/:id" element={<ArticleDetailPage />} />
            <Route
              path="blog/dia-diem-an-uong"
              element={<DiningPlacesPage />}
            />
            <Route
              path="blog/dia-diem-an-uong/:id"
              element={<ArticleDetailPage />}
            />
            <Route
              path="blog/kinh-doanh-an-uong"
              element={<FoodBusinessPage />}
            />
            <Route
              path="blog/kinh-doanh-an-uong/:id"
              element={<ArticleDetailPage />}
            />
            <Route
              path="blog/su-kien-khuyen-mai"
              element={<EventsPromotionsPage />}
            />
            <Route
              path="blog/su-kien-khuyen-mai/:id"
              element={<ArticleDetailPage />}
            />
            <Route
              path="blog/nha-hang-hot-trend"
              element={<HotTrendRestaurantsPage />}
            />
            <Route
              path="blog/nha-hang-hot-trend/:id"
              element={<ArticleDetailPage />}
            />
            <Route
              path="blog/hau-truong-nha-hang"
              element={<BehindTheScenesPage />}
            />
            <Route
              path="blog/hau-truong-nha-hang/:id"
              element={<ArticleDetailPage />}
            />
            <Route
              path="blog/danh-gia-review"
              element={<ReviewsRatingsPage />}
            />
            <Route
              path="blog/danh-gia-review/:id"
              element={<ArticleDetailPage />}
            />
            <Route
              path="blog/dia-diem-an-uong"
              element={<DiningPlacesPage />}
            />
            <Route
              path="blog/dia-diem-an-uong/:id"
              element={<ArticleDetailPage />}
            />
            <Route
              path="blog/kinh-doanh-an-uong"
              element={<FoodBusinessPage />}
            />
            <Route
              path="blog/kinh-doanh-an-uong/:id"
              element={<ArticleDetailPage />}
            />
            <Route
              path="blog/su-kien-khuyen-mai"
              element={<EventsPromotionsPage />}
            />
            <Route
              path="blog/su-kien-khuyen-mai/:id"
              element={<ArticleDetailPage />}
            />
            <Route
              path="blog/nha-hang-hot-trend"
              element={<HotTrendRestaurantsPage />}
            />
            <Route
              path="blog/nha-hang-hot-trend/:id"
              element={<ArticleDetailPage />}
            />
            <Route
              path="blog/hau-truong-nha-hang"
              element={<BehindTheScenesPage />}
            />
            <Route
              path="blog/hau-truong-nha-hang/:id"
              element={<ArticleDetailPage />}
            />
            <Route
              path="blog/danh-gia-review"
              element={<ReviewsRatingsPage />}
            />
            <Route
              path="blog/danh-gia-review/:id"
              element={<ArticleDetailPage />}
            />

            {/* Category Routes */}
            <Route
              path="lau"
              element={
                <Suspense fallback={<Loading />}>
                  <Lau />
                </Suspense>
              }
            />
            <Route
              path="buffet"
              element={
                <Suspense fallback={<Loading />}>
                  <Buffet />
                </Suspense>
              }
            />
            <Route
              path="hai-san"
              element={
                <Suspense fallback={<Loading />}>
                  <HaiSan />
                </Suspense>
              }
            />
            <Route
              path="lau-nuong"
              element={
                <Suspense fallback={<Loading />}>
                  <LauNuong />
                </Suspense>
              }
            />
            <Route
              path="quan-nhau"
              element={
                <Suspense fallback={<Loading />}>
                  <QuanNhau />
                </Suspense>
              }
            />
            <Route
              path="mon-chay"
              element={
                <Suspense fallback={<Loading />}>
                  <MonChay />
                </Suspense>
              }
            />
            <Route
              path="do-tiec"
              element={
                <Suspense fallback={<Loading />}>
                  <DoTiec />
                </Suspense>
              }
            />
            <Route
              path="han-quoc"
              element={
                <Suspense fallback={<Loading />}>
                  <HanQuoc />
                </Suspense>
              }
            />
            <Route
              path="nhat-ban"
              element={
                <Suspense fallback={<Loading />}>
                  <NhatBan />
                </Suspense>
              }
            />
            <Route
              path="mon-viet"
              element={
                <Suspense fallback={<Loading />}>
                  <MonViet />
                </Suspense>
              }
            />
            <Route
              path="mon-thai"
              element={
                <Suspense fallback={<Loading />}>
                  <MonThai />
                </Suspense>
              }
            />
            <Route
              path="mon-trung-hoa"
              element={
                <Suspense fallback={<Loading />}>
                  <MonTrungHoa />
                </Suspense>
              }
            />
            <Route
              path="tiec-cuoi"
              element={
                <Suspense fallback={<Loading />}>
                  <TiecCuoi />
                </Suspense>
              }
            />
            <Route
              path="do-uong"
              element={
                <Suspense fallback={<Loading />}>
                  <DoUong />
                </Suspense>
              }
            />

            {/* Protected Routes */}
            <Route
              path="reservation"
              element={
                <ProtectedRoute>
                  <ReservationPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="reservation-success"
              element={
                <ProtectedRoute>
                  <ReservationSuccessPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="my-reservations"
              element={
                <ProtectedRoute>
                  <MyReservationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="favorites"
              element={
                <ProtectedRoute>
                  <FavoritesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="change-password"
              element={
                <ProtectedRoute>
                  <ChangePasswordPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="payment-history"
              element={
                <ProtectedRoute>
                  <PaymentHistory />
                </ProtectedRoute>
              }
            />

            {/* Route 404 */}
            <Route
              path="*"
              element={
                <div className="not-found">404 - Trang không tìm thấy</div>
              }
            />
          </Route>
        </Routes>
      </AppProvider>
    </Router>
  );
}

export default App;
