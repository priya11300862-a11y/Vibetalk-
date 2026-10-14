import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Mic,
  Image as ImageIcon,
  Smile,
  PhoneCall,
  Video,
  ShieldAlert,
  ChevronLeft,
  Play,
  Pause,
  X,
  Search,
  Users,
  MessageSquare,
  Sparkles,
  CheckCheck,
  Check,
  MoreVertical,
  Volume2,
  Lock,
  Layers,
  Heart,
  Maximize2,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useSocial } from '../../contexts/SocialContext';
import { useCall } from '../../contexts/CallContext';
import { Message, UserProfile, Conversation } from '../../types';
import { UserStatusDot, getEffectiveStatus } from '../common/UserStatusBadge';
import {
  PORTRAIT_KRISTIN,
  PORTRAIT_STORY_CYAN,
  PORTRAIT_RUHI,
  PORTRAIT_SUSHMITHA,
  PORTRAIT_ANANYA,
  PORTRAIT_MILKEE,
  PORTRAIT_NANCY,
  PORTRAIT_VICHU,
  PORTRAIT_RAKHI,
  AVATAR_MARCUS,
  AVATAR_CLARA,
  INITIAL_DISCOVER_PROFILES,
} from '../../services/mockData';
import { CoinWalletModal } from '../home/CoinWalletModal';

interface AuroraChatViewProps {
  onOpenReportModal: (user: UserProfile) => void;
  onNavigateTab?: (tab: string) => void;
  onSwitchStyle?: () => void;
}

const EMOJI_OPTIONS = ['❤️', '🔥', '👏', '😮', '😂', '💎', '✨', '😍'];

export const AuroraChatView: React.FC<AuroraChatViewProps> = ({
  onOpenReportModal,
  onNavigateTab,
  onSwitchStyle,
}) => {
  const { currentUser } = useAuth();
  const {
    conversations,
    activeConversationId,
    setActiveConversationId,
    activeConversation,
    messages,
    sendMessage,
    reactToMessage,
    sendConnectionRequest,
  } = useSocial();
  const { startCall } = useCall();

  // Sub tab & filters
  const [subTab, setSubTab] = useState<'chat' | 'available'>('chat');
  const [filterMode, setFilterMode] = useState<'all' | 'your_turn' | 'sent'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showWarningBanner, setShowWarningBanner] = useState(true);
  const [isWalletOpen, setIsWalletOpen] = useState(false);

  // Active chat state
  const [inputContent, setInputContent] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [previewMediaUrl, setPreviewMediaUrl] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeConversationId]);

  const handleSendText = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputContent.trim()) return;

    sendMessage(inputContent.trim(), 'text');
    setInputContent('');
  };

  const handleSendVoiceNote = () => {
    if (!isRecordingVoice) {
      setIsRecordingVoice(true);
      setTimeout(() => {
        setIsRecordingVoice(false);
        sendMessage('Voice memo (0:24)', 'audio');
      }, 2200);
    }
  };

  const handleSendGivenImage = () => {
    sendMessage(
      'Neon Bloom Concept ✨',
      'image',
      PORTRAIT_STORY_CYAN
    );
  };

  const toggleAudioPlay = (msgId: string) => {
    if (playingAudioId === msgId) {
      setPlayingAudioId(null);
    } else {
      setPlayingAudioId(msgId);
      setTimeout(() => {
        setPlayingAudioId(null);
      }, 5000);
    }
  };

  // Top active contacts/stories matching given design
  const topActiveContacts = [
    {
      id: 'usr_kristin_watson',
      name: 'Kristin',
      fullName: 'Kristin Watson',
      avatar: PORTRAIT_KRISTIN,
      topic: 'Love',
      convId: 'conv_kristin',
      hasStory: true,
      isOnline: true,
    },
    {
      id: 'usr_ruhi_201',
      name: 'ruhi',
      fullName: 'ruhi',
      avatar: PORTRAIT_RUHI,
      topic: 'Music',
      convId: 'conv_resilient',
      hasStory: true,
      isOnline: true,
    },
    {
      id: 'usr_sushmitha_101',
      name: 'Sushmitha',
      fullName: 'Sushmitha',
      avatar: PORTRAIT_SUSHMITHA,
      topic: 'Night Drives',
      convId: 'conv_jamuna',
      hasStory: true,
      isOnline: true,
    },
    {
      id: 'usr_ananya_202',
      name: 'Ananya',
      fullName: 'Ananya',
      avatar: PORTRAIT_ANANYA,
      topic: 'Poetry',
      convId: 'conv_thaaraa',
      hasStory: true,
      isOnline: false,
    },
    {
      id: 'usr_daniel_garcia',
      name: 'Daniel',
      fullName: 'Daniel Garcia',
      avatar: AVATAR_MARCUS,
      topic: 'Cinema',
      convId: 'conv_daniel',
      hasStory: false,
      isOnline: true,
    },
    {
      id: 'usr_clara_002',
      name: 'Clara',
      fullName: 'Clara Delacroix',
      avatar: AVATAR_CLARA,
      topic: 'Aesthetic',
      convId: 'conv_clara',
      hasStory: false,
      isOnline: true,
    },
  ];

  // Filter conversations
  const filteredConversations = conversations.filter((c) => {
    const isSentByMe =
      c.lastMessage?.senderId === currentUser?.id ||
      Boolean(c.lastMessage?.content?.startsWith('You:'));

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = c.participant.displayName.toLowerCase().includes(q);
      const matchMsg = c.lastMessage?.content?.toLowerCase().includes(q);
      if (!matchName && !matchMsg) return false;
    }

    if (filterMode === 'your_turn') {
      return c.unreadCount > 0 || !isSentByMe;
    }
    if (filterMode === 'sent') {
      return isSentByMe;
    }
    return true;
  });

  // Online available profiles
  const availableProfiles = INITIAL_DISCOVER_PROFILES.filter(
    (p) => p.id !== currentUser?.id && p.availabilityStatus === 'online'
  );

  const getBadgeStyle = (tier?: string) => {
    switch (tier?.toUpperCase()) {
      case 'CHAMPION':
        return 'bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-200 text-slate-950 font-black shadow-[0_0_10px_rgba(251,191,36,0.4)]';
      case 'PEARL':
        return 'bg-gradient-to-r from-cyan-200 via-pink-200 to-purple-200 text-slate-900 font-black shadow-[0_0_10px_rgba(93,230,210,0.3)]';
      case 'GOLD':
        return 'bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 font-black shadow-sm';
      case 'SILVER':
        return 'bg-gradient-to-r from-slate-200 to-slate-400 text-slate-950 font-black shadow-sm';
      case 'BRONZE':
        return 'bg-gradient-to-r from-amber-700 to-amber-600 text-white font-black shadow-sm';
      case 'IRON':
      default:
        return 'bg-slate-800/90 border border-slate-700 text-slate-300 font-bold';
    }
  };

  return (
    <div className="min-h-screen bg-[#060A13] text-white selection:bg-[#00D2FF]/30 pb-28 relative overflow-hidden font-dm">
      {/* Top Ambient Aurora Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-xl h-96 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#00D2FF]/20 via-[#7C5CFF]/15 to-transparent pointer-events-none blur-3xl" />

      {/* Main Container */}
      <div className="relative z-10 max-w-md sm:max-w-xl md:max-w-2xl mx-auto px-3 sm:px-4 pt-2">
        {/* Mobile Device Status Bar */}
        <div className="flex items-center justify-between text-xs text-slate-300 font-semibold px-2 py-1 select-none font-space">
          <span>9:41</span>
          <div className="flex items-center gap-1.5 text-[11px]">
            <span className="text-[10px] tracking-wider text-cyan-300 font-mono">5G</span>
            <span>􀙇</span>
            <div className="w-5 h-2.5 rounded-sm border border-slate-300 flex items-center p-0.5">
              <div className="w-full h-full bg-slate-300 rounded-[1px]" />
            </div>
          </div>
        </div>

        {/* =========================================================================
            ACTIVE CHAT THREAD (Given UI Style)
            ========================================================================= */}
        {activeConversation && activeConversationId ? (
          <div className="h-[calc(100vh-6.5rem)] rounded-3xl bg-[#090E1A]/90 border border-white/10 flex flex-col overflow-hidden shadow-2xl backdrop-blur-2xl">
            {/* Active Thread Header */}
            <div className="p-3 sm:p-3.5 border-b border-white/10 flex items-center justify-between gap-3 bg-[#0B1120]/95 backdrop-blur-xl">
              <div className="flex items-center gap-2.5 min-w-0">
                <button
                  onClick={() => setActiveConversationId(null)}
                  className="p-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-slate-200 transition-colors"
                  title="Back to conversation list"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                {(() => {
                  const activePStatus = getEffectiveStatus(activeConversation.participant);
                  const isKristin = activeConversation.participant.id === 'usr_kristin_watson';

                  return (
                    <>
                      <div className="relative w-10 h-10 rounded-full shrink-0">
                        {/* Glowing halo ring */}
                        <div
                          className={`absolute -inset-0.5 rounded-full ${
                            isKristin
                              ? 'bg-gradient-to-tr from-[#00D2FF] via-[#7C5CFF] to-[#FF4F9A] animate-pulse'
                              : 'bg-gradient-to-tr from-[#00D2FF] to-[#7C5CFF]'
                          } blur-[2px] opacity-80`}
                        />
                        <div className="relative w-full h-full rounded-full overflow-hidden border border-white/20 bg-slate-900">
                          <img
                            src={activeConversation.participant.avatarUrl}
                            alt={activeConversation.participant.displayName}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div
                          className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#090E1A] ring-1 ring-[#090E1A] flex items-center justify-center"
                          title={`Status: ${activePStatus}`}
                        >
                          <UserStatusDot status={activePStatus} size="xs" />
                        </div>
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-sm font-bold font-space text-white truncate">
                            {activeConversation.participant.displayName}
                          </h3>
                          {activeConversation.participant.isVerified && (
                            <span className="w-3.5 h-3.5 rounded-full bg-cyan-400/20 text-[#00D2FF] flex items-center justify-center text-[9px] font-bold">
                              ✓
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-[10px] font-semibold ${
                              activePStatus === 'online'
                                ? 'text-[#00FF88]'
                                : activePStatus === 'busy'
                                ? 'text-amber-400'
                                : 'text-slate-400'
                            }`}
                          >
                            {activePStatus === 'online'
                              ? 'Active now'
                              : activePStatus === 'busy'
                              ? 'Busy'
                              : 'Offline'}
                          </span>
                          {activeConversation.participant.activeTopic && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-[#FF4F9A]/15 text-[#FF82BB] border border-[#FF4F9A]/30 font-bold">
                              #{activeConversation.participant.activeTopic}
                            </span>
                          )}
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Call & Safety Actions */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() =>
                    startCall(
                      activeConversation.participant,
                      'audio',
                      activeConversation.participant.activeTopic
                    )
                  }
                  className="p-2 rounded-xl bg-white/[0.06] hover:bg-[#00D2FF]/20 border border-white/10 hover:border-[#00D2FF]/40 text-[#00D2FF] text-xs font-medium transition-all active:scale-95"
                  title="Audio Call"
                >
                  <PhoneCall className="w-4 h-4" />
                </button>

                <button
                  onClick={() =>
                    startCall(
                      activeConversation.participant,
                      'video',
                      activeConversation.participant.activeTopic
                    )
                  }
                  className="p-2 rounded-xl bg-white/[0.06] hover:bg-[#9C7BFF]/20 border border-white/10 hover:border-[#9C7BFF]/40 text-[#9C7BFF] text-xs font-medium transition-all active:scale-95"
                  title="Video Call"
                >
                  <Video className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onOpenReportModal(activeConversation.participant)}
                  className="p-2 rounded-xl bg-white/[0.06] hover:bg-rose-500/20 border border-white/10 hover:border-rose-500/40 text-slate-400 hover:text-rose-400 transition-colors"
                  title="Report or Block"
                >
                  <ShieldAlert className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* End-to-end encryption privacy capsule */}
            <div className="py-1.5 px-3 bg-white/[0.02] border-b border-white/[0.04] flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
              <Lock className="w-3 h-3 text-cyan-400" />
              <span>Private End-to-End Encrypted Session</span>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
              {messages.map((msg) => {
                const isMine = msg.senderId === currentUser?.id;
                const isAudio = msg.messageType === 'audio';
                const isImage = msg.messageType === 'image';
                const isPlaying = playingAudioId === msg.id;

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} group`}
                  >
                    <div
                      className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-2.5 relative transition-all ${
                        isMine
                          ? 'bg-gradient-to-r from-[#7C5CFF] via-[#9C7BFF] to-[#E11D48] text-white rounded-br-xs shadow-[0_4px_20px_rgba(124,92,255,0.3)]'
                          : 'bg-white/[0.08] text-slate-100 rounded-bl-xs border border-white/10 backdrop-blur-md'
                      }`}
                    >
                      {/* Audio voice note */}
                      {isAudio ? (
                        <div className="flex items-center gap-3 py-1 min-w-[200px]">
                          <button
                            onClick={() => toggleAudioPlay(msg.id)}
                            className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-transform active:scale-90"
                          >
                            {isPlaying ? (
                              <Pause className="w-4 h-4" />
                            ) : (
                              <Play className="w-4 h-4 ml-0.5 text-cyan-300" />
                            )}
                          </button>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-1 h-5">
                              {[12, 20, 8, 24, 16, 28, 14, 22, 10, 18, 26, 12].map((h, i) => (
                                <span
                                  key={i}
                                  style={{ height: isPlaying ? undefined : `${h}px` }}
                                  className={`w-1 rounded-full ${
                                    isPlaying ? 'bg-[#00FF88] animate-audio-bar' : 'bg-white/70'
                                  }`}
                                />
                              ))}
                            </div>
                            <div className="flex items-center justify-between text-[10px] text-white/80 font-mono">
                              <span>0:24</span>
                              <span>{isPlaying ? 'Playing...' : 'Voice memo'}</span>
                            </div>
                          </div>
                        </div>
                      ) : isImage && msg.mediaUrl ? (
                        /* Shared Photograph / Given Image */
                        <div className="space-y-2">
                          <div
                            onClick={() => setPreviewMediaUrl(msg.mediaUrl || null)}
                            className="rounded-xl overflow-hidden max-w-xs cursor-pointer relative group/img border border-white/10 shadow-lg"
                          >
                            <img
                              src={msg.mediaUrl}
                              alt="Shared media"
                              className="w-full object-cover rounded-xl group-hover/img:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <span className="p-2 rounded-full bg-black/60 text-white">
                                <Maximize2 className="w-4 h-4" />
                              </span>
                            </div>
                          </div>
                          {msg.content && (
                            <p className="text-xs font-medium text-slate-200">{msg.content}</p>
                          )}
                        </div>
                      ) : (
                        /* Text message */
                        <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap select-text font-dm">
                          {msg.content}
                        </p>
                      )}

                      {/* Timestamp and Read Receipts */}
                      <div className="flex items-center justify-end gap-1 mt-1 text-[10px] opacity-80 font-mono">
                        <span>{msg.createdAt}</span>
                        {isMine && (
                          <span title="Read">
                            <CheckCheck className="w-3.5 h-3.5 text-[#00D2FF]" />
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Emoji reactions */}
                    {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                      <div className="flex items-center gap-1 mt-1 px-1">
                        {Object.entries(msg.reactions).map(([emoji, users]) => (
                          <span
                            key={emoji}
                            onClick={() => reactToMessage(msg.id, emoji)}
                            className="text-xs px-2 py-0.5 rounded-full bg-white/[0.08] hover:bg-white/[0.15] border border-white/10 cursor-pointer shadow-sm transition-transform active:scale-95"
                          >
                            {emoji} {users.length > 1 && users.length}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Reaction Floating Bar */}
            {showEmojiPicker && (
              <div className="px-4 py-2 border-t border-white/10 bg-[#070C16] flex items-center gap-2">
                <span className="text-[11px] text-slate-400 font-semibold mr-1 font-space">
                  React:
                </span>
                {EMOJI_OPTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => {
                      if (messages.length > 0) {
                        reactToMessage(messages[messages.length - 1].id, emoji);
                      }
                      setShowEmojiPicker(false);
                    }}
                    className="text-lg hover:scale-125 transition-transform p-1"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}

            {/* Input Bar */}
            <div className="p-3 border-t border-white/10 bg-[#0B101D]/95 backdrop-blur-xl">
              <form onSubmit={handleSendText} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSendGivenImage}
                  className="p-2 text-slate-400 hover:text-[#00D2FF] transition-colors rounded-xl hover:bg-white/[0.06]"
                  title="Share Given Image concept"
                >
                  <ImageIcon className="w-5 h-5" />
                </button>

                <button
                  type="button"
                  onClick={handleSendVoiceNote}
                  className={`p-2 transition-colors rounded-xl ${
                    isRecordingVoice
                      ? 'text-rose-500 bg-rose-500/20 animate-pulse'
                      : 'text-slate-400 hover:text-[#00D2FF] hover:bg-white/[0.06]'
                  }`}
                  title="Record voice note"
                >
                  <Mic className="w-5 h-5" />
                </button>

                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="p-2 text-slate-400 hover:text-amber-400 transition-colors rounded-xl hover:bg-white/[0.06]"
                  title="Emoji"
                >
                  <Smile className="w-5 h-5" />
                </button>

                <input
                  type="text"
                  value={inputContent}
                  onChange={(e) => setInputContent(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2.5 rounded-2xl bg-white/[0.06] border border-white/10 text-white text-xs sm:text-sm placeholder:text-slate-400 focus:outline-none focus:border-[#00D2FF] shadow-inner font-dm"
                />

                <button
                  type="submit"
                  disabled={!inputContent.trim()}
                  className="p-2.5 rounded-2xl bg-gradient-to-r from-[#00D2FF] via-[#7C5CFF] to-[#FF4F9A] text-slate-950 font-bold hover:opacity-90 disabled:opacity-40 transition-all shadow-[0_0_15px_rgba(0,210,255,0.3)]"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* =========================================================================
              CONVERSATION LIST VIEW (Given UI Style)
              ========================================================================= */
          <div className="space-y-4">
            {/* Top Bar: User Profile + Given UI Badge + Style Switcher + Coins */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-3">
                <div
                  onClick={() => onNavigateTab && onNavigateTab('profile')}
                  className="flex items-center gap-2 cursor-pointer group"
                  title="View your profile"
                >
                  <div className="relative">
                    <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-[#00D2FF] p-0.5 bg-slate-900 shadow-[0_0_15px_rgba(0,210,255,0.3)] group-hover:scale-105 transition-transform">
                      <img
                        src={currentUser?.avatarUrl}
                        alt={currentUser?.displayName}
                        className="w-full h-full object-cover rounded-full"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="absolute -bottom-1 -left-1 px-1.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-200 text-[7px] font-black text-slate-950 uppercase tracking-tight shadow">
                      CHAMPION
                    </div>
                  </div>
                </div>

                {/* Style Switcher Toggle Button */}
                {onSwitchStyle && (
                  <button
                    onClick={onSwitchStyle}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.08] hover:bg-white/[0.14] border border-[#00D2FF]/40 text-[#00D2FF] text-[10px] font-bold font-space transition-all active:scale-95"
                    title="Toggle between Given UI Style and Standard Layout"
                  >
                    <Sparkles className="w-3 h-3 text-[#00D2FF]" />
                    <span>Given UI Style</span>
                  </button>
                )}
              </div>

              {/* Coin Balance Capsule */}
              <div
                onClick={() => setIsWalletOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.08] hover:bg-white/[0.14] border border-white/10 text-white shadow-md transition-all cursor-pointer active:scale-95"
                title="Open Coin Wallet"
              >
                <span className="text-sm">🪙</span>
                <span className="font-extrabold text-xs font-mono">
                  {currentUser?.coins ?? 80}
                </span>
              </div>
            </div>

            {/* Header Title & Find FRND / Discover */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-baseline gap-2">
                <h1 className="text-2xl font-black font-space text-white tracking-tight">
                  Chats
                </h1>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-gradient-to-r from-[#00D2FF]/20 to-[#9C7BFF]/20 text-[#00D2FF] border border-[#00D2FF]/30 font-space">
                  VibeChat
                </span>
              </div>

              <button
                onClick={() => onNavigateTab && onNavigateTab('discover')}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#FF4F9A] to-[#E11D48] text-white transition-all shadow-[0_0_15px_rgba(255,79,154,0.3)] font-black text-xs active:scale-95"
              >
                <Search className="w-3.5 h-3.5" />
                <span className="font-space">Find FRND</span>
              </button>
            </div>

            {/* Content Rules Notice */}
            {showWarningBanner && (
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-400/25 text-amber-200 text-xs font-medium leading-relaxed relative flex items-center justify-between gap-2 backdrop-blur-md">
                <div className="flex items-center gap-2 min-w-0">
                  <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="text-[11px] truncate">
                    Safe chat active: Private end-to-end encryption & content rules verified.
                  </span>
                </div>
                <button
                  onClick={() => setShowWarningBanner(false)}
                  className="text-amber-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
                  title="Dismiss"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* TOP STORIES / ACTIVE CONTACTS HORIZONTAL TRAY (Given Image Design Feature) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between px-1">
                <span className="text-[11px] font-space font-bold uppercase tracking-wider text-slate-400">
                  Active Vibe Stories
                </span>
                <span className="text-[10px] text-cyan-400 font-bold">Live Now</span>
              </div>
              <div className="flex items-center gap-3 overflow-x-auto pb-1 pt-0.5 scrollbar-none">
                {topActiveContacts.map((contact) => (
                  <div
                    key={contact.id}
                    onClick={() => setActiveConversationId(contact.convId)}
                    className="flex flex-col items-center gap-1 shrink-0 cursor-pointer group"
                  >
                    <div className="relative">
                      {/* Ethereal neon ring */}
                      <div className="w-14 h-14 rounded-full p-[2px] bg-gradient-to-tr from-[#00D2FF] via-[#7C5CFF] to-[#FF4F9A] shadow-[0_0_12px_rgba(0,210,255,0.35)] group-hover:scale-105 transition-transform">
                        <div className="w-full h-full rounded-full overflow-hidden bg-[#060A13] p-0.5">
                          <img
                            src={contact.avatar}
                            alt={contact.name}
                            className="w-full h-full object-cover rounded-full"
                          />
                        </div>
                      </div>
                      {contact.isOnline && (
                        <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-[#00FF88] ring-2 ring-[#060A13]" />
                      )}
                    </div>
                    <span className="text-[11px] font-space font-medium text-slate-200 group-hover:text-[#00D2FF] truncate max-w-[60px]">
                      {contact.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Sub-Navigation Tabs: Chat | Available */}
            <div className="flex items-center gap-8 border-b border-white/10 text-sm font-bold pt-1 font-space">
              <button
                onClick={() => setSubTab('chat')}
                className={`pb-2.5 relative transition-colors ${
                  subTab === 'chat'
                    ? 'text-white font-extrabold text-base'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>Chat</span>
                {subTab === 'chat' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-gradient-to-r from-[#00D2FF] to-[#FF4F9A]" />
                )}
              </button>

              <button
                onClick={() => setSubTab('available')}
                className={`pb-2.5 relative transition-colors ${
                  subTab === 'available'
                    ? 'text-white font-extrabold text-base'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <span>Available</span>
                  <span className="w-2 h-2 rounded-full bg-[#00FF88] animate-pulse" />
                </span>
                {subTab === 'available' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-gradient-to-r from-[#00D2FF] to-[#FF4F9A]" />
                )}
              </button>
            </div>

            {/* Filter Pills: All | Your turn | Sent */}
            {subTab === 'chat' && (
              <div className="flex items-center gap-2 pt-1">
                {(['all', 'your_turn', 'sent'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setFilterMode(mode)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold font-space transition-all active:scale-95 ${
                      filterMode === mode
                        ? 'bg-gradient-to-r from-[#00D2FF] to-[#7C5CFF] text-slate-950 shadow-[0_0_12px_rgba(0,210,255,0.35)] font-extrabold'
                        : 'bg-white/[0.06] text-slate-300 hover:bg-white/[0.1] border border-white/10'
                    }`}
                  >
                    {mode === 'all' ? 'All' : mode === 'your_turn' ? 'Your turn' : 'Sent'}
                  </button>
                ))}
              </div>
            )}

            {/* TAB 1: CONVERSATIONS LIST */}
            {subTab === 'chat' && (
              <div className="space-y-2 pt-1">
                {filteredConversations.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 space-y-2 bg-white/[0.02] rounded-2xl border border-white/5">
                    <p className="text-sm font-semibold font-space">No chats found in this filter.</p>
                    <button
                      onClick={() => setFilterMode('all')}
                      className="text-xs text-[#00D2FF] font-bold underline"
                    >
                      View All Chats
                    </button>
                  </div>
                ) : (
                  filteredConversations.map((conv) => {
                    const badgeTier = conv.participant.championBadge || 'IRON';
                    const isSentByMe =
                      conv.lastMessage?.senderId === currentUser?.id ||
                      Boolean(conv.lastMessage?.content?.startsWith('You:'));
                    const rawMsg = conv.lastMessage?.content || 'No messages';
                    const displaySnippet = rawMsg.startsWith('You:')
                      ? rawMsg.slice(4).trim()
                      : rawMsg;
                    const isKristin = conv.participant.id === 'usr_kristin_watson';

                    return (
                      <div
                        key={conv.id}
                        onClick={() => setActiveConversationId(conv.id)}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          isKristin
                            ? 'bg-gradient-to-r from-cyan-950/30 via-purple-950/20 to-slate-900/60 border-[#00D2FF]/30 hover:border-[#00D2FF]/60 shadow-[0_0_15px_rgba(0,210,255,0.15)]'
                            : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/10 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          {/* Avatar with halo and badge */}
                          <div className="relative shrink-0">
                            <div
                              className={`w-13 h-13 rounded-full overflow-hidden p-0.5 bg-slate-900 ${
                                isKristin
                                  ? 'ring-2 ring-[#00D2FF] shadow-[0_0_12px_rgba(0,210,255,0.4)]'
                                  : 'border border-white/20'
                              }`}
                            >
                              <img
                                src={conv.participant.avatarUrl}
                                alt={conv.participant.displayName}
                                className="w-full h-full object-cover rounded-full"
                                referrerPolicy="no-referrer"
                              />
                            </div>

                            {/* Status dot */}
                            {(() => {
                              const convStatus = getEffectiveStatus(conv.participant);
                              return (
                                <div
                                  className="absolute top-0 right-0 w-3.5 h-3.5 rounded-full ring-2 ring-[#060A13] bg-[#060A13] flex items-center justify-center"
                                  title={`Status: ${convStatus}`}
                                >
                                  <UserStatusDot status={convStatus} size="xs" />
                                </div>
                              );
                            })()}

                            {/* Tier capsule badge */}
                            <div
                              className={`absolute -bottom-1 left-1/2 -translate-x-1/2 px-1.5 py-0.2 rounded-full text-[8px] font-space tracking-tighter uppercase ${getBadgeStyle(
                                badgeTier
                              )}`}
                            >
                              {badgeTier}
                            </div>
                          </div>

                          {/* Name, topic and preview */}
                          <div className="min-w-0 space-y-0.5">
                            <div className="flex items-center gap-1.5">
                              <h3 className="text-sm font-bold font-space text-white truncate">
                                {conv.participant.displayName}
                              </h3>
                              {conv.participant.isVerified && (
                                <span className="text-[10px] text-[#00D2FF]">✓</span>
                              )}
                              {conv.participant.activeTopic && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-[#FF4F9A]/15 text-[#FF82BB] border border-[#FF4F9A]/30 font-bold font-space">
                                  #{conv.participant.activeTopic}
                                </span>
                              )}
                            </div>

                            {/* Message snippet */}
                            <p className="text-xs text-slate-300 truncate font-dm">
                              {isSentByMe ? (
                                <>
                                  <span className="text-cyan-400 font-medium">You: </span>
                                  <span className="text-slate-300">{displaySnippet}</span>
                                </>
                              ) : (
                                <span>{rawMsg}</span>
                              )}
                            </p>
                          </div>
                        </div>

                        {/* Timestamp & Unread */}
                        <div className="flex flex-col items-end gap-1 shrink-0 font-space">
                          <span className="text-[11px] text-slate-400 font-mono">
                            {conv.updatedAt}
                          </span>
                          {conv.unreadCount > 0 && (
                            <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-gradient-to-r from-[#00D2FF] to-[#7C5CFF] text-slate-950 font-mono shadow-[0_0_8px_rgba(0,210,255,0.4)]">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* TAB 2: AVAILABLE FRIENDS */}
            {subTab === 'available' && (
              <div className="space-y-3 pt-1">
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 font-semibold flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#00FF88] animate-ping" />
                  <span>
                    {availableProfiles.length} friends are online and ready to chat right now!
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {availableProfiles.map((p) => (
                    <div
                      key={p.id}
                      className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-white/20 transition-all flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative w-12 h-12 rounded-full overflow-hidden border border-white/20 shrink-0 bg-slate-900">
                          <img
                            src={p.avatarUrl}
                            alt={p.displayName}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#00FF88] ring-2 ring-[#060A13]" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold font-space text-white truncate">
                            {p.displayName}
                          </h4>
                          <p className="text-[11px] text-slate-400 truncate font-dm">
                            {p.broadLocation || p.country}
                          </p>
                          {p.activeTopic && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-[#FF4F9A]/15 text-[#FF82BB] border border-[#FF4F9A]/30 font-bold font-space">
                              #{p.activeTopic}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => {
                            const existingConv = conversations.find(
                              (c) => c.participant.id === p.id
                            );
                            if (existingConv) {
                              setActiveConversationId(existingConv.id);
                            } else {
                              sendConnectionRequest(p.id);
                              onNavigateTab && onNavigateTab('discover');
                            }
                          }}
                          className="px-3 py-1.5 rounded-full bg-gradient-to-r from-[#00D2FF] to-[#7C5CFF] text-slate-950 text-xs font-black font-space transition-all active:scale-95 shadow-[0_0_10px_rgba(0,210,255,0.3)]"
                        >
                          Chat
                        </button>
                        <button
                          onClick={() => startCall(p, 'audio', p.activeTopic)}
                          className="p-2 rounded-full bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 transition-colors active:scale-95"
                          title="Audio Call"
                        >
                          <PhoneCall className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => startCall(p, 'video', p.activeTopic)}
                          className="p-2 rounded-full bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 border border-pink-500/30 transition-colors active:scale-95"
                          title="Video Call"
                        >
                          <Video className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Full-screen Media Preview Modal */}
        {previewMediaUrl && (
          <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
            <div className="relative max-w-lg w-full">
              <button
                onClick={() => setPreviewMediaUrl(null)}
                className="absolute -top-12 right-0 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              <img
                src={previewMediaUrl}
                alt="Enlarged media"
                className="w-full rounded-2xl border border-white/20 shadow-2xl object-contain max-h-[80vh]"
              />
            </div>
          </div>
        )}

        {/* Coin Wallet Modal */}
        <CoinWalletModal
          isOpen={isWalletOpen}
          onClose={() => setIsWalletOpen(false)}
          onClaimDailyCoins={() => {}}
          isClaimed={false}
        />
      </div>
    </div>
  );
};
