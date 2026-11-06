import React, { useState, useEffect } from 'react';
import {
  X,
  Bell,
  CheckCircle2,
  PhoneMissed,
  MessageSquare,
  ShieldAlert,
  UserCheck,
  Trash2,
  Smartphone,
  Send,
  Check,
} from 'lucide-react';
import { useSocial } from '../../contexts/SocialContext';
import { requestPushNotificationPermission, dispatchWebPushNotification } from '../../lib/fcm';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({ isOpen, onClose }) => {
  const { notifications, markNotificationRead, clearAllNotifications } = useSocial();
  const [pushStatus, setPushStatus] = useState<NotificationPermission>('default');
  const [isRequesting, setIsRequesting] = useState(false);
  const [testSent, setTestSent] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPushStatus(Notification.permission);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleEnablePush = async () => {
    setIsRequesting(true);
    const result = await requestPushNotificationPermission();
    setPushStatus(result.status);
    setIsRequesting(false);
    if (result.granted) {
      dispatchWebPushNotification({
        title: '🎉 Push Notifications Enabled!',
        body: 'You will now receive alerts for new messages and incoming voice/video calls.',
      });
    }
  };

  const handleSendTestPush = () => {
    dispatchWebPushNotification({
      title: '📞 Incoming Call Test (FCM)',
      body: 'Marcus Vance is calling you on VibeTalk...',
      tag: 'test-call',
      vibrate: [200, 100, 200],
    });
    setTestSent(true);
    setTimeout(() => setTestSent(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto text-left">
      <div className="w-full max-w-lg rounded-xl bg-white border border-[#E1E5EC] p-5 sm:p-6 shadow-xl relative text-[#303641]">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[#7B8492] hover:text-[#303641] transition-colors cursor-pointer"
          aria-label="Close notifications modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#EAF2FF] text-[#1877F2]">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#303641] tracking-tight">Notifications</h2>
              <p className="text-[11px] text-[#7B8492]">Activity, calls and security notices</p>
            </div>
          </div>

          {notifications.length > 0 && (
            <button
              onClick={clearAllNotifications}
              className="text-xs text-[#7B8492] hover:text-[#D9485F] flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All</span>
            </button>
          )}
        </div>

        {/* FCM Push Notification Controls Card */}
        <div className="mb-4 p-3.5 rounded-xl bg-gradient-to-r from-blue-50/70 via-indigo-50/60 to-purple-50/70 border border-[#1877F2]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-start gap-2.5">
            <div className="p-1.5 rounded-lg bg-blue-100 text-[#1877F2] shrink-0 mt-0.5">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-bold text-slate-900">
                <span>FCM Web Push Notifications</span>
                <span
                  className={`text-[9.5px] px-1.5 py-0.2 rounded-full font-bold uppercase tracking-wider ${
                    pushStatus === 'granted'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {pushStatus === 'granted' ? 'Active' : pushStatus}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                Receive instant browser push notifications for incoming voice/video calls &amp; chats.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {pushStatus === 'granted' ? (
              <button
                type="button"
                onClick={handleSendTestPush}
                className="px-3 py-1.5 rounded-lg bg-white border border-[#1877F2]/30 text-[#1877F2] font-semibold text-xs hover:bg-[#EAF2FF] transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
              >
                {testSent ? <Check className="w-3 h-3 text-emerald-600" /> : <Send className="w-3 h-3" />}
                <span>{testSent ? 'Dispatched!' : 'Test Push'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleEnablePush}
                disabled={isRequesting}
                className="px-3.5 py-1.5 rounded-lg bg-[#5244E3] hover:bg-[#4336c9] text-white font-bold text-xs transition-colors cursor-pointer disabled:opacity-60 shadow-xs"
              >
                {isRequesting ? 'Requesting...' : 'Enable Push'}
              </button>
            )}
          </div>
        </div>

        {notifications.length === 0 ? (
          <div className="py-10 text-center text-[#7B8492] text-xs">
            No new notifications. You are all caught up!
          </div>
        ) : (
          <div className="space-y-2 max-h-[55vh] overflow-y-auto pr-1">
            {notifications.map((notif) => {
              const isUnread = !notif.isRead;

              return (
                <div
                  key={notif.id}
                  onClick={() => markNotificationRead(notif.id)}
                  className={`p-3 rounded-lg border transition-colors cursor-pointer text-xs ${
                    isUnread
                      ? 'bg-[#EAF2FF] border-[#1877F2]/30'
                      : 'bg-[#F5F7FC] border-[#E1E5EC]'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 rounded-md bg-white border border-[#E1E5EC] shrink-0 text-[#7B8492] mt-0.5">
                      {notif.type === 'connection_accepted' ? (
                        <UserCheck className="w-4 h-4 text-[#16865C]" />
                      ) : notif.type === 'missed_call' ? (
                        <PhoneMissed className="w-4 h-4 text-[#D9485F]" />
                      ) : notif.type === 'verification_approved' ? (
                        <CheckCircle2 className="w-4 h-4 text-[#1877F2]" />
                      ) : notif.type === 'security_alert' ? (
                        <ShieldAlert className="w-4 h-4 text-[#F28C28]" />
                      ) : (
                        <MessageSquare className="w-4 h-4 text-[#1877F2]" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-bold text-[#303641] truncate">{notif.title}</span>
                        <span className="text-[10px] text-[#7B8492] font-mono">
                          {notif.createdAt}
                        </span>
                      </div>
                      <p className="text-[#7B8492] leading-relaxed text-[11px]">{notif.body}</p>
                    </div>

                    {isUnread && (
                      <span className="w-2 h-2 rounded-full bg-[#1877F2] shrink-0 mt-1.5" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
