import React, { createContext, useContext, useEffect } from 'react'; 
import { UserProfile, userService } from '@/modules/user/services/user.service'; // [SỬA] Import userService
import { useGlobalAuth } from '../hooks/useGlobalAuth';
import { identifyUser, resetAnalytics } from '@/lib/analytics';
import { requestFirebaseToken, onMessageListener } from '@/lib/firebase'; // [MỚI] Import Firebase functions

export interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: UserProfile | null;
  login: (token: string, refreshToken: string) => void;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const authLogic = useGlobalAuth();

  // Theo dõi trạng thái đăng nhập để báo cáo Analytics & Setup Firebase
  useEffect(() => {
    if (authLogic.user) {
      // 1. Định danh Analytics
      identifyUser(authLogic.user.id, {
        email: authLogic.user.email,
        fullname: authLogic.user.fullname, 
        role: authLogic.user.role
      });

      // 2. [MỚI] Thiết lập Firebase Push Notifications
      const setupFirebasePush = async () => {
        try {
          // Xin quyền và lấy Token từ Firebase
          const token = await requestFirebaseToken();
          
          if (token) {
            console.log("FCM Token lấy thành công:", token);
            // Gửi token xuống Backend để lưu vào Database
            await userService.updateFcmToken(token);
          }
        } catch (error) {
          console.error("Lỗi khi setup Firebase FCM Token:", error);
        }
      };

      // Chỉ chạy xin quyền khi user đã đăng nhập
      setupFirebasePush();

      // 3. [MỚI] Lắng nghe thông báo khi user ĐANG MỞ web (Foreground)
      let isListening = true; // Cờ để dọn dẹp (cleanup) khi unmount
      const listenToForegroundMessages = async () => {
        if (!isListening) return;
        try {
          const payload: any = await onMessageListener();
          console.log("Có thông báo mới khi đang mở app:", payload);
          // TODO: Bạn có thể thay đổi cách hiển thị thông báo ở đây (VD: Toast, Notification UI)
          // alert(`${payload.notification.title}: ${payload.notification.body}`);
          
          // Tiếp tục lắng nghe
          listenToForegroundMessages(); 
        } catch (error) {
          console.error("Lỗi khi lắng nghe thông báo FCM:", error);
        }
      };
      
      listenToForegroundMessages();

      // Hàm cleanup khi component unmount hoặc user thay đổi
      return () => {
        isListening = false;
      };

    } else if (!authLogic.isAuthenticated && !authLogic.isLoading) {
      // Khi không còn user -> Reset Analytics
      resetAnalytics();
    }
  }, [authLogic.user, authLogic.isAuthenticated, authLogic.isLoading]);

  return (
    <AuthContext.Provider value={authLogic}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};