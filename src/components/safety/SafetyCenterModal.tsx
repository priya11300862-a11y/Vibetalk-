import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Lock,
  UserX,
  Flag,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { useSocial } from '../../contexts/SocialContext';
import { UserProfile, ReportItem } from '../../types';

interface SafetyCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUserForReport?: UserProfile | null;
}

export const SafetyCenterModal: React.FC<SafetyCenterModalProps> = ({
  isOpen,
  onClose,
  targetUserForReport,
}) => {
  const { submitReport, blockUser } = useSocial();

  const [activeTab, setActiveTab] = useState<'guidance' | 'report'>(targetUserForReport ? 'report' : 'guidance');
  const [reportCategory, setReportCategory] = useState<ReportItem['category']>('harassment');
  const [reportDetails, setReportDetails] = useState('');
  const [isReportSubmitted, setIsReportSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUserForReport || !reportDetails.trim()) return;

    submitReport(targetUserForReport.id, reportCategory, reportDetails.trim());
    setIsReportSubmitted(true);
    setTimeout(() => {
      setIsReportSubmitted(false);
      setReportDetails('');
      onClose();
    }, 2000);
  };

  const handleQuickBlock = () => {
    if (targetUserForReport) {
      blockUser(targetUserForReport.id, 'Blocked from Safety Center');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-3xl bg-[#101722] border border-[#FF4F9A]/30 p-6 sm:p-8 shadow-2xl relative text-left">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-rose-500/15 text-rose-400 flex items-center justify-center">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">VibeTalk Safety Center</h2>
            <p className="text-xs text-slate-400">
              Community guidelines, incident reporting, and real-time protection protocols.
            </p>
          </div>
        </div>

        {/* Navigation tabs */}
        <div className="flex items-center gap-2 p-1 rounded-xl bg-black/30 border border-white/5 mb-6">
          <button
            onClick={() => setActiveTab('guidance')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'guidance' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Safety Guidelines
          </button>
          {targetUserForReport && (
            <button
              onClick={() => setActiveTab('report')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'report' ? 'bg-white/10 text-rose-300' : 'text-slate-400 hover:text-white'
              }`}
            >
              Report @{targetUserForReport.username}
            </button>
          )}
        </div>

        {/* GUIDANCE TAB */}
        {activeTab === 'guidance' && (
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 text-xs">
            {/* NEVER SHARE BOX */}
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 space-y-2">
              <h3 className="font-bold text-rose-300 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                <span>Never Share the Following with Anyone:</span>
              </h3>
              <ul className="text-rose-200/90 space-y-1.5 pl-5 list-disc leading-relaxed">
                <li>Your account password or two-factor OTP codes.</li>
                <li>Financial details: Bank account, credit card, debit card numbers or crypto keys.</li>
                <li>Your exact home or apartment address.</li>
                <li>Government identity cards outside of the official verification flow.</li>
              </ul>
            </div>

            {/* Zero Tolerance for Minors */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
              <h3 className="font-bold text-white flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#20D9C3]" />
                <span>Zero Tolerance for Minors (Strictly 18+)</span>
              </h3>
              <p className="text-slate-400 leading-relaxed">
                VibeTalk is strictly prohibited to individuals under 18 years of age. If you suspect any account belongs to a minor, immediately flag it using the &quot;Underage Suspicion&quot; report category. Our moderation team reviews and permanently terminates non-compliant accounts.
              </p>
            </div>

            {/* Boundaries & Consent */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
              <h3 className="font-bold text-white flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-[#7C5CFF]" />
                <span>Consent &amp; Communication Boundaries</span>
              </h3>
              <p className="text-slate-400 leading-relaxed">
                Both participants must mutually agree to voice and video communication. Harassment, threats, persistent unwanted contact, and non-consensual media sharing will lead to immediate account suspension and banning.
              </p>
            </div>
          </div>
        )}

        {/* REPORT TAB */}
        {activeTab === 'report' && targetUserForReport && (
          <form onSubmit={handleReportSubmit} className="space-y-4 text-xs">
            {isReportSubmitted ? (
              <div className="p-6 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-[#20D9C3] mx-auto" />
                <h3 className="text-sm font-bold text-white">Report Submitted to Moderation</h3>
                <p className="text-slate-300">
                  Thank you for keeping VibeTalk safe. Our human administrative team has logged your incident.
                </p>
              </div>
            ) : (
              <>
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Reporting:</span>
                    <strong className="text-white">{targetUserForReport.displayName}</strong>
                    <span className="text-slate-500">(@{targetUserForReport.username})</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleQuickBlock}
                    className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 font-semibold"
                  >
                    Block User
                  </button>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Violation Category
                  </label>
                  <select
                    value={reportCategory}
                    onChange={(e) => setReportCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-[#1C0518] border border-pink-500/20 text-white text-xs"
                  >
                    <option value="harassment">Harassment / Bullying</option>
                    <option value="spam">Spam / Commercial Bot Activity</option>
                    <option value="inappropriate_content">Inappropriate or Non-consensual Content</option>
                    <option value="impersonation">Impersonation / Fake Profile</option>
                    <option value="scam">Financial Scam or Fraud</option>
                    <option value="underage_suspicion">Underage Suspicion (Under 18)</option>
                    <option value="threats">Threats of Violence</option>
                    <option value="hate_speech">Hate Speech</option>
                    <option value="other">Other Violation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Incident Details &amp; Context
                  </label>
                  <textarea
                    rows={4}
                    value={reportDetails}
                    onChange={(e) => setReportDetails(e.target.value)}
                    required
                    placeholder="Provide specific details about what occurred..."
                    className="w-full p-3 rounded-xl bg-[#1C0518] border border-pink-500/20 text-white text-xs focus:outline-none focus:border-[#FF4F9A]"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl bg-white/10 text-slate-300 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!reportDetails.trim()}
                    className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:bg-slate-800 disabled:text-slate-600 text-white font-semibold transition-colors"
                  >
                    Submit Report
                  </button>
                </div>
              </>
            )}
          </form>
        )}
      </div>
    </div>
  );
};
