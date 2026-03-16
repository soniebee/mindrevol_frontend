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
      console.error('Failed to load user profile:', error);
      
      // Only logout on auth errors (401/403)
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
    // Additional redirect or cleanup logic can be added here
  };

  const refreshProfile = async () => {
      await fetchUserProfile();
  }

  // --- INIT EFFECT ---
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        // Optimistic UI: if token exists, mark authenticated for fast initial render
        setIsAuthenticated(true);
        // Then fetch profile to verify token validity
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