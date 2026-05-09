import { Navigate, Outlet } from 'react-router-dom';
import { useAdminAuthStore } from '../store/adminAuthStore';

/**
 * ProtectedRoute - Bảo vệ toàn bộ khu vực /admin/*
 * 
 * Logic phân quyền:
 * 1. Không có token → về /login
 * 2. Role = "guest" → về trang chủ "/" (CHẶN HOÀN TOÀN)
 * 3. Các role khác (admin, management, receptionist, housekeeping, inventory, hr...) → cho vào
 * 
 * Sau khi qua ProtectedRoute, RoleGuard sẽ kiểm tra chi tiết từng module.
 */
const ProtectedRoute = () => {
  const token = useAdminAuthStore((state) => state.token);
  const user = useAdminAuthStore((state) => state.user);

  // Nếu không có token, đá thẳng về trang /login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Lấy role và chuẩn hóa
  const userRole = user?.role?.toLowerCase()?.trim() || '';

  // DANH SÁCH CÁC ROLE BỊ CHẶN KHỎI ADMIN (Khách hàng)
  const blockedRoles = ['guest', 'khách', 'khách hàng', 'customer'];

  // Nếu là Guest → CHẶN, redirect về trang chủ
  if (blockedRoles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }

  // Nếu có token và không phải Guest, cho phép render các trang con (Outlet)
  return <Outlet />;
};

export default ProtectedRoute;