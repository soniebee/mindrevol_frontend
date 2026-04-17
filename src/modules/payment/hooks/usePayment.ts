// src/modules/payment/hooks/usePayment.ts (hoặc useCheckout.ts tùy tên file của bạn)
import { useState } from 'react';
import { paymentService } from '../services/payment.service';
import { CheckoutRequest, CheckoutResponse } from '../types'; // Nhớ import thêm CheckoutResponse

export const useCheckout = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Bổ sung kiểu trả về Promise<CheckoutResponse | null>
const handleCheckout = async (request: CheckoutRequest) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await paymentService.createCheckout(request);
            
            // THÊM LOG ĐỂ BẮT TẬN TAY DỮ LIỆU CÓ VỀ HOOK KHÔNG
            console.log("🔥 [DEBUG 1] Dữ liệu về đến Hook useCheckout:", response);
            
            // BẮT BUỘC PHẢI CÓ DÒNG NÀY ĐỂ MODAL NHẬN ĐƯỢC DATA
            return response; 
            
        } catch (err: any) {
            setError(err.response?.data?.message || 'Lỗi thanh toán');
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    return { handleCheckout, isLoading, error };
};