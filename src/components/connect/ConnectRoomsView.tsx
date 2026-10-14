import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  PhoneCall,
  Video,
  MessageSquare,
  Sparkles,
  Star,
  Users,
  Flame,
  X,
  Shuffle,
  HeartHandshake,
  SlidersHorizontal,
  MapPin,
  Tag,
  ShieldCheck,
  Crown,
  CheckCircle2,
  User,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useSocial } from '../../contexts/SocialContext';
import { useCall } from '../../contexts/CallContext';
import { UserProfile } from '../../types';
import { INITIAL_DISCOVER_PROFILES, CONNECT_TOPICS } from '../../services/mockData';
import { UserStatusDot, getEffectiveStatus } from '../common/UserStatusBadge';
import { calculateProfileMatch, getInterestIcon } from '../../services/interestTags';

import { CoinWalletModal } from '../home/CoinWalletModal';

interface ConnectRoomsViewProps {
  onNavigateTab: (tab: string) => void;
  onOpenReportModal?: (user: UserProfile) => void;
  onSelectProfile?: (user: UserProfile) => void;
}

const POPULAR_LOCATIONS = [
  { tag: 'all', label: '🌍 All Locations' },
  { tag: 'mumbai', label: '🇮🇳 Mumbai' },
  { tag: 'delhi', label: '🇮🇳 Delhi' },
  { tag: 'kolkata', label: '🇮🇳 Kolkata' },
  { tag: 'chennai', label: '🇮🇳 Chennai' },
  { tag: 'paris', label: '🇫🇷 Paris' },
  { tag: 'london', label: '🇬🇧 London' },
  { tag: 'berlin', label: '🇩🇪 Berlin' },
  { tag: 'new york', label: '🇺🇸 New York' },
  { tag: 'singapore', label: '🇸🇬 Singapore' },
];

const POPULAR_INTERESTS = [
  { tag: 'all', label: 'All Interests', icon: '✨' },
  { tag: 'music', label: 'Music', icon: '🎵' },
  { tag: 'coffee', label: 'Coffee', icon: '☕' },
  { tag: 'travel', label: 'Travel', icon: '✈️' },
  { tag: 'poetry', label: 'Poetry', icon: '📚' },
  { tag: 'fashion', label: 'Fashion', icon: '👗' },
  { tag: 'games', label: 'Games', icon: '🎮' },
  { tag: 'art', label: 'Art', icon: '🎨' },
  { tag: 'love', label: 'Love', icon: '❤️' },
  { tag: 'foodie', label: 'Foodie', icon: '🍜' },
  { tag: 'sports', label: 'Sports', icon: '⚽' },
  { tag: 'movies', label: 'Movies', icon: '🎬' },
];

export const ConnectRoomsView: React.FC<ConnectRoomsViewProps> = ({
  onNavigateTab,
  onOpenReportModal,
  onSelectProfile,
}) => {
  const { currentUser } = useAuth();
  const { setActiveConversationId, conversations, profiles } = useSocial();
  const { startCall } = useCall();

  const [activeCategory, setActiveCategory] = useState<'top' | 'hashtag' | 'star' | 'celeb'>('top');
  const [selectedTopic, setSelectedTopic] = useState<string>('Love');
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateRoomAlert, setShowCreateRoomAlert] = useState(false);

  // Filter controls state
  const [statusFilter, setStatusFilter] = useState<'all' | 'online' | 'busy' | 'offline'>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [selectedInterest, setSelectedInterest] = useState<string>('all');
  const [showFiltersPanel, setShowFiltersPanel] = useState<boolean>(true);

  // Floating constellation profiles:
  // ruhi, Ananya, Rakhi, milkee
  const ruhi = INITIAL_DISCOVER_PROFILES[0];
  const ananya = INITIAL_DISCOVER_PROFILES[1];
  const rakhi = INITIAL_DISCOVER_PROFILES[2];
  const milkee = INITIAL_DISCOVER_PROFILES[3];

  // Combined deduplicated roster
  const allProfiles = useMemo(() => {
    const map = new Map<string, UserProfile>();
    INITIAL_DISCOVER_PROFILES.forEach((p) => map.set(p.id, p));
    (profiles || []).forEach((p) => map.set(p.id, p));
    return Array.from(map.values());
  }, [profiles]);

  // Dynamic filtered profiles based on location, interests, online status, and search query
  const filteredProfiles = useMemo(() => {
    return allProfiles.filter((user) => {
      // 1. Online status filter
      const effectiveStatus = getEffectiveStatus(user);
      if (statusFilter !== 'all' && effectiveStatus !== statusFilter) {
        return false;
      }

      // 2. Location filter
      if (selectedLocation !== 'all') {
        const loc = selectedLocation.toLowerCase();
        const matchesLoc =
          user.broadLocation?.toLowerCase().includes(loc) ||
          user.country?.toLowerCase().includes(loc);
        if (!matchesLoc) return false;
      }

      // 3. Interests filter
      if (selectedInterest !== 'all') {
        const intr = selectedInterest.toLowerCase();
        const matchesInt =
          user.interests?.some((i) => i.toLowerCase().includes(intr)) ||
          user.activeTopic?.toLowerCase() === intr ||
          user.interestedTopics?.some((t) => t.toLowerCase() === intr);
        if (!matchesInt) return false;
      }

      // 4. Text search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName =
          user.displayName?.toLowerCase().includes(q) ||
          user.firstName?.toLowerCase().includes(q) ||
          user.username?.toLowerCase().includes(q);
        const matchLoc =
          user.broadLocation?.toLowerCase().includes(q) ||
          user.country?.toLowerCase().includes(q);
        const matchInt = user.interests?.some((i) => i.toLowerCase().includes(q));
        const matchTop =
          user.activeTopic?.toLowerCase().includes(q) ||
          user.interestedTopics?.some((t) => t.toLowerCase() === q);
        const matchBio = user.bio?.toLowerCase().includes(q);

        if (!matchName && !matchLoc && !matchInt && !matchTop && !matchBio) {
          return false;
        }
      }

      return true;
    });
  }, [allProfiles, statusFilter, selectedLocation, selectedInterest, searchQuery]);

  const onlineCount = useMemo(
    () => allProfiles.filter((p) => getEffectiveStatus(p) === 'online').length,
    [allProfiles]
  );
  const busyCount = useMemo(
    () => allProfiles.filter((p) => getEffectiveStatus(p) === 'busy').length,
    [allProfiles]
  );
  const offlineCount = useMemo(
    () => allProfiles.filter((p) => getEffectiveStatus(p) === 'offline').length,
    [allProfiles]
  );

  const hasActiveFilters = Boolean(
    searchQuery.trim() ||
    statusFilter !== 'all' ||
    selectedLocation !== 'all' ||
    selectedInterest !== 'all'
  );

  const activeFilterCount =
    (searchQuery.trim() ? 1 : 0) +
    (statusFilter !== 'all' ? 1 : 0) +
    (selectedLocation !== 'all' ? 1 : 0) +
    (selectedInterest !== 'all' ? 1 : 0);

  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setSelectedLocation('all');
    setSelectedInterest('all');
  };

  const handleStartAudioCall = async (user: UserProfile, topic?: string) => {
    await startCall(user, 'audio', topic || user.activeTopic || selectedTopic);
  };

  const handleStartVideoCall = async (user: UserProfile, topic?: string) => {
    await startCall(user, 'video', topic || user.activeTopic || selectedTopic);
  };

  const handleDirectChat = (user: UserProfile) => {
    const existing = conversations.find((c) => c.participant.id === user.id);
    if (existing) {
      setActiveConversationId(existing.id);
    }
    onNavigateTab('messages');
  };

  const handleRandomAudio = async () => {
    const topicFiltered = allProfiles.filter(
      (p) => p.activeTopic === selectedTopic || p.interestedTopics?.includes(selectedTopic)
    );
    const candidates = topicFiltered.length > 0 ? topicFiltered : [ruhi, ananya, rakhi, milkee];
    const picked = candidates[Math.floor(Math.random() * candidates.length)];
    await startCall(picked, 'audio', selectedTopic);
  };

  const handleRandomVideo = async () => {
    const topicFiltered = allProfiles.filter(
      (p) => p.activeTopic === selectedTopic || p.interestedTopics?.includes(selectedTopic)
    );
    const candidates = topicFiltered.length > 0 ? topicFiltered : [ruhi, milkee];
    const picked = candidates[Math.floor(Math.random() * candidates.length)];
    await startCall(picked, 'video', selectedTopic);
  };

  const handleRandomChat = () => {
    const topicFiltered = allProfiles.filter(
      (p) => p.activeTopic === selectedTopic || p.interestedTopics?.includes(selectedTopic)
    );
    const candidates = topicFiltered.length > 0 ? topicFiltered : [ruhi, ananya, rakhi, milkee];
    const picked = candidates[Math.floor(Math.random() * candidates.length)];
    const existing = conversations.find((c) => c.participant.id === picked.id);
    if (existing) {
      setActiveConversationId(existing.id);
    }
    onNavigateTab('messages');
  };

  // Filter users by topic for the rooms lounge section
  const topicUsers = allProfiles.filter((user) => {
    const matchesTopic =
      user.activeTopic === selectedTopic ||
      user.interestedTopics?.includes(selectedTopic);
    if (!matchesTopic) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return (
        user.displayName.toLowerCase().includes(q) ||
        user.broadLocation.toLowerCase().includes(q) ||
        user.interests?.some((i) => i.toLowerCase().includes(q))
      );
    }
    if (statusFilter !== 'all') {
      if (getEffectiveStatus(user) !== statusFilter) return false;
    }
    if (selectedLocation !== 'all') {
      const loc = selectedLocation.toLowerCase();
      if (
        !user.broadLocation?.toLowerCase().includes(loc) &&
        !user.country?.toLowerCase().includes(loc)
      ) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="relative min-h-[calc(100vh-4.5rem)] pb-24 bg-gradient-to-b from-[#FFFDF9] via-[#FAF8F5] to-[#F5F2EB] text-black font-bold overflow-hidden select-none">
      
      {/* Background Hearts & Ambient Glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Soft floating hearts shapes */}
        <div className="absolute top-20 left-10 w-48 h-48 bg-pink-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-4 w-60 h-60 bg-purple-600/15 rounded-full blur-3xl" />
        <div className="absolute bottom-32 left-1/4 w-72 h-72 bg-rose-600/10 rounded-full blur-3xl" />
        
        {/* SVG Subtle Ambient Hearts */}
        <svg className="absolute inset-0 w-full h-full opacity-15" xmlns="http://www.w3.org/2000/svg">
          <path d="M120,240 C100,200 60,200 40,230 C20,260 50,300 120,360 C190,300 220,260 200,230 C180,200 140,200 120,240 Z" fill="#FF1493" />
          <path d="M320,180 C305,150 275,150 260,172 C245,195 267,225 320,270 C372,225 395,195 380,172 C365,150 335,150 320,180 Z" fill="#9400D3" />
          <path d="M280,480 C265,450 235,450 220,472 C205,495 227,525 280,570 C332,525 355,495 340,472 C325,450 295,450 280,480 Z" fill="#FF1493" />
          <path d="M80,560 C65,530 35,530 20,552 C5,575 27,605 80,650 C132,605 155,575 140,552 C125,530 95,530 80,560 Z" fill="#9400D3" />
        </svg>
      </div>

      <div className="relative z-10 max-w-lg mx-auto px-4 py-3 space-y-4">
        
        {/* =========================================================================
            TOP BAR (Avatar + Coins + Search + Create Room Button)
            ========================================================================= */}
        <div className="flex items-center justify-between pt-1">
          {/* Avatar with Champion Badge */}
          <div
            onClick={() => onNavigateTab('profile')}
            className="flex items-center gap-2 cursor-pointer"
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-cyan-400 p-0.5 bg-slate-900 shadow-md">
                <img
                  src={currentUser?.avatarUrl}
                  alt={currentUser?.displayName}
                  className="w-full h-full object-cover rounded-full"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute -bottom-1 -left-1 px-1 py-0.2 rounded-full bg-gradient-to-r from-amber-500 to-yellow-300 text-[7px] font-black text-slate-950 uppercase tracking-tighter shadow">
                CHAMPION
              </div>
            </div>
          </div>

          {/* Coin Balance Pill */}
          <button
            onClick={() => setIsWalletOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-slate-950 shadow-md hover:bg-slate-100 transition-all active:scale-95"
          >
            <span className="text-base">🪙</span>
            <span className="font-extrabold text-sm font-mono">{currentUser?.coins ?? 80}</span>
          </button>

          {/* Search & Plus Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setShowFiltersPanel(true);
                setIsSearchOpen(!isSearchOpen);
              }}
              className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md active:scale-95 transition-all ${
                hasActiveFilters
                  ? 'bg-pink-500 text-white ring-2 ring-pink-300'
                  : 'bg-white text-slate-900 hover:bg-slate-100'
              }`}
              title="Search & Filters"
            >
              <Search className="w-5 h-5 stroke-[2.5]" />
            </button>

            <button
              onClick={() => setShowCreateRoomAlert(true)}
              className="relative w-10 h-10 rounded-full bg-white text-slate-900 flex items-center justify-center shadow-md hover:bg-slate-100 active:scale-95 transition-all"
              title="Create Room"
            >
              <Plus className="w-6 h-6 stroke-[3]" />
              {/* Notification red dot */}
              <span className="absolute top-0 right-0 w-3 h-3 rounded-full bg-rose-500 border-2 border-[#FAF8F5]" />
            </button>
          </div>
        </div>

        {/* =========================================================================
            DISCOVER & CONNECT SEARCH BAR & FILTER CONTROLS
            ========================================================================= */}
        <div className="space-y-2.5">
          {/* Main Search Input */}
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 w-4 h-4 text-pink-300 pointer-events-none stroke-[2.5]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by location (e.g. Mumbai, Paris), interests, or name..."
              className="w-full pl-10 pr-20 py-2.5 rounded-2xl bg-black/60 border border-white/20 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/30 text-white placeholder-slate-400 text-xs font-semibold shadow-inner outline-none transition-all"
            />
            <div className="absolute right-2 flex items-center gap-1.5">
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="p-1 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={() => setShowFiltersPanel(!showFiltersPanel)}
                className={`p-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
                  hasActiveFilters
                    ? 'bg-gradient-to-r from-[#FF1493] to-[#7C5CFF] text-white shadow-md shadow-pink-600/30 ring-1 ring-white/30'
                    : 'bg-white/10 text-slate-300 hover:bg-white/20'
                }`}
                title="Toggle Filters Panel"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                {activeFilterCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-white text-slate-950 text-[9px] font-black flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Expandable Filter Controls Panel */}
          {showFiltersPanel && (
            <div className="p-3 rounded-2xl bg-black/50 border border-white/15 backdrop-blur-md space-y-2.5 shadow-xl animate-in fade-in">
              {/* 1. Online Status Filter Controls */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>Online Status:</span>
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono">
                    🟢 {onlineCount} Online
                  </span>
                </div>
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                  <button
                    onClick={() => setStatusFilter('all')}
                    className={`px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap transition-all ${
                      statusFilter === 'all'
                        ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow'
                        : 'bg-white/10 text-slate-300 hover:bg-white/15'
                    }`}
                  >
                    All Status ({allProfiles.length})
                  </button>
                  <button
                    onClick={() => setStatusFilter('online')}
                    className={`px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
                      statusFilter === 'online'
                        ? 'bg-emerald-500 text-slate-950 font-black shadow-emerald-500/30'
                        : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Online ({onlineCount})</span>
                  </button>
                  <button
                    onClick={() => setStatusFilter('busy')}
                    className={`px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
                      statusFilter === 'busy'
                        ? 'bg-amber-500 text-slate-950 font-black shadow-amber-500/30'
                        : 'bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/25'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span>Busy ({busyCount})</span>
                  </button>
                  <button
                    onClick={() => setStatusFilter('offline')}
                    className={`px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
                      statusFilter === 'offline'
                        ? 'bg-slate-500 text-white font-black'
                        : 'bg-slate-500/15 text-slate-400 border border-slate-500/30 hover:bg-slate-500/25'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                    <span>Offline ({offlineCount})</span>
                  </button>
                </div>
              </div>

              {/* 2. Location Filter Controls */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-rose-400" />
                    <span>Location:</span>
                  </span>
                  <span className="text-[10px] text-pink-300">
                    {selectedLocation === 'all' ? 'Worldwide' : selectedLocation.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                  {POPULAR_LOCATIONS.map((loc) => {
                    const isSelected = selectedLocation.toLowerCase() === loc.tag.toLowerCase();
                    return (
                      <button
                        key={loc.tag}
                        onClick={() => setSelectedLocation(loc.tag)}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap transition-all ${
                          isSelected
                            ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow ring-1 ring-white/30'
                            : 'bg-white/10 text-slate-300 hover:bg-white/15'
                        }`}
                      >
                        <span>{loc.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Interests Filter Controls */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
                  <span className="flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5 text-pink-400" />
                    <span>Interests:</span>
                  </span>
                  <span className="text-[10px] text-cyan-300">
                    {selectedInterest === 'all' ? 'All Interests' : `#${selectedInterest}`}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                  {POPULAR_INTERESTS.map((intItem) => {
                    const isSelected = selectedInterest.toLowerCase() === intItem.tag.toLowerCase();
                    return (
                      <button
                        key={intItem.tag}
                        onClick={() => setSelectedInterest(intItem.tag)}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap flex items-center gap-1 transition-all ${
                          isSelected
                            ? 'bg-gradient-to-r from-[#7C5CFF] to-[#20D9C3] text-white shadow ring-1 ring-white/30'
                            : 'bg-white/10 text-slate-300 hover:bg-white/15'
                        }`}
                      >
                        <span>{intItem.icon}</span>
                        <span>{intItem.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active Filter Pill & Reset Action */}
              {hasActiveFilters && (
                <div className="pt-1.5 flex items-center justify-between border-t border-white/10 text-xs">
                  <span className="text-[11px] text-pink-300 font-bold">
                    Found {filteredProfiles.length} member{filteredProfiles.length === 1 ? '' : 's'} matching filters
                  </span>
                  <button
                    onClick={handleResetFilters}
                    className="text-[11px] px-2.5 py-0.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-200 font-bold flex items-center gap-1 transition-colors"
                  >
                    <X className="w-3 h-3" />
                    <span>Reset All Filters</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* =========================================================================
            FILTERED & SEARCH MATCHES RESULTS (WHEN FILTERS ARE APPLIED)
            ========================================================================= */}
        {hasActiveFilters && (
          <div className="space-y-2.5 pt-1 animate-in fade-in">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-300" />
                <h2 className="text-sm font-black text-white">
                  Matching Members ({filteredProfiles.length})
                </h2>
              </div>
              <button
                onClick={handleResetFilters}
                className="text-[10px] text-pink-400 hover:underline font-bold"
              >
                Clear all filters
              </button>
            </div>

            {filteredProfiles.length === 0 ? (
              <div className="p-6 rounded-2xl bg-black/40 border border-white/10 text-center space-y-2">
                <p className="text-sm font-bold text-slate-300">
                  No members found matching your search.
                </p>
                <p className="text-xs text-slate-400">
                  Try broadening your location, removing an interest filter, or searching for someone else.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-1.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs shadow-md transition-all"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2.5">
                {filteredProfiles.map((user) => {
                  const userStatus = getEffectiveStatus(user);
                  const isVipSubscribed =
                    user.subscriptionTier === 'gold_vip' ||
                    user.subscriptionTier === 'black_elite';

                  return (
                    <div
                      key={user.id}
                      className="p-3 rounded-2xl bg-black/50 border border-white/10 hover:border-pink-500/40 transition-all flex items-center justify-between gap-3 shadow-lg backdrop-blur-sm group"
                    >
                      <div
                        onClick={() => onSelectProfile && onSelectProfile(user)}
                        className="flex items-center gap-3 min-w-0 cursor-pointer"
                      >
                        {/* Avatar with Halo + Status Dot */}
                        <div className="relative shrink-0">
                          <div
                            className={`w-12 h-12 rounded-full overflow-hidden border-2 p-0.5 bg-slate-900 ${
                              userStatus === 'busy'
                                ? 'border-amber-400 shadow-amber-500/20'
                                : userStatus === 'online'
                                ? 'border-emerald-400 shadow-emerald-500/20'
                                : 'border-slate-500 shadow-slate-500/20'
                            }`}
                          >
                            <img
                              src={user.avatarUrl}
                              alt={user.displayName}
                              className="w-full h-full object-cover rounded-full"
                            />
                          </div>

                          <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-[#FAF8F5] bg-[#FAF8F5] flex items-center justify-center">
                            <UserStatusDot status={userStatus} size="xs" />
                          </div>
                        </div>

                        {/* Details: Name, Golden Badges, Location, Interests */}
                        <div className="min-w-0 space-y-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="font-extrabold text-sm text-white truncate group-hover:text-pink-300 transition-colors">
                              {user.displayName}
                            </h4>
                            <span className="text-xs text-slate-400">
                              {user.age}
                            </span>

                            {/* Golden Badges for Active Subscriptions */}
                            {isVipSubscribed && (
                              <div className="flex items-center gap-1">
                                <span
                                  className="px-1.5 py-0.2 rounded-full bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 font-black text-[8px] uppercase tracking-wider flex items-center gap-0.5 border border-yellow-200 shadow-sm"
                                  title="Verified Member"
                                >
                                  <ShieldCheck className="w-2.5 h-2.5 stroke-[2.5]" />
                                  <span>Verified</span>
                                </span>
                                <span
                                  className="px-1.5 py-0.2 rounded-full bg-gradient-to-r from-yellow-300 to-amber-400 text-slate-950 font-black text-[8px] uppercase tracking-wider flex items-center gap-0.5 border border-yellow-100 shadow-sm"
                                  title="Premium VIP Member"
                                >
                                  <Crown className="w-2.5 h-2.5 stroke-[2.5]" />
                                  <span>Premium</span>
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Location pin */}
                          <div className="flex items-center gap-2 text-[10.5px] text-slate-300">
                            <span className="flex items-center gap-1 truncate text-slate-300">
                              <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
                              <span className="truncate">{user.broadLocation || user.country}</span>
                            </span>

                            <span className="text-slate-500">·</span>

                            <span
                              className={`px-1.5 py-0.2 rounded-full font-bold flex items-center gap-1 shrink-0 ${
                                userStatus === 'busy'
                                  ? 'bg-amber-500/20 text-amber-300'
                                  : userStatus === 'online'
                                  ? 'bg-emerald-500/20 text-emerald-300'
                                  : 'bg-slate-500/20 text-slate-300'
                              }`}
                            >
                              <UserStatusDot status={userStatus} size="xs" />
                              <span>{userStatus === 'busy' ? 'Busy' : userStatus === 'online' ? 'Online' : 'Offline'}</span>
                            </span>
                          </div>

                          {/* Interests tags chips */}
                          <div className="flex items-center gap-1 overflow-hidden">
                            {(user.interests || []).slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="px-1.5 py-0.2 rounded-md bg-white/10 text-[9.5px] text-slate-200 font-medium truncate"
                              >
                                {tag}
                              </span>
                            ))}
                            {user.activeTopic && (
                              <span className="px-1.5 py-0.2 rounded-md bg-pink-500/20 text-pink-300 text-[9.5px] font-bold">
                                #{user.activeTopic}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Connect Actions: Audio, Video, VibeChat, Profile */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => handleStartAudioCall(user)}
                          className="p-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-300 active:scale-95 transition-all shadow-sm"
                          title={`Audio call with ${user.displayName}`}
                        >
                          <PhoneCall className="w-4 h-4 stroke-[2.5]" />
                        </button>

                        <button
                          onClick={() => handleStartVideoCall(user)}
                          className="p-2 rounded-xl bg-pink-500/20 hover:bg-pink-500/30 border border-pink-400/40 text-pink-300 active:scale-95 transition-all shadow-sm"
                          title={`Video call with ${user.displayName}`}
                        >
                          <Video className="w-4 h-4 stroke-[2.5]" />
                        </button>

                        <button
                          onClick={() => handleDirectChat(user)}
                          className="p-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-400/40 text-rose-300 active:scale-95 transition-all shadow-sm"
                          title={`VibeChat with ${user.displayName}`}
                        >
                          <MessageSquare className="w-4 h-4 stroke-[2.5]" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            HEADER BANNER ("Live Audio Rooms" with Illustration)
            ========================================================================= */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#FF1493] via-[#E0115F] to-[#FF4F9A] px-6 py-5 shadow-xl flex items-center justify-between">
          <div className="space-y-0.5 z-10">
            <h1 className="text-2xl font-black text-white tracking-tight leading-tight drop-shadow-sm">
              Live Audio<br />Rooms
            </h1>
          </div>

          {/* Friendly couple avatar graphics */}
          <div className="relative z-10 flex items-center -space-x-4">
            <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white shadow-lg bg-pink-200">
              <img
                src={ruhi.avatarUrl}
                alt="Connect Art"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white shadow-lg bg-indigo-200">
              <img
                src={currentUser?.avatarUrl}
                alt="Connect Art"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Ambient heart watermark */}
          <div className="absolute right-0 top-0 bottom-0 w-36 bg-white/10 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* =========================================================================
            CATEGORY FILTER TABS (Top, #merawalaFRND, Star Trainers, Celeb)
            ========================================================================= */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          <button
            onClick={() => setActiveCategory('top')}
            className={`px-5 py-2 rounded-full text-xs font-bold transition-all shadow-md ${
              activeCategory === 'top'
                ? 'bg-[#7C5CFF] text-white shadow-purple-600/30'
                : 'bg-white/10 text-white hover:bg-white/15'
            }`}
          >
            Top
          </button>

          <button
            onClick={() => setActiveCategory('hashtag')}
            className={`px-5 py-2 rounded-full text-xs font-extrabold transition-all shadow-md ${
              activeCategory === 'hashtag'
                ? 'bg-white text-rose-600 shadow-white/20'
                : 'bg-white/10 text-white hover:bg-white/15'
            }`}
          >
            #merawalaFRND
          </button>

          <button
            onClick={() => setActiveCategory('star')}
            className={`px-4 py-2 rounded-full text-xs font-extrabold italic transition-all shadow-md flex items-center gap-1 ${
              activeCategory === 'star'
                ? 'bg-white text-[#FF1493] shadow-white/20'
                : 'bg-white/10 text-white hover:bg-white/15'
            }`}
          >
            <span className="font-serif italic font-bold">Star</span>
            <span className="text-[10px] font-sans font-normal opacity-80">Trainers</span>
          </button>

          <button
            onClick={() => setActiveCategory('celeb')}
            className={`px-5 py-2 rounded-full text-xs font-bold transition-all shadow-md ${
              activeCategory === 'celeb'
                ? 'bg-[#FFD700] text-slate-950 shadow-yellow-500/30'
                : 'bg-white/10 text-white hover:bg-white/15'
            }`}
          >
            Celeb
          </button>
        </div>

        {/* =========================================================================
            CONSTELLATION SPACE (Floating Avatars: ruhi, Ananya, Rakhi, milkee)
            ========================================================================= */}
        <div className="relative h-[380px] w-full my-2">
          
          {/* 1. ruhi (Center-Top) - Online Green */}
          <div
            onClick={() => handleStartVideoCall(ruhi, 'Love')}
            className="absolute top-2 left-1/2 -translate-x-1/2 flex flex-col items-center group cursor-pointer transition-transform hover:scale-105"
          >
            <div className="relative">
              {/* Star on top */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 text-yellow-300 drop-shadow">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              </div>

              {/* Video call indicator icon on top left */}
              <div className="absolute -top-1 -left-1 z-20 w-6 h-6 rounded-full bg-[#00FF88] border-2 border-[#FAF8F5] flex items-center justify-center text-slate-950 shadow">
                <Video className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>

              {/* Online Green Indicator Dot on Top Right */}
              <div className="absolute -top-1 -right-1 z-20 px-1.5 py-0.2 rounded-full bg-emerald-500 border border-[#FAF8F5] text-[8.5px] font-black text-slate-950 shadow flex items-center gap-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                <span>Online</span>
              </div>

              {/* Glowing green halo border */}
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#00FF88] via-[#20D9C3] to-[#7C5CFF] p-[3px] shadow-lg shadow-[#00FF88]/25">
                <div className="w-full h-full rounded-full overflow-hidden bg-slate-900">
                  <img src={ruhi.avatarUrl} alt="ruhi" className="w-full h-full object-cover" />
                </div>
              </div>

              {/* Language Script Badge */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 z-20 px-2 py-0.2 rounded-full bg-white text-slate-900 text-[10px] font-extrabold shadow">
                हिंदी
              </div>
            </div>
            <div className="mt-2.5 text-center">
              <span className="text-xs font-black text-black drop-shadow-sm block">ruhi</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-pink-500/30 text-pink-700 font-extrabold border border-pink-400/40">
                #Love
              </span>
            </div>
          </div>

          {/* 2. Ananya (Left Center) - Busy Orange */}
          <div
            onClick={() => handleStartAudioCall(ananya, 'Married')}
            className="absolute top-28 left-3 flex flex-col items-center group cursor-pointer transition-transform hover:scale-105"
          >
            <div className="relative">
              {/* Star on top */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 text-yellow-300 drop-shadow">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              </div>

              {/* Audio call indicator icon on top left */}
              <div className="absolute -top-1 -left-1 z-20 w-6 h-6 rounded-full bg-amber-500 border-2 border-[#FAF8F5] flex items-center justify-center text-slate-950 shadow">
                <PhoneCall className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>

              {/* Busy Orange Indicator Dot on Top Right */}
              <div className="absolute -top-1 -right-1 z-20 px-1.5 py-0.2 rounded-full bg-amber-500 border border-[#FAF8F5] text-[8.5px] font-black text-slate-950 shadow flex items-center gap-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
                <span>Busy</span>
              </div>

              {/* Glowing orange/pink halo */}
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#FFA500] via-[#FF4F9A] to-[#FF80BF] p-[3px] shadow-lg shadow-amber-500/25">
                <div className="w-full h-full rounded-full overflow-hidden bg-slate-900">
                  <img src={ananya.avatarUrl} alt="Ananya" className="w-full h-full object-cover" />
                </div>
              </div>

              {/* Language Script Badge */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 z-20 px-2 py-0.2 rounded-full bg-white text-slate-900 text-[10px] font-extrabold shadow">
                हिंदी
              </div>
            </div>
            <div className="mt-2.5 text-center">
              <span className="text-xs font-black text-black drop-shadow-sm block">Ananya</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-500/30 text-amber-700 font-extrabold border border-amber-400/40">
                #Married
              </span>
            </div>
          </div>

          {/* 3. Rakhi (Right Center) - Online Green */}
          <div
            onClick={() => handleStartAudioCall(rakhi, 'Foodie')}
            className="absolute top-28 right-3 flex flex-col items-center group cursor-pointer transition-transform hover:scale-105"
          >
            <div className="relative">
              {/* Audio call indicator on top left */}
              <div className="absolute -top-1 -left-1 z-20 w-6 h-6 rounded-full bg-[#00FF88] border-2 border-[#FAF8F5] flex items-center justify-center text-slate-950 shadow">
                <PhoneCall className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>

              {/* Online Green Indicator Dot on Top Right */}
              <div className="absolute -top-1 -right-1 z-20 px-1.5 py-0.2 rounded-full bg-emerald-500 border border-[#FAF8F5] text-[8.5px] font-black text-slate-950 shadow flex items-center gap-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                <span>Online</span>
              </div>

              {/* Glowing cyan/violet halo */}
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#20D9C3] via-[#7C5CFF] to-[#00A8FF] p-[3px] shadow-lg shadow-cyan-500/25">
                <div className="w-full h-full rounded-full overflow-hidden bg-slate-900">
                  <img src={rakhi.avatarUrl} alt="Rakhi" className="w-full h-full object-cover" />
                </div>
              </div>

              {/* Language Script Badge */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 z-20 px-2 py-0.2 rounded-full bg-white text-slate-900 text-[10px] font-extrabold shadow">
                বাংলা
              </div>
            </div>
            <div className="mt-2.5 text-center">
              <span className="text-xs font-black text-black drop-shadow-sm block">Rakhi</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-yellow-500/30 text-amber-700 font-extrabold border border-yellow-400/40">
                #Foodie
              </span>
            </div>
          </div>

          {/* 4. milkee (Bottom Center) - Online Green */}
          <div
            onClick={() => handleStartVideoCall(milkee, 'Games')}
            className="absolute bottom-2 left-1/2 -translate-x-1/2 flex flex-col items-center group cursor-pointer transition-transform hover:scale-105"
          >
            <div className="relative">
              {/* Video call indicator icon on top left */}
              <div className="absolute -top-1 -left-1 z-20 w-6 h-6 rounded-full bg-[#00FF88] border-2 border-[#FAF8F5] flex items-center justify-center text-slate-950 shadow">
                <Video className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>

              {/* Online Green Indicator Dot on Top Right */}
              <div className="absolute -top-1 -right-1 z-20 px-1.5 py-0.2 rounded-full bg-emerald-500 border border-[#FAF8F5] text-[8.5px] font-black text-slate-950 shadow flex items-center gap-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                <span>Online</span>
              </div>

              {/* Halo ring */}
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#A0AEC0] via-[#CBD5E0] to-[#E2E8F0] p-[3px] shadow-lg shadow-slate-400/25">
                <div className="w-full h-full rounded-full overflow-hidden bg-slate-900">
                  <img src={milkee.avatarUrl} alt="milkee" className="w-full h-full object-cover" />
                </div>
              </div>

              {/* Language Script Badge */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 z-20 px-2 py-0.2 rounded-full bg-white text-slate-900 text-[10px] font-extrabold shadow">
                தமிழ்
              </div>
            </div>
            <div className="mt-2.5 text-center">
              <span className="text-xs font-black text-black drop-shadow-sm block">milkee</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-purple-500/30 text-purple-700 font-extrabold border border-purple-400/40">
                #Games
              </span>
            </div>
          </div>

        </div>

        {/* =========================================================================
            INTERNATIONAL STANDARD CLASSY 3D BUTTONS (Random Audio, Video & VibeChat)
            ========================================================================= */}
        <div className="pt-2 space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-black uppercase tracking-wider text-black flex items-center gap-1.5 drop-shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span>1-on-1 Random Match · 18+ Verified</span>
            </span>
            <span className="text-[10px] font-mono font-bold text-pink-300 bg-white/10 px-2 py-0.5 rounded-full border border-white/10">
              International Standard
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {/* 1. Classy 3D Audio Match Button */}
            <button
              onClick={handleRandomAudio}
              className="relative group rounded-2xl p-3 sm:p-3.5 text-center transition-all duration-150 active:translate-y-1.5 bg-gradient-to-b from-[#00F5D4] via-[#00BBF9] to-[#0077B6] border-t-2 border-cyan-100/80 border-x border-cyan-300/40 shadow-[0_7px_0_#004C99] hover:shadow-[0_9px_0_#004C99] active:shadow-[0_2px_0_#004C99] hover:brightness-105 select-none"
              title="Connect Random Audio Match"
            >
              <div className="flex flex-col items-center justify-center space-y-1">
                {/* 3D Embossed Jewel Shield */}
                <div className="w-11 h-11 rounded-2xl bg-white/25 backdrop-blur-md border border-white/50 shadow-inner flex items-center justify-center text-white drop-shadow-md group-hover:scale-105 transition-transform">
                  <PhoneCall className="w-5 h-5 stroke-[2.75]" />
                </div>
                <div className="text-white font-black text-xs tracking-wider uppercase drop-shadow-sm">
                  Audio
                </div>
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/30 text-[10px] font-black text-white backdrop-blur-sm border border-white/20">
                  <span>🪙</span>
                  <span>30/min</span>
                </div>
              </div>
              {/* Top Glass Reflection Sheen */}
              <div className="absolute inset-x-2 top-1 h-[2px] bg-white/60 rounded-full pointer-events-none" />
            </button>

            {/* 2. Classy 3D Video Match Button */}
            <button
              onClick={handleRandomVideo}
              className="relative group rounded-2xl p-3 sm:p-3.5 text-center transition-all duration-150 active:translate-y-1.5 bg-gradient-to-b from-[#F72585] via-[#B5179E] to-[#7209B7] border-t-2 border-pink-100/80 border-x border-fuchsia-300/40 shadow-[0_7px_0_#480CA8] hover:shadow-[0_9px_0_#480CA8] active:shadow-[0_2px_0_#480CA8] hover:brightness-105 select-none"
              title="Connect Random Video Match"
            >
              <div className="flex flex-col items-center justify-center space-y-1">
                {/* 3D Embossed Jewel Shield */}
                <div className="w-11 h-11 rounded-2xl bg-white/25 backdrop-blur-md border border-white/50 shadow-inner flex items-center justify-center text-white drop-shadow-md group-hover:scale-105 transition-transform">
                  <Video className="w-5 h-5 stroke-[2.75]" />
                </div>
                <div className="text-white font-black text-xs tracking-wider uppercase drop-shadow-sm">
                  Video
                </div>
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/30 text-[10px] font-black text-white backdrop-blur-sm border border-white/20">
                  <span>🪙</span>
                  <span>80/min</span>
                </div>
              </div>
              {/* Top Glass Reflection Sheen */}
              <div className="absolute inset-x-2 top-1 h-[2px] bg-white/60 rounded-full pointer-events-none" />
            </button>

            {/* 3. Classy 3D VibeChat Match Button */}
            <button
              onClick={handleRandomChat}
              className="relative group rounded-2xl p-3 sm:p-3.5 text-center transition-all duration-150 active:translate-y-1.5 bg-gradient-to-b from-[#FF4D6D] via-[#C9184A] to-[#800F2F] border-t-2 border-rose-100/80 border-x border-rose-300/40 shadow-[0_7px_0_#590D22] hover:shadow-[0_9px_0_#590D22] active:shadow-[0_2px_0_#590D22] hover:brightness-105 select-none"
              title="Connect Random VibeChat Match"
            >
              <div className="flex flex-col items-center justify-center space-y-1">
                {/* 3D Embossed Jewel Shield */}
                <div className="w-11 h-11 rounded-2xl bg-white/25 backdrop-blur-md border border-white/50 shadow-inner flex items-center justify-center text-white drop-shadow-md group-hover:scale-105 transition-transform">
                  <MessageSquare className="w-5 h-5 stroke-[2.75]" />
                </div>
                <div className="text-white font-black text-xs tracking-wider uppercase drop-shadow-sm">
                  VibeChat
                </div>
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/30 text-[10px] font-black text-white backdrop-blur-sm border border-white/20">
                  <span>🪙</span>
                  <span>10/4msg</span>
                </div>
              </div>
              {/* Top Glass Reflection Sheen */}
              <div className="absolute inset-x-2 top-1 h-[2px] bg-white/60 rounded-full pointer-events-none" />
            </button>
          </div>
        </div>

        {/* =========================================================================
            TALK BY INTERESTED TOPIC SECTION
            ========================================================================= */}
        <div className="pt-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">💬</span>
              <h2 className="text-base font-black text-black tracking-tight">
                Talk Interested Topics
              </h2>
            </div>
            <span className="text-[10px] font-semibold text-pink-300 bg-pink-500/20 px-2.5 py-0.5 rounded-full border border-pink-500/30">
              Verified Adults 18+
            </span>
          </div>

          {/* Topic Selector Chips: Love, Married, Usual, Foodie, Sports, Games, Movies, etc. */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {CONNECT_TOPICS.map((topic) => {
              const isSelected = selectedTopic === topic.tag;
              return (
                <button
                  key={topic.id}
                  onClick={() => setSelectedTopic(topic.tag)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold flex items-center gap-1.5 whitespace-nowrap transition-all shadow-md active:scale-95 ${
                    isSelected
                      ? 'bg-gradient-to-r from-[#FF1493] to-[#FF4F9A] text-white shadow-pink-600/40 ring-1 ring-white/30'
                      : 'bg-white/10 text-slate-200 hover:bg-white/15 border border-white/5'
                  }`}
                >
                  <span>{topic.icon}</span>
                  <span>{topic.name}</span>
                  <span className={`text-[9.5px] px-1 rounded-full ${isSelected ? 'bg-black/30 text-white' : 'bg-white/10 text-slate-400'}`}>
                    {topic.activeUsersCount}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Topic Description & Instant Pair Banner */}
          {(() => {
            const currentTopicObj = CONNECT_TOPICS.find((t) => t.tag === selectedTopic) || CONNECT_TOPICS[0];
            return (
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-900/40 via-pink-900/40 to-slate-900/60 border border-pink-500/30 flex items-center justify-between gap-3 shadow-lg">
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-base">{currentTopicObj.icon}</span>
                    <h3 className="font-extrabold text-sm text-white">
                      #{currentTopicObj.name} Lounge
                    </h3>
                  </div>
                  <p className="text-[11px] text-slate-300 truncate">
                    {currentTopicObj.description}
                  </p>
                </div>

                <button
                  onClick={handleRandomAudio}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#FF1493] to-[#7C5CFF] hover:brightness-110 active:scale-95 text-white font-black text-xs flex items-center gap-1.5 shadow-md shadow-pink-500/30 shrink-0"
                >
                  <Shuffle className="w-3.5 h-3.5" />
                  <span>Audio Match</span>
                </button>
              </div>
            );
          })()}

          {/* Topic Users List Grid */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between text-xs text-slate-300 font-semibold px-1">
              <span>Members talking about #{selectedTopic}</span>
              <span className="text-[10px] text-slate-400">
                🟢 Online · 🟠 Busy · ⚪ Offline
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {topicUsers.map((user) => {
                const userStatus = getEffectiveStatus(user);
                const isVipSubscribed =
                  user.subscriptionTier === 'gold_vip' ||
                  user.subscriptionTier === 'black_elite';

                return (
                  <div
                    key={user.id}
                    className="p-3 rounded-2xl bg-black/40 border border-white/10 hover:border-white/20 transition-all flex items-center justify-between gap-3 shadow-md backdrop-blur-sm group"
                  >
                    <div
                      onClick={() => onSelectProfile && onSelectProfile(user)}
                      className="flex items-center gap-3 min-w-0 cursor-pointer"
                    >
                      {/* Avatar with Green (Online) / Orange (Busy) / Grey (Offline) Indicator */}
                      <div className="relative shrink-0">
                        <div className={`w-12 h-12 rounded-full overflow-hidden border-2 p-0.5 bg-slate-900 ${
                          userStatus === 'busy'
                            ? 'border-amber-400 shadow-amber-500/20'
                            : userStatus === 'online'
                            ? 'border-emerald-400 shadow-emerald-500/20'
                            : 'border-slate-500 shadow-slate-500/20'
                        }`}>
                          <img
                            src={user.avatarUrl}
                            alt={user.displayName}
                            className="w-full h-full object-cover rounded-full"
                          />
                        </div>

                        {/* Status Dot */}
                        <div
                          className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-[#FAF8F5] bg-[#FAF8F5] flex items-center justify-center"
                          title={`Status: ${userStatus}`}
                        >
                          <UserStatusDot status={userStatus} size="xs" />
                        </div>
                      </div>

                      {/* Name & details */}
                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="font-extrabold text-sm text-white truncate group-hover:text-pink-300 transition-colors">
                            {user.displayName}
                          </h4>
                          <span className="text-xs text-slate-400">
                            {user.age}
                          </span>

                          {/* Golden Badges for Active Subscriptions */}
                          {isVipSubscribed && (
                            <div className="flex items-center gap-1">
                              <span
                                className="px-1.5 py-0.2 rounded-full bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 font-black text-[8px] uppercase tracking-wider flex items-center gap-0.5 border border-yellow-200 shadow-sm"
                                title="Verified Member"
                              >
                                <ShieldCheck className="w-2.5 h-2.5 stroke-[2.5]" />
                                <span>Verified</span>
                              </span>
                              <span
                                className="px-1.5 py-0.2 rounded-full bg-gradient-to-r from-yellow-300 to-amber-400 text-slate-950 font-black text-[8px] uppercase tracking-wider flex items-center gap-0.5 border border-yellow-100 shadow-sm"
                                title="Premium VIP Member"
                              >
                                <Crown className="w-2.5 h-2.5 stroke-[2.5]" />
                                <span>Premium</span>
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 text-[10px] flex-wrap">
                          {/* Dynamic status pill: Green online, Orange busy, Grey offline */}
                          <span
                            className={`px-1.5 py-0.2 rounded-full font-bold flex items-center gap-1 ${
                              userStatus === 'busy'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : userStatus === 'online'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-slate-500/20 text-slate-300 border border-slate-500/30'
                            }`}
                          >
                            <UserStatusDot status={userStatus} size="xs" />
                            {userStatus === 'busy' ? 'Busy' : userStatus === 'online' ? 'Online' : 'Offline'}
                          </span>

                          {/* Topic Tag */}
                          <span className="px-1.5 py-0.2 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30 font-bold">
                            #{selectedTopic}
                          </span>

                          {/* Location pin */}
                          {user.broadLocation && (
                            <span className="flex items-center gap-0.5 text-slate-300 truncate max-w-[110px]">
                              <MapPin className="w-2.5 h-2.5 text-rose-400 shrink-0" />
                              <span className="truncate">{user.broadLocation}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions: Audio Call, Video Call, VibeChat buttons */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleStartAudioCall(user, selectedTopic)}
                        className="p-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-300 active:scale-95 transition-all"
                        title={`Audio call with ${user.displayName} on #${selectedTopic}`}
                      >
                        <PhoneCall className="w-4 h-4 stroke-[2.5]" />
                      </button>

                      <button
                        onClick={() => handleStartVideoCall(user, selectedTopic)}
                        className="p-2.5 rounded-xl bg-pink-500/20 hover:bg-pink-500/30 border border-pink-400/40 text-pink-300 active:scale-95 transition-all"
                        title={`Video call with ${user.displayName} on #${selectedTopic}`}
                      >
                        <Video className="w-4 h-4 stroke-[2.5]" />
                      </button>

                      <button
                        onClick={() => handleDirectChat(user)}
                        className="p-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-400/40 text-rose-300 active:scale-95 transition-all"
                        title={`VibeChat with ${user.displayName}`}
                      >
                        <MessageSquare className="w-4 h-4 stroke-[2.5]" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      <CoinWalletModal
        isOpen={isWalletOpen}
        onClose={() => setIsWalletOpen(false)}
        onClaimDailyCoins={() => {}}
        isClaimed={true}
      />
    </div>
  );
};
