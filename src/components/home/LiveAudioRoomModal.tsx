import React, { useState } from 'react';
import {
  X,
  Volume2,
  Mic,
  MicOff,
  Hand,
  Users,
  LogOut,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { LiveAudioRoom } from '../../types';

interface LiveAudioRoomModalProps {
  room: LiveAudioRoom | null;
  isOpen: boolean;
  onClose: () => void;
}

export const LiveAudioRoomModal: React.FC<LiveAudioRoomModalProps> = ({ room, isOpen, onClose }) => {
  const [isMuted, setIsMuted] = useState(true);
  const [handRaised, setHandRaised] = useState(false);

  if (!isOpen || !room) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-2xl p-4 overflow-y-auto text-left">
      <div className="w-full max-w-lg rounded-3xl bg-[#0D1420] border border-[#7C5CFF]/30 p-6 shadow-2xl relative space-y-6">
        
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FF4F9A]/20 text-[#FF4F9A] border border-[#FF4F9A]/30">
                LIVE STAGE
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                <Users className="w-3.5 h-3.5" />
                <span>{room.listenerCount} listeners</span>
              </span>
            </div>
            <h2 className="text-base font-bold text-white tracking-tight">{room.title}</h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stage Speakers Grid */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            Speakers on Stage
          </span>

          <div className="grid grid-cols-3 gap-3">
            {room.speakers.map((speaker, idx) => (
              <div
                key={speaker.id}
                className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 flex flex-col items-center text-center space-y-1.5 relative group"
              >
                {/* Glowing voice ring for active speaker */}
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-[#20D9C3] bg-slate-900 shadow-lg shadow-[#20D9C3]/20">
                    <img
                      src={speaker.avatarUrl}
                      alt={speaker.displayName}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  {idx === 0 && (
                    <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-[#7C5CFF] text-white">
                      Host
                    </span>
                  )}
                  {/* Speaking sound indicator */}
                  <div className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-[#20D9C3] animate-pulse" />
                </div>

                <span className="text-xs font-bold text-white truncate max-w-full">
                  {speaker.displayName}
                </span>
                <span className="text-[10px] text-slate-400">
                  {speaker.nativeLanguageScript || speaker.country}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Listeners Preview Bar */}
        <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-[#20D9C3]" />
            <span>You are listening as an audience member</span>
          </div>
          <span className="font-mono text-[#20D9C3]">HD Spatial Audio</span>
        </div>

        {/* Bottom Control Actions */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => setHandRaised(!handRaised)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
              handRaised
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'bg-white/10 hover:bg-white/15 text-white'
            }`}
          >
            <Hand className="w-4 h-4" />
            <span>{handRaised ? 'Hand Raised ✋' : 'Raise Hand to Speak'}</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Leave Quietly</span>
          </button>
        </div>
      </div>
    </div>
  );
};
