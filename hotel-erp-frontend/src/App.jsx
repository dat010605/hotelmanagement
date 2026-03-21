import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './routes/ProtectedRoute';

// Component giả lập để test luồng (Người số 2 sẽ thay thế cái này sau bằng AdminLayout)
const TempDashboard = () => (
  <div style={{ padding: 50, textAlign: 'center' }}>
    <h1>🎉 Chào mừng đến với Admin Dashboard!</h1>
    <p>Nếu ngài thấy dòng này, nghĩa là ngài đã đăng nhập thành công và có Token hợp lệ.</p>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Tuyến đường công khai */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* Nếu gõ localhost:5173, tự động chuyển về trang login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Tuyến đường bảo vệ (Yêu cầu phải qua ải ProtectedRoute) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/admin/dashboard" element={<TempDashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;