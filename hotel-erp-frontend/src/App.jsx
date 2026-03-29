import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ProfilePage from './pages/ProfilePage'; 
import ProtectedRoute from './routes/ProtectedRoute';
import AdminLayout from './layouts/AdminLayout';
import EquipmentManagementPage from './pages/EquipmentManagementPage';
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
            <Route path="/admin/rooms" element={<div>🏠 Trang quản lý Phòng</div>} />
            <Route path="/admin/settings" element={<div>⚙️ Cấu hình hệ thống</div>} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;