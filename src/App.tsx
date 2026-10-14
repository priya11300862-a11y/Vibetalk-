import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SocialProvider, useSocial } from './contexts/SocialContext';
import { CallProvider, useCall } from './contexts/CallContext';

import { Navbar } from './components/layouts/Navbar';
import { BottomNav } from './components/layouts/BottomNav';
import { AgeDisclaimerBanner } from './components/common/AgeDisclaimerBanner';
import { OfflineIndicator } from './components/common/OfflineIndicator';
import { SupabaseSetupModal } from './components/common/SupabaseSetupModal';

import { LandingPage } from './components/landing/LandingPage';
import { HomeDashboard } from './components/home/HomeDashboard';
import { ConnectRoomsView } from './components/connect/ConnectRoomsView';
import { DiscoverView } from './components/discover/DiscoverView';
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
import { UserProfile } from './types';

const MAIN_TABS = ['home', 'discover', 'profile', 'messages', 'calls'];

const MainAppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { activeConversationId } = useSocial();

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFFDF9] via-[#FAF8F5] to-[#F5F2EB] text-black font-bold flex flex-col justify-between selection:bg-[#FF4F9A]/30 selection:text-black pb-16 md:pb-0 overflow-x-hidden">
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
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenSubscription={() => setIsSubscriptionOpen(true)}
        onOpenSupabaseGuide={() => setIsSupabaseGuideOpen(true)}
        onOpenAuth={() => openAuthWithMode('login')}
      />

      {/* Viewport Content */}
      <main className="flex-1 w-full flex flex-col overflow-x-hidden relative">
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
            <div className="md:hidden flex items-center justify-center gap-1.5 py-1.5 select-none pointer-events-none opacity-50">
              {MAIN_TABS.map((tab) => (
                <div
                  key={tab}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    currentTab === tab ? 'w-4 bg-[#7C5CFF]' : 'w-1 bg-white/20'
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
    <AuthProvider>
      <SocialProvider>
        <CallProvider>
          <MainAppContent />
        </CallProvider>
      </SocialProvider>
    </AuthProvider>
  );
}
