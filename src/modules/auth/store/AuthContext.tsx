import React, { createContext, useContext, useEffect } from 'react'; // [SỬA] Thêm useEffect
import { UserProfile } from '@/modules/user/services/user.service';
import { useGlobalAuth } from '../hooks/useGlobalAuth';
import { identifyUser, resetAnalytics } from '@/lib/analytics'; // <--- [THÊM] Import

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

  // [THÊM] Theo dõi trạng thái đăng nhập để báo cáo Analytics
  useEffect(() => {
    if (authLogic.user) {
      // Khi có user -> Định danh
      identifyUser(authLogic.user.id, {
        email: authLogic.user.email,
        fullname: authLogic.user.fullname, // Tên sẽ bị che trong session replay, chỉ hiện ở dashboard quản trị
        role: authLogic.user.role
      });
    } else if (!authLogic.isAuthenticated && !authLogic.isLoading) {
      // Khi không còn user -> Reset
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