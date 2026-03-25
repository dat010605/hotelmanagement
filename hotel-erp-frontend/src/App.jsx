import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ProfilePage from './pages/ProfilePage'; 
import ProtectedRoute from './routes/ProtectedRoute';
import AdminLayout from './layouts/AdminLayout';

// 2 trang của Người 3 và Người 4
import UserManagementPage from './pages/UserManagementPage';
import RoleManagementPage from './pages/RoleManagementPage';

// Trang Dashboard con
const DashboardPage = () => (
  <div>
    <h2>📊 Tổng quan hệ thống</h2>
    <p>Chào mừng ngài trở lại. </p>
  </div>
);

function App() {
  return (
    // THÊM LẠI THẺ BROWSER ROUTER Ở ĐÂY
    <BrowserRouter>
      <Routes>
        {/* --- Tuyến đường công khai --- */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        
        {/* Mặc định vào trang web sẽ đá sang login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* --- Tuyến đường bảo vệ (Yêu cầu đăng nhập) --- */}
        <Route element={<ProtectedRoute />}>
          {/* Lồng AdminLayout để giữ Sidebar/Header cố định */}
          <Route element={<AdminLayout />}> 
            <Route path="/admin/dashboard" element={<DashboardPage />} />
            
            {/* Trang Quản lý Nhân sự */}
            <Route path="/admin/employees" element={<UserManagementPage />} />
            
            {/* Trang Phân quyền (Roles) */}
            <Route path="/admin/roles" element={<RoleManagementPage />} />
            
            <Route path="/admin/rooms" element={<div>🏠 Trang quản lý Phòng</div>} />
            <Route path="/admin/profile" element={<ProfilePage />} />
            <Route path="/admin/settings" element={<div>⚙️ Cấu hình hệ thống</div>} />
          </Route>
        </Route>

        {/* Nếu gõ bậy bạ sẽ tự về login hoặc trang 404 */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;