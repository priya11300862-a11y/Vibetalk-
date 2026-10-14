import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  CheckCircle2,
  MapPin,
  Clock,
  Plus,
  Heart,
  Sparkles,
  Gift,
  Share2,
  ShieldAlert,
  Edit3,
  Tag,
  Flame,
  Trophy,
  Crown,
  PhoneCall,
  Video,
  MessageSquare,
  Globe2,
  Volume2,
  Pause,
  Play,
  ShieldCheck,
  Check,
  Users,
  Compass,
  Star,
  ExternalLink,
  Eye,
  Sliders,
  Lock,
  EyeOff,
  UserCheck,
  UserPlus,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useSocial } from '../../contexts/SocialContext';
import { useCall } from '../../contexts/CallContext';
import {
  COSMIC_PERSONALITY_IMG,
  PORTRAIT_SUSHMITHA,
  INITIAL_DISCOVER_PROFILES,
} from '../../services/mockData';
import { UserProfile, ProfileBadge } from '../../types';
import {
  UserStatusBadge,
  UserStatusDot,
  getEffectiveStatus,
  AvailabilityStatus,
} from '../common/UserStatusBadge';
import { InterestTagPickerModal } from './InterestTagPickerModal';
import { CoinWalletModal } from '../home/CoinWalletModal';
import { ProfileOptionsModal, ProfilePreviewMode } from './ProfileOptionsModal';
import { AuroraProfileView } from './AuroraProfileView';
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
    submitReport,
    blockUser,
    setActiveConversationId,
    conversations,
    preferences,
    updatePreferences,
    connectedUserIds,
    pendingRequestIds,
    sendConnectionRequest,
    removeConnection,
  } = useSocial();
  const { startCall } = useCall();

  // Active profile selection for the international standard view showcase
  const [selectedProfileId, setSelectedProfileId] = useState<string>(
    targetProfile?.id || currentUser?.id || 'usr_me_001'
  );

  useEffect(() => {
    if (targetProfile?.id) {
      setSelectedProfileId(targetProfile.id);
    }
  }, [targetProfile]);

  // Available international profiles to explore directly on this page
  const internationalRoster: UserProfile[] = [
    ...(currentUser ? [currentUser] : []),
    ...INITIAL_DISCOVER_PROFILES,
  ];

  const activeProfile: UserProfile =
    internationalRoster.find((p) => p.id === selectedProfileId) ||
    currentUser ||
    INITIAL_DISCOVER_PROFILES[0];

  const isOwnProfile = activeProfile.id === currentUser?.id;

  // Active subscription check: Gold VIP or Black Elite
  const hasActiveSubscription =
    activeProfile.subscriptionTier === 'gold_vip' ||
    activeProfile.subscriptionTier === 'black_elite';

  const [isFollowing, setIsFollowing] = useState(false);
  const [isVoiceBioPlaying, setIsVoiceBioPlaying] = useState(false);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [showReportSuccess, setShowReportSuccess] = useState(false);
  const [showStatusPicker, setShowStatusPicker] = useState(false);
  const [showInterestPicker, setShowInterestPicker] = useState(false);
  const [showProfileOptions, setShowProfileOptions] = useState(false);
  const [previewMode, setPreviewMode] = useState<ProfilePreviewMode>('normal');
  const [giftSentMessage, setGiftSentMessage] = useState<string | null>(null);
  const [isWalletOpen, setIsWalletOpen] = useState(false);

  // Profile layout style: 'aurora' (given image design) vs 'standard'
  const [profileStyle, setProfileStyle] = useState<'aurora' | 'standard'>(() => {
    return (localStorage.getItem('vibetalk_profile_style') as 'aurora' | 'standard') || 'standard';
  });

  const handleSetProfileStyle = (style: 'aurora' | 'standard') => {
    setProfileStyle(style);
    localStorage.setItem('vibetalk_profile_style', style);
  };

  const isConnected = connectedUserIds.includes(activeProfile.id);
  const isPending = pendingRequestIds.includes(activeProfile.id);

  const effectiveStatus: AvailabilityStatus = getEffectiveStatus(activeProfile);

  // Field-level Audience & Privacy Visibility logic:
  const isPublicPreview = isOwnProfile && previewMode === 'public';
  const isConnectedPreview = isOwnProfile && previewMode === 'connected';

  // Photo
  const isPhotoObscured =
    isPublicPreview &&
    (preferences.photoVisibility === 'connections' || preferences.photoVisibility === 'hidden');
  const isPhotoHidden =
    (isPublicPreview || isConnectedPreview) && preferences.photoVisibility === 'hidden';

  // Bio
  const displayBio = (() => {
    if (isPublicPreview && preferences.bioVisibility !== 'everyone') {
      return '🔒 Bio is private and only visible to approved connections.';
    }
    if (isConnectedPreview && preferences.bioVisibility === 'hidden') {
      return '🔒 Bio is hidden by user privacy settings.';
    }
    return (
      activeProfile.bio ||
      'International creator and conversationalist. Looking for thoughtful, genuine, and respectful conversations across world cultures.'
    );
  })();

  // Interests
  const isInterestsHidden =
    (isPublicPreview && preferences.interestsVisibility !== 'everyone') ||
    (isConnectedPreview && preferences.interestsVisibility === 'hidden');

  // Languages
  const isLanguagesHidden =
    (isPublicPreview && preferences.languagesVisibility !== 'everyone') ||
    (isConnectedPreview && preferences.languagesVisibility === 'hidden');

  // Location
  const displayLocation = (() => {
    if (preferences.locationVisibility === 'hidden' || (isPublicPreview && !preferences.showBroadLocation)) {
      return 'Location: Hidden by user';
    }
    if (preferences.locationVisibility === 'approximate') {
      return activeProfile.country || 'International';
    }
    return activeProfile.broadLocation || activeProfile.country || 'Global';
  })();

  // Online status
  const displayStatus: AvailabilityStatus = (() => {
    if (preferences.activityVisibility === 'nobody') return 'offline';
    if (isPublicPreview && preferences.activityVisibility !== 'everyone') return 'offline';
    return effectiveStatus;
  })();

  // Calculate shared compatibility if viewing another member
  const matchInfo = !isOwnProfile ? calculateProfileMatch(currentUser, activeProfile) : null;

  const currentInterests = activeProfile.interests || [
    'Art & Design',
    'Specialty Coffee',
    'Vinyl Records',
    'Deep Conversations',
  ];

  const currentBadges: ProfileBadge[] = activeProfile.unlockedBadges || [
    {
      id: 'badge_spark_02',
      name: 'Active Spark',
      icon: '⚡',
      description: 'Active member with consistent engagement score.',
      tier: 'bronze',
    },
    {
      id: 'badge_voyager_04',
      name: 'Global Voyager',
      icon: '✈️',
      description: 'Connects across international timezones with high respect rating.',
      tier: 'gold',
    },
    {
      id: 'badge_connoisseur_07',
      name: 'Connoisseur',
      icon: '💎',
      description: 'Awarded for thoughtful, deep, and respectful audio discussions.',
      tier: 'cosmic',
    },
  ];

  const handleUpdateStatus = (newStatus: AvailabilityStatus) => {
    if (isOwnProfile) {
      updateCurrentUserProfile({
        availabilityStatus: newStatus,
        isOnline: newStatus !== 'offline',
      });
    }
    setShowStatusPicker(false);
  };

  const handleSaveInterests = (newInterests: string[]) => {
    if (isOwnProfile) {
      updateCurrentUserProfile({ interests: newInterests });
    }
  };

  const handleStartAudio = async () => {
    await startCall(activeProfile, 'audio', activeProfile.activeTopic || 'International Lounge');
  };

  const handleStartVideo = async () => {
    await startCall(activeProfile, 'video', activeProfile.activeTopic || 'International Lounge');
  };

  const handleOpenChat = () => {
    const existing = conversations.find((c) => c.participant.id === activeProfile.id);
    if (existing) {
      setActiveConversationId(existing.id);
    }
    onNavigateTab && onNavigateTab('messages');
  };

  const handleSendGift = (giftName: string, coinCost: number) => {
    setGiftSentMessage(`Sent ${giftName} to ${activeProfile.displayName}!`);
    setTimeout(() => {
      setGiftSentMessage(null);
      setShowGiftModal(false);
    }, 1800);
  };

  const toggleVoiceBio = () => {
    setIsVoiceBioPlaying(!isVoiceBioPlaying);
    if (!isVoiceBioPlaying) {
      setTimeout(() => setIsVoiceBioPlaying(false), 7000);
    }
  };

  // Flag emoji based on country
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

  // If user selected the given image design style, render AuroraProfileView
  if (profileStyle === 'aurora') {
    return (
      <AuroraProfileView
        profile={activeProfile}
        isOwnProfile={isOwnProfile}
        onNavigateTab={onNavigateTab}
        onOpenPrivacy={onOpenPrivacy}
        onSwitchStyle={() => handleSetProfileStyle('standard')}
        availableProfiles={internationalRoster}
        onSelectProfile={(id) => setSelectedProfileId(id)}
      />
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-4.5rem)] pb-28 bg-gradient-to-b from-[#FFFDF9] via-[#FAF8F5] to-[#F5F2EB] text-slate-800 overflow-hidden select-none text-left">
      
      {/* Background Hearts & Ambient Glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-16 left-8 w-56 h-56 bg-pink-400/8 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-4 w-72 h-72 bg-purple-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-32 left-1/4 w-80 h-80 bg-rose-400/8 rounded-full blur-3xl" />
        
        {/* Subtle Ambient Glow SVG Paths */}
        <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
          <path d="M120,240 C100,200 60,200 40,230 C20,260 50,300 120,360 C190,300 220,260 200,230 C180,200 140,200 120,240 Z" fill="#FF1493" />
          <path d="M320,180 C305,150 275,150 260,172 C245,195 267,225 320,270 C372,225 395,195 380,172 C365,150 335,150 320,180 Z" fill="#9400D3" />
          <path d="M280,480 C265,450 235,450 220,472 C205,495 227,525 280,570 C332,525 355,495 340,472 C325,450 295,450 280,480 Z" fill="#FF1493" />
          <path d="M80,560 C65,530 35,530 20,552 C5,575 27,605 80,650 C132,605 155,575 140,552 C125,530 95,530 80,560 Z" fill="#9400D3" />
        </svg>
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-3 sm:px-6 py-3 space-y-4">
        
        {/* =========================================================================
            1. TOP NAVIGATION & INTERNATIONAL ROSTER SELECTOR
            ========================================================================= */}
        <div className="flex items-center justify-between pb-2 border-b border-stone-200/80">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigateTab && onNavigateTab('home')}
              className="p-2 rounded-full bg-white hover:bg-stone-50 text-slate-700 hover:text-slate-900 border border-stone-200 transition-colors active:scale-95 shadow-sm"
              title="Back to Home"
            >
              <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
            </button>

            {/* Avatar with CHAMPION crest from reference image */}
            <div
              onClick={() => currentUser && setSelectedProfileId(currentUser.id)}
              className="flex items-center gap-1.5 cursor-pointer group"
              title="View my own profile"
            >
              <div className="relative">
                <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-cyan-400 p-0.5 bg-slate-900 shadow">
                  <img
                    src={currentUser?.avatarUrl}
                    alt={currentUser?.displayName}
                    className="w-full h-full object-cover rounded-full"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="absolute -bottom-1 -left-1 px-1 py-0.2 rounded-full bg-gradient-to-r from-amber-500 to-yellow-300 text-[6.5px] font-black text-slate-950 uppercase tracking-tighter shadow">
                  CHAMPION
                </div>
              </div>
            </div>
          </div>

          {/* Given UI Design & Layout Switcher Capsule */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleSetProfileStyle('aurora')}
              className="px-3 py-1 rounded-full bg-gradient-to-r from-cyan-500/15 via-purple-500/15 to-pink-500/15 border border-cyan-400/40 hover:border-cyan-500 text-xs font-black text-slate-800 hover:text-slate-950 flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
              title="Switch to Given Image Design (Aurora Moments & Story Cards UI)"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#00D2FF]" />
              <span>Given UI Style</span>
            </button>
          </div>

          {/* Coin Balance Capsule Button + View As Preview + Profile Options + Privacy Action */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setIsWalletOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-slate-950 shadow-md hover:bg-slate-100 transition-all cursor-pointer active:scale-95"
              title="Open Coin Wallet"
            >
              <span className="text-sm">🪙</span>
              <span className="font-extrabold text-xs font-mono">{currentUser?.coins ?? 80}</span>
            </button>

            {isOwnProfile && (
              <button
                onClick={() => setPreviewMode(previewMode === 'normal' ? 'public' : 'normal')}
                className={`text-xs px-2.5 py-1 rounded-full font-bold transition-all shadow-xs flex items-center gap-1 ${
                  previewMode !== 'normal'
                    ? 'bg-purple-600 text-white shadow-purple-600/20'
                    : 'bg-white hover:bg-purple-50 text-purple-700 border border-purple-200'
                }`}
                title="View my profile as..."
              >
                <Eye className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">View as</span>
              </button>
            )}

            <button
              onClick={() => setShowProfileOptions(true)}
              className="text-xs px-2.5 py-1 rounded-full bg-white hover:bg-stone-100 text-slate-700 hover:text-slate-900 border border-stone-200 transition-colors shadow-xs flex items-center gap-1 font-semibold"
              title="Profile Options &amp; Privacy Preview"
            >
              <Sliders className="w-3.5 h-3.5 text-[#FF4F9A]" />
              <span>Options</span>
            </button>

            <button
              onClick={onOpenPrivacy}
              className="text-xs px-2.5 py-1 rounded-full bg-white hover:bg-stone-100 text-slate-700 hover:text-slate-900 border border-stone-200 transition-colors shadow-xs"
            >
              Privacy
            </button>
          </div>
        </div>

        {/* Profile quick-selector carousel */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-slate-600 font-bold px-1">
            <span className="flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-pink-500" />
              <span>Explore Verified International Profiles:</span>
            </span>
            <span className="text-[10px] text-slate-500 font-mono">18+ Global Network</span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 px-0.5">
            {internationalRoster.slice(0, 7).map((member) => {
              const isSelected = member.id === activeProfile.id;
              return (
                <button
                  key={member.id}
                  onClick={() => setSelectedProfileId(member.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all shadow-sm active:scale-95 ${
                    isSelected
                      ? 'bg-gradient-to-r from-[#FF1493] via-[#E11D48] to-[#9400D3] text-white ring-2 ring-pink-300 shadow-md shadow-pink-900/20'
                      : 'bg-white text-slate-700 hover:bg-stone-50 border border-stone-200 shadow-xs'
                  }`}
                >
                  <div className="w-5 h-5 rounded-full overflow-hidden shrink-0 border border-white/30">
                    <img
                      src={member.avatarUrl}
                      alt={member.displayName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span>{member.displayName}</span>
                  <span className="text-[11px]">{getCountryFlag(member.country)}</span>
                  {(member.subscriptionTier === 'gold_vip' || member.subscriptionTier === 'black_elite') && (
                    <span className="text-[10px] text-amber-300 font-black" title="Active VIP Member">
                      👑
                    </span>
                  )}
                  {member.id === currentUser?.id && (
                    <span className="text-[9px] px-1 rounded bg-black/50 text-amber-300 font-black">
                      You
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* =========================================================================
            2. LUXURY INTERNATIONAL COVER & AVATAR HERO
            ========================================================================= */}
        <div className="rounded-3xl overflow-hidden bg-[#24061E]/90 border border-pink-500/25 shadow-2xl relative backdrop-blur-xl">
          {/* Artistic Gradient Ambient Cover Backdrop */}
          <div className="h-36 sm:h-44 w-full bg-gradient-to-r from-[#4A0A3A] via-[#2F0626] to-[#1E041B] relative overflow-hidden">
            {/* Subtle noise/mesh patterns */}
            <div className="absolute inset-0 opacity-30 bg-[radial-gradient(#FF1493_1px,transparent_1px)] [background-size:16px_16px]" />
            <div className="absolute top-4 right-4 w-40 h-40 bg-[#FF1493]/25 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-2 left-10 w-48 h-48 bg-[#9400D3]/25 rounded-full blur-3xl pointer-events-none" />

            {/* Top VIP Tier Badge & Golden Subscription Badges */}
            <div className="absolute top-4 left-4 z-10 flex items-center gap-2 flex-wrap">
              {hasActiveSubscription ? (
                <div className="flex items-center gap-1.5 flex-wrap">
                  <div className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-slate-950 text-[10.5px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-amber-500/30 border border-yellow-200/90 select-none">
                    <Crown className="w-3.5 h-3.5 stroke-[2.75]" />
                    <span>
                      {activeProfile.subscriptionTier === 'black_elite'
                        ? 'BLACK ELITE'
                        : 'GOLD VIP'}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-slate-950/60" />
                    <span>PREMIUM</span>
                  </div>
                  <div className="px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md border border-amber-400/60 text-[10px] font-black text-amber-300 flex items-center gap-1 shadow-md select-none">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    <span>VERIFIED</span>
                  </div>
                </div>
              ) : (
                <div className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[10px] font-black uppercase tracking-wider text-slate-300 flex items-center gap-1 shadow-lg">
                  <span>FREE MEMBER</span>
                </div>
              )}

              {isOwnProfile ? (
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    onClick={() => setShowInterestPicker(true)}
                    className="px-2.5 py-1 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-[10px] font-bold text-white flex items-center gap-1 shadow transition-colors"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Edit Profile</span>
                  </button>

                  <button
                    onClick={() => setShowProfileOptions(true)}
                    className="px-2.5 py-1 rounded-full bg-[#9C7BFF]/80 hover:bg-[#9C7BFF] backdrop-blur-md text-[10px] font-bold text-white flex items-center gap-1 shadow transition-colors"
                    title="View my profile as..."
                  >
                    <Eye className="w-3 h-3" />
                    <span>View as...</span>
                  </button>

                  <button
                    onClick={() => setShowProfileOptions(true)}
                    className="px-2.5 py-1 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-[10px] font-bold text-white flex items-center gap-1 shadow transition-colors"
                    title="Profile Options"
                  >
                    <Sliders className="w-3 h-3" />
                    <span>Options</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    onClick={isConnected ? () => removeConnection(activeProfile.id) : () => sendConnectionRequest(activeProfile.id)}
                    className={`px-2.5 py-1 rounded-full backdrop-blur-md text-[10px] font-bold flex items-center gap-1 shadow transition-colors ${
                      isConnected
                        ? 'bg-emerald-600/80 hover:bg-emerald-600 text-white'
                        : isPending
                        ? 'bg-amber-600/80 hover:bg-amber-600 text-white'
                        : 'bg-[#9C7BFF]/80 hover:bg-[#9C7BFF] text-white'
                    }`}
                  >
                    {isConnected ? <UserCheck className="w-3 h-3" /> : <UserPlus className="w-3 h-3" />}
                    <span>{isConnected ? 'Connected' : isPending ? 'Pending' : 'Connect'}</span>
                  </button>

                  <button
                    onClick={() => setShowProfileOptions(true)}
                    className="px-2.5 py-1 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-[10px] font-bold text-white flex items-center gap-1 shadow transition-colors"
                  >
                    <Sliders className="w-3 h-3" />
                    <span>Options</span>
                  </button>
                </div>
              )}
            </div>

            {/* Adult 18+ Confirmed Banner on Cover */}
            <div className="absolute top-4 right-4 z-10 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-emerald-500/30 text-[10px] font-extrabold text-emerald-400 flex items-center gap-1 shadow-lg">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>18+ Adult Verified</span>
            </div>
          </div>

          {/* Profile Privacy Preview Active Banner */}
          {isOwnProfile && previewMode !== 'normal' && (
            <div className="m-3 p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-purple-900/90 via-slate-900/95 to-purple-950/90 text-white border border-purple-400/50 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-500/30 border border-purple-300/40 flex items-center justify-center text-purple-200 shrink-0 shadow-inner">
                  <Eye className="w-4 h-4 text-purple-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-purple-300">
                      Profile Privacy Preview Mode
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-purple-400/30 text-purple-200 font-extrabold text-[10px] border border-purple-300/40">
                      {previewMode === 'public'
                        ? '🌐 Public Visitor'
                        : previewMode === 'connected'
                        ? '👥 Connected User'
                        : '🔒 Private View'}
                    </span>
                  </div>
                  <p className="text-[11px] text-purple-200/90 leading-tight">
                    {previewMode === 'public'
                      ? 'Simulating what a non-connected public visitor sees based on your visibility controls.'
                      : previewMode === 'connected'
                      ? 'Simulating what an accepted connection sees.'
                      : 'Owner view with full administrative controls.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap self-end sm:self-auto">
                <button
                  onClick={() => setPreviewMode('public')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    previewMode === 'public'
                      ? 'bg-purple-500 text-white shadow-xs'
                      : 'bg-white/10 hover:bg-white/20 text-purple-200'
                  }`}
                >
                  Public
                </button>
                <button
                  onClick={() => setPreviewMode('connected')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    previewMode === 'connected'
                      ? 'bg-purple-500 text-white shadow-xs'
                      : 'bg-white/10 hover:bg-white/20 text-purple-200'
                  }`}
                >
                  Connected
                </button>
                <button
                  onClick={() => setPreviewMode('private')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    previewMode === 'private'
                      ? 'bg-purple-500 text-white shadow-xs'
                      : 'bg-white/10 hover:bg-white/20 text-purple-200'
                  }`}
                >
                  Private
                </button>
                <button
                  onClick={() => setShowProfileOptions(true)}
                  className="px-2.5 py-1 rounded-lg bg-pink-500 hover:bg-pink-600 text-white text-xs font-bold transition-colors shadow-xs"
                >
                  Visibility
                </button>
                <button
                  onClick={() => setPreviewMode('normal')}
                  className="px-2 py-1 rounded-lg bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-colors"
                  title="Exit preview"
                >
                  ✕ Exit
                </button>
              </div>
            </div>
          )}

          {/* Profile Card Body */}
          <div className="px-5 pb-6 pt-0 relative">
            {/* Avatar Row */}
            <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between -mt-16 sm:-mt-20 gap-4 mb-4">
              {/* Avatar with Halo + Status Beacon */}
              <div className="relative group">
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full p-[3px] bg-gradient-to-tr from-[#FF1493] via-[#9400D3] to-[#20D9C3] shadow-2xl shadow-pink-600/30">
                  <div className="w-full h-full rounded-full overflow-hidden bg-slate-950 relative flex items-center justify-center">
                    {isPhotoObscured || isPhotoHidden ? (
                      <div className="w-full h-full bg-slate-900/95 backdrop-blur-md flex flex-col items-center justify-center text-center p-2">
                        <Lock className="w-6 h-6 text-pink-400 mb-1" />
                        <span className="text-[9px] font-bold text-slate-300 uppercase tracking-tight">
                          Private Photo
                        </span>
                      </div>
                    ) : (
                      <img
                        src={activeProfile.avatarUrl}
                        alt={activeProfile.displayName}
                        className="w-full h-full object-cover rounded-full"
                        referrerPolicy="no-referrer"
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Status Beacon */}
              <div
                className="absolute top-1 right-1 z-20 w-7 h-7 rounded-full border-2 border-white bg-white flex items-center justify-center shadow-lg cursor-pointer hover:scale-110 transition-transform"
                onClick={() => isOwnProfile && setShowStatusPicker(!showStatusPicker)}
                title={`Status: ${displayStatus} ${isOwnProfile ? '(Click to change)' : ''}`}
              >
                <UserStatusDot status={displayStatus} size="sm" />
              </div>

              {/* Champion Crest Badge */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 z-20 px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 text-[9px] font-black uppercase tracking-wider shadow-md">
                {activeProfile.championBadge || 'CHAMPION'}
              </div>
            </div>

            {/* Reputation & Network Metrics */}
            <div className="flex items-center justify-around sm:justify-end gap-6 sm:gap-8 w-full sm:w-auto pt-2 sm:pt-0">
              <div className="text-center space-y-0.5">
                <div className="text-xl sm:text-2xl font-black text-white font-mono flex items-center justify-center gap-1">
                  <span>99.6%</span>
                  <span className="text-emerald-400 text-sm">★</span>
                </div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Respect Rating
                </div>
              </div>

              <div className="text-center space-y-0.5">
                <div className="text-xl sm:text-2xl font-black text-white font-mono">
                  142<span className="text-xs text-slate-400 font-sans ml-0.5">hrs</span>
                </div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Global Talks
                </div>
              </div>

              <div className="text-center space-y-0.5">
                <div className="text-xl sm:text-2xl font-black text-white font-mono">
                  751
                </div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Connections
                </div>
              </div>
            </div>
          </div>

          {/* Identity & Global Information */}
          <div className="space-y-3">
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {activeProfile.displayName}
                </h1>
                <span className="text-sm font-bold text-slate-400">
                  {activeProfile.age}
                </span>

                {/* Country Flag Pill */}
                <span className="px-2 py-0.5 rounded-full bg-white/10 text-xs font-bold flex items-center gap-1 border border-white/10">
                  <span>{getCountryFlag(activeProfile.country)}</span>
                  <span>{activeProfile.country || 'International'}</span>
                </span>

                {/* Golden 'Verified' and 'Premium' Badges for Active Subscriptions */}
                {hasActiveSubscription ? (
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Golden Verified Badge */}
                    <span
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-slate-950 text-xs font-black uppercase tracking-wider shadow-md shadow-amber-500/25 border border-yellow-200/90 select-none animate-in fade-in"
                      title="Verified Member - Active VIP Subscription"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 stroke-[2.75] fill-amber-200 text-slate-950" />
                      <span>Verified</span>
                    </span>

                    {/* Golden Premium Badge */}
                    <span
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-yellow-300 via-amber-300 to-yellow-400 text-slate-950 text-xs font-black uppercase tracking-wider shadow-md shadow-amber-500/30 border border-yellow-100 select-none animate-in fade-in"
                      title="Premium VIP Member - Active Subscription"
                    >
                      <Crown className="w-3.5 h-3.5 stroke-[2.75] fill-yellow-600/40 text-slate-950" />
                      <span>Premium</span>
                      <Sparkles className="w-3 h-3 text-slate-950 animate-pulse" />
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    {activeProfile.isVerified && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#20D9C3]/15 border border-[#20D9C3]/30 text-[#20D9C3] text-xs font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Verified</span>
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Location & Timezone Clock */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-pink-200/80 font-medium pt-1">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-400" />
                  <span>{displayLocation}</span>
                </span>

                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-cyan-300" />
                  <span>Verified · Typically replies in &lt; 3 mins</span>
                </span>
              </div>
            </div>

            {/* Bio */}
            <p className="text-sm text-pink-100/90 leading-relaxed font-normal bg-black/40 p-3.5 rounded-2xl border border-pink-500/20 shadow-sm">
              {displayBio}
            </p>

            {/* Spoken Languages & Scripts */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs font-bold text-pink-200/80 mr-1">Languages:</span>
              {isLanguagesHidden ? (
                <span className="text-xs text-pink-300/80 italic bg-black/30 px-2.5 py-0.5 rounded-full border border-pink-500/20">
                  🔒 Languages hidden by user privacy settings
                </span>
              ) : (
                <>
                  {(activeProfile.languages || ['English', 'French']).map((lang) => (
                    <span
                      key={lang}
                      className="px-2.5 py-0.5 rounded-full bg-pink-500/20 border border-pink-400/40 text-pink-200 text-xs font-bold shadow-sm"
                    >
                      {lang}
                    </span>
                  ))}
                  {activeProfile.nativeLanguageScript && (
                    <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-200 text-xs font-bold shadow-sm">
                      {activeProfile.nativeLanguageScript}
                    </span>
                  )}
                </>
              )}
            </div>

            {/* Active Subscription Golden VIP Showcase Card */}
            {hasActiveSubscription ? (
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-yellow-500/15 to-amber-600/20 border border-amber-400/50 flex items-center justify-between gap-3 shadow-xl shadow-amber-500/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-300 text-slate-950 flex items-center justify-center font-black shadow-md shrink-0 ring-2 ring-yellow-200/50">
                    <Crown className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-black text-sm text-amber-300">
                        {activeProfile.subscriptionTier === 'black_elite'
                          ? 'Black Elite VIP'
                          : 'Gold VIP'}
                      </h4>
                      <span className="px-2 py-0.5 rounded-full bg-amber-400/25 text-amber-300 border border-amber-400/40 text-[9px] font-black uppercase tracking-wider">
                        Active Subscription
                      </span>
                    </div>
                    <p className="text-[11px] text-pink-100/80">
                      Displaying official golden <strong className="text-amber-300">Verified</strong> and <strong className="text-amber-300">Premium</strong> badges with priority discovery.
                    </p>
                  </div>
                </div>

                {isOwnProfile && (
                  <button
                    onClick={onOpenSubscription}
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 font-black text-xs hover:brightness-105 transition-all shadow shrink-0 active:scale-95"
                  >
                    Manage
                  </button>
                )}
              </div>
            ) : isOwnProfile ? (
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#FF1493]/20 via-[#9400D3]/20 to-pink-900/30 border border-pink-500/30 flex items-center justify-between gap-3 shadow-lg">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Get Golden 'Verified' &amp; 'Premium' Badges</span>
                  </div>
                  <p className="text-[11px] text-pink-100/80">
                    Upgrade to Gold VIP or Black Elite to unlock official golden verification badges.
                  </p>
                </div>
                <button
                  onClick={onOpenSubscription}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 font-black text-xs hover:brightness-105 active:scale-95 transition-all shadow shrink-0"
                >
                  Upgrade
                </button>
              </div>
            ) : null}

            {/* =========================================================================
                AUDIO VOICE INTRO PROMPT (International standard voice showcase)
                ========================================================================= */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#3C082E] via-[#2A0621] to-[#1D0517] border border-pink-500/30 flex items-center justify-between gap-3 shadow-md">
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleVoiceBio}
                  className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#FF1493] to-[#9400D3] text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all shrink-0"
                  title="Play Voice Prompt"
                >
                  {isVoiceBioPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                </button>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                    <Volume2 className="w-3.5 h-3.5 text-[#20D9C3]" />
                    <span>Voice Introduction</span>
                    <span className="text-[10px] text-pink-300 font-mono">0:15</span>
                  </div>
                  <p className="text-[11px] text-pink-200/80">
                    "{activeProfile.displayName}’s philosophy on meaningful friendships"
                  </p>
                </div>
              </div>

              {/* Animated Audio Frequency Bars */}
              <div className="flex items-center gap-1 h-6 shrink-0 pr-2">
                {[12, 22, 10, 26, 16, 28, 14, 20, 8, 24].map((h, i) => (
                  <span
                    key={i}
                    style={{ height: isVoiceBioPlaying ? undefined : `${h * 0.7}px` }}
                    className={`w-1 rounded-full ${
                      isVoiceBioPlaying ? 'bg-[#00FF88] animate-audio-bar' : 'bg-pink-400/40'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* =========================================================================
                3. CLASSY 3D ACTION BUTTONS (Voice, Video, VibeChat, Gift)
                ========================================================================= */}
            <div className="pt-2 space-y-2">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {/* Audio Call 3D Button */}
                <button
                  onClick={handleStartAudio}
                  className="p-3 rounded-2xl bg-gradient-to-b from-[#00E5FF] to-[#0077B6] border-t border-cyan-200/60 shadow-[0_5px_0_#004C99] active:shadow-[0_1px_0_#004C99] active:translate-y-1 text-white font-extrabold text-xs flex items-center justify-center gap-2 hover:brightness-105 transition-all"
                >
                  <PhoneCall className="w-4 h-4 stroke-[2.5]" />
                  <span>Audio Call</span>
                </button>

                {/* Video Call 3D Button */}
                <button
                  onClick={handleStartVideo}
                  className="p-3 rounded-2xl bg-gradient-to-b from-[#E879F9] to-[#7E22CE] border-t border-pink-200/60 shadow-[0_5px_0_#4C0519] active:shadow-[0_1px_0_#4C0519] active:translate-y-1 text-white font-extrabold text-xs flex items-center justify-center gap-2 hover:brightness-105 transition-all"
                >
                  <Video className="w-4 h-4 stroke-[2.5]" />
                  <span>Video Call</span>
                </button>

                {/* VibeChat 3D Button */}
                <button
                  onClick={handleOpenChat}
                  className="p-3 rounded-2xl bg-gradient-to-b from-[#FF5E8A] to-[#E11D48] border-t border-rose-200/60 shadow-[0_5px_0_#5B0D21] active:shadow-[0_1px_0_#5B0D21] active:translate-y-1 text-white font-extrabold text-xs flex items-center justify-center gap-2 hover:brightness-105 transition-all"
                >
                  <MessageSquare className="w-4 h-4 stroke-[2.5]" />
                  <span>VibeChat</span>
                </button>

                {/* Send Gift 3D Button */}
                <button
                  onClick={() => setShowGiftModal(true)}
                  className="p-3 rounded-2xl bg-gradient-to-b from-[#FCD34D] to-[#D97706] border-t border-yellow-100/70 shadow-[0_5px_0_#78350F] active:shadow-[0_1px_0_#78350F] active:translate-y-1 text-slate-950 font-black text-xs flex items-center justify-center gap-2 hover:brightness-105 transition-all"
                >
                  <Gift className="w-4 h-4" />
                  <span>Send Gift</span>
                </button>
              </div>

              {/* Gift success feedback */}
              {giftSentMessage && (
                <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold text-center animate-in fade-in">
                  ✨ {giftSentMessage}
                </div>
              )}
            </div>

            {/* Status change popup if own profile */}
            {showStatusPicker && isOwnProfile && (
              <div className="p-3.5 rounded-2xl bg-[#280822] border border-pink-500/30 space-y-2 mt-2 shadow-xl">
                <p className="text-xs font-bold text-white">Update Your Live Global Status:</p>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleUpdateStatus('online')}
                    className="p-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5"
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>Online</span>
                  </button>
                  <button
                    onClick={() => handleUpdateStatus('busy')}
                    className="p-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center justify-center gap-1.5"
                  >
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span>Busy</span>
                  </button>
                  <button
                    onClick={() => handleUpdateStatus('offline')}
                    className="p-2 rounded-xl bg-slate-500/20 hover:bg-slate-500/30 border border-slate-500/40 text-slate-300 text-xs font-bold flex items-center justify-center gap-1.5"
                  >
                    <span className="w-2 h-2 rounded-full bg-slate-400" />
                    <span>Invisible</span>
                  </button>
                </div>
              </div>
            )}

            {/* =========================================================================
                4. INTEREST TAGS & COMPATIBILITY
                ========================================================================= */}
            <div className="pt-4 space-y-2.5 border-t border-pink-500/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-pink-400" />
                  <h3 className="text-sm font-extrabold text-white">Curated Interest Tags</h3>
                  <span className="text-xs text-pink-300/80 font-mono">({currentInterests.length})</span>
                </div>

                {isOwnProfile && (
                  <button
                    onClick={() => setShowInterestPicker(true)}
                    className="text-xs text-[#20D9C3] hover:underline font-bold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Edit Tags</span>
                  </button>
                )}
              </div>

              {matchInfo && !isOwnProfile && (
                <div className="p-3 rounded-2xl bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-cyan-500/20 border border-pink-400/40 flex items-center justify-between text-xs shadow-md">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-pink-400" />
                    <span className="font-bold text-white">
                      {matchInfo.matchPercentage}% Vibe Compatibility
                    </span>
                  </div>
                  <span className="text-pink-100 text-[11px]">
                    {matchInfo.sharedInterests.length} shared interests
                  </span>
                </div>
              )}

              {isInterestsHidden ? (
                <div className="p-3 rounded-2xl bg-black/30 border border-pink-500/20 text-xs text-pink-200/80 italic flex items-center gap-2">
                  <Lock className="w-4 h-4 text-pink-400" />
                  <span>Interest tags are private and only visible to approved connections.</span>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 pt-1">
                  {currentInterests.map((tag) => (
                    <span
                      key={tag}
                      className="px-3.5 py-1.5 rounded-2xl bg-white/[0.08] hover:bg-white/[0.14] border border-white/15 text-pink-100 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                    >
                      <span>{getInterestIcon(tag)}</span>
                      <span>{tag}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* =========================================================================
                5. UNLOCKED BADGES & LOGIN STREAK RECOGNITION
                ========================================================================= */}
            <div className="pt-4 space-y-2.5 border-t border-pink-500/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-extrabold text-white">Unlocked Badges & Honors</h3>
                </div>

                <div className="flex items-center gap-1 text-xs font-extrabold text-amber-300 bg-amber-500/25 px-2.5 py-0.5 rounded-full border border-amber-400/40 shadow-sm">
                  <Flame className="w-3.5 h-3.5 text-rose-400 fill-rose-400 animate-pulse" />
                  <span>{activeProfile.dailyStreak || 3} Day Streak</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                {currentBadges.map((badge) => (
                  <div
                    key={badge.id}
                    className="p-3 rounded-2xl bg-black/35 border border-pink-500/20 flex items-start gap-2.5 shadow-sm"
                  >
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500/25 to-yellow-500/25 border border-amber-400/40 flex items-center justify-center text-lg shrink-0 shadow">
                      {badge.icon}
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-black text-white truncate">{badge.name}</h4>
                        <span className="text-[9px] uppercase font-black text-amber-400">
                          {badge.tier || 'bronze'}
                        </span>
                      </div>
                      <p className="text-[10px] text-pink-200/70 line-clamp-2">
                        {badge.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* =========================================================================
                6. INTERNATIONAL SAFETY & VERIFICATION GUARANTEE
                ========================================================================= */}
            <div className="pt-4 space-y-2 border-t border-pink-500/20">
              <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between gap-3 text-xs shadow-md">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-extrabold text-white">VibeTalk Safe Adult Community</h5>
                    <p className="text-[11px] text-emerald-200/80">
                      End-to-end encrypted audio, no unverified accounts, strict zero-harassment rules.
                    </p>
                  </div>
                </div>

                {!isOwnProfile && (
                  <button
                    onClick={() => {
                      submitReport(activeProfile.id, 'inappropriate_content', 'Flagged from profile');
                      setShowReportSuccess(true);
                      setTimeout(() => setShowReportSuccess(false), 2000);
                    }}
                    className="text-xs text-rose-400 hover:text-rose-300 font-bold shrink-0 underline"
                  >
                    Report
                  </button>
                )}
              </div>

              {showReportSuccess && (
                <div className="p-2 text-center text-xs text-emerald-400 font-bold bg-emerald-500/10 rounded-xl border border-emerald-500/30">
                  Report submitted to safety moderation team.
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* =========================================================================
          GIFT MODAL
          ========================================================================= */}
      {showGiftModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="w-full max-w-sm rounded-3xl bg-[#26051F] border border-amber-400/40 p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-amber-400" />
                <h3 className="font-extrabold text-white text-base">Send International Gift</h3>
              </div>
              <button
                onClick={() => setShowGiftModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-pink-200/90">
              Surprise {activeProfile.displayName} with an exclusive animated gift:
            </p>

            <div className="grid grid-cols-3 gap-2.5">
              {[
                { name: 'Red Rose', icon: '🌹', cost: 10 },
                { name: 'French Cafe', icon: '☕', cost: 25 },
                { name: 'Gold Crown', icon: '👑', cost: 50 },
                { name: 'Cosmic Star', icon: '⭐', cost: 80 },
                { name: 'Luxury Diamond', icon: '💎', cost: 150 },
                { name: 'Super Rocket', icon: '🚀', cost: 300 },
              ].map((gift) => (
                <button
                  key={gift.name}
                  onClick={() => handleSendGift(gift.name, gift.cost)}
                  className="p-3 rounded-2xl bg-white/[0.08] hover:bg-white/[0.14] border border-white/15 text-center space-y-1 transition-all active:scale-95 shadow"
                >
                  <div className="text-2xl">{gift.icon}</div>
                  <div className="text-[11px] font-bold text-white truncate">{gift.name}</div>
                  <div className="text-[10px] font-mono text-amber-300 font-extrabold">
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
        isOpen={showProfileOptions}
        onClose={() => setShowProfileOptions(false)}
        profile={activeProfile}
        isOwnProfile={isOwnProfile}
        preferences={preferences}
        onUpdatePreferences={updatePreferences}
        previewMode={previewMode}
        onSetPreviewMode={setPreviewMode}
        isConnected={isConnected}
        isPending={isPending}
        isFollowing={isFollowing}
        onToggleFollow={() => setIsFollowing(!isFollowing)}
        onSendConnectionRequest={() => sendConnectionRequest(activeProfile.id)}
        onRemoveConnection={() => removeConnection(activeProfile.id)}
        onOpenReportModal={() => {
          submitReport(activeProfile.id, 'inappropriate_content', 'Flagged from profile options');
          setShowReportSuccess(true);
          setTimeout(() => setShowReportSuccess(false), 2000);
        }}
        onBlockUser={() => blockUser(activeProfile.id)}
        onOpenInterestPicker={() => setShowInterestPicker(true)}
        onOpenChat={handleOpenChat}
        onStartAudioCall={handleStartAudio}
        onStartVideoCall={handleStartVideo}
        profileStyle={profileStyle}
        onSetProfileStyle={handleSetProfileStyle}
      />
    </div>
  );
};
