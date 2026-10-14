export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected';
export type ModerationStatus = 'clean' | 'review' | 'restricted' | 'blocked';
export type UserRole = 'user' | 'moderator' | 'admin' | 'super_admin';
export type SubscriptionTier = 'free' | 'gold_vip' | 'black_elite';

export interface ProfileBadge {
  id: string;
  name: string;
  icon: string;
  description: string;
  tier?: 'bronze' | 'silver' | 'gold' | 'cosmic';
  unlockedAt?: string;
}

export interface UserProfile {
  id: string;
  username: string;
  firstName: string;
  displayName: string;
  email?: string;
  phoneNumber?: string;
  dateOfBirth: string; // YYYY-MM-DD
  age: number;
  isAdultConfirmed: boolean;
  gender: 'female' | 'male' | 'non-binary' | 'other';
  country: string;
  broadLocation: string; // e.g. "Germany, Berlin" - NEVER exact GPS
  bio: string;
  avatarUrl: string;
  languages: string[];
  interests: string[];
  isVerified: boolean;
  verificationStatus: VerificationStatus;
  moderationStatus: ModerationStatus;
  isOnline: boolean;
  availabilityStatus?: 'online' | 'busy' | 'offline'; // 'online' = green, 'busy' = orange
  activeTopic?: string; // e.g. 'Love', 'Married', 'Usual', 'Foodie', 'Sports', 'Games', 'Movies'
  interestedTopics?: string[];
  lastSeen: string;
  role: UserRole;
  subscriptionTier: SubscriptionTier;
  coins?: number;
  championBadge?: string;
  unlockedBadges?: ProfileBadge[];
  dailyStreak?: number;
  lastDailyClaimDate?: string;
  nativeLanguageScript?: string;
  createdAt: string;
}

export interface LiveAudioRoom {
  id: string;
  title: string;
  host: UserProfile;
  speakers: UserProfile[];
  listenerCount: number;
  category: string;
  isLive: boolean;
  language: string;
}

export interface UserPreferences {
  userId: string;
  showOnlineStatus: boolean;
  showLastSeen: boolean;
  showBroadLocation: boolean;
  allowDiscovery: boolean;
  allowFriendRequests: boolean;
  whoCanMessage: 'all' | 'connections' | 'verified';
  whoCanCall: 'all' | 'connections' | 'nobody';
  whoCanVideoCall: 'all' | 'connections' | 'nobody';
  readReceipts: boolean;
  typingIndicator: boolean;
  pushNotifications: boolean;
  callNotifications: boolean;
  // Profile Privacy & Audience Visibility Controls
  profileVisibility?: 'public' | 'connections' | 'private';
  photoVisibility?: 'everyone' | 'connections' | 'hidden';
  bioVisibility?: 'everyone' | 'connections' | 'hidden';
  interestsVisibility?: 'everyone' | 'connections' | 'hidden';
  languagesVisibility?: 'everyone' | 'connections' | 'hidden';
  locationVisibility?: 'hidden' | 'approximate' | 'shared';
  activityVisibility?: 'everyone' | 'connections' | 'nobody';
}

export interface Connection {
  id: string;
  userId: string;
  connectedUserId: string;
  status: 'pending' | 'connected' | 'blocked' | 'rejected';
  createdAt: string;
}

export type MessageType = 'text' | 'image' | 'audio' | 'file' | 'call_log';

export interface MessageReaction {
  emoji: string;
  userIds: string[];
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  messageType: MessageType;
  mediaUrl?: string;
  audioDuration?: number; // seconds for voice messages
  replyToId?: string;
  replySnippet?: {
    senderName: string;
    text: string;
  };
  reactions: Record<string, string[]>; // emoji -> array of userIds
  isEdited?: boolean;
  isDeletedForEveryone?: boolean;
  status: 'sending' | 'sent' | 'delivered' | 'read';
  createdAt: string;
}

export interface Conversation {
  id: string;
  participant: UserProfile;
  lastMessage?: Message;
  unreadCount: number;
  updatedAt: string;
}

export type CallStatus = 'calling' | 'ringing' | 'connected' | 'reconnecting' | 'ended' | 'missed' | 'rejected';
export type CallType = 'audio' | 'video';
export type ConnectionQuality = 'excellent' | 'good' | 'poor' | 'reconnecting';

export interface CallSession {
  id: string;
  callerId: string;
  receiverId: string;
  caller: UserProfile;
  receiver: UserProfile;
  callType: CallType;
  status: CallStatus;
  startedAt?: string;
  endedAt?: string;
  durationSeconds: number;
  quality: ConnectionQuality;
  isMuted: boolean;
  isVideoEnabled: boolean;
  isFrontCamera: boolean;
  isSpeakerOn: boolean;
  connectedTopic?: string; // e.g. 'Love', 'Married', 'Usual', 'Foodie', 'Sports', 'Games', 'Movies'
  connectionTag?: string; // Display tag e.g. '💕 Love'
}

export interface CallHistoryItem {
  id: string;
  otherUser: UserProfile;
  direction: 'incoming' | 'outgoing' | 'missed';
  callType: CallType;
  timestamp: string;
  durationSeconds: number;
}

export type NotificationType = 
  | 'connection_request'
  | 'connection_accepted'
  | 'new_message'
  | 'missed_call'
  | 'call_incoming'
  | 'verification_approved'
  | 'security_alert'
  | 'report_update';

export interface NotificationItem {
  id: string;
  userId: string;
  sender?: UserProfile;
  type: NotificationType;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}

export interface ReportItem {
  id: string;
  reporterId: string;
  reporterName: string;
  reportedUserId: string;
  reportedName: string;
  messageId?: string;
  category: 'harassment' | 'spam' | 'inappropriate_content' | 'impersonation' | 'hate_speech' | 'threats' | 'scam' | 'underage_suspicion' | 'other';
  details: string;
  status: 'pending' | 'under_review' | 'resolved' | 'dismissed';
  adminNotes?: string;
  createdAt: string;
}

export interface AuditLogItem {
  id: string;
  actorName: string;
  action: string;
  targetType: string;
  targetName: string;
  details: string;
  timestamp: string;
}

export interface VerificationRequest {
  id: string;
  userId: string;
  userName: string;
  documentType: 'government_id' | 'passport' | 'driving_license';
  documentPreviewUrl: string;
  selfieUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
}
