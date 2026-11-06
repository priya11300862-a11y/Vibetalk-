import React, { useState, useEffect } from 'react';
import { Database, Copy, Check, ExternalLink, X, ShieldCheck, Smartphone, Key, Lock } from 'lucide-react';
import { isSupabaseConfigured } from '../../lib/supabase';

interface SupabaseSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseSetupModal: React.FC<SupabaseSetupModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'minimoth' | 'supabase'>('minimoth');
  const [copiedEnv, setCopiedEnv] = useState(false);
  const [copiedMiniMothEnv, setCopiedMiniMothEnv] = useState(false);
  const [copiedPath, setCopiedPath] = useState(false);
  const [minimothStatus, setMinimothStatus] = useState<{
    configured: boolean;
    mode: string;
    prefix: string | null;
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/health')
        .then((res) => res.json())
        .then((data) => {
          if (data?.minimoth) {
            setMinimothStatus(data.minimoth);
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const envSample = `VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-publishable-key"`;

  const miniMothEnvSample = `# Set in server environment (.env)
MINIMOTH_API_KEY="mm_test_your_key_here"  # For sandbox testing
# MINIMOTH_API_KEY="mm_live_your_key_here" # For live production`;

  const copyToClipboard = (text: string, type: 'env' | 'path' | 'minimoth') => {
    navigator.clipboard.writeText(text);
    if (type === 'env') {
      setCopiedEnv(true);
      setTimeout(() => setCopiedEnv(false), 2000);
    } else if (type === 'minimoth') {
      setCopiedMiniMothEnv(true);
      setTimeout(() => setCopiedMiniMothEnv(false), 2000);
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
          className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#7C5CFF]/15 flex items-center justify-center text-[#7C5CFF]">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">VibeTalk Backend &amp; Auth Architecture</h2>
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
              <span>OTP Provider:</span>
              <span className="inline-flex items-center gap-1 font-semibold text-[#20D9C3]">
                <Smartphone className="w-3.5 h-3.5" />
                MiniMoth Mobile OTP ({minimothStatus?.mode || 'active'})
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-2 mb-4">
          <button
            onClick={() => setActiveTab('minimoth')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'minimoth'
                ? 'bg-[#7C5CFF] text-white shadow-xs'
                : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>MiniMoth Mobile OTP (Primary)</span>
          </button>
          <button
            onClick={() => setActiveTab('supabase')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'supabase'
                ? 'bg-[#7C5CFF] text-white shadow-xs'
                : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Supabase Database (Optional)</span>
          </button>
        </div>

        {activeTab === 'minimoth' ? (
          <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#20D9C3]" />
                  <span>MiniMoth Integration Status</span>
                </h3>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    minimothStatus?.configured
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {minimothStatus?.configured
                    ? `Configured (${minimothStatus.mode.toUpperCase()})`
                    : 'Awaiting MINIMOTH_API_KEY in .env'}
                </span>
              </div>
              <p className="text-slate-400">
                All phone OTP traffic is routed through the secure server backend proxy endpoints (
                <code className="text-[#20D9C3]">/api/otp/send</code> and{' '}
                <code className="text-[#20D9C3]">/api/otp/verify</code>). The MiniMoth API key is
                strictly kept on the server and never sent to browser clients.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-2">
              <h3 className="font-semibold text-white flex items-center gap-1.5">
                <Key className="w-4 h-4 text-amber-400" />
                <span>Environment Configuration</span>
              </h3>
              <p>
                Add your MiniMoth key to <code className="text-[#20D9C3]">.env</code>:
              </p>
              <div className="relative p-2.5 rounded-lg bg-black/50 border border-white/10 font-mono text-[11px] text-slate-300">
                <pre>{miniMothEnvSample}</pre>
                <button
                  onClick={() => copyToClipboard(miniMothEnvSample, 'minimoth')}
                  className="absolute top-2 right-2 flex items-center gap-1 text-[#7C5CFF] hover:underline cursor-pointer"
                >
                  {copiedMiniMothEnv ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedMiniMothEnv ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-1.5">
              <h3 className="font-semibold text-white flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-[#7C5CFF]" />
                <span>Security &amp; Abuse Prevention Highlights</span>
              </h3>
              <ul className="list-disc list-inside space-y-1 text-slate-400">
                <li>
                  <strong>Server-Side Only Secrets:</strong> Client code never touches or bundles{' '}
                  <code className="text-slate-200">MINIMOTH_API_KEY</code>.
                </li>
                <li>
                  <strong>Rate Limiting &amp; Anti-Spam:</strong> 25-second cooldown between send
                  requests per number, max 6 sends per 10-minute window.
                </li>
                <li>
                  <strong>Lockout Protection:</strong> 5 failed OTP attempts trigger an automatic
                  cooldown.
                </li>
                <li>
                  <strong>No Plaintext Token Logging:</strong> OTP codes, identity tokens, and auth
                  keys are never logged to console or stdout.
                </li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-2">
              <h3 className="font-semibold text-white flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#20D9C3]" />
                <span>1. Migration Script Ready</span>
              </h3>
              <p>
                The complete SQL schema with 18+ adult constraints, RLS policies, WebRTC signaling channels, and storage policies is located in:
              </p>
              <div className="flex items-center justify-between p-2 rounded-lg bg-black/40 border border-white/10 font-mono text-[11px] text-slate-300">
                <span>supabase/migrations/20261008000000_vibetalk_schema.sql</span>
                <button
                  onClick={() =>
                    copyToClipboard(
                      'supabase/migrations/20261008000000_vibetalk_schema.sql',
                      'path'
                    )
                  }
                  className="flex items-center gap-1 text-[#7C5CFF] hover:underline ml-2 cursor-pointer"
                >
                  {copiedPath ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedPath ? 'Copied' : 'Copy Path'}
                </button>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-2">
              <h3 className="font-semibold text-white">2. Environment Configuration</h3>
              <p>
                To hook up your live Supabase project, supply your credentials in <code className="text-[#20D9C3]">.env</code>:
              </p>
              <div className="relative p-2.5 rounded-lg bg-black/50 border border-white/10 font-mono text-[11px] text-slate-300">
                <pre>{envSample}</pre>
                <button
                  onClick={() => copyToClipboard(envSample, 'env')}
                  className="absolute top-2 right-2 flex items-center gap-1 text-[#7C5CFF] hover:underline cursor-pointer"
                >
                  {copiedEnv ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedEnv ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/10 text-white text-xs font-medium hover:bg-white/15 transition-colors cursor-pointer"
          >
            Close Guide
          </button>
          <a
            href="https://minimoth.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#7C5CFF] text-white text-xs font-medium hover:bg-[#6846f3] transition-colors"
          >
            <span>Open MiniMoth Dashboard</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
