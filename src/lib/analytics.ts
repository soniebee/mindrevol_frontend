// src/lib/analytics.ts
import posthog from 'posthog-js';

const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY || '';
const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com';

export const initAnalytics = () => {
  if (typeof window !== 'undefined') {
    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      
      // [UPDATED - IMPORTANT]
      mask_all_text: false, // Keep visible UI text in session replay (button labels, titles)
      mask_all_element_attributes: false, // Keep element attributes to avoid broken replay layout
      
      session_recording: {
        maskAllInputs: true, // Keep enabled: hide everything users type
        // Any element with class "ph-no-capture" will be masked
        maskTextSelector: '.ph-no-capture', 
      },
    });
  }
};

// ... Other helper functions
export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  posthog.capture(eventName, properties);
};

export const identifyUser = (userId: string, traits?: Record<string, any>) => {
  posthog.identify(userId, traits);
};

export const resetAnalytics = () => {
  posthog.reset();
};