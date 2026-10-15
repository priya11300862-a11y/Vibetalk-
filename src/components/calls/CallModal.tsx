import React, { useRef, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  PhoneOff,
  Volume2,
  VolumeX,
  RefreshCw,
  Shield,
  Wifi,
  Sparkles,
  Maximize2,
} from 'lucide-react';
import { useCall } from '../../contexts/CallContext';
import { UserStatusDot, getEffectiveStatus } from '../common/UserStatusBadge';

export const CallModal: React.FC = () => {
  const {
    activeCall,
    localStream,
    isPermissionRequested,
    permissionError,
    endCall,
    toggleMute,
    toggleVideo,
    flipCamera,
    toggleSpeaker,
  } = useCall();

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  // Bind local stream to video element
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream, activeCall?.isVideoEnabled]);

  if (!activeCall) return null;

  const isVideo = activeCall.callType === 'video';
  const isConnected = activeCall.status === 'connected';
  const receiverStatus = getEffectiveStatus(activeCall.receiver);
  const connectedTopicTag = activeCall.connectedTopic || activeCall.receiver.activeTopic || 'Usual';

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-2xl p-2 sm:p-4 select-none">
      <div className="relative w-full max-w-4xl h-full max-h-[850px] rounded-2xl bg-[#0F141A] border border-white/10 overflow-hidden shadow-2xl flex flex-col justify-between">
        
        {/* Top Header Floating Bar */}
        <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between text-xs">
          {/* Quality Indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white">
            <Wifi className="w-3.5 h-3.5 text-[#20D9C3]" />
            <span className="capitalize">{activeCall.quality} Quality</span>
            <span className="text-slate-500">·</span>
            <span className="font-mono text-[#20D9C3]">
              {isConnected ? formatTime(activeCall.durationSeconds) : activeCall.status}
            </span>
          </div>

          {/* Privacy badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-slate-300">
            <Shield className="w-3.5 h-3.5 text-[#7C5CFF]" />
            <span className="text-[11px]">Peer WebRTC · Not Recorded</span>
          </div>
        </div>

        {/* Video Mode: Remote Fullscreen & Local PiP */}
        {isVideo ? (
          <div className="relative flex-1 w-full h-full bg-slate-950 flex items-center justify-center overflow-hidden">
            {/* Simulated Remote Video Stream */}
            <div className="relative w-full h-full flex items-center justify-center">
              <img
                src={activeCall.receiver.avatarUrl}
                alt={activeCall.receiver.displayName}
                className="w-full h-full object-cover filter brightness-90"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />
            </div>

            {/* Video Connected User Tag Badge */}
            <div className="absolute top-16 left-4 sm:left-6 z-20 flex flex-col items-start gap-1.5">
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-black/80 backdrop-blur-md border border-white/20 text-white shadow-xl">
                {/* Dynamic Status Dot: green online, orange busy, grey offline */}
                <UserStatusDot status={receiverStatus} size="sm" />
                <span className="font-bold text-xs sm:text-sm">{activeCall.receiver.displayName}</span>
                <span className="text-[10px] text-slate-300 font-semibold">
                  ({receiverStatus === 'online' ? 'Online' : receiverStatus === 'busy' ? 'Busy' : 'Offline'})
                </span>

                {/* Simple User Connection Tag */}
                <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-pink-500/30 to-purple-500/30 border border-pink-400/50 text-pink-300 text-[11px] font-black flex items-center gap-1 shadow-sm">
                  <Sparkles className="w-3 h-3 text-pink-400" />
                  <span>Tag: #{connectedTopicTag}</span>
                </span>
              </div>
            </div>

            {/* Local Video Floating Picture-in-Picture Card */}
            {activeCall.isVideoEnabled && (
              <div className="absolute bottom-24 right-4 sm:bottom-28 sm:right-6 w-32 h-44 sm:w-40 sm:h-56 rounded-2xl overflow-hidden border-2 border-white/20 bg-slate-900 shadow-2xl z-20">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${activeCall.isFrontCamera ? 'scale-x-[-1]' : ''}`}
                />
                <div className="absolute bottom-1.5 left-2 text-[10px] text-white/80 font-medium drop-shadow">
                  You
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Voice Call Mode: Luxury Audio Visualizer & Large Avatar */
          <div className="relative flex-1 flex flex-col items-center justify-center p-8 space-y-5 text-center z-10">
            {/* Ambient Audio Halo */}
            <div className="relative">
              <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-full overflow-hidden border-2 border-[#7C5CFF]/60 shadow-2xl relative z-10 bg-slate-900">
                <img
                  src={activeCall.receiver.avatarUrl}
                  alt={activeCall.receiver.displayName}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Status dot on avatar edge: green online, orange busy, grey offline */}
              <div
                className="absolute bottom-2 right-2 z-20 w-7 h-7 rounded-full border-2 border-[#1C0518] bg-[#1C0518] flex items-center justify-center shadow-lg"
                title={`Status: ${receiverStatus === 'online' ? 'Online' : receiverStatus === 'busy' ? 'Busy' : 'Offline'}`}
              >
                <UserStatusDot status={receiverStatus} size="sm" />
              </div>

              {/* Pulsing ring waves if ringing or connected */}
              {isConnected ? (
                <div className="absolute inset-0 -m-4 rounded-full border border-[#20D9C3]/40 animate-call-ring" />
              ) : (
                <div className="absolute inset-0 -m-4 rounded-full border border-[#7C5CFF]/40 animate-ping" />
              )}
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white tracking-tight flex items-center justify-center gap-2">
                <span>{activeCall.receiver.displayName}</span>
              </h2>

              {/* Connected User Topic Tag & Status Badges */}
              <div className="flex flex-wrap items-center justify-center gap-2 pt-0.5">
                {/* Simple User Connection Tag */}
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-pink-500/25 via-purple-500/25 to-cyan-500/25 border border-pink-400/50 text-pink-200 text-xs font-black shadow-md">
                  <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                  <span>Tag: #{connectedTopicTag}</span>
                </div>

                {/* Dynamic Status Pill: Green (Online), Orange (Busy), Grey (Offline) */}
                <div
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                    receiverStatus === 'online'
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                      : receiverStatus === 'busy'
                      ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                      : 'bg-slate-500/15 border-slate-500/40 text-slate-300'
                  }`}
                >
                  <UserStatusDot status={receiverStatus} size="xs" />
                  <span>{receiverStatus === 'online' ? 'Online' : receiverStatus === 'busy' ? 'Busy' : 'Offline'}</span>
                </div>
              </div>

              <p className="text-xs text-slate-400 capitalize">
                {isConnected ? 'Voice Call in Progress' : activeCall.status + '...'}
              </p>
            </div>

            {/* Interactive Audio Waveform Bars */}
            {isConnected && (
              <div className="flex items-center gap-1.5 h-12 pt-2">
                {[16, 28, 42, 22, 35, 48, 20, 30, 44, 26, 38, 18].map((h, i) => (
                  <span
                    key={i}
                    style={{ animationDelay: `${i * 0.1}s` }}
                    className="w-1.5 rounded-full bg-gradient-to-t from-[#7C5CFF] to-[#20D9C3] animate-audio-bar"
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Floating Call Controls Bar */}
        <div className="relative z-20 pb-8 pt-4 px-6 flex items-center justify-center gap-4 bg-gradient-to-t from-[#070B12] via-[#070B12]/80 to-transparent">
          {/* Mute Button */}
          <button
            onClick={toggleMute}
            className={`p-4 rounded-full transition-all ${
              activeCall.isMuted
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
            title={activeCall.isMuted ? 'Unmute' : 'Mute'}
          >
            {activeCall.isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Video Toggle Button (for video calls) */}
          {isVideo && (
            <button
              onClick={toggleVideo}
              className={`p-4 rounded-full transition-all ${
                !activeCall.isVideoEnabled
                  ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
              title={activeCall.isVideoEnabled ? 'Disable Camera' : 'Enable Camera'}
            >
              {!activeCall.isVideoEnabled ? <VideoOff className="w-5 h-5" /> : <VideoIcon className="w-5 h-5" />}
            </button>
          )}

          {/* Flip Camera */}
          {isVideo && (
            <button
              onClick={flipCamera}
              className="p-4 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
              title="Flip Camera"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          )}

          {/* Speaker Button */}
          <button
            onClick={toggleSpeaker}
            className="p-4 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
            title={activeCall.isSpeakerOn ? 'Speaker Off' : 'Speaker On'}
          >
            {activeCall.isSpeakerOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>

          {/* End Call Button */}
          <button
            onClick={endCall}
            className="p-4 rounded-full bg-rose-600 hover:bg-rose-700 text-white shadow-xl shadow-rose-600/40 transition-transform active:scale-95"
            title="End Call"
          >
            <PhoneOff className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};
