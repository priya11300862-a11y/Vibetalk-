import React, { useState } from 'react';
import {
  X,
  Eye,
  Shield,
  Users,
  Globe2,
  Lock,
  UserCheck,
  UserPlus,
  Share2,
  ShieldAlert,
  Sliders,
  Check,
  Copy,
  MapPin,
  Tag,
  Languages,
  Activity,
  FileText,
  Camera,
  MessageSquare,
  PhoneCall,
  Video,
  UserX,
} from 'lucide-react';
import { UserProfile, UserPreferences } from '../../types';

export type ProfilePreviewMode = 'public' | 'connected' | 'private' | 'normal';

interface ProfileOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  isOwnProfile: boolean;
  preferences: UserPreferences;
  onUpdatePreferences: (prefs: Partial<UserPreferences>) => void;
  previewMode: ProfilePreviewMode;
  onSetPreviewMode: (mode: ProfilePreviewMode) => void;
  isConnected: boolean;
  isPending: boolean;
  isFollowing: boolean;
  onToggleFollow: () => void;
  onSendConnectionRequest: () => void;
  onRemoveConnection: () => void;
  onOpenReportModal: () => void;
  onBlockUser: () => void;
  onOpenInterestPicker?: () => void;
  onOpenChat?: () => void;
  onStartAudioCall?: () => void;
  onStartVideoCall?: () => void;
  profileStyle?: 'aurora' | 'standard';
  onSetProfileStyle?: (style: 'aurora' | 'standard') => void;
}

export const ProfileOptionsModal: React.FC<ProfileOptionsModalProps> = ({
  isOpen,
  onClose,
  profile,
  isOwnProfile,
  preferences,
  onUpdatePreferences,
  previewMode,
  onSetPreviewMode,
  isConnected,
  isPending,
  isFollowing,
  onToggleFollow,
  onSendConnectionRequest,
  onRemoveConnection,
  onOpenReportModal,
  onBlockUser,
  onOpenInterestPicker,
  onOpenChat,
  onStartAudioCall,
  onStartVideoCall,
  profileStyle = 'standard',
  onSetProfileStyle,
}) => {
  const [activeTab, setActiveTab] = useState<'options' | 'visibility' | 'preview'>('options');
  const [copiedLink, setCopiedLink] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState(false);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    const url = `${window.location.origin}/profile/${profile.username || profile.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2500);
      });
    } else {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleUpdate = (updates: Partial<UserPreferences>) => {
    onUpdatePreferences(updates);
    setSaveFeedback(true);
    setTimeout(() => setSaveFeedback(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-3xl bg-white border border-stone-200/90 shadow-2xl text-left overflow-hidden relative">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200/80 bg-[#FAF8F5]/90 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#FF4F9A] to-[#9C7BFF] text-white flex items-center justify-center shadow-xs">
              <Sliders className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                Profile Options
              </h3>
              <p className="text-[11px] text-slate-500">
                {isOwnProfile
                  ? 'Privacy preview, audience controls & settings'
                  : `Interaction options for ${profile.displayName}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-stone-200/60 text-slate-500 hover:text-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Navigation Pills */}
        <div className="px-4 sm:px-5 pt-3 pb-1 border-b border-stone-100 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('options')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'options'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-stone-100 text-slate-600 hover:bg-stone-200/70'
            }`}
          >
            {isOwnProfile ? 'Quick Actions' : 'Social Actions'}
          </button>

          {isOwnProfile && (
            <>
              <button
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'preview'
                    ? 'bg-[#9C7BFF] text-white shadow-xs'
                    : 'bg-stone-100 text-slate-600 hover:bg-stone-200/70'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View As...</span>
              </button>

              <button
                onClick={() => setActiveTab('visibility')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'visibility'
                    ? 'bg-[#FF4F9A] text-white shadow-xs'
                    : 'bg-stone-100 text-slate-600 hover:bg-stone-200/70'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Visibility Controls</span>
              </button>
            </>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 max-h-[70vh] overflow-y-auto space-y-4 text-xs">
          {/* TAB 1: QUICK ACTIONS */}
          {activeTab === 'options' && (
            <div className="space-y-3">
              {isOwnProfile ? (
                <>
                  {/* View profile as preview shortcut */}
                  <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-50 via-pink-50 to-stone-50 border border-purple-200/70 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4 text-[#9C7BFF]" />
                        <span className="font-extrabold text-slate-900">
                          Profile Privacy Preview
                        </span>
                      </div>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-purple-100 text-[#9C7BFF]">
                        Master Feature
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Preview exactly what visitors and connections see on your profile according to your real privacy permissions.
                    </p>
                    <div className="grid grid-cols-3 gap-2 pt-1">
                      <button
                        onClick={() => {
                          onSetPreviewMode('public');
                          onClose();
                        }}
                        className={`p-2 rounded-xl text-center font-bold border transition-all ${
                          previewMode === 'public'
                            ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                            : 'bg-white hover:bg-purple-50/60 border-stone-200 text-slate-800'
                        }`}
                      >
                        🌐 Public
                      </button>
                      <button
                        onClick={() => {
                          onSetPreviewMode('connected');
                          onClose();
                        }}
                        className={`p-2 rounded-xl text-center font-bold border transition-all ${
                          previewMode === 'connected'
                            ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                            : 'bg-white hover:bg-purple-50/60 border-stone-200 text-slate-800'
                        }`}
                      >
                        👥 Connected
                      </button>
                      <button
                        onClick={() => {
                          onSetPreviewMode('private');
                          onClose();
                        }}
                        className={`p-2 rounded-xl text-center font-bold border transition-all ${
                          previewMode === 'private'
                            ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                            : 'bg-white hover:bg-purple-50/60 border-stone-200 text-slate-800'
                        }`}
                      >
                        🔒 Private
                      </button>
                    </div>
                  </div>

                  {/* Profile Layout Design Switcher (Given UI Style option) */}
                  {onSetProfileStyle && (
                    <div className="p-3.5 rounded-2xl bg-gradient-to-r from-cyan-50 via-purple-50 to-pink-50 border border-cyan-200/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-base">✨</span>
                          <span className="font-extrabold text-slate-900">
                            Profile UI Layout Style
                          </span>
                        </div>
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800">
                          {profileStyle === 'aurora' ? 'Given UI Active' : 'Standard Active'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        Switch between the provided futuristic Given UI Design (dark aurora, glowing halo, 3 story cards, cyan message pill, mutual friends) and the Standard International view.
                      </p>
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <button
                          onClick={() => {
                            onSetProfileStyle('aurora');
                            onClose();
                          }}
                          className={`p-2.5 rounded-xl text-center font-bold border transition-all flex flex-col items-center justify-center gap-1 ${
                            profileStyle === 'aurora'
                              ? 'bg-slate-950 text-cyan-300 border-cyan-400 shadow-md ring-2 ring-cyan-400/30'
                              : 'bg-white hover:bg-stone-50 border-stone-200 text-slate-800'
                          }`}
                        >
                          <span className="text-xs font-black">🌟 Given UI Design</span>
                          <span className="text-[9.5px] opacity-80">Aurora &amp; Stories UI</span>
                        </button>
                        <button
                          onClick={() => {
                            onSetProfileStyle('standard');
                            onClose();
                          }}
                          className={`p-2.5 rounded-xl text-center font-bold border transition-all flex flex-col items-center justify-center gap-1 ${
                            profileStyle === 'standard'
                              ? 'bg-purple-600 text-white border-purple-600 shadow-md ring-2 ring-purple-400/30'
                              : 'bg-white hover:bg-stone-50 border-stone-200 text-slate-800'
                          }`}
                        >
                          <span className="text-xs font-black">🌐 Standard View</span>
                          <span className="text-[9.5px] opacity-80">Classic Layout</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Actions List */}
                  <div className="space-y-1.5 pt-1">
                    <button
                      onClick={() => setActiveTab('visibility')}
                      className="w-full p-3 rounded-2xl bg-stone-50 hover:bg-stone-100/80 border border-stone-200/70 flex items-center justify-between text-left transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-pink-100 text-[#FF4F9A] flex items-center justify-center">
                          <Shield className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block">
                            Audience &amp; Visibility Controls
                          </span>
                          <span className="text-[11px] text-slate-500">
                            Configure who can see photo, bio, tags &amp; location
                          </span>
                        </div>
                      </div>
                      <span className="text-slate-400 font-bold">›</span>
                    </button>

                    {onOpenInterestPicker && (
                      <button
                        onClick={() => {
                          onClose();
                          onOpenInterestPicker();
                        }}
                        className="w-full p-3 rounded-2xl bg-stone-50 hover:bg-stone-100/80 border border-stone-200/70 flex items-center justify-between text-left transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-cyan-100 text-[#20D9C3] flex items-center justify-center">
                            <Tag className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block">
                              Manage Interest Tags
                            </span>
                            <span className="text-[11px] text-slate-500">
                              Update topic preferences &amp; social matching keywords
                            </span>
                          </div>
                        </div>
                        <span className="text-slate-400 font-bold">›</span>
                      </button>
                    )}

                    <button
                      onClick={handleCopyLink}
                      className="w-full p-3 rounded-2xl bg-stone-50 hover:bg-stone-100/80 border border-stone-200/70 flex items-center justify-between text-left transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                          {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block">
                            {copiedLink ? 'Link Copied to Clipboard!' : 'Share Profile Link'}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            Copy international web profile URL
                          </span>
                        </div>
                      </div>
                      <span className="text-slate-400 font-bold">🔗</span>
                    </button>
                  </div>
                </>
              ) : (
                /* OTHER USER PROFILE ACTIONS */
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    {/* Connect / Request */}
                    <button
                      onClick={isConnected ? onRemoveConnection : onSendConnectionRequest}
                      className={`p-3 rounded-2xl border font-bold flex items-center justify-center gap-2 transition-all ${
                        isConnected
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                          : isPending
                          ? 'bg-amber-50 border-amber-300 text-amber-800'
                          : 'bg-[#9C7BFF] hover:bg-[#8B65FF] text-white border-transparent shadow-xs'
                      }`}
                    >
                      {isConnected ? (
                        <>
                          <UserCheck className="w-4 h-4" />
                          <span>Connected</span>
                        </>
                      ) : isPending ? (
                        <span>Pending Request</span>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4" />
                          <span>Connect</span>
                        </>
                      )}
                    </button>

                    {/* Follow / Unfollow */}
                    <button
                      onClick={onToggleFollow}
                      className={`p-3 rounded-2xl border font-bold flex items-center justify-center gap-2 transition-all ${
                        isFollowing
                          ? 'bg-stone-100 border-stone-300 text-slate-800'
                          : 'bg-white hover:bg-stone-50 border-stone-200 text-slate-800 shadow-xs'
                      }`}
                    >
                      {isFollowing ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-600" />
                          <span>Following</span>
                        </>
                      ) : (
                        <span>+ Follow</span>
                      )}
                    </button>
                  </div>

                  {/* Message & Calling Shortcuts */}
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    {onOpenChat && (
                      <button
                        onClick={() => {
                          onClose();
                          onOpenChat();
                        }}
                        className="p-2.5 rounded-xl bg-pink-50 hover:bg-pink-100/70 border border-pink-200 text-[#FF4F9A] font-bold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Chat</span>
                      </button>
                    )}
                    {onStartAudioCall && (
                      <button
                        onClick={() => {
                          onClose();
                          onStartAudioCall();
                        }}
                        className="p-2.5 rounded-xl bg-cyan-50 hover:bg-cyan-100/70 border border-cyan-200 text-cyan-700 font-bold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                        <span>Call</span>
                      </button>
                    )}
                    {onStartVideoCall && (
                      <button
                        onClick={() => {
                          onClose();
                          onStartVideoCall();
                        }}
                        className="p-2.5 rounded-xl bg-purple-50 hover:bg-purple-100/70 border border-purple-200 text-purple-700 font-bold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>Video</span>
                      </button>
                    )}
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-stone-200/80">
                    {onSetProfileStyle && (
                      <button
                        onClick={() => {
                          onSetProfileStyle(profileStyle === 'aurora' ? 'standard' : 'aurora');
                          onClose();
                        }}
                        className="w-full p-2.5 rounded-xl bg-gradient-to-r from-cyan-50 to-purple-50 hover:from-cyan-100 hover:to-purple-100 border border-cyan-200/80 flex items-center justify-between text-left font-semibold text-slate-800 transition-colors"
                      >
                        <span className="flex items-center gap-2">
                          <span className="text-sm">✨</span>
                          <span>View in {profileStyle === 'aurora' ? 'Standard UI' : 'Given UI Style (Aurora)'}</span>
                        </span>
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800">
                          {profileStyle === 'aurora' ? 'Standard' : 'Given UI'}
                        </span>
                      </button>
                    )}

                    <button
                      onClick={handleCopyLink}
                      className="w-full p-2.5 rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-200/70 flex items-center justify-between text-left font-semibold text-slate-700"
                    >
                      <span className="flex items-center gap-2">
                        <Share2 className="w-4 h-4 text-slate-500" />
                        <span>{copiedLink ? 'Link Copied!' : 'Share Profile'}</span>
                      </span>
                      <span className="text-[11px] text-slate-400">Copy URL</span>
                    </button>

                    <button
                      onClick={() => {
                        onClose();
                        onBlockUser();
                      }}
                      className="w-full p-2.5 rounded-xl bg-rose-50 hover:bg-rose-100/70 border border-rose-200 flex items-center gap-2 text-rose-700 font-semibold"
                    >
                      <UserX className="w-4 h-4" />
                      <span>Block {profile.displayName}</span>
                    </button>

                    <button
                      onClick={() => {
                        onClose();
                        onOpenReportModal();
                      }}
                      className="w-full p-2.5 rounded-xl bg-rose-50 hover:bg-rose-100/70 border border-rose-200 flex items-center gap-2 text-rose-700 font-semibold"
                    >
                      <ShieldAlert className="w-4 h-4" />
                      <span>Report Inappropriate Behavior</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PROFILE PRIVACY PREVIEW ("View my profile as...") */}
          {activeTab === 'preview' && isOwnProfile && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-200 text-slate-800 space-y-1">
                <h4 className="font-extrabold text-sm text-purple-900 flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-[#9C7BFF]" />
                  <span>"View my profile as..." Preview Modes</span>
                </h4>
                <p className="text-[11px] text-purple-800/80 leading-relaxed">
                  Toggle audience perspectives to verify what information is visible based on your custom visibility controls below.
                </p>
              </div>

              {/* Mode 1: Public Visitor */}
              <div
                onClick={() => onSetPreviewMode('public')}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  previewMode === 'public'
                    ? 'bg-purple-50/90 border-[#9C7BFF] ring-2 ring-[#9C7BFF]/30 shadow-xs'
                    : 'bg-white hover:bg-stone-50 border-stone-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base">🌐</span>
                    <span className="font-extrabold text-slate-900 text-sm">
                      Public Visitor
                    </span>
                  </div>
                  {previewMode === 'public' && (
                    <span className="px-2 py-0.5 rounded-full bg-purple-600 text-white font-bold text-[10px]">
                      Active Mode
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  Simulates a non-connected visitor who lands on your profile. Only publicly shared bio, broad location, and public tags appear.
                </p>
              </div>

              {/* Mode 2: Connected User */}
              <div
                onClick={() => onSetPreviewMode('connected')}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  previewMode === 'connected'
                    ? 'bg-purple-50/90 border-[#9C7BFF] ring-2 ring-[#9C7BFF]/30 shadow-xs'
                    : 'bg-white hover:bg-stone-50 border-stone-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base">👥</span>
                    <span className="font-extrabold text-slate-900 text-sm">
                      Connected User
                    </span>
                  </div>
                  {previewMode === 'connected' && (
                    <span className="px-2 py-0.5 rounded-full bg-purple-600 text-white font-bold text-[10px]">
                      Active Mode
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  Simulates an accepted friend or connected member. Unlocks items configured for "Connections Only", including verified badges and shared interests.
                </p>
              </div>

              {/* Mode 3: Private View */}
              <div
                onClick={() => onSetPreviewMode('private')}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  previewMode === 'private'
                    ? 'bg-purple-50/90 border-[#9C7BFF] ring-2 ring-[#9C7BFF]/30 shadow-xs'
                    : 'bg-white hover:bg-stone-50 border-stone-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base">🔒</span>
                    <span className="font-extrabold text-slate-900 text-sm">
                      Private View (Account Owner)
                    </span>
                  </div>
                  {previewMode === 'private' && (
                    <span className="px-2 py-0.5 rounded-full bg-purple-600 text-white font-bold text-[10px]">
                      Active Mode
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  Full owner view showing every detail, private status beacons, edit controls, and account management tools.
                </p>
              </div>

              {/* Apply & Close */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => {
                    onSetPreviewMode(previewMode === 'normal' ? 'public' : previewMode);
                    onClose();
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs"
                >
                  Apply &amp; Inspect Profile
                </button>
                {previewMode !== 'normal' && (
                  <button
                    onClick={() => {
                      onSetPreviewMode('normal');
                      onClose();
                    }}
                    className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-slate-700 font-bold text-xs"
                  >
                    Reset Normal View
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: VISIBILITY CONTROLS */}
          {activeTab === 'visibility' && isOwnProfile && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-1 border-b border-stone-100">
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">
                    Field-by-Field Visibility
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Decide exactly what each audience tier can see on your profile.
                  </p>
                </div>
                {saveFeedback && (
                  <span className="text-emerald-600 font-bold text-xs animate-in fade-in flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    Saved
                  </span>
                )}
              </div>

              {/* 1. Profile Visibility */}
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/70 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Globe2 className="w-4 h-4 text-slate-600" />
                  <div>
                    <span className="font-bold text-slate-900 block">Overall Profile Visibility</span>
                    <span className="text-[10.5px] text-slate-500">Who can search &amp; discover your page</span>
                  </div>
                </div>
                <select
                  value={preferences.profileVisibility || 'public'}
                  onChange={(e) => handleUpdate({ profileVisibility: e.target.value as any })}
                  className="px-2.5 py-1.5 rounded-lg bg-white border border-stone-200 text-slate-800 text-xs font-semibold shadow-xs"
                >
                  <option value="public">Public</option>
                  <option value="connections">Connections Only</option>
                  <option value="private">Private</option>
                </select>
              </div>

              {/* 2. Profile Photo */}
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/70 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Camera className="w-4 h-4 text-[#FF4F9A]" />
                  <div>
                    <span className="font-bold text-slate-900 block">Profile Photo</span>
                    <span className="text-[10.5px] text-slate-500">Avatar visibility on social roster</span>
                  </div>
                </div>
                <select
                  value={preferences.photoVisibility || 'everyone'}
                  onChange={(e) => handleUpdate({ photoVisibility: e.target.value as any })}
                  className="px-2.5 py-1.5 rounded-lg bg-white border border-stone-200 text-slate-800 text-xs font-semibold shadow-xs"
                >
                  <option value="everyone">Everyone</option>
                  <option value="connections">Connections Only</option>
                  <option value="hidden">Hidden Silhouette</option>
                </select>
              </div>

              {/* 3. Bio & Description */}
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/70 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-[#9C7BFF]" />
                  <div>
                    <span className="font-bold text-slate-900 block">Bio &amp; About Text</span>
                    <span className="text-[10.5px] text-slate-500">Personal philosophy &amp; intro notes</span>
                  </div>
                </div>
                <select
                  value={preferences.bioVisibility || 'everyone'}
                  onChange={(e) => handleUpdate({ bioVisibility: e.target.value as any })}
                  className="px-2.5 py-1.5 rounded-lg bg-white border border-stone-200 text-slate-800 text-xs font-semibold shadow-xs"
                >
                  <option value="everyone">Everyone</option>
                  <option value="connections">Connections Only</option>
                  <option value="hidden">Hidden</option>
                </select>
              </div>

              {/* 4. Interests & Tags */}
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/70 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Tag className="w-4 h-4 text-amber-500" />
                  <div>
                    <span className="font-bold text-slate-900 block">Interest Tags</span>
                    <span className="text-[10.5px] text-slate-500">Interests used for social discovery match</span>
                  </div>
                </div>
                <select
                  value={preferences.interestsVisibility || 'everyone'}
                  onChange={(e) => handleUpdate({ interestsVisibility: e.target.value as any })}
                  className="px-2.5 py-1.5 rounded-lg bg-white border border-stone-200 text-slate-800 text-xs font-semibold shadow-xs"
                >
                  <option value="everyone">Everyone</option>
                  <option value="connections">Connections Only</option>
                  <option value="hidden">Hidden</option>
                </select>
              </div>

              {/* 5. Spoken Languages */}
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/70 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Languages className="w-4 h-4 text-[#20D9C3]" />
                  <div>
                    <span className="font-bold text-slate-900 block">Languages</span>
                    <span className="text-[10.5px] text-slate-500">Display spoken international tongues</span>
                  </div>
                </div>
                <select
                  value={preferences.languagesVisibility || 'everyone'}
                  onChange={(e) => handleUpdate({ languagesVisibility: e.target.value as any })}
                  className="px-2.5 py-1.5 rounded-lg bg-white border border-stone-200 text-slate-800 text-xs font-semibold shadow-xs"
                >
                  <option value="everyone">Everyone</option>
                  <option value="connections">Connections Only</option>
                  <option value="hidden">Hidden</option>
                </select>
              </div>

              {/* 6. Approximate Location */}
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/70 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-rose-500" />
                  <div>
                    <span className="font-bold text-slate-900 block">Approximate Location</span>
                    <span className="text-[10.5px] text-slate-500">Never exposes exact GPS, only country/region</span>
                  </div>
                </div>
                <select
                  value={preferences.locationVisibility || 'approximate'}
                  onChange={(e) => handleUpdate({ locationVisibility: e.target.value as any })}
                  className="px-2.5 py-1.5 rounded-lg bg-white border border-stone-200 text-slate-800 text-xs font-semibold shadow-xs"
                >
                  <option value="approximate">Country Only</option>
                  <option value="shared">Country &amp; Region</option>
                  <option value="hidden">Hidden</option>
                </select>
              </div>

              {/* 7. Activity & Online Status */}
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/70 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Activity className="w-4 h-4 text-emerald-500" />
                  <div>
                    <span className="font-bold text-slate-900 block">Online &amp; Activity Status</span>
                    <span className="text-[10.5px] text-slate-500">Live availability beacon &amp; last active time</span>
                  </div>
                </div>
                <select
                  value={preferences.activityVisibility || 'everyone'}
                  onChange={(e) => handleUpdate({ activityVisibility: e.target.value as any })}
                  className="px-2.5 py-1.5 rounded-lg bg-white border border-stone-200 text-slate-800 text-xs font-semibold shadow-xs"
                >
                  <option value="everyone">Everyone</option>
                  <option value="connections">Connections Only</option>
                  <option value="nobody">Nobody</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 bg-stone-50 border-t border-stone-200/80 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            {isOwnProfile ? 'All privacy settings persist automatically' : 'VibeTalk Trust & Safety Protocol'}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
