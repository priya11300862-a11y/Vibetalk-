import React, { useState } from 'react';
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
} from 'lucide-react';
import { UserProfile, UserPreferences } from '../../types';
import { useSocial } from '../../contexts/SocialContext';
import { useCall } from '../../contexts/CallContext';
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
} from '../../services/mockData';
import { ProfilePreviewMode, ProfileOptionsModal } from './ProfileOptionsModal';

interface AuroraProfileViewProps {
  profile: UserProfile;
  isOwnProfile: boolean;
  onNavigateTab?: (tab: string) => void;
  onOpenPrivacy: () => void;
  onSwitchStyle?: () => void;
  availableProfiles: UserProfile[];
  onSelectProfile: (id: string) => void;
}

export const AuroraProfileView: React.FC<AuroraProfileViewProps> = ({
  profile,
  isOwnProfile,
  onNavigateTab,
  onOpenPrivacy,
  onSwitchStyle,
  availableProfiles,
  onSelectProfile,
}) => {
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

  const [isBioExpanded, setIsBioExpanded] = useState(false);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [previewMode, setPreviewMode] = useState<ProfilePreviewMode>('normal');
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
  const [activeMediaItem, setActiveMediaItem] = useState<string | null>(null);
  const [likedPhotos, setLikedPhotos] = useState<Record<string, boolean>>({});

  const isConnected = connectedUserIds.includes(profile.id);
  const isPending = pendingRequestIds.includes(profile.id);

  // Field privacy logic based on active preview mode:
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
      profile.bio ||
      "I'm a generous and girl, hope my enthusiasm add more color to your life... More"
    );
  })();

  const handleShare = () => {
    const url = `${window.location.origin}/profile/${profile.username || profile.id}`;
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
    if (profile.id === 'usr_kristin_watson') {
      setActiveConversationId('conv_kristin');
    } else if (profile.id === 'usr_daniel_garcia') {
      setActiveConversationId('conv_daniel');
    } else {
      setActiveConversationId('conv_clara');
    }
    if (onNavigateTab) {
      onNavigateTab('messages');
    }
  };

  // Stories data matching top 3 cards in reference image
  const stories = [
    {
      id: 'story_1',
      time: '35m',
      title: 'City Lights',
      image: PORTRAIT_RUHI,
      bg: 'from-purple-900/40 to-slate-900/80',
    },
    {
      id: 'story_2',
      time: '15m',
      title: 'Neon Bloom',
      image: PORTRAIT_STORY_CYAN,
      badge: '15m',
      bg: 'from-cyan-900/40 to-slate-900/80',
    },
    {
      id: 'story_3',
      time: '1h ago',
      title: 'Sunset Pulse',
      image: PORTRAIT_SUSHMITHA,
      badge: '1h ago',
      bg: 'from-amber-900/40 to-slate-900/80',
    },
  ];

  // Curated media gallery items matching screenshot grid
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
      title: 'Prism Strands',
      span: 'col-span-1 aspect-square',
    },
    {
      id: 'photo_6',
      url: PORTRAIT_SUSHMITHA,
      title: 'Golden Sunset',
      span: 'col-span-3 aspect-[16/7]',
    },
  ];

  const friendsAvatars = [PORTRAIT_SUSHMITHA, PORTRAIT_ANANYA, AVATAR_CLARA];
  const groupAvatars = [PORTRAIT_RUHI, AVATAR_MARCUS, PORTRAIT_MILKEE];

  return (
    <div className="min-h-screen bg-[#060A13] text-white selection:bg-[#00D2FF]/30 pb-28 relative overflow-hidden font-sans">
      {/* Top Ambient Aurora Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-xl h-96 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#00D2FF]/20 via-[#0C2238]/30 to-transparent pointer-events-none blur-2xl" />

      {/* Main Container */}
      <div className="relative z-10 max-w-md mx-auto px-4 pt-3 space-y-4">
        {/* Device Status Bar Mockup */}
        <div className="flex items-center justify-between text-xs text-slate-300 font-semibold px-2 py-1 select-none">
          <span>9:41</span>
          <div className="flex items-center gap-1.5 text-[11px]">
            <span>􀙇</span>
            <span>􀐫</span>
            <div className="w-5 h-2.5 rounded-sm border border-slate-300 flex items-center p-0.5">
              <div className="w-full h-full bg-slate-300 rounded-[1px]" />
            </div>
          </div>
        </div>

        {/* Top Header Bar */}
        <div className="flex items-center justify-between py-1">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigateTab && onNavigateTab('home')}
              className="p-2 rounded-full bg-white/[0.08] hover:bg-white/[0.15] border border-white/10 text-white transition-all active:scale-95"
              title="Back"
            >
              <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
            </button>
            <span className="text-xs font-bold text-slate-400">Profile</span>
          </div>

          {/* Quick Roster Dropdown Pill */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 max-w-[190px]">
            {availableProfiles.slice(0, 4).map((m) => (
              <button
                key={m.id}
                onClick={() => onSelectProfile(m.id)}
                className={`px-2 py-1 rounded-full text-[11px] font-bold whitespace-nowrap transition-all ${
                  m.id === profile.id
                    ? 'bg-[#00D2FF] text-slate-950 font-black shadow-xs'
                    : 'bg-white/[0.06] hover:bg-white/[0.12] text-slate-300 border border-white/10'
                }`}
              >
                {m.displayName.split(' ')[0]}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            {onSwitchStyle && (
              <button
                onClick={onSwitchStyle}
                className="px-2.5 py-1 rounded-full bg-white/[0.08] hover:bg-white/[0.15] border border-white/10 text-[10.5px] font-bold text-[#00D2FF] transition-all"
                title="Switch view layout"
              >
                Classic View
              </button>
            )}

            <button
              onClick={() => setShowOptionsModal(true)}
              className="p-2 rounded-full bg-white/[0.08] hover:bg-white/[0.15] border border-white/10 text-white transition-all active:scale-95"
              title="Profile Options"
            >
              <Sliders className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Active Privacy Preview Banner if engaged */}
        {isOwnProfile && previewMode !== 'normal' && (
          <div className="p-3 rounded-2xl bg-gradient-to-r from-purple-900/90 to-slate-900/95 border border-purple-400/50 shadow-xl flex items-center justify-between gap-2 animate-in fade-in text-xs">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-purple-300" />
              <div>
                <span className="font-extrabold text-purple-200">
                  Previewing as:{' '}
                  {previewMode === 'public'
                    ? 'Public Visitor'
                    : previewMode === 'connected'
                    ? 'Connected User'
                    : 'Private View'}
                </span>
                <p className="text-[10px] text-purple-300/80">
                  Simulating audience visibility controls
                </p>
              </div>
            </div>
            <button
              onClick={() => setPreviewMode('normal')}
              className="px-2 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white font-bold text-[10px]"
            >
              Exit
            </button>
          </div>
        )}

        {/* =========================================================================
            SECTION 1: TOP 3 MOMENTS / STORIES CARDS
            ========================================================================= */}
        <div className="relative pt-2 pb-12">
          {/* 3 Story Cards side-by-side */}
          <div className="grid grid-cols-3 gap-2.5">
            {stories.map((story, idx) => (
              <div
                key={story.id}
                onClick={() => setActiveStoryIndex(idx)}
                className="relative h-48 sm:h-52 rounded-2xl overflow-hidden cursor-pointer group shadow-xl border border-white/10 hover:border-white/30 transition-all hover:scale-[1.02]"
              >
                {/* Background Image */}
                <img
                  src={story.image}
                  alt={story.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Subtle dark gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30" />

                {/* Floating time badge at top */}
                {story.badge && (
                  <div className="absolute top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-[9px] font-bold text-white shadow-xs">
                    {story.badge}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* =========================================================================
              SECTION 2: HERO AVATAR WITH GLOWING HALO (Overlapping center card)
              ========================================================================= */}
          <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center">
            {/* Outer Glowing Halo Ring */}
            <div className="relative p-[3.5px] rounded-full bg-gradient-to-tr from-[#00E5FF] via-[#7B2CBF] to-[#FF2E93] shadow-[0_0_30px_rgba(0,229,255,0.5)]">
              {/* Inner Avatar Frame */}
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden bg-slate-950 flex items-center justify-center">
                {isPhotoObscured ? (
                  <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center p-2 text-center">
                    <span className="text-xl">🔒</span>
                    <span className="text-[8.5px] font-bold text-slate-400 mt-1 uppercase">
                      Private Photo
                    </span>
                  </div>
                ) : (
                  <img
                    src={profile.avatarUrl || PORTRAIT_KRISTIN}
                    alt={profile.displayName}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            SECTION 3: NAME, VERIFIED BADGE, ONLINE STATUS, BIO
            ========================================================================= */}
        <div className="pt-2 text-center space-y-1.5">
          {/* Name & Blue Verified Badge */}
          <div className="flex items-center justify-center gap-1.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              {profile.displayName || 'Kristin Watson'}
            </h1>
            {/* Scalloped Blue Verified Badge matching screenshot */}
            <div className="w-4 h-4 rounded-full bg-[#3B82F6] flex items-center justify-center text-white shadow-xs">
              <Check className="w-2.5 h-2.5 stroke-[3.5]" />
            </div>
          </div>

          {/* Neon Online Indicator */}
          <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-[#00E676]">
            <span className="w-2 h-2 rounded-full bg-[#00E676] animate-pulse" />
            <span>Online</span>
          </div>

          {/* Bio Text with "... More" */}
          <div className="max-w-xs mx-auto text-xs text-slate-300 font-normal leading-relaxed pt-1">
            <p className={isBioExpanded ? '' : 'line-clamp-2'}>
              {displayBio}
            </p>
            {displayBio.length > 70 && (
              <button
                onClick={() => setIsBioExpanded(!isBioExpanded)}
                className="text-slate-400 hover:text-white font-semibold ml-1 cursor-pointer"
              >
                {isBioExpanded ? 'Less' : '... More'}
              </button>
            )}
          </div>
        </div>

        {/* =========================================================================
            SECTION 4: THE 3 GLASS ACTION BUTTONS (Share, "Message" Pill, Add Friend)
            ========================================================================= */}
        <div className="flex items-center justify-center gap-3 pt-2">
          {/* 1. Share Button (Curved arrow glass circle) */}
          <button
            onClick={handleShare}
            className="w-12 h-12 rounded-full bg-white/[0.08] hover:bg-white/[0.16] border border-white/10 flex items-center justify-center text-slate-200 transition-all active:scale-95 shadow-md"
            title={copiedLink ? 'Link Copied!' : 'Share Profile'}
          >
            {copiedLink ? (
              <Check className="w-5 h-5 text-[#00E676]" />
            ) : (
              <Share2 className="w-5 h-5" />
            )}
          </button>

          {/* 2. Primary "Message" Cyan Capsule Button */}
          <button
            onClick={handleMessage}
            className="flex-1 max-w-[160px] py-3 rounded-full bg-gradient-to-r from-[#00D2FF] to-[#0099FF] text-white font-black text-sm tracking-wide shadow-[0_4px_22px_rgba(0,210,255,0.45)] hover:brightness-110 active:scale-95 transition-all text-center flex items-center justify-center gap-2"
          >
            <span>Message</span>
          </button>

          {/* 3. Add Friend / Connect Glass Circle */}
          <button
            onClick={
              isConnected
                ? () => removeConnection(profile.id)
                : () => sendConnectionRequest(profile.id)
            }
            className={`w-12 h-12 rounded-full border flex items-center justify-center transition-all active:scale-95 shadow-md ${
              isConnected
                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                : isPending
                ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                : 'bg-white/[0.08] hover:bg-white/[0.16] border-white/10 text-slate-200'
            }`}
            title={isConnected ? 'Connected' : isPending ? 'Pending Request' : 'Connect'}
          >
            {isConnected ? (
              <UserCheck className="w-5 h-5 text-emerald-400" />
            ) : (
              <UserPlus className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* =========================================================================
            SECTION 5: SOCIAL FLOW & MUTUAL GROUPS PILL BLOCKS
            ========================================================================= */}
        <div className="grid grid-cols-2 gap-3 pt-3">
          {/* Left Block: Friends Flow */}
          <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/5 flex flex-col items-center justify-center text-center space-y-1 shadow-sm">
            <div className="flex items-center -space-x-2">
              {friendsAvatars.map((url, i) => (
                <div
                  key={i}
                  className="w-7 h-7 rounded-full overflow-hidden border-2 border-[#060A13] bg-slate-800"
                >
                  <img src={url} alt="Friend" className="w-full h-full object-cover" />
                </div>
              ))}
              <div className="px-1.5 py-0.5 rounded-full bg-[#1A2338] border border-white/10 text-[9px] font-extrabold text-slate-300">
                +123
              </div>
            </div>
            <span className="text-xs text-slate-400 font-medium tracking-tight">
              Friends Flow
            </span>
          </div>

          {/* Right Block: Mutual Groups */}
          <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/5 flex flex-col items-center justify-center text-center space-y-1 shadow-sm">
            <div className="flex items-center -space-x-2">
              {groupAvatars.map((url, i) => (
                <div
                  key={i}
                  className="w-7 h-7 rounded-full overflow-hidden border-2 border-[#060A13] bg-slate-800"
                >
                  <img src={url} alt="Group" className="w-full h-full object-cover" />
                </div>
              ))}
              <div className="px-1.5 py-0.5 rounded-full bg-[#1A2338] border border-white/10 text-[9px] font-extrabold text-slate-300">
                +12
              </div>
            </div>
            <span className="text-xs text-slate-400 font-medium tracking-tight">
              Mutual Groups
            </span>
          </div>
        </div>

        {/* =========================================================================
            SECTION 6: CURATED MEDIA / PHOTO GALLERY GRID (Asymmetric Masonry)
            ========================================================================= */}
        <div className="pt-2 space-y-2.5">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1 font-semibold">
            <span>Moments &amp; Highlights</span>
            <span className="text-[11px] font-mono text-[#00D2FF]">
              {galleryItems.length} Photos
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            {galleryItems.map((item) => (
              <div
                key={item.id}
                onClick={() => setActiveMediaItem(item.url)}
                className={`relative rounded-2xl overflow-hidden cursor-pointer group shadow-md border border-white/10 hover:border-white/30 transition-all ${item.span}`}
              >
                <img
                  src={item.url}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2.5">
                  <span className="text-[10px] font-bold text-white drop-shadow">
                    {item.title}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* =========================================================================
          FULL-SCREEN STORY VIEWER MODAL
          ========================================================================= */}
      {activeStoryIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between p-4 sm:p-6 animate-in fade-in">
          {/* Story Progress Bar */}
          <div className="flex items-center gap-1.5 max-w-md mx-auto w-full pt-2">
            {stories.map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-all ${
                  i === activeStoryIndex ? 'bg-[#00D2FF]' : i < activeStoryIndex ? 'bg-white' : 'bg-white/30'
                }`}
              />
            ))}
          </div>

          {/* Story Header */}
          <div className="flex items-center justify-between max-w-md mx-auto w-full pt-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full overflow-hidden border border-white/30">
                <img src={profile.avatarUrl || PORTRAIT_KRISTIN} alt="" className="w-full h-full object-cover" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">{profile.displayName}</span>
                <span className="text-[10px] text-slate-400">{stories[activeStoryIndex].time}</span>
              </div>
            </div>
            <button
              onClick={() => setActiveStoryIndex(null)}
              className="p-1.5 rounded-full bg-white/10 text-white hover:bg-white/20"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Story Main Image */}
          <div className="flex-1 max-w-md mx-auto w-full flex items-center justify-center my-4 overflow-hidden rounded-3xl relative">
            <img
              src={stories[activeStoryIndex].image}
              alt=""
              className="max-h-[70vh] w-full object-cover rounded-3xl shadow-2xl"
            />
            <div className="absolute bottom-4 left-4 right-4 p-3 rounded-2xl bg-black/60 backdrop-blur-md border border-white/15 text-xs text-white">
              ✨ {stories[activeStoryIndex].title} · VibeTalk International Moment
            </div>
          </div>

          {/* Story Controls */}
          <div className="flex items-center justify-between max-w-md mx-auto w-full pb-2">
            <button
              onClick={() => setActiveStoryIndex(Math.max(0, activeStoryIndex - 1))}
              disabled={activeStoryIndex === 0}
              className="px-4 py-2 rounded-full bg-white/10 text-white text-xs disabled:opacity-30"
            >
              Previous
            </button>
            <button
              onClick={() => {
                if (activeStoryIndex < stories.length - 1) {
                  setActiveStoryIndex(activeStoryIndex + 1);
                } else {
                  setActiveStoryIndex(null);
                }
              }}
              className="px-5 py-2 rounded-full bg-[#00D2FF] text-slate-950 font-bold text-xs"
            >
              {activeStoryIndex === stories.length - 1 ? 'Close' : 'Next'}
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          FULL-SCREEN PHOTO LIGHTBOX MODAL
          ========================================================================= */}
      {activeMediaItem && (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4 animate-in fade-in">
          <div className="relative max-w-lg w-full">
            <button
              onClick={() => setActiveMediaItem(null)}
              className="absolute -top-12 right-0 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={activeMediaItem}
              alt=""
              className="w-full max-h-[80vh] object-contain rounded-3xl shadow-2xl border border-white/10"
            />
            <div className="mt-3 flex items-center justify-between px-2">
              <span className="text-xs text-slate-300 font-bold">Photo by {profile.displayName}</span>
              <button
                onClick={() => {
                  setLikedPhotos((prev) => ({ ...prev, [activeMediaItem]: !prev[activeMediaItem] }));
                }}
                className={`p-2 rounded-full transition-colors ${
                  likedPhotos[activeMediaItem] ? 'bg-rose-500 text-white' : 'bg-white/10 text-white'
                }`}
              >
                <Heart className={`w-4 h-4 ${likedPhotos[activeMediaItem] ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Options & Privacy Modal */}
      <ProfileOptionsModal
        isOpen={showOptionsModal}
        onClose={() => setShowOptionsModal(false)}
        profile={profile}
        isOwnProfile={isOwnProfile}
        preferences={preferences}
        onUpdatePreferences={updatePreferences}
        previewMode={previewMode}
        onSetPreviewMode={setPreviewMode}
        isConnected={isConnected}
        isPending={isPending}
        isFollowing={false}
        onToggleFollow={() => {}}
        onSendConnectionRequest={() => sendConnectionRequest(profile.id)}
        onRemoveConnection={() => removeConnection(profile.id)}
        onOpenReportModal={() => submitReport(profile.id, 'inappropriate_content', 'Report from profile')}
        onBlockUser={() => blockUser(profile.id)}
        onOpenChat={handleMessage}
        onStartAudioCall={() => startCall(profile, 'audio')}
        onStartVideoCall={() => startCall(profile, 'video')}
        profileStyle="aurora"
        onSetProfileStyle={(style) => {
          if (style === 'standard' && onSwitchStyle) {
            onSwitchStyle();
          }
        }}
      />
    </div>
  );
};
