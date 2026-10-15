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
  Sun,
  Globe,
} from 'lucide-react';
import { useSocial } from '../../contexts/SocialContext';
import { useAuth } from '../../contexts/AuthContext';
import { useI18n } from '../../contexts/I18nContext';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import { SupportedLanguage } from '../../i18n/translations';

interface PrivacyCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyCenterModal: React.FC<PrivacyCenterModalProps> = ({ isOpen, onClose }) => {
  const { preferences, updatePreferences, blockedUserIds, unblockUser, downloadMyData } = useSocial();
  const { logout } = useAuth();
  const { language, setLanguage, availableLanguages, t } = useI18n();
  const { isHighContrast, toggleHighContrast } = useAccessibility();

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
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="privacy-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto"
    >
      <div
        className={`w-full max-w-2xl rounded-xl border p-5 sm:p-7 shadow-xl relative text-left transition-colors ${
          isHighContrast
            ? 'bg-black border-white text-white'
            : 'bg-white border-[#E1E5EC] text-[#303641]'
        }`}
      >
        <button
          onClick={onClose}
          aria-label={t('a11y.closeDialog')}
          className={`absolute top-5 right-5 transition-colors p-1 rounded-lg ${
            isHighContrast
              ? 'text-white hover:text-yellow-300'
              : 'text-[#7B8492] hover:text-[#303641]'
          }`}
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-lg bg-[#EAF2FF] text-[#1877F2] flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <h2 id="privacy-modal-title" className="text-lg font-bold text-[#303641] tracking-tight">
              {t('privacy.heading')}
            </h2>
            <p className="text-xs text-[#7B8492]">
              Manage visibility, accessibility settings, and personal data archive.
            </p>
          </div>
        </div>

        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1 text-xs">
          {/* Accessibility & Language (WCAG AA) */}
          <div className="p-3.5 rounded-lg bg-[#F5F7FC] border border-[#E1E5EC] space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#303641] flex items-center gap-2">
                <Sun className="w-4 h-4 text-[#F28C28]" aria-hidden="true" />
                <span>{t('contrast.title')}</span>
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F0FDF4] text-[#16865C] border border-[#16865C]/30">
                {t('contrast.wcagBadge')}
              </span>
            </div>

            {/* High Contrast Mode Toggle */}
            <div className="flex items-center justify-between py-1">
              <div className="pr-4">
                <span className="font-semibold text-[#303641] text-xs flex items-center gap-2">
                  <span>{t('contrast.label')}</span>
                  {isHighContrast && (
                    <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-yellow-400 text-black font-bold">
                      ACTIVE
                    </span>
                  )}
                </span>
                <p className="text-[11px] text-[#7B8492] mt-0.5 leading-relaxed">
                  {t('contrast.desc')}
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={isHighContrast}
                onClick={toggleHighContrast}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden focus:ring-2 focus:ring-[#1877F2] ${
                  isHighContrast ? 'bg-yellow-400' : 'bg-[#CBD5E1]'
                }`}
              >
                <span className="sr-only">{t('a11y.toggleHighContrast')}</span>
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    isHighContrast ? 'translate-x-5 !bg-black' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Language Selector */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-[#E1E5EC]">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#1877F2]" aria-hidden="true" />
                <div>
                  <span className="font-semibold text-[#303641]">{t('language.selectTitle')}</span>
                  <p className="text-[11px] text-[#7B8492]">
                    Toggle between English, Telugu, Tamil, Hindi, Malayalam, and more.
                  </p>
                </div>
              </div>
              <select
                aria-label={t('language.selectTitle')}
                value={language}
                onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
                className="px-3 py-1.5 rounded-lg bg-white border border-[#E1E5EC] text-[#303641] text-xs font-medium focus:ring-2 focus:ring-[#1877F2] focus:outline-hidden"
              >
                {availableLanguages.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.nativeName} ({l.name})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Presence & Receipts */}
          <div className="p-3.5 rounded-lg bg-[#F5F7FC] border border-[#E1E5EC] space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#303641]">
              Presence &amp; Activity
            </h3>

            <div className="flex items-center justify-between py-1">
              <div>
                <span className="font-semibold text-[#303641]">Active Online Status</span>
                <p className="text-[11px] text-[#7B8492]">Show other members when you are active on VibeTalk</p>
              </div>
              <select
                value={preferences.activityVisibility}
                onChange={(e) => updatePreferences({ activityVisibility: e.target.value as any })}
                className="px-2.5 py-1 rounded-lg bg-white border border-[#E1E5EC] text-[#303641] text-xs font-medium"
              >
                <option value="everyone">Everyone</option>
                <option value="connections">Approved Connections Only</option>
                <option value="nobody">Nobody (Invisible)</option>
              </select>
            </div>

            <div className="flex items-center justify-between py-1 border-t border-[#E1E5EC]">
              <div>
                <span className="font-semibold text-[#303641]">Read Receipts</span>
                <p className="text-[11px] text-[#7B8492]">Let contacts know when you have read their messages</p>
              </div>
              <button
                type="button"
                onClick={() => updatePreferences({ readReceipts: !preferences.readReceipts })}
                className={`w-9 h-5 rounded-full transition-colors relative ${
                  preferences.readReceipts ? 'bg-[#1877F2]' : 'bg-[#CBD5E1]'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                    preferences.readReceipts ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Visibility Controls */}
          <div className="p-3.5 rounded-lg bg-[#F5F7FC] border border-[#E1E5EC] space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#303641]">
              Profile Visibility
            </h3>

            <div className="flex items-center justify-between py-1">
              <div>
                <span className="font-semibold text-[#303641]">Bio Visibility</span>
                <p className="text-[11px] text-[#7B8492]">Who can view your bio description</p>
              </div>
              <select
                value={preferences.bioVisibility}
                onChange={(e) => updatePreferences({ bioVisibility: e.target.value as any })}
                className="px-2.5 py-1 rounded-lg bg-white border border-[#E1E5EC] text-[#303641] text-xs font-medium"
              >
                <option value="everyone">Everyone</option>
                <option value="connections">Connections Only</option>
                <option value="hidden">Hidden</option>
              </select>
            </div>

            <div className="flex items-center justify-between py-1 border-t border-[#E1E5EC]">
              <div>
                <span className="font-semibold text-[#303641]">Approximate Location</span>
                <p className="text-[11px] text-[#7B8492]">Show broad city or country for discovery</p>
              </div>
              <button
                type="button"
                onClick={() => updatePreferences({ showBroadLocation: !preferences.showBroadLocation })}
                className={`w-9 h-5 rounded-full transition-colors relative ${
                  preferences.showBroadLocation ? 'bg-[#1877F2]' : 'bg-[#CBD5E1]'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                    preferences.showBroadLocation ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Blocked Users */}
          <div className="p-3.5 rounded-lg bg-[#F5F7FC] border border-[#E1E5EC] space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#303641]">
              Blocked Accounts ({blockedUserIds.length})
            </h3>
            {blockedUserIds.length === 0 ? (
              <p className="text-[#7B8492] text-[11px]">You have not blocked any users.</p>
            ) : (
              <div className="space-y-1.5">
                {blockedUserIds.map((userId) => (
                  <div key={userId} className="flex items-center justify-between py-1 px-2.5 rounded-md bg-white border border-[#E1E5EC]">
                    <span className="font-medium text-[#303641]">{userId}</span>
                    <button
                      onClick={() => unblockUser(userId)}
                      className="text-[#1877F2] hover:underline font-semibold text-[11px]"
                    >
                      Unblock
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Export Data & Account deletion */}
          <div className="p-3.5 rounded-lg bg-[#F5F7FC] border border-[#E1E5EC] space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#303641]">
              Data Archive &amp; Privacy Rights
            </h3>
            <p className="text-[11px] text-[#7B8492] leading-relaxed">
              Export all your conversations, settings, and profile info in standard machine-readable JSON format.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                onClick={handleDownload}
                className="px-3 py-1.5 rounded-lg bg-white border border-[#E1E5EC] hover:bg-[#F5F7FC] text-[#303641] font-medium flex items-center gap-1.5 transition-colors"
              >
                {downloadSuccess ? <Check className="w-3.5 h-3.5 text-[#16865C]" /> : <Download className="w-3.5 h-3.5" />}
                <span>{downloadSuccess ? 'Downloaded Data JSON' : 'Download My Data'}</span>
              </button>

              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-[#D9485F] font-medium flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Account</span>
              </button>
            </div>

            {showDeleteConfirm && (
              <div className="mt-2.5 p-3 rounded-lg bg-rose-50 border border-rose-200 space-y-2">
                <span className="font-bold text-[#D9485F]">Are you sure you want to delete your account?</span>
                <p className="text-[11px] text-[#7B8492] leading-relaxed">
                  Permanently deleting wipes all conversation history and connections. This action cannot be undone.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={handleDeleteAccount}
                    className="px-3 py-1.5 rounded-lg bg-[#D9485F] text-white font-medium hover:bg-rose-700"
                  >
                    Confirm Deletion
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-3 py-1.5 rounded-lg bg-white border border-[#E1E5EC] text-[#303641]"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[#1877F2] text-white text-xs font-semibold hover:bg-[#166fe5] transition-colors"
          >
            {t('common.close')}
          </button>
        </div>
      </div>
    </div>
  );
};
