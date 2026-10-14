import React from 'react';
import { motion } from 'motion/react';
import { Home, PhoneCall, Users, MessageSquare, Clock } from 'lucide-react';
import { useSocial } from '../../contexts/SocialContext';

interface BottomNavProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, setCurrentTab }) => {
  const { unreadMessagesCount } = useSocial();

  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'discover', label: 'Rooms', icon: PhoneCall },
    { id: 'profile', label: 'Profile', icon: Users },
    { id: 'messages', label: 'VibeChat', icon: MessageSquare, badge: unreadMessagesCount },
    { id: 'calls', label: 'Recents', icon: Clock },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-xl border-t border-stone-200/80 pb-safe shadow-lg">
      <div className="grid grid-cols-5 h-16 items-center px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          const isConnectTab = tab.id === 'discover';

          return (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className="min-h-[48px] flex flex-col items-center justify-center relative transition-transform active:scale-95"
            >
              <div className="relative flex flex-col items-center justify-center px-3 py-1 rounded-2xl w-full">
                {isActive && (
                  <motion.div
                    layoutId="bottomNavActivePill"
                    className={`absolute inset-0 rounded-2xl ${
                      isConnectTab
                        ? 'bg-gradient-to-r from-[#FF1493] to-[#E11D48] shadow-lg shadow-pink-600/30'
                        : 'bg-slate-900 shadow-md border border-slate-800'
                    }`}
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  />
                )}

                <div className="relative z-10 flex items-center justify-center">
                  <Icon
                    className={`w-5 h-5 transition-colors ${
                      isActive ? 'text-white' : 'text-black'
                    }`}
                  />
                  {tab.badge && tab.badge > 0 ? (
                    <span className="absolute -top-1 -right-2 px-1 py-0.2 rounded-full text-[9px] font-bold bg-[#FF4F9A] text-white">
                      {tab.badge}
                    </span>
                  ) : null}
                </div>

                <span
                  className={`relative z-10 text-[9.5px] font-black tracking-tight mt-0.5 transition-colors ${
                    isActive ? 'text-white font-black' : 'text-black font-black'
                  }`}
                >
                  {tab.label}
                </span>

                {/* Animated Underline Indicator with Framer Motion layoutId */}
                {isActive && (
                  <motion.div
                    layoutId="bottomNavActiveUnderline"
                    className={`absolute -bottom-1.5 h-[3px] rounded-full z-20 ${
                      isConnectTab
                        ? 'w-7 bg-gradient-to-r from-[#FF1493] via-[#FF4F9A] to-[#FF69B4] shadow-[0_0_10px_rgba(255,79,154,0.9)]'
                        : 'w-7 bg-gradient-to-r from-[#7C5CFF] via-[#20D9C3] to-[#7C5CFF] shadow-[0_0_10px_rgba(124,92,255,0.9)]'
                    }`}
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
