// src/modules/auth/types.ts

// 1. User DTO (shared by Auth and User modules)
export interface UserSummary {
  id: number; // Note: backend may return UUID string; switch this to string if needed
  handle: string;
  fullname: string;
  avatarUrl: string;
  isOnline: boolean;
  
  // --- Added fields ---
  hasPassword: boolean; 
  authProvider: string; 
  // ------------------
}

// 2. Login/Register success response DTO
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
}

// 3. Register request DTO
export interface RegisterPayload {
  email: string;
  password?: string;
  fullname?: string;
  handle?: string;
  dateOfBirth?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';
  agreedToTerms?: boolean;
}

// 4. Standard API response wrapper
export interface ApiResponse<T> {
  status: number;
  message: string;
  errorCode?: string;
  data: T;
  timestamp: string;
}

// 5. Auth flow step definitions
export type AuthStep = 
  | 'EMAIL_INPUT'       // Step 1: enter email
  | 'PASSWORD_LOGIN'    // Step 2a: enter password (existing user)
  | 'OTP_INPUT'         // Step 2b: enter OTP (quick sign-in or no password)
  | 'REGISTER_WIZARD';  // Step 2c: new user registration
