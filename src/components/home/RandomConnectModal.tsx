import React, { useState, useEffect } from 'react';
import { X, Shuffle, PhoneCall, Video, Sparkles, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { INITIAL_DISCOVER_PROFILES } from '../../services/mockData';
import { useCall } from '../../contexts/CallContext';
import { UserProfile } from '../../types';
import { UserStatusDot, getEffectiveStatus } from '../common/UserStatusBadge';

interface RandomConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RandomConnectModal: React.FC<RandomConnectModalProps> = ({ isOpen, onClose }) => {
  const { startCall } = useCall();
  const [matchingStep, setMatchingStep] = useState<'searching' | 'matched'>('searching');
  const [matchedProfile, setMatchedProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (isOpen) {
      setMatchingStep('searching');
      // Simulate random radar search
      const timer = setTimeout(() => {
        const randomIndex = Math.floor(Math.random() * INITIAL_DISCOVER_PROFILES.length);
        setMatchedProfile(INITIAL_DISCOVER_PROFILES[randomIndex]);
        setMatchingStep('matched');
      }, 2200);

      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleStartCall = async () => {
    if (matchedProfile) {
      onClose();
      await startCall(matchedProfile, 'audio');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-2xl p-4 overflow-y-auto text-left">
      <div className="w-full max-w-sm rounded-3xl bg-[#0F1622] border border-[#20D9C3]/40 p-6 shadow-2xl relative text-center space-y-6">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#20D9C3]/15 text-[#20D9C3] text-xs font-bold uppercase tracking-wider">
            <Shuffle className="w-3.5 h-3.5" />
            <span>Random Speed Connect</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">Instant 1-on-1 Voice Match</h2>
        </div>

        {matchingStep === 'searching' ? (
          <div className="py-8 space-y-6">
            {/* Animated Radar Pulse */}
            <div className="relative w-32 h-32 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border border-[#20D9C3]/30 animate-ping" />
              <div className="absolute inset-2 rounded-full border-2 border-[#7C5CFF]/40 animate-pulse" />
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#7C5CFF] to-[#20D9C3] p-1 shadow-xl shadow-[#20D9C3]/30 flex items-center justify-center">
                <Shuffle className="w-8 h-8 text-white animate-spin" style={{ animationDuration: '3s' }} />
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-sm font-semibold text-white">Scanning verified online members...</p>
              <p className="text-xs text-slate-400">Matching language preference and vibe</p>
            </div>
          </div>
        ) : (
          matchedProfile && (
            <div className="py-2 space-y-5">
              <div className="relative w-28 h-28 mx-auto rounded-3xl overflow-hidden border-2 border-[#20D9C3] p-1 bg-slate-900 shadow-2xl shadow-[#20D9C3]/20">
                <img
                  src={matchedProfile.avatarUrl}
                  alt={matchedProfile.displayName}
                  className="w-full h-full object-cover rounded-2xl"
                  referrerPolicy="no-referrer"
                />
                {/* Dynamic Status Dot: green online, orange busy, grey offline */}
                {(() => {
                  const mStatus = getEffectiveStatus(matchedProfile);
                  return (
                    <div
                      className="absolute bottom-2 right-2 w-4 h-4 rounded-full ring-2 ring-[#0F1622] bg-[#0F1622] flex items-center justify-center"
                      title={`Status: ${mStatus}`}
                    >
                      <UserStatusDot status={mStatus} size="xs" />
                    </div>
                  );
                })()}
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-center gap-1.5">
                  <h3 className="text-lg font-bold text-white">{matchedProfile.displayName}</h3>
                  <CheckCircle2 className="w-4 h-4 text-[#20D9C3]" />
                  {matchedProfile.activeTopic && (
                    <span className="px-2 py-0.5 rounded-full bg-pink-500/25 border border-pink-400/40 text-pink-300 text-[10px] font-extrabold">
                      #{matchedProfile.activeTopic}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-center gap-1.5 text-xs text-slate-300">
                  <span className="px-2 py-0.5 rounded-md bg-white/10 text-[#20D9C3] font-bold">
                    {matchedProfile.nativeLanguageScript || matchedProfile.languages[0]}
                  </span>
                  <span>·</span>
                  <span>{matchedProfile.age} yrs</span>
                  <span>·</span>
                  <span>{matchedProfile.broadLocation}</span>
                </div>
                <p className="text-xs text-slate-400 line-clamp-2 px-4 mt-2">
                  &quot;{matchedProfile.bio}&quot;
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={handleStartCall}
                  className="py-3 rounded-2xl bg-gradient-to-b from-[#00F5D4] to-[#0077B6] hover:brightness-105 border-t border-cyan-100 shadow-[0_4px_0_#004C99] active:translate-y-1 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 transition-all"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>Voice Call</span>
                </button>
                <button
                  onClick={async () => {
                    if (matchedProfile) {
                      onClose();
                      await startCall(matchedProfile, 'video');
                    }
                  }}
                  className="py-3 rounded-2xl bg-gradient-to-b from-[#F72585] to-[#7209B7] hover:brightness-105 border-t border-pink-100 shadow-[0_4px_0_#480CA8] active:translate-y-1 text-white font-black text-xs flex items-center justify-center gap-1.5 transition-all"
                >
                  <Video className="w-4 h-4" />
                  <span>Video Call</span>
                </button>
              </div>
            </div>
          )
        )}

        <div className="pt-2 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-[#20D9C3]" />
          <span>Encrypted Peer WebRTC · 18+ Adults Only</span>
        </div>
      </div>
    </div>
  );
};
