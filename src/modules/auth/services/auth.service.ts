import { http } from '@/lib/http';
import { 
  UserSummary, 
  AuthResponse, 
  RegisterPayload, 
  ApiResponse 
} from '../types';

export const authService = {
  // --- 1. VALIDATION API ---
  checkEmail: async (email: string) => {
    // Backend returns success(summary) if exists, success(null) if not
    return http.post<ApiResponse<UserSummary | null>>('/auth/check-email', { email });
  },

  checkHandle: async (handle: string) => {
    // Backend returns success(true) if exists, success(false) if not
    return http.post<ApiResponse<boolean>>('/auth/check-handle', { handle });
  },

  // --- 2. NEW REGISTRATION FLOW (Redis -> OTP) ---
  
  // Step 1: Submit profile info -> Receive OTP (user not created yet)
  registerStep1: async (payload: RegisterPayload) => {
    return http.post<ApiResponse<void>>('/auth/register', payload);
  },

  // Step 2: Verify OTP -> Create user -> Receive tokens
  verifyRegisterOtp: async (email: string, otpCode: string) => {
    return http.post<ApiResponse<AuthResponse>>('/auth/register/verify', { email, otpCode });
  },

  // Resend registration OTP
  resendRegisterOtp: async (email: string) => {
    return http.post<ApiResponse<void>>('/auth/register/resend', { email });
  },

  // --- 3. EXISTING LOGIN METHODS (UNCHANGED) ---
  login: async (email: string, password: string) => {
    return http.post<ApiResponse<AuthResponse>>('/auth/login', { email, password });
  },
  
  // ... (Keep social login and magic-link methods as needed) ...
  sendOtp: async (email: string) => {
     return http.post<ApiResponse<void>>('/auth/otp/send', { email });
  },
  verifyOtp: async (email: string, otpCode: string) => {
     return http.post<ApiResponse<AuthResponse>>('/auth/otp/login', { email, otpCode });
  },
  loginGoogle: async (accessToken: string) => http.post('/auth/login/google', { accessToken }),
  loginFacebook: async (accessToken: string) => http.post('/auth/login/facebook', { accessToken }),
  loginTikTok: async (code: string, codeVerifier: string) => http.post('/auth/login/tiktok', { code, codeVerifier }),
  loginApple: async (identityToken: string, user?: string) => http.post('/auth/login/apple', { identityToken, user }),
  // Magic Link login (one-click sign-in email, not password reset)
  sendMagicLink: async (email: string) => {
     return http.post<ApiResponse<void>>('/auth/magic-link', { email });
  },

  // Forgot password (send reset link to email)
  forgotPassword: async (email: string) => {
    return http.post<ApiResponse<void>>('/auth/forgot-password', { email });
  },

  // Reset password with token from forgot-password email
  resetPassword: async (token: string, newPassword: string) => {
    return http.post<ApiResponse<void>>('/auth/reset-password', { token, newPassword });
  },
};