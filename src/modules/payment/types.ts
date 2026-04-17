// src/modules/payment/types.ts

export enum PaymentProvider {
    STRIPE = 'STRIPE',
    VNPAY = 'VNPAY',
    MOMO = 'MOMO',
    ZALOPAY = 'ZALOPAY',
    SEPAY = 'SEPAY' // [THÊM SEPAY]
}

export enum PackageType {
    GOLD_1_MONTH = 'GOLD_1_MONTH',
    GOLD_6_MONTHS = 'GOLD_6_MONTHS',
    GOLD_1_YEAR = 'GOLD_1_YEAR'
}

export interface CheckoutRequest {
    provider: PaymentProvider;
    packageType: PackageType;
}

export interface CheckoutResponse {
    paymentUrl: string;
    transactionId: string;
}

export interface PaymentTransaction {
    id: string;
    status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';
    amount: number;
    provider: PaymentProvider;
    packageType: PackageType;
    createdAt: string;
}