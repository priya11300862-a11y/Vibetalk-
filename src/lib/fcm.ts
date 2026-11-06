import { isSupported, getMessaging, getToken, onMessage, Messaging } from 'firebase/messaging';
import { firebaseApp } from './firebase';

let messagingInstance: Messaging | null = null;
let isFcmChecked = false;
let isFcmSupported = false;

// Default VAPID key placeholder (can be customized via VITE_FIREBASE_VAPID_KEY)
const VAPID_KEY =
  import.meta.env.VITE_FIREBASE_VAPID_KEY ||
  'BOn_K_4k3x9q2j1A-W_DemoVapidKeyForVibeTalkPushNotifications_abcdef1234567890';

/**
 * Initializes and returns the Firebase Messaging instance if supported by the browser
 */
export async function getFcmMessaging(): Promise<Messaging | null> {
  if (isFcmChecked) {
    return messagingInstance;
  }

  isFcmChecked = true;
  try {
    const supported = await isSupported();
    if (supported && typeof window !== 'undefined' && 'Notification' in window) {
      messagingInstance = getMessaging(firebaseApp);
      isFcmSupported = true;
    }
  } catch (err) {
    console.warn('[FCM] Firebase Messaging is not supported in this environment:', err);
    isFcmSupported = false;
    messagingInstance = null;
  }

  return messagingInstance;
}

/**
 * Requests browser push notification permission and obtains the FCM registration token
 */
export async function requestPushNotificationPermission(): Promise<{
  granted: boolean;
  token: string | null;
  status: NotificationPermission;
  error?: string;
}> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return {
      granted: false,
      token: null,
      status: 'denied',
      error: 'Web Notifications are not supported by this browser.',
    };
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      return {
        granted: false,
        token: null,
        status: permission,
        error: 'Push notification permission was declined.',
      };
    }

    const messaging = await getFcmMessaging();
    let token: string | null = null;

    if (messaging && 'serviceWorker' in navigator) {
      try {
        const swRegistration = await navigator.serviceWorker.ready;
        token = await getToken(messaging, {
          serviceWorkerRegistration: swRegistration,
          vapidKey: VAPID_KEY,
        });

        if (token) {
          localStorage.setItem('vibetalk_fcm_token', token);
          console.info('[FCM] FCM Registration Token generated:', token.slice(0, 15) + '...');
        }
      } catch (tokenErr: any) {
        console.warn('[FCM] Notice: Unable to generate remote FCM token (using local push fallback):', tokenErr.message);
        token = `local_token_${Date.now()}`;
        localStorage.setItem('vibetalk_fcm_token', token);
      }
    }

    return {
      granted: true,
      token,
      status: permission,
    };
  } catch (err: any) {
    console.error('[FCM] Error requesting notification permission:', err);
    return {
      granted: false,
      token: null,
      status: 'denied',
      error: err.message || 'Failed to request notification permission.',
    };
  }
}

/**
 * Dispatches an immediate browser notification for incoming messages and incoming calls
 */
export function dispatchWebPushNotification(options: {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
  data?: Record<string, any>;
  vibrate?: number[];
}): void {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;

  const defaultIcon = '/icon.svg';
  const notificationOptions: NotificationOptions & { vibrate?: number[] } = {
    body: options.body,
    icon: options.icon || defaultIcon,
    badge: defaultIcon,
    tag: options.tag || 'vibetalk-notification',
    data: options.data,
    vibrate: options.vibrate || [100, 50, 100],
  };

  try {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready
        .then((registration) => {
          registration.showNotification(options.title, notificationOptions as any);
        })
        .catch(() => {
          new Notification(options.title, notificationOptions as any);
        });
    } else {
      new Notification(options.title, notificationOptions as any);
    }
  } catch (e) {
    console.warn('[FCM] Web notification dispatch fallback:', e);
  }
}

/**
 * Helper to notify the user about a new incoming peer message
 */
export function notifyNewMessage(senderName: string, messagePreview: string, conversationId?: string) {
  dispatchWebPushNotification({
    title: `💬 New message from ${senderName}`,
    body: messagePreview || 'Sent you a message',
    tag: `msg_${conversationId || Date.now()}`,
    data: {
      type: 'message',
      conversationId,
      url: '/?tab=messages',
    },
    vibrate: [80, 40, 80],
  });
}

/**
 * Helper to notify the user about an incoming audio or video call
 */
export function notifyIncomingCall(callerName: string, callType: 'voice' | 'video' | 'audio' = 'voice') {
  const isVideo = callType === 'video';
  const iconEmoji = isVideo ? '📹' : '📞';
  dispatchWebPushNotification({
    title: `${iconEmoji} Incoming ${isVideo ? 'Video' : 'Voice'} Call`,
    body: `${callerName} is calling you on VibeTalk...`,
    tag: 'incoming-call',
    data: {
      type: 'call',
      callerName,
      url: '/?tab=calls',
    },
    vibrate: [250, 100, 250, 100, 250],
  });
}

/**
 * Subscribes to foreground push notifications if FCM is active
 */
export function subscribeToForegroundFcm(onMessageReceived: (payload: any) => void) {
  getFcmMessaging().then((messaging) => {
    if (!messaging) return;
    try {
      onMessage(messaging, (payload) => {
        console.info('[FCM] Foreground Push Notification received:', payload);
        onMessageReceived(payload);

        // Display push notification in foreground
        if (payload.notification?.title) {
          dispatchWebPushNotification({
            title: payload.notification.title,
            body: payload.notification.body || '',
            data: payload.data,
          });
        }
      });
    } catch (e) {
      console.warn('[FCM] onMessage listener notice:', e);
    }
  });
}
