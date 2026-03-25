import { useAdminAuthStore } from '../store/adminAuthStore';

const RequirePermission = ({ permission, children }) => {
  // 1. Lấy danh sách quyền hiện tại của User từ Zustand Store của bạn
  const permissions = useAdminAuthStore((state) => state.permissions || []);

  // 2. Kiểm tra xem quyền yêu cầu (ví dụ: MANAGE_USERS) có trong mảng quyền không
  const hasPermission = permissions.includes(permission);

  // 3. Nếu có quyền thì mới render (hiển thị) nội dung bên trong, nếu không thì ẩn hoàn toàn
  if (!hasPermission) {
    return null;
  }

  return <>{children}</>;
};

export default RequirePermission;