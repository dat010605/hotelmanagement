import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ProtectedRoute from './routes/ProtectedRoute';
import AdminLayout from './layouts/AdminLayout'; // Import khung giao diện mới

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
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Tuyến đường bảo vệ có lồng Layout */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}> 
            <Route path="/admin/dashboard" element={<DashboardPage />} />
            <Route path="/admin/users" element={<div>Trang quản lý User</div>} />
            <Route path="/admin/rooms" element={<div>Trang quản lý Phòng</div>} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;