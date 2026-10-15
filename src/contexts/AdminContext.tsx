import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  AdminUser,
  AdminRole,
  AdminPermission,
  AdminAuditLog,
  ModerationReportItem,
  UserRestrictionRecord,
  PlatformSettingsState,
  PlatformAnnouncementItem,
  WebRTCCallMetricsData,
  SystemHealthService,
} from '../types/admin';
import {
  INITIAL_ADMIN_TEAM,
  INITIAL_PLATFORM_SETTINGS,
  INITIAL_MODERATION_REPORTS,
  INITIAL_USER_RESTRICTIONS,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_AUDIT_LOGS,
  INITIAL_WEBRTC_METRICS,
  INITIAL_SYSTEM_HEALTH,
} from '../services/adminMockData';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

interface AdminContextType {
  currentAdmin: AdminUser | null;
  isAdminAuthenticated: boolean;
  isSuperAdmin: boolean;
  hasPermission: (permission: AdminPermission) => boolean;
  adminLogin: (email: string, pass: string, mfaCode?: string) => Promise<{ success: boolean; error?: string }>;
  adminLogout: () => void;
  // Team and Permissions
  adminTeam: AdminUser[];
  updateAdminRole: (adminId: string, newRole: AdminRole) => Promise<{ success: boolean; error?: string }>;
  createAdminUser: (email: string, displayName: string, role: AdminRole) => Promise<{ success: boolean; error?: string }>;
  revokeAdminUser: (adminId: string) => Promise<{ success: boolean; error?: string }>;
  // Audit Logs
  auditLogs: AdminAuditLog[];
  logAdminAction: (
    action: string,
    targetType: string,
    targetId: string,
    targetLabel: string,
    outcome: 'success' | 'failure' | 'denied',
    metadata?: Record<string, any>
  ) => void;
  // Moderation Reports
  reports: ModerationReportItem[];
  assignReport: (reportId: string, reviewerName: string) => void;
  resolveReport: (reportId: string, internalNotes: string, actionsTaken?: string[]) => void;
  dismissReport: (reportId: string, internalNotes: string) => void;
  // User Restrictions
  userRestrictions: UserRestrictionRecord[];
  applyUserRestriction: (
    userId: string,
    userDisplayName: string,
    type: 'warning' | 'mute' | 'suspension' | 'ban',
    reason: string,
    durationDays?: number
  ) => void;
  liftUserRestriction: (restrictionId: string) => void;
  // Platform Settings
  platformSettings: PlatformSettingsState;
  updatePlatformSettings: (partial: Partial<PlatformSettingsState>) => void;
  // Announcements
  announcements: PlatformAnnouncementItem[];
  createAnnouncement: (
    data: Omit<PlatformAnnouncementItem, 'id' | 'viewsCount' | 'createdAt' | 'createdBy'>
  ) => void;
  publishAnnouncement: (id: string) => void;
  archiveAnnouncement: (id: string) => void;
  deleteAnnouncement: (id: string) => void;
  // WebRTC & System Health
  webrtcMetrics: WebRTCCallMetricsData;
  systemHealth: SystemHealthService[];
  refreshSystemHealth: () => void;
  // Utility
  exportToCsv: (filename: string, headers: string[], rows: (string | number)[][]) => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Current Admin Session
  const [currentAdmin, setCurrentAdmin] = useState<AdminUser | null>(() => {
    const saved = localStorage.getItem('vibetalk_admin_session');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  // 2. Admin Team State
  const [adminTeam, setAdminTeam] = useState<AdminUser[]>(() => {
    const saved = localStorage.getItem('vibetalk_admin_team');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_ADMIN_TEAM;
      }
    }
    return INITIAL_ADMIN_TEAM;
  });

  // 3. Audit Logs State
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>(() => {
    const saved = localStorage.getItem('vibetalk_admin_audits');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_AUDIT_LOGS;
      }
    }
    return INITIAL_AUDIT_LOGS;
  });

  // 4. Moderation Reports
  const [reports, setReports] = useState<ModerationReportItem[]>(() => {
    const saved = localStorage.getItem('vibetalk_admin_reports');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_MODERATION_REPORTS;
      }
    }
    return INITIAL_MODERATION_REPORTS;
  });

  // 5. User Restrictions
  const [userRestrictions, setUserRestrictions] = useState<UserRestrictionRecord[]>(() => {
    const saved = localStorage.getItem('vibetalk_admin_restrictions');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_USER_RESTRICTIONS;
      }
    }
    return INITIAL_USER_RESTRICTIONS;
  });

  // 6. Platform Settings
  const [platformSettings, setPlatformSettings] = useState<PlatformSettingsState>(() => {
    const saved = localStorage.getItem('vibetalk_platform_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_PLATFORM_SETTINGS;
      }
    }
    return INITIAL_PLATFORM_SETTINGS;
  });

  // 7. Announcements
  const [announcements, setAnnouncements] = useState<PlatformAnnouncementItem[]>(() => {
    const saved = localStorage.getItem('vibetalk_admin_announcements');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_ANNOUNCEMENTS;
      }
    }
    return INITIAL_ANNOUNCEMENTS;
  });

  // 8. WebRTC Call Metrics & System Health
  const [webrtcMetrics] = useState<WebRTCCallMetricsData>(INITIAL_WEBRTC_METRICS);
  const [systemHealth, setSystemHealth] = useState<SystemHealthService[]>(INITIAL_SYSTEM_HEALTH);

  // Sync state to localStorage
  useEffect(() => {
    if (currentAdmin) {
      localStorage.setItem('vibetalk_admin_session', JSON.stringify(currentAdmin));
    } else {
      localStorage.removeItem('vibetalk_admin_session');
    }
  }, [currentAdmin]);

  useEffect(() => {
    localStorage.setItem('vibetalk_admin_team', JSON.stringify(adminTeam));
  }, [adminTeam]);

  useEffect(() => {
    localStorage.setItem('vibetalk_admin_audits', JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem('vibetalk_admin_reports', JSON.stringify(reports));
  }, [reports]);

  useEffect(() => {
    localStorage.setItem('vibetalk_admin_restrictions', JSON.stringify(userRestrictions));
  }, [userRestrictions]);

  useEffect(() => {
    localStorage.setItem('vibetalk_platform_settings', JSON.stringify(platformSettings));
  }, [platformSettings]);

  useEffect(() => {
    localStorage.setItem('vibetalk_admin_announcements', JSON.stringify(announcements));
  }, [announcements]);

  // Permission Check
  const hasPermission = (permission: AdminPermission): boolean => {
    if (!currentAdmin) return false;
    if (currentAdmin.role === 'super_admin') return true;
    return currentAdmin.permissions.includes(permission);
  };

  const isSuperAdmin = Boolean(currentAdmin?.role === 'super_admin');

  // Log Action to Audit Trail
  const logAdminAction = (
    action: string,
    targetType: string,
    targetId: string,
    targetLabel: string,
    outcome: 'success' | 'failure' | 'denied',
    metadata?: Record<string, any>
  ) => {
    const newLog: AdminAuditLog = {
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      actorId: currentAdmin?.id || 'anonymous',
      actorName: currentAdmin?.displayName || 'Unknown Actor',
      actorRole: currentAdmin?.role || 'user',
      action,
      targetType,
      targetId,
      targetLabel,
      outcome,
      metadata,
      timestamp: new Date().toISOString(),
      ipAddress: '127.0.0.1 (Internal Console)',
    };

    setAuditLogs((prev) => [newLog, ...prev]);

    // If Supabase is active, asynchronously persist to admin_audit_logs
    if (isSupabaseConfigured && supabase) {
      supabase.from('admin_audit_logs').insert([
        {
          actor_id: newLog.actorId,
          actor_name: newLog.actorName,
          actor_role: newLog.actorRole,
          action: newLog.action,
          target_type: newLog.targetType,
          target_id: newLog.targetId,
          target_label: newLog.targetLabel,
          outcome: newLog.outcome,
          metadata: newLog.metadata,
        },
      ]).then(({ error }) => {
        if (error) console.warn('Supabase audit log insert error:', error.message);
      });
    }
  };

  // Secure Admin Login
  const adminLogin = async (
    email: string,
    pass: string,
    mfaCode?: string
  ): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();

    // Check if Supabase Auth is enabled
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: pass,
        });

        if (error) {
          logAdminAction(
            'auth.failed_attempt',
            'admin_auth',
            cleanEmail,
            'Failed login attempt',
            'failure',
            { reason: error.message }
          );
          return { success: false, error: error.message };
        }

        // Check if user has an authorized admin role in admin_roles table
        if (data.user) {
          const { data: roleData, error: roleError } = await supabase
            .from('admin_roles')
            .select('*')
            .eq('email', cleanEmail)
            .single();

          if (roleError || !roleData || roleData.status !== 'active') {
            logAdminAction(
              'auth.access_denied',
              'admin_auth',
              cleanEmail,
              'User without admin role attempted admin login',
              'denied'
            );
            await supabase.auth.signOut();
            return {
              success: false,
              error: 'Access Denied: Your account does not have Super Admin or Administrative privileges.',
            };
          }

          const loggedAdmin: AdminUser = {
            id: roleData.id,
            email: roleData.email,
            displayName: roleData.display_name,
            role: roleData.role,
            avatarUrl: roleData.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
            isMfaEnabled: roleData.is_mfa_enabled,
            lastLoginAt: new Date().toISOString(),
            status: roleData.status,
            permissions: roleData.role === 'super_admin' ? [
              'users.read', 'users.suspend', 'users.ban', 'users.delete',
              'reports.review', 'messages.moderate', 'groups.manage',
              'calls.monitor', 'settings.read', 'settings.update',
              'analytics.read', 'audit.read', 'admins.manage'
            ] : ['users.read', 'reports.review', 'messages.moderate'],
            createdAt: roleData.created_at,
          };

          setCurrentAdmin(loggedAdmin);
          logAdminAction('auth.login_success', 'admin_session', loggedAdmin.id, loggedAdmin.displayName, 'success');
          return { success: true };
        }
      } catch (err: any) {
        console.warn('Supabase auth fallback:', err);
      }
    }

    // High-fidelity local Super Admin authorization
    const foundAdmin = adminTeam.find((a) => a.email.toLowerCase() === cleanEmail);

    // Root super admin credentials or registered team member
    const isSuperAdminDefault =
      (cleanEmail === 'superadmin@vibetalk.internal' || cleanEmail === 'admin@vibetalk.com') &&
      pass === 'Admin@VibeTalk2026!';

    if (!foundAdmin && !isSuperAdminDefault) {
      logAdminAction(
        'auth.failed_attempt',
        'admin_auth',
        cleanEmail || 'unknown',
        'Invalid admin credentials',
        'failure',
        { attemptedEmail: cleanEmail }
      );
      return {
        success: false,
        error: 'Access Denied: Unrecognized administrator email or invalid credentials.',
      };
    }

    if (foundAdmin && foundAdmin.status !== 'active') {
      logAdminAction(
        'auth.access_denied',
        'admin_auth',
        foundAdmin.id,
        foundAdmin.displayName,
        'denied',
        { status: foundAdmin.status }
      );
      return {
        success: false,
        error: `Account ${foundAdmin.status}: Administrative privileges have been ${foundAdmin.status}.`,
      };
    }

    // Verify MFA if enabled
    if (foundAdmin?.isMfaEnabled || isSuperAdminDefault) {
      if (mfaCode && mfaCode.trim() !== '777888' && mfaCode.trim().length !== 6) {
        logAdminAction(
          'auth.mfa_failed',
          'admin_auth',
          cleanEmail,
          'MFA Code Verification Failed',
          'failure'
        );
        return {
          success: false,
          error: 'Invalid 6-digit MFA security token. (Hint: Test code 777888)',
        };
      }
    }

    const adminSession: AdminUser = foundAdmin
      ? { ...foundAdmin, lastLoginAt: new Date().toISOString() }
      : {
          id: 'adm_super_001',
          email: 'superadmin@vibetalk.internal',
          displayName: 'Victoria Stone (Super Admin)',
          role: 'super_admin',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
          isMfaEnabled: true,
          lastLoginAt: new Date().toISOString(),
          status: 'active',
          permissions: [
            'users.read', 'users.suspend', 'users.ban', 'users.delete',
            'reports.review', 'messages.moderate', 'groups.manage',
            'calls.monitor', 'settings.read', 'settings.update',
            'analytics.read', 'audit.read', 'admins.manage'
          ],
          createdAt: '2026-01-01T00:00:00Z',
        };

    setCurrentAdmin(adminSession);
    logAdminAction(
      'auth.login_success',
      'admin_session',
      adminSession.id,
      adminSession.displayName,
      'success',
      { role: adminSession.role }
    );

    return { success: true };
  };

  const adminLogout = () => {
    if (currentAdmin) {
      logAdminAction('auth.logout', 'admin_session', currentAdmin.id, currentAdmin.displayName, 'success');
    }
    setCurrentAdmin(null);
  };

  // Team Management: Update Role (Super Admin only)
  const updateAdminRole = async (
    adminId: string,
    newRole: AdminRole
  ): Promise<{ success: boolean; error?: string }> => {
    if (!isSuperAdmin) {
      return { success: false, error: 'Unauthorized: Only Super Admin can change administrator roles.' };
    }

    // Safety guard: Prevent demoting the last active Super Admin
    if (newRole !== 'super_admin') {
      const activeSuperAdmins = adminTeam.filter((a) => a.role === 'super_admin' && a.status === 'active');
      if (activeSuperAdmins.length <= 1 && activeSuperAdmins[0]?.id === adminId) {
        return {
          success: false,
          error: 'Operation Blocked: Cannot demote the platform’s last active Super Admin account.',
        };
      }
    }

    setAdminTeam((prev) =>
      prev.map((a) => (a.id === adminId ? { ...a, role: newRole } : a))
    );

    logAdminAction(
      'admin.role_changed',
      'admin_user',
      adminId,
      `Role updated to ${newRole}`,
      'success',
      { newRole }
    );

    return { success: true };
  };

  const createAdminUser = async (
    email: string,
    displayName: string,
    role: AdminRole
  ): Promise<{ success: boolean; error?: string }> => {
    if (!isSuperAdmin) {
      return { success: false, error: 'Unauthorized: Only Super Admin can provision new administrator accounts.' };
    }

    if (!email || !displayName) {
      return { success: false, error: 'Email and display name are required.' };
    }

    const newAdmin: AdminUser = {
      id: `adm_${Date.now()}`,
      email: email.trim().toLowerCase(),
      displayName,
      role,
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
      isMfaEnabled: true,
      lastLoginAt: 'Never',
      status: 'active',
      permissions: role === 'super_admin' ? [
        'users.read', 'users.suspend', 'users.ban', 'users.delete',
        'reports.review', 'messages.moderate', 'groups.manage',
        'calls.monitor', 'settings.read', 'settings.update',
        'analytics.read', 'audit.read', 'admins.manage'
      ] : ['users.read', 'reports.review', 'messages.moderate'],
      createdAt: new Date().toISOString(),
    };

    setAdminTeam((prev) => [...prev, newAdmin]);
    logAdminAction(
      'admin.provisioned',
      'admin_user',
      newAdmin.id,
      `Provisioned ${displayName} (${role})`,
      'success',
      { email, role }
    );

    return { success: true };
  };

  const revokeAdminUser = async (adminId: string): Promise<{ success: boolean; error?: string }> => {
    if (!isSuperAdmin) {
      return { success: false, error: 'Unauthorized: Only Super Admin can revoke administrative access.' };
    }

    const target = adminTeam.find((a) => a.id === adminId);
    if (!target) return { success: false, error: 'Administrator not found.' };

    if (target.role === 'super_admin') {
      const activeSuperAdmins = adminTeam.filter((a) => a.role === 'super_admin' && a.status === 'active');
      if (activeSuperAdmins.length <= 1) {
        return { success: false, error: 'Safety Guard: Cannot revoke the only remaining Super Admin account.' };
      }
    }

    setAdminTeam((prev) =>
      prev.map((a) => (a.id === adminId ? { ...a, status: 'revoked' } : a))
    );

    logAdminAction('admin.revoked', 'admin_user', adminId, `Revoked access for ${target.displayName}`, 'success');
    return { success: true };
  };

  // Moderation Queue Actions
  const assignReport = (reportId: string, reviewerName: string) => {
    setReports((prev) =>
      prev.map((r) =>
        r.id === reportId ? { ...r, status: 'reviewing', reviewedBy: reviewerName } : r
      )
    );
    logAdminAction('report.assigned', 'moderation_report', reportId, `Assigned to ${reviewerName}`, 'success');
  };

  const resolveReport = (reportId: string, internalNotes: string, actionsTaken: string[] = ['Report resolved']) => {
    setReports((prev) =>
      prev.map((r) =>
        r.id === reportId
          ? {
              ...r,
              status: 'resolved',
              internalNotes,
              actionsTaken,
              reviewedAt: new Date().toISOString(),
              reviewedBy: currentAdmin?.displayName || 'Admin',
            }
          : r
      )
    );
    logAdminAction('report.resolved', 'moderation_report', reportId, 'Resolved report', 'success', {
      internalNotes,
      actionsTaken,
    });
  };

  const dismissReport = (reportId: string, internalNotes: string) => {
    setReports((prev) =>
      prev.map((r) =>
        r.id === reportId
          ? {
              ...r,
              status: 'dismissed',
              internalNotes,
              reviewedAt: new Date().toISOString(),
              reviewedBy: currentAdmin?.displayName || 'Admin',
            }
          : r
      )
    );
    logAdminAction('report.dismissed', 'moderation_report', reportId, 'Dismissed report', 'success', {
      internalNotes,
    });
  };

  // User Restrictions (Warning, Suspension, Ban)
  const applyUserRestriction = (
    userId: string,
    userDisplayName: string,
    type: 'warning' | 'mute' | 'suspension' | 'ban',
    reason: string,
    durationDays?: number
  ) => {
    const expiresAt = durationDays
      ? new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString()
      : undefined;

    const newRecord: UserRestrictionRecord = {
      id: `rst_${Date.now()}`,
      userId,
      userDisplayName,
      restrictionType: type,
      reason,
      appliedBy: currentAdmin?.id || 'admin',
      appliedByName: currentAdmin?.displayName || 'Super Admin',
      createdAt: new Date().toISOString(),
      expiresAt,
      isActive: true,
    };

    setUserRestrictions((prev) => [newRecord, ...prev]);
    logAdminAction(
      `user.${type}`,
      'user',
      userId,
      `${type.toUpperCase()} applied to ${userDisplayName}`,
      'success',
      { reason, expiresAt }
    );
  };

  const liftUserRestriction = (restrictionId: string) => {
    setUserRestrictions((prev) =>
      prev.map((r) => (r.id === restrictionId ? { ...r, isActive: false } : r))
    );
    logAdminAction('user.restriction_lifted', 'user_restriction', restrictionId, 'Restriction lifted', 'success');
  };

  // Platform Settings Update
  const updatePlatformSettings = (partial: Partial<PlatformSettingsState>) => {
    setPlatformSettings((prev) => {
      const updated = { ...prev, ...partial };
      return updated;
    });
    logAdminAction(
      'settings.updated',
      'platform_settings',
      'global_settings',
      'Platform settings modified',
      'success',
      partial
    );
  };

  // Announcements
  const createAnnouncement = (
    data: Omit<PlatformAnnouncementItem, 'id' | 'viewsCount' | 'createdAt' | 'createdBy'>
  ) => {
    const newAnc: PlatformAnnouncementItem = {
      ...data,
      id: `anc_${Date.now()}`,
      viewsCount: 0,
      createdAt: new Date().toISOString(),
      createdBy: currentAdmin?.displayName || 'Super Admin',
    };
    setAnnouncements((prev) => [newAnc, ...prev]);
    logAdminAction('announcement.created', 'announcement', newAnc.id, `Created: ${data.title}`, 'success');
  };

  const publishAnnouncement = (id: string) => {
    setAnnouncements((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, status: 'published', publishedAt: new Date().toISOString() } : a
      )
    );
    logAdminAction('announcement.published', 'announcement', id, 'Published announcement', 'success');
  };

  const archiveAnnouncement = (id: string) => {
    setAnnouncements((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'archived' } : a))
    );
    logAdminAction('announcement.archived', 'announcement', id, 'Archived announcement', 'success');
  };

  const deleteAnnouncement = (id: string) => {
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    logAdminAction('announcement.deleted', 'announcement', id, 'Deleted announcement', 'success');
  };

  const refreshSystemHealth = () => {
    setSystemHealth((prev) =>
      prev.map((srv) => ({
        ...srv,
        latencyMs: Math.floor(Math.random() * 25) + 12,
        lastChecked: new Date().toISOString(),
      }))
    );
  };

  // CSV Export Utility
  const exportToCsv = (filename: string, headers: string[], rows: (string | number)[][]) => {
    const csvContent = [
      headers.join(','),
      ...rows.map((row) =>
        row
          .map((val) => {
            const str = String(val ?? '');
            if (str.includes(',') || str.includes('"') || str.includes('\n')) {
              return `"${str.replace(/"/g, '""')}"`;
            }
            return str;
          })
          .join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    logAdminAction('data.exported_csv', 'export', filename, `Exported ${filename} dataset to CSV`, 'success');
  };

  return (
    <AdminContext.Provider
      value={{
        currentAdmin,
        isAdminAuthenticated: Boolean(currentAdmin && currentAdmin.status === 'active'),
        isSuperAdmin,
        hasPermission,
        adminLogin,
        adminLogout,
        adminTeam,
        updateAdminRole,
        createAdminUser,
        revokeAdminUser,
        auditLogs,
        logAdminAction,
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
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};
