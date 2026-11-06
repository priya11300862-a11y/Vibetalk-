// Firebase Cloud Messaging (FCM) Background Service Worker for VibeTalk
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyDemoFallbackKeyForVibeTalkPhoneAuth",
  authDomain: "vibetalk-social.firebaseapp.com",
  projectId: "vibetalk-social",
  storageBucket: "vibetalk-social.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification?.title || payload.data?.title || 'VibeTalk Notification';
  const notificationOptions = {
    body: payload.notification?.body || payload.data?.body || 'New activity on VibeTalk.',
    icon: '/icon.svg',
    badge: '/icon.svg',
    tag: payload.data?.tag || 'vibetalk-alert',
    data: payload.data || {},
    vibrate: [150, 50, 150]
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});
