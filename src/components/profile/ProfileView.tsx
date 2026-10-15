import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  Share2,
  MessageSquare,
  UserPlus,
  UserCheck,
  Check,
  CheckCircle2,
  Sliders,
  Eye,
  X,
  Heart,
  Volume2,
  Sparkles,
  PhoneCall,
  Video,
  Copy,
  Tag,
  Trophy,
  Flame,
  Crown,
  ShieldCheck,
  MapPin,
  Clock,
  Gift,
  Plus,
  Lock,
  Edit3,
  Globe2,
  Play,
  Pause,
  ExternalLink,
} from 'lucide-react';
import { UserProfile, ProfileBadge } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useSocial } from '../../contexts/SocialContext';
import { useCall } from '../../contexts/CallContext';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import {
  PORTRAIT_KRISTIN,
  PORTRAIT_STORY_CYAN,
  PORTRAIT_SUSHMITHA,
  PORTRAIT_RUHI,
  PORTRAIT_ANANYA,
  PORTRAIT_MILKEE,
  PORTRAIT_VICHU,
  PORTRAIT_RAKHI,
  AVATAR_MARCUS,
  AVATAR_CLARA,
  INITIAL_DISCOVER_PROFILES,
} from '../../services/mockData';
import {
  UserStatusDot,
  getEffectiveStatus,
  AvailabilityStatus,
} from '../common/UserStatusBadge';
import { ProfilePreviewMode, ProfileOptionsModal } from './ProfileOptionsModal';
import { InterestTagPickerModal } from './InterestTagPickerModal';
import { CoinWalletModal } from '../home/CoinWalletModal';
import { getInterestIcon, calculateProfileMatch } from '../../services/interestTags';

interface ProfileViewProps {
  onOpenPrivacy: () => void;
  onOpenVerificationModal: () => void;
  onOpenSubscription: () => void;
  onNavigateTab?: (tab: string) => void;
  targetProfile?: UserProfile | null;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  onOpenPrivacy,
  onOpenVerificationModal,
  onOpenSubscription,
  onNavigateTab,
  targetProfile,
}) => {
  const { currentUser, updateCurrentUserProfile } = useAuth();
  const {
    connectedUserIds,
    pendingRequestIds,
    sendConnectionRequest,
    removeConnection,
    preferences,
    updatePreferences,
    setActiveConversationId,
    submitReport,
    blockUser,
  } = useSocial();
  const { startCall } = useCall();
  const { isHighContrast } = useAccessibility();

  // Active profile selection
  const [selectedProfileId, setSelectedProfileId] = useState<string>(
    targetProfile?.id || currentUser?.id || 'usr_me_001'
  );

  useEffect(() => {
    if (targetProfile?.id) {
      setSelectedProfileId(targetProfile.id);
    }
  }, [targetProfile]);

  // Available international roster
  const internationalRoster: UserProfile[] = [
    ...(currentUser ? [currentUser] : []),
    ...INITIAL_DISCOVER_PROFILES,
  ];

  const activeProfile: UserProfile =
    internationalRoster.find((p) => p.id === selectedProfileId) ||
    currentUser ||
    INITIAL_DISCOVER_PROFILES[0];

  const isOwnProfile = activeProfile.id === currentUser?.id;

  // State
  const [isBioExpanded, setIsBioExpanded] = useState(false);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [previewMode, setPreviewMode] = useState<ProfilePreviewMode>('normal');
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
  const [activeMediaItem, setActiveMediaItem] = useState<{ url: string; title: string } | null>(null);
  const [likedPhotos, setLikedPhotos] = useState<Record<string, boolean>>({});
  const [isVoiceBioPlaying, setIsVoiceBioPlaying] = useState(false);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [giftSentMessage, setGiftSentMessage] = useState<string | null>(null);
  const [showStatusPicker, setShowStatusPicker] = useState(false);
  const [showInterestPicker, setShowInterestPicker] = useState(false);
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [showReportSuccess, setShowReportSuccess] = useState(false);

  const isConnected = connectedUserIds.includes(activeProfile.id);
  const isPending = pendingRequestIds.includes(activeProfile.id);

  // Field privacy logic based on active preview mode
  const isPublicPreview = isOwnProfile && previewMode === 'public';
  const isConnectedPreview = isOwnProfile && previewMode === 'connected';

  const isPhotoObscured =
    isPublicPreview &&
    (preferences.photoVisibility === 'connections' || preferences.photoVisibility === 'hidden');

  const displayBio = (() => {
    if (isPublicPreview && preferences.bioVisibility !== 'everyone') {
      return '🔒 Bio is private and only visible to approved connections.';
    }
    if (isConnectedPreview && preferences.bioVisibility === 'hidden') {
      return '🔒 Bio is hidden by user privacy settings.';
    }
    return (
      activeProfile.bio ||
      "I'm a warm and creative individual, passionate about photography, cultural conversations, and music. Hoping to make meaningful global connections here on VibeTalk!"
    );
  })();

  const isLanguagesHidden =
    (isPublicPreview && preferences.languagesVisibility !== 'everyone') ||
    (isConnectedPreview && preferences.languagesVisibility === 'hidden');

  const isInterestsHidden =
    (isPublicPreview && preferences.interestsVisibility !== 'everyone') ||
    (isConnectedPreview && preferences.interestsVisibility === 'hidden');

  // Effective status
  const effectiveStatus: AvailabilityStatus = getEffectiveStatus(activeProfile);
  const displayStatus =
    isPublicPreview && !preferences.showOnlineStatus
      ? 'offline'
      : effectiveStatus;

  // Handlers
  const handleShare = () => {
    const url = `${window.location.origin}/profile/${activeProfile.username || activeProfile.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      });
    } else {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleMessage = () => {
    if (activeProfile.id === 'usr_kristin_watson') {
      setActiveConversationId('conv_kristin');
    } else if (activeProfile.id === 'usr_daniel_garcia') {
      setActiveConversationId('conv_daniel');
    } else if (activeProfile.id === 'usr_ruhi_201') {
      setActiveConversationId('conv_resilient');
    } else {
      setActiveConversationId('conv_clara');
    }
    if (onNavigateTab) {
      onNavigateTab('messages');
    }
  };

  const handleStartAudio = () => {
    startCall(activeProfile, 'audio');
  };

  const handleStartVideo = () => {
    startCall(activeProfile, 'video');
  };

  const toggleVoiceBio = () => {
    setIsVoiceBioPlaying(!isVoiceBioPlaying);
  };

  const handleSendGift = (giftName: string, cost: number) => {
    setShowGiftModal(false);
    setGiftSentMessage(`Sent ${giftName} (🪙 ${cost}) to ${activeProfile.displayName}!`);
    setTimeout(() => setGiftSentMessage(null), 3500);
  };

  const handleSaveInterests = (newTags: string[]) => {
    if (isOwnProfile) {
      updateCurrentUserProfile({ interests: newTags });
    }
    setShowInterestPicker(false);
  };

  const handleUpdateStatus = (newStatus: AvailabilityStatus) => {
    if (isOwnProfile) {
      updateCurrentUserProfile({ availabilityStatus: newStatus });
      setShowStatusPicker(false);
    }
  };

  // Curated story moments matching reference
  const stories = [
    {
      id: 'story_1',
      time: '35m',
      title: 'City Lights',
      image: PORTRAIT_RUHI,
      badge: '35m ago',
    },
    {
      id: 'story_2',
      time: '15m',
      title: 'Neon Bloom',
      image: PORTRAIT_STORY_CYAN,
      badge: '15m ago',
    },
    {
      id: 'story_3',
      time: '1h',
      title: 'Sunset Pulse',
      image: PORTRAIT_SUSHMITHA,
      badge: '1h ago',
    },
  ];

  // Curated media gallery items
  const galleryItems = [
    {
      id: 'photo_1',
      url: PORTRAIT_RUHI,
      title: 'Neon Silhouette',
      span: 'col-span-1 row-span-2 aspect-[3/4]',
    },
    {
      id: 'photo_2',
      url: PORTRAIT_STORY_CYAN,
      title: 'Cyan Ethereal Glance',
      span: 'col-span-2 row-span-1 aspect-[16/9]',
    },
    {
      id: 'photo_3',
      url: PORTRAIT_ANANYA,
      title: 'Warm Mood Glow',
      span: 'col-span-1 aspect-square',
    },
    {
      id: 'photo_4',
      url: AVATAR_MARCUS,
      title: 'City Reflections',
      span: 'col-span-1 aspect-square',
    },
    {
      id: 'photo_5',
      url: PORTRAIT_KRISTIN,
      title: 'Prism Portrait',
      span: 'col-span-1 aspect-square',
    },
    {
      id: 'photo_6',
      url: PORTRAIT_SUSHMITHA,
      title: 'Golden Sunset Glance',
      span: 'col-span-3 aspect-[16/7]',
    },
  ];

  const friendsAvatars = [PORTRAIT_SUSHMITHA, PORTRAIT_ANANYA, AVATAR_CLARA];
  const groupAvatars = [PORTRAIT_RUHI, AVATAR_MARCUS, PORTRAIT_MILKEE];

  // Country Flag helper
  const getCountryFlag = (country?: string) => {
    if (!country) return '🌐';
    const c = country.toLowerCase();
    if (c.includes('france')) return '🇫🇷';
    if (c.includes('united kingdom') || c.includes('uk')) return '🇬🇧';
    if (c.includes('germany')) return '🇩🇪';
    if (c.includes('united states') || c.includes('usa')) return '🇺🇸';
    if (c.includes('canada')) return '🇨🇦';
    if (c.includes('singapore')) return '🇸🇬';
    if (c.includes('india')) return '🇮🇳';
    if (c.includes('spain')) return '🇪🇸';
    return '🌐';
  };

  // Compatibility calculation
  const matchInfo = currentUser ? calculateProfileMatch(currentUser, activeProfile) : null;
  const currentInterests = activeProfile.interests || ['Photography', 'Music', 'Travel', 'Art'];
  const currentBadges: ProfileBadge[] = activeProfile.unlockedBadges || [
    {
      id: 'b1',
      name: 'Vibe Creator',
      description: 'Active voice host & content sharer',
      icon: '✨',
      tier: 'gold',
      unlockedAt: '2026-02-10',
    },
    {
      id: 'b2',
      name: 'Safe Speaker',
      description: '100% positive community feedback',
      icon: '🛡️',
      tier: 'silver',
      unlockedAt: '2026-03-01',
    },
    {
      id: 'b3',
      name: 'Global Connector',
      description: 'Spoken across 10+ timezones',
      icon: '🌐',
      tier: 'bronze',
      unlockedAt: '2026-03-15',
    },
  ];

  return (
    <div
      className={`min-h-[calc(100vh-4.5rem)] pb-28 font-sans transition-colors ${
        isHighContrast ? 'bg-black text-white' : 'bg-[#F5F7FC] text-[#303641]'
      }`}
    >
      <div className="max-w-2xl mx-auto px-3 sm:px-6 py-3 sm:py-4 space-y-3.5">
        
        {/* =========================================================================
            1. TOP BAR: BACK BUTTON, ROSTER SELECTOR, COINS, PRIVACY & OPTIONS
            ========================================================================= */}
        <div
          className={`p-2.5 sm:p-3 rounded-xl border flex items-center justify-between gap-2 shadow-xs ${
            isHighContrast ? 'bg-black border-white' : 'bg-white border-[#E1E5EC]'
          }`}
        >
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigateTab && onNavigateTab('home')}
              className="p-1.5 rounded-lg border border-[#E1E5EC] bg-white hover:bg-[#F5F7FC] text-[#303641] transition-colors"
              title="Back to Home"
              aria-label="Back to Home"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h1 className="text-base sm:text-lg font-bold text-[#303641] tracking-tight">
              Profile
            </h1>
          </div>

          {/* Quick Roster Selector */}
          <div className="hidden sm:flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {internationalRoster.slice(0, 5).map((m) => {
              const isSelected = m.id === activeProfile.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setSelectedProfileId(m.id)}
                  className={`px-2.5 py-1 rounded-full text-xs transition-colors shrink-0 ${
                    isSelected
                      ? 'bg-[#EAF2FF] text-[#1877F2] border border-[#1877F2]/40 font-semibold'
                      : 'bg-white text-[#7B8492] border border-[#E1E5EC] hover:bg-[#F5F7FC] hover:text-[#303641]'
                  }`}
                >
                  <span>{m.displayName.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>

          {/* Controls: Coins, Preview Mode, Options, Privacy */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setIsWalletOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[#E1E5EC] bg-[#F5F7FC] hover:bg-[#EAF2FF] text-xs font-semibold text-[#303641] transition-colors"
              title="Open Coin Wallet"
              aria-label="Coin Wallet"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#F28C28]" />
              <span>{currentUser?.coins ?? 80}</span>
            </button>

            {isOwnProfile && (
              <button
                onClick={() => setPreviewMode(previewMode === 'normal' ? 'public' : 'normal')}
                className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-colors flex items-center gap-1 ${
                  previewMode !== 'normal'
                    ? 'bg-[#1877F2] text-white border-[#1877F2]'
                    : 'bg-white border-[#E1E5EC] text-[#7B8492] hover:bg-[#F5F7FC] hover:text-[#303641]'
                }`}
                title="Preview profile as visitor"
              >
                <Eye className="w-3.5 h-3.5" />
                <span className="hidden md:inline">View as</span>
              </button>
            )}

            <button
              onClick={() => setShowOptionsModal(true)}
              className="p-1.5 rounded-lg border border-[#E1E5EC] bg-white hover:bg-[#F5F7FC] text-[#7B8492] hover:text-[#303641] transition-colors"
              title="Profile Options"
              aria-label="Profile Options"
            >
              <Sliders className="w-4 h-4 text-[#1877F2]" />
            </button>

            <button
              onClick={onOpenPrivacy}
              className="px-2.5 py-1 rounded-lg border border-[#E1E5EC] bg-white hover:bg-[#F5F7FC] text-xs font-medium text-[#7B8492] hover:text-[#303641] transition-colors"
            >
              Privacy
            </button>
          </div>
        </div>

        {/* Mobile Roster Selector Bar */}
        <div className="flex sm:hidden items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {internationalRoster.slice(0, 6).map((m) => {
            const isSelected = m.id === activeProfile.id;
            return (
              <button
                key={m.id}
                onClick={() => setSelectedProfileId(m.id)}
                className={`px-3 py-1 rounded-full text-xs transition-colors shrink-0 flex items-center gap-1 ${
                  isSelected
                    ? 'bg-[#EAF2FF] text-[#1877F2] border border-[#1877F2]/40 font-semibold'
                    : 'bg-white text-[#7B8492] border border-[#E1E5EC]'
                }`}
              >
                <span>{m.displayName.split(' ')[0]}</span>
                {m.id === currentUser?.id && <span className="text-[10px] font-bold">★</span>}
              </button>
            );
          })}
        </div>

        {/* Profile Privacy Preview Active Banner */}
        {isOwnProfile && previewMode !== 'normal' && (
          <div className="p-3 rounded-xl bg-[#EAF2FF] border border-[#1877F2]/30 flex items-center justify-between gap-2 text-xs text-[#1877F2]">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#1877F2] shrink-0" />
              <div>
                <span className="font-bold">
                  Preview Mode:{' '}
                  {previewMode === 'public'
                    ? 'Public Visitor'
                    : previewMode === 'connected'
                    ? 'Connected User'
                    : 'Private View'}
                </span>
                <p className="text-[11px] text-[#7B8492]">
                  Simulating audience visibility controls according to your privacy rules.
                </p>
              </div>
            </div>
            <button
              onClick={() => setPreviewMode('normal')}
              className="px-2.5 py-1 rounded-lg bg-white border border-[#1877F2]/30 text-xs font-semibold text-[#1877F2] hover:bg-[#1877F2] hover:text-white transition-colors"
            >
              Exit
            </button>
          </div>
        )}

        {/* =========================================================================
            2. GIVEN PROFILE PAGE HERO: TOP 3 STORIES & OVERLAPPING AVATAR
            ========================================================================= */}
        <div
          className={`rounded-xl border overflow-hidden p-3 sm:p-4 shadow-xs relative ${
            isHighContrast ? 'bg-black border-white' : 'bg-white border-[#E1E5EC]'
          }`}
        >
          {/* Top 3 Story / Moments Cards */}
          <div className="relative pb-14">
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {stories.map((story, idx) => (
                <div
                  key={story.id}
                  onClick={() => setActiveStoryIndex(idx)}
                  className="relative h-44 sm:h-52 rounded-xl overflow-hidden cursor-pointer group border border-[#E1E5EC] hover:border-[#1877F2]/40 transition-all shadow-xs"
                >
                  <img
                    src={story.image}
                    alt={story.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-md text-[10px] font-semibold text-[#303641] shadow-xs">
                    {story.badge}
                  </div>
                  <div className="absolute bottom-2 left-2 right-2 text-white text-xs font-medium truncate drop-shadow">
                    {story.title}
                  </div>
                </div>
              ))}
            </div>

            {/* Overlapping Hero Avatar */}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center">
              <div className="relative p-1 rounded-full bg-white border-2 border-[#1877F2] shadow-md">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden bg-[#F5F7FC] flex items-center justify-center">
                  {isPhotoObscured ? (
                    <div className="w-full h-full bg-[#F5F7FC] flex flex-col items-center justify-center p-2 text-center text-[#7B8492]">
                      <Lock className="w-6 h-6 text-[#1877F2] mb-1" />
                      <span className="text-[10px] font-semibold">Private Photo</span>
                    </div>
                  ) : (
                    <img
                      src={activeProfile.avatarUrl || PORTRAIT_KRISTIN}
                      alt={activeProfile.displayName}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>

                {/* Status Dot */}
                <div
                  className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-white border border-[#E1E5EC] flex items-center justify-center shadow-xs cursor-pointer"
                  onClick={() => isOwnProfile && setShowStatusPicker(!showStatusPicker)}
                  title={`Status: ${displayStatus}`}
                >
                  <UserStatusDot status={displayStatus} size="sm" />
                </div>
              </div>
            </div>
          </div>

          {/* Identity & Status */}
          <div className="pt-8 text-center space-y-1.5">
            <div className="flex items-center justify-center gap-1.5">
              <h2 className="text-xl sm:text-2xl font-bold text-[#303641]">
                {activeProfile.displayName}
              </h2>
              <div className="w-4 h-4 rounded-full bg-[#1877F2] flex items-center justify-center text-white" title="Verified Member">
                <Check className="w-2.5 h-2.5 stroke-[3]" />
              </div>
              {activeProfile.age && (
                <span className="text-sm text-[#7B8492] font-normal">
                  {activeProfile.age}
                </span>
              )}
            </div>

            {/* Online Indicator & Location */}
            <div className="flex items-center justify-center gap-3 text-xs text-[#7B8492]">
              <span className="flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    displayStatus === 'online'
                      ? 'bg-[#16865C]'
                      : displayStatus === 'busy'
                      ? 'bg-[#F28C28]'
                      : 'bg-slate-400'
                  }`}
                />
                <span className="font-semibold text-[#16865C] capitalize">
                  {displayStatus}
                </span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <span>{getCountryFlag(activeProfile.country)}</span>
                <span>{activeProfile.country || 'International'}</span>
              </span>
            </div>

            {/* Bio with ...More */}
            <div className="max-w-md mx-auto text-xs sm:text-sm text-[#303641] leading-relaxed pt-1">
              <p className={isBioExpanded ? '' : 'line-clamp-2'}>
                {displayBio}
              </p>
              {displayBio.length > 80 && (
                <button
                  onClick={() => setIsBioExpanded(!isBioExpanded)}
                  className="text-[#1877F2] hover:underline font-semibold text-xs ml-1 cursor-pointer"
                >
                  {isBioExpanded ? 'Show Less' : '... More'}
                </button>
              )}
            </div>

            {/* Spoken Languages */}
            {!isLanguagesHidden && (
              <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
                {(activeProfile.languages || ['English', 'French']).map((lang) => (
                  <span
                    key={lang}
                    className="px-2.5 py-0.5 rounded-full bg-[#F5F7FC] border border-[#E1E5EC] text-[#303641] text-[11px] font-medium"
                  >
                    {lang}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* =========================================================================
              3. ACTION BUTTONS: SHARE, PRIMARY "MESSAGE", CONNECT, VOICE/VIDEO CALL
              ========================================================================= */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 pt-4 border-t border-[#E1E5EC] mt-4">
            {/* Share / Copy Profile */}
            <button
              onClick={handleShare}
              className="w-10 h-10 rounded-lg border border-[#E1E5EC] bg-white hover:bg-[#F5F7FC] flex items-center justify-center text-[#7B8492] hover:text-[#303641] transition-colors"
              title={copiedLink ? 'Link Copied!' : 'Share Profile'}
              aria-label="Share Profile"
            >
              {copiedLink ? (
                <Check className="w-4 h-4 text-[#16865C]" />
              ) : (
                <Share2 className="w-4 h-4" />
              )}
            </button>

            {/* Primary Message Button (Blue) */}
            <button
              onClick={handleMessage}
              className="flex-1 max-w-[160px] h-10 rounded-lg bg-[#1877F2] hover:bg-[#166fe5] text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Message</span>
            </button>

            {/* Connect Button */}
            {!isOwnProfile && (
              <button
                onClick={
                  isConnected
                    ? () => removeConnection(activeProfile.id)
                    : () => sendConnectionRequest(activeProfile.id)
                }
                className={`h-10 px-4 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-colors ${
                  isConnected
                    ? 'bg-[#EAF2FF] border-[#1877F2]/40 text-[#1877F2]'
                    : isPending
                    ? 'bg-amber-50 border-amber-200 text-amber-700'
                    : 'bg-white border-[#E1E5EC] text-[#303641] hover:bg-[#F5F7FC]'
                }`}
              >
                {isConnected ? (
                  <>
                    <UserCheck className="w-4 h-4 text-[#16865C]" />
                    <span>Connected</span>
                  </>
                ) : isPending ? (
                  <>
                    <Clock className="w-4 h-4" />
                    <span>Pending</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 text-[#1877F2]" />
                    <span>Connect</span>
                  </>
                )}
              </button>
            )}

            {/* Audio Call */}
            <button
              onClick={handleStartAudio}
              className="w-10 h-10 rounded-lg border border-[#E1E5EC] bg-white hover:bg-[#EAF2FF] text-[#1877F2] hover:border-[#1877F2]/40 flex items-center justify-center transition-colors"
              title="Voice Call"
              aria-label="Voice Call"
            >
              <PhoneCall className="w-4 h-4" />
            </button>

            {/* Video Call */}
            <button
              onClick={handleStartVideo}
              className="w-10 h-10 rounded-lg border border-[#E1E5EC] bg-white hover:bg-[#EAF2FF] text-[#1877F2] hover:border-[#1877F2]/40 flex items-center justify-center transition-colors"
              title="Video Call"
              aria-label="Video Call"
            >
              <Video className="w-4 h-4" />
            </button>

            {/* Send Gift */}
            <button
              onClick={() => setShowGiftModal(true)}
              className="w-10 h-10 rounded-lg border border-[#E1E5EC] bg-white hover:bg-[#F5F7FC] text-[#F28C28] flex items-center justify-center transition-colors"
              title="Send Gift"
              aria-label="Send Gift"
            >
              <Gift className="w-4 h-4" />
            </button>
          </div>

          {/* Feedback message for gift */}
          {giftSentMessage && (
            <div className="mt-3 p-2 rounded-lg bg-[#EAF2FF] border border-[#1877F2]/30 text-xs font-semibold text-[#1877F2] text-center">
              ✨ {giftSentMessage}
            </div>
          )}

          {/* Status selector popup if own profile */}
          {showStatusPicker && isOwnProfile && (
            <div className="p-3 rounded-xl bg-white border border-[#E1E5EC] space-y-2 mt-3 shadow-md">
              <p className="text-xs font-semibold text-[#303641]">Update Live Status:</p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleUpdateStatus('online')}
                  className="p-2 rounded-lg border border-[#E1E5EC] hover:border-[#16865C] text-xs font-semibold text-[#16865C] flex items-center justify-center gap-1.5"
                >
                  <span className="w-2 h-2 rounded-full bg-[#16865C]" />
                  <span>Online</span>
                </button>
                <button
                  onClick={() => handleUpdateStatus('busy')}
                  className="p-2 rounded-lg border border-[#E1E5EC] hover:border-[#F28C28] text-xs font-semibold text-[#F28C28] flex items-center justify-center gap-1.5"
                >
                  <span className="w-2 h-2 rounded-full bg-[#F28C28]" />
                  <span>Busy</span>
                </button>
                <button
                  onClick={() => handleUpdateStatus('offline')}
                  className="p-2 rounded-lg border border-[#E1E5EC] hover:border-slate-400 text-xs font-semibold text-[#7B8492] flex items-center justify-center gap-1.5"
                >
                  <span className="w-2 h-2 rounded-full bg-slate-400" />
                  <span>Invisible</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* =========================================================================
            4. SOCIAL FLOW & MUTUAL GROUPS PILL CARDS
            ========================================================================= */}
        <div className="grid grid-cols-2 gap-3">
          {/* Friends Flow */}
          <div
            className={`p-3.5 rounded-xl border flex flex-col items-center justify-center text-center space-y-1.5 shadow-xs ${
              isHighContrast ? 'bg-black border-white' : 'bg-white border-[#E1E5EC]'
            }`}
          >
            <div className="flex items-center -space-x-2">
              {friendsAvatars.map((url, i) => (
                <div
                  key={i}
                  className="w-7 h-7 rounded-full overflow-hidden border-2 border-white bg-[#F5F7FC]"
                >
                  <img src={url} alt="Friend" className="w-full h-full object-cover" />
                </div>
              ))}
              <div className="px-1.5 py-0.5 rounded-full bg-[#F5F7FC] border border-[#E1E5EC] text-[10px] font-bold text-[#7B8492]">
                +123
              </div>
            </div>
            <span className="text-xs font-semibold text-[#303641]">Friends Flow</span>
          </div>

          {/* Mutual Groups */}
          <div
            className={`p-3.5 rounded-xl border flex flex-col items-center justify-center text-center space-y-1.5 shadow-xs ${
              isHighContrast ? 'bg-black border-white' : 'bg-white border-[#E1E5EC]'
            }`}
          >
            <div className="flex items-center -space-x-2">
              {groupAvatars.map((url, i) => (
                <div
                  key={i}
                  className="w-7 h-7 rounded-full overflow-hidden border-2 border-white bg-[#F5F7FC]"
                >
                  <img src={url} alt="Group" className="w-full h-full object-cover" />
                </div>
              ))}
              <div className="px-1.5 py-0.5 rounded-full bg-[#F5F7FC] border border-[#E1E5EC] text-[10px] font-bold text-[#7B8492]">
                +12
              </div>
            </div>
            <span className="text-xs font-semibold text-[#303641]">Mutual Groups</span>
          </div>
        </div>

        {/* =========================================================================
            5. VOICE INTRODUCTION AUDIO PROMPT
            ========================================================================= */}
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 shadow-xs ${
            isHighContrast ? 'bg-black border-white' : 'bg-white border-[#E1E5EC]'
          }`}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={toggleVoiceBio}
              className="w-10 h-10 rounded-full bg-[#1877F2] text-white flex items-center justify-center shadow-xs hover:bg-[#166fe5] transition-colors shrink-0"
              title="Play voice intro"
              aria-label="Play voice intro"
            >
              {isVoiceBioPlaying ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current ml-0.5" />
              )}
            </button>
            <div>
              <div className="flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-[#1877F2]" />
                <h3 className="text-xs font-bold text-[#303641]">Voice Introduction</h3>
                <span className="text-[10px] text-[#7B8492]">0:15</span>
              </div>
              <p className="text-[11px] text-[#7B8492]">
                "{activeProfile.displayName}’s philosophy on meaningful friendships"
              </p>
            </div>
          </div>

          {/* Equalizer Frequency Bars */}
          <div className="flex items-center gap-1 h-6 shrink-0 pr-1">
            {[10, 20, 8, 24, 16, 26, 12, 18, 6, 22].map((h, i) => (
              <span
                key={i}
                style={{ height: isVoiceBioPlaying ? undefined : `${h * 0.7}px` }}
                className={`w-1 rounded-full ${
                  isVoiceBioPlaying ? 'bg-[#1877F2] animate-audio-bar' : 'bg-[#E1E5EC]'
                }`}
              />
            ))}
          </div>
        </div>

        {/* =========================================================================
            6. CURATED MEDIA GALLERY GRID
            ========================================================================= */}
        <div
          className={`p-3.5 sm:p-4 rounded-xl border space-y-3 shadow-xs ${
            isHighContrast ? 'bg-black border-white' : 'bg-white border-[#E1E5EC]'
          }`}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#303641]">
              Media & Moments ({galleryItems.length})
            </h3>
            <span className="text-xs text-[#7B8492]">Public Gallery</span>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
            {galleryItems.map((item) => (
              <div
                key={item.id}
                onClick={() => setActiveMediaItem({ url: item.url, title: item.title })}
                className={`relative rounded-xl overflow-hidden cursor-pointer group border border-[#E1E5EC] hover:border-[#1877F2]/40 transition-all ${item.span}`}
              >
                <img
                  src={item.url}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                  <span className="text-white text-[11px] font-medium drop-shadow truncate">
                    {item.title}
                  </span>
                </div>
                {/* Like Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLikedPhotos((prev) => ({ ...prev, [item.id]: !prev[item.id] }));
                  }}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 backdrop-blur-md text-[#303641] hover:text-[#D9485F] transition-colors"
                >
                  <Heart
                    className={`w-3.5 h-3.5 ${
                      likedPhotos[item.id] ? 'fill-[#D9485F] text-[#D9485F]' : ''
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* =========================================================================
            7. CURATED INTEREST TAGS & COMPATIBILITY
            ========================================================================= */}
        <div
          className={`p-3.5 sm:p-4 rounded-xl border space-y-3 shadow-xs ${
            isHighContrast ? 'bg-black border-white' : 'bg-white border-[#E1E5EC]'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-[#1877F2]" />
              <h3 className="text-sm font-bold text-[#303641]">Interests & Passions</h3>
            </div>
            {isOwnProfile && (
              <button
                onClick={() => setShowInterestPicker(true)}
                className="text-xs text-[#1877F2] font-semibold hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Edit Tags</span>
              </button>
            )}
          </div>

          {matchInfo && !isOwnProfile && (
            <div className="p-3 rounded-lg bg-[#EAF2FF] border border-[#1877F2]/30 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 font-semibold text-[#1877F2]">
                <Sparkles className="w-4 h-4 text-[#1877F2]" />
                <span>{matchInfo.matchPercentage}% Vibe Compatibility</span>
              </div>
              <span className="text-[#7B8492]">
                {matchInfo.sharedInterests.length} shared interests
              </span>
            </div>
          )}

          {isInterestsHidden ? (
            <div className="p-3 rounded-lg bg-[#F5F7FC] border border-[#E1E5EC] text-xs text-[#7B8492] italic flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#7B8492]" />
              <span>Interest tags are private and only visible to approved connections.</span>
            </div>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {currentInterests.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full bg-[#F5F7FC] border border-[#E1E5EC] text-[#303641] text-xs font-medium flex items-center gap-1.5"
                >
                  <span>{getInterestIcon(tag)}</span>
                  <span>{tag}</span>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* =========================================================================
            8. UNLOCKED BADGES & HONORS
            ========================================================================= */}
        <div
          className={`p-3.5 sm:p-4 rounded-xl border space-y-3 shadow-xs ${
            isHighContrast ? 'bg-black border-white' : 'bg-white border-[#E1E5EC]'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-[#F28C28]" />
              <h3 className="text-sm font-bold text-[#303641]">Unlocked Badges</h3>
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-[#F28C28] bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              <Flame className="w-3.5 h-3.5 fill-[#F28C28]" />
              <span>{activeProfile.dailyStreak || 5} Day Streak</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {currentBadges.map((badge) => (
              <div
                key={badge.id}
                className="p-3 rounded-lg border border-[#E1E5EC] bg-[#F5F7FC] flex items-start gap-2.5"
              >
                <div className="w-8 h-8 rounded-lg bg-white border border-[#E1E5EC] flex items-center justify-center text-base shrink-0 shadow-xs">
                  {badge.icon}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-[#303641] truncate">{badge.name}</h4>
                    <span className="text-[9px] uppercase font-bold text-[#1877F2]">
                      {badge.tier}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#7B8492] line-clamp-2">{badge.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* =========================================================================
            9. COMMUNITY SAFETY & REPORT
            ========================================================================= */}
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 shadow-xs ${
            isHighContrast ? 'bg-black border-white' : 'bg-white border-[#E1E5EC]'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#16865C] border border-emerald-200 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#303641]">
                VibeTalk Verified Community Member
              </h4>
              <p className="text-[11px] text-[#7B8492]">
                End-to-end encrypted chats, verified profile checks, zero-harassment pledge.
              </p>
            </div>
          </div>

          {!isOwnProfile && (
            <button
              onClick={() => {
                submitReport(activeProfile.id, 'inappropriate_content', 'Flagged from profile');
                setShowReportSuccess(true);
                setTimeout(() => setShowReportSuccess(false), 2500);
              }}
              className="text-xs text-[#D9485F] hover:underline font-semibold shrink-0"
            >
              Report
            </button>
          )}
        </div>

        {showReportSuccess && (
          <div className="p-2.5 text-center text-xs text-[#16865C] font-semibold bg-emerald-50 rounded-lg border border-emerald-200">
            Report submitted to safety moderation team.
          </div>
        )}

      </div>

      {/* =========================================================================
          STORY VIEWER MODAL
          ========================================================================= */}
      {activeStoryIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
          <div className="relative w-full max-w-sm rounded-2xl overflow-hidden bg-black text-white shadow-2xl">
            {/* Story Image */}
            <img
              src={stories[activeStoryIndex].image}
              alt={stories[activeStoryIndex].title}
              className="w-full h-[500px] object-cover"
            />
            {/* Story Bar */}
            <div className="absolute top-3 left-3 right-3 flex items-center gap-1.5">
              <div className="flex-1 h-1 bg-white/40 rounded-full overflow-hidden">
                <div className="w-full h-full bg-white animate-pulse" />
              </div>
              <button
                onClick={() => setActiveStoryIndex(null)}
                className="p-1 rounded-full bg-black/40 text-white hover:bg-black/60"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <h4 className="font-bold text-sm">{stories[activeStoryIndex].title}</h4>
              <p className="text-xs text-white/80">{stories[activeStoryIndex].badge}</p>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MEDIA LIGHTBOX MODAL
          ========================================================================= */}
      {activeMediaItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
          <div className="relative max-w-xl w-full bg-white rounded-xl overflow-hidden shadow-2xl">
            <div className="p-3 border-b border-[#E1E5EC] flex items-center justify-between">
              <span className="text-sm font-bold text-[#303641]">{activeMediaItem.title}</span>
              <button
                onClick={() => setActiveMediaItem(null)}
                className="p-1 text-[#7B8492] hover:text-[#303641]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <img
              src={activeMediaItem.url}
              alt={activeMediaItem.title}
              className="w-full max-h-[70vh] object-contain bg-slate-900"
            />
          </div>
        </div>
      )}

      {/* =========================================================================
          SEND GIFT MODAL (KisanShop Clean White Theme)
          ========================================================================= */}
      {showGiftModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white border border-[#E1E5EC] p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-[#F28C28]" />
                <h3 className="font-bold text-[#303641] text-base">Send Gift</h3>
              </div>
              <button
                onClick={() => setShowGiftModal(false)}
                className="text-[#7B8492] hover:text-[#303641]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#7B8492]">
              Surprise {activeProfile.displayName} with an appreciation gift:
            </p>

            <div className="grid grid-cols-3 gap-2.5">
              {[
                { name: 'Red Rose', icon: '🌹', cost: 10 },
                { name: 'Coffee', icon: '☕', cost: 25 },
                { name: 'Gold Crown', icon: '👑', cost: 50 },
                { name: 'Star', icon: '⭐', cost: 80 },
                { name: 'Diamond', icon: '💎', cost: 150 },
                { name: 'Rocket', icon: '🚀', cost: 300 },
              ].map((gift) => (
                <button
                  key={gift.name}
                  onClick={() => handleSendGift(gift.name, gift.cost)}
                  className="p-3 rounded-lg border border-[#E1E5EC] hover:border-[#1877F2]/40 hover:bg-[#F5F7FC] text-center space-y-1 transition-all active:scale-95"
                >
                  <div className="text-2xl">{gift.icon}</div>
                  <div className="text-[11px] font-semibold text-[#303641] truncate">{gift.name}</div>
                  <div className="text-[10px] text-[#F28C28] font-bold">
                    🪙 {gift.cost}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Interest Tag Picker Modal */}
      <InterestTagPickerModal
        isOpen={showInterestPicker}
        onClose={() => setShowInterestPicker(false)}
        initialInterests={currentInterests}
        onSave={handleSaveInterests}
      />

      {/* Coin Wallet Modal */}
      <CoinWalletModal
        isOpen={isWalletOpen}
        onClose={() => setIsWalletOpen(false)}
        onClaimDailyCoins={() => {}}
        isClaimed={false}
      />

      {/* Profile Options & Privacy Preview Modal */}
      <ProfileOptionsModal
        isOpen={showOptionsModal}
        onClose={() => setShowOptionsModal(false)}
        profile={activeProfile}
        isOwnProfile={isOwnProfile}
        preferences={preferences}
        onUpdatePreferences={updatePreferences}
        previewMode={previewMode}
        onSetPreviewMode={setPreviewMode}
        isConnected={isConnected}
        isPending={isPending}
        isFollowing={false}
        onToggleFollow={() => {}}
        onSendConnectionRequest={() => sendConnectionRequest(activeProfile.id)}
        onRemoveConnection={() => removeConnection(activeProfile.id)}
        onOpenReportModal={() => {
          submitReport(activeProfile.id, 'inappropriate_content', 'Flagged from profile options');
          setShowReportSuccess(true);
          setTimeout(() => setShowReportSuccess(false), 2500);
        }}
        onBlockUser={() => blockUser(activeProfile.id)}
        onOpenInterestPicker={() => setShowInterestPicker(true)}
        onOpenChat={handleMessage}
        onStartAudioCall={handleStartAudio}
        onStartVideoCall={handleStartVideo}
      />
    </div>
  );
};
