import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ProfilePage from './pages/ProfilePage'; // 1. Import trang Profile Duy vừa tạo
import ProtectedRoute from './routes/ProtectedRoute';
import AdminLayout from './layouts/AdminLayout';

// Trang Dashboard con (thực tế)
const DashboardPage = () => (
  <div>
    <h2>📊 Tổng quan hệ thống</h2>
    <p>Chào mừng ngài trở lại. </p>
  </div>
);

function App() {
  return (
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
            {/* 2. Route cho Dashboard */}
            <Route path="/admin/dashboard" element={<DashboardPage />} />
            
            {/* 3. Đổi /admin/users thành /admin/employees cho khớp với Sidebar Duy đã viết */}
            <Route path="/admin/employees" element={<div>👥 Trang quản lý Nhân sự</div>} />
            
            {/* 4. Route cho quản lý phòng */}
            <Route path="/admin/rooms" element={<div>🏠 Trang quản lý Phòng</div>} />
            
            {/* 5. CỰC KỲ QUAN TRỌNG: Route cho Hồ sơ cá nhân của Duy */}
            <Route path="/admin/profile" element={<ProfilePage />} />
            
            {/* Trang cài đặt hệ thống (Duy có thể thêm sau) */}
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