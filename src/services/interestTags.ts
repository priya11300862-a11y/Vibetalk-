import { UserProfile, ProfileBadge } from '../types';

export interface InterestCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  tags: {
    name: string;
    icon: string;
  }[];
}

export const PRESET_INTEREST_CATEGORIES: InterestCategory[] = [
  {
    id: 'music_arts',
    name: 'Music & Audio',
    icon: '🎵',
    color: 'from-pink-500 to-rose-500',
    tags: [
      { name: 'Indie Rock', icon: '🎸' },
      { name: 'Acoustic', icon: '🪕' },
      { name: 'Electronic Synth', icon: '🎛️' },
      { name: 'Lo-Fi Chill', icon: '🎧' },
      { name: 'Bollywood Beats', icon: '🥁' },
      { name: 'Podcasts', icon: '🎙️' },
      { name: 'Sound Design', icon: '🔊' },
      { name: 'Classical Music', icon: '🎻' },
    ],
  },
  {
    id: 'culture_creativity',
    name: 'Arts & Culture',
    icon: '🎨',
    color: 'from-purple-500 to-indigo-500',
    tags: [
      { name: 'Film Photography', icon: '📷' },
      { name: 'Digital Art', icon: '🖌️' },
      { name: 'Literature', icon: '📚' },
      { name: 'Creative Writing', icon: '✍️' },
      { name: 'Anime', icon: '⛩️' },
      { name: 'Architecture', icon: '🏛️' },
      { name: 'Cinema & Movies', icon: '🎬' },
      { name: 'Poetry', icon: '📜' },
    ],
  },
  {
    id: 'lifestyle_chill',
    name: 'Lifestyle & Chill',
    icon: '☕',
    color: 'from-amber-500 to-orange-500',
    tags: [
      { name: 'Filter Coffee', icon: '☕' },
      { name: 'Matcha', icon: '🍵' },
      { name: 'Late Night Walks', icon: '🌙' },
      { name: 'Night Drives', icon: '🚗' },
      { name: 'Thrifting', icon: '🛍️' },
      { name: 'Street Fashion', icon: '🧢' },
      { name: 'Meditation', icon: '🧘' },
      { name: 'Astrology', icon: '✨' },
    ],
  },
  {
    id: 'tech_gaming',
    name: 'Gaming & Tech',
    icon: '🎮',
    color: 'from-cyan-500 to-blue-500',
    tags: [
      { name: 'Esports', icon: '🏆' },
      { name: 'RPG Games', icon: '⚔️' },
      { name: 'Retro Gaming', icon: '🕹️' },
      { name: 'Coding', icon: '💻' },
      { name: 'AI & Future Tech', icon: '🤖' },
      { name: 'Board Games', icon: '🎲' },
      { name: 'Gadgets', icon: '📱' },
    ],
  },
  {
    id: 'travel_adventure',
    name: 'Travel & Outdoors',
    icon: '✈️',
    color: 'from-emerald-500 to-teal-500',
    tags: [
      { name: 'Backpacking', icon: '🎒' },
      { name: 'Road Trips', icon: '🗺️' },
      { name: 'Mountain Hiking', icon: '🏔️' },
      { name: 'Beach Sunsets', icon: '🌅' },
      { name: 'Stargazing', icon: '🔭' },
      { name: 'Solo Travel', icon: '✈️' },
      { name: 'Camping', icon: '⛺' },
    ],
  },
  {
    id: 'food_dining',
    name: 'Food & Cooking',
    icon: '🍳',
    color: 'from-yellow-500 to-amber-600',
    tags: [
      { name: 'Street Food', icon: '🍢' },
      { name: 'Baking', icon: '🥐' },
      { name: 'Spicy Food', icon: '🌶️' },
      { name: 'Culinary Travel', icon: '🍜' },
      { name: 'Healthy Eating', icon: '🥗' },
      { name: 'Desserts', icon: '🍰' },
    ],
  },
  {
    id: 'social_vibes',
    name: 'Connection & Vibes',
    icon: '💬',
    color: 'from-pink-500 to-purple-600',
    tags: [
      { name: 'Deep Talks', icon: '💭' },
      { name: 'Humor & Memes', icon: '😂' },
      { name: 'Language Exchange', icon: '🌐' },
      { name: 'Philosophy', icon: '🧠' },
      { name: 'Friendly Debates', icon: '🗣️' },
      { name: 'True Crime', icon: '🔍' },
    ],
  },
];

// Helper to look up an icon for an interest tag
export function getInterestIcon(interestName: string): string {
  const norm = interestName.toLowerCase().trim();
  for (const cat of PRESET_INTEREST_CATEGORIES) {
    for (const tag of cat.tags) {
      if (tag.name.toLowerCase() === norm) {
        return tag.icon;
      }
    }
  }
  // Keyword fallbacks
  if (norm.includes('music') || norm.includes('song')) return '🎵';
  if (norm.includes('photo')) return '📷';
  if (norm.includes('coffee') || norm.includes('tea')) return '☕';
  if (norm.includes('travel') || norm.includes('trip')) return '✈️';
  if (norm.includes('art') || norm.includes('paint')) return '🎨';
  if (norm.includes('game') || norm.includes('play')) return '🎮';
  if (norm.includes('food') || norm.includes('cook')) return '🍳';
  if (norm.includes('book') || norm.includes('read')) return '📚';
  if (norm.includes('walk') || norm.includes('drive')) return '🌙';
  if (norm.includes('talk') || norm.includes('chat')) return '💬';
  return '✨';
}

// 7-Day Login Rewards Cycle
export interface DailyRewardDay {
  day: number;
  credits: number;
  badge?: ProfileBadge;
  description: string;
  isGrandPrize?: boolean;
}

export const DAILY_REWARD_SCHEDULE: DailyRewardDay[] = [
  {
    day: 1,
    credits: 50,
    description: 'Welcome Back Bonus: +50 Chat Credits',
  },
  {
    day: 2,
    credits: 75,
    badge: {
      id: 'badge_spark_02',
      name: 'Active Spark',
      icon: '⚡',
      description: 'Logged in 2 consecutive days. Vibrant conversation spark!',
      tier: 'bronze',
    },
    description: '+75 Credits & Exclusive "Active Spark" Badge',
  },
  {
    day: 3,
    credits: 100,
    description: '+100 Chat Credits for keeping the vibe active!',
  },
  {
    day: 4,
    credits: 125,
    badge: {
      id: 'badge_stellar_04',
      name: 'Stellar Chatter',
      icon: '🌟',
      description: '4-day login streak. A bright star across the community.',
      tier: 'silver',
    },
    description: '+125 Credits & "Stellar Chatter" Silver Badge',
  },
  {
    day: 5,
    credits: 150,
    description: '+150 Chat Credits for your 5th consecutive day!',
  },
  {
    day: 6,
    credits: 200,
    badge: {
      id: 'badge_flame_06',
      name: 'Streak Flame',
      icon: '🔥',
      description: '6-day uninterrupted login streak. Unstoppable warmth!',
      tier: 'gold',
    },
    description: '+200 Credits & "Streak Flame" Golden Badge',
  },
  {
    day: 7,
    credits: 300,
    isGrandPrize: true,
    badge: {
      id: 'badge_cosmic_07',
      name: 'Cosmic Champion',
      icon: '👑',
      description: 'Completed 7-Day Login Milestone! Legendary community champion crown.',
      tier: 'cosmic',
    },
    description: 'Grand Prize: +300 Credits & Mythic "Cosmic Champion" Crown!',
  },
];

// Profile Match Algorithm Result
export interface MatchResult {
  matchPercentage: number;
  sharedInterests: string[];
  sharedTopics: string[];
  sharedLanguages: string[];
  isHighCompatibility: boolean;
  scoreGrade: 'Legendary' | 'High Chemistry' | 'Good Match' | 'Fresh Vibe';
  badgeColor: string;
  summaryText: string;
}

export function calculateProfileMatch(
  currentUser: UserProfile | null | undefined,
  targetProfile: UserProfile
): MatchResult {
  if (!currentUser) {
    return {
      matchPercentage: 60,
      sharedInterests: [],
      sharedTopics: [],
      sharedLanguages: [],
      isHighCompatibility: false,
      scoreGrade: 'Fresh Vibe',
      badgeColor: 'from-slate-600 to-slate-800',
      summaryText: 'Join the community to calculate your personal vibe score.',
    };
  }

  const userInterests = (currentUser.interests || []).map((i) => i.toLowerCase().trim());
  const targetInterests = (targetProfile.interests || []).map((i) => i.toLowerCase().trim());

  // Find shared interests preserving target profile's display casing
  const sharedInterests = (targetProfile.interests || []).filter((interest) =>
    userInterests.includes(interest.toLowerCase().trim())
  );

  // Topics
  const userTopics = [
    currentUser.activeTopic,
    ...(currentUser.interestedTopics || []),
  ].filter(Boolean).map((t) => (t as string).toLowerCase().trim());

  const targetTopics = [
    targetProfile.activeTopic,
    ...(targetProfile.interestedTopics || []),
  ].filter(Boolean).map((t) => (t as string).toLowerCase().trim());

  const sharedTopics = Array.from(new Set(userTopics.filter((t) => targetTopics.includes(t))));

  // Languages
  const userLangs = (currentUser.languages || []).map((l) => l.toLowerCase().trim());
  const targetLangs = (targetProfile.languages || []).map((l) => l.toLowerCase().trim());
  const sharedLanguages = (targetProfile.languages || []).filter((l) =>
    userLangs.includes(l.toLowerCase().trim())
  );

  // Compute Score:
  // Base score: 45
  let score = 45;

  // Shared interests provide the heaviest weight (+14 points each, up to +42 points)
  score += Math.min(sharedInterests.length * 14, 42);

  // Shared active topic (+8 points)
  if (sharedTopics.length > 0) {
    score += Math.min(sharedTopics.length * 6, 12);
  }

  // Language overlap (+6 points)
  if (sharedLanguages.length > 0) {
    score += 6;
  }

  // Online availability (+3 points)
  if (targetProfile.isOnline || targetProfile.availabilityStatus === 'online') {
    score += 3;
  }

  // Verified check (+2 points)
  if (targetProfile.isVerified) {
    score += 2;
  }

  // Clamp 40% - 98%
  const finalPercentage = Math.min(Math.max(score, 40), 98);

  let scoreGrade: MatchResult['scoreGrade'] = 'Fresh Vibe';
  let badgeColor = 'from-slate-600 to-slate-700';

  if (finalPercentage >= 88) {
    scoreGrade = 'Legendary';
    badgeColor = 'from-purple-600 via-pink-600 to-amber-500';
  } else if (finalPercentage >= 78) {
    scoreGrade = 'High Chemistry';
    badgeColor = 'from-pink-500 to-purple-600';
  } else if (finalPercentage >= 65) {
    scoreGrade = 'Good Match';
    badgeColor = 'from-teal-500 to-blue-600';
  }

  let summaryText = '';
  if (sharedInterests.length > 0) {
    summaryText = `Shares ${sharedInterests.length} interest${sharedInterests.length > 1 ? 's' : ''}: ${sharedInterests.slice(0, 2).join(', ')}`;
  } else if (sharedTopics.length > 0) {
    summaryText = `Both into #${sharedTopics[0]} topics`;
  } else if (sharedLanguages.length > 0) {
    summaryText = `Both speak ${sharedLanguages[0]}`;
  } else {
    summaryText = 'Fresh community connection to explore';
  }

  return {
    matchPercentage: finalPercentage,
    sharedInterests,
    sharedTopics,
    sharedLanguages,
    isHighCompatibility: finalPercentage >= 75,
    scoreGrade,
    badgeColor,
    summaryText,
  };
}
