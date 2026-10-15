import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Bell,
  Settings,
  ShieldCheck,
  Database,
  Sparkles,
  User,
  LogOut,
  Globe,
  Sun,
  MessageSquare,
  Compass,
  Home,
  Check,
  ChevronDown,
  X,
  Radio,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useSocial } from '../../contexts/SocialContext';
import { useI18n } from '../../contexts/I18nContext';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import { PWAInstallButton } from '../common/PWAInstallButton';
import { LanguageSelectorModal } from '../common/LanguageSelectorModal';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenNotifications: () => void;
  onOpenPrivacy: () => void;
  onOpenSafety: () => void;
  onOpenAdmin: () => void;
  onOpenSubscription: () => void;
  onOpenSupabaseGuide: () => void;
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  onOpenNotifications,
  onOpenPrivacy,
  onOpenSafety,
  onOpenAdmin,
  onOpenSubscription,
  onOpenSupabaseGuide,
  onOpenAuth,
}) => {
  const { currentUser, isAuthenticated, logout } = useAuth();
  const { unreadNotificationsCount, unreadMessagesCount, conversations, setActiveConversationId } = useSocial();
  const { t, currentLanguageInfo } = useI18n();
  const { isHighContrast, toggleHighContrast } = useAccessibility();

  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter conversations/people based on search query
  const matchingConversations = searchQuery.trim()
    ? conversations.filter(
        (c) =>
          c.participant.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.participant.bio?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.participant.activeTopic?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <>
      <header
        role="banner"
        className={`sticky top-0 z-40 w-full border-b transition-colors ${
          isHighContrast
            ? 'bg-black border-white text-white shadow-none'
            : 'bg-white border-[#E1E5EC] text-[#303641] shadow-[0_1px_2px_rgba(0,0,0,0.03)]'
        }`}
      >
        <div className="max-w-7xl mx-auto h-14 px-3 sm:px-6 flex items-center justify-between gap-3">
          {/* Left: VibeTalk Logo with clean KisanShop styling */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setCurrentTab('home')}
              aria-label={`${t('app.name')} - ${t('nav.home')}`}
              className="flex items-center gap-2 group text-left focus:outline-hidden focus:ring-2 focus:ring-[#1877F2] rounded-lg"
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-base transition-transform group-hover:scale-105 ${
                  isHighContrast
                    ? 'border-2 border-white bg-black text-yellow-300'
                    : 'bg-[#1877F2] text-white shadow-xs'
                }`}
              >
                V
              </div>
              <div className="flex items-baseline gap-1.5">
                <span
                  className={`text-base font-bold tracking-tight transition-colors ${
                    isHighContrast ? 'text-white' : 'text-[#303641] group-hover:text-[#1877F2]'
                  }`}
                >
                  {t('app.name')}
                </span>
                <span
                  className={`hidden sm:inline-block text-[10px] font-semibold px-1.5 py-0.2 rounded border uppercase ${
                    isHighContrast
                      ? 'bg-black text-yellow-300 border-white'
                      : 'bg-[#EAF2FF] text-[#1877F2] border-[#1877F2]/20'
                  }`}
                >
                  18+
                </span>
              </div>
            </button>
          </div>

          {/* Centre Left: Global Search for People, Groups & Conversations */}
          <div ref={searchRef} className="relative flex-1 max-w-xs sm:max-w-md hidden md:block">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7B8492]"
                aria-hidden="true"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                placeholder="Search people, groups, conversations..."
                className={`w-full h-9 pl-9 pr-8 text-xs font-normal border rounded-lg transition-all kisanshop-input ${
                  isHighContrast
                    ? 'bg-black text-white border-white placeholder-slate-400'
                    : 'bg-[#F5F7FC] border-[#E1E5EC] text-[#303641] placeholder-[#7B8492] focus:bg-white'
                }`}
                aria-label="Global search for people, groups, and conversations"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#7B8492] hover:text-[#303641]"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Search Dropdown Results */}
            {isSearchFocused && searchQuery.trim() && (
              <div
                className={`absolute top-full left-0 right-0 mt-1 py-1.5 rounded-lg border shadow-lg z-50 max-h-80 overflow-y-auto ${
                  isHighContrast ? 'bg-black border-white text-white' : 'bg-white border-[#E1E5EC] text-[#303641]'
                }`}
              >
                <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#7B8492]">
                  Conversations & People ({matchingConversations.length})
                </div>
                {matchingConversations.length > 0 ? (
                  matchingConversations.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        setActiveConversationId(c.id);
                        setCurrentTab('messages');
                        setIsSearchFocused(false);
                        setSearchQuery('');
                      }}
                      className="w-full px-3 py-2 flex items-center gap-2.5 hover:bg-[#EAF2FF] transition-colors text-left"
                    >
                      <img
                        src={c.participant.avatarUrl}
                        alt={c.participant.displayName}
                        className="w-7 h-7 rounded-full object-cover border border-[#E1E5EC]"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-semibold text-[#303641] truncate">
                          {c.participant.displayName}
                        </div>
                        <div className="text-[11px] text-[#7B8492] truncate">
                          {c.lastMessage?.content || 'Tap to start conversation'}
                        </div>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-3 text-xs text-[#7B8492] text-center">
                    No results for "{searchQuery}". Try browsing Discover tab!
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Centre Right: Main Navigation with Blue Active Tabs */}
          <nav
            aria-label={t('a11y.mainNavigation')}
            className="hidden lg:flex items-center gap-1 xl:gap-2 text-xs font-medium"
          >
            {/* Home Tab */}
            <button
              onClick={() => setCurrentTab('home')}
              aria-current={currentTab === 'home' ? 'page' : undefined}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                currentTab === 'home'
                  ? isHighContrast
                    ? 'bg-yellow-400 text-black font-bold'
                    : 'bg-[#EAF2FF] text-[#1877F2] font-semibold'
                  : isHighContrast
                  ? 'text-white hover:bg-white/10'
                  : 'text-[#7B8492] hover:text-[#303641] hover:bg-[#F5F7FC]'
              }`}
            >
              <Home className="w-4 h-4" aria-hidden="true" />
              <span>{t('nav.home')}</span>
            </button>

            {/* Discover Tab */}
            <button
              onClick={() => setCurrentTab('discover')}
              aria-current={currentTab === 'discover' ? 'page' : undefined}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                currentTab === 'discover'
                  ? isHighContrast
                    ? 'bg-yellow-400 text-black font-bold'
                    : 'bg-[#EAF2FF] text-[#1877F2] font-semibold'
                  : isHighContrast
                  ? 'text-white hover:bg-white/10'
                  : 'text-[#7B8492] hover:text-[#303641] hover:bg-[#F5F7FC]'
              }`}
            >
              <Compass className="w-4 h-4" aria-hidden="true" />
              <span>{t('nav.rooms')}</span>
            </button>

            {/* Messages Tab with Unread Count */}
            <button
              onClick={() => setCurrentTab('messages')}
              aria-current={currentTab === 'messages' ? 'page' : undefined}
              className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                currentTab === 'messages'
                  ? isHighContrast
                    ? 'bg-yellow-400 text-black font-bold'
                    : 'bg-[#EAF2FF] text-[#1877F2] font-semibold'
                  : isHighContrast
                  ? 'text-white hover:bg-white/10'
                  : 'text-[#7B8492] hover:text-[#303641] hover:bg-[#F5F7FC]'
              }`}
            >
              <MessageSquare className="w-4 h-4" aria-hidden="true" />
              <span>{t('nav.vibechat')}</span>
              {unreadMessagesCount > 0 && (
                <span
                  className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    isHighContrast
                      ? 'bg-black text-yellow-300 border border-white'
                      : 'bg-[#D9485F] text-white'
                  }`}
                >
                  {unreadMessagesCount}
                </span>
              )}
            </button>

            {/* Notifications with Badge */}
            <button
              onClick={onOpenNotifications}
              className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                isHighContrast
                  ? 'text-white hover:bg-white/10'
                  : 'text-[#7B8492] hover:text-[#303641] hover:bg-[#F5F7FC]'
              }`}
              aria-label={
                unreadNotificationsCount > 0
                  ? `${unreadNotificationsCount} ${t('a11y.unreadNotifications')}`
                  : t('nav.notifications')
              }
            >
              <Bell className="w-4 h-4" aria-hidden="true" />
              <span>{t('nav.notifications')}</span>
              {unreadNotificationsCount > 0 && (
                <span
                  className={`ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    isHighContrast
                      ? 'bg-yellow-400 text-black'
                      : 'bg-[#D9485F] text-white'
                  }`}
                >
                  {unreadNotificationsCount}
                </span>
              )}
            </button>
          </nav>

          {/* Right: Quick actions, Settings, and Profile Avatar Dropdown */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* High Contrast Mode Toggle */}
            <button
              onClick={toggleHighContrast}
              role="switch"
              aria-checked={isHighContrast}
              aria-label={isHighContrast ? t('a11y.highContrastOn') : t('a11y.toggleHighContrast')}
              title={isHighContrast ? 'High Contrast: ON (WCAG AA)' : 'High Contrast: OFF'}
              className={`flex items-center gap-1 px-2 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                isHighContrast
                  ? 'bg-yellow-400 text-black border-white shadow-xs'
                  : 'bg-white hover:bg-[#F5F7FC] text-[#7B8492] border-[#E1E5EC]'
              }`}
            >
              <Sun className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="hidden xl:inline text-[11px]">
                {isHighContrast ? 'High Contrast' : 'Contrast'}
              </span>
            </button>

            {/* Language Selector Trigger */}
            <button
              onClick={() => setIsLanguageModalOpen(true)}
              aria-haspopup="dialog"
              aria-label={t('a11y.chooseLanguage')}
              title={`${t('nav.language')}: ${currentLanguageInfo.name}`}
              className={`flex items-center gap-1 px-2 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                isHighContrast
                  ? 'bg-black text-white border-white hover:bg-white/20'
                  : 'bg-white hover:bg-[#F5F7FC] text-[#7B8492] border-[#E1E5EC]'
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-[#1877F2]" aria-hidden="true" />
              <span className="text-[11px] font-semibold text-[#303641]">
                {currentLanguageInfo.badge}
              </span>
            </button>

            <PWAInstallButton />

            {/* Settings button */}
            <button
              onClick={onOpenPrivacy}
              aria-label="Settings & Privacy"
              title="Settings & Privacy"
              className={`p-2 rounded-lg border transition-colors ${
                isHighContrast
                  ? 'bg-black text-white border-white hover:bg-white/20'
                  : 'bg-white text-[#7B8492] hover:text-[#303641] hover:bg-[#F5F7FC] border-[#E1E5EC]'
              }`}
            >
              <Settings className="w-4 h-4" aria-hidden="true" />
            </button>

            {/* Super Admin Console Button */}
            <button
              onClick={onOpenAdmin}
              aria-label="Super Admin Portal"
              title="Super Admin Portal (/admin)"
              className={`p-2 rounded-lg border transition-colors hidden sm:flex items-center gap-1.5 text-xs font-semibold ${
                isHighContrast
                  ? 'bg-black text-yellow-400 border-white hover:bg-white/20'
                  : 'bg-white text-[#1877F2] hover:bg-[#EAF2FF] border-[#E1E5EC] hover:border-[#1877F2]/40'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-[#1877F2]" aria-hidden="true" />
              <span className="hidden md:inline">Admin</span>
            </button>

            {/* Profile Avatar and Dropdown */}
            {isAuthenticated ? (
              <div ref={dropdownRef} className="relative">
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  aria-expanded={isProfileDropdownOpen}
                  aria-haspopup="menu"
                  className={`flex items-center gap-1.5 p-1 rounded-lg border transition-all ${
                    isHighContrast
                      ? 'border-white bg-black'
                      : 'border-[#E1E5EC] bg-white hover:border-[#CBD5E1]'
                  }`}
                  aria-label={`${t('a11y.userProfile')}: ${currentUser?.displayName || 'User'}`}
                >
                  <div className="relative w-7 h-7 rounded-full overflow-hidden border border-[#E1E5EC] bg-slate-100">
                    <img
                      src={currentUser?.avatarUrl}
                      alt={`${currentUser?.displayName} avatar`}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-200 text-slate-600 text-xs font-semibold -z-10">
                      {currentUser?.firstName[0] || 'U'}
                    </div>
                  </div>
                  <div
                    className={`w-2 h-2 rounded-full ${
                      currentUser?.availabilityStatus === 'busy'
                        ? 'bg-[#F28C28]'
                        : 'bg-[#16865C]'
                    }`}
                  />
                  <ChevronDown className="w-3.5 h-3.5 text-[#7B8492] hidden sm:block" />
                </button>

                {/* Profile Dropdown Menu */}
                {isProfileDropdownOpen && (
                  <div
                    role="menu"
                    className={`absolute right-0 mt-2 w-56 rounded-xl border shadow-lg py-1.5 z-50 ${
                      isHighContrast
                        ? 'bg-black border-white text-white'
                        : 'bg-white border-[#E1E5EC] text-[#303641]'
                    }`}
                  >
                    <div className="px-3.5 py-2.5 border-b border-[#E1E5EC]/80">
                      <div className="text-xs font-bold text-[#303641] truncate">
                        {currentUser?.displayName}
                      </div>
                      <div className="text-[11px] text-[#7B8492] truncate">
                        {currentUser?.email || `@${currentUser?.username}`}
                      </div>
                      <div className="mt-1 flex items-center gap-1 text-[11px] text-[#16865C] font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#16865C]" />
                        Active on VibeTalk
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setCurrentTab('profile');
                        setIsProfileDropdownOpen(false);
                      }}
                      className="w-full px-3.5 py-2 text-xs flex items-center gap-2 hover:bg-[#EAF2FF] hover:text-[#1877F2] transition-colors text-left"
                    >
                      <User className="w-4 h-4 text-[#7B8492]" />
                      <span>{t('nav.profile')}</span>
                    </button>

                    <button
                      onClick={() => {
                        onOpenSubscription();
                        setIsProfileDropdownOpen(false);
                      }}
                      className="w-full px-3.5 py-2 text-xs flex items-center gap-2 hover:bg-[#EAF2FF] hover:text-[#1877F2] transition-colors text-left"
                    >
                      <Sparkles className="w-4 h-4 text-[#F28C28]" />
                      <span>VIP Membership</span>
                    </button>

                    <button
                      onClick={() => {
                        onOpenPrivacy();
                        setIsProfileDropdownOpen(false);
                      }}
                      className="w-full px-3.5 py-2 text-xs flex items-center gap-2 hover:bg-[#EAF2FF] hover:text-[#1877F2] transition-colors text-left"
                    >
                      <Settings className="w-4 h-4 text-[#7B8492]" />
                      <span>Settings & Privacy</span>
                    </button>

                    <button
                      onClick={() => {
                        onOpenSafety();
                        setIsProfileDropdownOpen(false);
                      }}
                      className="w-full px-3.5 py-2 text-xs flex items-center gap-2 hover:bg-[#EAF2FF] hover:text-[#1877F2] transition-colors text-left"
                    >
                      <ShieldCheck className="w-4 h-4 text-[#16865C]" />
                      <span>Safety Center</span>
                    </button>

                    <button
                      onClick={() => {
                        onOpenAdmin();
                        setIsProfileDropdownOpen(false);
                      }}
                      className="w-full px-3.5 py-2 text-xs flex items-center gap-2 hover:bg-[#EAF2FF] hover:text-[#1877F2] transition-colors text-left text-[#1877F2] font-semibold"
                    >
                      <ShieldCheck className="w-4 h-4 text-[#1877F2]" />
                      <span>Super Admin Portal</span>
                    </button>

                    <button
                      onClick={() => {
                        onOpenSupabaseGuide();
                        setIsProfileDropdownOpen(false);
                      }}
                      className="w-full px-3.5 py-2 text-xs flex items-center gap-2 hover:bg-[#EAF2FF] hover:text-[#1877F2] transition-colors text-left"
                    >
                      <Database className="w-4 h-4 text-[#7B8492]" />
                      <span>Backend & Architecture</span>
                    </button>

                    <div className="border-t border-[#E1E5EC]/80 my-1" />

                    <button
                      onClick={() => {
                        logout();
                        setIsProfileDropdownOpen(false);
                      }}
                      className="w-full px-3.5 py-2 text-xs flex items-center gap-2 text-[#D9485F] hover:bg-rose-50 transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>{t('nav.signOut')}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#1877F2] text-white text-xs font-semibold hover:bg-[#166fe5] transition-all shadow-xs"
                aria-label={t('nav.signIn')}
              >
                <User className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{t('nav.signIn')}</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Accessible Language Modal */}
      <LanguageSelectorModal
        isOpen={isLanguageModalOpen}
        onClose={() => setIsLanguageModalOpen(false)}
      />
    </>
  );
};
