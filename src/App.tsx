import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/modules/auth/store/AuthContext'; 
import { Loader2 } from 'lucide-react';

import AuthPage from '@/modules/auth/pages/AuthPage';
import HomePage from '@/pages/HomePage';
import ChatPage from '@/modules/chat/pages/ChatPage'; 
// import Terms from '@/pages/Terms';     
// import Privacy from '@/pages/Privacy'; 

function App() {
  const { isAuthenticated, isLoading } = useAuth();

  // Màn hình loading chờ kiểm tra trạng thái đăng nhập
  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#121212]">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <Routes>
      {/* --- CÁC TRANG CÔNG KHAI (KHÔNG CẦN LOGIN) --- */}
      {/* <Route path="/terms" element={<Terms />} />
      <Route path="/privacy" element={<Privacy />} /> */}

      {/* --- TRANG CHỦ & ĐĂNG NHẬP --- */}
      <Route path="/" element={
        isAuthenticated ? <HomePage /> : <AuthPage />
      } />

      {/* Fallback route: Bất kỳ đường dẫn nào không tồn tại sẽ tự văng về trang chủ */}
      <Route path="*" element={<Navigate to="/" replace />} />
      <Route path="/chat" element={
        isAuthenticated ? <ChatPage /> : <Navigate to="/" replace />
      } />

      <Route path="/chat/:conversationId" element={
        isAuthenticated ? <ChatPage /> : <Navigate to="/" replace />
      } />
    </Routes>
  );
}

export default App;