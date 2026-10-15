import React from 'react';
import { motion } from 'motion/react';
import { Home, Compass, Users, MessageSquare, Clock } from 'lucide-react';
import { useSocial } from '../../contexts/SocialContext';
import { useI18n } from '../../contexts/I18nContext';
import { useAccessibility } from '../../contexts/AccessibilityContext';

interface BottomNavProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, setCurrentTab }) => {
  const { unreadMessagesCount } = useSocial();
  const { t } = useI18n();
  const { isHighContrast } = useAccessibility();

  const tabs = [
    { id: 'home', labelKey: 'nav.home', icon: Home },
    { id: 'discover', labelKey: 'nav.rooms', icon: Compass },
    { id: 'profile', labelKey: 'nav.profile', icon: Users },
    { id: 'messages', labelKey: 'nav.vibechat', icon: MessageSquare, badge: unreadMessagesCount },
    { id: 'calls', labelKey: 'nav.recents', icon: Clock },
  ];

  return (
    <nav
      role="navigation"
      aria-label={t('a11y.mobileNavigation')}
      className={`md:hidden fixed bottom-0 left-0 right-0 z-40 pb-safe transition-colors ${
        isHighContrast
          ? 'bg-black border-t-2 border-white shadow-none'
          : 'bg-white border-t border-[#E1E5EC] shadow-[0_-2px_6px_rgba(0,0,0,0.03)]'
      }`}
    >
      <div role="tablist" className="grid grid-cols-5 h-14 items-center px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          const tabLabel = t(tab.labelKey);

          const accessibleLabel =
            tab.badge && tab.badge > 0
              ? `${tabLabel}, ${tab.badge} ${t('a11y.unreadMessages')}`
              : tabLabel;

          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              aria-label={accessibleLabel}
              onClick={() => setCurrentTab(tab.id)}
              className="min-h-[48px] flex flex-col items-center justify-center relative transition-transform active:scale-95 focus:outline-hidden focus:ring-2 focus:ring-[#1877F2] rounded-lg"
            >
              <div
                className={`relative flex flex-col items-center justify-center px-2 py-1 rounded-lg transition-colors ${
                  isActive
                    ? isHighContrast
                      ? 'bg-yellow-400 text-black'
                      : 'bg-[#EAF2FF] text-[#1877F2]'
                    : isHighContrast
                    ? 'text-white'
                    : 'text-[#7B8492] hover:text-[#303641]'
                }`}
              >
                <div className="relative flex items-center justify-center">
                  <Icon
                    aria-hidden="true"
                    className={`w-4 h-4 transition-colors ${
                      isActive
                        ? isHighContrast
                          ? 'text-black stroke-[2.5]'
                          : 'text-[#1877F2]'
                        : isHighContrast
                        ? 'text-white'
                        : 'text-[#7B8492]'
                    }`}
                  />
                  {tab.badge && tab.badge > 0 ? (
                    <span
                      aria-live="polite"
                      className={`absolute -top-1 -right-2 px-1 py-0.2 rounded-full text-[9px] font-bold ${
                        isHighContrast
                          ? 'bg-black text-yellow-300 border border-white'
                          : 'bg-[#D9485F] text-white'
                      }`}
                    >
                      {tab.badge}
                      <span className="sr-only"> {t('a11y.unreadMessages')}</span>
                    </span>
                  ) : null}
                </div>

                <span
                  className={`text-[10px] font-medium tracking-tight mt-0.5 truncate max-w-full ${
                    isActive
                      ? isHighContrast
                        ? 'text-black font-bold'
                        : 'text-[#1877F2] font-semibold'
                      : isHighContrast
                      ? 'text-white'
                      : 'text-[#7B8492]'
                  }`}
                >
                  {tabLabel}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
