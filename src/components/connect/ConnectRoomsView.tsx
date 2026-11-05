import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  PhoneCall,
  Video,
  MessageSquare,
  Sparkles,
  Users,
  Flame,
  X,
  Shuffle,
  SlidersHorizontal,
  MapPin,
  Tag,
  ShieldCheck,
  Crown,
  CheckCircle2,
  Clock,
  Globe2,
  ArrowUpDown,
  Radio,
  Mic,
  Phone,
  Star,
  UserCheck,
  UserPlus,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useSocial } from '../../contexts/SocialContext';
import { useCall } from '../../contexts/CallContext';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import { UserProfile } from '../../types';
import { VerifiedBadge } from '../common/VerifiedBadge';
import {
  INITIAL_DISCOVER_PROFILES,
  CONNECT_TOPICS,
  PORTRAIT_RUHI,
  PORTRAIT_ANANYA,
  PORTRAIT_RAKHI,
  PORTRAIT_MILKEE,
  PORTRAIT_SUSHMITHA,
  PORTRAIT_KRISTIN,
  AVATAR_MARCUS,
  AVATAR_CLARA,
} from '../../services/mockData';
import { UserStatusDot, getEffectiveStatus } from '../common/UserStatusBadge';
import { CoinWalletModal } from '../home/CoinWalletModal';

interface ConnectRoomsViewProps {
  onNavigateTab: (tab: string) => void;
  onOpenReportModal?: (user: UserProfile) => void;
  onSelectProfile?: (user: UserProfile) => void;
}

export interface ConnectRoomItem {
  id: string;
  title: string;
  description: string;
  host: UserProfile;
  speakers: UserProfile[];
  listenerCount: number;
  tags: string[];
  language: string;
  languageScript?: string;
  createdAt: string;
  createdTimeAgo: string;
  isLive: boolean;
  activeTopic: string;
  conversationSnippet: {
    speakerName: string;
    avatarUrl: string;
    text: string;
    timeAgo?: string;
    isHost?: boolean;
  }[];
}

const POPULAR_LOCATIONS = [
  { tag: 'all', label: 'All Locations' },
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

const INTEREST_TAG_OPTIONS = [
  { tag: 'all', label: 'All Topics', icon: '✨' },
  { tag: '#Gaming', label: '#Gaming', icon: '🎮' },
  { tag: '#Movies', label: '#Movies', icon: '🎬' },
  { tag: '#Chatting', label: '#Chatting', icon: '💬' },
  { tag: '#Music', label: '#Music', icon: '🎵' },
  { tag: '#Love', label: '#Love', icon: '❤️' },
  { tag: '#Chill', label: '#Chill', icon: '☕' },
  { tag: '#Poetry', label: '#Poetry', icon: '📚' },
  { tag: '#Sports', label: '#Sports', icon: '⚽' },
  { tag: '#Foodie', label: '#Foodie', icon: '🍜' },
  { tag: '#Tech', label: '#Tech', icon: '💻' },
];

export const ConnectRoomsView: React.FC<ConnectRoomsViewProps> = ({
  onNavigateTab,
  onOpenReportModal,
  onSelectProfile,
}) => {
  const { currentUser } = useAuth();
  const { setActiveConversationId, conversations, profiles } = useSocial();
  const { startCall } = useCall();
  const { isHighContrast } = useAccessibility();

  // Selected topic and wallet
  const [selectedTopic, setSelectedTopic] = useState<string>('Love');
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateRoomAlert, setShowCreateRoomAlert] = useState(false);

  // Filter controls state
  const [statusFilter, setStatusFilter] = useState<'all' | 'online' | 'busy' | 'offline'>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [showFiltersPanel, setShowFiltersPanel] = useState<boolean>(false);

  // New sorting state for rooms: 'most_active' | 'newest' | 'language'
  const [roomSortBy, setRoomSortBy] = useState<'most_active' | 'newest' | 'language'>('most_active');

  // Interest tags filter state: 'all' | '#Gaming' | '#Movies' | '#Chatting', etc.
  const [selectedInterestTag, setSelectedInterestTag] = useState<string>('all');

  // Expanded room snippet state: map of roomId -> boolean
  const [expandedRoomIds, setExpandedRoomIds] = useState<Record<string, boolean>>({});

  const toggleRoomExpand = (roomId: string) => {
    setExpandedRoomIds((prev) => ({
      ...prev,
      [roomId]: !prev[roomId],
    }));
  };

  // Quick Match floating action state
  const [isQuickMatching, setIsQuickMatching] = useState(false);
  const [matchedUser, setMatchedUser] = useState<UserProfile | null>(null);

  // Combined roster
  const allProfiles = useMemo(() => {
    const map = new Map<string, UserProfile>();
    INITIAL_DISCOVER_PROFILES.forEach((p) => map.set(p.id, p));
    (profiles || []).forEach((p) => map.set(p.id, p));
    return Array.from(map.values());
  }, [profiles]);

  // Featured constellation profiles
  const ruhi = allProfiles.find((p) => p.id === 'usr_ruhi_201') || allProfiles[0];
  const ananya = allProfiles.find((p) => p.id === 'usr_ananya_202') || allProfiles[1];
  const rakhi = allProfiles.find((p) => p.id === 'usr_rakhi_102') || allProfiles[2];
  const milkee = allProfiles.find((p) => p.id === 'usr_milkee_203') || allProfiles[3];

  // Dynamic curated live rooms data
  const initialRooms: ConnectRoomItem[] = useMemo(() => [
    {
      id: 'room_gaming_esports',
      title: 'BGMI & Valorant Squad Lounge',
      description: 'Discussing competitive esports, gaming setups, and evening custom scrims!',
      host: milkee,
      speakers: [milkee, allProfiles.find((p) => p.id === 'usr_marcus_003') || allProfiles[4]],
      listenerCount: 342,
      tags: ['#Gaming', '#Chatting', '#Tech'],
      language: 'English',
      languageScript: 'EN',
      createdAt: '2026-10-15T07:45:00Z',
      createdTimeAgo: '15m ago',
      isLive: true,
      activeTopic: 'Games',
      conversationSnippet: [
        {
          speakerName: milkee.displayName,
          avatarUrl: milkee.avatarUrl,
          text: 'What camera sensitivity and gyro multipliers are you running for tournament scrims?',
          timeAgo: '1m ago',
          isHost: true,
        },
        {
          speakerName: (allProfiles.find((p) => p.id === 'usr_marcus_003') || allProfiles[4]).displayName,
          avatarUrl: (allProfiles.find((p) => p.id === 'usr_marcus_003') || allProfiles[4]).avatarUrl,
          text: 'I dialed down ADS sensitivity to 82% with always-on gyro; horizontal recoil is remarkably steady now.',
          timeAgo: 'Just now',
        },
      ],
    },
    {
      id: 'room_friday_cinema',
      title: 'Friday Movie Buffs & OTT Binge Club',
      description: 'Debating movie plot twists, upcoming OTT releases, and classic cinema recs.',
      host: rakhi,
      speakers: [rakhi, ruhi],
      listenerCount: 285,
      tags: ['#Movies', '#Chatting', '#Chill'],
      language: 'Hindi',
      languageScript: 'हिंदी',
      createdAt: '2026-10-15T07:55:00Z',
      createdTimeAgo: '5m ago',
      isLive: true,
      activeTopic: 'Movies',
      conversationSnippet: [
        {
          speakerName: rakhi.displayName,
          avatarUrl: rakhi.avatarUrl,
          text: 'That interval twist in the psychological thriller caught everyone in the theater completely off guard!',
          timeAgo: '2m ago',
          isHost: true,
        },
        {
          speakerName: ruhi.displayName,
          avatarUrl: ruhi.avatarUrl,
          text: 'Totally agree! And the ambient cello score right before the revelation gave me literal chills.',
          timeAgo: 'Just now',
        },
      ],
    },
    {
      id: 'room_open_chit_chat',
      title: 'Casual Chit-Chat & Midnight Banter',
      description: 'Open mic for sharing day stories, witty banter, and making genuine friendships.',
      host: allProfiles.find((p) => p.id === 'usr_kristin_watson') || allProfiles[0],
      speakers: [
        allProfiles.find((p) => p.id === 'usr_kristin_watson') || allProfiles[0],
        allProfiles.find((p) => p.id === 'usr_clara_002') || allProfiles[1],
      ],
      listenerCount: 420,
      tags: ['#Chatting', '#Chill', '#Love'],
      language: 'English',
      languageScript: 'EN',
      createdAt: '2026-10-15T07:15:00Z',
      createdTimeAgo: '45m ago',
      isLive: true,
      activeTopic: 'Usual',
      conversationSnippet: [
        {
          speakerName: (allProfiles.find((p) => p.id === 'usr_kristin_watson') || allProfiles[0]).displayName,
          avatarUrl: (allProfiles.find((p) => p.id === 'usr_kristin_watson') || allProfiles[0]).avatarUrl,
          text: 'Anyone else love brewing freshly ground filter coffee while listening to the late rain?',
          timeAgo: '3m ago',
          isHost: true,
        },
        {
          speakerName: (allProfiles.find((p) => p.id === 'usr_clara_002') || allProfiles[1]).displayName,
          avatarUrl: (allProfiles.find((p) => p.id === 'usr_clara_002') || allProfiles[1]).avatarUrl,
          text: 'Yes! Pairing that with quiet lo-fi jazz is honestly my favorite ritual after a long work week.',
          timeAgo: 'Just now',
        },
      ],
    },
    {
      id: 'room_tamil_music_jam',
      title: 'Indie Beats & Tamil Lo-Fi Jam',
      description: 'Jamming acoustic melodies, regional indie songs, and peaceful background vibes.',
      host: allProfiles.find((p) => p.id === 'usr_sushmitha_301') || allProfiles[0],
      speakers: [
        allProfiles.find((p) => p.id === 'usr_sushmitha_301') || allProfiles[0],
        allProfiles.find((p) => p.id === 'usr_marcus_003') || allProfiles[4],
      ],
      listenerCount: 198,
      tags: ['#Music', '#Chill'],
      language: 'Tamil',
      languageScript: 'தமிழ்',
      createdAt: '2026-10-15T07:58:00Z',
      createdTimeAgo: '2m ago',
      isLive: true,
      activeTopic: 'Music',
      conversationSnippet: [
        {
          speakerName: (allProfiles.find((p) => p.id === 'usr_sushmitha_301') || allProfiles[0]).displayName,
          avatarUrl: (allProfiles.find((p) => p.id === 'usr_sushmitha_301') || allProfiles[0]).avatarUrl,
          text: 'Let us tune acoustic chords in D-major for this unplugged melody cover next.',
          timeAgo: '1m ago',
          isHost: true,
        },
        {
          speakerName: (allProfiles.find((p) => p.id === 'usr_marcus_003') || allProfiles[4]).displayName,
          avatarUrl: (allProfiles.find((p) => p.id === 'usr_marcus_003') || allProfiles[4]).avatarUrl,
          text: 'Rhythm section is locked in, whenever you are ready to begin the vocal harmony!',
          timeAgo: 'Just now',
        },
      ],
    },
    {
      id: 'room_poetry_chai',
      title: 'Midnight Poetry & Deep Reflections',
      description: 'Reading favorite couplets, literary thoughts, and quiet storytelling over chai.',
      host: ananya,
      speakers: [ananya, rakhi],
      listenerCount: 156,
      tags: ['#Poetry', '#Chatting', '#Chill'],
      language: 'Hindi',
      languageScript: 'हिंदी',
      createdAt: '2026-10-15T06:30:00Z',
      createdTimeAgo: '1h ago',
      isLive: true,
      activeTopic: 'Married',
      conversationSnippet: [
        {
          speakerName: ananya.displayName,
          avatarUrl: ananya.avatarUrl,
          text: 'Ye daulat bhi le lo, ye shohrat bhi le lo... bhale chheen lo mujhse meri jawani...',
          timeAgo: '4m ago',
          isHost: true,
        },
        {
          speakerName: rakhi.displayName,
          avatarUrl: rakhi.avatarUrl,
          text: 'Magar mujhko lauta do bachpan ka sawan! Such deeply touching couplets tonight.',
          timeAgo: 'Just now',
        },
      ],
    },
    {
      id: 'room_foodies_wanderlust',
      title: 'Street Food Crawl & Road Trips',
      description: 'Sharing hidden food joints from Mumbai, Delhi, Paris, and weekend travel spots.',
      host: ruhi,
      speakers: [ruhi, allProfiles.find((p) => p.id === 'usr_kristin_watson') || allProfiles[0]],
      listenerCount: 220,
      tags: ['#Foodie', '#Chatting'],
      language: 'Bengali',
      languageScript: 'বাংলা',
      createdAt: '2026-10-15T07:30:00Z',
      createdTimeAgo: '30m ago',
      isLive: true,
      activeTopic: 'Foodie',
      conversationSnippet: [
        {
          speakerName: ruhi.displayName,
          avatarUrl: ruhi.avatarUrl,
          text: 'If you are near Fort in South Mumbai, you have to try the warm bun maska and irani chai.',
          timeAgo: '2m ago',
          isHost: true,
        },
        {
          speakerName: (allProfiles.find((p) => p.id === 'usr_kristin_watson') || allProfiles[0]).displayName,
          avatarUrl: (allProfiles.find((p) => p.id === 'usr_kristin_watson') || allProfiles[0]).avatarUrl,
          text: 'Adding that to my weekend food trail immediately! The fresh bakery aroma alone is worth the trip.',
          timeAgo: 'Just now',
        },
      ],
    },
    {
      id: 'room_premier_league_box',
      title: 'Football Strategy & Cricket Box',
      description: 'Weekend match predictions, tactical debates, and energetic fan banter.',
      host: allProfiles.find((p) => p.id === 'usr_marcus_003') || allProfiles[4],
      speakers: [allProfiles.find((p) => p.id === 'usr_marcus_003') || allProfiles[4], milkee],
      listenerCount: 175,
      tags: ['#Sports', '#Gaming', '#Chatting'],
      language: 'English',
      languageScript: 'EN',
      createdAt: '2026-10-15T08:00:00Z',
      createdTimeAgo: 'Just now',
      isLive: true,
      activeTopic: 'Sports',
      conversationSnippet: [
        {
          speakerName: (allProfiles.find((p) => p.id === 'usr_marcus_003') || allProfiles[4]).displayName,
          avatarUrl: (allProfiles.find((p) => p.id === 'usr_marcus_003') || allProfiles[4]).avatarUrl,
          text: 'Playing that ultra-high defensive line against rapid wingers cost two easy counter-attack goals.',
          timeAgo: '1m ago',
          isHost: true,
        },
        {
          speakerName: milkee.displayName,
          avatarUrl: milkee.avatarUrl,
          text: 'Spot on! They desperately needed a double-pivot defensive anchor to absorb transitional pace.',
          timeAgo: 'Just now',
        },
      ],
    },
  ], [allProfiles, milkee, rakhi, ruhi, ananya]);

  // Filtered and Sorted Rooms
  const processedRooms = useMemo(() => {
    let list = [...initialRooms];

    // Filter by interest tag
    if (selectedInterestTag !== 'all') {
      list = list.filter((r) =>
        r.tags.some((t) => t.toLowerCase() === selectedInterestTag.toLowerCase())
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.language.toLowerCase().includes(q) ||
          r.tags.some((t) => t.toLowerCase().includes(q)) ||
          r.host.displayName.toLowerCase().includes(q)
      );
    }

    // Sort rooms by selected order
    if (roomSortBy === 'most_active') {
      list.sort((a, b) => b.listenerCount - a.listenerCount);
    } else if (roomSortBy === 'newest') {
      list.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } else if (roomSortBy === 'language') {
      list.sort((a, b) => a.language.localeCompare(b.language));
    }

    return list;
  }, [initialRooms, selectedInterestTag, searchQuery, roomSortBy]);

  // Dynamic filtered profiles for search
  const filteredProfiles = useMemo(() => {
    return allProfiles.filter((user) => {
      const effectiveStatus = getEffectiveStatus(user);
      if (statusFilter !== 'all' && effectiveStatus !== statusFilter) {
        return false;
      }
      if (selectedLocation !== 'all') {
        const loc = selectedLocation.toLowerCase();
        const matchesLoc =
          user.broadLocation?.toLowerCase().includes(loc) ||
          user.country?.toLowerCase().includes(loc);
        if (!matchesLoc) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName =
          user.displayName?.toLowerCase().includes(q) ||
          user.firstName?.toLowerCase().includes(q);
        const matchLoc =
          user.broadLocation?.toLowerCase().includes(q) ||
          user.country?.toLowerCase().includes(q);
        const matchInt = user.interests?.some((i) => i.toLowerCase().includes(q));
        const matchTop = user.activeTopic?.toLowerCase().includes(q);
        if (!matchName && !matchLoc && !matchInt && !matchTop) return false;
      }
      return true;
    });
  }, [allProfiles, statusFilter, selectedLocation, searchQuery]);

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
    searchQuery.trim() || statusFilter !== 'all' || selectedLocation !== 'all'
  );

  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setSelectedLocation('all');
    setSelectedInterestTag('all');
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
    } else {
      if (user.id === 'usr_kristin_watson') {
        setActiveConversationId('conv_kristin');
      } else if (user.id === 'usr_ruhi_201') {
        setActiveConversationId('conv_resilient');
      } else if (user.id === 'usr_ananya_202') {
        setActiveConversationId('conv_thaaraa');
      } else if (user.id === 'usr_rakhi_102') {
        setActiveConversationId('conv_jamuna');
      } else if (user.id === 'usr_milkee_203') {
        setActiveConversationId('conv_iniya');
      } else {
        setActiveConversationId('conv_clara');
      }
    }
    onNavigateTab('messages');
  };

  // Quick Match feature handler
  const handleQuickMatch = () => {
    setIsQuickMatching(true);
    setMatchedUser(null);

    // Prioritize active, online users (excluding current user)
    const onlineCandidates = allProfiles.filter(
      (p) => p.id !== currentUser?.id && getEffectiveStatus(p) === 'online'
    );
    const pool = onlineCandidates.length > 0
      ? onlineCandidates
      : allProfiles.filter((p) => p.id !== currentUser?.id);

    const chosen = pool[Math.floor(Math.random() * pool.length)] || INITIAL_DISCOVER_PROFILES[0];

    // Simulate instant matching calculation
    setTimeout(() => {
      setMatchedUser(chosen);
    }, 900);
  };

  const handleConfirmQuickMatchChat = (targetUser: UserProfile) => {
    setIsQuickMatching(false);
    setMatchedUser(null);
    handleDirectChat(targetUser);
  };

  return (
    <div
      className={`relative min-h-[calc(100vh-4.5rem)] pb-28 font-sans transition-colors ${
        isHighContrast ? 'bg-black text-white' : 'bg-[#F5F7FC] text-[#303641]'
      }`}
    >
      <div className="max-w-2xl mx-auto px-3 sm:px-6 py-3 sm:py-4 space-y-4">
        
        {/* =========================================================================
            1. TOP BAR (Avatar + Coins + Search + Create Room Button)
            ========================================================================= */}
        <div
          className={`p-3 rounded-xl border flex items-center justify-between gap-2 shadow-xs ${
            isHighContrast ? 'bg-black border-white' : 'bg-white border-[#E1E5EC]'
          }`}
        >
          {/* Avatar with status indicator */}
          <div
            onClick={() => onNavigateTab('profile')}
            className="flex items-center gap-2 cursor-pointer group"
            title="View Profile"
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#1877F2] p-0.5 bg-white">
                <img
                  src={currentUser?.avatarUrl}
                  alt={currentUser?.displayName}
                  className="w-full h-full object-cover rounded-full"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#16865C] ring-2 ring-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#303641] group-hover:text-[#1877F2] transition-colors leading-tight">
                {currentUser?.displayName || 'Discover'}
              </h2>
              <p className="text-[11px] text-[#7B8492]">Discover & Connect</p>
            </div>
          </div>

          {/* Coin Balance Pill */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsWalletOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E1E5EC] bg-[#F5F7FC] hover:bg-[#EAF2FF] text-xs font-semibold text-[#303641] transition-colors"
              title="Coin Balance"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#F28C28]" />
              <span>{currentUser?.coins ?? 80}</span>
            </button>

            {/* Search & Filter Trigger */}
            <button
              onClick={() => {
                setShowFiltersPanel(!showFiltersPanel);
                setIsSearchOpen(true);
              }}
              className={`p-2 rounded-lg border transition-colors ${
                hasActiveFilters
                  ? 'bg-[#EAF2FF] border-[#1877F2]/40 text-[#1877F2]'
                  : 'bg-white border-[#E1E5EC] text-[#7B8492] hover:bg-[#F5F7FC] hover:text-[#303641]'
              }`}
              title="Search & Filters"
              aria-label="Search and Filters"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>

            {/* Create Room Button */}
            <button
              onClick={() => setShowCreateRoomAlert(true)}
              className="px-3 py-2 rounded-lg bg-[#1877F2] hover:bg-[#166fe5] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
              title="Create Room"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Create Room</span>
            </button>
          </div>
        </div>

        {/* =========================================================================
            2. SEARCH & ADVANCED FILTER CONTROLS (EXPANDABLE)
            ========================================================================= */}
        <div className="space-y-2">
          {/* Search Field */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7B8492]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, topic, or interest (e.g. #Gaming, Mumbai)..."
              className="w-full h-10 pl-10 pr-9 text-xs sm:text-sm rounded-lg border border-[#E1E5EC] bg-white text-[#303641] placeholder-[#7B8492] focus:border-[#1877F2] focus:outline-none shadow-xs transition-all"
              aria-label="Search rooms and members"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7B8492] hover:text-[#303641]"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter options panel */}
          {showFiltersPanel && (
            <div
              className={`p-3.5 rounded-xl border space-y-3 shadow-xs animate-in fade-in ${
                isHighContrast ? 'bg-black border-white' : 'bg-white border-[#E1E5EC]'
              }`}
            >
              {/* Online Status Pills */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold text-[#7B8492]">
                  <span>Member Availability:</span>
                  <span className="text-[#16865C]">🟢 {onlineCount} Online</span>
                </div>
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                  {[
                    { id: 'all', label: `All (${allProfiles.length})` },
                    { id: 'online', label: `Online (${onlineCount})`, color: 'bg-[#16865C]' },
                    { id: 'busy', label: `Busy (${busyCount})`, color: 'bg-[#F28C28]' },
                    { id: 'offline', label: `Offline (${offlineCount})`, color: 'bg-slate-400' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setStatusFilter(s.id as typeof statusFilter)}
                      className={`px-3 py-1 rounded-full text-xs font-medium shrink-0 transition-colors flex items-center gap-1.5 ${
                        statusFilter === s.id
                          ? 'bg-[#EAF2FF] text-[#1877F2] border border-[#1877F2]/40 font-semibold'
                          : 'bg-white text-[#7B8492] border border-[#E1E5EC] hover:bg-[#F5F7FC]'
                      }`}
                    >
                      {s.color && <span className={`w-1.5 h-1.5 rounded-full ${s.color}`} />}
                      <span>{s.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Location Selector */}
              <div className="space-y-1.5">
                <div className="text-xs font-semibold text-[#7B8492]">Location Filter:</div>
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                  {POPULAR_LOCATIONS.map((loc) => (
                    <button
                      key={loc.tag}
                      onClick={() => setSelectedLocation(loc.tag)}
                      className={`px-3 py-1 rounded-full text-xs font-medium shrink-0 transition-colors ${
                        selectedLocation.toLowerCase() === loc.tag.toLowerCase()
                          ? 'bg-[#EAF2FF] text-[#1877F2] border border-[#1877F2]/40 font-semibold'
                          : 'bg-white text-[#7B8492] border border-[#E1E5EC] hover:bg-[#F5F7FC]'
                      }`}
                    >
                      {loc.label}
                    </button>
                  ))}
                </div>
              </div>

              {hasActiveFilters && (
                <div className="pt-2 flex items-center justify-between border-t border-[#E1E5EC] text-xs">
                  <span className="text-[#1877F2] font-semibold">
                    Found {filteredProfiles.length} active matching members
                  </span>
                  <button
                    onClick={handleResetFilters}
                    className="text-xs text-[#D9485F] hover:underline font-semibold"
                  >
                    Reset Filters
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* =========================================================================
            3. FEATURED ACTIVE CONSTELLATION LOUNGE (Ruhi, Ananya, Rakhi, Milkee)
            ========================================================================= */}
        <div
          className={`p-3.5 sm:p-4 rounded-xl border space-y-3 shadow-xs ${
            isHighContrast ? 'bg-black border-white' : 'bg-white border-[#E1E5EC]'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#1877F2]" />
              <h3 className="text-sm font-bold text-[#303641]">Active People Spotlight</h3>
            </div>
            <span className="text-xs text-[#16865C] font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#16865C] animate-pulse" />
              <span>Available Now</span>
            </span>
          </div>

          {/* 4 Spotlight Avatars Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[ruhi, ananya, rakhi, milkee]
              .filter((m, i, arr) => m && arr.findIndex((x) => x?.id === m?.id) === i)
              .map((member, idx) => {
                const status = getEffectiveStatus(member);
                return (
                  <div
                    key={`spotlight-${member.id}-${idx}`}
                  className="p-3 rounded-lg border border-[#E1E5EC] bg-[#F5F7FC] hover:border-[#1877F2]/40 text-center space-y-2 transition-all group"
                >
                  <div
                    onClick={() => onSelectProfile && onSelectProfile(member)}
                    className="relative w-14 h-14 mx-auto rounded-full overflow-hidden border-2 border-white shadow-xs cursor-pointer"
                  >
                    <img
                      src={member.avatarUrl}
                      alt={member.displayName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <span
                      className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${
                        status === 'online' ? 'bg-[#16865C]' : 'bg-[#F28C28]'
                      }`}
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-center gap-1">
                      <h4
                        onClick={() => onSelectProfile && onSelectProfile(member)}
                        className="text-xs font-bold text-[#303641] hover:text-[#1877F2] truncate cursor-pointer"
                      >
                        {member.displayName}
                      </h4>
                      {member.isVerified && <VerifiedBadge size="xs" />}
                    </div>
                    <p className="text-[10px] text-[#7B8492] truncate">{member.broadLocation}</p>
                    {member.activeTopic && (
                      <span className="inline-block mt-1 px-1.5 py-0.2 rounded bg-[#EAF2FF] text-[#1877F2] text-[10px] font-semibold">
                        #{member.activeTopic}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-center gap-1.5 pt-1">
                    <button
                      onClick={() => handleStartAudioCall(member, member.activeTopic)}
                      className="p-1.5 rounded-md bg-white border border-[#E1E5EC] hover:bg-[#EAF2FF] text-[#1877F2] hover:border-[#1877F2]/40 transition-colors"
                      title="Audio Call"
                      aria-label="Audio Call"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleStartVideoCall(member, member.activeTopic)}
                      className="p-1.5 rounded-md bg-white border border-[#E1E5EC] hover:bg-[#EAF2FF] text-[#1877F2] hover:border-[#1877F2]/40 transition-colors"
                      title="Video Call"
                      aria-label="Video Call"
                    >
                      <Video className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDirectChat(member)}
                      className="p-1.5 rounded-md bg-white border border-[#E1E5EC] hover:bg-[#EAF2FF] text-[#1877F2] hover:border-[#1877F2]/40 transition-colors"
                      title="Direct Chat"
                      aria-label="Direct Chat"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* =========================================================================
            4. CONNECT ROOMS HEADER, SORTING BAR & INTEREST TAGS FILTER
            ========================================================================= */}
        <div className="space-y-3">
          {/* Title & Sorting Control */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-2">
              <Radio className="w-5 h-5 text-[#1877F2] animate-pulse" />
              <div>
                <h2 className="text-base font-bold text-[#303641] tracking-tight">
                  Live Connect Rooms
                </h2>
                <p className="text-xs text-[#7B8492]">
                  Join active voice lounges or explore trending community topics
                </p>
              </div>
            </div>

            {/* Sorting Feature Buttons: 'Most Active' | 'Newest' | 'Language' */}
            <div className="flex items-center gap-1 p-1 rounded-lg border border-[#E1E5EC] bg-white self-start sm:self-auto shadow-xs">
              <span className="text-[11px] font-semibold text-[#7B8492] px-1.5 flex items-center gap-1">
                <ArrowUpDown className="w-3 h-3 text-[#1877F2]" />
                <span className="hidden xs:inline">Sort:</span>
              </span>

              <button
                onClick={() => setRoomSortBy('most_active')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors flex items-center gap-1 ${
                  roomSortBy === 'most_active'
                    ? 'bg-[#EAF2FF] text-[#1877F2] font-bold'
                    : 'text-[#7B8492] hover:text-[#303641] hover:bg-[#F5F7FC]'
                }`}
                title="Sort by Most Active listeners"
              >
                <Flame className="w-3 h-3" />
                <span>Most Active</span>
              </button>

              <button
                onClick={() => setRoomSortBy('newest')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors flex items-center gap-1 ${
                  roomSortBy === 'newest'
                    ? 'bg-[#EAF2FF] text-[#1877F2] font-bold'
                    : 'text-[#7B8492] hover:text-[#303641] hover:bg-[#F5F7FC]'
                }`}
                title="Sort by Newest rooms"
              >
                <Clock className="w-3 h-3" />
                <span>Newest</span>
              </button>

              <button
                onClick={() => setRoomSortBy('language')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors flex items-center gap-1 ${
                  roomSortBy === 'language'
                    ? 'bg-[#EAF2FF] text-[#1877F2] font-bold'
                    : 'text-[#7B8492] hover:text-[#303641] hover:bg-[#F5F7FC]'
                }`}
                title="Sort alphabetically by Language"
              >
                <Globe2 className="w-3 h-3" />
                <span>Language</span>
              </button>
            </div>
          </div>

          {/* Interest Tags Filter Strip: e.g. #Gaming, #Movies, #Chatting, #Music */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold text-[#7B8492]">
              <span className="flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-[#1877F2]" />
                <span>Filter by Interest Tag:</span>
              </span>
              {selectedInterestTag !== 'all' && (
                <button
                  onClick={() => setSelectedInterestTag('all')}
                  className="text-[11px] text-[#1877F2] hover:underline font-semibold"
                >
                  Show all tags
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              {INTEREST_TAG_OPTIONS.map((item) => {
                const isSelected = selectedInterestTag.toLowerCase() === item.tag.toLowerCase();
                return (
                  <button
                    key={item.tag}
                    onClick={() => setSelectedInterestTag(item.tag)}
                    className={`px-3 py-1 rounded-full text-xs shrink-0 transition-colors flex items-center gap-1 cursor-pointer ${
                      isSelected
                        ? 'bg-[#EAF2FF] text-[#1877F2] border border-[#1877F2]/40 font-semibold shadow-xs'
                        : 'bg-white text-[#7B8492] border border-[#E1E5EC] hover:bg-[#F5F7FC] hover:text-[#303641]'
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* =========================================================================
              5. LIVE CONNECT ROOM CARDS GRID
              ========================================================================= */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 pt-1">
            {processedRooms.length === 0 ? (
              <div
                className={`col-span-full p-8 rounded-2xl border text-center space-y-2 shadow-xs ${
                  isHighContrast ? "bg-black border-white" : "bg-white border-[#E1E5EC]"
                }`}
              >
                <Tag className="w-8 h-8 text-[#7B8492] mx-auto opacity-50" />
                <h4 className="text-sm font-bold text-[#303641]">No rooms match this interest tag</h4>
                <p className="text-xs text-[#7B8492]">
                  Try selecting "All Topics" or searching for a different conversation tag.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-1.5 rounded-lg bg-[#1877F2] text-white text-xs font-semibold hover:bg-[#166fe5] shadow-xs cursor-pointer"
                >
                  View All Rooms
                </button>
              </div>
            ) : (
              processedRooms.map((room, rIdx) => {
                const themes = [
                  {
                    pastelBg: "bg-gradient-to-b from-[#E0F7FA] via-[#E8F8FE] to-[#EAF6FB]",
                    ringStyle: "bg-gradient-to-tr from-amber-200 via-rose-100 to-amber-300 ring-2 ring-amber-300/80 shadow-md",
                    ringBadge: "PEARL",
                    hasStar: false,
                  },
                  {
                    pastelBg: "bg-gradient-to-b from-[#F3E8FF] via-[#F8F2FF] to-[#FAF5FF]",
                    ringStyle: "bg-gradient-to-tr from-slate-500 via-slate-300 to-slate-600 ring-2 ring-slate-300 shadow-md",
                    ringBadge: null,
                    hasStar: true,
                  },
                  {
                    pastelBg: "bg-gradient-to-b from-[#EDE9FE] via-[#F4F1FE] to-[#F5F3FF]",
                    ringStyle: "bg-gradient-to-tr from-amber-400 via-yellow-300 to-orange-400 ring-2 ring-amber-400 shadow-lg shadow-amber-400/25",
                    ringBadge: null,
                    hasStar: true,
                  },
                  {
                    pastelBg: "bg-gradient-to-b from-[#FCE7F3] via-[#FDF2F8] to-[#FFF1F2]",
                    ringStyle: "bg-gradient-to-tr from-rose-300 via-slate-200 to-rose-400 ring-2 ring-rose-200 shadow-md",
                    ringBadge: null,
                    hasStar: true,
                  },
                  {
                    pastelBg: "bg-gradient-to-b from-[#FEF3C7] via-[#FFFBEB] to-[#FEF9C3]",
                    ringStyle: "bg-gradient-to-tr from-amber-300 via-yellow-200 to-amber-400 ring-2 ring-amber-300 shadow-md",
                    ringBadge: "GOLD",
                    hasStar: false,
                  },
                ];
                const theme = themes[rIdx % themes.length];
                const nativeScript =
                  room.languageScript ||
                  (room.language?.toLowerCase().includes("tamil")
                    ? "தமிழ்"
                    : room.language?.toLowerCase().includes("hindi")
                    ? "हिंदी"
                    : room.language?.toLowerCase().includes("telugu")
                    ? "తెలుగు"
                    : room.language?.toLowerCase().includes("bengali")
                    ? "বাংলা"
                    : room.language || "EN");

                return (
                  <div
                    key={room.id}
                    className={`relative rounded-[26px] border border-[#E1E5EC] bg-white overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group ${
                      isHighContrast ? "bg-black border-white" : ""
                    }`}
                  >
                    {/* Top Pastel Header Area */}
                    <div className={`h-24 sm:h-28 w-full ${theme.pastelBg} relative p-3 flex items-start justify-between`}>
                      {/* Top Left: LIVE status badge */}
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-xs text-[#16865C] border border-emerald-200 text-[10.5px] font-bold shadow-2xs">
                        <span className="w-2 h-2 rounded-full bg-[#16865C] animate-pulse" />
                        <span>LIVE</span>
                      </span>

                      {/* Top Right: Listener count badge */}
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-xs text-[#303641] border border-[#E1E5EC] text-[11px] font-semibold shadow-2xs">
                        <Users className="w-3.5 h-3.5 text-[#1877F2]" />
                        <span>{room.listenerCount}</span>
                      </span>
                    </div>

                    {/* Centered Circular Avatar with Decorative Ring Frame & Badges */}
                    <div className="-mt-13 sm:-mt-14 flex flex-col items-center relative z-10 px-3">
                      <div
                        onClick={() => onSelectProfile && onSelectProfile(room.host)}
                        className={`relative w-20 h-20 sm:w-22 sm:h-22 rounded-full p-1 cursor-pointer transition-transform group-hover:scale-105 ${theme.ringStyle}`}
                        title={`Host: ${room.host.displayName}`}
                      >
                        {/* Top sparkle star if present */}
                        {theme.hasStar && (
                          <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 text-white drop-shadow text-xs">
                            ✦
                          </span>
                        )}

                        {/* Side badge text (e.g. "PEARL") */}
                        {theme.ringBadge && (
                          <span className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 px-1 py-0.2 rounded-full bg-amber-100 border border-amber-300 text-[8px] font-black text-amber-900 tracking-tighter uppercase shadow-2xs rotate-90">
                            {theme.ringBadge}
                          </span>
                        )}

                        {/* Avatar Image */}
                        <div className="w-full h-full rounded-full overflow-hidden bg-slate-100 border-2 border-white shadow-inner">
                          <img
                            src={room.host.avatarUrl}
                            alt={room.host.displayName}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Online Green Status Indicator Dot at top-right */}
                        <span
                          className="absolute top-0 right-0 w-4.5 h-4.5 rounded-full bg-[#16865C] border-2 border-white shadow-xs"
                          title="Online now"
                        />

                        {/* Native Language Pill Badge centered at bottom of avatar */}
                        <span className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-white border border-[#E1E5EC] text-xs font-bold text-[#303641] shadow-xs flex items-center gap-1 whitespace-nowrap">
                          <span>{nativeScript}</span>
                        </span>
                      </div>
                    </div>

                    {/* Card Body (White area below avatar) */}
                    <div className="px-4 pt-4 pb-4 sm:pb-5 text-center flex-1 flex flex-col justify-between space-y-3">
                      {/* Identity & Room Title */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-center gap-1.5">
                          <h4
                            onClick={() => onSelectProfile && onSelectProfile(room.host)}
                            className="text-base sm:text-lg font-black text-[#303641] hover:text-[#1877F2] transition-colors truncate cursor-pointer tracking-tight"
                          >
                            {room.host.displayName}
                          </h4>
                          {room.host.isVerified && <VerifiedBadge size="sm" />}
                        </div>

                        <p className="text-xs font-medium text-[#7B8492] line-clamp-1" title={room.title}>
                          {room.title}
                        </p>

                        {/* Topic Tags */}
                        <div className="flex items-center justify-center gap-1.5 flex-wrap pt-0.5">
                          {room.tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-[#EAF2FF] text-[#1877F2] border border-[#1877F2]/20"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Bottom Action: Signature Vibrant Cyan "Join Call" Pill Button from Screenshots */}
                      <button
                        onClick={() => handleStartAudioCall(room.host, room.tags[0])}
                        className="w-full py-2.5 sm:py-3 px-4 rounded-full bg-[#00AEEF] hover:bg-[#009cdb] active:scale-[0.98] text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-xs hover:shadow-md transition-all cursor-pointer"
                        title={`Join Call with ${room.host.displayName}`}
                      >
                        <Phone className="w-4.5 h-4.5 fill-white text-white rotate-[-25deg]" />
                        <span>Join Call</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* =========================================================================
          6. 'QUICK MATCH' FLOATING ACTION BUTTON (BOTTOM RIGHT OF DISCOVER TAB)
          ========================================================================= */}
      <div className="fixed bottom-20 md:bottom-8 right-4 sm:right-6 z-40">
        <button
          onClick={handleQuickMatch}
          className="group flex items-center gap-2.5 px-4 sm:px-5 py-3 rounded-full bg-[#1877F2] hover:bg-[#166fe5] text-white font-semibold text-xs sm:text-sm shadow-xl shadow-[#1877F2]/30 active:scale-95 transition-all cursor-pointer"
          title="Quick Match with an active user"
          aria-label="Quick Match with an active user"
        >
          <div className="relative flex items-center justify-center">
            <Shuffle className="w-4 h-4 text-white group-hover:rotate-180 transition-transform duration-500" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#16865C] ring-2 ring-white animate-ping" />
          </div>
          <span>Quick Match</span>
        </button>
      </div>

      {/* =========================================================================
          7. QUICK MATCH MODAL (INTERACTIVE RADAR & MATCHED USER CONFIRMATION)
          ========================================================================= */}
      {isQuickMatching && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-xl bg-white border border-[#E1E5EC] p-5 space-y-4 shadow-2xl text-center animate-in zoom-in-95">
            {!matchedUser ? (
              /* Loading / Matching Radar Animation */
              <div className="py-6 space-y-4">
                <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-2 border-[#1877F2] opacity-75 animate-ping" />
                  <div className="absolute inset-2 rounded-full bg-[#EAF2FF] border border-[#1877F2]/30 flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-[#1877F2] animate-spin" />
                  </div>
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-[#303641]">Quick Match in Progress</h3>
                  <p className="text-xs text-[#7B8492]">
                    Searching for online members who share your active vibes and interests...
                  </p>
                </div>
                <button
                  onClick={() => setIsQuickMatching(false)}
                  className="text-xs text-[#7B8492] hover:text-[#303641] font-semibold"
                >
                  Cancel
                </button>
              </div>
            ) : (
              /* Matched User Spotlight */
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-[#E1E5EC]">
                  <span className="text-xs font-bold text-[#1877F2] flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-[#1877F2]" />
                    <span>Match Found!</span>
                  </span>
                  <button
                    onClick={() => {
                      setIsQuickMatching(false);
                      setMatchedUser(null);
                    }}
                    className="p-1 text-[#7B8492] hover:text-[#303641]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Matched User Card */}
                <div className="space-y-3">
                  <div className="relative w-20 h-20 mx-auto rounded-full overflow-hidden border-2 border-[#1877F2] p-0.5 shadow-md">
                    <img
                      src={matchedUser.avatarUrl}
                      alt={matchedUser.displayName}
                      className="w-full h-full object-cover rounded-full"
                    />
                    <span className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full bg-[#16865C] ring-2 ring-white" />
                  </div>

                  <div>
                    <div className="flex items-center justify-center gap-1.5">
                      <h4 className="text-base font-bold text-[#303641]">
                        {matchedUser.displayName}
                      </h4>
                      <CheckCircle2 className="w-4 h-4 text-[#1877F2]" />
                    </div>
                    <p className="text-xs text-[#7B8492]">{matchedUser.broadLocation}</p>
                    <p className="text-xs text-[#303641] mt-1.5 line-clamp-2 px-2">
                      "{matchedUser.bio || 'Excited to chat and connect on VibeTalk!'}"
                    </p>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap items-center justify-center gap-1">
                    {(matchedUser.interests || ['#Chatting', '#Music']).slice(0, 3).map((t) => (
                      <span
                        key={t}
                        className="px-2 py-0.5 rounded-full bg-[#EAF2FF] text-[#1877F2] text-[10px] font-semibold"
                      >
                        {t.startsWith('#') ? t : `#${t}`}
                      </span>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="space-y-2 pt-2">
                    <button
                      onClick={() => handleConfirmQuickMatchChat(matchedUser)}
                      className="w-full h-10 rounded-lg bg-[#1877F2] hover:bg-[#166fe5] text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Start Private Chat Now</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setIsQuickMatching(false);
                          handleStartAudioCall(matchedUser);
                        }}
                        className="flex-1 h-9 rounded-lg border border-[#E1E5EC] bg-white hover:bg-[#EAF2FF] text-[#1877F2] hover:border-[#1877F2]/40 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                        <span>Voice Call</span>
                      </button>

                      <button
                        onClick={handleQuickMatch}
                        className="flex-1 h-9 rounded-lg border border-[#E1E5EC] bg-white hover:bg-[#F5F7FC] text-[#7B8492] hover:text-[#303641] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Shuffle className="w-3.5 h-3.5" />
                        <span>Match Another</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Coin Wallet Modal */}
      <CoinWalletModal
        isOpen={isWalletOpen}
        onClose={() => setIsWalletOpen(false)}
        onClaimDailyCoins={() => {}}
        isClaimed={true}
      />

      {/* Create Room Alert Modal */}
      {showCreateRoomAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white border border-[#E1E5EC] p-5 space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-[#1877F2]" />
                <h3 className="font-bold text-sm text-[#303641]">Create Live Room</h3>
              </div>
              <button
                onClick={() => setShowCreateRoomAlert(false)}
                className="text-[#7B8492] hover:text-[#303641]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-[#7B8492] leading-relaxed">
              Live Room hosting is available for verified adult members. Choose your topic tags (e.g. #Gaming, #Movies, #Music) and host audio discussions with up to 500 listeners.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowCreateRoomAlert(false)}
                className="px-3 py-1.5 rounded-lg border border-[#E1E5EC] text-xs font-semibold text-[#7B8492] hover:bg-[#F5F7FC]"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowCreateRoomAlert(false);
                  onNavigateTab('profile');
                }}
                className="px-4 py-1.5 rounded-lg bg-[#1877F2] text-white text-xs font-semibold hover:bg-[#166fe5]"
              >
                Check VIP Status
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
