import React, { useState } from 'react';
import { Flame, Sparkles, Check, Calendar, Trophy, Zap, Info, ShieldCheck } from 'lucide-react';

interface DailyActiveStreakCounterProps {
  streak?: number;
  userName?: string;
  isOwnProfile?: boolean;
  className?: string;
}

export const DailyActiveStreakCounter: React.FC<DailyActiveStreakCounterProps> = ({
  streak = 5,
  userName = 'Member',
  isOwnProfile = false,
  className = '',
}) => {
  const [showInfo, setShowInfo] = useState(false);

  // Normalize streak count
  const activeStreak = Math.max(1, streak);
  
  // Weekly 7-day progress cycle (1 through 7)
  const currentCycleDay = ((activeStreak - 1) % 7) + 1;

  const daysOfWeek = [
    { day: 1, label: 'Day 1', reward: '+10 🪙' },
    { day: 2, label: 'Day 2', reward: '+15 🪙' },
    { day: 3, label: 'Day 3', reward: '+20 🪙' },
    { day: 4, label: 'Day 4', reward: '+25 🪙' },
    { day: 5, label: 'Day 5', reward: '+30 🪙' },
    { day: 6, label: 'Day 6', reward: '+40 🪙' },
    { day: 7, label: 'Day 7', reward: '+50 🪙' },
  ];

  const milestones = [
    { days: 3, label: 'Active Spark', icon: '⚡', unlocked: activeStreak >= 3 },
    { days: 7, label: 'Fire Champion', icon: '🔥', unlocked: activeStreak >= 7 },
    { days: 14, label: 'Cosmic Blaze', icon: '🌟', unlocked: activeStreak >= 14 },
    { days: 30, label: 'Streak Legend', icon: '👑', unlocked: activeStreak >= 30 },
  ];

  return (
    <div
      className={`rounded-2xl border border-[#E1E5EC] bg-white p-4 sm:p-5 shadow-xs space-y-4 font-sans ${className}`}
      aria-label="Daily Active Streak Counter"
    >
      {/* Header: Fire Icon Badge & Title */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Animated Glowing Fire Icon Component */}
          <div className="relative flex items-center justify-center">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-red-500 flex items-center justify-center text-white shadow-md shadow-orange-500/25 ring-4 ring-orange-100 animate-pulse">
              <Flame className="w-7 h-7 fill-white stroke-orange-600 drop-shadow" />
            </div>
            {/* Small fire spark badge */}
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-yellow-400 border-2 border-white flex items-center justify-center text-[9px] font-black text-amber-900 shadow-2xs">
              ⚡
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-[#303641] tracking-tight">
                Daily Active Streak
              </h3>
              <span className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-2xs">
                <Flame className="w-3 h-3 fill-white" />
                <span>On Fire!</span>
              </span>
            </div>
            <p className="text-xs text-[#7B8492]">
              {isOwnProfile
                ? 'Your consecutive login streak on VibeTalk'
                : `${userName} has been active for ${activeStreak} consecutive days`}
            </p>
          </div>
        </div>

        {/* Info Toggle Button */}
        <button
          type="button"
          onClick={() => setShowInfo(!showInfo)}
          className="p-1.5 rounded-lg border border-[#E1E5EC] bg-[#F5F7FC] hover:bg-[#EAF2FF] text-[#7B8492] hover:text-[#1877F2] transition-colors"
          title="How Daily Active Streak works"
          aria-label="Streak information"
        >
          <Info className="w-4 h-4" />
        </button>
      </div>

      {/* Streak Big Display & Status Banner */}
      <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-rose-50 border border-orange-200/80 rounded-xl p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl sm:text-4xl font-extrabold text-orange-600 font-mono tracking-tight flex items-center gap-1">
            <Flame className="w-8 h-8 fill-orange-500 text-orange-600 inline" />
            <span>{activeStreak}</span>
          </span>
          <span className="text-sm sm:text-base font-bold text-[#303641]">
            Consecutive Days Logged In
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-orange-800 bg-white/80 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-orange-200 shrink-0">
          <ShieldCheck className="w-4 h-4 text-[#16865C]" />
          <span>Active Today · Safe Streak</span>
        </div>
      </div>

      {/* 7-Day Visual Progress Track */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between text-xs font-bold text-[#7B8492]">
          <span className="flex items-center gap-1.5 text-[#303641]">
            <Calendar className="w-3.5 h-3.5 text-[#1877F2]" />
            <span>7-Day Cycle Progress (Day {currentCycleDay} of 7)</span>
          </span>
          <span className="text-[#16865C] font-semibold">
            {currentCycleDay === 7 ? '🎉 Weekly Goal Complete!' : `${7 - currentCycleDay} days until Mega Bonus`}
          </span>
        </div>

        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {daysOfWeek.map((d) => {
            const isCompleted = d.day < currentCycleDay;
            const isCurrent = d.day === currentCycleDay;
            const isUpcoming = d.day > currentCycleDay;

            return (
              <div
                key={`streak-day-${d.day}`}
                className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all ${
                  isCurrent
                    ? 'bg-gradient-to-b from-orange-500 to-amber-500 border-orange-400 text-white shadow-sm ring-2 ring-orange-200 scale-105 z-10'
                    : isCompleted
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-[#F5F7FC] border-[#E1E5EC] text-[#7B8492]'
                }`}
              >
                {/* Status Icon */}
                <div className="mb-1">
                  {isCurrent ? (
                    <Flame className="w-5 h-5 fill-white text-yellow-300 animate-bounce" />
                  ) : isCompleted ? (
                    <div className="w-5 h-5 rounded-full bg-[#16865C] flex items-center justify-center text-white">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  ) : (
                    <Flame className="w-4 h-4 text-slate-300" />
                  )}
                </div>

                <span
                  className={`text-[11px] font-bold ${
                    isCurrent ? 'text-white' : isCompleted ? 'text-[#16865C]' : 'text-[#7B8492]'
                  }`}
                >
                  {d.label}
                </span>

                <span
                  className={`text-[10px] font-semibold mt-0.5 ${
                    isCurrent ? 'text-amber-100 font-bold' : isCompleted ? 'text-emerald-700' : 'text-slate-400'
                  }`}
                >
                  {d.reward}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Streak Milestones Row */}
      <div className="pt-2 border-t border-[#E1E5EC]">
        <div className="flex items-center justify-between text-xs font-bold text-[#7B8492] mb-2">
          <span className="flex items-center gap-1.5 text-[#303641]">
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            <span>Streak Milestones</span>
          </span>
          <span className="text-xs text-[#1877F2] font-semibold">
            {activeStreak >= 30 ? 'All Unlocked' : 'Keep Daily Streak'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {milestones.map((m) => (
            <div
              key={m.label}
              className={`p-2 rounded-lg border text-xs flex items-center gap-2 ${
                m.unlocked
                  ? 'bg-amber-50 border-amber-300 text-amber-900 font-semibold'
                  : 'bg-[#F5F7FC] border-[#E1E5EC] text-[#7B8492] opacity-70'
              }`}
            >
              <span className="text-base">{m.icon}</span>
              <div className="min-w-0">
                <div className="font-bold truncate text-[11px] sm:text-xs">{m.label}</div>
                <div className="text-[10px] text-[#7B8492]">{m.days} Days</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Motivational Bottom Bar */}
      <div className="flex items-center justify-between text-xs pt-1 text-[#303641]">
        <span className="flex items-center gap-1 text-[#F28C28] font-bold">
          <Zap className="w-3.5 h-3.5 fill-[#F28C28]" />
          <span>Active Streak Multiplier: 1.5x Coins</span>
        </span>
        <span className="text-xs text-[#7B8492]">
          Log in tomorrow to reach <strong className="text-orange-600 font-bold">{activeStreak + 1} Days</strong>!
        </span>
      </div>

      {/* Explanatory Dropdown */}
      {showInfo && (
        <div className="p-3 bg-[#EAF2FF] border border-[#1877F2]/30 rounded-xl text-xs text-[#303641] space-y-1.5 animate-in fade-in">
          <p className="font-bold text-[#1877F2]">🔥 How Daily Active Streak Works:</p>
          <ul className="list-disc pl-4 space-y-1 text-[#303641]">
            <li>Log into VibeTalk every day to increment your active streak counter by 1.</li>
            <li>Consecutive daily logins unlock bonus coin rewards, profile flame badges, and audio chat boosts.</li>
            <li>If you miss a day, the streak resets to Day 1, so remember to visit every 24 hours to keep your flame burning!</li>
          </ul>
        </div>
      )}
    </div>
  );
};
