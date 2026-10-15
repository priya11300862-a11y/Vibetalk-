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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-5 space-y-5 text-left text-[#303641]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#303641] tracking-tight">Call History</h1>
          <p className="text-xs text-[#7B8492] mt-0.5">
            Encrypted WebRTC call logs. Media streams are never saved or recorded.
          </p>
        </div>

        {callHistory.length > 0 && (
          <button
            onClick={clearCallHistory}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-rose-50 text-[#7B8492] hover:text-[#D9485F] text-xs font-medium border border-[#E1E5EC] transition-colors shadow-xs"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Logs</span>
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => setFilterType('all')}
          className={`px-3 py-1.5 rounded-full text-xs transition-colors ${
            filterType === 'all'
              ? 'bg-[#EAF2FF] text-[#1877F2] font-semibold border border-[#1877F2]/30'
              : 'bg-white text-[#7B8492] border border-[#E1E5EC] hover:bg-[#F5F7FC]'
          }`}
        >
          All Calls ({callHistory.length})
        </button>
        <button
          onClick={() => setFilterType('missed')}
          className={`px-3 py-1.5 rounded-full text-xs transition-colors ${
            filterType === 'missed'
              ? 'bg-[#EAF2FF] text-[#1877F2] font-semibold border border-[#1877F2]/30'
              : 'bg-white text-[#7B8492] border border-[#E1E5EC] hover:bg-[#F5F7FC]'
          }`}
        >
          Missed ({callHistory.filter((c) => c.direction === 'missed').length})
        </button>
      </div>

      {/* Call List */}
      {filteredHistory.length === 0 ? (
        <div className="py-16 text-center space-y-3 bg-white rounded-xl border border-[#E1E5EC] shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-[#EAF2FF] text-[#1877F2] flex items-center justify-center mx-auto">
            <PhoneCall className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-[#303641]">Your call history will appear here.</p>
          <p className="text-xs text-[#7B8492] max-w-sm mx-auto">
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
                className="p-3.5 rounded-xl bg-white border border-[#E1E5EC] hover:border-[#CBD5E1] shadow-xs flex items-center justify-between gap-4 transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-[#E1E5EC] shrink-0 bg-slate-100">
                    <img
                      src={item.otherUser.avatarUrl}
                      alt={item.otherUser.displayName}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#303641] truncate">
                        {item.otherUser.displayName}
                      </span>
                      <span className="text-[10px] text-[#7B8492] font-mono">
                        {item.timestamp}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] text-[#7B8492] mt-0.5">
                      {isMissed ? (
                        <>
                          <PhoneMissed className="w-3.5 h-3.5 text-[#D9485F]" />
                          <span className="text-[#D9485F] font-semibold">Missed Call</span>
                        </>
                      ) : isIncoming ? (
                        <>
                          <PhoneIncoming className="w-3.5 h-3.5 text-[#16865C]" />
                          <span>Incoming Call</span>
                          <span>·</span>
                          <span className="font-mono">
                            {Math.floor(item.durationSeconds / 60)}m {item.durationSeconds % 60}s
                          </span>
                        </>
                      ) : (
                        <>
                          <PhoneOutgoing className="w-3.5 h-3.5 text-[#1877F2]" />
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

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleCallBack(item.otherUser, 'audio')}
                    className="p-2 rounded-lg border border-[#E1E5EC] bg-white hover:bg-[#EAF2FF] text-[#1877F2] transition-colors"
                    title="Audio Callback"
                    aria-label="Audio Callback"
                  >
                    <PhoneCall className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleCallBack(item.otherUser, 'video')}
                    className="p-2 rounded-lg border border-[#E1E5EC] bg-white hover:bg-[#EAF2FF] text-[#1877F2] transition-colors"
                    title="Video Callback"
                    aria-label="Video Callback"
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
