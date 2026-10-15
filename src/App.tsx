import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SocialProvider, useSocial } from './contexts/SocialContext';
import { CallProvider } from './contexts/CallContext';
import { I18nProvider, useI18n } from './contexts/I18nContext';
import { AccessibilityProvider, useAccessibility } from './contexts/AccessibilityContext';

import { Navbar } from './components/layouts/Navbar';
import { BottomNav } from './components/layouts/BottomNav';
import { SkipToContent } from './components/common/SkipToContent';
import { AgeDisclaimerBanner } from './components/common/AgeDisclaimerBanner';
import { OfflineIndicator } from './components/common/OfflineIndicator';
import { SupabaseSetupModal } from './components/common/SupabaseSetupModal';

import { LandingPage } from './components/landing/LandingPage';
import { HomeDashboard } from './components/home/HomeDashboard';
import { ConnectRoomsView } from './components/connect/ConnectRoomsView';
import { ChatView } from './components/chat/ChatView';
import { CallHistoryView } from './components/calls/CallHistoryView';
import { ProfileView } from './components/profile/ProfileView';

import { AuthModal } from './components/auth/AuthModal';
import { CallModal } from './components/calls/CallModal';
import { PrivacyCenterModal } from './components/privacy/PrivacyCenterModal';
import { SafetyCenterModal } from './components/safety/SafetyCenterModal';
import { AdminDashboardModal } from './components/admin/AdminDashboardModal';
import { SubscriptionModal } from './components/subscription/SubscriptionModal';
import { NotificationsModal } from './components/notifications/NotificationsModal';
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { LoginPage } from './components/auth/LoginPage';
import { AdminProvider, useAdmin } from './contexts/AdminContext';
import { UserProfile } from './types';

const MAIN_TABS = ['home', 'discover', 'profile', 'messages', 'calls'];

const MainAppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { activeConversationId } = useSocial();
  const { t } = useI18n();
  const { isHighContrast } = useAccessibility();
  const { isAdminAuthenticated, platformSettings } = useAdmin();

  // Route state: 'app' | 'admin' | 'admin_login' | 'login'
  const [currentRoute, setCurrentRoute] = useState<'app' | 'admin' | 'admin_login' | 'login'>(() => {
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    if (path === '/admin/login' || hash === '#admin/login') return 'admin_login';
    if (path === '/admin' || hash === '#admin') return 'admin';
    if (path === '/login' || hash === '#login') return 'login';
    return 'app';
  });

  React.useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (path === '/admin/login' || hash === '#admin/login') {
        setCurrentRoute('admin_login');
      } else if (path === '/admin' || hash === '#admin') {
        setCurrentRoute('admin');
      } else if (path === '/login' || hash === '#login') {
        setCurrentRoute('login');
      } else {
        setCurrentRoute('app');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateToRoute = (route: 'app' | 'admin' | 'admin_login' | 'login') => {
    setCurrentRoute(route);
    const targetPath =
      route === 'admin'
        ? '/admin'
        : route === 'admin_login'
        ? '/admin/login'
        : route === 'login'
        ? '/login'
        : '/';
    try {
      window.history.pushState({}, '', targetPath);
    } catch {
      window.location.hash =
        route === 'admin'
          ? '#admin'
          : route === 'admin_login'
          ? '#admin/login'
          : route === 'login'
          ? '#login'
          : '#';
    }
  };

  // Navigation tab: 'home' | 'discover' | 'profile' | 'messages' | 'calls'
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [direction, setDirection] = useState<number>(0);
  const [hasExploredFromLanding, setHasExploredFromLanding] = useState(false);

  // Modal states
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isSafetyOpen, setIsSafetyOpen] = useState(false);
  const [targetUserForReport, setTargetUserForReport] = useState<UserProfile | null>(null);
  const [selectedProfileForView, setSelectedProfileForView] = useState<UserProfile | null>(null);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isSubscriptionOpen, setIsSubscriptionOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSupabaseGuideOpen, setIsSupabaseGuideOpen] = useState(false);

  const navigateToTab = (newTab: string) => {
    const currentIndex = MAIN_TABS.indexOf(currentTab);
    const newIndex = MAIN_TABS.indexOf(newTab);
    if (newIndex !== -1 && currentIndex !== -1) {
      setDirection(newIndex > currentIndex ? 1 : -1);
    }
    setCurrentTab(newTab);
  };

  const isSwipeDisabled = Boolean(currentTab === 'messages' && activeConversationId);

  const handleDragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: { offset: { x: number; y: number }; velocity: { x: number; y: number } }
  ) => {
    if (isSwipeDisabled) return;

    // Detect predominantly horizontal movement
    const isHorizontalSwipe = Math.abs(info.offset.x) > Math.abs(info.offset.y) * 1.1;
    if (!isHorizontalSwipe) return;

    const threshold = 40;
    const velocityThreshold = 250;

    const currentIndex = MAIN_TABS.indexOf(currentTab);
    if (currentIndex === -1) return;

    // Swiping left (user dragged left) -> next tab
    if (info.offset.x < -threshold || info.velocity.x < -velocityThreshold) {
      if (currentIndex < MAIN_TABS.length - 1) {
        setDirection(1);
        setCurrentTab(MAIN_TABS[currentIndex + 1]);
      }
    }
    // Swiping right (user dragged right) -> previous tab
    else if (info.offset.x > threshold || info.velocity.x > velocityThreshold) {
      if (currentIndex > 0) {
        setDirection(-1);
        setCurrentTab(MAIN_TABS[currentIndex - 1]);
      }
    }
  };

  const tabVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 60 : -60,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: {
        x: { type: 'spring' as const, stiffness: 350, damping: 30 },
        opacity: { duration: 0.18 },
      },
    },
    exit: (dir: number) => ({
      x: dir < 0 ? 60 : -60,
      opacity: 0,
      transition: {
        x: { type: 'spring' as const, stiffness: 350, damping: 30 },
        opacity: { duration: 0.15 },
      },
    }),
  };

  const openAuthWithMode = (mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const openReportModal = (user: UserProfile) => {
    setTargetUserForReport(user);
    setIsSafetyOpen(true);
  };

  // If visitor is not authenticated and hasn't explicitly clicked "Explore VibeTalk", show Landing Page
  const showLanding = !isAuthenticated && !hasExploredFromLanding;

  // Dedicated /admin and /admin/login route rendering
  if (currentRoute === 'admin') {
    if (isAdminAuthenticated) {
      return <AdminDashboard onExitToApp={() => navigateToRoute('app')} />;
    }
    return (
      <AdminLogin
        onLoginSuccess={() => navigateToRoute('admin')}
        onExitToApp={() => navigateToRoute('app')}
      />
    );
  }

  if (currentRoute === 'admin_login') {
    return (
      <AdminLogin
        onLoginSuccess={() => navigateToRoute('admin')}
        onExitToApp={() => navigateToRoute('app')}
      />
    );
  }

  if (currentRoute === 'login') {
    return (
      <LoginPage
        onLoginSuccess={() => navigateToRoute('app')}
        onExitToApp={() => navigateToRoute('app')}
      />
    );
  }

  // Maintenance mode active
  if (platformSettings.maintenanceMode && !isAdminAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F5F7FC] flex items-center justify-center p-6 text-center font-sans">
        <div className="max-w-md w-full bg-white rounded-3xl border border-[#E1E5EC] p-8 space-y-4 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
            <span className="text-2xl font-bold">⚠️</span>
          </div>
          <h1 className="text-xl font-bold text-[#303641]">System Maintenance</h1>
          <p className="text-xs text-[#7B8492] leading-relaxed">
            {platformSettings.maintenanceNotice}
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={() => navigateToRoute('admin')}
              className="text-xs text-[#1877F2] font-semibold hover:underline cursor-pointer"
            >
              Administrator Login Portal →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen flex flex-col justify-between pb-16 md:pb-0 overflow-x-hidden ${
        isHighContrast
          ? 'bg-black text-white font-bold'
          : 'bg-[#F5F7FC] text-[#303641] selection:bg-[#1877F2]/20 selection:text-[#1877F2]'
      }`}
    >
      <SkipToContent />
      <AgeDisclaimerBanner />
      <OfflineIndicator />

      {/* Top Header */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={navigateToTab}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenPrivacy={() => setIsPrivacyOpen(true)}
        onOpenSafety={() => {
          setTargetUserForReport(null);
          setIsSafetyOpen(true);
        }}
        onOpenAdmin={() => navigateToRoute('admin')}
        onOpenSubscription={() => setIsSubscriptionOpen(true)}
        onOpenSupabaseGuide={() => setIsSupabaseGuideOpen(true)}
        onOpenAuth={() => openAuthWithMode('login')}
      />

      {/* Viewport Content */}
      <main
        id="main-content"
        tabIndex={-1}
        role="main"
        aria-label={t('a11y.mainContent')}
        className="flex-1 w-full flex flex-col overflow-x-hidden relative focus:outline-hidden"
      >
        {showLanding ? (
          <LandingPage
            onOpenAuth={openAuthWithMode}
            onExplore={() => {
              setHasExploredFromLanding(true);
              navigateToTab('discover');
            }}
          />
        ) : (
          <div className="flex-1 w-full flex flex-col relative overflow-hidden">
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={currentTab}
                custom={direction}
                variants={tabVariants}
                initial="enter"
                animate="center"
                exit="exit"
                drag={isSwipeDisabled ? false : 'x'}
                dragDirectionLock
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.12}
                dragMomentum={false}
                onDragEnd={handleDragEnd}
                className="w-full flex-1 touch-pan-y"
              >
                {currentTab === 'home' && (
                  <HomeDashboard
                    onNavigateTab={navigateToTab}
                    onOpenReportModal={openReportModal}
                  />
                )}
                {currentTab === 'discover' && (
                  <ConnectRoomsView
                    onNavigateTab={navigateToTab}
                    onOpenReportModal={openReportModal}
                    onSelectProfile={(user) => {
                      setSelectedProfileForView(user);
                      navigateToTab('profile');
                    }}
                  />
                )}
                {currentTab === 'profile' && (
                  <ProfileView
                    onOpenPrivacy={() => setIsPrivacyOpen(true)}
                    onOpenVerificationModal={() => setIsPrivacyOpen(true)}
                    onOpenSubscription={() => setIsSubscriptionOpen(true)}
                    onNavigateTab={navigateToTab}
                    targetProfile={selectedProfileForView}
                  />
                )}
                {currentTab === 'messages' && (
                  <ChatView
                    onOpenReportModal={openReportModal}
                    onNavigateTab={navigateToTab}
                  />
                )}
                {currentTab === 'calls' && <CallHistoryView />}
              </motion.div>
            </AnimatePresence>

            {/* Mobile Tab Swipe Indicator Dots */}
            <div
              aria-hidden="true"
              className="md:hidden flex items-center justify-center gap-1.5 py-1.5 select-none pointer-events-none opacity-50"
            >
              {MAIN_TABS.map((tab) => (
                <div
                  key={tab}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    currentTab === tab
                      ? isHighContrast
                        ? 'w-4 bg-yellow-400'
                        : 'w-4 bg-[#1877F2]'
                      : isHighContrast
                      ? 'w-1 bg-white/40'
                      : 'w-1 bg-[#CBD5E1]'
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Mobile Bottom Thumb Navigation */}
      {!showLanding && (
        <BottomNav currentTab={currentTab} setCurrentTab={navigateToTab} />
      )}

      {/* Interactive Global Modals */}
      <AuthModal
        isOpen={isAuthModalOpen}
        initialMode={authModalMode}
        onClose={() => setIsAuthModalOpen(false)}
      />

      <CallModal />

      <PrivacyCenterModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
      />

      <SafetyCenterModal
        isOpen={isSafetyOpen}
        targetUserForReport={targetUserForReport}
        onClose={() => {
          setIsSafetyOpen(false);
          setTargetUserForReport(null);
        }}
      />

      <AdminDashboardModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
      />

      <SubscriptionModal
        isOpen={isSubscriptionOpen}
        onClose={() => setIsSubscriptionOpen(false)}
      />

      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />

      <SupabaseSetupModal
        isOpen={isSupabaseGuideOpen}
        onClose={() => setIsSupabaseGuideOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AccessibilityProvider>
      <I18nProvider>
        <AuthProvider>
          <SocialProvider>
            <CallProvider>
              <AdminProvider>
                <MainAppContent />
              </AdminProvider>
            </CallProvider>
          </SocialProvider>
        </AuthProvider>
      </I18nProvider>
    </AccessibilityProvider>
  );
}
