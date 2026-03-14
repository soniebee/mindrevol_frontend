import React from 'react';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useActivateAccount } from '../hooks/useActivateAccount';

export const ActivatePage = () => {
  const { status, message, goToLogin } = useActivateAccount();

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#09090b] p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md rounded-2xl border border-zinc-800 bg-[#18181b] p-8 text-center shadow-xl"
      >
        {status === 'LOADING' && (
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <h2 className="text-xl font-bold text-white">Đang kích hoạt tài khoản...</h2>
          </div>
        )}

        {status === 'SUCCESS' && (
          <div className="flex flex-col items-center space-y-4">
            <CheckCircle className="h-12 w-12 text-green-500" />
            <h2 className="text-xl font-bold text-white">Kích hoạt thành công!</h2>
            <p className="text-zinc-400">Tài khoản của bạn đã sẵn sàng. Hãy đăng nhập để bắt đầu.</p>
            <Button onClick={goToLogin} className="w-full font-bold mt-4">
              Về trang đăng nhập
            </Button>
          </div>
        )}

        {status === 'ERROR' && (
          <div className="flex flex-col items-center space-y-4">
            <XCircle className="h-12 w-12 text-red-500" />
            <h2 className="text-xl font-bold text-white">Kích hoạt thất bại</h2>
            <p className="text-zinc-400">{message}</p>
            <Button variant="outline" onClick={goToLogin} className="w-full mt-4">
              Quay lại
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
};