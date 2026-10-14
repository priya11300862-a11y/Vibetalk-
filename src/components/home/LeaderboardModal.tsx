import React, { useState } from 'react';
import { X, Trophy, Flame, Crown, Award, Sparkles, CheckCircle2 } from 'lucide-react';
import { INITIAL_DISCOVER_PROFILES } from '../../services/mockData';
import { UserStatusDot, getEffectiveStatus } from '../common/UserStatusBadge';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ isOpen, onClose }) => {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'alltime'>('daily');

  if (!isOpen) return null;

  const leaders = [
    {
      rank: 1,
      profile: INITIAL_DISCOVER_PROFILES[0], // Nancy
      talkTimeHours: 18.4,
      points: '9,840',
      badge: 'Gold Champion',
    },
    {
      rank: 2,
      profile: INITIAL_DISCOVER_PROFILES[1], // Rakhi
      talkTimeHours: 15.2,
      points: '8,210',
      badge: 'Silver Champion',
    },
    {
      rank: 3,
      profile: INITIAL_DISCOVER_PROFILES[2], // Vichu
      talkTimeHours: 13.9,
      points: '7,450',
      badge: 'Bronze Champion',
    },
    {
      rank: 4,
      profile: INITIAL_DISCOVER_PROFILES[3], // Clara
      talkTimeHours: 11.1,
      points: '6,100',
      badge: 'Elite Talker',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto text-left">
      <div className="w-full max-w-md rounded-3xl bg-[#0F1622] border border-amber-500/30 p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Top Champions</h2>
            <p className="text-xs text-slate-400">Most active conversation partners on VibeTalk</p>
          </div>
        </div>

        {/* Period Selector Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/40 border border-white/5 mb-5 text-xs font-semibold">
          <button
            onClick={() => setPeriod('daily')}
            className={`flex-1 py-1.5 rounded-lg text-center transition-colors ${
              period === 'daily' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setPeriod('weekly')}
            className={`flex-1 py-1.5 rounded-lg text-center transition-colors ${
              period === 'weekly' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            This Week
          </button>
          <button
            onClick={() => setPeriod('alltime')}
            className={`flex-1 py-1.5 rounded-lg text-center transition-colors ${
              period === 'alltime' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            All-Time
          </button>
        </div>

        {/* Podium / Leader List */}
        <div className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1">
          {leaders.map((leader) => (
            <div
              key={leader.profile.id}
              className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${
                leader.rank === 1
                  ? 'bg-amber-500/10 border-amber-500/40'
                  : 'bg-white/[0.02] border-white/5'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className={`w-6 text-center font-black font-mono text-sm ${
                    leader.rank === 1
                      ? 'text-amber-400'
                      : leader.rank === 2
                      ? 'text-slate-300'
                      : leader.rank === 3
                      ? 'text-amber-600'
                      : 'text-slate-500'
                  }`}
                >
                  #{leader.rank}
                </span>

                <div className="relative w-11 h-11 rounded-2xl overflow-hidden border border-white/10 shrink-0 bg-slate-800">
                  <img
                    src={leader.profile.avatarUrl}
                    alt={leader.profile.displayName}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  {(() => {
                    const lStatus = getEffectiveStatus(leader.profile);
                    return (
                      <div
                        className="absolute bottom-1 right-1 w-3 h-3 rounded-full bg-slate-900 ring-1 ring-slate-900 flex items-center justify-center"
                        title={`Status: ${lStatus}`}
                      >
                        <UserStatusDot status={lStatus} size="xs" />
                      </div>
                    );
                  })()}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white truncate">
                      {leader.profile.displayName}
                    </span>
                    {leader.rank === 1 && <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                  </div>
                  <span className="text-[10px] text-slate-400 block truncate">
                    {leader.badge} · {leader.profile.nativeLanguageScript || leader.profile.country}
                  </span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-xs font-bold text-amber-400 font-mono block">
                  {leader.points} pts
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {leader.talkTimeHours} hrs talk
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 p-3 rounded-2xl bg-white/[0.02] border border-white/5 text-[11px] text-slate-400 text-center">
          Top 3 Champions receive <strong>500 Bonus Coins</strong> every midnight!
        </div>
      </div>
    </div>
  );
};
