import React, { createContext, useContext } from 'react';
import { UserSummary, RegisterPayload, AuthStep } from '../types';
import { useAuthLogic } from '../hooks/useAuthLogic'; 

// Interface định nghĩa Context
interface AuthFlowContextType {
  currentStep: AuthStep;
  email: string;
  userInfo: UserSummary | null;
  isLoading: boolean;
  error: string | null;
  setError: (msg: string | null) => void;
  
  registerData: Partial<RegisterPayload>; 
  updateRegisterData: (data: Partial<RegisterPayload>) => void;
  
  // Các hàm Async
  submitEmail: (email: string) => Promise<void>;
  login: (password: string) => Promise<void>;
  
  // [ĐÃ XÓA] register: (finalData?: Partial<RegisterPayload>) => Promise<void>; 
  // Lý do: Việc đăng ký giờ do useRegisterWizard đảm nhiệm riêng biệt
  
  verifyOtp: (code: string) => Promise<void>;
  resendOtp: () => Promise<void>;
  
  // Social
  loginGoogle: (accessToken: string) => Promise<void>;
  loginFacebook: (accessToken: string) => Promise<void>;
  loginTikTok: (code: string, codeVerifier: string) => Promise<void>;

  // Navigation
  resetFlow: () => void;
  goToLogin: () => void;    
  goToRegister: () => void; 
  goToOtp: () => void;      
}

const AuthFlowContext = createContext<AuthFlowContextType | undefined>(undefined);

export const AuthFlowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const authLogic = useAuthLogic();

  return (
    <AuthFlowContext.Provider value={authLogic}>
      {children}
    </AuthFlowContext.Provider>
  );
};

export const useAuthFlow = () => {
  const context = useContext(AuthFlowContext);
  if (!context) throw new Error('useAuthFlow must be used within AuthFlowProvider');
  return context;
};