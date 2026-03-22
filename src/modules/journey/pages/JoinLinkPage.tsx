import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { journeyService } from '../services/journey.service';
import { Button } from '@/components/ui/Button';
import { Loader2 } from 'lucide-react';

export const JoinLinkPage = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Đang xử lý yêu cầu tham gia...');

  useEffect(() => {
    if (!code) {
      setStatus('error');
      setMessage('Đường dẫn không hợp lệ.');
      return;
    }

    const join = async () => {
      try {
        await journeyService.joinJourney({ inviteCode: code });
        setStatus('success');
        setMessage('Tham gia thành công! Đang chuyển hướng...');
        
        // Đợi 1.5s rồi chuyển về trang danh sách
        setTimeout(() => navigate('/journeys'), 1500);
      } catch (err: any) {
        setStatus('error');
        // Lấy lỗi từ backend trả về nếu có
        const errorMsg = err.response?.data?.message || 'Mã mời không đúng hoặc bạn đã tham gia rồi.';
        setMessage(errorMsg);
      }
    };

    join();
  }, [code, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-sm w-full text-center">
        {status === 'processing' && (
          <>
            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900">Đang tham gia nhóm...</h3>
            <p className="text-gray-500 mt-2">Mã mời: <span className="font-mono font-bold">{code}</span></p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
              🎉
            </div>
            <h3 className="text-lg font-semibold text-green-700">Thành công!</h3>
            <p className="text-gray-600 mt-2">{message}</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
              ⚠️
            </div>
            <h3 className="text-lg font-semibold text-red-700">Có lỗi xảy ra</h3>
            <p className="text-gray-600 mt-2 mb-6">{message}</p>
            <Button onClick={() => navigate('/')} className="w-full">
              Về trang chủ
            </Button>
          </>
        )}
      </div>
    </div>
  );
};