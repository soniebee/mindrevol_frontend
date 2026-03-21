// src/lib/firebase.ts
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);

// Khởi tạo Messaging
export const messaging = typeof window !== "undefined" ? getMessaging(app) : null;

// Hàm lấy FCM Token
export const requestFirebaseToken = async () => {
  if (!messaging) return null;

  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      // VAPID Key lấy ở: Firebase Console -> Project Settings -> Cloud Messaging -> Web configuration -> Key pair
      const token = await getToken(messaging, { 
        vapidKey: "BPlufBgKlwm-QecDlmtEXI3io41kNwK1ZiQKl5LnaSXjACF_TtsXuZbNCjosJoFoiltv3uiDYEJqw_uiOVakfuk" 
      });
      return token;
    } else {
      console.log("Người dùng từ chối cấp quyền thông báo.");
      return null;
    }
  } catch (error) {
    console.error("Lỗi khi lấy FCM token:", error);
    return null;
  }
};

// Hàm lắng nghe thông báo khi đang mở web (Foreground)
export const onMessageListener = () =>
  new Promise((resolve) => {
    if (!messaging) return;
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });