importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyAFyNpwqNdW8OBFY7X7-269EC9f_VsoAaA",
  authDomain: "mindrevol-a7e6b.firebaseapp.com",
  projectId: "mindrevol-a7e6b",
  storageBucket: "mindrevol-a7e6b.firebasestorage.app",
  messagingSenderId: "670593554582",
  appId: "1:670593554582:web:9678f54a599f1e1b544ab7",
  measurementId: "G-XLXLN198VN"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Đã nhận thông báo ngầm ', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/vite.svg',
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});