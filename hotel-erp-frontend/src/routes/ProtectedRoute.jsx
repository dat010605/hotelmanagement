import { Navigate, Outlet } from 'react-router-dom';
import { useAdminAuthStore } from '../store/adminAuthStore';

const ProtectedRoute = () => {
  const token = useAdminAuthStore((state) => state.token);

  // Nếu không có token, đá thẳng về trang /login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Nếu có token, cho phép render các trang con (Outlet)
  return <Outlet />;
};

export default ProtectedRoute;