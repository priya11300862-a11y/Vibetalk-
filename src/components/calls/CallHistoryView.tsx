import React, { useState } from 'react';
import {
  PhoneCall,
  Video,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  Trash2,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { useCall } from '../../contexts/CallContext';
import { CallType, UserProfile } from '../../types';

export const CallHistoryView: React.FC = () => {
  const { callHistory, startCall, clearCallHistory } = useCall();
  const [filterType, setFilterType] = useState<'all' | 'missed'>('all');

  const filteredHistory = callHistory.filter((item) => {
    if (filterType === 'missed') return item.direction === 'missed';
    return true;
  });

  const handleCallBack = async (user: UserProfile, type: CallType) => {
    await startCall(user, type);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6 text-left text-black font-bold">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Call History</h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Encrypted WebRTC call logs. Media streams are never saved or recorded.
          </p>
        </div>

        {callHistory.length > 0 && (
          <button
            onClick={clearCallHistory}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-600 text-xs font-medium border border-stone-200 transition-colors shadow-xs"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Logs</span>
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 p-1 rounded-xl bg-white border border-stone-200 shadow-xs w-fit">
        <button
          onClick={() => setFilterType('all')}
          className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
            filterType === 'all' ? 'bg-[#FF4F9A] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          All Calls ({callHistory.length})
        </button>
        <button
          onClick={() => setFilterType('missed')}
          className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
            filterType === 'missed' ? 'bg-[#FF4F9A] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Missed ({callHistory.filter((c) => c.direction === 'missed').length})
        </button>
      </div>

      {/* Call List */}
      {filteredHistory.length === 0 ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-white border border-stone-200 shadow-xs flex items-center justify-center text-slate-400 mx-auto">
            <PhoneCall className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-slate-700">Your call history will appear here.</p>
          <p className="text-xs text-slate-500">
            Make your first voice or video call directly from Discover or Messages.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredHistory.map((item) => {
            const isMissed = item.direction === 'missed';
            const isIncoming = item.direction === 'incoming';

            return (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-white/95 border border-stone-200/90 hover:border-pink-300 shadow-xs flex items-center justify-between gap-4 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-xl overflow-hidden border border-stone-200 shrink-0 bg-slate-100">
                    <img
                      src={item.otherUser.avatarUrl}
                      alt={item.otherUser.displayName}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {item.otherUser.displayName}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {item.timestamp}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-1">
                      {isMissed ? (
                        <>
                          <PhoneMissed className="w-3.5 h-3.5 text-rose-400" />
                          <span className="text-rose-400 font-medium">Missed Call</span>
                        </>
                      ) : isIncoming ? (
                        <>
                          <PhoneIncoming className="w-3.5 h-3.5 text-[#20D9C3]" />
                          <span>Incoming Call</span>
                          <span>·</span>
                          <span className="font-mono">
                            {Math.floor(item.durationSeconds / 60)}m {item.durationSeconds % 60}s
                          </span>
                        </>
                      ) : (
                        <>
                          <PhoneOutgoing className="w-3.5 h-3.5 text-[#7C5CFF]" />
                          <span>Outgoing Call</span>
                          <span>·</span>
                          <span className="font-mono">
                            {Math.floor(item.durationSeconds / 60)}m {item.durationSeconds % 60}s
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleCallBack(item.otherUser, 'audio')}
                    className="p-2 rounded-xl bg-white/[0.04] hover:bg-[#7C5CFF]/20 text-slate-300 hover:text-[#7C5CFF] transition-colors"
                    title="Audio Callback"
                  >
                    <PhoneCall className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleCallBack(item.otherUser, 'video')}
                    className="p-2 rounded-xl bg-white/[0.04] hover:bg-[#20D9C3]/20 text-slate-300 hover:text-[#20D9C3] transition-colors"
                    title="Video Callback"
                  >
                    <Video className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
