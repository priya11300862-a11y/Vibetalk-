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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto text-left">
      <div className="w-full max-w-lg rounded-3xl bg-[#101722] border border-[#7C5CFF]/30 p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#7C5CFF]/15 text-[#7C5CFF]">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Notifications</h2>
              <p className="text-[11px] text-slate-400">Activity and security notices</p>
            </div>
          </div>

          {notifications.length > 0 && (
            <button
              onClick={clearAllNotifications}
              className="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All</span>
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs">
            No new notifications. You are all caught up!
          </div>
        ) : (
          <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
            {notifications.map((notif) => {
              const isUnread = !notif.isRead;

              return (
                <div
                  key={notif.id}
                  onClick={() => markNotificationRead(notif.id)}
                  className={`p-3.5 rounded-2xl border transition-colors cursor-pointer text-xs ${
                    isUnread
                      ? 'bg-[#162030] border-[#7C5CFF]/30'
                      : 'bg-white/[0.02] border-white/5 opacity-80'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-white/[0.04] shrink-0 text-slate-300 mt-0.5">
                      {notif.type === 'connection_accepted' ? (
                        <UserCheck className="w-4 h-4 text-[#20D9C3]" />
                      ) : notif.type === 'missed_call' ? (
                        <PhoneMissed className="w-4 h-4 text-rose-400" />
                      ) : notif.type === 'verification_approved' ? (
                        <CheckCircle2 className="w-4 h-4 text-[#7C5CFF]" />
                      ) : notif.type === 'security_alert' ? (
                        <ShieldAlert className="w-4 h-4 text-amber-400" />
                      ) : (
                        <MessageSquare className="w-4 h-4 text-slate-300" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-bold text-white truncate">{notif.title}</span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {notif.createdAt}
                        </span>
                      </div>
                      <p className="text-slate-300 leading-relaxed text-[11px]">{notif.body}</p>
                    </div>

                    {isUnread && (
                      <span className="w-2 h-2 rounded-full bg-[#7C5CFF] shrink-0 mt-2" />
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
