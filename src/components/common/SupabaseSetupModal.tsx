import React, { useState } from 'react';
import { Database, Copy, Check, ExternalLink, X, ShieldCheck } from 'lucide-react';
import { isSupabaseConfigured } from '../../lib/supabase';

interface SupabaseSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseSetupModal: React.FC<SupabaseSetupModalProps> = ({ isOpen, onClose }) => {
  const [copiedEnv, setCopiedEnv] = useState(false);
  const [copiedPath, setCopiedPath] = useState(false);

  if (!isOpen) return null;

  const envSample = `VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-publishable-key"`;

  const copyToClipboard = (text: string, type: 'env' | 'path') => {
    navigator.clipboard.writeText(text);
    if (type === 'env') {
      setCopiedEnv(true);
      setTimeout(() => setCopiedEnv(false), 2000);
    } else {
      setCopiedPath(true);
      setTimeout(() => setCopiedPath(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-2xl bg-[#101722] border border-[#7C5CFF]/30 p-6 shadow-2xl relative text-left">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#7C5CFF]/15 flex items-center justify-center text-[#7C5CFF]">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Supabase Integration &amp; Backend Guide</h2>
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
              <span>Status:</span>
              <span className={`inline-flex items-center gap-1 font-medium ${isSupabaseConfigured ? 'text-[#20D9C3]' : 'text-amber-400'}`}>
                {isSupabaseConfigured ? 'Connected to live Supabase backend' : 'Running in High-Fidelity Interactive Demo Mode'}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
          <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-2">
            <h3 className="font-semibold text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#20D9C3]" />
              1. Migration Script Ready
            </h3>
            <p>
              The complete SQL schema with 18+ adult constraints, RLS policies on all 19 tables, WebRTC signaling channels, and storage policies is located in:
            </p>
            <div className="flex items-center justify-between p-2 rounded-lg bg-black/40 border border-white/10 font-mono text-[11px] text-slate-300">
              <span>supabase/migrations/20261008000000_vibetalk_schema.sql</span>
              <button
                onClick={() => copyToClipboard('supabase/migrations/20261008000000_vibetalk_schema.sql', 'path')}
                className="flex items-center gap-1 text-[#7C5CFF] hover:underline ml-2"
              >
                {copiedPath ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedPath ? 'Copied' : 'Copy Path'}
              </button>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-2">
            <h3 className="font-semibold text-white">2. Environment Configuration</h3>
            <p>
              To hook up your live Supabase project, supply your credentials in the environment or <code className="text-[#20D9C3]">.env</code>:
            </p>
            <div className="relative p-2.5 rounded-lg bg-black/50 border border-white/10 font-mono text-[11px] text-slate-300">
              <pre>{envSample}</pre>
              <button
                onClick={() => copyToClipboard(envSample, 'env')}
                className="absolute top-2 right-2 flex items-center gap-1 text-[#7C5CFF] hover:underline"
              >
                {copiedEnv ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedEnv ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-1.5">
            <h3 className="font-semibold text-white">3. Security Architecture Highlights</h3>
            <ul className="list-disc list-inside space-y-1 text-slate-400">
              <li>Strict adult age verification check (<code className="text-slate-300">CHECK (age &gt;= 18)</code>)</li>
              <li>Row Level Security (RLS) enabled on profiles, messages, calls, blocks, and reports</li>
              <li>Private call signaling via ephemeral WebSocket / Realtime presence channels</li>
              <li>No phone numbers or exact GPS locations ever exposed in public discovery queries</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/10 text-white text-xs font-medium hover:bg-white/15 transition-colors"
          >
            Close Guide
          </button>
          <a
            href="https://supabase.com/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#7C5CFF] text-white text-xs font-medium hover:bg-[#6846f3] transition-colors"
          >
            <span>Open Supabase Console</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
