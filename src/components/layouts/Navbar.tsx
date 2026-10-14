import React from 'react';
import { Bell, ShieldCheck, Database, Sparkles, User, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useSocial } from '../../contexts/SocialContext';
import { PWAInstallButton } from '../common/PWAInstallButton';

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
  onOpenSafety,
  onOpenAdmin,
  onOpenSubscription,
  onOpenSupabaseGuide,
  onOpenAuth,
}) => {
  const { currentUser, isAuthenticated, logout } = useAuth();
  const { unreadNotificationsCount, unreadMessagesCount } = useSocial();

  return (
    <header className="sticky top-0 z-40 w-full bg-[#FAF8F5]/90 backdrop-blur-xl border-b border-stone-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto h-14 px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* Zone 1: Single text wordmark */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentTab('home')}
            className="flex items-center gap-2 group text-left"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#FF4F9A] via-[#7C5CFF] to-[#20D9C3] p-[1.5px] transition-transform duration-200 group-hover:scale-105">
              <div className="w-full h-full bg-[#FAF8F5] rounded-[10px] flex items-center justify-center">
                <span className="font-extrabold text-sm text-transparent bg-clip-text bg-gradient-to-tr from-[#7C5CFF] to-[#20D9C3]">
                  V
                </span>
              </div>
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900 group-hover:text-[#7C5CFF] transition-colors">
              VibeTalk
            </span>
          </button>
          <span className="hidden sm:inline-flex text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-stone-100 text-[#FF4F9A] border border-stone-200">
            18+
          </span>
        </div>

        {/* Zone 2: 4-6 clean text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-black text-black">
          <button
            onClick={() => setCurrentTab('home')}
            className={`transition-colors hover:opacity-75 ${currentTab === 'home' ? 'text-black font-black underline underline-offset-4 decoration-2 decoration-[#FF4F9A]' : 'text-black font-extrabold'}`}
          >
            Home
          </button>
          <button
            onClick={() => setCurrentTab('discover')}
            className={`transition-colors hover:opacity-75 ${currentTab === 'discover' ? 'text-black font-black underline underline-offset-4 decoration-2 decoration-[#FF4F9A]' : 'text-black font-extrabold'}`}
          >
            Rooms
          </button>
          <button
            onClick={() => setCurrentTab('profile')}
            className={`transition-colors hover:opacity-75 ${currentTab === 'profile' ? 'text-black font-black underline underline-offset-4 decoration-2 decoration-[#FF4F9A]' : 'text-black font-extrabold'}`}
          >
            Profile
          </button>
          <button
            onClick={() => setCurrentTab('messages')}
            className={`relative transition-colors hover:opacity-75 ${currentTab === 'messages' ? 'text-black font-black underline underline-offset-4 decoration-2 decoration-[#FF4F9A]' : 'text-black font-extrabold'}`}
          >
            <span>VibeChat</span>
            {unreadMessagesCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-[#7C5CFF] text-white">
                {unreadMessagesCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setCurrentTab('calls')}
            className={`transition-colors hover:opacity-75 ${currentTab === 'calls' ? 'text-black font-black underline underline-offset-4 decoration-2 decoration-[#FF4F9A]' : 'text-black font-extrabold'}`}
          >
            Calls
          </button>
          <button
            onClick={onOpenSafety}
            className="transition-colors hover:text-[#20D9C3] flex items-center gap-1"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Safety</span>
          </button>
          {currentUser?.role === 'admin' && (
            <button
              onClick={onOpenAdmin}
              className="transition-colors hover:text-[#FF4F9A] flex items-center gap-1"
            >
              <span>Admin</span>
            </button>
          )}
        </nav>

        {/* Zone 3: 1-2 primary actions & profile */}
        <div className="flex items-center gap-2.5">
          <PWAInstallButton />

          <button
            onClick={onOpenSupabaseGuide}
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200/80 text-slate-700 text-xs border border-stone-200 transition-colors"
            title="Database & Architecture"
          >
            <Database className="w-3.5 h-3.5 text-[#20D9C3]" />
            <span className="hidden xl:inline">Backend</span>
          </button>

          <button
            onClick={onOpenSubscription}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gradient-to-r from-[#7C5CFF]/15 to-[#FF4F9A]/15 border border-[#7C5CFF]/30 text-xs font-semibold text-slate-800 hover:border-[#7C5CFF]/60 transition-colors"
          >
            <Sparkles className="w-3 h-3 text-[#FF4F9A]" />
            <span>VIP</span>
          </button>

          {isAuthenticated ? (
            <>
              {/* Notifications bell */}
              <button
                onClick={onOpenNotifications}
                className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-stone-100 transition-colors"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#FF4F9A] ring-2 ring-[#FAF8F5]" />
                )}
              </button>

              {/* Profile Avatar */}
              <button
                onClick={() => setCurrentTab('profile')}
                className="flex items-center gap-2 p-1 rounded-full hover:ring-1 hover:ring-[#7C5CFF]/50 transition-all"
                title="Profile"
              >
                <div className="relative w-7 h-7 rounded-full overflow-hidden border border-stone-300 bg-slate-200">
                  <img
                    src={currentUser?.avatarUrl}
                    alt={currentUser?.displayName}
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
                  className={`w-2 h-2 rounded-full ring-1 ring-[#FAF8F5] ${
                    currentUser?.availabilityStatus === 'busy'
                      ? 'bg-amber-500 shadow-[0_0_6px_#f59e0b]'
                      : 'bg-emerald-500 shadow-[0_0_6px_#10b981]'
                  }`}
                  title={currentUser?.availabilityStatus === 'busy' ? 'Busy' : 'Available Online'}
                />
              </button>

              <button
                onClick={logout}
                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-500 hover:bg-stone-100 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#7C5CFF] text-white text-xs font-semibold hover:bg-[#6b47ff] transition-all shadow-md shadow-[#7C5CFF]/20"
            >
              <User className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
