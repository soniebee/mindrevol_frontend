import { http } from '@/lib/http'; 
import { CheckoutRequest, CheckoutResponse, PaymentTransaction } from '../types';

export const paymentService = {
    createCheckout: async (data: CheckoutRequest): Promise<CheckoutResponse> => {
        const response = await http.post('/payment/checkout', data);
        
        // SỬA DÒNG NÀY: Dùng toán tử || để tự động bắt đúng dữ liệu dù backend có bọc thêm lớp 'data' hay không
        return response.data?.data || response.data || response; 
    },

    getTransactionStatus: async (transactionId: string): Promise<PaymentTransaction> => {
        const response = await http.get(`/payment/transaction/${transactionId}`);
        
        // SỬA DÒNG NÀY TƯƠNG TỰ
        return response.data?.data || response.data || response;
    }
};