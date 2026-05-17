import { useAdminAuthStore } from '../store/adminAuthStore';

const RequirePermission = ({ permission, children }) => {
  const permissions = useAdminAuthStore((state) => state.permissions);

  // FIX LỖI TRẮNG TRANG Ở ĐÂY:
  // Ép nó luôn là một mảng, nếu chưa có gì thì là mảng rỗng []
  const safePermissions = Array.isArray(permissions) ? permissions : [];

  const hasPermission = safePermissions.includes(permission);

  if (!hasPermission) {
    return null;
  }

  return <>{children}</>;
};

export default RequirePermission;