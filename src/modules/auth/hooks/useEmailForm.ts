import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthFlow } from '../store/AuthFlowContext';
import { emailSchema, EmailFormValues } from '../schemas/auth.schema';
import { useGoogleLogin } from '@react-oauth/google';
import { generateCodeVerifier, generateCodeChallenge } from '@/lib/pkce';

// Config from environment variables
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

  // 1. Setup form
  const form = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema)
  });

  // 2. Email submit logic
  const onSubmit = async (data: EmailFormValues) => {
    await submitEmail(data.email);
  };

  // 3. Google logic
  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      await loginGoogle(tokenResponse.access_token);
    },
    onError: () => setError("Google sign-in failed"),
  });

  // 4. Facebook logic
  const handleFacebookSuccess = async (response: { accessToken?: string }) => {
    if (response.accessToken) {
      await loginFacebook(response.accessToken);
    }
  };

  // 5. TikTok logic
  const handleTikTokLogin = async () => {
    try {
      const csrfState = Math.random().toString(36).substring(7);
      const codeVerifier = generateCodeVerifier();
      const codeChallenge = await generateCodeChallenge(codeVerifier);
      
      // Store verifier for callback page
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
      setError("Unable to initialize TikTok sign-in");
    }
  };

  const handleAppleLogin = () => {
    // Keep flow explicit until Apple auth API is fully wired in UI integration.
    setError('Apple sign-in is not available yet.');
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
      apple: handleAppleLogin,
      facebookAppId: FACEBOOK_APP_ID
    }
  };
};