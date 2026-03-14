import { useState, useEffect } from 'react';
import { userService, UserProfile } from '@/modules/user/services/user.service';

export const useGlobalAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // --- ACTIONS ---

  const fetchUserProfile = async () => {
    try {
      const profile = await userService.getMyProfile();
      setUser(profile);
      setIsAuthenticated(true);
    } catch (error: any) {
      console.error("❌ Lỗi tải thông tin User:", error);
      
      // Chỉ logout khi lỗi Auth (401/403)
      if (error.response?.status === 401 || error.response?.status === 403) {
        logout(); 
      }
    }
  };

  const login = async (token: string, refreshToken: string) => {
    localStorage.setItem('accessToken', token);
    localStorage.setItem('refreshToken', refreshToken);
    setIsAuthenticated(true);
    await fetchUserProfile(); 
  };

  const logout = () => {
    console.log("👋 Logging out...");
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setIsAuthenticated(false);
    setUser(null);
    // Có thể thêm logic redirect hoặc clear state khác ở đây
  };

  const refreshProfile = async () => {
      await fetchUserProfile();
  }

  // --- EFFECT: KHỞI TẠO ---
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        // Optimistic UI: Có token thì cứ coi là đã login để App render nhanh
        setIsAuthenticated(true);
        // Sau đó fetch profile để verify
        await fetchUserProfile();
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  return {
    isAuthenticated,
    isLoading,
    user,
    login,
    logout,
    refreshProfile
  };
};