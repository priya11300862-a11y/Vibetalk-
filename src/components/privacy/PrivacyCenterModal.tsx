import React, { useState } from 'react';
import {
  X,
  Shield,
  Download,
  Trash2,
  Eye,
  EyeOff,
  UserX,
  MessageSquare,
  PhoneCall,
  Video,
  Check,
} from 'lucide-react';
import { useSocial } from '../../contexts/SocialContext';
import { useAuth } from '../../contexts/AuthContext';

interface PrivacyCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyCenterModal: React.FC<PrivacyCenterModalProps> = ({ isOpen, onClose }) => {
  const { preferences, updatePreferences, blockedUserIds, unblockUser, downloadMyData } = useSocial();
  const { logout } = useAuth();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen) return null;

  const handleDownload = () => {
    downloadMyData();
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  const handleDeleteAccount = () => {
    logout();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-3xl bg-[#101722] border border-[#7C5CFF]/30 p-6 sm:p-8 shadow-2xl relative text-left">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#7C5CFF]/15 text-[#7C5CFF] flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Privacy Center</h2>
            <p className="text-xs text-slate-400">
              Manage your visibility, communication boundaries, and personal data archive.
            </p>
          </div>
        </div>

        <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 text-xs">
          {/* Presence & Receipts */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider text-slate-400">
              Presence &amp; Activity
            </h3>

            <div className="flex items-center justify-between py-1">
              <div>
                <span className="font-semibold text-white">Show Online Status</span>
                <p className="text-[11px] text-slate-400">Let connections know when you are active.</p>
              </div>
              <input
                type="checkbox"
                checked={preferences.showOnlineStatus}
                onChange={(e) => updatePreferences({ showOnlineStatus: e.target.checked })}
                className="w-4 h-4 rounded bg-black/40 border-white/20 text-[#7C5CFF]"
              />
            </div>

            <div className="flex items-center justify-between py-1 border-t border-white/[0.04]">
              <div>
                <span className="font-semibold text-white">Read Receipts</span>
                <p className="text-[11px] text-slate-400">Show double-check marks when messages are viewed.</p>
              </div>
              <input
                type="checkbox"
                checked={preferences.readReceipts}
                onChange={(e) => updatePreferences({ readReceipts: e.target.checked })}
                className="w-4 h-4 rounded bg-black/40 border-white/20 text-[#7C5CFF]"
              />
            </div>

            <div className="flex items-center justify-between py-1 border-t border-white/[0.04]">
              <div>
                <span className="font-semibold text-white">Typing Indicator</span>
                <p className="text-[11px] text-slate-400">Display animated typing indicator while drafting.</p>
              </div>
              <input
                type="checkbox"
                checked={preferences.typingIndicator}
                onChange={(e) => updatePreferences({ typingIndicator: e.target.checked })}
                className="w-4 h-4 rounded bg-black/40 border-white/20 text-[#7C5CFF]"
              />
            </div>
          </div>

          {/* Profile Visibility & Discovery */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider text-slate-400">
              Profile &amp; Discovery Visibility
            </h3>

            <div className="flex items-center justify-between py-1">
              <div>
                <span className="font-semibold text-white">Profile Visibility</span>
                <p className="text-[11px] text-slate-400">Control who can discover and view your full profile.</p>
              </div>
              <select
                value={preferences.profileVisibility || 'public'}
                onChange={(e) => updatePreferences({ profileVisibility: e.target.value as any })}
                className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
              >
                <option value="public">Public</option>
                <option value="connections">Connections Only</option>
                <option value="private">Private</option>
              </select>
            </div>

            <div className="flex items-center justify-between py-1 border-t border-white/[0.04]">
              <div>
                <span className="font-semibold text-white">Allow Social Discovery</span>
                <p className="text-[11px] text-slate-400">Appear in the Discover People directory and matching feed.</p>
              </div>
              <input
                type="checkbox"
                checked={preferences.allowDiscovery}
                onChange={(e) => updatePreferences({ allowDiscovery: e.target.checked })}
                className="w-4 h-4 rounded bg-black/40 border-white/20 text-[#7C5CFF]"
              />
            </div>

            <div className="flex items-center justify-between py-1 border-t border-white/[0.04]">
              <div>
                <span className="font-semibold text-white">Location Privacy</span>
                <p className="text-[11px] text-slate-400">Never exposes exact GPS coordinates.</p>
              </div>
              <select
                value={preferences.locationVisibility || 'approximate'}
                onChange={(e) => updatePreferences({ locationVisibility: e.target.value as any })}
                className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
              >
                <option value="approximate">Country Only</option>
                <option value="shared">Approximate Region</option>
                <option value="hidden">Hidden</option>
              </select>
            </div>
          </div>

          {/* Communication Boundaries */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Communication Permissions
            </h3>

            <div className="flex items-center justify-between py-1">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#7C5CFF]" />
                <div>
                  <span className="font-semibold text-white">Who Can Message Me</span>
                  <p className="text-[11px] text-slate-400">Control incoming direct messages.</p>
                </div>
              </div>
              <select
                value={preferences.whoCanMessage}
                onChange={(e) => updatePreferences({ whoCanMessage: e.target.value as any })}
                className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
              >
                <option value="all">Everyone</option>
                <option value="connections">Connections Only</option>
                <option value="verified">Verified Adults Only</option>
              </select>
            </div>

            <div className="flex items-center justify-between py-1 border-t border-white/[0.04]">
              <div className="flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-[#20D9C3]" />
                <div>
                  <span className="font-semibold text-white">Who Can Voice Call Me</span>
                  <p className="text-[11px] text-slate-400">Limit incoming WebRTC audio requests.</p>
                </div>
              </div>
              <select
                value={preferences.whoCanCall}
                onChange={(e) => updatePreferences({ whoCanCall: e.target.value as any })}
                className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
              >
                <option value="all">Everyone</option>
                <option value="connections">Connections Only</option>
                <option value="nobody">Nobody</option>
              </select>
            </div>

            <div className="flex items-center justify-between py-1 border-t border-white/[0.04]">
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4 text-[#FF4F9A]" />
                <div>
                  <span className="font-semibold text-white">Who Can Video Call Me</span>
                  <p className="text-[11px] text-slate-400">Limit incoming WebRTC video requests.</p>
                </div>
              </div>
              <select
                value={preferences.whoCanVideoCall}
                onChange={(e) => updatePreferences({ whoCanVideoCall: e.target.value as any })}
                className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
              >
                <option value="all">Everyone</option>
                <option value="connections">Connections Only</option>
                <option value="nobody">Nobody</option>
              </select>
            </div>
          </div>

          {/* Blocked Users */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Blocked Users</span>
              <span className="font-mono">({blockedUserIds.length})</span>
            </h3>
            {blockedUserIds.length === 0 ? (
              <p className="text-[11px] text-slate-500">You haven’t blocked any members.</p>
            ) : (
              <div className="space-y-1.5">
                {blockedUserIds.map((id) => (
                  <div
                    key={id}
                    className="flex items-center justify-between p-2 rounded-lg bg-black/30 border border-white/5"
                  >
                    <span className="text-[11px] font-mono text-slate-300">User ID: {id}</span>
                    <button
                      onClick={() => unblockUser(id)}
                      className="text-[10px] text-[#20D9C3] hover:underline"
                    >
                      Unblock
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Data Archive & Account Deletion */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Data Sovereignty
            </h3>
            <p className="text-[11px] text-slate-400">
              In accordance with international privacy principles, you have complete control over your data.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                onClick={handleDownload}
                className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/10 text-white font-semibold flex items-center gap-1.5 transition-colors"
              >
                {downloadSuccess ? <Check className="w-3.5 h-3.5 text-[#20D9C3]" /> : <Download className="w-3.5 h-3.5" />}
                <span>{downloadSuccess ? 'Downloaded Data JSON' : 'Download My Data'}</span>
              </button>

              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete My Account</span>
              </button>
            </div>

            {showDeleteConfirm && (
              <div className="mt-3 p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 space-y-2">
                <span className="font-bold text-rose-300">Are you absolutely sure?</span>
                <p className="text-[11px] text-rose-200 leading-relaxed">
                  Permanently deleting your account wipes all conversation history, connection logs, media references, and active subscriptions. This cannot be undone.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={handleDeleteAccount}
                    className="px-3 py-1.5 rounded-lg bg-rose-600 text-white font-semibold hover:bg-rose-700"
                  >
                    Confirm Deletion
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-3 py-1.5 rounded-lg bg-white/10 text-white hover:bg-white/15"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#7C5CFF] text-white text-xs font-semibold hover:bg-[#6846f3] transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
