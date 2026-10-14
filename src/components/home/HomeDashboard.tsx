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

  const nextReward =
    DAILY_REWARD_SCHEDULE.find((r) => r.day === ((currentDayCycle % 7) + 1)) ||
    DAILY_REWARD_SCHEDULE[0];

  const handleClaimDailyReward = (rewardToClaim?: DailyRewardDay) => {
    const targetReward = rewardToClaim || currentReward;
    if (isTodayClaimed) return;

    try {
      confetti({
        particleCount: 75,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#FFD700', '#FF1493', '#7C5CFF', '#20D9C3'],
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

  const handleJoinCall = async (user: UserProfile) => {
    await startCall(user, 'audio');
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 py-4 space-y-6 text-left selection:bg-[#7C5CFF]/30 selection:text-black text-black font-bold">
      
      {/* =========================================================================
          1. TOP STATUS BAR (Profile Champion, Coin Balance, Trophy Leaderboard)
          ========================================================================= */}
      <div className="flex items-center justify-between pt-1 pb-2">
        {/* Left: User Avatar with Champion Crest Badge */}
        <div
          onClick={() => onNavigateTab('profile')}
          className="flex items-center gap-2 cursor-pointer group"
        >
          <div className="relative">
            <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-amber-400/80 p-0.5 bg-slate-900 shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <img
                src={currentUser?.avatarUrl}
                alt={currentUser?.displayName}
                className="w-full h-full object-cover rounded-full"
                referrerPolicy="no-referrer"
              />
            </div>
            {/* Champion Sword Frame Badge */}
            <div className="absolute -bottom-1 -left-1 px-1 py-0.2 rounded-full bg-gradient-to-r from-amber-500 to-yellow-300 text-[8px] font-black text-slate-950 uppercase tracking-tighter shadow flex items-center gap-0.5">
              <span>⚔️</span>
              <span className="text-[7.5px]">CHAMPION</span>
            </div>
          </div>
        </div>

        {/* Center: Coin Balance Badge */}
        <button
          onClick={() => setIsWalletOpen(true)}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-stone-200 hover:border-amber-400/60 shadow-xs transition-all active:scale-95"
          title="Open Coin Wallet"
        >
          {/* Heart/Gold Coin Icon */}
          <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-slate-950 font-black text-xs shadow-sm">
            🪙
          </div>
          <span className="font-extrabold text-sm text-slate-900 font-mono tabular-nums">
            {currentUser?.coins ?? 80}
          </span>
        </button>

        {/* Right: Golden Trophy Leaderboard Icon */}
        <button
          onClick={() => setIsLeaderboardOpen(true)}
          className="p-2.5 rounded-2xl bg-white hover:bg-stone-50 border border-stone-200 hover:border-amber-400/50 text-amber-500 transition-all active:scale-95 shadow-xs"
          title="Top Champions Leaderboard"
        >
          <Trophy className="w-5 h-5" />
        </button>
      </div>

      {/* =========================================================================
          2. OFFICIAL TEAM ROW ("VibeTalk Team" / "FRND Team" Style)
          ========================================================================= */}
      <div
        onClick={() => {
          setActiveConversationId('conv_clara');
          onNavigateTab('messages');
        }}
        className="p-3 rounded-2xl bg-white/90 hover:bg-white border border-stone-200/90 shadow-xs flex items-center gap-3.5 cursor-pointer transition-colors"
      >
        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#FF1493] via-[#FF4F9A] to-[#FF69B4] flex items-center justify-center text-white font-black text-xs tracking-tight shadow-md shadow-pink-500/20 shrink-0">
          <span className="italic font-extrabold text-[13px] lowercase">vibe</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">VibeTalk Team</h3>
            <span className="w-2 h-2 rounded-full bg-[#FF4F9A]" />
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Yesterday, 06:00 PM</p>
        </div>
      </div>

      {/* =========================================================================
          3. DAILY REWARDS & LOGIN STREAK SYSTEM (Badges & Bonus Chat Credits)
          ========================================================================= */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#FEE1BA]/20 via-[#F6D365]/12 to-[#101722] border border-amber-300/40 p-5 sm:p-6 shadow-xl space-y-4">
        {/* Card Header Label & Streak Badge */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-amber-300 uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>DAILY REWARDS SYSTEM</span>
          </div>

          {/* Login Streak Flame Pill */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/25 to-rose-500/25 border border-amber-400/40 text-xs font-black text-amber-300 shadow-sm">
            <Flame className="w-3.5 h-3.5 text-rose-400 fill-rose-400 animate-pulse" />
            <span>{dailyStreak} Day Streak</span>
          </div>
        </div>

        {/* Reward Showcase Row */}
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 via-yellow-300 to-amber-600 p-1 shrink-0 shadow-lg shadow-amber-500/30">
            <div className="w-full h-full rounded-xl bg-[#151D2A] flex items-center justify-center text-3xl font-bold">
              {currentReward.badge ? currentReward.badge.icon : '💛'}
            </div>
            {/* Status indicator badge */}
            {isTodayClaimed ? (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-[#101722] flex items-center justify-center text-white text-[10px] shadow">
                <Check className="w-3 h-3 stroke-[3]" />
              </div>
            ) : (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-400 border-2 border-[#101722] flex items-center justify-center text-slate-950 text-[10px] shadow animate-pulse">
                <Gift className="w-3 h-3" />
              </div>
            )}
          </div>

          <div className="space-y-0.5 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight font-mono">
                +{currentReward.credits} coins
              </h2>
              {currentReward.badge && (
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 truncate">
                  {currentReward.badge.name}
                </span>
              )}
            </div>

            <p className="text-xs font-semibold">
              {isTodayClaimed ? (
                <span className="text-emerald-400 flex items-center gap-1">
                  <span>Day {currentReward.day} reward claimed!</span>
                  <span className="text-slate-400 font-normal">Next reward unlocks tomorrow</span>
                </span>
              ) : (
                <span className="text-amber-300 flex items-center gap-1 font-bold">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Day {targetDayToClaim} reward ready to claim!</span>
                </span>
              )}
            </p>
          </div>
        </div>

        {/* 7-Day Stepper Node Track */}
        <div className="pt-1 pb-1">
          <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
            {DAILY_REWARD_SCHEDULE.map((dayItem) => {
              const isPastClaimed = dayItem.day < targetDayToClaim || (dayItem.day === targetDayToClaim && isTodayClaimed);
              const isCurrentDay = dayItem.day === targetDayToClaim && !isTodayClaimed;

              return (
                <div
                  key={dayItem.day}
                  onClick={() => setIsDailyRewardsOpen(true)}
                  className={`p-1 sm:p-2 rounded-xl border flex flex-col items-center justify-center cursor-pointer transition-all ${
                    isCurrentDay
                      ? 'bg-amber-400/25 border-amber-400 shadow-md shadow-amber-500/20 ring-1 ring-amber-400'
                      : isPastClaimed
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : 'bg-white/[0.03] border-white/10 opacity-70'
                  }`}
                  title={`Day ${dayItem.day}: +${dayItem.credits} coins${dayItem.badge ? ' & ' + dayItem.badge.name : ''}`}
                >
                  <span className="text-[9px] sm:text-[10px] font-extrabold text-slate-400 uppercase">
                    D{dayItem.day}
                  </span>
                  <div className="text-xs sm:text-sm my-0.5">
                    {dayItem.badge ? dayItem.badge.icon : '🪙'}
                  </div>
                  <span className={`text-[8.5px] sm:text-[9.5px] font-mono font-bold ${
                    isPastClaimed ? 'text-emerald-400' : isCurrentDay ? 'text-amber-300' : 'text-slate-400'
                  }`}>
                    {isPastClaimed ? '✓' : `+${dayItem.credits}`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Action Buttons: Claim Button or Countdown */}
        <div className="pt-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {!isTodayClaimed ? (
            <button
              onClick={() => handleClaimDailyReward()}
              className="flex-1 py-3 px-5 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:brightness-110 active:scale-95 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/30 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>
                Claim Day {targetDayToClaim} Reward (+{currentReward.credits} Coins{currentReward.badge ? ' & Badge' : ''})
              </span>
            </button>
          ) : (
            <div
              onClick={() => setIsDailyRewardsOpen(true)}
              className="flex-1 py-2.5 px-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 flex items-center justify-center gap-2 text-xs font-semibold text-white cursor-pointer transition-colors"
            >
              <Clock className="w-3.5 h-3.5 text-amber-300" />
              <span>
                Next reward in <strong className="font-mono text-amber-300">{formatCountdown(secondsRemaining)}</strong>
              </span>
            </div>
          )}

          <button
            onClick={() => setIsDailyRewardsOpen(true)}
            className="py-2.5 px-4 rounded-2xl bg-white/[0.08] hover:bg-white/[0.14] border border-white/10 text-xs font-bold text-white transition-all flex items-center justify-center gap-1.5 shrink-0"
            title="View 7-Day Rewards Calendar"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>Rewards Calendar</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          4. "VibeTalk Connect" SECTION (Matching FRND Connect + "Random 🔀" button)
          ========================================================================= */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-black tracking-tight">
            VibeTalk Connect
          </h2>

          {/* Random Speed Match Trigger */}
          <button
            onClick={() => setIsRandomMatchOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#162538] hover:bg-[#1d324d] border border-[#20D9C3]/30 text-xs font-bold text-[#20D9C3] shadow-md shadow-[#20D9C3]/10 transition-all active:scale-95"
          >
            <span>Random</span>
            <Shuffle className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Live Connect Cards (Horizontal Touch Scroll / Responsive Grid) */}
        <div className="flex items-stretch gap-4 overflow-x-auto pb-3 pt-1 no-scrollbar -mx-1 px-1">
          {profiles.slice(0, 6).map((profile, index) => {
            // Stylized gradient borders for illuminated halos matching the reference
            const haloStyles = [
              'from-[#7C5CFF] via-[#FF4F9A] to-[#20D9C3]',
              'from-[#20D9C3] via-[#7C5CFF] to-[#00BFFF]',
              'from-[#FFD700] via-[#FFA500] to-[#FF4500]',
              'from-[#FF1493] via-[#9400D3] to-[#4B0082]',
            ];
            const haloBorder = haloStyles[index % haloStyles.length];

            return (
              <div
                key={profile.id}
                className="w-40 sm:w-44 shrink-0 rounded-3xl bg-[#101722] border border-white/[0.08] p-3 flex flex-col items-center justify-between space-y-3 shadow-xl hover:border-white/20 transition-all group"
              >
                {/* Avatar with Illuminated Halo and Live Online Green Dot */}
                <div className="relative pt-2">
                  <div className={`w-20 h-20 rounded-full bg-gradient-to-tr ${haloBorder} p-[2.5px] shadow-lg shadow-[#7C5CFF]/15 group-hover:scale-105 transition-transform`}>
                    <div className="w-full h-full rounded-full overflow-hidden bg-slate-900">
                      <img
                        src={profile.avatarUrl}
                        alt={profile.displayName}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>

                  {/* Dynamic Status Dot: Green (online), Orange (busy), Grey (offline) */}
                  {(() => {
                    const friendStatus = getEffectiveStatus(profile);
                    return (
                      <div
                        className="absolute top-2 right-1 w-4 h-4 rounded-full ring-2 ring-[#101722] bg-[#101722] flex items-center justify-center shadow-sm"
                        title={`Status: ${friendStatus}`}
                      >
                        <UserStatusDot status={friendStatus} size="xs" />
                      </div>
                    );
                  })()}
                </div>

                {/* Badges: Language & Topic */}
                <div className="flex items-center gap-1">
                  <div className="px-2 py-0.5 rounded-full bg-white/10 border border-white/10 text-[10px] font-bold text-slate-200">
                    {profile.nativeLanguageScript || profile.languages[0]}
                  </div>
                  {profile.activeTopic && (
                    <div className="px-2 py-0.5 rounded-full bg-pink-500/20 border border-pink-500/30 text-[10px] font-bold text-pink-300">
                      #{profile.activeTopic}
                    </div>
                  )}
                </div>

                {/* Profile Name & Availability Text */}
                {(() => {
                  const friendStatus = getEffectiveStatus(profile);
                  return (
                    <div className="text-center space-y-0.5">
                      <span className="block text-sm font-extrabold text-white truncate max-w-[120px]">
                        {profile.displayName}
                      </span>
                      <span
                        className={`text-[10px] font-bold ${
                          friendStatus === 'busy'
                            ? 'text-amber-400'
                            : friendStatus === 'online'
                            ? 'text-emerald-400'
                            : 'text-slate-400'
                        }`}
                      >
                        {friendStatus === 'busy'
                          ? 'Busy'
                          : friendStatus === 'online'
                          ? 'Online'
                          : 'Offline'}
                      </span>
                    </div>
                  );
                })()}

                {/* Wave Gradient "Join Call" Action Button */}
                <button
                  onClick={() => startCall(profile, 'audio', profile.activeTopic)}
                  className="w-full py-2.5 px-3 rounded-2xl bg-gradient-to-r from-[#00A8FF] to-[#0080FF] hover:brightness-110 active:scale-95 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-[#0080FF]/25 transition-all"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Join Call</span>
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          5. "VibeTalk Chat" SECTION (Matching FRND Chat [New] + Rooms / Empty State)
          ========================================================================= */}
      <section className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-black tracking-tight">
              VibeChat
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 border border-emerald-500/30 text-[10px] font-extrabold uppercase">
              New
            </span>
          </div>

          <button
            onClick={() => setShowActiveRooms(!showActiveRooms)}
            className="text-xs text-black font-bold hover:underline"
          >
            {showActiveRooms ? 'Toggle Empty State' : 'Show Live Rooms'}
          </button>
        </div>

        {/* Live Audio Rooms or Empty State */}
        {!showActiveRooms ? (
          /* Empty state matching the screenshot: "No Rooms LIVE right now" */
          <div className="py-12 rounded-3xl bg-white border border-stone-200 text-center space-y-3 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-stone-100 border border-stone-200 flex items-center justify-center text-slate-800 mx-auto">
              <Radio className="w-6 h-6 text-black" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-black">No Rooms LIVE right now</h3>
              <p className="text-xs text-black font-bold max-w-xs mx-auto">
                Be the first to start a live audio lounge or talk 1-on-1 above!
              </p>
            </div>
            <button
              onClick={() => setSelectedRoom(INITIAL_LIVE_ROOMS[0])}
              className="px-4 py-2 rounded-xl bg-[#7C5CFF] text-white text-xs font-bold shadow-md shadow-[#7C5CFF]/25 hover:bg-[#6846f3] transition-colors"
            >
              Host a Room
            </button>
          </div>
        ) : (
          /* Active Live Audio Lounges */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {INITIAL_LIVE_ROOMS.map((room) => (
              <div
                key={room.id}
                onClick={() => setSelectedRoom(room)}
                className="p-4 rounded-3xl bg-[#101722]/90 hover:bg-[#162030] border border-white/[0.08] hover:border-[#7C5CFF]/40 cursor-pointer transition-all space-y-3 shadow-lg group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-bold border border-rose-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                    <span>LIVE LOUNGE</span>
                  </div>
                  <span className="text-[11px] font-mono text-[#20D9C3] flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    <span>{room.listenerCount} tuning in</span>
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white tracking-tight group-hover:text-[#20D9C3] transition-colors">
                  {room.title}
                </h3>

                {/* Speakers Preview */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center -space-x-2">
                    {room.speakers.map((spk) => (
                      <div
                        key={spk.id}
                        className="w-8 h-8 rounded-full overflow-hidden border-2 border-[#101722] bg-slate-800"
                      >
                        <img src={spk.avatarUrl} alt={spk.displayName} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>

                  <span className="text-xs font-bold text-[#7C5CFF] group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                    <span>Listen Live</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* =========================================================================
          6. MODALS: Coin Wallet, Daily Rewards, Leaderboard, Random Match, Live Audio Stage
          ========================================================================= */}
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
