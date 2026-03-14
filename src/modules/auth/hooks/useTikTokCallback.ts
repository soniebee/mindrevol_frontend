// src/modules/auth/hooks/useTikTokCallback.ts
import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthFlow } from '../store/AuthFlowContext';

export const useTikTokCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginTikTok, setError } = useAuthFlow();
  const processedRef = useRef(false); // Tránh gọi 2 lần do React StrictMode

  useEffect(() => {
    if (processedRef.current) return;
    
    const code = searchParams.get('code');
    const error = searchParams.get('error_code');
    const verifier = localStorage.getItem('tiktok_code_verifier');

    if (error) {
        setError("Người dùng từ chối cấp quyền TikTok");
        navigate('/auth');
        return;
    }

    if (code && verifier) {
      processedRef.current = true;
      loginTikTok(code, verifier)
        .then(() => {
           // Login thành công -> Redirect về trang chủ hoặc setup
           navigate('/'); 
        })
        .catch(() => {
           navigate('/auth'); // Lỗi thì quay về login
        });
    }
  }, [searchParams, loginTikTok, navigate, setError]);
};