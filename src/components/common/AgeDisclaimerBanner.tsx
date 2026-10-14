import React from 'react';
import { ShieldAlert } from 'lucide-react';

export const AgeDisclaimerBanner: React.FC = () => {
  return (
    <div className="w-full bg-[#101722]/80 border-b border-white/5 py-1.5 px-4 text-center">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-[11px] text-slate-400">
        <ShieldAlert className="w-3.5 h-3.5 text-[#FF4F9A] shrink-0" />
        <span>
          <strong className="text-slate-200">18+ Adults Only:</strong> VibeTalk enforces strict age verification. Minors are strictly prohibited from registering or communicating on this platform.
        </span>
      </div>
    </div>
  );
};
