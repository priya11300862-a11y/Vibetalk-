import React from 'react';
import { UserProfile } from '../../types';

export type AvailabilityStatus = 'online' | 'busy' | 'offline';

export function getEffectiveStatus(profile?: {
  availabilityStatus?: 'online' | 'busy' | 'offline';
  isOnline?: boolean;
} | null): AvailabilityStatus {
  if (!profile) return 'offline';
  if (profile.availabilityStatus) {
    return profile.availabilityStatus;
  }
  return profile.isOnline ? 'online' : 'offline';
}

export const STATUS_CONFIG: Record<
  AvailabilityStatus,
  {
    label: string;
    dotColor: string;
    dotBg: string;
    glowClass: string;
    ringColor: string;
    lightBadgeClass: string;
    darkBadgeClass: string;
    textColor: string;
  }
> = {
  online: {
    label: 'Online',
    dotColor: '#10B981',
    dotBg: 'bg-emerald-500',
    glowClass: 'shadow-[0_0_8px_#10b981]',
    ringColor: 'ring-emerald-500/40',
    lightBadgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    darkBadgeClass: 'bg-emerald-500/15 border-emerald-500/35 text-emerald-400',
    textColor: 'text-emerald-500',
  },
  busy: {
    label: 'Busy',
    dotColor: '#F59E0B',
    dotBg: 'bg-amber-500',
    glowClass: 'shadow-[0_0_8px_#f59e0b]',
    ringColor: 'ring-amber-500/40',
    lightBadgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
    darkBadgeClass: 'bg-amber-500/15 border-amber-500/35 text-amber-400',
    textColor: 'text-amber-500',
  },
  offline: {
    label: 'Offline',
    dotColor: '#94A3B8',
    dotBg: 'bg-slate-500',
    glowClass: 'shadow-none',
    ringColor: 'ring-slate-500/30',
    lightBadgeClass: 'bg-slate-100 text-slate-600 border-slate-300',
    darkBadgeClass: 'bg-slate-500/15 border-slate-500/30 text-slate-400',
    textColor: 'text-slate-400',
  },
};

interface UserStatusDotProps {
  status: AvailabilityStatus;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
  showPing?: boolean;
}

export const UserStatusDot: React.FC<UserStatusDotProps> = ({
  status,
  size = 'sm',
  className = '',
  showPing = true,
}) => {
  const config = STATUS_CONFIG[status];
  const sizeMap = {
    xs: 'w-2 h-2',
    sm: 'w-2.5 h-2.5',
    md: 'w-3 h-3',
    lg: 'w-3.5 h-3.5',
  };

  return (
    <span
      className={`relative inline-flex rounded-full shrink-0 ${sizeMap[size]} ${config.dotBg} ${config.glowClass} ${className}`}
      title={config.label}
    >
      {status === 'online' && showPing && (
        <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75" />
      )}
    </span>
  );
};

interface UserStatusBadgeProps {
  status: AvailabilityStatus;
  theme?: 'dark' | 'light';
  size?: 'xs' | 'sm';
  showLabel?: boolean;
  className?: string;
  customLabel?: string;
}

export const UserStatusBadge: React.FC<UserStatusBadgeProps> = ({
  status,
  theme = 'dark',
  size = 'sm',
  showLabel = true,
  className = '',
  customLabel,
}) => {
  const config = STATUS_CONFIG[status];
  const themeClass = theme === 'light' ? config.lightBadgeClass : config.darkBadgeClass;
  const paddingClass = size === 'xs' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-bold ${themeClass} ${paddingClass} ${className}`}
    >
      <UserStatusDot status={status} size={size === 'xs' ? 'xs' : 'sm'} />
      {showLabel && <span>{customLabel || config.label}</span>}
    </span>
  );
};
