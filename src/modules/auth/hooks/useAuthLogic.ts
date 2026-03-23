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

  const [lastOtpSentAt, setLastOtpSentAt] = useState<number>(0);

  // [MỚI] State lưu tạm token cho user đăng nhập mxh lần đầu
  const [tempToken, setTempToken] = useState<{accessToken: string, refreshToken: string} | null>(null);

  // --- HELPERS ---
  const handleAuthSuccess = (response: any) => {
      // Backend mới cập nhật đã trả về isNewUser
      const { accessToken, refreshToken, isNewUser } = response.data.data;
      
      if (isNewUser) {
          // Là user mới từ mạng xã hội -> Lưu tạm token, bắt setup handle/thông tin
          setTempToken({ accessToken, refreshToken });
          setCurrentStep('SOCIAL_SETUP');
          toast('Tạo tài khoản thành công! Vui lòng hoàn tất hồ sơ.', { icon: '✨' });
      } else {
          // User cũ hoặc đã setup xong -> Vào thẳng app
          globalLogin(accessToken, refreshToken);
      }
  };

  // [MỚI] Hàm gọi sau khi user đã điền xong Form Setup ở bước SOCIAL_SETUP
  const completeSocialSetup = () => {
      if (tempToken) {
          globalLogin(tempToken.accessToken, tempToken.refreshToken);
          setTempToken(null);
      }
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
    setLastOtpSentAt(0); 
    setTempToken(null);
  };

  // --- SMART GO TO OTP ---
  const goToOtp = async () => {
    const now = Date.now();
    const COOLDOWN_TIME = 60000; 

    if (now - lastOtpSentAt < COOLDOWN_TIME) {
        toast('Vui lòng kiểm tra email để lấy mã', { icon: '📧' });
        setCurrentStep('OTP_INPUT');
        return;
    }

    try {
        await authService.sendOtp(email);
        setLastOtpSentAt(Date.now()); 
        toast.success('Đã gửi mã xác thực mới');
        setCurrentStep('OTP_INPUT');
    } catch (e: any) {
        console.error("Lỗi gửi OTP", e);
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
        setUserInfo(userData);
        if (userData.hasPassword) {
            setCurrentStep('PASSWORD_LOGIN');
        } else {
            await goToOtp();
        }
      } else {
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
    currentStep, email, userInfo, isLoading, error, registerData, tempToken,
    setError,
    updateRegisterData: (data: Partial<RegisterPayload>) => setRegisterData(prev => ({ ...prev, ...data })),
    submitEmail, 
    login, 
    verifyOtp, 
    resendOtp, 
    resetFlow,
    completeSocialSetup, // [MỚI]
    loginGoogle: (t: string) => loginSocial('google', t),
    loginFacebook: (t: string) => loginSocial('facebook', t),
    loginTikTok: (c: string, v: string) => loginSocial('tiktok', c, v),
    goToLogin: () => setCurrentStep('PASSWORD_LOGIN'),
    goToRegister: () => setCurrentStep('REGISTER_WIZARD'),
    goToOtp: goToOtp,
  };
};