import React from 'react';
import {
  X,
  Bell,
  CheckCircle2,
  PhoneMissed,
  MessageSquare,
  ShieldAlert,
  UserCheck,
  Trash2,
} from 'lucide-react';
import { useSocial } from '../../contexts/SocialContext';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({ isOpen, onClose }) => {
  const { notifications, markNotificationRead, clearAllNotifications } = useSocial();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto text-left">
      <div className="w-full max-w-lg rounded-xl bg-white border border-[#E1E5EC] p-5 sm:p-6 shadow-xl relative text-[#303641]">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[#7B8492] hover:text-[#303641] transition-colors"
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
              className="text-xs text-[#7B8492] hover:text-[#D9485F] flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All</span>
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="py-12 text-center text-[#7B8492] text-xs">
            No new notifications. You are all caught up!
          </div>
        ) : (
          <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
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
                      <span className="w-2 h-2 rounded-full bg-[#D9485F] shrink-0 mt-2" />
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
