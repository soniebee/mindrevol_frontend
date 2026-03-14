import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthFlow } from '../store/AuthFlowContext';
import { emailSchema, EmailFormValues } from '../schemas/auth.schema';
import { useGoogleLogin } from '@react-oauth/google';
import { generateCodeVerifier, generateCodeChallenge } from '@/lib/pkce';

// Config lấy từ env
const FACEBOOK_APP_ID = import.meta.env.VITE_FACEBOOK_APP_ID;
const TIKTOK_CLIENT_KEY = import.meta.env.VITE_TIKTOK_CLIENT_KEY;
const TIKTOK_REDIRECT_URI = import.meta.env.VITE_TIKTOK_REDIRECT_URI;

export const useEmailForm = () => {
  const { 
    submitEmail, 
    isLoading, 
    error, 
    setError, 
    loginGoogle, 
    loginFacebook 
  } = useAuthFlow();

  // 1. Setup Form
  const form = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema)
  });

  // 2. Logic Submit Email
  const onSubmit = async (data: EmailFormValues) => {
    await submitEmail(data.email);
  };

  // 3. Logic Google
  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      await loginGoogle(tokenResponse.access_token);
    },
    onError: () => setError("Đăng nhập Google thất bại"),
  });

  // 4. Logic Facebook
  const handleFacebookSuccess = async (response: any) => {
    if (response.accessToken) {
      await loginFacebook(response.accessToken);
    }
  };

  // 5. Logic TikTok (Đã được tách gọn gàng)
  const handleTikTokLogin = async () => {
    try {
      const csrfState = Math.random().toString(36).substring(7);
      const codeVerifier = generateCodeVerifier();
      const codeChallenge = await generateCodeChallenge(codeVerifier);
      
      // Lưu verifier để dùng lại ở trang callback
      localStorage.setItem('tiktok_code_verifier', codeVerifier);
      
      let url = 'https://www.tiktok.com/v2/auth/authorize/';
      url += `?client_key=${TIKTOK_CLIENT_KEY}`;
      url += `&scope=user.info.basic`;
      url += `&response_type=code`;
      url += `&redirect_uri=${TIKTOK_REDIRECT_URI}`;
      url += `&state=${csrfState}`;
      url += `&code_challenge=${codeChallenge}`;
      url += `&code_challenge_method=S256`;
      
      window.location.href = url;
    } catch (e) {
      console.error(e);
      setError("Không thể khởi tạo đăng nhập TikTok");
    }
  };

  return {
    form,
    isLoading,
    error,
    onSubmit: form.handleSubmit(onSubmit),
    social: {
      google: handleGoogleLogin,
      facebook: handleFacebookSuccess,
      tiktok: handleTikTokLogin,
      facebookAppId: FACEBOOK_APP_ID
    }
  };
};