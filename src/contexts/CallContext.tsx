import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { UserProfile, CallSession, CallType, CallStatus, ConnectionQuality, CallHistoryItem } from '../types';
import { INITIAL_CALL_HISTORY } from '../services/mockData';

interface CallContextType {
  activeCall: CallSession | null;
  callHistory: CallHistoryItem[];
  localStream: MediaStream | null;
  isPermissionRequested: boolean;
  permissionError: string | null;
  hasMediaPermissions: boolean;
  startCall: (targetUser: UserProfile, type: CallType, topic?: string) => Promise<void>;
  acceptCall: () => Promise<void>;
  endCall: () => void;
  toggleMute: () => void;
  toggleVideo: () => void;
  flipCamera: () => void;
  toggleSpeaker: () => void;
  simulateIncomingCall: (fromUser: UserProfile, type: CallType) => void;
  clearCallHistory: () => void;
}

const CallContext = createContext<CallContextType | undefined>(undefined);

export const CallProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeCall, setActiveCall] = useState<CallSession | null>(null);
  const [callHistory, setCallHistory] = useState<CallHistoryItem[]>(() => {
    const saved = localStorage.getItem('vibetalk_calls');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_CALL_HISTORY;
      }
    }
    return INITIAL_CALL_HISTORY;
  });

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isPermissionRequested, setIsPermissionRequested] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [hasMediaPermissions, setHasMediaPermissions] = useState(false);

  const durationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const ringtoneAudioRef = useRef<HTMLAudioElement | null>(null);

  // Sync call history
  useEffect(() => {
    localStorage.setItem('vibetalk_calls', JSON.stringify(callHistory));
  }, [callHistory]);

  // Clean up media tracks when activeCall goes to null
  useEffect(() => {
    if (!activeCall && localStream) {
      localStream.getTracks().forEach((track) => {
        track.stop();
      });
      setLocalStream(null);
    }
  }, [activeCall]);

  // Call duration counter
  useEffect(() => {
    if (activeCall?.status === 'connected') {
      durationTimerRef.current = setInterval(() => {
        setActiveCall((prev) => (prev ? { ...prev, durationSeconds: prev.durationSeconds + 1 } : null));
      }, 1000);
    } else {
      if (durationTimerRef.current) {
        clearInterval(durationTimerRef.current);
        durationTimerRef.current = null;
      }
    }
    return () => {
      if (durationTimerRef.current) clearInterval(durationTimerRef.current);
    };
  }, [activeCall?.status]);

  // Acquire media stream with WebRTC standard
  const acquireMediaStream = async (type: CallType): Promise<MediaStream | null> => {
    setIsPermissionRequested(true);
    setPermissionError(null);
    try {
      const constraints: MediaStreamConstraints = {
        audio: true,
        video: type === 'video' ? { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } } : false,
      };

      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        setLocalStream(stream);
        setHasMediaPermissions(true);
        return stream;
      } else {
        // Fallback for environments where device permissions are restricted
        console.warn('Media devices API not fully accessible, generating synthetic media stream fallback');
        return createSyntheticStream(type);
      }
    } catch (err: any) {
      console.warn('getUserMedia warning/fallback:', err?.message || err);
      setPermissionError(err?.message || 'Camera/Microphone permission denied.');
      // Create synthetic canvas/audio stream so preview doesn't hard-crash
      return createSyntheticStream(type);
    }
  };

  // Helper synthetic stream for sandboxed preview iframe without real webcam
  const createSyntheticStream = (type: CallType): MediaStream => {
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#101722';
      ctx.fillRect(0, 0, 640, 480);
      ctx.fillStyle = '#7C5CFF';
      ctx.font = '24px sans-serif';
      ctx.fillText('Encrypted WebRTC Stream', 180, 240);
    }
    const canvasStream = canvas.captureStream ? canvas.captureStream(30) : new MediaStream();
    setHasMediaPermissions(true);
    setLocalStream(canvasStream);
    return canvasStream;
  };

  const startCall = async (targetUser: UserProfile, type: CallType, topic?: string) => {
    await acquireMediaStream(type);

    const topicName = topic || targetUser.activeTopic || 'Usual';

    const newCall: CallSession = {
      id: `call_${Date.now()}`,
      callerId: 'usr_me_001',
      receiverId: targetUser.id,
      caller: targetUser, // For display
      receiver: targetUser,
      callType: type,
      status: 'calling',
      durationSeconds: 0,
      quality: 'excellent',
      isMuted: false,
      isVideoEnabled: type === 'video',
      isFrontCamera: true,
      isSpeakerOn: true,
      connectedTopic: topicName,
      connectionTag: `#${topicName}`,
    };

    setActiveCall(newCall);

    // Simulate realistic remote peer response: ringing -> connected
    setTimeout(() => {
      setActiveCall((prev) => (prev ? { ...prev, status: 'ringing' } : null));
    }, 1500);

    setTimeout(() => {
      setActiveCall((prev) =>
        prev && prev.status === 'ringing'
          ? { ...prev, status: 'connected', startedAt: new Date().toISOString() }
          : prev
      );
    }, 3800);
  };

  const simulateIncomingCall = (fromUser: UserProfile, type: CallType) => {
    const incoming: CallSession = {
      id: `call_${Date.now()}`,
      callerId: fromUser.id,
      receiverId: 'usr_me_001',
      caller: fromUser,
      receiver: fromUser,
      callType: type,
      status: 'ringing',
      durationSeconds: 0,
      quality: 'excellent',
      isMuted: false,
      isVideoEnabled: type === 'video',
      isFrontCamera: true,
      isSpeakerOn: true,
    };
    setActiveCall(incoming);
  };

  const acceptCall = async () => {
    if (!activeCall) return;
    await acquireMediaStream(activeCall.callType);
    setActiveCall((prev) =>
      prev
        ? {
            ...prev,
            status: 'connected',
            startedAt: new Date().toISOString(),
          }
        : null
    );
  };

  const endCall = () => {
    if (activeCall) {
      // Record call history
      const historyEntry: CallHistoryItem = {
        id: `hist_${Date.now()}`,
        otherUser: activeCall.receiver,
        direction: activeCall.status === 'connected' ? 'outgoing' : 'missed',
        callType: activeCall.callType,
        timestamp: 'Just now',
        durationSeconds: activeCall.durationSeconds,
      };

      setCallHistory((prev) => [historyEntry, ...prev]);

      // Release media stream tracks cleanly
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
        setLocalStream(null);
      }

      setActiveCall((prev) => (prev ? { ...prev, status: 'ended' } : null));

      setTimeout(() => {
        setActiveCall(null);
      }, 700);
    }
  };

  const toggleMute = () => {
    if (activeCall) {
      const nextMuted = !activeCall.isMuted;
      if (localStream) {
        localStream.getAudioTracks().forEach((track) => {
          track.enabled = !nextMuted;
        });
      }
      setActiveCall((prev) => (prev ? { ...prev, isMuted: nextMuted } : null));
    }
  };

  const toggleVideo = () => {
    if (activeCall) {
      const nextVideo = !activeCall.isVideoEnabled;
      if (localStream) {
        localStream.getVideoTracks().forEach((track) => {
          track.enabled = nextVideo;
        });
      }
      setActiveCall((prev) => (prev ? { ...prev, isVideoEnabled: nextVideo } : null));
    }
  };

  const flipCamera = () => {
    if (activeCall) {
      setActiveCall((prev) => (prev ? { ...prev, isFrontCamera: !prev.isFrontCamera } : null));
    }
  };

  const toggleSpeaker = () => {
    if (activeCall) {
      setActiveCall((prev) => (prev ? { ...prev, isSpeakerOn: !prev.isSpeakerOn } : null));
    }
  };

  const clearCallHistory = () => {
    setCallHistory([]);
  };

  return (
    <CallContext.Provider
      value={{
        activeCall,
        callHistory,
        localStream,
        isPermissionRequested,
        permissionError,
        hasMediaPermissions,
        startCall,
        acceptCall,
        endCall,
        toggleMute,
        toggleVideo,
        flipCamera,
        toggleSpeaker,
        simulateIncomingCall,
        clearCallHistory,
      }}
    >
      {children}
    </CallContext.Provider>
  );
};

export const useCall = () => {
  const context = useContext(CallContext);
  if (!context) {
    throw new Error('useCall must be used within a CallProvider');
  }
  return context;
};
