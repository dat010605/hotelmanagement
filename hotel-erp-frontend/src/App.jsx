import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ProfilePage from './pages/ProfilePage'; 
import ProtectedRoute from './routes/ProtectedRoute';
import AdminLayout from './layouts/AdminLayout'; 
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
import { ConfigProvider, App as AntApp } from 'antd';
import TouristAttractions from "./pages/TouristAttractions";
import AuditLogsPage from "./pages/AuditLogsPage";
import DashboardPage from "./pages/DashboardPage";

function App() {
  return (
   // BỌC TOÀN BỘ BẰNG CONFIGPROVIDER ĐỂ CHỈNH FONT
    <ConfigProvider
      theme={{
        token: {
          fontSize: 16, // TĂNG LÊN 16px (Gốc là 14px, đúng yêu cầu to lên 2 size)
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", // Giúp font trông mượt hơn
        },
      }}
    >
      <AntApp>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/" element={<Navigate to="/login" replace />} />

            <Route element={<ProtectedRoute />}>
              <Route element={<AdminLayout />}> 
                <Route path="/admin/dashboard" element={<DashboardPage />} />
                <Route path="/admin/employees" element={<UserManagementPage />} />
                <Route path="/admin/inventory" element={<EquipmentManagementPage />} />
                <Route path="/admin/profile" element={<ProfilePage />} />
                <Route path="/admin/roles" element={<RoleManagementPage />} />
                <Route path="/admin/rooms" element={<RoomManagementPage />} />
                <Route path="/admin/room-grid" element={<RoomGridPage />} />
                <Route path="/admin/checkout" element={<CheckoutPage />} />
                <Route path="/admin/bookings" element={<BookingListPage />} />
                <Route path="/admin/loss-damage" element={<LossAndDamagePage />} />
                <Route path="/admin/settings" element={<div>⚙️ Cấu hình hệ thống</div>} />
                <Route path="/admin/housekeeping" element={<HousekeepingListPage />} />
                <Route path="/admin/housekeeping/:roomId" element={<HousekeepingChecklist />} />
                <Route path="/admin/booking" element={<CreateBooking />} />
                <Route path="/admin/vouchers" element={<VoucherManagement />} />
                
                {/* TASK MỚI CỦA DUY: TRANG ĐIỂM THAM QUAN */}
                <Route path="/admin/attractions" element={<TouristAttractions />} />
                <Route path="/admin/audit-logs" element={<AuditLogsPage />} />
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