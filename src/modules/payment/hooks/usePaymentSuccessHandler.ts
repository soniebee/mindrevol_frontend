// src/modules/payment/hooks/usePaymentSuccessHandler.ts
import { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { toast } from 'react-hot-toast';
import { socket } from '@/lib/socket'; 

export const usePaymentSuccessHandler = () => {
    useEffect(() => {
        // Dùng subscribe thay vì on. 
        // Thay '/user/queue/notifications' bằng topic chính xác mà backend gửi WebSocket
        const subscription = socket.subscribe('/user/queue/notifications', (data: any) => {
            if (data.type === 'PAYMENT_SUCCESS') {
                // 1. Hiện thông báo
                toast.success(data.message || '🎉 Chúc mừng! Bạn đã nâng cấp gói Gold thành công!', {
                    duration: 5000,
                    position: 'top-center',
                    style: {
                        background: '#FFD700',
                        color: '#000',
                        fontWeight: 'bold',
                    },
                });

                // 2. Bắn pháo hoa
                triggerConfetti();

                // 3. (Tùy chọn) Dispatch action để cập nhật Redux/Zustand user tier
            }
        });

        // Cleanup: Dùng unsubscribe thay vì off
        return () => {
            if (subscription && typeof subscription.unsubscribe === 'function') {
                subscription.unsubscribe();
            }
        };
    }, []);

    const triggerConfetti = () => {
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval: any = setInterval(function () {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            
            confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
            confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
        }, 250);
    };
};