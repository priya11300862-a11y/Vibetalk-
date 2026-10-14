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
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useSocial } from '../../contexts/SocialContext';
import { useCall } from '../../contexts/CallContext';
import { Message, UserProfile } from '../../types';
import { UserStatusDot, getEffectiveStatus } from '../common/UserStatusBadge';
import { INITIAL_DISCOVER_PROFILES } from '../../services/mockData';
import { CoinWalletModal } from '../home/CoinWalletModal';
import { AuroraChatView } from './AuroraChatView';

interface ChatViewProps {
  onOpenReportModal: (user: UserProfile) => void;
  onNavigateTab?: (tab: string) => void;
}

const EMOJI_OPTIONS = ['❤️', '🔥', '👏', '😮', '😂', '💎'];

export const ChatView: React.FC<ChatViewProps> = ({ onOpenReportModal, onNavigateTab }) => {
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

  // Chat tab & filter sub-states from Screenshot
  const [subTab, setSubTab] = useState<'chat' | 'available'>('chat');
  const [filterMode, setFilterMode] = useState<'all' | 'your_turn' | 'sent'>('all');
  const [showWarningBanner, setShowWarningBanner] = useState(true);
  const [isWalletOpen, setIsWalletOpen] = useState(false);

  // Active chat state
  const [inputContent, setInputContent] = useState('');
  const [replyingToMessage, setReplyingToMessage] = useState<Message | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);

  // Chat style: 'aurora' (given image design) vs 'standard'
  const [chatStyle, setChatStyle] = useState<'aurora' | 'standard'>(() => {
    return (localStorage.getItem('vibetalk_chat_style') as 'aurora' | 'standard') || 'aurora';
  });

  const handleSetChatStyle = (style: 'aurora' | 'standard') => {
    setChatStyle(style);
    localStorage.setItem('vibetalk_chat_style', style);
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendText = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputContent.trim()) return;

    sendMessage(
      inputContent.trim(),
      'text',
      undefined,
      replyingToMessage ? replyingToMessage.id : undefined
    );
    setInputContent('');
    setReplyingToMessage(null);
  };

  const handleSendVoiceNote = () => {
    if (!isRecordingVoice) {
      setIsRecordingVoice(true);
      setTimeout(() => {
        setIsRecordingVoice(false);
        sendMessage('Voice memo (0:18)', 'audio');
      }, 2500);
    }
  };

  const handleSendImage = () => {
    sendMessage(
      'Shared a photograph',
      'image',
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80'
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

  // Filter conversations matching screenshot filters
  const filteredConversations = conversations.filter((c) => {
    const isSentByMe =
      c.lastMessage?.senderId === currentUser?.id ||
      Boolean(c.lastMessage?.content?.startsWith('You:'));

    if (filterMode === 'your_turn') {
      return c.unreadCount > 0 || !isSentByMe;
    }
    if (filterMode === 'sent') {
      return isSentByMe;
    }
    return true;
  });

  // Online available profiles for 'available' subTab
  const availableProfiles = INITIAL_DISCOVER_PROFILES.filter(
    (p) => p.id !== currentUser?.id && p.availabilityStatus === 'online'
  );

  const getBadgeStyle = (tier?: string) => {
    switch (tier?.toUpperCase()) {
      case 'PEARL':
        return 'bg-gradient-to-r from-slate-200 via-pink-100 to-indigo-100 text-slate-900 border border-white font-black shadow-sm';
      case 'GOLD':
      case 'CHAMPION':
        return 'bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 border border-yellow-200 font-black shadow-sm';
      case 'SILVER':
        return 'bg-gradient-to-r from-slate-200 to-slate-400 text-slate-950 border border-slate-300 font-black shadow-sm';
      case 'BRONZE':
        return 'bg-gradient-to-r from-amber-700 to-amber-600 text-white border border-amber-500 font-black shadow-sm';
      case 'IRON':
      default:
        return 'bg-[#1E293B] border border-slate-600 text-slate-300 font-black shadow-sm';
    }
  };

  if (chatStyle === 'aurora') {
    return (
      <AuroraChatView
        onOpenReportModal={onOpenReportModal}
        onNavigateTab={onNavigateTab}
        onSwitchStyle={() => handleSetChatStyle('standard')}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-2 sm:px-6 py-2 min-h-[calc(100vh-4.5rem)] text-left select-none text-black font-bold">
      
      {/* If an active conversation is selected, show the full conversation thread */}
      {activeConversation && activeConversationId ? (
        <div className="h-[calc(100vh-5.5rem)] rounded-3xl bg-white/95 border border-stone-200 flex flex-col overflow-hidden shadow-xl">
          
          {/* Active Conversation Header */}
          <div className="p-3.5 border-b border-stone-200 flex items-center justify-between gap-3 bg-[#FAF8F5]/95 backdrop-blur-md">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => setActiveConversationId(null)}
                className="p-1.5 text-slate-500 hover:text-slate-900 transition-colors"
                title="Back to VibeChat list"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              {(() => {
                const activePStatus = getEffectiveStatus(activeConversation.participant);
                return (
                  <>
                    <div className="relative w-10 h-10 rounded-full overflow-hidden border border-stone-200 shrink-0 bg-slate-100">
                      <img
                        src={activeConversation.participant.avatarUrl}
                        alt={activeConversation.participant.displayName}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div
                        className="absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full bg-white ring-1 ring-white flex items-center justify-center"
                        title={`Status: ${activePStatus}`}
                      >
                        <UserStatusDot status={activePStatus} size="xs" />
                      </div>
                    </div>

                    <div className="min-w-0">
                      <h3 className="text-sm font-extrabold text-black truncate">
                        {activeConversation.participant.displayName}
                      </h3>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[10px] font-bold ${
                            activePStatus === 'busy'
                              ? 'text-amber-400'
                              : activePStatus === 'online'
                              ? 'text-emerald-400'
                              : 'text-slate-400'
                          }`}
                        >
                          {activePStatus === 'busy'
                            ? 'Busy'
                            : activePStatus === 'online'
                            ? 'Online'
                            : 'Offline'}
                        </span>
                        {activeConversation.participant.activeTopic && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30 font-bold">
                            #{activeConversation.participant.activeTopic}
                          </span>
                        )}
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Header Call Actions */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() =>
                  startCall(
                    activeConversation.participant,
                    'audio',
                    activeConversation.participant.activeTopic
                  )
                }
                className="p-2.5 rounded-xl bg-white/[0.05] hover:bg-[#7C5CFF]/20 text-slate-300 hover:text-[#7C5CFF] text-xs font-medium transition-colors"
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
                className="p-2.5 rounded-xl bg-white/[0.05] hover:bg-[#20D9C3]/20 text-slate-300 hover:text-[#20D9C3] text-xs font-medium transition-colors"
                title="Video Call"
              >
                <Video className="w-4 h-4" />
              </button>

              <button
                onClick={() => onOpenReportModal(activeConversation.participant)}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-400 transition-colors"
                title="Report"
              >
                <ShieldAlert className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Scroll Thread */}
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
                    className={`max-w-[85%] sm:max-w-[70%] rounded-2xl px-4 py-2.5 relative transition-all ${
                      isMine
                        ? 'bg-[#E11D48] text-white rounded-br-sm shadow-md'
                        : 'bg-stone-100 text-slate-850 rounded-bl-sm border border-stone-200/80 shadow-xs'
                    }`}
                  >
                    {isAudio ? (
                      <div className="flex items-center gap-3 py-1 min-w-[180px]">
                        <button
                          onClick={() => toggleAudioPlay(msg.id)}
                          className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white"
                        >
                          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                        </button>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-1 h-4">
                            {[10, 18, 8, 22, 14, 26, 12, 20].map((h, i) => (
                              <span
                                key={i}
                                style={{ height: isPlaying ? undefined : `${h}px` }}
                                className={`w-1 rounded-full ${
                                  isPlaying ? 'bg-[#00FF88] animate-audio-bar' : 'bg-white/60'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-[10px] text-white/80 font-mono">0:18</span>
                        </div>
                      </div>
                    ) : isImage && msg.mediaUrl ? (
                      <div className="space-y-1.5">
                        <div className="rounded-xl overflow-hidden max-w-xs">
                          <img src={msg.mediaUrl} alt="Shared" className="w-full object-cover" />
                        </div>
                        <p className="text-xs">{msg.content}</p>
                      </div>
                    ) : (
                      <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap select-text">
                        {msg.content}
                      </p>
                    )}

                    <div className="flex items-center justify-end gap-1 mt-1 text-[10px] opacity-75 font-mono">
                      <span>{msg.createdAt}</span>
                    </div>
                  </div>

                  {/* Emoji reactions row */}
                  {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                    <div className="flex items-center gap-1 mt-1 px-1">
                      {Object.entries(msg.reactions).map(([emoji, users]) => (
                        <span
                          key={emoji}
                          onClick={() => reactToMessage(msg.id, emoji)}
                          className="text-xs px-1.5 py-0.5 rounded-full bg-white/10 hover:bg-white/20 cursor-pointer"
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
            <div className="px-4 py-2 border-t border-white/[0.04] bg-[#0c121c] flex items-center gap-2">
              <span className="text-[11px] text-slate-400 font-semibold mr-1">React:</span>
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
          <div className="p-3 border-t border-stone-200 bg-[#FAF8F5]/95">
            <form onSubmit={handleSendText} className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSendImage}
                className="p-2 text-slate-500 hover:text-slate-800 transition-colors"
                title="Send photo"
              >
                <ImageIcon className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={handleSendVoiceNote}
                className={`p-2 transition-colors ${
                  isRecordingVoice ? 'text-rose-500 animate-pulse' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Record voice note"
              >
                <Mic className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-2 text-slate-500 hover:text-slate-800 transition-colors"
                title="Emoji"
              >
                <Smile className="w-5 h-5" />
              </button>

              <input
                type="text"
                value={inputContent}
                onChange={(e) => setInputContent(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2.5 rounded-2xl bg-white border border-stone-200 text-slate-800 text-xs placeholder:text-slate-400 focus:outline-none focus:border-[#FF4F9A] shadow-xs"
              />

              <button
                type="submit"
                disabled={!inputContent.trim()}
                className="p-2.5 rounded-2xl bg-[#E11D48] hover:bg-[#F43F5E] disabled:opacity-40 text-white transition-colors shadow-md"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

        </div>
      ) : (
        /* =========================================================================
            SCREENSHOT EXACT LIST VIEW (VibeChat + Top bar + Notice + Filters)
            ========================================================================= */
        <div className="space-y-4">
          
          {/* Top Status Bar (Avatar with Champion Crest + Luxury Coin Balance Pill) */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-3">
              <div
                onClick={() => onNavigateTab && onNavigateTab('profile')}
                className="flex items-center gap-2 cursor-pointer group"
                title="View your profile"
              >
                <div className="relative">
                  <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-[#20D9C3] p-0.5 bg-slate-900 shadow-md group-hover:scale-105 transition-transform">
                    <img
                      src={currentUser?.avatarUrl}
                      alt={currentUser?.displayName}
                      className="w-full h-full object-cover rounded-full"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="absolute -bottom-1 -left-1 px-1.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-200 text-[7.5px] font-black text-slate-950 uppercase tracking-tight shadow">
                    CHAMPION
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleSetChatStyle('aurora')}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 text-[#00D2FF] text-xs font-bold border border-cyan-400/40 hover:bg-slate-800 transition-all shadow-sm active:scale-95"
                title="Switch to Given UI Style"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Given UI Style</span>
              </button>
            </div>

            {/* Coin Balance Capsule Button */}
            <div
              onClick={() => setIsWalletOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white text-slate-950 shadow-md hover:bg-slate-100 transition-all cursor-pointer active:scale-95"
              title="Open Coin Wallet"
            >
              <span className="text-base">🪙</span>
              <span className="font-extrabold text-sm font-mono">{currentUser?.coins ?? 80}</span>
            </div>
          </div>

          {/* Header Title & "Find FRND" Action Button */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-baseline gap-2">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Chats</h1>
              <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#FF1493]/15 text-[#FF1493] border border-[#FF1493]/30">
                VibeChat
              </span>
            </div>

            <button
              onClick={() => onNavigateTab && onNavigateTab('discover')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-pink-100 hover:bg-pink-200 text-slate-900 transition-colors shadow-xs font-black text-xs active:scale-95 border border-pink-200"
            >
              <span className="text-sm">🔍</span>
              <span>Find FRND</span>
            </button>
          </div>

          {/* Content Rules Notice Banner (Soft yellow card matching screenshot) */}
          {showWarningBanner && (
            <div className="p-3 sm:p-3.5 rounded-2xl bg-[#FFF9E6] text-[#7A5B00] border border-[#FDE68A] text-xs font-bold leading-relaxed relative flex items-center justify-between gap-2 shadow-xs">
              <div className="flex-1 text-center font-bold text-[12px] text-[#7A5B00]">
                Your chat access has been blocked because your messages broke our content rules.
              </div>
              <button
                onClick={() => setShowWarningBanner(false)}
                className="text-amber-800 hover:text-amber-950 p-1 rounded-full hover:bg-amber-100/60 transition-colors"
                title="Dismiss notice"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Sub Navigation Tabs: Chat (Active with pink underline) | Available */}
          <div className="flex items-center gap-8 border-b border-stone-200/80 text-sm font-bold pt-1">
            <button
              onClick={() => setSubTab('chat')}
              className={`pb-2.5 relative transition-colors ${
                subTab === 'chat' ? 'text-slate-900 font-extrabold text-base' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <span>Chat</span>
              {subTab === 'chat' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 rounded-full bg-[#E11D48]" />
              )}
            </button>

            <button
              onClick={() => setSubTab('available')}
              className={`pb-2.5 relative transition-colors ${
                subTab === 'available' ? 'text-slate-900 font-extrabold text-base' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <span>Available</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </span>
              {subTab === 'available' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 rounded-full bg-[#E11D48]" />
              )}
            </button>
          </div>

          {/* Filter Pills: All (Pink capsule) | Your turn | Sent */}
          {subTab === 'chat' && (
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => setFilterMode('all')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  filterMode === 'all'
                    ? 'bg-[#E11D48] text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-stone-50 border border-stone-200 shadow-xs'
                }`}
              >
                All
              </button>

              <button
                onClick={() => setFilterMode('your_turn')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  filterMode === 'your_turn'
                    ? 'bg-[#E11D48] text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-stone-50 border border-stone-200 shadow-xs'
                }`}
              >
                Your turn
              </button>

              <button
                onClick={() => setFilterMode('sent')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  filterMode === 'sent'
                    ? 'bg-[#E11D48] text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-stone-50 border border-stone-200 shadow-xs'
                }`}
              >
                Sent
              </button>
            </div>
          )}

          {/* TAB 1: CONVERSATIONS LIST */}
          {subTab === 'chat' && (
            <div className="space-y-1 divide-y divide-stone-200/80 pt-2">
              {filteredConversations.length === 0 ? (
                <div className="py-12 text-center text-slate-400 space-y-2">
                  <p className="text-sm font-semibold">No chats found in this filter.</p>
                  <button
                    onClick={() => setFilterMode('all')}
                    className="text-xs text-[#E11D48] font-bold underline"
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

                  return (
                    <div
                      key={conv.id}
                      onClick={() => setActiveConversationId(conv.id)}
                      className="py-3 px-2.5 flex items-center justify-between gap-3 cursor-pointer hover:bg-stone-200/40 active:bg-stone-200/70 rounded-2xl transition-colors"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        {/* Avatar with IRON/PEARL bottom capsule badge */}
                        <div className="relative shrink-0">
                          <div className="w-13 h-13 rounded-full overflow-hidden border-2 border-stone-200 bg-slate-100 shadow-xs">
                            <img
                              src={conv.participant.avatarUrl}
                              alt={conv.participant.displayName}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          </div>

                          {/* Availability status dot */}
                          {(() => {
                            const convStatus = getEffectiveStatus(conv.participant);
                            return (
                              <div
                                className="absolute top-0 right-0 w-3.5 h-3.5 rounded-full ring-2 ring-white bg-white flex items-center justify-center"
                                title={`Status: ${convStatus}`}
                              >
                                <UserStatusDot status={convStatus} size="xs" />
                              </div>
                            );
                          })()}

                          {/* Tier capsule badge */}
                          <div
                            className={`absolute -bottom-1 left-1/2 -translate-x-1/2 px-1.5 py-0.2 rounded-full text-[8px] tracking-tighter uppercase ${getBadgeStyle(
                              badgeTier
                            )}`}
                          >
                            {badgeTier}
                          </div>
                        </div>

                        {/* Name, topic and preview */}
                        <div className="min-w-0 space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <h3 className="text-sm font-bold text-slate-900 truncate">
                              {conv.participant.displayName}
                            </h3>
                            {conv.participant.activeTopic && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-pink-100 text-[#FF1493] border border-pink-200 font-bold">
                                #{conv.participant.activeTopic}
                              </span>
                            )}
                          </div>

                          {/* Message snippet: shows 'You: ' if user sent it */}
                          <p className="text-xs text-slate-600 truncate">
                            {isSentByMe ? (
                              <>
                                <span className="text-slate-400 font-medium">You: </span>
                                <span className="text-slate-300">{displaySnippet}</span>
                              </>
                            ) : (
                              <span>{rawMsg}</span>
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Timestamp & Unread badge */}
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className="text-[11px] text-slate-400 font-mono">
                          {conv.updatedAt}
                        </span>
                        {conv.unreadCount > 0 && (
                          <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-[#E11D48] text-white">
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
            <div className="space-y-3 pt-2">
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 font-semibold flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span>
                  {availableProfiles.length} friends are online and ready to chat right now!
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {availableProfiles.map((p) => (
                  <div
                    key={p.id}
                    className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.06] hover:border-white/15 transition-all flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative w-12 h-12 rounded-full overflow-hidden border border-white/10 shrink-0 bg-slate-800">
                        <img
                          src={p.avatarUrl}
                          alt={p.displayName}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-[#070B12]" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-extrabold text-black truncate">{p.displayName}</h4>
                        <p className="text-[11px] text-black font-bold truncate">
                          {p.broadLocation || p.country}
                        </p>
                        {p.activeTopic && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-pink-500/15 text-pink-300 border border-pink-500/25 font-bold">
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
                        className="px-3 py-1.5 rounded-full bg-[#E11D48] hover:bg-[#F43F5E] text-white text-xs font-bold transition-colors shadow-sm active:scale-95"
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

      {/* Coin Wallet Modal */}
      <CoinWalletModal
        isOpen={isWalletOpen}
        onClose={() => setIsWalletOpen(false)}
        onClaimDailyCoins={() => {}}
        isClaimed={false}
      />

    </div>
  );
};
