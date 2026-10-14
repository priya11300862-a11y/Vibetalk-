import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  CheckCircle2,
  PhoneCall,
  Video,
  MessageSquare,
  UserPlus,
  ShieldAlert,
  MoreVertical,
  Globe2,
  Languages,
  Check,
  Sparkles,
  Tag,
  Flame,
  ArrowUpDown,
  Zap,
  Info,
  Radio,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useSocial } from '../../contexts/SocialContext';
import { useCall } from '../../contexts/CallContext';
import { UserProfile } from '../../types';
import {
  UserStatusDot,
  UserStatusBadge,
  getEffectiveStatus,
  AvailabilityStatus,
} from '../common/UserStatusBadge';
import { CONNECT_TOPICS } from '../../services/mockData';
import { calculateProfileMatch, getInterestIcon, MatchResult } from '../../services/interestTags';

interface DiscoverViewProps {
  onNavigateTab: (tab: string) => void;
  onOpenReportModal: (user: UserProfile) => void;
  onSwitchToRooms?: () => void;
}

export const DiscoverView: React.FC<DiscoverViewProps> = ({
  onNavigateTab,
  onOpenReportModal,
  onSwitchToRooms,
}) => {
  const { currentUser } = useAuth();
  const {
    profiles,
    conversations,
    setActiveConversationId,
    connectedUserIds,
    sendConnectionRequest,
    pendingRequestIds,
    blockUser,
    filters,
    setFilters,
  } = useSocial();
  const { startCall } = useCall();

  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [activeMenuUserId, setActiveMenuUserId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'online' | 'busy' | 'offline'>('all');
  const [topicFilter, setTopicFilter] = useState<string>('all');

  // Interest Matching Algorithm Controls
  const [algorithmSort, setAlgorithmSort] = useState<
    'best_match' | 'shared_interests' | 'online_first' | 'verified_first'
  >('best_match');
  const [sharedInterestsOnly, setSharedInterestsOnly] = useState<boolean>(false);
  const [selectedInterestChip, setSelectedInterestChip] = useState<string | null>(null);
  const [selectedMatchModal, setSelectedMatchModal] = useState<{
    profile: UserProfile;
    match: MatchResult;
  } | null>(null);

  // User's own interest tags for quick filtering
  const myInterests = useMemo(() => currentUser?.interests || [], [currentUser]);

  // Compute matches and filter/sort profiles
  const processedProfiles = useMemo(() => {
    // 1. Calculate match for each profile
    const list = profiles.map((p) => {
      const match = calculateProfileMatch(currentUser, p);
      const effectiveStatus = getEffectiveStatus(p);
      return { profile: p, match, effectiveStatus };
    });

    // 2. Filter profiles
    const filtered = list.filter(({ profile: p, match, effectiveStatus }) => {
      // Dynamic status filter
      if (statusFilter !== 'all' && effectiveStatus !== statusFilter) return false;

      // Topic filter
      if (topicFilter !== 'all') {
        const matchesTopic =
          p.activeTopic === topicFilter || p.interestedTopics?.includes(topicFilter);
        if (!matchesTopic) return false;
      }

      // Shared Interests Only toggle
      if (sharedInterestsOnly && match.sharedInterests.length === 0) return false;

      // Specific interest chip filter
      if (selectedInterestChip) {
        const hasChip = p.interests.some(
          (i) => i.toLowerCase().trim() === selectedInterestChip.toLowerCase().trim()
        );
        if (!hasChip) return false;
      }

      // Search query match
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        const matchName = p.displayName.toLowerCase().includes(q);
        const matchInterests = p.interests.some((i) => i.toLowerCase().includes(q));
        const matchLocation = p.broadLocation.toLowerCase().includes(q);
        const matchTopic = p.activeTopic?.toLowerCase().includes(q);
        if (!matchName && !matchInterests && !matchLocation && !matchTopic) return false;
      }

      // Age range
      if (p.age < filters.minAge || p.age > filters.maxAge) return false;

      // Country
      if (filters.country && !p.country.toLowerCase().includes(filters.country.toLowerCase()))
        return false;

      // Language
      if (
        filters.language &&
        !p.languages.some((l) => l.toLowerCase().includes(filters.language.toLowerCase()))
      )
        return false;

      // Verified only
      if (filters.verifiedOnly && !p.isVerified) return false;

      return true;
    });

    // 3. Sort based on Algorithm Mode
    return filtered.sort((a, b) => {
      if (algorithmSort === 'best_match') {
        return b.match.matchPercentage - a.match.matchPercentage;
      }
      if (algorithmSort === 'shared_interests') {
        if (b.match.sharedInterests.length !== a.match.sharedInterests.length) {
          return b.match.sharedInterests.length - a.match.sharedInterests.length;
        }
        return b.match.matchPercentage - a.match.matchPercentage;
      }
      if (algorithmSort === 'online_first') {
        const aOnline = a.effectiveStatus === 'online' ? 2 : a.effectiveStatus === 'busy' ? 1 : 0;
        const bOnline = b.effectiveStatus === 'online' ? 2 : b.effectiveStatus === 'busy' ? 1 : 0;
        if (bOnline !== aOnline) return bOnline - aOnline;
        return b.match.matchPercentage - a.match.matchPercentage;
      }
      if (algorithmSort === 'verified_first') {
        const aVer = a.profile.isVerified ? 1 : 0;
        const bVer = b.profile.isVerified ? 1 : 0;
        if (bVer !== aVer) return bVer - aVer;
        return b.match.matchPercentage - a.match.matchPercentage;
      }
      return 0;
    });
  }, [
    profiles,
    currentUser,
    statusFilter,
    topicFilter,
    sharedInterestsOnly,
    selectedInterestChip,
    filters,
    algorithmSort,
  ]);

  const handleStartCall = async (targetUser: UserProfile, type: 'audio' | 'video') => {
    await startCall(targetUser, type, targetUser.activeTopic);
  };

  const handleOpenChat = (userId: string) => {
    const existing = conversations.find((c) => c.participant.id === userId);
    if (existing) {
      setActiveConversationId(existing.id);
    }
    onNavigateTab('messages');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 text-left text-black font-bold">
      {/* Top Header & View Switcher */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>Discovery Matches</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#7C5CFF]/15 text-[#7C5CFF] border border-[#7C5CFF]/30 font-mono font-bold">
                {processedProfiles.length} Members
              </span>
            </h1>
          </div>
          <p className="text-xs text-slate-600">
            Powered by smart interest tag compatibility &amp; live availability matching
          </p>
        </div>

        {onSwitchToRooms && (
          <button
            onClick={onSwitchToRooms}
            className="px-4 py-2 rounded-2xl bg-gradient-to-r from-[#FF1493]/15 to-[#7C5CFF]/15 hover:from-[#FF1493]/25 hover:to-[#7C5CFF]/25 border border-pink-300 text-xs font-bold text-pink-700 flex items-center gap-2 transition-all shadow-xs self-start sm:self-auto"
          >
            <Radio className="w-4 h-4 text-pink-600 animate-pulse" />
            <span>Switch to Audio Rooms</span>
          </button>
        )}
      </div>

      {/* Algorithm Strategy & Quick Interests Filter Bar */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-white/95 border border-stone-200/90 shadow-sm space-y-3">
        {/* Top Row: Algorithm Mode Selector & Smart Match Toggle */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1 mr-1">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Algorithm:</span>
            </span>

            <button
              onClick={() => setAlgorithmSort('best_match')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                algorithmSort === 'best_match'
                  ? 'bg-gradient-to-r from-[#7C5CFF] to-[#FF4F9A] text-white shadow-xs'
                  : 'bg-stone-100 text-slate-600 hover:bg-stone-200 hover:text-slate-900 border border-stone-200/60'
              }`}
            >
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>Best Match (AI Score)</span>
            </button>

            <button
              onClick={() => setAlgorithmSort('shared_interests')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                algorithmSort === 'shared_interests'
                  ? 'bg-gradient-to-r from-[#7C5CFF] to-[#FF4F9A] text-white shadow-md shadow-purple-500/20'
                  : 'bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              <Tag className="w-3 h-3" />
              <span>Most in Common</span>
            </button>

            <button
              onClick={() => setAlgorithmSort('online_first')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                algorithmSort === 'online_first'
                  ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/40'
                  : 'bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Online First</span>
            </button>
          </div>

          {/* Quick toggle: Smart Matches (Shared interests with user) */}
          <button
            onClick={() => setSharedInterestsOnly(!sharedInterestsOnly)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border ${
              sharedInterestsOnly
                ? 'bg-[#FF4F9A]/20 border-[#FF4F9A] text-pink-300 shadow-md shadow-pink-500/20'
                : 'bg-white/5 border-white/10 text-slate-300 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-pink-400" />
            <span>Shared Interests Only</span>
            {sharedInterestsOnly && <Check className="w-3 h-3 stroke-[3]" />}
          </button>
        </div>

        {/* User's Own Interests Tags Filter Row */}
        {myInterests.length > 0 && (
          <div className="pt-2 border-t border-white/[0.06] flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
              <Tag className="w-3 h-3 text-[#7C5CFF]" />
              <span>Your Tags:</span>
            </span>

            {selectedInterestChip && (
              <button
                onClick={() => setSelectedInterestChip(null)}
                className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 shrink-0 hover:bg-rose-500/30"
              >
                Clear Filter ✕
              </button>
            )}

            {myInterests.map((tag) => {
              const isSelected = selectedInterestChip?.toLowerCase() === tag.toLowerCase();
              return (
                <button
                  key={tag}
                  onClick={() => setSelectedInterestChip(isSelected ? null : tag)}
                  className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 transition-all flex items-center gap-1.5 border ${
                    isSelected
                      ? 'bg-gradient-to-r from-[#7C5CFF] to-[#FF4F9A] text-white border-transparent shadow-sm ring-1 ring-white/30'
                      : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  <span>{getInterestIcon(tag)}</span>
                  <span>{tag}</span>
                </button>
              );
            })}

            <button
              onClick={() => onNavigateTab('profile')}
              className="text-[11px] font-bold text-[#7C5CFF] hover:underline shrink-0 ml-1"
            >
              + Edit Your Tags
            </button>
          </div>
        )}
      </div>

      {/* Horizontal Topic Filter Scroll Row: Love, Married, Usual, Foodie, Sports, Games, Movies */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-pink-400" />
          Topics:
        </span>
        <button
          onClick={() => setTopicFilter('all')}
          className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 transition-colors ${
            topicFilter === 'all'
              ? 'bg-[#7C5CFF] text-white shadow-md shadow-purple-600/30'
              : 'bg-white/10 text-slate-300 hover:bg-white/15'
          }`}
        >
          All Topics
        </button>
        {CONNECT_TOPICS.map((topic) => (
          <button
            key={topic.id}
            onClick={() => setTopicFilter(topic.tag)}
            className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 flex items-center gap-1.5 transition-colors ${
              topicFilter === topic.tag
                ? 'bg-gradient-to-r from-[#FF1493] to-[#FF4F9A] text-white shadow-md shadow-pink-600/30 ring-1 ring-white/30'
                : 'bg-white/10 text-slate-300 hover:bg-white/15 border border-white/5'
            }`}
          >
            <span>{topic.icon}</span>
            <span>#{topic.name}</span>
          </button>
        ))}
      </div>

      {/* Expandable Filter Panel */}
      {showFilterDrawer && (
        <div className="p-4 rounded-2xl bg-[#101722] border border-[#7C5CFF]/30 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Age Range (18 - 65+)</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={18}
                max={filters.maxAge}
                value={filters.minAge}
                onChange={(e) => setFilters((prev) => ({ ...prev, minAge: Number(e.target.value) }))}
                className="w-20 px-2 py-1.5 rounded-lg bg-white border border-stone-200 text-slate-800 font-mono shadow-xs"
              />
              <span className="text-slate-500">to</span>
              <input
                type="number"
                min={filters.minAge}
                max={75}
                value={filters.maxAge}
                onChange={(e) => setFilters((prev) => ({ ...prev, maxAge: Number(e.target.value) }))}
                className="w-20 px-2 py-1.5 rounded-lg bg-white border border-stone-200 text-slate-800 font-mono shadow-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-600 mb-1 font-medium">Country</label>
            <input
              type="text"
              value={filters.country}
              onChange={(e) => setFilters((prev) => ({ ...prev, country: e.target.value }))}
              placeholder="Filter by country..."
              className="w-full px-3 py-1.5 rounded-lg bg-white border border-stone-200 text-slate-800 shadow-xs"
            />
          </div>

          <div>
            <label className="block text-slate-600 mb-1 font-medium">Language</label>
            <input
              type="text"
              value={filters.language}
              onChange={(e) => setFilters((prev) => ({ ...prev, language: e.target.value }))}
              placeholder="e.g. French, German..."
              className="w-full px-3 py-1.5 rounded-lg bg-white border border-stone-200 text-slate-800 shadow-xs"
            />
          </div>
        </div>
      )}

      {/* Profiles Grid */}
      {processedProfiles.length === 0 ? (
        <div className="py-20 text-center space-y-3">
          <p className="text-base text-slate-300">No profiles match your active filters.</p>
          <button
            onClick={() => {
              setFilters({
                searchQuery: '',
                minAge: 18,
                maxAge: 65,
                country: '',
                language: '',
                onlineOnly: false,
                verifiedOnly: false,
              });
              setStatusFilter('all');
              setTopicFilter('all');
              setSharedInterestsOnly(false);
              setSelectedInterestChip(null);
            }}
            className="px-4 py-2 rounded-xl bg-[#7C5CFF]/20 text-[#7C5CFF] text-xs font-semibold hover:bg-[#7C5CFF]/30 transition-colors"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {processedProfiles.map(({ profile, match, effectiveStatus }) => {
            const isConnected = connectedUserIds.includes(profile.id);
            const isPending = pendingRequestIds.includes(profile.id);
            const isMenuOpen = activeMenuUserId === profile.id;
            const cardStatus = effectiveStatus;

            return (
              <div
                key={profile.id}
                className="group relative rounded-3xl bg-[#101722]/85 border border-white/[0.08] hover:border-[#7C5CFF]/40 overflow-hidden shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                {/* Image Cover & Online Badge */}
                <div className="relative h-64 w-full overflow-hidden bg-slate-900">
                  <img
                    src={profile.avatarUrl}
                    alt={profile.displayName}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#101722] via-[#101722]/30 to-transparent" />

                  {/* Top floating bar inside image */}
                  <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {/* Dynamic Status Indicator: Green (Online), Orange (Busy), Grey (Offline) */}
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-[11px] text-white border border-white/10 shadow-md">
                        <UserStatusDot status={cardStatus} size="xs" />
                        <span className="font-bold">
                          {cardStatus === 'online'
                            ? 'Online'
                            : cardStatus === 'busy'
                            ? 'Busy'
                            : 'Offline'}
                        </span>
                      </div>

                      {/* Dynamic Interest Compatibility Match Score Pill */}
                      <button
                        onClick={() => setSelectedMatchModal({ profile, match })}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-[#7C5CFF] to-[#FF4F9A] text-white text-[11px] font-black border border-white/20 shadow-lg hover:scale-105 active:scale-95 transition-all backdrop-blur-md"
                        title="Click to view match chemistry breakdown"
                      >
                        <Sparkles className="w-3 h-3 text-amber-300" />
                        <span>{match.matchPercentage}% Match</span>
                      </button>

                      {profile.activeTopic && (
                        <span className="px-2 py-0.5 rounded-full bg-pink-500/30 text-pink-300 border border-pink-500/40 text-[10px] font-bold backdrop-blur-md">
                          #{profile.activeTopic}
                        </span>
                      )}
                    </div>

                    {/* More Action Trigger */}
                    <div className="relative">
                      <button
                        onClick={() => setActiveMenuUserId(isMenuOpen ? null : profile.id)}
                        className="p-1.5 rounded-full bg-black/60 backdrop-blur-md text-slate-300 hover:text-white transition-colors"
                        title="Options"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {isMenuOpen && (
                        <div className="absolute right-0 mt-2 w-36 rounded-xl bg-white border border-stone-200 shadow-xl py-1 z-20 text-xs">
                          <button
                            onClick={() => {
                              onOpenReportModal(profile);
                              setActiveMenuUserId(null);
                            }}
                            className="w-full px-3 py-2 text-left text-slate-700 hover:bg-stone-100 hover:text-rose-600 flex items-center gap-2"
                          >
                            <ShieldAlert className="w-3.5 h-3.5" />
                            <span>Report User</span>
                          </button>
                          <button
                            onClick={() => {
                              blockUser(profile.id);
                              setActiveMenuUserId(null);
                            }}
                            className="w-full px-3 py-2 text-left text-rose-600 hover:bg-stone-100"
                          >
                            Block User
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Name, Age & Location bottom overlay */}
                  <div className="absolute bottom-3 left-4 right-4">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-lg font-extrabold text-white truncate">
                        {profile.displayName}
                      </h3>
                      {profile.isVerified && (
                        <span title="Verified Adult">
                          <CheckCircle2 className="w-4 h-4 text-[#20D9C3] shrink-0" />
                        </span>
                      )}
                    </div>
                    {/* Zero-Pill Unboxed Metadata */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium">
                      <span>{profile.age} yrs</span>
                      <span>·</span>
                      <span className="truncate">{profile.broadLocation}</span>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 space-y-3.5 flex-1 flex flex-col justify-between">
                  <div className="space-y-2.5">
                    <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                      {profile.bio}
                    </p>

                    {/* Shared Interests Highlights Banner */}
                    {match.sharedInterests.length > 0 ? (
                      <div className="p-2 rounded-xl bg-[#7C5CFF]/15 border border-[#7C5CFF]/30 text-purple-200 text-[11px] font-semibold flex items-center justify-between gap-1">
                        <span className="flex items-center gap-1.5 truncate">
                          <Sparkles className="w-3 h-3 text-pink-400 shrink-0" />
                          <span>Shared: <strong>{match.sharedInterests.join(', ')}</strong></span>
                        </span>
                        <span className="text-[9.5px] uppercase font-bold px-1.5 py-0.2 rounded bg-purple-500/25 text-purple-300 border border-purple-400/30 shrink-0">
                          {match.scoreGrade}
                        </span>
                      </div>
                    ) : (
                      <div className="text-[10.5px] text-slate-400 italic">
                        {match.summaryText}
                      </div>
                    )}

                    {/* Interests Tag Cloud with Highlighted Shared Tags */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <span>Interest Tags</span>
                        <button
                          onClick={() => setSelectedMatchModal({ profile, match })}
                          className="text-[#7C5CFF] hover:underline normal-case font-semibold"
                        >
                          View Vibe Breakdown
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {profile.interests.map((interest) => {
                          const isShared = myInterests.some(
                            (mi) => mi.toLowerCase().trim() === interest.toLowerCase().trim()
                          );
                          return (
                            <span
                              key={interest}
                              className={`text-[10.5px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 transition-all ${
                                isShared
                                  ? 'bg-gradient-to-r from-[#7C5CFF]/30 to-[#FF4F9A]/30 border border-[#7C5CFF]/60 text-white shadow-sm'
                                  : 'bg-white/5 border border-white/10 text-slate-400'
                              }`}
                            >
                              <span>{getInterestIcon(interest)}</span>
                              <span>{interest}</span>
                              {isShared && <Sparkles className="w-2.5 h-2.5 text-amber-300" />}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 border-t border-white/[0.06] pt-3 text-[11px] text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Languages className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="truncate">{profile.languages.join(', ')}</span>
                    </div>
                  </div>

                  {/* Primary Action Buttons */}
                  <div className="pt-2 flex items-center gap-2">
                    {isConnected ? (
                      <button
                        onClick={() => handleOpenChat(profile.id)}
                        className="flex-1 py-2.5 rounded-xl bg-[#7C5CFF]/20 text-[#7C5CFF] hover:bg-[#7C5CFF]/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Message</span>
                      </button>
                    ) : isPending ? (
                      <button
                        disabled
                        className="flex-1 py-2.5 rounded-xl bg-white/5 text-slate-500 text-xs font-medium text-center cursor-default"
                      >
                        Pending Request
                      </button>
                    ) : (
                      <button
                        onClick={() => sendConnectionRequest(profile.id)}
                        className="flex-1 py-2.5 rounded-xl bg-[#7C5CFF] hover:bg-[#6846f3] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-md shadow-[#7C5CFF]/20"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Connect</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleStartCall(profile, 'audio')}
                      className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-[#7C5CFF] transition-colors"
                      title="Audio Call"
                    >
                      <PhoneCall className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleStartCall(profile, 'video')}
                      className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-[#20D9C3] transition-colors"
                      title="Video Call"
                    >
                      <Video className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Compatibility Breakdown Modal */}
      {selectedMatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl bg-[#0F172A] border border-[#7C5CFF]/40 p-5 shadow-2xl space-y-4 text-left">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full overflow-hidden border border-white/20 bg-slate-800">
                  <img
                    src={selectedMatchModal.profile.avatarUrl}
                    alt={selectedMatchModal.profile.displayName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">
                    Match with {selectedMatchModal.profile.displayName}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Compatibility Chemistry Breakdown
                  </p>
                </div>
              </div>

              <div className="px-2.5 py-1 rounded-full bg-gradient-to-r from-[#7C5CFF] to-[#FF4F9A] text-white font-mono text-xs font-black shadow">
                {selectedMatchModal.match.matchPercentage}%
              </div>
            </div>

            <div className="space-y-3 text-xs">
              {/* Grade */}
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Match Tier</div>
                <div className="text-sm font-black text-amber-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  <span>{selectedMatchModal.match.scoreGrade} Connection</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  {selectedMatchModal.match.summaryText}
                </p>
              </div>

              {/* Shared Interests */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-extrabold text-slate-400 uppercase">
                  Shared Interest Tags ({selectedMatchModal.match.sharedInterests.length})
                </span>
                {selectedMatchModal.match.sharedInterests.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {selectedMatchModal.match.sharedInterests.map((t) => (
                      <span
                        key={t}
                        className="px-2.5 py-1 rounded-full bg-gradient-to-r from-[#7C5CFF]/30 to-[#FF4F9A]/30 border border-[#7C5CFF]/60 text-white font-bold text-xs flex items-center gap-1"
                      >
                        <span>{getInterestIcon(t)}</span>
                        <span>{t}</span>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-500 italic">
                    No exact matching interests yet. Add more interests to your profile!
                  </p>
                )}
              </div>

              {/* Topics & Languages */}
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                  <span className="text-[10px] text-slate-500 font-bold block">Active Topic</span>
                  <span className="font-extrabold text-white">
                    #{selectedMatchModal.profile.activeTopic || 'General'}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                  <span className="text-[10px] text-slate-500 font-bold block">Languages</span>
                  <span className="font-extrabold text-white truncate block">
                    {selectedMatchModal.profile.languages.join(', ')}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button
                onClick={() => {
                  handleStartCall(selectedMatchModal.profile, 'audio');
                  setSelectedMatchModal(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#7C5CFF] hover:bg-[#6b47ff] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Call Now</span>
              </button>

              <button
                onClick={() => setSelectedMatchModal(null)}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
