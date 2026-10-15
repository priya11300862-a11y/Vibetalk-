export type AdminRole = 'super_admin' | 'admin' | 'moderator' | 'support_agent' | 'user';

export type AdminPermission =
  | 'users.read'
  | 'users.suspend'
  | 'users.ban'
  | 'users.delete'
  | 'reports.review'
  | 'messages.moderate'
  | 'groups.manage'
  | 'calls.monitor'
  | 'settings.read'
  | 'settings.update'
  | 'analytics.read'
  | 'audit.read'
  | 'admins.manage';

export interface AdminUser {
  id: string;
  email: string;
  displayName: string;
  role: AdminRole;
  avatarUrl: string;
  isMfaEnabled: boolean;
  lastLoginAt: string;
  status: 'active' | 'suspended' | 'revoked';
  permissions: AdminPermission[];
  createdAt: string;
}

export interface AdminAuditLog {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: AdminRole;
  action: string;
  targetType: string;
  targetId: string;
  targetLabel?: string;
  timestamp: string;
  outcome: 'success' | 'failure' | 'denied';
  metadata?: Record<string, any>;
  ipAddress?: string;
}

export type ReportType = 'user' | 'message' | 'profile' | 'group';
export type ReportSeverity = 'critical' | 'high' | 'medium' | 'low';
export type ReportReviewStatus = 'pending' | 'reviewing' | 'resolved' | 'dismissed';

export interface ModerationReportItem {
  id: string;
  type: ReportType;
  targetId: string;
  targetName: string;
  targetAvatarUrl?: string;
  reportedBy: string;
  reportedByName: string;
  reason: string;
  evidenceSnippet?: string;
  severity: ReportSeverity;
  status: ReportReviewStatus;
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  internalNotes?: string;
  actionsTaken?: string[];
}

export interface UserRestrictionRecord {
  id: string;
  userId: string;
  userDisplayName: string;
  restrictionType: 'warning' | 'mute' | 'suspension' | 'ban';
  reason: string;
  appliedBy: string;
  appliedByName: string;
  createdAt: string;
  expiresAt?: string;
  isActive: boolean;
}

export interface PlatformSettingsState {
  siteName: string;
  logoUrl: string;
  faviconUrl: string;
  termsUrl: string;
  privacyUrl: string;
  guidelinesUrl: string;
  maintenanceMode: boolean;
  maintenanceNotice: string;
  registrationAvailability: 'open' | 'invite_only' | 'closed';
  defaultLanguage: string;
  supportedLanguages: string[];
  maxUploadSizeMB: number;
  messageRateLimitPerMin: number;
  callDurationLimitMinutes: number;
  allowedFileTypes: string[];
  sessionTimeoutHours: number;
  requireAdminMfa: boolean;
  featureFlags: {
    audioCalling: boolean;
    videoCalling: boolean;
    publicConnectRooms: boolean;
    quickMatch: boolean;
    dailyRewards: boolean;
    directMessaging: boolean;
    profileBadges: boolean;
  };
}

export interface PlatformAnnouncementItem {
  id: string;
  title: string;
  content: string;
  targetAudience: 'all' | 'vip_gold' | 'moderators' | 'verified_only';
  category: 'feature' | 'maintenance' | 'security' | 'general';
  status: 'draft' | 'published' | 'archived';
  viewsCount: number;
  publishedAt?: string;
  createdAt: string;
  createdBy: string;
}

export interface WebRTCCallMetricsData {
  activeCallsCount: number;
  callsToday: number;
  audioCallsToday: number;
  videoCallsToday: number;
  successRatePercent: number;
  iceFailureRatePercent: number;
  avgDurationMinutes: number;
  turnServerStatus: 'operational' | 'degraded' | 'offline';
  stunServerStatus: 'operational' | 'degraded' | 'offline';
  signalingLatencyMs: number;
  activeSessions: {
    id: string;
    callerName: string;
    receiverName: string;
    type: 'audio' | 'video';
    durationSeconds: number;
    quality: 'excellent' | 'good' | 'poor';
    topic?: string;
  }[];
}

export interface SystemHealthService {
  name: string;
  category: 'database' | 'webrtc' | 'storage' | 'auth' | 'signaling';
  status: 'operational' | 'degraded' | 'outage';
  latencyMs: number;
  uptimePercent: number;
  lastChecked: string;
}
