import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ProfilePage from './pages/ProfilePage'; 
import ProtectedRoute from './routes/ProtectedRoute';
import AdminLayout from './layouts/AdminLayout'; 
import CustomerLayout from './layouts/CustomerLayout';
import CustomerHomePage from './pages/CustomerHomePage';
import CustomerRoomsPage from './pages/CustomerRoomsPage';
import CustomerProfilePage from './pages/CustomerProfilePage';
import CustomerReviewsPage from './pages/CustomerReviewsPage';
import CustomerOffersPage from './pages/CustomerOffersPage';
import CustomerServicesPage from './pages/CustomerServicesPage';
import CustomerAttractionsPage from './pages/CustomerAttractionsPage';
import CustomerContactPage from './pages/CustomerContactPage';
import CustomerBookingHistoryPage from './pages/CustomerBookingHistoryPage';
import RoleGuard from './routes/RoleGuard';
import RoomGridPage from './pages/RoomGridPage';
import CheckoutPage from './pages/CheckoutPage';
import BookingListPage from './pages/BookingListPage';
import EquipmentManagementPage from './pages/EquipmentManagementPage';
import UserManagementPage from './pages/UserManagementPage';
import RoleManagementPage from './pages/RoleManagementPage';
import RoomManagementPage from './pages/RoomManagementPage';
import LossAndDamagePage from './pages/LossAndDamagePage';
import HousekeepingChecklist from './pages/HousekeepingChecklist';
import HousekeepingListPage from './pages/HousekeepingListPage';
import CreateBooking from "./pages/CreateBooking";
import VoucherManagement from "./pages/VoucherManagement";
import { ConfigProvider, App as AntApp, theme } from 'antd';
import TouristAttractions from "./pages/TouristAttractions";
import AuditLogsPage from "./pages/AuditLogsPage";
import DashboardPage from "./pages/DashboardPage";
import AdminReviewsPage from './pages/AdminReviewsPage';
import SystemSettingsPage from "./pages/SystemSettingsPage";
import useSettingsStore from "./store/useSettingsStore";
import LocationDetailPage from './pages/LocationDetailPage';
import { GoogleOAuthProvider } from '@react-oauth/google';


function App() {
  const { themeMode, primaryColor, compactMode } = useSettingsStore();
  
  const algorithm = [];
  if (themeMode === 'dark') algorithm.push(theme.darkAlgorithm);
  else algorithm.push(theme.defaultAlgorithm);
  if (compactMode) algorithm.push(theme.compactAlgorithm);

  return (
   // BỌC TOÀN BỘ BẰNG CONFIGPROVIDER ĐỂ CHỈNH FONT
    <ConfigProvider
      theme={{
        algorithm,
        token: {
          colorPrimary: primaryColor,
          fontSize: 16, // TĂNG LÊN 16px (Gốc là 14px, đúng yêu cầu to lên 2 size)
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", // Giúp font trông mượt hơn
          ...(themeMode === 'dark' ? {
            colorBgBase: '#18191a',       
            colorBgContainer: '#242526',  
            colorBgElevated: '#3a3b3c',   
            colorTextBase: '#e4e6eb',     
            colorBorder: '#3e4042',
          } : {
            colorBgLayout: '#f0f2f5',
          })
        },
      }}
    >
      <AntApp>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            
            {/* PUBLIC CUSTOMER ROUTES */}
            <Route element={<CustomerLayout />}>
              <Route path="/" element={<CustomerHomePage />} />
              <Route path="/location/:id" element={<LocationDetailPage />} />
              <Route path="/rooms" element={<CustomerRoomsPage />} />
              <Route path="/services" element={<CustomerServicesPage />} />
              <Route path="/attractions" element={<CustomerAttractionsPage />} />
              <Route path="/contact" element={<CustomerContactPage />} />
              <Route path="/profile" element={<CustomerProfilePage />} />
              <Route path="/reviews" element={<CustomerReviewsPage />} />
              <Route path="/offers" element={<CustomerOffersPage />} />
              <Route path="/my-bookings" element={<CustomerBookingHistoryPage />} />
            </Route>

            {/* ADMIN ROUTES - ProtectedRoute chặn Guest, RoleGuard phân quyền chi tiết */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AdminLayout />}> 
                {/* Hồ sơ cá nhân - Tất cả nhân viên đều xem được */}
                <Route path="/admin/profile" element={<ProfilePage />} />

                {/* Thống kê/Dashboard - Chỉ Admin & Manager */}
                <Route element={<RoleGuard allowedRoles={[]} />}>
                  <Route path="/admin/dashboard" element={<DashboardPage />} />
                </Route>

                {/* Quản lý Quỹ Phòng - Chỉ Admin & Manager */}
                <Route element={<RoleGuard allowedRoles={[]} />}>
                  <Route path="/admin/rooms" element={<RoomManagementPage />} />
                </Route>

                {/* Sơ đồ phòng - Admin, Manager, Lễ tân, Buồng phòng (Chỉ xem) */}
                <Route element={<RoleGuard allowedRoles={['receptionist', 'lễ tân', 'housekeeping', 'buồng phòng']} />}>
                  <Route path="/admin/room-grid" element={<RoomGridPage />} />
                </Route>

                {/* Lễ Tân - Tạo đơn, Trả phòng, Danh sách đặt phòng */}
                <Route element={<RoleGuard allowedRoles={['receptionist', 'lễ tân']} />}>
                  <Route path="/admin/checkout" element={<CheckoutPage />} />
                  <Route path="/admin/bookings" element={<BookingListPage />} />
                  <Route path="/admin/booking" element={<CreateBooking />} />
                </Route>

                {/* Dọn phòng - Admin, Manager, Lễ tân, Buồng phòng */}
                <Route element={<RoleGuard allowedRoles={['receptionist', 'lễ tân', 'housekeeping', 'buồng phòng']} />}>
                  <Route path="/admin/housekeeping" element={<HousekeepingListPage />} />
                  <Route path="/admin/housekeeping/:roomId" element={<HousekeepingChecklist />} />
                </Route>

                {/* Thất thoát & Đền bù - Admin, Manager, Lễ tân, Buồng phòng */}
                <Route element={<RoleGuard allowedRoles={['receptionist', 'lễ tân', 'housekeeping', 'buồng phòng']} />}>
                  <Route path="/admin/loss-damage" element={<LossAndDamagePage />} />
                </Route>

                {/* Quản lý kho vật tư - Chỉ Admin & Manager */}
                <Route element={<RoleGuard allowedRoles={[]} />}>
                  <Route path="/admin/inventory" element={<EquipmentManagementPage />} />
                </Route>

                {/* Khuyến mãi / Bài viết - Admin, Manager, Lễ tân */}
                <Route element={<RoleGuard allowedRoles={['receptionist', 'lễ tân']} />}>
                  <Route path="/admin/vouchers" element={<VoucherManagement />} />
                  <Route path="/admin/attractions" element={<TouristAttractions />} />
                  <Route path="/admin/reviews" element={<AdminReviewsPage />} />
                </Route>

                {/* Quản lý Nhân sự / Phân quyền - Chỉ Admin & Manager */}
                <Route element={<RoleGuard allowedRoles={[]} />}>
                  <Route path="/admin/employees" element={<UserManagementPage />} />
                  <Route path="/admin/roles" element={<RoleManagementPage />} />
                  <Route path="/admin/settings" element={<SystemSettingsPage />} />
                  <Route path="/admin/audit-logs" element={<AuditLogsPage />} />
                </Route>
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </AntApp>
    </ConfigProvider>
  );
}

export default App;