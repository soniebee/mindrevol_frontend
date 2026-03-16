import React, { createContext, useContext, useEffect } from 'react'; // [UPDATED] Added useEffect
import { UserProfile } from '@/modules/user/services/user.service';
import { useGlobalAuth } from '../hooks/useGlobalAuth';
import { identifyUser, resetAnalytics } from '@/lib/analytics'; // [ADDED] Import

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

  // Track auth state for analytics
  useEffect(() => {
    if (authLogic.user) {
      // Identify signed-in user
      identifyUser(authLogic.user.id, {
        email: authLogic.user.email,
        fullname: authLogic.user.fullname, // Name is masked in session replay and visible in analytics dashboard
        role: authLogic.user.role
      });
    } else if (!authLogic.isAuthenticated && !authLogic.isLoading) {
      // No active user -> reset analytics identity
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