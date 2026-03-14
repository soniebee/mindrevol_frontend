import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service';

export const useActivateAccount = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [status, setStatus] = useState<'LOADING' | 'SUCCESS' | 'ERROR'>('LOADING');
  const [message, setMessage] = useState('');
  
  const processedRef = useRef(false);

  useEffect(() => {
    if (processedRef.current) return;
    
    // Giả sử URL là /auth/activate?token=...
    // Hoặc nếu bạn dùng Magic Link thì token ở trong URL
    const token = searchParams.get('token'); 

    if (!token) {
        setStatus('ERROR');
        setMessage('Đường dẫn kích hoạt không hợp lệ.');
        return;
    }

    processedRef.current = true;

    // Gọi API Verify (Cần đảm bảo authService có hàm này)
    // Nếu chưa có, bạn cần thêm vào auth.service.ts: 
    // verifyEmail: (token: string) => http.post('/auth/verify-email', { token })
    
    // Ví dụ giả định hàm verifyEmail:
    /* authService.verifyEmail(token)
         .then(() => {
            setStatus('SUCCESS');
         })
         .catch((err) => {
            setStatus('ERROR');
            setMessage(err.response?.data?.message || 'Kích hoạt thất bại');
         });
    */
    
    // Tạm thời nếu chưa có API, mình để logic mock chờ bạn bổ sung:
    setTimeout(() => {
        // MOCK SUCCESS
        setStatus('SUCCESS'); 
    }, 1500);

  }, [searchParams]);

  const goToLogin = () => navigate('/auth');

  return { status, message, goToLogin };
};