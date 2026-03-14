import { useState } from 'react';
import { authService } from '../services/auth.service';
import { UserSummary, RegisterPayload, AuthStep } from '../types';
import { useAuth } from '../store/AuthContext';
import { toast } from 'react-hot-toast';

export const useAuthLogic = () => {
  const { login: globalLogin } = useAuth(); 

  // --- STATE ---
  const [currentStep, setCurrentStep] = useState<AuthStep>('EMAIL_INPUT');
  const [email, setEmail] = useState('');
  const [userInfo, setUserInfo] = useState<UserSummary | null>(null);
  const [registerData, setRegisterData] = useState<Partial<RegisterPayload>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // [NEW] State lưu thời điểm gửi OTP cuối cùng (Client-side Cooldown)
  const [lastOtpSentAt, setLastOtpSentAt] = useState<number>(0);

  // --- HELPERS ---
  const handleAuthSuccess = (response: any) => {
      const { accessToken, refreshToken } = response.data.data;
      globalLogin(accessToken, refreshToken);
  };

  const handleError = (err: any, defaultMsg: string) => {
      setError(err.response?.data?.message || defaultMsg);
  };

  const resetFlow = () => { 
    setEmail(''); 
    setUserInfo(null); 
    setRegisterData({}); 
    setCurrentStep('EMAIL_INPUT'); 
    setError(null); 
    setLastOtpSentAt(0); // Reset cooldown
  };

  // --- [NEW] SMART GO TO OTP (Hàm chuyển hướng thông minh) ---
  const goToOtp = async () => {
    const now = Date.now();
    const COOLDOWN_TIME = 60000; // 60 giây

    // 1. Kiểm tra Cooldown: Nếu vừa gửi chưa được 60s
    if (now - lastOtpSentAt < COOLDOWN_TIME) {
        // KHÔNG GỌI API. Chỉ chuyển màn hình.
        toast('Vui lòng kiểm tra email để lấy mã', { icon: '📧' });
        setCurrentStep('OTP_INPUT');
        return;
    }

    // 2. Nếu đã quá 60s hoặc chưa gửi lần nào -> Gọi API gửi mới
    // (Không set loading toàn cục để tránh block UI khi chuyển tab, có thể dùng loading cục bộ nếu cần)
    try {
        await authService.sendOtp(email);
        setLastOtpSentAt(Date.now()); // Cập nhật thời điểm gửi
        toast.success('Đã gửi mã xác thực mới');
        setCurrentStep('OTP_INPUT');
    } catch (e: any) {
        console.error("Lỗi gửi OTP", e);
        
        // Trường hợp đặc biệt: Backend trả về 400 (Rate Limit) nhưng Client bị mất sync state
        // Vẫn cho user vào màn hình nhập (có thể họ đã nhận được mail trước đó)
        if (e.response?.status === 400) {
             toast('Mã vừa được gửi. Vui lòng kiểm tra email.', { icon: '⏳' });
             setCurrentStep('OTP_INPUT');
        } else {
             setError("Không thể gửi mã. Vui lòng thử lại sau.");
        }
    }
  };

  // --- CORE LOGIC ---
  const submitEmail = async (inputEmail: string) => {
    setIsLoading(true);
    setError(null);
    setEmail(inputEmail);
    setRegisterData(prev => ({ ...prev, email: inputEmail }));

    try {
      const response = await authService.checkEmail(inputEmail);
      const userData = response.data.data;

      if (userData) {
        // User tồn tại -> Smart Login
        setUserInfo(userData);
        
        if (userData.hasPassword) {
            // Có pass -> Vào màn hình nhập Pass
            setCurrentStep('PASSWORD_LOGIN');
        } else {
            // Không có pass (Social) -> Gọi hàm thông minh để gửi OTP
            await goToOtp();
        }
      } else {
        // User chưa tồn tại -> Đăng ký
        setUserInfo(null);
        setCurrentStep('REGISTER_WIZARD');
      }
    } catch (err: any) {
      console.error(err);
      setError('Không thể kết nối đến máy chủ.');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await authService.login(email, password);
      handleAuthSuccess(res);
    } catch (err: any) {
      handleError(err, 'Mật khẩu không chính xác');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async (code: string) => {
    setIsLoading(true);
    setError(null);
    try {
        const res = await authService.verifyOtp(email, code);
        handleAuthSuccess(res);
    } catch (err: any) {
        handleError(err, 'Mã xác thực không đúng');
    } finally {
        setIsLoading(false);
    }
  };

  const resendOtp = async () => {
    // Tận dụng lại hàm goToOtp để check cooldown luôn
    await goToOtp();
  };

  // --- SOCIAL LOGIN ---
  const loginSocial = async (provider: 'google' | 'facebook' | 'tiktok', ...args: string[]) => {
    setIsLoading(true);
    setError(null);
    try {
        let res;
        if (provider === 'google') res = await authService.loginGoogle(args[0]);
        else if (provider === 'facebook') res = await authService.loginFacebook(args[0]);
        else if (provider === 'tiktok') res = await authService.loginTikTok(args[0], args[1]);
        
        if (res) handleAuthSuccess(res);
    } catch (err: any) {
        handleError(err, `Đăng nhập ${provider} thất bại`);
    } finally {
        setIsLoading(false);
    }
  };

  return {
    // Data
    currentStep, email, userInfo, isLoading, error, registerData,
    // Actions
    setError,
    updateRegisterData: (data: Partial<RegisterPayload>) => setRegisterData(prev => ({ ...prev, ...data })),
    submitEmail, 
    login, 
    verifyOtp, 
    resendOtp, 
    resetFlow,
    // Social
    loginGoogle: (t: string) => loginSocial('google', t),
    loginFacebook: (t: string) => loginSocial('facebook', t),
    loginTikTok: (c: string, v: string) => loginSocial('tiktok', c, v),
    // Navigation Helpers
    goToLogin: () => setCurrentStep('PASSWORD_LOGIN'),
    goToRegister: () => setCurrentStep('REGISTER_WIZARD'),
    goToOtp: goToOtp, // Export hàm thông minh này để PasswordForm sử dụng
  };
};