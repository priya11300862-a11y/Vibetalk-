import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  PhoneCall,
  Video,
  MessageSquare,
  Shuffle,
  Trophy,
  Clock,
  Check,
  Users,
  Radio,
  Flame,
  ShieldCheck,
  ChevronRight,
  Plus,
  Gift,
  Crown,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../../contexts/AuthContext';
import { useSocial } from '../../contexts/SocialContext';
import { useCall } from '../../contexts/CallContext';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import { UserProfile, LiveAudioRoom, ProfileBadge } from '../../types';
import { INITIAL_LIVE_ROOMS } from '../../services/mockData';
import { DAILY_REWARD_SCHEDULE, DailyRewardDay } from '../../services/interestTags';
import { UserStatusDot, getEffectiveStatus } from '../common/UserStatusBadge';

import { CoinWalletModal } from './CoinWalletModal';
import { LeaderboardModal } from './LeaderboardModal';
import { RandomConnectModal } from './RandomConnectModal';
import { LiveAudioRoomModal } from './LiveAudioRoomModal';
import { DailyRewardsModal } from './DailyRewardsModal';

interface HomeDashboardProps {
  onNavigateTab: (tab: string) => void;
  onOpenProfileModal?: (profile: UserProfile) => void;
  onOpenReportModal?: (profile: UserProfile) => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({ onNavigateTab }) => {
  const { currentUser, updateCurrentUserProfile } = useAuth();
  const { profiles, conversations, setActiveConversationId } = useSocial();
  const { startCall } = useCall();
  const { isHighContrast } = useAccessibility();

  // Modals state
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isRandomMatchOpen, setIsRandomMatchOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<LiveAudioRoom | null>(null);
  const [isDailyRewardsOpen, setIsDailyRewardsOpen] = useState(false);

  // Daily rewards & streak tracking state
  const [dailyStreak, setDailyStreak] = useState<number>(() => {
    const saved = localStorage.getItem('vibetalk_daily_streak');
    return saved ? parseInt(saved, 10) : (currentUser?.dailyStreak ?? 3);
  });

  const [isTodayClaimed, setIsTodayClaimed] = useState<boolean>(() => {
    const savedDate = localStorage.getItem('vibetalk_last_claim_date');
    const today = new Date().toDateString();
    return savedDate === today;
  });

  const [secondsRemaining, setSecondsRemaining] = useState(5 * 3600 + 39 * 60 + 51);

  // Live rooms toggle: shows either "No Rooms LIVE right now" or active rooms
  const [showActiveRooms, setShowActiveRooms] = useState(true);

  // Countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 24 * 3600));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (totalSecs: number) => {
    const h = Math.floor(totalSecs / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);
    const s = totalSecs % 60;
    return `${h}h ${m}m ${s}s`;
  };

  // Determine current active day reward (1 to 7 cycle)
  const currentDayCycle = isTodayClaimed
    ? ((dailyStreak % 7) === 0 ? 7 : (dailyStreak % 7))
    : (((dailyStreak - 1) % 7) + 1);

  const targetDayToClaim = isTodayClaimed
    ? ((dailyStreak % 7) + 1)
    : currentDayCycle;

  const currentReward =
    DAILY_REWARD_SCHEDULE.find((r) => r.day === (isTodayClaimed ? currentDayCycle : targetDayToClaim)) ||
    DAILY_REWARD_SCHEDULE[0];

  const handleClaimDailyReward = (rewardToClaim?: DailyRewardDay) => {
    const targetReward = rewardToClaim || currentReward;
    if (isTodayClaimed) return;

    try {
      confetti({
        particleCount: 65,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#1877F2', '#16865C', '#F28C28'],
      });
    } catch {
      // safe fallback
    }

    const currentCoins = currentUser?.coins ?? 80;
    const newCoins = currentCoins + targetReward.credits;

    // Check badges
    const existingBadges: ProfileBadge[] = currentUser?.unlockedBadges || [];
    let updatedBadges = [...existingBadges];

    if (targetReward.badge) {
      const alreadyHas = existingBadges.some((b) => b.id === targetReward.badge!.id);
      if (!alreadyHas) {
        updatedBadges.push({
          ...targetReward.badge,
          unlockedAt: new Date().toISOString(),
        });
      }
    }

    const nextStreak = dailyStreak + 1;
    setDailyStreak(nextStreak);
    setIsTodayClaimed(true);

    localStorage.setItem('vibetalk_daily_streak', nextStreak.toString());
    localStorage.setItem('vibetalk_last_claim_date', new Date().toDateString());

    updateCurrentUserProfile({
      coins: newCoins,
      unlockedBadges: updatedBadges,
      dailyStreak: nextStreak,
      lastDailyClaimDate: new Date().toDateString(),
      championBadge: targetReward.badge ? targetReward.badge.name.toUpperCase() : currentUser?.championBadge,
    });
  };

  const handleSimulateNextDay = () => {
    const nextStreak = isTodayClaimed ? dailyStreak + 1 : dailyStreak;
    setDailyStreak(nextStreak);
    setIsTodayClaimed(false);
    localStorage.removeItem('vibetalk_last_claim_date');
    localStorage.setItem('vibetalk_daily_streak', nextStreak.toString());
  };

  const handleClaimDailyCoins = () => {
    handleClaimDailyReward();
  };

  return (
    <div
      className={`max-w-4xl mx-auto px-3 sm:px-6 py-4 space-y-5 text-left transition-colors ${
        isHighContrast ? 'bg-black text-white' : 'bg-[#F5F7FC] text-[#303641]'
      }`}
    >
      {/* =========================================================================
          1. TOP STATUS BAR (Profile Champion, Coin Balance, Trophy Leaderboard)
          ========================================================================= */}
      <div className="flex items-center justify-between pt-1 pb-1">
        {/* Left: User Avatar with Status */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => onNavigateTab('profile')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              onNavigateTab('profile');
            }
          }}
          aria-label={`View profile for ${currentUser?.displayName || 'user'}`}
          className="flex items-center gap-2.5 cursor-pointer group rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1877F2]"
        >
          <div className="relative">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-[#E1E5EC] bg-white shadow-xs group-hover:scale-105 transition-transform">
              <img
                src={currentUser?.avatarUrl}
                alt={currentUser?.displayName}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#16865C] border-2 border-white" />
          </div>
          <div>
            <div className="text-sm font-bold text-[#303641] leading-tight">
              {currentUser?.displayName}
            </div>
            <div className="text-[11px] text-[#7B8492]">
              {currentUser?.championBadge || 'Verified Member'}
            </div>
          </div>
        </div>

        {/* Center: Coin Balance Badge */}
        <button
          onClick={() => setIsWalletOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-[#E1E5EC] hover:border-[#1877F2]/40 shadow-xs transition-all active:scale-95"
          title="Open Coin Wallet"
          aria-label={`Open Coin Wallet. Balance: ${currentUser?.coins ?? 80} coins`}
        >
          <div className="w-4 h-4 rounded-full bg-[#F28C28] flex items-center justify-center text-white text-[10px] font-bold">
            🪙
          </div>
          <span className="font-bold text-xs text-[#303641] tabular-nums">
            {currentUser?.coins ?? 80} Coins
          </span>
        </button>

        {/* Right: Leaderboard Button */}
        <button
          onClick={() => setIsLeaderboardOpen(true)}
          className="p-2 rounded-lg bg-white hover:bg-[#F5F7FC] border border-[#E1E5EC] text-[#F28C28] transition-all shadow-xs"
          title="Top Champions Leaderboard"
          aria-label="Top Champions Leaderboard"
        >
          <Trophy className="w-4 h-4" />
        </button>
      </div>

      {/* =========================================================================
          2. OFFICIAL TEAM ROW ("VibeTalk Team" Notification)
          ========================================================================= */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => {
          setActiveConversationId('conv_clara');
          onNavigateTab('messages');
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            setActiveConversationId('conv_clara');
            onNavigateTab('messages');
          }
        }}
        aria-label="Open conversation with VibeTalk Team"
        className="p-3 rounded-xl bg-white border border-[#E1E5EC] shadow-xs flex items-center gap-3 cursor-pointer hover:border-[#1877F2]/40 transition-colors"
      >
        <div className="w-10 h-10 rounded-lg bg-[#EAF2FF] text-[#1877F2] flex items-center justify-center font-bold text-xs shrink-0 border border-[#1877F2]/20">
          VT
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#303641]">VibeTalk Official Team</h3>
            <span className="w-2 h-2 rounded-full bg-[#D9485F]" aria-hidden="true" />
          </div>
          <p className="text-[11px] text-[#7B8492] mt-0.5 truncate">
            Welcome to VibeTalk! Your privacy and security are our highest priority.
          </p>
        </div>
      </div>

      {/* =========================================================================
          3. DAILY REWARDS & LOGIN STREAK SYSTEM (Clean KisanShop White Card Surface)
          ========================================================================= */}
      <div className="rounded-xl bg-white border border-[#E1E5EC] p-4 sm:p-5 shadow-xs space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#1877F2] uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-[#1877F2]" />
            <span>Daily Rewards System</span>
          </div>

          <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FFF7ED] border border-[#F28C28]/30 text-xs font-semibold text-[#F28C28]">
            <Flame className="w-3.5 h-3.5 text-[#F28C28] fill-[#F28C28]" />
            <span>{dailyStreak} Day Streak</span>
          </div>
        </div>

        <div className="flex items-center gap-3.5">
          <div className="relative w-12 h-12 rounded-xl bg-[#EAF2FF] border border-[#1877F2]/30 flex items-center justify-center text-2xl shrink-0">
            {currentReward.badge ? currentReward.badge.icon : '🎁'}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-[#303641]">
                +{currentReward.credits} Coins
              </h2>
              {currentReward.badge && (
                <span className="text-[10px] font-semibold px-2 py-0.2 rounded bg-[#EAF2FF] text-[#1877F2] border border-[#1877F2]/20">
                  {currentReward.badge.name}
                </span>
              )}
            </div>
            <p className="text-xs text-[#7B8492]">
              {isTodayClaimed
                ? `Day ${currentReward.day} claimed. Next reward unlocks tomorrow!`
                : `Day ${targetDayToClaim} reward is ready to claim now.`}
            </p>
          </div>
        </div>

        {/* 7-Day Stepper Node Track */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 pt-1">
          {DAILY_REWARD_SCHEDULE.map((dayItem) => {
            const isPastClaimed = dayItem.day < targetDayToClaim || (dayItem.day === targetDayToClaim && isTodayClaimed);
            const isCurrentDay = dayItem.day === targetDayToClaim && !isTodayClaimed;

            return (
              <div
                key={dayItem.day}
                onClick={() => setIsDailyRewardsOpen(true)}
                className={`p-1.5 rounded-lg border text-center cursor-pointer transition-all ${
                  isCurrentDay
                    ? 'bg-[#EAF2FF] border-[#1877F2] text-[#1877F2] font-semibold'
                    : isPastClaimed
                    ? 'bg-[#F0FDF4] border-[#16865C]/30 text-[#16865C]'
                    : 'bg-[#F5F7FC] border-[#E1E5EC] text-[#7B8492]'
                }`}
                title={`Day ${dayItem.day}: +${dayItem.credits} coins`}
              >
                <span className="text-[10px] uppercase block">D{dayItem.day}</span>
                <span className="text-xs my-0.5 block">{dayItem.badge ? dayItem.badge.icon : '🪙'}</span>
                <span className="text-[10px] font-medium block">
                  {isPastClaimed ? '✓' : `+${dayItem.credits}`}
                </span>
              </div>
            );
          })}
        </div>

        {/* Action Button */}
        <div className="pt-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {!isTodayClaimed ? (
            <button
              onClick={() => handleClaimDailyReward()}
              className="flex-1 py-2 px-4 rounded-lg bg-[#1877F2] hover:bg-[#166fe5] text-white text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Claim Day {targetDayToClaim} Reward (+{currentReward.credits} Coins)</span>
            </button>
          ) : (
            <div
              onClick={() => setIsDailyRewardsOpen(true)}
              className="flex-1 py-2 px-4 rounded-lg bg-[#F5F7FC] border border-[#E1E5EC] flex items-center justify-center gap-1.5 text-xs text-[#7B8492] cursor-pointer"
            >
              <Clock className="w-3.5 h-3.5 text-[#1877F2]" />
              <span>
                Next reward in <strong className="text-[#303641]">{formatCountdown(secondsRemaining)}</strong>
              </span>
            </div>
          )}

          <button
            onClick={() => setIsDailyRewardsOpen(true)}
            className="py-2 px-3 rounded-lg border border-[#E1E5EC] bg-white hover:bg-[#F5F7FC] text-xs font-medium text-[#303641] transition-colors flex items-center justify-center gap-1.5 shrink-0"
          >
            <Trophy className="w-3.5 h-3.5 text-[#F28C28]" />
            <span>Calendar</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          4. "VibeTalk Connect" SECTION
          ========================================================================= */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-[#303641] tracking-tight">
            Discover People
          </h2>

          <button
            onClick={() => setIsRandomMatchOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg border border-[#1877F2]/30 bg-[#EAF2FF] text-xs font-semibold text-[#1877F2] hover:bg-[#dbe9fe] transition-colors"
          >
            <span>Random Match</span>
            <Shuffle className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Live Connect Cards (Clean white surfaces with subtle borders) */}
        <div className="flex items-stretch gap-3 overflow-x-auto pb-2 pt-0.5 no-scrollbar -mx-1 px-1">
          {profiles.slice(0, 6).map((profile) => {
            const friendStatus = getEffectiveStatus(profile);

            return (
              <div
                key={profile.id}
                className="w-38 sm:w-42 shrink-0 rounded-xl bg-white border border-[#E1E5EC] p-3 flex flex-col items-center justify-between space-y-2.5 shadow-xs hover:border-[#CBD5E1] transition-all group"
              >
                {/* Avatar with Status */}
                <div className="relative pt-1">
                  <div className="w-16 h-16 rounded-full overflow-hidden border border-[#E1E5EC] bg-slate-100 group-hover:scale-105 transition-transform">
                    <img
                      src={profile.avatarUrl}
                      alt={profile.displayName}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <span
                    className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${
                      friendStatus === 'online'
                        ? 'bg-[#16865C]'
                        : friendStatus === 'busy'
                        ? 'bg-[#F28C28]'
                        : 'bg-slate-400'
                    }`}
                  />
                </div>

                {/* Profile Name & Status Text */}
                <div className="text-center space-y-0.5 w-full">
                  <span className="block text-xs font-bold text-[#303641] truncate">
                    {profile.displayName}
                  </span>
                  <span
                    className={`text-[10px] font-medium ${
                      friendStatus === 'online'
                        ? 'text-[#16865C]'
                        : friendStatus === 'busy'
                        ? 'text-[#F28C28]'
                        : 'text-[#7B8492]'
                    }`}
                  >
                    {friendStatus === 'online' ? 'Online' : friendStatus === 'busy' ? 'Busy' : 'Offline'}
                  </span>
                </div>

                {/* Join Call Action Button */}
                <button
                  onClick={() => startCall(profile, 'audio', profile.activeTopic)}
                  className="w-full py-1.5 px-2.5 rounded-lg bg-[#1877F2] hover:bg-[#166fe5] text-white font-medium text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Call</span>
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          5. LIVE AUDIO ROOMS SECTION
          ========================================================================= */}
      <section className="space-y-3 pt-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-[#303641] tracking-tight">
              Live Audio Lounges
            </h2>
            <span className="px-2 py-0.2 rounded-full bg-[#F0FDF4] text-[#16865C] border border-[#16865C]/30 text-[10px] font-semibold uppercase">
              Live
            </span>
          </div>

          <button
            onClick={() => onNavigateTab('discover')}
            className="text-xs text-[#1877F2] font-semibold hover:underline"
          >
            View all
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {INITIAL_LIVE_ROOMS.map((room) => (
            <div
              key={room.id}
              onClick={() => setSelectedRoom(room)}
              className="p-3.5 rounded-xl bg-white border border-[#E1E5EC] hover:border-[#1877F2]/40 cursor-pointer transition-all space-y-2.5 shadow-xs group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 px-2 py-0.2 rounded-full bg-[#FFF1F2] text-[#D9485F] text-[10px] font-bold border border-[#D9485F]/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D9485F] animate-ping" />
                  <span>LIVE</span>
                </div>
                <span className="text-[11px] text-[#7B8492] flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-[#1877F2]" />
                  <span>{room.listenerCount} listening</span>
                </span>
              </div>

              <h3 className="text-xs font-bold text-[#303641] group-hover:text-[#1877F2] transition-colors truncate">
                {room.title}
              </h3>

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center -space-x-1.5">
                  {room.speakers.map((spk) => (
                    <div
                      key={spk.id}
                      className="w-7 h-7 rounded-full overflow-hidden border-2 border-white bg-slate-200"
                    >
                      <img src={spk.avatarUrl} alt={spk.displayName} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>

                <span className="text-xs font-semibold text-[#1877F2] flex items-center gap-0.5">
                  <span>Tune in</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Global Modals */}
      <DailyRewardsModal
        isOpen={isDailyRewardsOpen}
        currentUser={currentUser}
        dailyStreak={dailyStreak}
        isTodayClaimed={isTodayClaimed}
        secondsRemaining={secondsRemaining}
        onClaimReward={handleClaimDailyReward}
        onSimulateNextDay={handleSimulateNextDay}
        onClose={() => setIsDailyRewardsOpen(false)}
      />

      <CoinWalletModal
        isOpen={isWalletOpen}
        onClose={() => setIsWalletOpen(false)}
        onClaimDailyCoins={handleClaimDailyCoins}
        isClaimed={isTodayClaimed}
      />

      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
      />

      <RandomConnectModal
        isOpen={isRandomMatchOpen}
        onClose={() => setIsRandomMatchOpen(false)}
      />

      <LiveAudioRoomModal
        room={selectedRoom}
        isOpen={!!selectedRoom}
        onClose={() => setSelectedRoom(null)}
      />
    </div>
  );
};
