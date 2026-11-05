import React from 'react';

interface VerifiedBadgeProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
  showText?: boolean;
  text?: string;
  title?: string;
}

export const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({
  size = 'sm',
  className = '',
  showText = false,
  text = 'Verified',
  title = 'Verified Authenticated Member · 18+ ID Verified',
}) => {
  const sizeMap = {
    xs: { icon: 'w-3.5 h-3.5', text: 'text-[10px]' },
    sm: { icon: 'w-4 h-4', text: 'text-[11px]' },
    md: { icon: 'w-5 h-5', text: 'text-xs' },
    lg: { icon: 'w-6 h-6', text: 'text-sm' },
  };

  const currentSize = sizeMap[size];

  return (
    <span
      className={`inline-flex items-center gap-1 shrink-0 align-middle ${className}`}
      title={title}
      aria-label="Verified Member"
    >
      {/* Highly visible stylized scalloped verification seal */}
      <svg
        className={`${currentSize.icon} shrink-0 drop-shadow-[0_1px_2px_rgba(24,119,242,0.4)] transition-transform hover:scale-110`}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Scalloped rosette seal */}
        <path
          d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91s-2.52-1.27-3.91-.81c-.67-1.31-1.91-2.19-3.34-2.19s-2.67.88-3.34 2.19c-1.39-.46-2.9-.2-3.91.81s-1.27 2.52-.81 3.91C2.63 9.33 1.75 10.57 1.75 12s.88 2.67 2.19 3.34c-.46 1.39-.2 2.9.81 3.91s2.52 1.27 3.91.81c.67 1.31 1.91 2.19 3.34 2.19s2.67-.88 3.34-2.19c1.39.46 2.9.2 3.91-.81s1.27-2.52.81-3.91c1.31-.67 2.19-1.91 2.19-3.34z"
          fill="#1877F2"
        />
        {/* Centered crisp white checkmark */}
        <path
          d="M9.75 16.2L5.85 12.3L7.26 10.89L9.75 13.38L16.74 6.39L18.15 7.8L9.75 16.2Z"
          fill="#FFFFFF"
        />
      </svg>

      {showText && (
        <span className={`font-bold text-[#1877F2] ${currentSize.text} leading-none tracking-tight`}>
          {text}
        </span>
      )}
    </span>
  );
};
