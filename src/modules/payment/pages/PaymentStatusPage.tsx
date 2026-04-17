import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { paymentService } from '../services/payment.service';
import { PaymentTransaction } from '../types';
import confetti from 'canvas-confetti';
import { Crown, Loader2, CheckCircle2, XCircle, ArrowLeft, Home } from 'lucide-react';

export const PaymentStatusPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');

    useEffect(() => {
        const txnId = searchParams.get('txnId');

        if (!txnId) {
            setStatus('failed');
            return;
        }

        const checkStatus = () => {
            paymentService.getTransactionStatus(txnId)
                .then((res: PaymentTransaction) => {
                    const finalStatus = res.status || (res as any).data?.status;

                    if (finalStatus === 'SUCCESS') {
                        setStatus('success');
                        confetti({
                            particleCount: 150,
                            spread: 70,
                            origin: { y: 0.6 },
                            zIndex: 9999,
                            colors: ['#eab308', '#f97316', '#ffffff'] // Tông màu pháo hoa Vàng/Cam
                        });
                    } else if (finalStatus === 'PENDING') {
                        setStatus('loading');
                        // TỰ ĐỘNG POLLING: Nếu user chuyển sang page này hơi sớm, tự check lại sau 3s
                        setTimeout(checkStatus, 3000); 
                    } else {
                        setStatus('failed');
                    }
                })
                .catch(() => setStatus('failed'));
        };

        checkStatus();
    }, [searchParams]);

    return (
        <div className="flex h-screen items-center justify-center bg-zinc-50 dark:bg-[#121212] p-4 relative overflow-hidden font-sans">
            {/* Background Vàng lấp lánh (Glow Effect) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-yellow-500/10 dark:bg-yellow-500/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative bg-white dark:bg-zinc-900/80 backdrop-blur-xl border border-zinc-200 dark:border-white/10 p-8 sm:p-12 rounded-[32px] shadow-2xl max-w-md w-full text-center flex flex-col items-center animate-in fade-in zoom-in-95 duration-500">
                
                {status === 'loading' && (
                    <>
                        <div className="w-20 h-20 mb-6 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center relative">
                            <div className="absolute inset-0 border-4 border-yellow-200 dark:border-yellow-700/50 rounded-full"></div>
                            <Loader2 className="w-10 h-10 text-yellow-600 dark:text-yellow-500 animate-spin" />
                        </div>
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-orange-500 bg-clip-text text-transparent mb-3">
                            Đang xử lý giao dịch...
                        </h2>
                        <p className="text-zinc-500 dark:text-zinc-400 text-sm">
                            Vui lòng không đóng trang này. Hệ thống đang xác nhận khoản thanh toán của bạn.
                        </p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div className="relative mb-6">
                            <div className="absolute inset-0 bg-yellow-400 blur-xl opacity-40 animate-pulse" />
                            <div className="relative w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-xl border-4 border-white dark:border-zinc-800">
                                <Crown className="w-12 h-12 text-white" strokeWidth={2.5} />
                            </div>
                            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center border-4 border-white dark:border-zinc-800">
                                <CheckCircle2 className="w-5 h-5 text-white" />
                            </div>
                        </div>
                        <h2 className="text-3xl font-extrabold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent mb-3">
                            Nâng cấp thành công!
                        </h2>
                        <p className="text-zinc-600 dark:text-zinc-300 mb-8 font-medium">
                            Chào mừng bạn đến với <span className="font-bold text-yellow-600 dark:text-yellow-500">MindRevol Gold</span>. Các đặc quyền VIP đã được kích hoạt!
                        </p>
                        
                        {/* Nút Reload trang để load lại User Profile mới nhất */}
                        <button 
                            onClick={() => window.location.href = '/'} 
                            className="flex items-center justify-center gap-2 w-full bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-black px-6 py-4 rounded-xl font-bold transition-all shadow-lg active:scale-95"
                        >
                            <Home className="w-5 h-5" /> Trải nghiệm ngay
                        </button>
                    </>
                )}

                {status === 'failed' && (
                    <>
                        <div className="w-24 h-24 mb-6 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center border-4 border-red-50 dark:border-red-900/20">
                            <XCircle className="w-12 h-12 text-red-500" strokeWidth={2.5} />
                        </div>
                        <h2 className="text-3xl font-extrabold text-red-500 mb-3">
                            Giao dịch thất bại
                        </h2>
                        <p className="text-zinc-600 dark:text-zinc-400 mb-8 text-sm">
                            Đã có lỗi xảy ra trong quá trình xác nhận thanh toán hoặc bạn chưa hoàn tất chuyển khoản.
                        </p>
                        <button 
                            onClick={() => navigate('/')} 
                            className="flex items-center justify-center gap-2 w-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white px-6 py-4 rounded-xl font-bold transition-all active:scale-95"
                        >
                            <ArrowLeft className="w-5 h-5" /> Quay lại trang chủ
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};