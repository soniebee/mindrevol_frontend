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
    // Backend trả về success(summary) nếu tồn tại, success(null) nếu chưa
    return http.post<ApiResponse<UserSummary | null>>('/auth/check-email', { email });
  },

  checkHandle: async (handle: string) => {
    // Backend trả về success(true) nếu tồn tại, success(false) nếu chưa
    return http.post<ApiResponse<boolean>>('/auth/check-handle', { handle });
  },

  // --- 2. LUỒNG ĐĂNG KÝ MỚI (Redis -> OTP) ---
  
  // Bước 1: Gửi info -> Nhận OTP (Chưa tạo user)
  registerStep1: async (payload: RegisterPayload) => {
    return http.post<ApiResponse<void>>('/auth/register', payload);
  },

  // Bước 2: Verify OTP -> Tạo User -> Nhận Token
  verifyRegisterOtp: async (email: string, otpCode: string) => {
    return http.post<ApiResponse<AuthResponse>>('/auth/register/verify', { email, otpCode });
  },

  // Gửi lại mã OTP đăng ký
  resendRegisterOtp: async (email: string) => {
    return http.post<ApiResponse<void>>('/auth/register/resend', { email });
  },

  // --- 3. CÁC HÀM LOGIN CŨ (GIỮ NGUYÊN) ---
  login: async (email: string, password: string) => {
    return http.post<ApiResponse<AuthResponse>>('/auth/login', { email, password });
  },
  
  // ... (Giữ nguyên các hàm social login, magic link cũ nếu cần) ...
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
  // [THÊM MỚI] Hàm sendMagicLink bị thiếu
  sendMagicLink: async (email: string) => {
     return http.post<ApiResponse<void>>('/auth/magic-link', { email });
  },
};