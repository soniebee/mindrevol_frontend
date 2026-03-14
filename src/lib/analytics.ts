// src/lib/analytics.ts
import posthog from 'posthog-js';

const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY || '';
const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com';

export const initAnalytics = () => {
  if (typeof window !== 'undefined') {
    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      
      // [SỬA LẠI - QUAN TRỌNG]
      mask_all_text: false, // <-- TẮT dòng này đi để nhìn thấy tên nút, tiêu đề
      mask_all_element_attributes: false, // Tắt cái này để layout đỡ bị vỡ
      
      session_recording: {
        maskAllInputs: true, // Vẫn giữ cái này: Che tất cả những gì User đang gõ
        // Thêm dòng này: Bất cứ element nào có class "ph-no-capture" sẽ bị che đi
        maskTextSelector: '.ph-no-capture', 
      },
    });
  }
};

// ... Các hàm khác giữ nguyên
export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  posthog.capture(eventName, properties);
};

export const identifyUser = (userId: string, traits?: Record<string, any>) => {
  posthog.identify(userId, traits);
};

export const resetAnalytics = () => {
  posthog.reset();
};