import React, { useState, useEffect } from 'react';
import { PaymentProvider, PackageType } from '../types';
import { useCheckout } from '../hooks/usePayment';
import { Button } from '@/components/ui/Button'; 
import { useNavigate } from 'react-router-dom';
import { paymentService } from '../services/payment.service';
import { cn } from '@/lib/utils';
import { 
    X, Sparkles, Image as ImageIcon, Users, Clock, 
    Palette, ShieldBan, Crown, QrCode, CheckCircle2 
} from 'lucide-react';

interface UpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const GOLD_FEATURES = [
    { icon: ShieldBan, text: 'Trải nghiệm mượt mà, không hiện quảng cáo' },
    { icon: Sparkles, text: 'Hỗ trợ đăng và hiển thị Live Photo' },
    { icon: ImageIcon, text: 'Tải ảnh trực tiếp từ thư viện điện thoại' },
    { icon: Users, text: 'Không giới hạn thành viên tham gia Box & Hành trình' },
    { icon: Clock, text: 'Kéo dài tối đa thời gian diễn ra Hành trình' },
    { icon: Palette, text: 'Mở khóa bộ sưu tập Giao diện đặc biệt' },
];

export const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const { handleCheckout, isLoading } = useCheckout();
    const [selectedPackage, setSelectedPackage] = useState<PackageType>(PackageType.GOLD_1_MONTH);
    
    const [qrUrl, setQrUrl] = useState<string | null>(null);
    const [transactionId, setTransactionId] = useState<string | null>(null);

    // CƠ CHẾ POLLING
    useEffect(() => {
        let intervalId: NodeJS.Timeout;

        if (transactionId && qrUrl) {
            intervalId = setInterval(async () => {
                try {
                    const tx = await paymentService.getTransactionStatus(transactionId);
                    if (tx.status === 'SUCCESS') {
                        clearInterval(intervalId);
                        resetModal();
                        navigate(`/payment/status?txnId=${transactionId}`);
                    } else if (tx.status === 'FAILED') {
                        clearInterval(intervalId);
                    }
                } catch (error) {
                    console.error("Lỗi khi check status:", error);
                }
            }, 3000); 
        }

        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [transactionId, qrUrl, navigate]);

    if (!isOpen) return null;

    const onPayClick = async () => {
        const response: any = await handleCheckout({
            provider: PaymentProvider.SEPAY, // Mặc định luôn dùng SePay
            packageType: selectedPackage,
        });

        if (response) {
            const finalQrUrl = response.paymentUrl || response.data?.paymentUrl || response.data?.data?.paymentUrl;
            const finalTxId = response.transactionId || response.data?.transactionId || response.data?.data?.transactionId;

            if (finalQrUrl) {
                setQrUrl(finalQrUrl);
                setTransactionId(finalTxId);
            }
        }
    };

    const resetModal = () => {
        setQrUrl(null);
        setTransactionId(null);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm sm:p-4 transition-opacity">
            <div className="bg-white dark:bg-zinc-900 w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-lg sm:rounded-[24px] flex flex-col relative shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                
                {/* Background Decor (Góc trên) */}
                <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-yellow-400/20 to-transparent dark:from-yellow-500/10 pointer-events-none" />

                <button 
                    onClick={resetModal} 
                    className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-black/5 dark:bg-white/10 text-zinc-500 dark:text-zinc-400 hover:bg-black/10 dark:hover:bg-white/20 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="overflow-y-auto flex-1 p-5 sm:p-7 z-10 custom-scrollbar">
                    {!qrUrl ? (
                        <div className="space-y-7 pb-20 sm:pb-0">
                            
                            <div className="text-center pt-2">
                                <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900/40 dark:to-orange-900/40 rounded-2xl mb-4 shadow-inner">
                                    <Crown className="w-10 h-10 text-yellow-600 dark:text-yellow-500" strokeWidth={2.5} />
                                </div>
                                <h2 className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent pb-1">
                                    MindRevol Gold
                                </h2>
                                <p className="text-zinc-500 dark:text-zinc-400 text-sm sm:text-base mt-1">
                                    Mở khóa toàn bộ đặc quyền không giới hạn
                                </p>
                            </div>

                            {/* Quyền lợi */}
                            <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl p-5 space-y-4 border border-zinc-100 dark:border-white/5">
                                {GOLD_FEATURES.map((feature, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <div className="mt-0.5 w-6 h-6 rounded-full bg-yellow-100 dark:bg-yellow-500/20 flex items-center justify-center shrink-0">
                                            <feature.icon className="w-3.5 h-3.5 text-yellow-600 dark:text-yellow-500" strokeWidth={2.5} />
                                        </div>
                                        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 leading-relaxed">
                                            {feature.text}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* Chọn Gói */}
                            <div>
                                <h3 className="font-bold text-base mb-3 text-zinc-800 dark:text-white">Chọn gói phù hợp</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    <button 
                                        onClick={() => setSelectedPackage(PackageType.GOLD_1_MONTH)}
                                        className={cn(
                                            "relative flex flex-col p-4 rounded-xl border-2 text-left transition-all",
                                            selectedPackage === PackageType.GOLD_1_MONTH 
                                                ? "border-yellow-500 bg-yellow-50/50 dark:bg-yellow-900/20" 
                                                : "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:border-yellow-200 dark:hover:border-yellow-800"
                                        )}
                                    >
                                        {selectedPackage === PackageType.GOLD_1_MONTH && <CheckCircle2 className="absolute top-3 right-3 w-5 h-5 text-yellow-500" />}
                                        <span className="text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-1">1 Tháng</span>
                                        <span className="text-lg font-bold text-zinc-900 dark:text-white">30.000đ</span>
                                    </button>

                                    <button 
                                        onClick={() => setSelectedPackage(PackageType.GOLD_1_YEAR)}
                                        className={cn(
                                            "relative flex flex-col p-4 rounded-xl border-2 text-left transition-all overflow-hidden",
                                            selectedPackage === PackageType.GOLD_1_YEAR 
                                                ? "border-orange-500 bg-orange-50/50 dark:bg-orange-900/20" 
                                                : "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:border-orange-200 dark:hover:border-orange-800"
                                        )}
                                    >
                                        <div className="absolute top-0 right-0 bg-gradient-to-r from-orange-500 to-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-bl-lg">
                                            TIẾT KIỆM 20%
                                        </div>
                                        {selectedPackage === PackageType.GOLD_1_YEAR && <CheckCircle2 className="absolute top-4 right-3 w-5 h-5 text-orange-500" />}
                                        <span className="text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-1 mt-2">1 Năm</span>
                                        <span className="text-lg font-bold text-zinc-900 dark:text-white">288.000đ</span>
                                    </button>
                                </div>
                            </div>

                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-6 h-full min-h-[400px]">
                            <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mb-4">
                                <QrCode className="w-8 h-8 text-yellow-600 dark:text-yellow-500" />
                            </div>
                            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2 text-center">Quét mã để thanh toán</h2>
                            <p className="text-zinc-500 dark:text-zinc-400 mb-8 text-center text-sm px-4">
                                Vui lòng sử dụng App Ngân hàng để quét mã. <br className="hidden sm:block"/> Hệ thống sẽ tự động cập nhật ngay khi nhận được tiền.
                            </p>
                            
                            <div className="relative p-1 rounded-3xl bg-gradient-to-br from-yellow-400 to-orange-500 shadow-xl mb-8">
                                <div className="bg-white p-4 rounded-2xl">
                                    <img src={qrUrl} alt="QR Code" className="w-56 h-56 object-contain" />
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-3 px-6 py-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-full border border-zinc-100 dark:border-zinc-700">
                                <span className="relative flex h-3 w-3">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
                                </span>
                                <span className="text-sm font-semibold text-zinc-600 dark:text-zinc-300">Đang chờ thanh toán...</span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 sm:p-5 bg-white dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-800 mt-auto shrink-0 z-20">
                    {!qrUrl ? (
                        <Button 
                            onClick={onPayClick} 
                            disabled={isLoading} 
                            className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white rounded-xl shadow-lg shadow-orange-500/25 h-14 text-lg font-bold border-0"
                        >
                            {isLoading ? 'Đang xử lý...' : 'Nâng cấp ngay'}
                        </Button>
                    ) : (
                        <Button 
                            variant="outline" 
                            onClick={() => {
                                resetModal();
                                navigate(`/payment/status?txnId=${transactionId}`); 
                            }} 
                            className="w-full rounded-xl h-14 font-bold text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                        >
                            Tôi đã chuyển khoản xong
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};