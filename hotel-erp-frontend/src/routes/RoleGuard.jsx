import { Navigate, Outlet } from 'react-router-dom';
import { useAdminAuthStore } from '../store/adminAuthStore';

const RoleGuard = ({ allowedRoles }) => {
  const user = useAdminAuthStore((state) => state.user);
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const userRole = user?.role?.toLowerCase()?.trim() || '';
  const isFullAccess = ['admin', 'managenment', 'management', 'manager', 'quản lý', 'managemnt', 'managêmnt'].includes(userRole);

  // Nếu user thuộc role admin/management thì luôn cho phép
  if (isFullAccess) {
    return <Outlet />;
  }

  // Nếu route không truyền thuộc tính allowedRoles (undefined) thì public cho người đã đăng nhập
  if (allowedRoles === undefined || allowedRoles === null) {
      return <Outlet />;
  }

  // Kiểm tra role của user có nằm trong danh sách cho phép không
  if (allowedRoles.includes(userRole)) {
    return <Outlet />;
  }

  // Nếu không có quyền, chuyển hướng về dashboard hoặc báo lỗi (ở đây cho về dashboard)
  return <Navigate to="/admin/dashboard" replace />;
};

export default RoleGuard;
