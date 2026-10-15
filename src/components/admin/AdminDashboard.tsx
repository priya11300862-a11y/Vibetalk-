import React, { useState, useMemo } from 'react';
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  Radio,
  PhoneCall,
  ShieldAlert,
  Settings,
  Megaphone,
  ShieldCheck,
  FileText,
  HardDrive,
  Activity,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Search,
  Download,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  ExternalLink,
  Plus,
  Trash2,
  Lock,
  UserCheck,
  UserX,
  VolumeX,
  Eye,
  RefreshCw,
  Sparkles,
  Flame,
  Globe2,
  Cpu,
  Database,
  ArrowUpDown,
  MoreVertical,
  Check,
  X,
  Send,
  Video,
} from 'lucide-react';
import { useAdmin } from '../../contexts/AdminContext';
import { useSocial } from '../../contexts/SocialContext';
import { useCall } from '../../contexts/CallContext';
import { AdminRole, AdminPermission } from '../../types/admin';
import { UserProfile } from '../../types';

interface AdminDashboardProps {
  onExitToApp: () => void;
}

type AdminTab =
  | 'overview'
  | 'users'
  | 'messages'
  | 'groups'
  | 'calls'
  | 'reports'
  | 'settings'
  | 'announcements'
  | 'permissions'
  | 'audit'
  | 'storage'
  | 'health';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onExitToApp }) => {
  const {
    currentAdmin,
    isSuperAdmin,
    hasPermission,
    adminLogout,
    adminTeam,
    updateAdminRole,
    createAdminUser,
    revokeAdminUser,
    auditLogs,
    reports,
    assignReport,
    resolveReport,
    dismissReport,
    userRestrictions,
    applyUserRestriction,
    liftUserRestriction,
    platformSettings,
    updatePlatformSettings,
    announcements,
    createAnnouncement,
    publishAnnouncement,
    archiveAnnouncement,
    deleteAnnouncement,
    webrtcMetrics,
    systemHealth,
    refreshSystemHealth,
    exportToCsv,
  } = useAdmin();

  const { profiles, conversations, deleteMessage } = useSocial();
  const { activeCall } = useCall();

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');

  // Modals state
  const [userActionModal, setUserActionModal] = useState<{
    isOpen: boolean;
    type: 'suspend' | 'ban' | 'delete' | 'role' | 'verify';
    targetUser?: UserProfile;
    reason?: string;
    durationDays?: number;
    newRole?: AdminRole;
  }>({ isOpen: false, type: 'suspend' });

  const [announcementModalOpen, setAnnouncementModalOpen] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    content: '',
    targetAudience: 'all' as 'all' | 'vip_gold' | 'moderators' | 'verified_only',
    category: 'general' as 'feature' | 'maintenance' | 'security' | 'general',
  });

  const [newAdminModalOpen, setNewAdminModalOpen] = useState(false);
  const [newAdminForm, setNewAdminForm] = useState({
    email: '',
    displayName: '',
    role: 'moderator' as AdminRole,
  });

  // User Management Filter States
  const [userRoleFilter, setUserRoleFilter] = useState<string>('all');
  const [userStatusFilter, setUserStatusFilter] = useState<string>('all');
  const [userSearchQuery, setUserSearchQuery] = useState('');

  // Reports Filter States
  const [reportTypeFilter, setReportTypeFilter] = useState<string>('all');
  const [reportStatusFilter, setReportStatusFilter] = useState<string>('all');

  // Audit Logs Filter States
  const [auditActionFilter, setAuditActionFilter] = useState<string>('all');

  // Combined User Roster
  const allUsersList = useMemo(() => {
    return profiles.map((p) => {
      const activeRestriction = userRestrictions.find(
        (r) => r.userId === p.id && r.isActive
      );
      return {
        ...p,
        restrictionStatus: activeRestriction ? activeRestriction.restrictionType : 'none',
        restrictionRecord: activeRestriction,
      };
    });
  }, [profiles, userRestrictions]);

  const filteredUsers = useMemo(() => {
    return allUsersList.filter((u) => {
      if (userRoleFilter !== 'all' && u.role !== userRoleFilter) return false;
      if (userStatusFilter === 'restricted' && u.restrictionStatus === 'none') return false;
      if (userStatusFilter === 'verified' && !u.isVerified) return false;
      if (userSearchQuery.trim()) {
        const q = userSearchQuery.toLowerCase();
        return (
          u.displayName.toLowerCase().includes(q) ||
          u.username.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q) ||
          u.id.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [allUsersList, userRoleFilter, userStatusFilter, userSearchQuery]);

  // Filtered Reports
  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      if (reportTypeFilter !== 'all' && r.type !== reportTypeFilter) return false;
      if (reportStatusFilter !== 'all' && r.status !== reportStatusFilter) return false;
      return true;
    });
  }, [reports, reportTypeFilter, reportStatusFilter]);

  // Filtered Audit Logs
  const filteredAuditLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      if (auditActionFilter !== 'all' && !log.action.startsWith(auditActionFilter)) return false;
      if (globalSearch.trim()) {
        const q = globalSearch.toLowerCase();
        return (
          log.actorName.toLowerCase().includes(q) ||
          log.action.toLowerCase().includes(q) ||
          log.targetType.toLowerCase().includes(q) ||
          log.targetId.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [auditLogs, auditActionFilter, globalSearch]);

  // Compute live overview metrics
  const totalRegisteredUsers = 1248 + profiles.length;
  const activeUsersToday = 842;
  const onlineUsersCount = profiles.filter((p) => p.isOnline).length + 318;
  const totalConversationsCount = conversations.length + 1520;
  const messagesTodayCount = 14320;
  const pendingReportsCount = reports.filter((r) => r.status === 'pending').length;
  const suspendedAccountsCount = userRestrictions.filter((r) => r.isActive).length;

  // Handlers for User Actions
  const handleConfirmUserAction = () => {
    const { targetUser, type, reason, durationDays, newRole } = userActionModal;
    if (!targetUser) return;

    if (type === 'suspend') {
      applyUserRestriction(
        targetUser.id,
        targetUser.displayName,
        'suspension',
        reason || 'Policy violation and safety caution',
        durationDays || 7
      );
    } else if (type === 'ban') {
      applyUserRestriction(
        targetUser.id,
        targetUser.displayName,
        'ban',
        reason || 'Severe community guideline infraction'
      );
    } else if (type === 'delete') {
      // In real backend: delete user records and sessions
      applyUserRestriction(
        targetUser.id,
        targetUser.displayName,
        'ban',
        `Permanent deletion request approved: ${reason || 'User requested GDPR erasure'}`
      );
    }

    setUserActionModal({ isOpen: false, type: 'suspend' });
  };

  const navItems = [
    { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'users', label: 'User Management', icon: Users, badge: allUsersList.length },
    { id: 'messages', label: 'Chat & Content', icon: MessageSquare },
    { id: 'groups', label: 'Connect Rooms & Groups', icon: Radio },
    { id: 'calls', label: 'Voice & Video Health', icon: PhoneCall },
    { id: 'reports', label: 'Moderation Queue', icon: ShieldAlert, badge: pendingReportsCount, badgeColor: 'bg-[#D9485F]' },
    { id: 'settings', label: 'Platform & Security', icon: Settings },
    { id: 'announcements', label: 'Announcements', icon: Megaphone },
    { id: 'permissions', label: 'Team & Permissions', icon: ShieldCheck },
    { id: 'audit', label: 'Audit Trail Logs', icon: FileText },
    { id: 'storage', label: 'Storage & Retention', icon: HardDrive },
    { id: 'health', label: 'System Health', icon: Activity },
  ];

  return (
    <div className="min-h-screen bg-[#F5F7FC] text-[#303641] flex flex-col md:flex-row font-sans selection:bg-[#1877F2]/20 selection:text-[#1877F2]">
      {/* =========================================================================
          1. FIXED COLLAPSIBLE DARK SIDEBAR (#0F141A)
          ========================================================================= */}
      <aside
        className={`${
          isSidebarCollapsed ? 'w-20' : 'w-64'
        } bg-[#0F141A] text-slate-300 flex flex-col justify-between shrink-0 transition-all duration-300 border-r border-slate-800 z-30 select-none`}
      >
        <div>
          {/* Brand Header */}
          <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800/80">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-9 h-9 rounded-xl bg-[#1877F2] text-white flex items-center justify-center font-bold text-base shrink-0 shadow-md">
                VT
              </div>
              {!isSidebarCollapsed && (
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-white text-sm tracking-tight truncate">
                      VibeTalk
                    </span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#1877F2]/20 text-[#1877F2] border border-[#1877F2]/30 uppercase">
                      Admin
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 block truncate">
                    Enterprise Portal
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors hidden md:flex"
              title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              aria-label="Toggle sidebar"
            >
              {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-140px)] no-scrollbar" role="navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as AdminTab)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer relative group ${
                    isActive
                      ? 'bg-[#1877F2] text-white shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                  title={item.label}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                  {!isSidebarCollapsed && (
                    <span className="truncate flex-1 text-left">{item.label}</span>
                  )}
                  {!isSidebarCollapsed && item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                        item.badgeColor || 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Admin Footer & Logout */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-900/50">
          {!isSidebarCollapsed ? (
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <img
                  src={currentAdmin?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                  alt={currentAdmin?.displayName}
                  className="w-8 h-8 rounded-full object-cover border border-slate-700"
                />
                <div className="min-w-0 text-left">
                  <div className="text-xs font-bold text-white truncate">
                    {currentAdmin?.displayName || 'Super Admin'}
                  </div>
                  <div className="text-[10px] text-[#1877F2] font-semibold uppercase tracking-wider">
                    {currentAdmin?.role.replace('_', ' ') || 'Super Admin'}
                  </div>
                </div>
              </div>

              <button
                onClick={adminLogout}
                className="p-1.5 rounded-lg text-slate-400 hover:text-[#D9485F] hover:bg-slate-800 transition-colors"
                title="Sign out of Admin Session"
                aria-label="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={adminLogout}
              className="w-full flex items-center justify-center p-2 rounded-lg text-slate-400 hover:text-[#D9485F] hover:bg-slate-800"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </aside>

      {/* =========================================================================
          2. MAIN CONTENT AREA WITH STICKY TOP HEADER
          ========================================================================= */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header */}
        <header className="sticky top-0 z-20 h-16 bg-white border-b border-[#E1E5EC] px-4 sm:px-6 flex items-center justify-between gap-4 shadow-xs">
          {/* Breadcrumb & Tab Title */}
          <div className="flex items-center gap-3 min-w-0">
            <h1 className="text-base sm:text-lg font-bold text-[#303641] tracking-tight capitalize truncate">
              {activeTab.replace('_', ' ')}
            </h1>
            <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-[#E1E5EC]" />
            <span className="hidden sm:inline-block text-xs font-semibold text-[#7B8492]">
              Super Admin Console
            </span>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Live System Health Badge */}
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[#16865C] text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-[#16865C] animate-pulse" />
              <span>Nodes 99.98%</span>
            </div>

            {/* View Live Website Button */}
            <button
              onClick={onExitToApp}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E1E5EC] bg-[#F5F7FC] hover:bg-[#EAF2FF] text-[#1877F2] hover:border-[#1877F2]/40 text-xs font-semibold transition-all cursor-pointer"
              title="Return to user interface"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Live Site</span>
            </button>

            {/* Role Chip */}
            <div className="px-2.5 py-1 rounded-lg bg-[#0F141A] text-white text-[11px] font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#1877F2]" />
              <span className="hidden sm:inline">{isSuperAdmin ? 'Super Admin' : 'Admin'}</span>
            </div>
          </div>
        </header>

        {/* Viewport Tabs Body */}
        <main className="p-4 sm:p-6 lg:p-8 space-y-6 flex-1 text-left">
          {/* =====================================================================
              TAB 1: DASHBOARD OVERVIEW
              ===================================================================== */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Top Banner Notice */}
              <div className="p-4 rounded-2xl bg-white border border-[#E1E5EC] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-[#303641]">
                      Welcome back, {currentAdmin?.displayName}!
                    </h2>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#EAF2FF] text-[#1877F2]">
                      Role: {currentAdmin?.role}
                    </span>
                  </div>
                  <p className="text-xs text-[#7B8492]">
                    Platform operations, WebRTC calling networks, and safety queues are operating with optimal throughput.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setActiveTab('reports')}
                    className="px-3.5 py-2 rounded-lg bg-[#1877F2] hover:bg-[#166fe5] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    <ShieldAlert className="w-4 h-4" />
                    <span>Review Pending ({pendingReportsCount})</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('settings')}
                    className="px-3 py-2 rounded-lg border border-[#E1E5EC] bg-white hover:bg-[#F5F7FC] text-[#303641] text-xs font-semibold transition-colors"
                  >
                    Platform Settings
                  </button>
                </div>
              </div>

              {/* 12 Key Statistics Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {[
                  {
                    label: 'Total Registered Users',
                    value: totalRegisteredUsers.toLocaleString(),
                    change: '+14.2% this month',
                    icon: Users,
                    color: 'text-[#1877F2]',
                    bg: 'bg-[#EAF2FF]',
                  },
                  {
                    label: 'Active Users Today',
                    value: activeUsersToday.toLocaleString(),
                    change: '84.6% retention',
                    icon: Activity,
                    color: 'text-[#16865C]',
                    bg: 'bg-emerald-50',
                  },
                  {
                    label: 'Online Right Now',
                    value: onlineUsersCount.toLocaleString(),
                    change: 'Live presence',
                    icon: Flame,
                    color: 'text-[#F28C28]',
                    bg: 'bg-amber-50',
                  },
                  {
                    label: 'Pending Safety Reports',
                    value: pendingReportsCount,
                    change: pendingReportsCount > 0 ? 'Requires review' : 'Queue clear',
                    icon: ShieldAlert,
                    color: pendingReportsCount > 0 ? 'text-[#D9485F]' : 'text-[#16865C]',
                    bg: pendingReportsCount > 0 ? 'bg-rose-50' : 'bg-emerald-50',
                  },
                  {
                    label: 'Messages Sent Today',
                    value: messagesTodayCount.toLocaleString(),
                    change: '+1,240 vs yesterday',
                    icon: MessageSquare,
                    color: 'text-[#1877F2]',
                    bg: 'bg-[#EAF2FF]',
                  },
                  {
                    label: 'WebRTC Calls Today',
                    value: webrtcMetrics.callsToday.toLocaleString(),
                    change: `${webrtcMetrics.audioCallsToday} audio / ${webrtcMetrics.videoCallsToday} video`,
                    icon: PhoneCall,
                    color: 'text-[#1877F2]',
                    bg: 'bg-[#EAF2FF]',
                  },
                  {
                    label: 'Call Success Rate',
                    value: `${webrtcMetrics.successRatePercent}%`,
                    change: `ICE Failures: ${webrtcMetrics.iceFailureRatePercent}%`,
                    icon: Activity,
                    color: 'text-[#16865C]',
                    bg: 'bg-emerald-50',
                  },
                  {
                    label: 'Active Voice Lounges',
                    value: '7 live rooms',
                    change: '1,816 live listeners',
                    icon: Radio,
                    color: 'text-[#1877F2]',
                    bg: 'bg-[#EAF2FF]',
                  },
                  {
                    label: 'Suspended & Banned',
                    value: suspendedAccountsCount,
                    change: 'Enforced restrictions',
                    icon: UserX,
                    color: 'text-[#D9485F]',
                    bg: 'bg-rose-50',
                  },
                  {
                    label: 'Media Storage Used',
                    value: '14.8 GB',
                    change: 'of 250 GB tier (5.9%)',
                    icon: HardDrive,
                    color: 'text-[#303641]',
                    bg: 'bg-[#F5F7FC]',
                  },
                  {
                    label: 'Signaling Latency',
                    value: `${webrtcMetrics.signalingLatencyMs} ms`,
                    change: 'Relay STUN: Healthy',
                    icon: Cpu,
                    color: 'text-[#16865C]',
                    bg: 'bg-emerald-50',
                  },
                  {
                    label: 'Audit Events Logged',
                    value: auditLogs.length,
                    change: 'Immutable security log',
                    icon: FileText,
                    color: 'text-[#303641]',
                    bg: 'bg-[#F5F7FC]',
                  },
                ].map((stat, idx) => {
                  const Icon = stat.icon;
                  return (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-white border border-[#E1E5EC] space-y-2 shadow-xs hover:border-[#1877F2]/40 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-[#7B8492] truncate">
                          {stat.label}
                        </span>
                        <div className={`w-8 h-8 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center shrink-0`}>
                          <Icon className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="text-xl sm:text-2xl font-bold text-[#303641] tracking-tight">
                        {stat.value}
                      </div>
                      <div className="text-[11px] font-medium text-[#7B8492]">
                        {stat.change}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Live WebRTC Calls & Recent Safety Audit Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Active Calls Monitor */}
                <div className="p-5 rounded-2xl bg-white border border-[#E1E5EC] space-y-4 shadow-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-[#E1E5EC]">
                    <div className="flex items-center gap-2">
                      <PhoneCall className="w-4 h-4 text-[#1877F2]" />
                      <h3 className="font-bold text-sm text-[#303641]">
                        Live WebRTC Audio/Video Sessions ({webrtcMetrics.activeSessions.length})
                      </h3>
                    </div>
                    <button
                      onClick={() => setActiveTab('calls')}
                      className="text-xs text-[#1877F2] font-semibold hover:underline"
                    >
                      View Call Health
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {webrtcMetrics.activeSessions.map((session) => (
                      <div
                        key={session.id}
                        className="p-3 rounded-xl border border-[#E1E5EC] bg-[#F5F7FC] flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`p-2 rounded-lg ${session.type === 'video' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-[#1877F2]'}`}>
                            {session.type === 'video' ? <Video className="w-3.5 h-3.5" /> : <PhoneCall className="w-3.5 h-3.5" />}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-[#303641] truncate">
                              {session.callerName} ↔ {session.receiverName}
                            </div>
                            <div className="text-[10px] text-[#7B8492]">
                              Duration: {Math.floor(session.durationSeconds / 60)}m {session.durationSeconds % 60}s • Topic: {session.topic || 'General'}
                            </div>
                          </div>
                        </div>

                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-[#16865C] shrink-0">
                          {session.quality}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Audit Trail Preview */}
                <div className="p-5 rounded-2xl bg-white border border-[#E1E5EC] space-y-4 shadow-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-[#E1E5EC]">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#1877F2]" />
                      <h3 className="font-bold text-sm text-[#303641]">
                        Recent Security & Audit Trail
                      </h3>
                    </div>
                    <button
                      onClick={() => setActiveTab('audit')}
                      className="text-xs text-[#1877F2] font-semibold hover:underline"
                    >
                      View All Logs
                    </button>
                  </div>

                  <div className="space-y-2">
                    {auditLogs.slice(0, 4).map((log) => (
                      <div
                        key={log.id}
                        className="p-2.5 rounded-xl border border-[#E1E5EC] bg-[#F5F7FC] flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-[#303641]">{log.actorName}</span>
                            <span className="text-[10px] text-[#7B8492]">({log.actorRole})</span>
                          </div>
                          <p className="text-[11px] text-[#7B8492] truncate">
                            Action: <strong className="text-[#303641]">{log.action}</strong> • {log.targetLabel || log.targetId}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                            log.outcome === 'success'
                              ? 'bg-emerald-100 text-[#16865C]'
                              : log.outcome === 'denied'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-rose-100 text-[#D9485F]'
                          }`}
                        >
                          {log.outcome}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =====================================================================
              TAB 2: USER MANAGEMENT
              ===================================================================== */}
          {activeTab === 'users' && (
            <div className="space-y-5">
              {/* Header Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <h2 className="text-base font-bold text-[#303641]">
                    Platform Users Directory ({filteredUsers.length})
                  </h2>
                  <p className="text-xs text-[#7B8492]">
                    Inspect accounts, manage adult verification badges, apply time restrictions, or ban violators.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      exportToCsv(
                        'vibetalk_users',
                        ['ID', 'Display Name', 'Username', 'Email', 'Role', 'Age', 'Verified', 'Restriction'],
                        filteredUsers.map((u) => [
                          u.id,
                          u.displayName,
                          u.username,
                          u.email || 'N/A',
                          u.role,
                          u.age,
                          u.isVerified ? 'YES' : 'NO',
                          u.restrictionStatus,
                        ])
                      )
                    }
                    className="px-3 py-1.5 rounded-lg border border-[#E1E5EC] bg-white hover:bg-[#F5F7FC] text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-[#1877F2]" />
                    <span>Export CSV</span>
                  </button>
                </div>
              </div>

              {/* Filter and Search Bar */}
              <div className="p-3.5 rounded-xl bg-white border border-[#E1E5EC] flex flex-wrap items-center justify-between gap-3 shadow-xs">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7B8492]" />
                  <input
                    type="text"
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    placeholder="Search by name, username, email, ID..."
                    className="w-full h-9 pl-9 pr-3 text-xs rounded-lg border border-[#E1E5EC] bg-[#F5F7FC] text-[#303641] focus:bg-white focus:border-[#1877F2] focus:outline-none transition-all"
                  />
                </div>

                <div className="flex items-center gap-2 flex-wrap text-xs">
                  <span className="text-[#7B8492] font-semibold">Filter:</span>
                  <select
                    value={userRoleFilter}
                    onChange={(e) => setUserRoleFilter(e.target.value)}
                    aria-label="Filter users by role"
                    className="h-9 px-2.5 rounded-lg border border-[#E1E5EC] bg-white text-[#303641] font-semibold text-xs focus:border-[#1877F2] focus:outline-none"
                  >
                    <option value="all">All Roles</option>
                    <option value="user">Regular User</option>
                    <option value="moderator">Moderator</option>
                    <option value="admin">Admin</option>
                    <option value="super_admin">Super Admin</option>
                  </select>

                  <select
                    value={userStatusFilter}
                    onChange={(e) => setUserStatusFilter(e.target.value)}
                    aria-label="Filter users by account status"
                    className="h-9 px-2.5 rounded-lg border border-[#E1E5EC] bg-white text-[#303641] font-semibold text-xs focus:border-[#1877F2] focus:outline-none"
                  >
                    <option value="all">All Statuses</option>
                    <option value="verified">Verified Only (18+)</option>
                    <option value="restricted">Restricted / Banned</option>
                  </select>
                </div>
              </div>

              {/* Data Table */}
              <div className="bg-white rounded-2xl border border-[#E1E5EC] shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-[#F5F7FC] border-b border-[#E1E5EC] text-[#7B8492] font-bold uppercase tracking-wider text-[11px]">
                        <th className="py-3 px-4">User</th>
                        <th className="py-3 px-4">Role</th>
                        <th className="py-3 px-4">Age / Location</th>
                        <th className="py-3 px-4">Verification</th>
                        <th className="py-3 px-4">Restriction</th>
                        <th className="py-3 px-4 text-right">Administrative Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E1E5EC]">
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-[#7B8492]">
                            No platform members found matching filter criteria.
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((user) => (
                          <tr key={user.id} className="hover:bg-[#F5F7FC]/70 transition-colors">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2.5">
                                <img
                                  src={user.avatarUrl}
                                  alt={user.displayName}
                                  className="w-9 h-9 rounded-full object-cover border border-[#E1E5EC]"
                                />
                                <div>
                                  <div className="font-bold text-[#303641] flex items-center gap-1">
                                    <span>{user.displayName}</span>
                                    {user.isVerified && (
                                      <CheckCircle2 className="w-3.5 h-3.5 text-[#1877F2]" />
                                    )}
                                  </div>
                                  <div className="text-[11px] text-[#7B8492]">
                                    @{user.username} • {user.email || 'user@vibetalk.internal'}
                                  </div>
                                </div>
                              </div>
                            </td>

                            <td className="py-3 px-4">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  user.role === 'super_admin'
                                    ? 'bg-purple-100 text-purple-700'
                                    : user.role === 'admin'
                                    ? 'bg-blue-100 text-[#1877F2]'
                                    : user.role === 'moderator'
                                    ? 'bg-emerald-100 text-[#16865C]'
                                    : 'bg-slate-100 text-slate-700'
                                }`}
                              >
                                {user.role}
                              </span>
                            </td>

                            <td className="py-3 px-4">
                              <div className="font-semibold text-[#303641]">{user.age || 24} yrs (18+)</div>
                              <div className="text-[11px] text-[#7B8492]">{user.broadLocation || 'Global'}</div>
                            </td>

                            <td className="py-3 px-4">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  user.isVerified
                                    ? 'bg-emerald-50 text-[#16865C] border border-emerald-200'
                                    : 'bg-slate-100 text-[#7B8492]'
                                }`}
                              >
                                {user.isVerified ? 'VERIFIED ADULT' : 'STANDARD'}
                              </span>
                            </td>

                            <td className="py-3 px-4">
                              {user.restrictionStatus !== 'none' ? (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-[#D9485F] uppercase">
                                  {user.restrictionStatus}
                                </span>
                              ) : (
                                <span className="text-[#16865C] font-semibold flex items-center gap-1 text-[11px]">
                                  <Check className="w-3 h-3" />
                                  <span>Clean</span>
                                </span>
                              )}
                            </td>

                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() =>
                                    setUserActionModal({
                                      isOpen: true,
                                      type: 'suspend',
                                      targetUser: user,
                                      durationDays: 7,
                                    })
                                  }
                                  className="px-2.5 py-1 rounded bg-[#F5F7FC] hover:bg-amber-100 hover:text-amber-800 text-[#7B8492] font-semibold text-[11px] transition-colors"
                                  title="Suspend account"
                                >
                                  Suspend
                                </button>
                                <button
                                  onClick={() =>
                                    setUserActionModal({
                                      isOpen: true,
                                      type: 'ban',
                                      targetUser: user,
                                    })
                                  }
                                  className="px-2.5 py-1 rounded bg-rose-50 hover:bg-rose-100 text-[#D9485F] font-semibold text-[11px] transition-colors"
                                  title="Permanently ban account"
                                >
                                  Ban
                                </button>
                                <button
                                  onClick={() =>
                                    setUserActionModal({
                                      isOpen: true,
                                      type: 'delete',
                                      targetUser: user,
                                    })
                                  }
                                  className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                  title="Delete account data"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* =====================================================================
              TAB 3: CHAT & MESSAGING MODERATION
              ===================================================================== */}
          {activeTab === 'messages' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <h2 className="text-base font-bold text-[#303641]">
                    Chat & Messaging Moderation Hub
                  </h2>
                  <p className="text-xs text-[#7B8492]">
                    Review reported text snippets, verify content flags, remove harmful content, and configure retention policies.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#7B8492] font-semibold">
                    Retention: <strong className="text-[#303641]">90 Days (Compliant)</strong>
                  </span>
                </div>
              </div>

              {/* Reported Messages Queue */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#7B8492]">
                  Reported Message Queue ({reports.filter((r) => r.type === 'message').length})
                </h3>

                {reports.filter((r) => r.type === 'message').map((report) => (
                  <div
                    key={report.id}
                    className="p-4 rounded-2xl bg-white border border-[#E1E5EC] space-y-3 shadow-xs"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-100 text-[#D9485F]">
                            {report.severity} Severity
                          </span>
                          <span className="text-xs text-[#7B8492]">
                            Reported by <strong>{report.reportedByName}</strong>
                          </span>
                          <span className="text-xs text-[#7B8492]">• {report.createdAt}</span>
                        </div>
                        <h4 className="font-bold text-sm text-[#303641]">{report.targetName}</h4>
                        <p className="text-xs text-[#7B8492]">Reason: {report.reason}</p>
                      </div>

                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          report.status === 'resolved'
                            ? 'bg-emerald-100 text-[#16865C]'
                            : report.status === 'pending'
                            ? 'bg-rose-100 text-[#D9485F]'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {report.status}
                      </span>
                    </div>

                    {report.evidenceSnippet && (
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-[#303641] font-mono">
                        "{report.evidenceSnippet}"
                      </div>
                    )}

                    <div className="pt-2 border-t border-[#E1E5EC] flex items-center justify-between gap-3">
                      <span className="text-[11px] text-[#7B8492]">
                        Reviewer: {report.reviewedBy || 'Unassigned'}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            resolveReport(report.id, 'Message removed and sender penalized.', [
                              'Removed message',
                              'Issued warning',
                            ])
                          }
                          className="px-3 py-1 rounded-md bg-[#D9485F] hover:bg-rose-700 text-white text-xs font-semibold"
                        >
                          Remove Content & Penalize
                        </button>
                        <button
                          onClick={() => dismissReport(report.id, 'Investigated: context does not violate policy.')}
                          className="px-3 py-1 rounded-md border border-[#E1E5EC] hover:bg-[#F5F7FC] text-xs font-semibold text-[#7B8492]"
                        >
                          Dismiss Flag
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* =====================================================================
              TAB 4: GROUPS & CONNECT ROOMS
              ===================================================================== */}
          {activeTab === 'groups' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <h2 className="text-base font-bold text-[#303641]">
                    Live Connect Rooms & Community Governance
                  </h2>
                  <p className="text-xs text-[#7B8492]">
                    Monitor active voice lounges, speaker limits, listener safety, and group verification badges.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    title: 'BGMI & Valorant Squad Lounge',
                    tags: ['#Gaming', '#Chatting'],
                    listeners: 342,
                    host: 'Milkee',
                    status: 'Live',
                    language: 'English',
                  },
                  {
                    title: 'Friday Movie Buffs & Cinema Club',
                    tags: ['#Movies', '#Chill'],
                    listeners: 285,
                    host: 'Rakhi Verma',
                    status: 'Live',
                    language: 'Hindi',
                  },
                  {
                    title: 'Casual Chit-Chat & Midnight Banter',
                    tags: ['#Chatting', '#Love'],
                    listeners: 420,
                    host: 'Kristin Watson',
                    status: 'Live',
                    language: 'English',
                  },
                  {
                    title: 'Indie Beats & Tamil Lo-Fi Jam',
                    tags: ['#Music', '#Chill'],
                    listeners: 198,
                    host: 'Sushmitha Rao',
                    status: 'Live',
                    language: 'Tamil',
                  },
                ].map((room, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-white border border-[#E1E5EC] space-y-3 shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-[#16865C] flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#16865C] animate-pulse" />
                        <span>LIVE LOUNGE</span>
                      </span>
                      <span className="text-xs text-[#7B8492] font-semibold">
                        {room.listeners} listeners
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-sm text-[#303641]">{room.title}</h4>
                      <p className="text-xs text-[#7B8492]">
                        Host: <strong>{room.host}</strong> • Language: {room.language}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[#E1E5EC]">
                      <div className="flex gap-1">
                        {room.tags.map((t) => (
                          <span key={t} className="px-2 py-0.5 rounded bg-[#EAF2FF] text-[#1877F2] text-[10px] font-semibold">
                            {t}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button className="px-2.5 py-1 rounded bg-[#F5F7FC] hover:bg-amber-100 text-amber-800 text-xs font-semibold">
                          Suspend Room
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* =====================================================================
              TAB 5: VOICE & VIDEO CALL HEALTH (WEBRTC)
              ===================================================================== */}
          {activeTab === 'calls' && (
            <div className="space-y-6">
              <div className="space-y-0.5">
                <h2 className="text-base font-bold text-[#303641]">
                  WebRTC Infrastructure & Audio/Video Call Analytics
                </h2>
                <p className="text-xs text-[#7B8492]">
                  Real-time telemetry, ICE candidate failure rates, signaling latency, and STUN/TURN server health.
                </p>
              </div>

              {/* Call Health Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-white border border-[#E1E5EC] space-y-1">
                  <span className="text-xs text-[#7B8492] font-semibold">Call Success Rate</span>
                  <div className="text-2xl font-bold text-[#16865C]">
                    {webrtcMetrics.successRatePercent}%
                  </div>
                  <span className="text-[11px] text-[#7B8492]">ICE failures &lt; 1%</span>
                </div>
                <div className="p-4 rounded-2xl bg-white border border-[#E1E5EC] space-y-1">
                  <span className="text-xs text-[#7B8492] font-semibold">Average Duration</span>
                  <div className="text-2xl font-bold text-[#1877F2]">
                    {webrtcMetrics.avgDurationMinutes} mins
                  </div>
                  <span className="text-[11px] text-[#7B8492]">Across 1,845 sessions</span>
                </div>
                <div className="p-4 rounded-2xl bg-white border border-[#E1E5EC] space-y-1">
                  <span className="text-xs text-[#7B8492] font-semibold">STUN/TURN Status</span>
                  <div className="text-2xl font-bold text-[#16865C]">
                    Healthy
                  </div>
                  <span className="text-[11px] text-[#7B8492]">Coturn Global Relays</span>
                </div>
                <div className="p-4 rounded-2xl bg-white border border-[#E1E5EC] space-y-1">
                  <span className="text-xs text-[#7B8492] font-semibold">Signaling Latency</span>
                  <div className="text-2xl font-bold text-[#303641]">
                    {webrtcMetrics.signalingLatencyMs} ms
                  </div>
                  <span className="text-[11px] text-[#7B8492]">WebSocket Handshake</span>
                </div>
              </div>

              {/* Active Sessions Telemetry */}
              <div className="p-5 rounded-2xl bg-white border border-[#E1E5EC] space-y-4 shadow-xs">
                <h3 className="font-bold text-sm text-[#303641]">
                  Active Call Sessions Roster (Zero Eavesdropping Enforcement)
                </h3>
                <p className="text-xs text-[#7B8492]">
                  VibeTalk enforces end-to-end media privacy. Audio and video payloads are peer-encrypted and never monitored or recorded.
                </p>

                <div className="divide-y divide-[#E1E5EC]">
                  {webrtcMetrics.activeSessions.map((s) => (
                    <div key={s.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#EAF2FF] text-[#1877F2] flex items-center justify-center font-bold">
                          {s.type === 'video' ? <Video className="w-4 h-4" /> : <PhoneCall className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="font-bold text-[#303641]">{s.callerName} ↔ {s.receiverName}</div>
                          <div className="text-[11px] text-[#7B8492]">Session ID: {s.id}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-right">
                        <div>
                          <div className="font-semibold text-[#303641]">{Math.floor(s.durationSeconds / 60)}m {s.durationSeconds % 60}s</div>
                          <div className="text-[10px] text-[#16865C]">Stream: {s.quality}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* =====================================================================
              TAB 6: MODERATION QUEUE (REPORTS)
              ===================================================================== */}
          {activeTab === 'reports' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <h2 className="text-base font-bold text-[#303641]">
                    Safety & Abuse Reports Resolution Center
                  </h2>
                  <p className="text-xs text-[#7B8492]">
                    Review user complaints, spam flags, underage reports, and harassment cases.
                  </p>
                </div>
              </div>

              {/* Reports Filter Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto text-xs">
                {['all', 'pending', 'reviewing', 'resolved', 'dismissed'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setReportStatusFilter(status)}
                    className={`px-3 py-1.5 rounded-lg font-semibold capitalize transition-colors ${
                      reportStatusFilter === status
                        ? 'bg-[#1877F2] text-white shadow-xs'
                        : 'bg-white text-[#7B8492] border border-[#E1E5EC] hover:bg-[#F5F7FC]'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>

              {/* Reports Cards */}
              <div className="space-y-3">
                {filteredReports.length === 0 ? (
                  <div className="p-8 text-center bg-white rounded-2xl border border-[#E1E5EC] text-[#7B8492]">
                    <CheckCircle2 className="w-8 h-8 text-[#16865C] mx-auto mb-2" />
                    <p className="font-bold text-sm text-[#303641]">Queue is clear!</p>
                    <p className="text-xs">No moderation tickets match this filter.</p>
                  </div>
                ) : (
                  filteredReports.map((report) => (
                    <div
                      key={report.id}
                      className="p-5 rounded-2xl bg-white border border-[#E1E5EC] space-y-3 shadow-xs"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-100 text-[#D9485F]">
                              {report.severity}
                            </span>
                            <span className="text-xs font-semibold text-[#303641]">
                              Type: {report.type.toUpperCase()}
                            </span>
                            <span className="text-xs text-[#7B8492]">• {report.createdAt}</span>
                          </div>
                          <h4 className="font-bold text-sm text-[#303641]">{report.targetName}</h4>
                          <p className="text-xs text-[#7B8492]">Reported by: <strong>{report.reportedByName}</strong></p>
                          <p className="text-xs text-[#303641] mt-1">{report.reason}</p>
                        </div>

                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                            report.status === 'resolved'
                              ? 'bg-emerald-100 text-[#16865C]'
                              : report.status === 'pending'
                              ? 'bg-rose-100 text-[#D9485F]'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {report.status}
                        </span>
                      </div>

                      {report.evidenceSnippet && (
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-[#303641] font-mono">
                          Evidence: "{report.evidenceSnippet}"
                        </div>
                      )}

                      {report.internalNotes && (
                        <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900">
                          <strong>Admin Note:</strong> {report.internalNotes}
                        </div>
                      )}

                      <div className="pt-2 border-t border-[#E1E5EC] flex items-center justify-between gap-3">
                        <span className="text-xs text-[#7B8492]">
                          Assignee: <strong>{report.reviewedBy || 'Unassigned'}</strong>
                        </span>

                        <div className="flex items-center gap-2">
                          {report.status !== 'resolved' && (
                            <>
                              <button
                                onClick={() =>
                                  assignReport(report.id, currentAdmin?.displayName || 'Super Admin')
                                }
                                className="px-3 py-1 rounded-md border border-[#E1E5EC] hover:bg-[#F5F7FC] text-xs font-semibold text-[#303641]"
                              >
                                Assign to Me
                              </button>
                              <button
                                onClick={() =>
                                  resolveReport(
                                    report.id,
                                    'Investigated by Super Admin. Offender restricted and notified.',
                                    ['Issued sanction', 'Notified reporter']
                                  )
                                }
                                className="px-3 py-1 rounded-md bg-[#16865C] hover:bg-emerald-700 text-white text-xs font-semibold"
                              >
                                Resolve & Sanction
                              </button>
                              <button
                                onClick={() =>
                                  dismissReport(report.id, 'Dismissed: False report or insufficient evidence.')
                                }
                                className="px-3 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-[#7B8492] text-xs font-semibold"
                              >
                                Dismiss
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* =====================================================================
              TAB 7: WEBSITE & PLATFORM SETTINGS
              ===================================================================== */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h2 className="text-base font-bold text-[#303641]">
                    Website Configuration & Infrastructure Feature Flags
                  </h2>
                  <p className="text-xs text-[#7B8492]">
                    Super Admin controls for maintenance mode, registration locks, rate limits, and calling toggles.
                  </p>
                </div>
              </div>

              {/* Maintenance Mode Emergency Card */}
              <div
                className={`p-5 rounded-2xl border transition-all ${
                  platformSettings.maintenanceMode
                    ? 'bg-rose-50 border-rose-300'
                    : 'bg-white border-[#E1E5EC]'
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <AlertTriangle
                        className={`w-5 h-5 ${
                          platformSettings.maintenanceMode ? 'text-[#D9485F]' : 'text-amber-500'
                        }`}
                      />
                      <h3 className="font-bold text-sm text-[#303641]">
                        Platform Maintenance Mode
                      </h3>
                    </div>
                    <p className="text-xs text-[#7B8492]">
                      When enabled, regular user traffic is blocked with a maintenance notice. Only authorized administrators can access the system.
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      updatePlatformSettings({
                        maintenanceMode: !platformSettings.maintenanceMode,
                      })
                    }
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
                      platformSettings.maintenanceMode
                        ? 'bg-[#D9485F] text-white hover:bg-rose-700'
                        : 'bg-slate-100 text-[#303641] hover:bg-slate-200'
                    }`}
                  >
                    {platformSettings.maintenanceMode ? 'ACTIVE (CLICK TO DISABLE)' : 'Enable Maintenance'}
                  </button>
                </div>
              </div>

              {/* Feature Flags Grid */}
              <div className="p-5 rounded-2xl bg-white border border-[#E1E5EC] space-y-4 shadow-xs">
                <h3 className="font-bold text-sm text-[#303641]">Feature Flags & Capabilities</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(platformSettings.featureFlags).map(([key, val]) => (
                    <div
                      key={key}
                      className="p-3.5 rounded-xl border border-[#E1E5EC] bg-[#F5F7FC] flex items-center justify-between gap-3"
                    >
                      <div>
                        <div className="font-bold text-xs text-[#303641] capitalize">
                          {key.replace(/([A-Z])/g, ' $1')}
                        </div>
                        <div className="text-[10px] text-[#7B8492]">
                          {val ? 'Enabled platform-wide' : 'Disabled'}
                        </div>
                      </div>

                      <button
                        onClick={() =>
                          updatePlatformSettings({
                            featureFlags: {
                              ...platformSettings.featureFlags,
                              [key]: !val,
                            },
                          })
                        }
                        className={`px-3 py-1 rounded-md text-xs font-bold transition-colors ${
                          val
                            ? 'bg-[#1877F2] text-white shadow-xs'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {val ? 'ON' : 'OFF'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rate Limits & Policies */}
              <div className="p-5 rounded-2xl bg-white border border-[#E1E5EC] space-y-4 shadow-xs">
                <h3 className="font-bold text-sm text-[#303641]">Rate Limits & File Upload Policy</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="block text-[#7B8492] font-semibold mb-1">
                      Max Upload Size (MB)
                    </label>
                    <input
                      type="number"
                      value={platformSettings.maxUploadSizeMB}
                      onChange={(e) =>
                        updatePlatformSettings({ maxUploadSizeMB: Number(e.target.value) })
                      }
                      className="w-full h-9 px-3 rounded-lg border border-[#E1E5EC] bg-[#F5F7FC]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#7B8492] font-semibold mb-1">
                      Message Rate Limit (msg/min)
                    </label>
                    <input
                      type="number"
                      value={platformSettings.messageRateLimitPerMin}
                      onChange={(e) =>
                        updatePlatformSettings({ messageRateLimitPerMin: Number(e.target.value) })
                      }
                      className="w-full h-9 px-3 rounded-lg border border-[#E1E5EC] bg-[#F5F7FC]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#7B8492] font-semibold mb-1">
                      Max Call Duration (minutes)
                    </label>
                    <input
                      type="number"
                      value={platformSettings.callDurationLimitMinutes}
                      onChange={(e) =>
                        updatePlatformSettings({ callDurationLimitMinutes: Number(e.target.value) })
                      }
                      className="w-full h-9 px-3 rounded-lg border border-[#E1E5EC] bg-[#F5F7FC]"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =====================================================================
              TAB 8: ANNOUNCEMENTS
              ===================================================================== */}
          {activeTab === 'announcements' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <h2 className="text-base font-bold text-[#303641]">
                    Platform Announcements & Broadcast Notices
                  </h2>
                  <p className="text-xs text-[#7B8492]">
                    Broadcast system updates, maintenance alerts, or security notices to all platform members.
                  </p>
                </div>

                <button
                  onClick={() => setAnnouncementModalOpen(true)}
                  className="px-3.5 py-2 rounded-lg bg-[#1877F2] hover:bg-[#166fe5] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Announcement</span>
                </button>
              </div>

              <div className="space-y-3">
                {announcements.map((anc) => (
                  <div
                    key={anc.id}
                    className="p-5 rounded-2xl bg-white border border-[#E1E5EC] space-y-3 shadow-xs"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#EAF2FF] text-[#1877F2]">
                          {anc.category}
                        </span>
                        <h4 className="font-bold text-sm text-[#303641]">{anc.title}</h4>
                      </div>

                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          anc.status === 'published'
                            ? 'bg-emerald-100 text-[#16865C]'
                            : 'bg-slate-100 text-[#7B8492]'
                        }`}
                      >
                        {anc.status}
                      </span>
                    </div>

                    <p className="text-xs text-[#7B8492] leading-relaxed">{anc.content}</p>

                    <div className="pt-2 border-t border-[#E1E5EC] flex items-center justify-between gap-3 text-xs text-[#7B8492]">
                      <div>
                        Audience: <strong className="text-[#303641] uppercase">{anc.targetAudience}</strong> • Views: {anc.viewsCount.toLocaleString()}
                      </div>

                      <div className="flex items-center gap-2">
                        {anc.status === 'draft' ? (
                          <button
                            onClick={() => publishAnnouncement(anc.id)}
                            className="px-3 py-1 rounded bg-[#1877F2] text-white text-xs font-semibold hover:bg-[#166fe5]"
                          >
                            Publish Now
                          </button>
                        ) : (
                          <button
                            onClick={() => archiveAnnouncement(anc.id)}
                            className="px-3 py-1 rounded border border-[#E1E5EC] hover:bg-[#F5F7FC] text-xs font-semibold"
                          >
                            Archive
                          </button>
                        )}
                        <button
                          onClick={() => deleteAnnouncement(anc.id)}
                          className="p-1 rounded text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* =====================================================================
              TAB 9: ADMIN TEAM & ROLE PERMISSION MATRIX
              ===================================================================== */}
          {activeTab === 'permissions' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <h2 className="text-base font-bold text-[#303641]">
                    Administrator Roles & Granular Permission Matrix
                  </h2>
                  <p className="text-xs text-[#7B8492]">
                    Manage the privileged administrative roster. Deny-by-default access with strict Super Admin authority.
                  </p>
                </div>

                {isSuperAdmin && (
                  <button
                    onClick={() => setNewAdminModalOpen(true)}
                    className="px-3.5 py-2 rounded-lg bg-[#1877F2] hover:bg-[#166fe5] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Provision Admin</span>
                  </button>
                )}
              </div>

              {/* Admin Team Members Table */}
              <div className="bg-white rounded-2xl border border-[#E1E5EC] shadow-xs overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#F5F7FC] border-b border-[#E1E5EC] text-[#7B8492] font-bold uppercase tracking-wider text-[11px]">
                      <th className="py-3 px-4">Admin Member</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4">MFA State</th>
                      <th className="py-3 px-4">Last Login</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E1E5EC]">
                    {adminTeam.map((admin) => (
                      <tr key={admin.id} className="hover:bg-[#F5F7FC]/70">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={admin.avatarUrl}
                              alt={admin.displayName}
                              className="w-8 h-8 rounded-full object-cover border border-[#E1E5EC]"
                            />
                            <div>
                              <div className="font-bold text-[#303641]">{admin.displayName}</div>
                              <div className="text-[11px] text-[#7B8492]">{admin.email}</div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              admin.role === 'super_admin'
                                ? 'bg-purple-100 text-purple-700'
                                : admin.role === 'admin'
                                ? 'bg-blue-100 text-[#1877F2]'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {admin.role.toUpperCase()}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          {admin.isMfaEnabled ? (
                            <span className="text-[#16865C] font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Enforced</span>
                            </span>
                          ) : (
                            <span className="text-amber-600 font-semibold">Optional</span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-[#7B8492]">{admin.lastLoginAt || 'Recent'}</td>

                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              admin.status === 'active'
                                ? 'bg-emerald-100 text-[#16865C]'
                                : 'bg-rose-100 text-[#D9485F]'
                            }`}
                          >
                            {admin.status.toUpperCase()}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right">
                          {isSuperAdmin && admin.id !== currentAdmin?.id ? (
                            <div className="flex items-center justify-end gap-2">
                              <select
                                value={admin.role}
                                onChange={(e) => updateAdminRole(admin.id, e.target.value as AdminRole)}
                                aria-label="Change administrator role"
                                className="h-7 px-2 rounded border border-[#E1E5EC] bg-white text-[11px] font-semibold"
                              >
                                <option value="super_admin">Super Admin</option>
                                <option value="admin">Admin</option>
                                <option value="moderator">Moderator</option>
                                <option value="support_agent">Support Agent</option>
                              </select>

                              {admin.status === 'active' && (
                                <button
                                  onClick={() => revokeAdminUser(admin.id)}
                                  className="px-2 py-1 rounded bg-rose-50 text-[#D9485F] text-[11px] font-bold hover:bg-rose-100"
                                >
                                  Revoke
                                </button>
                              )}
                            </div>
                          ) : (
                            <span className="text-[11px] text-[#7B8492] italic">Primary Account</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Permission Matrix */}
              <div className="p-5 rounded-2xl bg-white border border-[#E1E5EC] space-y-4 shadow-xs">
                <h3 className="font-bold text-sm text-[#303641]">
                  Granular Permission Matrix (RBAC Enforcement)
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border border-[#E1E5EC]">
                    <thead className="bg-[#F5F7FC] text-[#7B8492] font-bold">
                      <tr>
                        <th className="p-2.5 border">Permission Token</th>
                        <th className="p-2.5 border text-center">Super Admin</th>
                        <th className="p-2.5 border text-center">Admin</th>
                        <th className="p-2.5 border text-center">Moderator</th>
                        <th className="p-2.5 border text-center">Support Agent</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E1E5EC]">
                      {[
                        { token: 'users.read', label: 'View user profiles & details', s: true, a: true, m: true, sup: true },
                        { token: 'users.suspend', label: 'Suspend user accounts', s: true, a: true, m: true, sup: false },
                        { token: 'users.ban', label: 'Permanently ban accounts', s: true, a: true, m: false, sup: false },
                        { token: 'users.delete', label: 'GDPR erase user accounts', s: true, a: false, m: false, sup: false },
                        { token: 'reports.review', label: 'Review & resolve safety reports', s: true, a: true, m: true, sup: true },
                        { token: 'messages.moderate', label: 'Moderate & remove reported messages', s: true, a: true, m: true, sup: false },
                        { token: 'groups.manage', label: 'Manage live connect rooms', s: true, a: true, m: false, sup: false },
                        { token: 'calls.monitor', label: 'Monitor WebRTC call metrics', s: true, a: true, m: false, sup: false },
                        { token: 'settings.update', label: 'Change platform settings & flags', s: true, a: false, m: false, sup: false },
                        { token: 'audit.read', label: 'Read immutable audit logs', s: true, a: true, m: false, sup: false },
                        { token: 'admins.manage', label: 'Provision/demote admin roles', s: true, a: false, m: false, sup: false },
                      ].map((perm) => (
                        <tr key={perm.token} className="hover:bg-slate-50">
                          <td className="p-2.5 border">
                            <span className="font-mono text-[11px] text-[#1877F2]">{perm.token}</span>
                            <span className="block text-[10px] text-[#7B8492]">{perm.label}</span>
                          </td>
                          <td className="p-2.5 border text-center font-bold text-[#16865C]">✓</td>
                          <td className="p-2.5 border text-center font-bold">{perm.a ? <span className="text-[#16865C]">✓</span> : <span className="text-slate-300">—</span>}</td>
                          <td className="p-2.5 border text-center font-bold">{perm.m ? <span className="text-[#16865C]">✓</span> : <span className="text-slate-300">—</span>}</td>
                          <td className="p-2.5 border text-center font-bold">{perm.sup ? <span className="text-[#16865C]">✓</span> : <span className="text-slate-300">—</span>}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* =====================================================================
              TAB 10: AUDIT LOGS (IMMUTABLE TRAIL & CSV EXPORT)
              ===================================================================== */}
          {activeTab === 'audit' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <h2 className="text-base font-bold text-[#303641]">
                    Immutable Administrator Audit Trail ({filteredAuditLogs.length})
                  </h2>
                  <p className="text-xs text-[#7B8492]">
                    Cryptographically stamped log of every login, moderation sanction, role change, and settings modification.
                  </p>
                </div>

                <button
                  onClick={() =>
                    exportToCsv(
                      'vibetalk_audit_logs',
                      ['Timestamp', 'Actor Name', 'Actor Role', 'Action', 'Target Type', 'Target ID', 'Outcome'],
                      filteredAuditLogs.map((log) => [
                        log.timestamp,
                        log.actorName,
                        log.actorRole,
                        log.action,
                        log.targetType,
                        log.targetId,
                        log.outcome,
                      ])
                    )
                  }
                  className="px-3.5 py-1.5 rounded-lg border border-[#E1E5EC] bg-white hover:bg-[#F5F7FC] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-[#1877F2]" />
                  <span>Export Audit Logs (CSV)</span>
                </button>
              </div>

              {/* Filters */}
              <div className="p-3.5 rounded-xl bg-white border border-[#E1E5EC] flex items-center justify-between gap-3 shadow-xs">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7B8492]" />
                  <input
                    type="text"
                    value={globalSearch}
                    onChange={(e) => setGlobalSearch(e.target.value)}
                    placeholder="Search logs by actor, action, target..."
                    className="w-full h-9 pl-9 pr-3 text-xs rounded-lg border border-[#E1E5EC] bg-[#F5F7FC]"
                  />
                </div>

                <select
                  value={auditActionFilter}
                  onChange={(e) => setAuditActionFilter(e.target.value)}
                  aria-label="Filter audit logs by action category"
                  className="h-9 px-3 rounded-lg border border-[#E1E5EC] text-xs font-semibold bg-white"
                >
                  <option value="all">All Action Types</option>
                  <option value="auth">Authentication Events</option>
                  <option value="user">User Sanctions</option>
                  <option value="report">Moderation Reports</option>
                  <option value="settings">Settings Changes</option>
                  <option value="admin">Role Modifications</option>
                </select>
              </div>

              {/* Logs Table */}
              <div className="bg-white rounded-2xl border border-[#E1E5EC] shadow-xs overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#F5F7FC] border-b border-[#E1E5EC] text-[#7B8492] font-bold uppercase tracking-wider text-[11px]">
                      <th className="py-3 px-4">Timestamp (UTC)</th>
                      <th className="py-3 px-4">Actor</th>
                      <th className="py-3 px-4">Action</th>
                      <th className="py-3 px-4">Target</th>
                      <th className="py-3 px-4">Outcome</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E1E5EC] font-mono text-[11px]">
                    {filteredAuditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-[#F5F7FC]/70">
                        <td className="py-3 px-4 text-[#7B8492] whitespace-nowrap">
                          {log.timestamp}
                        </td>
                        <td className="py-3 px-4 font-sans">
                          <span className="font-bold text-[#303641]">{log.actorName}</span>
                          <span className="text-[10px] text-[#7B8492] ml-1">({log.actorRole})</span>
                        </td>
                        <td className="py-3 px-4 font-bold text-[#1877F2]">
                          {log.action}
                        </td>
                        <td className="py-3 px-4 font-sans text-[#303641]">
                          {log.targetLabel || `${log.targetType}:${log.targetId}`}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-sans ${
                              log.outcome === 'success'
                                ? 'bg-emerald-100 text-[#16865C]'
                                : log.outcome === 'denied'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-[#D9485F]'
                            }`}
                          >
                            {log.outcome}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* =====================================================================
              TAB 11: STORAGE & DATA RETENTION
              ===================================================================== */}
          {activeTab === 'storage' && (
            <div className="space-y-6">
              <div className="space-y-0.5">
                <h2 className="text-base font-bold text-[#303641]">
                  Media Storage Buckets & Retention Governance
                </h2>
                <p className="text-xs text-[#7B8492]">
                  Manage asset storage capacities, avatar and voice note buckets, and data erasure requests.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-white border border-[#E1E5EC] space-y-2">
                  <span className="text-xs text-[#7B8492] font-semibold">User Avatars Bucket</span>
                  <div className="text-2xl font-bold text-[#303641]">4.2 GB</div>
                  <span className="text-[11px] text-[#16865C]">Healthy • 12,410 assets</span>
                </div>
                <div className="p-4 rounded-2xl bg-white border border-[#E1E5EC] space-y-2">
                  <span className="text-xs text-[#7B8492] font-semibold">Voice Audio Messages</span>
                  <div className="text-2xl font-bold text-[#303641]">8.9 GB</div>
                  <span className="text-[11px] text-[#16865C]">WebM Encoded • Auto-expire 90d</span>
                </div>
                <div className="p-4 rounded-2xl bg-white border border-[#E1E5EC] space-y-2">
                  <span className="text-xs text-[#7B8492] font-semibold">Media & Shared Images</span>
                  <div className="text-2xl font-bold text-[#303641]">1.7 GB</div>
                  <span className="text-[11px] text-[#16865C]">Compressed WebP</span>
                </div>
              </div>
            </div>
          )}

          {/* =====================================================================
              TAB 12: SYSTEM HEALTH
              ===================================================================== */}
          {activeTab === 'health' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h2 className="text-base font-bold text-[#303641]">
                    Infrastructure Nodes & Edge Health
                  </h2>
                  <p className="text-xs text-[#7B8492]">
                    PostgreSQL database status, WebRTC cluster connectivity, and real-time latency ping monitors.
                  </p>
                </div>

                <button
                  onClick={refreshSystemHealth}
                  className="px-3 py-1.5 rounded-lg border border-[#E1E5EC] bg-white hover:bg-[#F5F7FC] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-[#1877F2]" />
                  <span>Ping Services Now</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {systemHealth.map((srv, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-white border border-[#E1E5EC] space-y-2 shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-[#303641]">{srv.name}</h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-[#16865C] uppercase">
                        {srv.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-[#7B8492] pt-1">
                      <span>Latency: <strong className="text-[#303641]">{srv.latencyMs} ms</strong></span>
                      <span>Uptime: <strong className="text-[#16865C]">{srv.uptimePercent}%</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* =========================================================================
          3. USER ACTION MODAL (SUSPEND, BAN, DELETE CONFIRMATION)
          ========================================================================= */}
      {userActionModal.isOpen && userActionModal.targetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white border border-[#E1E5EC] p-6 space-y-4 shadow-2xl text-left">
            <div className="flex items-center justify-between pb-2 border-b border-[#E1E5EC]">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-[#D9485F]" />
                <h3 className="font-bold text-sm text-[#303641] capitalize">
                  {userActionModal.type} Account
                </h3>
              </div>
              <button
                onClick={() => setUserActionModal({ isOpen: false, type: 'suspend' })}
                className="text-[#7B8492] hover:text-[#303641]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#7B8492] leading-relaxed">
              You are applying a sanction to{' '}
              <strong className="text-[#303641]">{userActionModal.targetUser.displayName}</strong> (@
              {userActionModal.targetUser.username}). This administrative action will be immutably recorded in the security audit trail.
            </p>

            <div>
              <label className="block text-xs font-semibold text-[#303641] mb-1">
                Reason for Sanction
              </label>
              <textarea
                rows={3}
                value={userActionModal.reason || ''}
                onChange={(e) =>
                  setUserActionModal({ ...userActionModal, reason: e.target.value })
                }
                placeholder="State the specific policy, safety report ID, or community guideline violation..."
                className="w-full p-2.5 rounded-lg border border-[#E1E5EC] text-xs text-[#303641] placeholder-[#7B8492] focus:border-[#1877F2] focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setUserActionModal({ isOpen: false, type: 'suspend' })}
                className="px-4 py-2 rounded-lg border border-[#E1E5EC] text-xs font-semibold text-[#7B8492] hover:bg-[#F5F7FC]"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmUserAction}
                className="px-4 py-2 rounded-lg bg-[#D9485F] hover:bg-rose-700 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                Confirm {userActionModal.type.toUpperCase()}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          4. CREATE ANNOUNCEMENT MODAL
          ========================================================================= */}
      {announcementModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white border border-[#E1E5EC] p-6 space-y-4 shadow-2xl text-left">
            <div className="flex items-center justify-between pb-2 border-b border-[#E1E5EC]">
              <div className="flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-[#1877F2]" />
                <h3 className="font-bold text-sm text-[#303641]">Create Platform Announcement</h3>
              </div>
              <button
                onClick={() => setAnnouncementModalOpen(false)}
                className="text-[#7B8492] hover:text-[#303641]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#303641] mb-1">Announcement Title</label>
                <input
                  type="text"
                  value={newAnnouncement.title}
                  onChange={(e) =>
                    setNewAnnouncement({ ...newAnnouncement, title: e.target.value })
                  }
                  placeholder="e.g. Scheduled Maintenance or New Audio Room Features"
                  className="w-full h-9 px-3 rounded-lg border border-[#E1E5EC]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#303641] mb-1">Target Audience</label>
                <select
                  value={newAnnouncement.targetAudience}
                  onChange={(e) =>
                    setNewAnnouncement({
                      ...newAnnouncement,
                      targetAudience: e.target.value as any,
                    })
                  }
                  className="w-full h-9 px-3 rounded-lg border border-[#E1E5EC]"
                >
                  <option value="all">All Registered Users</option>
                  <option value="vip_gold">Gold & Elite VIP Members</option>
                  <option value="verified_only">Verified Adult Members (18+)</option>
                  <option value="moderators">Community Moderators</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#303641] mb-1">Content</label>
                <textarea
                  rows={4}
                  value={newAnnouncement.content}
                  onChange={(e) =>
                    setNewAnnouncement({ ...newAnnouncement, content: e.target.value })
                  }
                  placeholder="Write announcement body..."
                  className="w-full p-2.5 rounded-lg border border-[#E1E5EC]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setAnnouncementModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-[#E1E5EC] text-xs font-semibold text-[#7B8492] hover:bg-[#F5F7FC]"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (newAnnouncement.title && newAnnouncement.content) {
                    createAnnouncement({
                      ...newAnnouncement,
                      status: 'published',
                      publishedAt: new Date().toISOString(),
                    });
                    setAnnouncementModalOpen(false);
                    setNewAnnouncement({
                      title: '',
                      content: '',
                      targetAudience: 'all',
                      category: 'general',
                    });
                  }
                }}
                className="px-4 py-2 rounded-lg bg-[#1877F2] hover:bg-[#166fe5] text-white text-xs font-bold"
              >
                Publish Broadcast
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          5. PROVISION NEW ADMIN MODAL (SUPER ADMIN ONLY)
          ========================================================================= */}
      {newAdminModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white border border-[#E1E5EC] p-6 space-y-4 shadow-2xl text-left">
            <div className="flex items-center justify-between pb-2 border-b border-[#E1E5EC]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#1877F2]" />
                <h3 className="font-bold text-sm text-[#303641]">Provision Administrator Account</h3>
              </div>
              <button
                onClick={() => setNewAdminModalOpen(false)}
                className="text-[#7B8492] hover:text-[#303641]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#303641] mb-1">Display Name</label>
                <input
                  type="text"
                  value={newAdminForm.displayName}
                  onChange={(e) =>
                    setNewAdminForm({ ...newAdminForm, displayName: e.target.value })
                  }
                  placeholder="e.g. Alex Morgan"
                  className="w-full h-9 px-3 rounded-lg border border-[#E1E5EC]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#303641] mb-1">Admin Email</label>
                <input
                  type="email"
                  value={newAdminForm.email}
                  onChange={(e) =>
                    setNewAdminForm({ ...newAdminForm, email: e.target.value })
                  }
                  placeholder="alex.admin@vibetalk.internal"
                  className="w-full h-9 px-3 rounded-lg border border-[#E1E5EC]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#303641] mb-1">Role & Privilege Level</label>
                <select
                  value={newAdminForm.role}
                  onChange={(e) =>
                    setNewAdminForm({ ...newAdminForm, role: e.target.value as AdminRole })
                  }
                  className="w-full h-9 px-3 rounded-lg border border-[#E1E5EC]"
                >
                  <option value="moderator">Moderator (Reports & Message review)</option>
                  <option value="support_agent">Support Agent (Reports inquiry)</option>
                  <option value="admin">Admin (Operational, user restrictions)</option>
                  <option value="super_admin">Super Admin (Full administrative authority)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setNewAdminModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-[#E1E5EC] text-xs font-semibold text-[#7B8492]"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (newAdminForm.email && newAdminForm.displayName) {
                    await createAdminUser(
                      newAdminForm.email,
                      newAdminForm.displayName,
                      newAdminForm.role
                    );
                    setNewAdminModalOpen(false);
                    setNewAdminForm({ email: '', displayName: '', role: 'moderator' });
                  }
                }}
                className="px-4 py-2 rounded-lg bg-[#1877F2] text-white text-xs font-bold hover:bg-[#166fe5]"
              >
                Create Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
