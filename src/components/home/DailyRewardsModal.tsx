import React, { useState } from 'react';
import { X, Flame, Sparkles, Check, Gift, Crown, Trophy, Clock, Zap, ArrowRight, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';
import { DAILY_REWARD_SCHEDULE, DailyRewardDay } from '../../services/interestTags';
import { ProfileBadge, UserProfile } from '../../types';

interface DailyRewardsModalProps {
  isOpen: boolean;
  currentUser: UserProfile | null;
  dailyStreak: number;
  isTodayClaimed: boolean;
  secondsRemaining: number;
  onClaimReward: (dayReward: DailyRewardDay) => void;
  onSimulateNextDay?: () => void;
  onClose: () => void;
}

export const DailyRewardsModal: React.FC<DailyRewardsModalProps> = ({
  isOpen,
  currentUser,
  dailyStreak,
  isTodayClaimed,
  secondsRemaining,
  onClaimReward,
  onSimulateNextDay,
  onClose,
}) => {
  const [claimedAnimation, setClaimedAnimation] = useState<number | null>(null);

  if (!isOpen) return null;

  // Day index 1 to 7
  const currentDayCycle = ((dailyStreak - (isTodayClaimed ? 1 : 0)) % 7) + 1;
  const targetDay = isTodayClaimed ? ((dailyStreak % 7) + 1) : currentDayCycle;

  const formatCountdown = (totalSecs: number) => {
    const h = Math.floor(totalSecs / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);
    const s = totalSecs % 60;
    return `${h}h ${m}m ${s}s`;
  };

  const handleClaim = (dayReward: DailyRewardDay) => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FFD700', '#FF1493', '#7C5CFF', '#20D9C3'],
      });
    } catch {
      // Fallback safe if canvas is suppressed
    }

    setClaimedAnimation(dayReward.day);
    onClaimReward(dayReward);
    setTimeout(() => {
      setClaimedAnimation(null);
    }, 1500);
  };

  const unlockedBadges = currentUser?.unlockedBadges || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-xl rounded-3xl bg-[#0C121E] border border-amber-400/30 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-left relative">
        
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/4 right-1/4 h-32 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="relative p-5 sm:p-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-[#172133] to-[#0F1728]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-amber-500 via-yellow-300 to-amber-600 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/30">
                <Gift className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-1.5">
                  <span>Daily Rewards &amp; Badges</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 font-mono">
                    7-Day Cycle
                  </span>
                </h2>
                <p className="text-xs text-slate-400">
                  Log in every day to claim bonus chat credits &amp; exclusive profile badges
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Streak & Coin Stats Summary Banner */}
        <div className="p-4 bg-[#111929] border-b border-white/[0.06] flex flex-wrap items-center justify-between gap-3">
          {/* Current Streak */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-white shadow-md shadow-rose-500/25">
              <Flame className="w-7 h-7 fill-amber-200 text-amber-100 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-2xl font-black text-white font-mono">{dailyStreak}</span>
                <span className="text-xs font-extrabold text-amber-400 uppercase tracking-wider">
                  Day Streak
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {isTodayClaimed ? 'Today claimed! Come back tomorrow.' : 'Today ready to claim!'}
              </p>
            </div>
          </div>

          {/* Current Chat Credits & Badges Count */}
          <div className="flex items-center gap-3">
            <div className="px-3.5 py-1.5 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-2">
              <span className="text-base">🪙</span>
              <div>
                <div className="text-[10px] text-slate-400 font-bold uppercase">Balance</div>
                <div className="text-xs font-black text-white font-mono">{currentUser?.coins ?? 80} Coins</div>
              </div>
            </div>

            <div className="px-3.5 py-1.5 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-2">
              <span className="text-base">🎖️</span>
              <div>
                <div className="text-[10px] text-slate-400 font-bold uppercase">Badges</div>
                <div className="text-xs font-black text-white font-mono">{unlockedBadges.length} Earned</div>
              </div>
            </div>
          </div>
        </div>

        {/* 7-Day Rewards Calendar Track */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 no-scrollbar">
          <div className="flex items-center justify-between text-xs text-slate-300 font-bold px-1">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>7-Day Progression Track</span>
            </span>
            <span className="text-[11px] text-slate-500">
              Next Reward In: <strong className="text-amber-300 font-mono">{formatCountdown(secondsRemaining)}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {DAILY_REWARD_SCHEDULE.map((item) => {
              // Determine status
              const isPastClaimed = item.day < targetDay || (item.day === targetDay && isTodayClaimed);
              const isCurrentReady = item.day === targetDay && !isTodayClaimed;
              const isLocked = item.day > targetDay;

              return (
                <div
                  key={item.day}
                  className={`relative rounded-2xl p-4 border transition-all flex flex-col justify-between space-y-3 ${
                    isCurrentReady
                      ? 'bg-gradient-to-br from-amber-500/20 via-yellow-500/10 to-[#182338] border-amber-400 shadow-xl shadow-amber-500/20 ring-1 ring-amber-400/50'
                      : isPastClaimed
                      ? 'bg-[#101726] border-emerald-500/30 opacity-90'
                      : 'bg-[#0E1524] border-white/[0.06] opacity-75'
                  }`}
                >
                  {/* Card Top Label */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
                        isCurrentReady
                          ? 'bg-amber-400 text-slate-950 font-black'
                          : isPastClaimed
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-white/10 text-slate-400'
                      }`}>
                        Day {item.day}
                      </span>
                      {item.isGrandPrize && (
                        <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-300 text-[10px] font-black text-slate-950 uppercase flex items-center gap-0.5">
                          <Crown className="w-3 h-3" />
                          <span>Grand Prize</span>
                        </span>
                      )}
                    </div>

                    {isPastClaimed ? (
                      <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Claimed</span>
                      </div>
                    ) : isCurrentReady ? (
                      <span className="text-[11px] font-extrabold text-amber-300 uppercase tracking-wider animate-pulse flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5 text-amber-400" />
                        <span>Available Now</span>
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>Locked</span>
                      </span>
                    )}
                  </div>

                  {/* Reward Details */}
                  <div className="flex items-center gap-3 py-1">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-inner shrink-0 ${
                      item.isGrandPrize
                        ? 'bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 shadow-md shadow-amber-500/30'
                        : isCurrentReady
                        ? 'bg-amber-400/20 border border-amber-400/40'
                        : 'bg-white/5'
                    }`}>
                      {item.badge ? item.badge.icon : '🪙'}
                    </div>

                    <div className="space-y-0.5 min-w-0">
                      <div className="text-base font-black text-white font-mono flex items-center gap-1.5">
                        <span>+{item.credits} Coins</span>
                        {item.badge && (
                          <span className="text-[11px] font-bold text-amber-300">
                            + {item.badge.name}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 truncate">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  {/* Action Button for Current Day */}
                  {isCurrentReady ? (
                    <button
                      onClick={() => handleClaim(item)}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:brightness-110 active:scale-95 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/30 transition-all flex items-center justify-center gap-1.5"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Claim Day {item.day} Reward!</span>
                    </button>
                  ) : isPastClaimed ? (
                    <div className="py-2 text-center text-xs font-semibold text-emerald-400/80 bg-emerald-500/10 rounded-xl">
                      Reward Credited to Profile ✓
                    </div>
                  ) : (
                    <div className="py-2 text-center text-xs text-slate-500 bg-white/[0.02] rounded-xl flex items-center justify-center gap-1">
                      <span>Unlock on Day {item.day} login</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Unlocked Badges Showcase */}
          <div className="pt-4 border-t border-white/10 space-y-3">
            <h3 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>Your Exclusive Profile Badges ({unlockedBadges.length})</span>
            </h3>

            {unlockedBadges.length === 0 ? (
              <p className="text-xs text-slate-500 italic">
                Claim rewards on Days 2, 4, 6, and 7 to unlock exclusive badges displayed on your profile.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {unlockedBadges.map((badge) => (
                  <div
                    key={badge.id}
                    className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center gap-3"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center text-xl shrink-0">
                      {badge.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-extrabold text-white flex items-center gap-1.5">
                        <span>{badge.name}</span>
                        <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 font-bold">
                          {badge.tier || 'special'}
                        </span>
                      </div>
                      <p className="text-[10.5px] text-slate-400 truncate">
                        {badge.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer with Demo Mode Switcher */}
        <div className="p-4 border-t border-white/10 bg-[#0A0F1A] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Streaks reset if you miss more than 48 hours without login.</span>
          </div>

          <div className="flex items-center gap-2">
            {onSimulateNextDay && (
              <button
                onClick={onSimulateNextDay}
                className="px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 text-[11px] font-bold flex items-center gap-1 transition-colors"
                title="Advance streak for testing rewards"
              >
                <span>Advance 1 Day (Demo)</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition-colors"
            >
              Done
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
