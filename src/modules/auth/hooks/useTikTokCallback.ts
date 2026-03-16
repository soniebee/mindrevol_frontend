// src/modules/auth/hooks/useTikTokCallback.ts
import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthFlow } from '../store/AuthFlowContext';

export const useTikTokCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginTikTok, setError } = useAuthFlow();
  const processedRef = useRef(false); // Prevent double call in React StrictMode

  useEffect(() => {
    if (processedRef.current) return;
    
    const code = searchParams.get('code');
    const error = searchParams.get('error_code');
    const verifier = localStorage.getItem('tiktok_code_verifier');

    if (error) {
        setError("User denied TikTok authorization");
        navigate('/auth');
        return;
    }

    if (code && verifier) {
      processedRef.current = true;
      loginTikTok(code, verifier)
        .then(() => {
           // Login success -> Redirect to home or setup
           navigate('/'); 
        })
        .catch(() => {
           navigate('/auth'); // On error, go back to auth
        });
    }
  }, [searchParams, loginTikTok, navigate, setError]);
};