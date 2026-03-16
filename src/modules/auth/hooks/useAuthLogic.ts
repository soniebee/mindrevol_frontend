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

  // [NEW] Store the last OTP send timestamp (client-side cooldown)
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

  // --- [NEW] SMART GO TO OTP ---
  const goToOtp = async () => {
    const now = Date.now();
    const COOLDOWN_TIME = 60000; // 60 seconds

    // 1. Cooldown check: if OTP was sent in the last 60s
    if (now - lastOtpSentAt < COOLDOWN_TIME) {
        // Do not call API, only navigate to OTP screen.
        toast('Please check your email for the code', { icon: '📧' });
        setCurrentStep('OTP_INPUT');
        return;
    }

    // 2. If cooldown passed or no OTP sent yet -> request a new OTP
    // Avoid global loading state here to keep screen transitions smooth.
    try {
        await authService.sendOtp(email);
        setLastOtpSentAt(Date.now());
        toast.success('A new verification code was sent');
        setCurrentStep('OTP_INPUT');
    } catch (e: any) {
        console.error('Failed to send OTP', e);
        
        // Special case: backend returns 400 (rate limit) while client state is out of sync.
        // Let user proceed since they may already have a valid code in email.
        if (e.response?.status === 400) {
             toast('A code was recently sent. Please check your email.', { icon: '⏳' });
             setCurrentStep('OTP_INPUT');
        } else {
             setError('Unable to send code. Please try again later.');
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
        // Existing user -> Smart login path
        setUserInfo(userData);
        
        if (userData.hasPassword) {
            // Has password -> go to password step
            setCurrentStep('PASSWORD_LOGIN');
        } else {
            // No password (social account) -> go through OTP flow
            await goToOtp();
        }
      } else {
        // New user -> registration flow
        setUserInfo(null);
        setCurrentStep('REGISTER_WIZARD');
      }
    } catch (err: any) {
      console.error(err);
      setError('Unable to connect to the server.');
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
      handleError(err, 'Incorrect password');
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
        handleError(err, 'Invalid verification code');
    } finally {
        setIsLoading(false);
    }
  };

  const resendOtp = async () => {
    // Reuse goToOtp to keep cooldown behavior consistent
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
        handleError(err, `${provider} sign-in failed`);
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
    goToOtp: goToOtp,
  };
};

