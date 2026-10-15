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
  Check,
  CheckCheck,
  Clock,
  Pin,
  Lock,
  MoreVertical,
  Info,
  Bell,
  BellOff,
  FileText,
  User,
  Heart,
  Share2,
  Plus,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useSocial } from '../../contexts/SocialContext';
import { useCall } from '../../contexts/CallContext';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import { Message, UserProfile } from '../../types';
import { UserStatusDot, getEffectiveStatus } from '../common/UserStatusBadge';
import { INITIAL_DISCOVER_PROFILES } from '../../services/mockData';
import { CoinWalletModal } from '../home/CoinWalletModal';

interface ChatViewProps {
  onOpenReportModal: (user: UserProfile) => void;
  onNavigateTab?: (tab: string) => void;
}

const QUICK_EMOJIS = ['👍', '❤️', '🔥', '👏', '😂', '🎉'];
const EXTRA_EMOJIS = ['✨', '🙏', '💯', '😍', '👀', '💡', '🚀', '☕'];
const EMOJI_OPTIONS = [...QUICK_EMOJIS, ...EXTRA_EMOJIS];

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
    typingUsers,
    setTyping,
    triggerPeerTypingSimulation,
  } = useSocial();
  const { startCall } = useCall();
  const { isHighContrast } = useAccessibility();

  // Filter tabs: 'all' | 'unread' | 'pinned' | 'online'
  const [filterTab, setFilterTab] = useState<'all' | 'unread' | 'pinned' | 'online'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [isMuted, setIsMuted] = useState(false);

  // Active chat state
  const [inputContent, setInputContent] = useState('');
  const [replyingToMessage, setReplyingToMessage] = useState<Message | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [activeReactionMessageId, setActiveReactionMessageId] = useState<string | null>(null);
  const [expandedEmojiMessageId, setExpandedEmojiMessageId] = useState<string | null>(null);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const voiceTimerRef = useRef<number | null>(null);
  const typingTimeoutRef = useRef<number | null>(null);

  // Peer typing indicator status
  const peerTypingInfo = activeConversationId ? typingUsers[activeConversationId] : null;
  const isPeerTyping = Boolean(peerTypingInfo?.isTyping);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeConversationId, isPeerTyping]);

  // Voice recording timer
  useEffect(() => {
    if (isRecordingVoice) {
      setRecordingSeconds(0);
      voiceTimerRef.current = window.setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (voiceTimerRef.current) clearInterval(voiceTimerRef.current);
    }
    return () => {
      if (voiceTimerRef.current) clearInterval(voiceTimerRef.current);
    };
  }, [isRecordingVoice]);

  // Real-time typing notification when current user types
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputContent(value);

    if (activeConversationId) {
      setTyping(activeConversationId, true, currentUser?.displayName || 'You');

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = window.setTimeout(() => {
        if (activeConversationId) {
          setTyping(activeConversationId, false, currentUser?.displayName || 'You');
        }
      }, 2000);
    }
  };

  const handleSendText = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputContent.trim()) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    if (activeConversationId) {
      setTyping(activeConversationId, false, currentUser?.displayName || 'You');
    }

    sendMessage(
      inputContent.trim(),
      'text',
      undefined,
      replyingToMessage ? replyingToMessage.id : undefined
    );
    setInputContent('');
    setReplyingToMessage(null);
    setShowEmojiPicker(false);
  };

  const handleSendVoiceNote = () => {
    if (!isRecordingVoice) {
      setIsRecordingVoice(true);
    } else {
      setIsRecordingVoice(false);
      const durationStr = `0:${recordingSeconds < 10 ? '0' : ''}${recordingSeconds || 12}`;
      sendMessage(`Voice memo (${durationStr})`, 'audio');
    }
  };

  const handleCancelVoice = () => {
    setIsRecordingVoice(false);
    setRecordingSeconds(0);
  };

  const handleSendImage = () => {
    sendMessage(
      'Shared a photograph',
      'image',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80'
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

  // Filter conversations
  const filteredConversations = conversations.filter((c) => {
    // Search query filter
    const matchesSearch =
      !searchQuery.trim() ||
      c.participant.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.participant.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.lastMessage?.content?.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterTab === 'unread') {
      return c.unreadCount > 0;
    }
    if (filterTab === 'pinned') {
      return Boolean(c.isPinned);
    }
    if (filterTab === 'online') {
      return c.participant.availabilityStatus === 'online';
    }
    return true;
  });

  // Online contacts for quick strip
  const onlineUsers = INITIAL_DISCOVER_PROFILES.filter(
    (p) => p.id !== currentUser?.id && p.availabilityStatus === 'online'
  );

  // Active participant status
  const activeParticipantStatus = activeConversation
    ? getEffectiveStatus(activeConversation.participant)
    : 'offline';

  // Shared media from current conversation messages
  const sharedMediaMessages = messages.filter(
    (m) => (m.messageType === 'image' || m.type === 'image') && m.mediaUrl
  );

  return (
    <div
      className={`w-full max-w-7xl mx-auto px-2 sm:px-4 py-2 lg:py-3 transition-colors ${
        isHighContrast ? 'bg-black text-white' : 'bg-[#F5F7FC] text-[#303641]'
      }`}
    >
      {/* Container Card */}
      <div
        className={`h-[calc(100vh-5rem)] rounded-xl border flex overflow-hidden shadow-xs ${
          isHighContrast ? 'bg-black border-white' : 'bg-white border-[#E1E5EC]'
        }`}
      >
        {/* =========================================================================
            COLUMN 1: CONVERSATION LIST (Desktop: 340-380px, Mobile: Full width if no chat active)
            ========================================================================= */}
        <aside
          className={`w-full lg:w-88 xl:w-96 flex flex-col shrink-0 border-r transition-all ${
            isHighContrast ? 'bg-black border-white' : 'bg-white border-[#E1E5EC]'
          } ${activeConversationId ? 'hidden lg:flex' : 'flex'}`}
        >
          {/* Header */}
          <div className="p-3.5 border-b border-[#E1E5EC] flex items-center justify-between gap-2">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-[#303641]">
                Messages
              </h1>
              <p className="text-[12px] text-[#7B8492]">
                {conversations.length} conversations
              </p>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsWalletOpen(true)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[#E1E5EC] bg-[#F5F7FC] text-xs font-semibold hover:border-[#1877F2]/40 transition-colors"
                title="Coin Balance"
                aria-label="Open coin wallet"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#F28C28]" />
                <span className="text-[#303641]">{currentUser?.coins ?? 80}</span>
              </button>

              <button
                onClick={() => onNavigateTab && onNavigateTab('discover')}
                className="p-1.5 rounded-lg border border-[#E1E5EC] bg-white hover:bg-[#F5F7FC] text-[#1877F2] transition-colors"
                title="Find new people"
                aria-label="Find new people"
              >
                <Users className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Search Field */}
          <div className="p-3 border-b border-[#E1E5EC]/80">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7B8492]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversations..."
                className="w-full h-9 pl-9 pr-8 text-xs rounded-lg border border-[#E1E5EC] bg-[#F5F7FC] text-[#303641] placeholder-[#7B8492] focus:bg-white focus:border-[#1877F2] focus:outline-none transition-all"
                aria-label="Search conversations"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#7B8492] hover:text-[#303641]"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Pill Filter Tabs */}
            <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto no-scrollbar py-0.5">
              {[
                { id: 'all', label: 'All' },
                { id: 'unread', label: 'Unread' },
                { id: 'pinned', label: 'Pinned' },
                { id: 'online', label: 'Online' },
              ].map((tab) => {
                const isActive = filterTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setFilterTab(tab.id as typeof filterTab)}
                    className={`px-3 py-1 rounded-full text-xs transition-colors shrink-0 ${
                      isActive
                        ? isHighContrast
                          ? 'bg-yellow-400 text-black font-bold'
                          : 'bg-[#EAF2FF] text-[#1877F2] border border-[#1877F2]/30 font-semibold'
                        : isHighContrast
                        ? 'border border-white text-white'
                        : 'bg-white text-[#7B8492] border border-[#E1E5EC] hover:bg-[#F5F7FC] hover:text-[#303641]'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Online Users Story Row */}
          <div className="px-3 py-2 border-b border-[#E1E5EC]/80 bg-[#F5F7FC]/50">
            <div className="text-[11px] font-semibold text-[#7B8492] uppercase tracking-wider mb-1.5">
              Online Now ({onlineUsers.length})
            </div>
            <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar pb-1">
              {onlineUsers.map((u) => (
                <button
                  key={u.id}
                  onClick={() => {
                    const existingConv = conversations.find((c) => c.participant.id === u.id);
                    if (existingConv) {
                      setActiveConversationId(existingConv.id);
                    } else {
                      sendConnectionRequest(u.id);
                    }
                  }}
                  className="flex flex-col items-center gap-1 shrink-0 group focus:outline-none"
                  title={`${u.displayName} (Online)`}
                >
                  <div className="relative w-10 h-10 rounded-full border-2 border-white shadow-xs group-hover:scale-105 transition-transform">
                    <img
                      src={u.avatarUrl}
                      alt={u.displayName}
                      className="w-full h-full object-cover rounded-full"
                    />
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#16865C] border-2 border-white" />
                  </div>
                  <span className="text-[10px] font-medium text-[#303641] truncate max-w-[52px]">
                    {u.displayName.split(' ')[0]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Conversation Items List */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#E1E5EC]/60">
            {filteredConversations.length > 0 ? (
              filteredConversations.map((c) => {
                const isActive = activeConversationId === c.id;
                const status = getEffectiveStatus(c.participant);
                return (
                  <button
                    key={c.id}
                    onClick={() => setActiveConversationId(c.id)}
                    className={`w-full p-3 flex items-start gap-3 transition-colors text-left relative ${
                      isActive
                        ? isHighContrast
                          ? 'bg-yellow-400/20 border-l-4 border-yellow-400'
                          : 'bg-[#EAF2FF] border-l-4 border-[#1877F2]'
                        : isHighContrast
                        ? 'hover:bg-white/10'
                        : 'hover:bg-[#F5F7FC]'
                    }`}
                  >
                    {/* Contact Avatar */}
                    <div className="relative w-11 h-11 rounded-full shrink-0 border border-[#E1E5EC] bg-slate-100">
                      <img
                        src={c.participant.avatarUrl}
                        alt={c.participant.displayName}
                        className="w-full h-full object-cover rounded-full"
                      />
                      <span
                        className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                          status === 'online'
                            ? 'bg-[#16865C]'
                            : status === 'busy'
                            ? 'bg-[#F28C28]'
                            : 'bg-slate-400'
                        }`}
                        title={`Status: ${status}`}
                      />
                    </div>

                    {/* Meta info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <h2 className="text-sm font-semibold text-[#303641] truncate">
                            {c.participant.displayName}
                          </h2>
                          {c.isPinned && (
                            <Pin className="w-3 h-3 text-[#1877F2] fill-[#1877F2] shrink-0" />
                          )}
                        </div>
                        <span className="text-[11px] text-[#7B8492] shrink-0 font-normal">
                          {c.lastMessage?.timestamp || 'Just now'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        {typingUsers[c.id]?.isTyping ? (
                          <p className="text-[12px] text-[#1877F2] font-semibold truncate flex items-center gap-1 animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#1877F2] animate-ping" />
                            <span>typing...</span>
                          </p>
                        ) : (
                          <p className="text-[12px] text-[#7B8492] truncate font-normal">
                            {c.lastMessage?.content || 'No messages yet'}
                          </p>
                        )}

                        {c.unreadCount > 0 && (
                          <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#D9485F] text-white shrink-0">
                            {c.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="p-8 text-center text-[#7B8492]">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 text-[#CBD5E1]" />
                <p className="text-xs font-medium">No conversations found</p>
                <p className="text-[11px] mt-1 text-[#7B8492]">
                  Try clearing search filters or connect from Discover tab.
                </p>
              </div>
            )}
          </div>
        </aside>

        {/* =========================================================================
            COLUMN 2: CENTRE ACTIVE CONVERSATION
            ========================================================================= */}
        <main
          className={`flex-1 flex flex-col min-w-0 bg-[#F5F7FC] relative ${
            !activeConversationId ? 'hidden lg:flex' : 'flex'
          }`}
        >
          {activeConversation && activeConversationId ? (
            <>
              {/* Header */}
              <div className="h-14 px-3 sm:px-4 border-b border-[#E1E5EC] bg-white flex items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-2.5 min-w-0">
                  {/* Mobile Back Button */}
                  <button
                    onClick={() => setActiveConversationId(null)}
                    className="p-1 rounded-lg text-[#7B8492] hover:text-[#303641] hover:bg-[#F5F7FC] lg:hidden"
                    title="Back to conversation list"
                    aria-label="Back to conversation list"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  {/* Profile Avatar */}
                  <div
                    onClick={() => onNavigateTab && onNavigateTab('profile')}
                    className="relative w-9 h-9 rounded-full shrink-0 border border-[#E1E5EC] cursor-pointer group"
                  >
                    <img
                      src={activeConversation.participant.avatarUrl}
                      alt={activeConversation.participant.displayName}
                      className="w-full h-full object-cover rounded-full"
                    />
                    <span
                      className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${
                        activeParticipantStatus === 'online'
                          ? 'bg-[#16865C]'
                          : activeParticipantStatus === 'busy'
                          ? 'bg-[#F28C28]'
                          : 'bg-slate-400'
                      }`}
                    />
                  </div>

                  {/* Name and Status */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h2 className="text-sm font-bold text-[#303641] truncate">
                        {activeConversation.participant.displayName}
                      </h2>
                      {activeConversation.participant.tier && (
                        <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-[#EAF2FF] text-[#1877F2] border border-[#1877F2]/20 uppercase">
                          {activeConversation.participant.tier}
                        </span>
                      )}
                    </div>
                    {isPeerTyping ? (
                      <div className="flex items-center gap-1.5 text-[11px] text-[#1877F2] font-semibold animate-pulse">
                        <span className="flex gap-0.5">
                          <span className="w-1.5 h-1.5 bg-[#1877F2] rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                          <span className="w-1.5 h-1.5 bg-[#1877F2] rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                          <span className="w-1.5 h-1.5 bg-[#1877F2] rounded-full animate-bounce"></span>
                        </span>
                        <span>typing...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-[11px] text-[#7B8492]">
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            activeParticipantStatus === 'online'
                              ? 'bg-[#16865C]'
                              : activeParticipantStatus === 'busy'
                              ? 'bg-[#F28C28]'
                              : 'bg-slate-400'
                          }`}
                        />
                        <span>
                          {activeParticipantStatus === 'online'
                            ? 'Active now'
                            : activeParticipantStatus === 'busy'
                            ? 'In another call (Busy)'
                            : 'Offline'}
                        </span>
                        {activeConversation.participant.activeTopic && (
                          <>
                            <span>•</span>
                            <span className="text-[#1877F2] font-medium truncate">
                              #{activeConversation.participant.activeTopic}
                            </span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Call & Action Controls */}
                <div className="flex items-center gap-1 sm:gap-1.5">
                  {/* Quick Peer Typing Simulation Trigger */}
                  <button
                    onClick={() => triggerPeerTypingSimulation(activeConversation.id)}
                    className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[#E1E5EC] bg-[#F5F7FC] hover:bg-[#EAF2FF] text-[#1877F2] hover:border-[#1877F2]/40 text-xs font-semibold transition-colors"
                    title="Simulate peer typing indicator"
                    aria-label="Simulate peer typing indicator"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1877F2] animate-ping" />
                    <span>Typing Demo</span>
                  </button>

                  <button
                    onClick={() =>
                      startCall(activeConversation.participant, 'audio')
                    }
                    className="p-2 rounded-lg border border-[#E1E5EC] bg-white hover:bg-[#EAF2FF] text-[#1877F2] hover:border-[#1877F2]/40 transition-colors"
                    title="Start Voice Call"
                    aria-label="Start Voice Call"
                  >
                    <PhoneCall className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() =>
                      startCall(activeConversation.participant, 'video')
                    }
                    className="p-2 rounded-lg border border-[#E1E5EC] bg-white hover:bg-[#EAF2FF] text-[#1877F2] hover:border-[#1877F2]/40 transition-colors"
                    title="Start Video Call"
                    aria-label="Start Video Call"
                  >
                    <Video className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() =>
                      onOpenReportModal(activeConversation.participant)
                    }
                    className="p-2 rounded-lg border border-[#E1E5EC] bg-white hover:bg-rose-50 text-[#7B8492] hover:text-[#D9485F] transition-colors"
                    title="Report or Block User"
                    aria-label="Report or Block User"
                  >
                    <ShieldAlert className="w-4 h-4" />
                  </button>

                  {/* Toggle Right Panel (Contact Info) on Desktop */}
                  <button
                    onClick={() => setShowRightPanel(!showRightPanel)}
                    className={`p-2 rounded-lg border border-[#E1E5EC] transition-colors hidden xl:flex ${
                      showRightPanel
                        ? 'bg-[#EAF2FF] text-[#1877F2] border-[#1877F2]/40'
                        : 'bg-white text-[#7B8492] hover:bg-[#F5F7FC]'
                    }`}
                    title="Toggle contact details"
                    aria-label="Toggle contact details"
                  >
                    <Info className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Message History Feed */}
              <div
                className={`flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 ${
                  isHighContrast ? 'bg-black' : 'bg-[#F5F7FC]'
                }`}
              >
                {/* Security End-to-End Encryption Notice */}
                <div className="flex items-center justify-center my-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#E1E5EC] text-[11px] text-[#7B8492] shadow-xs">
                    <Lock className="w-3 h-3 text-[#16865C]" />
                    <span>Messages are end-to-end encrypted on VibeTalk</span>
                  </div>
                </div>

                {/* Messages List */}
                {messages.map((msg) => {
                  const isMine =
                    msg.senderId === currentUser?.id ||
                    msg.senderId === 'current-user-123';

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${
                        isMine ? 'items-end' : 'items-start'
                      } group`}
                    >
                      <div className="flex items-end gap-1.5 max-w-[85%] sm:max-w-[70%]">
                        {/* Received Avatar */}
                        {!isMine && (
                          <div className="w-6 h-6 rounded-full overflow-hidden shrink-0 border border-[#E1E5EC] mb-1">
                            <img
                              src={activeConversation.participant.avatarUrl}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}

                        <div className="relative">
                          {/* Bubble Container */}
                          <div
                            className={`p-3 rounded-2xl text-[14px] leading-relaxed break-words shadow-xs ${
                              isMine
                                ? isHighContrast
                                  ? 'bg-yellow-400 text-black font-semibold rounded-br-xs'
                                  : 'bg-[#1877F2] text-white rounded-br-xs'
                                : isHighContrast
                                ? 'bg-black text-white border-2 border-white rounded-bl-xs'
                                : 'bg-white text-[#303641] border border-[#E1E5EC] rounded-bl-xs'
                            }`}
                          >
                            {/* Replying Context */}
                            {msg.replyToId && (
                              <div
                                className={`text-xs px-2 py-1 rounded mb-1.5 border-l-2 font-medium ${
                                  isMine
                                    ? 'bg-white/10 text-white/90 border-white'
                                    : 'bg-[#F5F7FC] text-[#7B8492] border-[#1877F2]'
                                }`}
                              >
                                Replying to earlier message
                              </div>
                            )}

                            {/* Message Content Type: Audio Voice Note */}
                            {msg.messageType === 'audio' || msg.type === 'audio' ? (
                              <div className="flex items-center gap-2.5 py-0.5">
                                <button
                                  type="button"
                                  onClick={() => toggleAudioPlay(msg.id)}
                                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                                    isMine
                                      ? 'bg-white text-[#1877F2]'
                                      : 'bg-[#1877F2] text-white'
                                  }`}
                                  aria-label="Play voice note"
                                >
                                  {playingAudioId === msg.id ? (
                                    <Pause className="w-4 h-4 fill-current" />
                                  ) : (
                                    <Play className="w-4 h-4 fill-current ml-0.5" />
                                  )}
                                </button>
                                <div className="flex-1 min-w-[120px]">
                                  <div className="flex items-center gap-1 h-5">
                                    <div
                                      className={`w-1 bg-current rounded-full ${
                                        playingAudioId === msg.id
                                          ? 'h-4 animate-audio-bar'
                                          : 'h-2'
                                      }`}
                                    />
                                    <div
                                      className={`w-1 bg-current rounded-full ${
                                        playingAudioId === msg.id
                                          ? 'h-5 animate-audio-bar'
                                          : 'h-3'
                                      }`}
                                    />
                                    <div
                                      className={`w-1 bg-current rounded-full ${
                                        playingAudioId === msg.id
                                          ? 'h-3 animate-audio-bar'
                                          : 'h-4'
                                      }`}
                                    />
                                    <div
                                      className={`w-1 bg-current rounded-full ${
                                        playingAudioId === msg.id
                                          ? 'h-5 animate-audio-bar'
                                          : 'h-2'
                                      }`}
                                    />
                                    <div
                                      className={`w-1 bg-current rounded-full ${
                                        playingAudioId === msg.id
                                          ? 'h-4 animate-audio-bar'
                                          : 'h-3'
                                      }`}
                                    />
                                  </div>
                                  <span
                                    className={`text-[11px] font-medium ${
                                      isMine ? 'text-white/80' : 'text-[#7B8492]'
                                    }`}
                                  >
                                    {msg.content || 'Voice Memo'}
                                  </span>
                                </div>
                              </div>
                            ) : (msg.messageType === 'image' || msg.type === 'image') && msg.mediaUrl ? (
                              <div>
                                <img
                                  src={msg.mediaUrl}
                                  alt="Shared content"
                                  className="rounded-lg max-h-60 object-cover w-full mb-1 border border-black/10"
                                />
                                {msg.content && <div>{msg.content}</div>}
                              </div>
                            ) : (
                              <span>{msg.content}</span>
                            )}

                            {/* Timestamp & Read Receipt */}
                            <div
                              className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${
                                isMine
                                  ? 'text-white/80 font-normal'
                                  : 'text-[#7B8492] font-normal'
                              }`}
                            >
                              <span>
                                {msg.timestamp ||
                                  (msg.createdAt
                                    ? new Date(msg.createdAt).toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                      })
                                    : '12:30 PM')}
                              </span>
                              {isMine && (
                                <div className="inline-flex items-center gap-0.5 ml-0.5 shrink-0" title={`Message status: ${msg.status || 'read'}`}>
                                  {msg.status === 'sending' ? (
                                    <Clock className="w-3 h-3 text-white/70 animate-spin" />
                                  ) : msg.status === 'sent' ? (
                                    <Check className="w-3 h-3 text-white/80 stroke-[2.5]" />
                                  ) : msg.status === 'delivered' ? (
                                    <CheckCheck className="w-3 h-3 text-white/80 stroke-[2.5]" />
                                  ) : (
                                    <span className="inline-flex items-center gap-0.5 text-sky-200">
                                      <CheckCheck className="w-3.5 h-3.5 stroke-[2.5] text-sky-200" />
                                      <span className="text-[9px] font-bold tracking-wider uppercase text-sky-100">Seen</span>
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Quick Reactions Bar & Action Trigger */}
                          <div
                            className={`absolute -top-3.5 ${
                              isMine ? 'right-2' : 'left-2'
                            } flex items-center gap-1 z-10`}
                          >
                            {/* Quick Emojis Pill (Visible on group hover or active reaction trigger) */}
                            <div
                              className={`items-center gap-0.5 px-2 py-0.5 rounded-full bg-white border border-[#E1E5EC] shadow-md transition-all ${
                                activeReactionMessageId === msg.id
                                  ? 'flex scale-100'
                                  : 'hidden group-hover:flex'
                              }`}
                            >
                              {QUICK_EMOJIS.map((emoji) => {
                                const isAlreadyReacted = Boolean(
                                  currentUser && msg.reactions?.[emoji]?.includes(currentUser.id)
                                );
                                return (
                                  <button
                                    key={emoji}
                                    type="button"
                                    onClick={() => {
                                      reactToMessage(msg.id, emoji);
                                      setActiveReactionMessageId(null);
                                    }}
                                    className={`hover:scale-130 transition-transform text-xs p-1 rounded-full ${
                                      isAlreadyReacted ? 'bg-[#EAF2FF] scale-110 font-bold' : ''
                                    }`}
                                    title={`React with ${emoji}`}
                                    aria-label={`React with ${emoji}`}
                                  >
                                    {emoji}
                                  </button>
                                );
                              })}

                              {/* More reactions dropdown toggle */}
                              <button
                                type="button"
                                onClick={() =>
                                  setExpandedEmojiMessageId(
                                    expandedEmojiMessageId === msg.id ? null : msg.id
                                  )
                                }
                                className="p-0.5 text-[#7B8492] hover:text-[#1877F2] rounded-full hover:bg-[#F5F7FC] transition-colors"
                                title="More reactions"
                                aria-label="More reactions"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>

                            {/* Touch-Friendly Reaction Trigger Button */}
                            <button
                              type="button"
                              onClick={() =>
                                setActiveReactionMessageId(
                                  activeReactionMessageId === msg.id ? null : msg.id
                                )
                              }
                              className={`p-1 rounded-full bg-white border border-[#E1E5EC] shadow-xs text-[#7B8492] hover:text-[#1877F2] hover:bg-[#EAF2FF] transition-all opacity-0 group-hover:opacity-100 ${
                                activeReactionMessageId === msg.id
                                  ? 'opacity-100 text-[#1877F2] bg-[#EAF2FF]'
                                  : ''
                              }`}
                              title="React to message"
                              aria-label="React to message"
                            >
                              <Smile className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Expanded Emoji Tray if opened */}
                          {expandedEmojiMessageId === msg.id && (
                            <div
                              className={`absolute -top-11 ${
                                isMine ? 'right-0' : 'left-0'
                              } flex items-center gap-1 p-1.5 rounded-xl bg-white border border-[#E1E5EC] shadow-lg z-20`}
                            >
                              {EXTRA_EMOJIS.map((emoji) => (
                                <button
                                  key={emoji}
                                  type="button"
                                  onClick={() => {
                                    reactToMessage(msg.id, emoji);
                                    setExpandedEmojiMessageId(null);
                                    setActiveReactionMessageId(null);
                                  }}
                                  className="hover:scale-130 transition-transform text-sm p-1 rounded-md hover:bg-[#F5F7FC]"
                                  title={`React with ${emoji}`}
                                >
                                  {emoji}
                                </button>
                              ))}
                              <button
                                type="button"
                                onClick={() => setExpandedEmojiMessageId(null)}
                                className="p-1 text-[#7B8492] hover:text-[#303641]"
                                aria-label="Close emoji picker"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          )}

                          {/* Render Reactions if present */}
                          {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                            <div className="flex flex-wrap items-center gap-1 mt-1">
                              {Object.entries(msg.reactions).map(([emoji, userIds]) => {
                                const hasMyReaction = Boolean(
                                  currentUser && userIds.includes(currentUser.id)
                                );
                                return (
                                  <button
                                    key={emoji}
                                    type="button"
                                    onClick={() => reactToMessage(msg.id, emoji)}
                                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] transition-all cursor-pointer ${
                                      hasMyReaction
                                        ? 'bg-[#EAF2FF] border border-[#1877F2]/50 text-[#1877F2] font-semibold shadow-xs'
                                        : 'bg-white border border-[#E1E5EC] text-[#303641] hover:bg-[#F5F7FC] shadow-xs'
                                    }`}
                                    title={
                                      hasMyReaction
                                        ? 'You reacted (click to remove)'
                                        : `Reacted by ${userIds.length} user${userIds.length > 1 ? 's' : ''}`
                                    }
                                    aria-label={`Reaction ${emoji} ${userIds.length}`}
                                  >
                                    <span>{emoji}</span>
                                    <span className="text-[10px]">{userIds.length}</span>
                                  </button>
                                );
                              })}

                              {/* Quick Add Reaction Pill */}
                              <button
                                type="button"
                                onClick={() =>
                                  setActiveReactionMessageId(
                                    activeReactionMessageId === msg.id ? null : msg.id
                                  )
                                }
                                className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] bg-white border border-[#E1E5EC] text-[#7B8492] hover:text-[#1877F2] hover:border-[#1877F2]/40 transition-colors shadow-xs"
                                title="Add reaction"
                                aria-label="Add reaction"
                              >
                                <Smile className="w-3 h-3" />
                                <span>+</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Real-time Peer Typing Indicator in Feed */}
                {isPeerTyping && (
                  <div className="flex items-end gap-1.5 max-w-[85%] sm:max-w-[70%]">
                    <div className="w-6 h-6 rounded-full overflow-hidden shrink-0 border border-[#E1E5EC] mb-1">
                      <img
                        src={activeConversation.participant.avatarUrl}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="bg-white border border-[#E1E5EC] text-[#303641] rounded-2xl rounded-bl-xs px-3.5 py-2.5 shadow-xs flex items-center gap-2">
                      <div className="flex items-center gap-1 h-3">
                        <span className="w-2 h-2 rounded-full bg-[#1877F2] animate-bounce [animation-delay:-0.3s]" />
                        <span className="w-2 h-2 rounded-full bg-[#1877F2] animate-bounce [animation-delay:-0.15s]" />
                        <span className="w-2 h-2 rounded-full bg-[#1877F2] animate-bounce" />
                      </div>
                      <span className="text-xs text-[#7B8492] font-medium">
                        {activeConversation.participant.firstName || activeConversation.participant.displayName} is typing...
                      </span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Replying Context Bar */}
              {replyingToMessage && (
                <div className="px-4 py-2 border-t border-[#E1E5EC] bg-white flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 text-[#7B8492] truncate">
                    <span className="font-semibold text-[#1877F2]">
                      Replying to:
                    </span>
                    <span className="truncate">{replyingToMessage.content}</span>
                  </div>
                  <button
                    onClick={() => setReplyingToMessage(null)}
                    className="text-[#7B8492] hover:text-[#303641]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Emoji Picker Popover */}
              {showEmojiPicker && (
                <div className="p-2 border-t border-[#E1E5EC] bg-white flex items-center gap-2 overflow-x-auto">
                  {EMOJI_OPTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => {
                        setInputContent((prev) => prev + emoji);
                        setShowEmojiPicker(false);
                      }}
                      className="text-lg p-1.5 hover:bg-[#F5F7FC] rounded-lg transition-transform hover:scale-125"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}

              {/* Voice Recording Active Bar */}
              {isRecordingVoice ? (
                <div className="p-3 border-t border-[#E1E5EC] bg-white flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-rose-600 font-semibold text-xs">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping" />
                    <span>
                      Recording Voice Note: 0:
                      {recordingSeconds < 10
                        ? `0${recordingSeconds}`
                        : recordingSeconds}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCancelVoice}
                      className="px-3 py-1.5 rounded-lg border border-[#E1E5EC] text-xs font-medium text-[#7B8492] hover:bg-[#F5F7FC]"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSendVoiceNote}
                      className="px-4 py-1.5 rounded-lg bg-[#1877F2] text-white text-xs font-medium hover:bg-[#166fe5]"
                    >
                      Send Audio
                    </button>
                  </div>
                </div>
              ) : (
                /* Standard Message Input Form */
                <div className="p-3 border-t border-[#E1E5EC] bg-white">
                  <form
                    onSubmit={handleSendText}
                    className="flex items-center gap-2"
                  >
                    {/* Photo / Attachment */}
                    <button
                      type="button"
                      onClick={handleSendImage}
                      className="p-2 rounded-lg text-[#7B8492] hover:text-[#1877F2] hover:bg-[#EAF2FF] transition-colors"
                      title="Attach image"
                      aria-label="Attach image"
                    >
                      <ImageIcon className="w-5 h-5" />
                    </button>

                    {/* Emoji */}
                    <button
                      type="button"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className={`p-2 rounded-lg transition-colors ${
                        showEmojiPicker
                          ? 'text-[#1877F2] bg-[#EAF2FF]'
                          : 'text-[#7B8492] hover:text-[#1877F2] hover:bg-[#EAF2FF]'
                      }`}
                      title="Select emoji"
                      aria-label="Select emoji"
                    >
                      <Smile className="w-5 h-5" />
                    </button>

                    {/* Voice Memo Button */}
                    <button
                      type="button"
                      onClick={handleSendVoiceNote}
                      className="p-2 rounded-lg text-[#7B8492] hover:text-[#1877F2] hover:bg-[#EAF2FF] transition-colors"
                      title="Record voice note"
                      aria-label="Record voice note"
                    >
                      <Mic className="w-5 h-5" />
                    </button>

                    {/* Text Field */}
                    <input
                      type="text"
                      value={inputContent}
                      onChange={handleInputChange}
                      placeholder="Type a message..."
                      className="flex-1 h-10 px-3.5 text-xs sm:text-sm rounded-lg border border-[#E1E5EC] bg-[#F5F7FC] text-[#303641] placeholder-[#7B8492] focus:bg-white focus:border-[#1877F2] focus:outline-none transition-all"
                      aria-label="Type a message"
                    />

                    {/* Send Button */}
                    <button
                      type="submit"
                      disabled={!inputContent.trim()}
                      className={`h-10 px-4 rounded-lg flex items-center justify-center gap-1.5 text-xs font-semibold transition-all ${
                        inputContent.trim()
                          ? 'bg-[#1877F2] text-white hover:bg-[#166fe5] shadow-xs'
                          : 'bg-[#E1E5EC] text-[#7B8492] cursor-not-allowed'
                      }`}
                      aria-label="Send message"
                    >
                      <Send className="w-4 h-4" />
                      <span className="hidden sm:inline">Send</span>
                    </button>
                  </form>
                </div>
              )}
            </>
          ) : (
            /* Empty State when no conversation is selected */
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-white">
              <div className="w-16 h-16 rounded-2xl bg-[#EAF2FF] text-[#1877F2] flex items-center justify-center mb-4 border border-[#1877F2]/20 shadow-xs">
                <MessageSquare className="w-8 h-8" />
              </div>
              <h2 className="text-lg font-bold text-[#303641] mb-1">
                Your VibeTalk Conversations
              </h2>
              <p className="text-xs text-[#7B8492] max-w-sm mb-5 leading-relaxed">
                Connect with verified people through secure end-to-end messaging, crystal-clear voice notes, and video calls.
              </p>
              <button
                onClick={() => onNavigateTab && onNavigateTab('discover')}
                className="px-4 py-2 rounded-lg bg-[#1877F2] text-white text-xs font-semibold hover:bg-[#166fe5] transition-all shadow-xs flex items-center gap-1.5"
              >
                <Users className="w-4 h-4" />
                <span>Explore Discover Rooms</span>
              </button>
            </div>
          )}
        </main>

        {/* =========================================================================
            COLUMN 3: RIGHT PANEL (Contact Profile, Shared Media, Files, Conversation Settings)
            ========================================================================= */}
        {activeConversation && showRightPanel && (
          <aside
            className={`w-72 xl:w-80 border-l shrink-0 hidden xl:flex flex-col bg-white overflow-y-auto transition-colors ${
              isHighContrast ? 'bg-black border-white' : 'bg-white border-[#E1E5EC]'
            }`}
          >
            {/* Header */}
            <div className="p-3.5 border-b border-[#E1E5EC] flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#7B8492]">
                Contact Profile
              </h3>
              <button
                onClick={() => setShowRightPanel(false)}
                className="p-1 rounded text-[#7B8492] hover:text-[#303641]"
                title="Close sidebar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Profile Overview */}
            <div className="p-4 flex flex-col items-center text-center border-b border-[#E1E5EC]">
              <div className="relative w-20 h-20 rounded-full border-2 border-[#E1E5EC] p-0.5 mb-2.5">
                <img
                  src={activeConversation.participant.avatarUrl}
                  alt={activeConversation.participant.displayName}
                  className="w-full h-full object-cover rounded-full"
                />
                <span
                  className={`absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${
                    activeParticipantStatus === 'online'
                      ? 'bg-[#16865C]'
                      : 'bg-slate-400'
                  }`}
                />
              </div>

              <h4 className="text-base font-bold text-[#303641]">
                {activeConversation.participant.displayName}
              </h4>
              <p className="text-xs text-[#7B8492]">
                @{activeConversation.participant.username}
              </p>

              {activeConversation.participant.bio && (
                <p className="text-xs text-[#7B8492] mt-2 leading-relaxed px-2">
                  {activeConversation.participant.bio}
                </p>
              )}

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-2 w-full mt-4">
                <button
                  onClick={() =>
                    startCall(activeConversation.participant, 'audio')
                  }
                  className="flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg border border-[#E1E5EC] text-xs font-medium text-[#303641] hover:bg-[#F5F7FC]"
                >
                  <PhoneCall className="w-3.5 h-3.5 text-[#1877F2]" />
                  <span>Call</span>
                </button>

                <button
                  onClick={() =>
                    startCall(activeConversation.participant, 'video')
                  }
                  className="flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg border border-[#E1E5EC] text-xs font-medium text-[#303641] hover:bg-[#F5F7FC]"
                >
                  <Video className="w-3.5 h-3.5 text-[#1877F2]" />
                  <span>Video</span>
                </button>
              </div>
            </div>

            {/* Shared Photos & Media */}
            <div className="p-4 border-b border-[#E1E5EC]">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-semibold text-[#303641]">
                  Shared Media
                </h4>
                <span className="text-[11px] text-[#7B8492]">
                  {sharedMediaMessages.length} files
                </span>
              </div>

              {sharedMediaMessages.length > 0 ? (
                <div className="grid grid-cols-3 gap-1.5">
                  {sharedMediaMessages.map((m) => (
                    <div
                      key={m.id}
                      className="aspect-square rounded-lg overflow-hidden border border-[#E1E5EC]"
                    >
                      <img
                        src={m.mediaUrl}
                        alt="Shared"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-[11px] text-[#7B8492] py-2 text-center bg-[#F5F7FC] rounded-lg">
                  No photos shared yet
                </div>
              )}
            </div>

            {/* Privacy & Conversation Settings */}
            <div className="p-4 space-y-3">
              <h4 className="text-xs font-semibold text-[#303641]">
                Conversation Settings
              </h4>

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-[#303641]">
                  {isMuted ? (
                    <BellOff className="w-4 h-4 text-[#7B8492]" />
                  ) : (
                    <Bell className="w-4 h-4 text-[#1877F2]" />
                  )}
                  <span>Mute Notifications</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMuted(!isMuted)}
                  className={`w-9 h-5 rounded-full transition-colors relative ${
                    isMuted ? 'bg-[#1877F2]' : 'bg-[#E1E5EC]'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                      isMuted ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <div className="flex items-center gap-2 text-[#303641]">
                  <Lock className="w-4 h-4 text-[#16865C]" />
                  <span>Encryption</span>
                </div>
                <span className="text-[11px] font-semibold text-[#16865C]">
                  Verified
                </span>
              </div>

              <div className="border-t border-[#E1E5EC] pt-2 space-y-1.5">
                <button
                  onClick={() =>
                    onOpenReportModal(activeConversation.participant)
                  }
                  className="w-full text-left py-1 text-xs text-[#D9485F] hover:underline flex items-center gap-2"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Report or Block Contact</span>
                </button>
              </div>
            </div>
          </aside>
        )}
      </div>

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
