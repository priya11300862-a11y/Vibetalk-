import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Mail,
  KeyRound,
  ArrowRight,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ShieldAlert,
} from 'lucide-react';
import { useAdmin } from '../../contexts/AdminContext';

interface AdminLoginProps {
  onLoginSuccess: () => void;
  onExitToApp: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onExitToApp }) => {
  const { adminLogin } = useAdmin();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [requireMfaStep, setRequireMfaStep] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [autoFilledNotice, setAutoFilledNotice] = useState(false);

  const handleFillDemoSuperAdmin = () => {
    setEmail('superadmin@vibetalk.internal');
    setPassword('Admin@VibeTalk2026!');
    setMfaCode('777888');
    setRequireMfaStep(true);
    setErrorMessage('');
    setAutoFilledNotice(true);
    setTimeout(() => setAutoFilledNotice(false), 4000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter both administrator email and password.');
      return;
    }

    if (!requireMfaStep) {
      // Advance to MFA verification step
      setRequireMfaStep(true);
      return;
    }

    setIsLoading(true);

    try {
      const res = await adminLogin(email, password, mfaCode);
      if (res.success) {
        onLoginSuccess();
      } else {
        setErrorMessage(res.error || 'Login verification failed. Access denied.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred during administrative authentication.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FC] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans selection:bg-[#1877F2]/20 selection:text-[#1877F2]">
      {/* Top Header Return Bar */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 mb-4 flex items-center justify-between">
        <button
          onClick={onExitToApp}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#7B8492] hover:text-[#1877F2] transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Exit to VibeTalk Main Site</span>
        </button>

        <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-[#16865C] bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-[#16865C] animate-pulse" />
          <span>Security Protocol v4.2</span>
        </span>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand Logo & Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#0F141A] text-white shadow-xl shadow-[#0F141A]/10 border border-slate-800">
            <ShieldCheck className="w-7 h-7 text-[#1877F2]" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#303641]">
            VibeTalk Super Admin
          </h1>
          <p className="text-xs text-[#7B8492] max-w-sm mx-auto">
            Authorized administrative gateway for platform governance, moderation, and infrastructure controls.
          </p>
        </div>

        {/* Login Card */}
        <div className="mt-6 bg-white py-8 px-6 sm:px-8 rounded-2xl border border-[#E1E5EC] shadow-xl shadow-slate-200/50 space-y-5">
          {/* Quick Demo Credentials Banner */}
          <div className="p-3 rounded-xl bg-[#EAF2FF] border border-[#1877F2]/30 flex items-start justify-between gap-3">
            <div className="space-y-0.5 text-xs text-[#1877F2]">
              <div className="font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Super Admin Evaluation Mode</span>
              </div>
              <p className="text-[11px] text-[#303641] leading-tight">
                Pre-configured root administrator credentials with full platform permissions.
              </p>
            </div>
            <button
              type="button"
              onClick={handleFillDemoSuperAdmin}
              className="px-2.5 py-1 rounded-md bg-[#1877F2] hover:bg-[#166fe5] text-white text-[11px] font-bold shrink-0 shadow-xs cursor-pointer active:scale-95 transition-all"
            >
              Fill Demo Login
            </button>
          </div>

          {autoFilledNotice && (
            <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-[#16865C] flex items-center gap-1.5 font-medium animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Super Admin credentials and MFA security code loaded!</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-[#D9485F] flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            {!requireMfaStep ? (
              <>
                {/* Email Address */}
                <div>
                  <label className="block text-xs font-semibold text-[#303641] mb-1">
                    Administrator Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7B8492]" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="superadmin@vibetalk.internal"
                      className="w-full h-10 pl-9 pr-3 rounded-lg border border-[#E1E5EC] text-xs text-[#303641] placeholder-[#7B8492] focus:border-[#1877F2] focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-[#303641]">
                      Master Password
                    </label>
                    <span className="text-[11px] text-[#7B8492]">Encrypted (Argon2 / SHA)</span>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7B8492]" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••••••"
                      className="w-full h-10 pl-9 pr-3 rounded-lg border border-[#E1E5EC] text-xs text-[#303641] placeholder-[#7B8492] focus:border-[#1877F2] focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full h-10 mt-2 rounded-lg bg-[#1877F2] hover:bg-[#166fe5] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <span>Continue to MFA Verification</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                {/* 2FA Token Step */}
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-[#F5F7FC] border border-[#E1E5EC] text-xs text-[#303641] space-y-1">
                    <div className="font-semibold flex items-center justify-between">
                      <span className="text-[#7B8492]">Account:</span>
                      <span className="font-mono text-[#303641]">{email}</span>
                    </div>
                    <p className="text-[11px] text-[#7B8492]">
                      Multi-Factor Authentication (MFA) is strictly enforced for Super Admin accounts.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#303641] mb-1">
                      6-Digit Security Token / Authenticator Code
                    </label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7B8492]" />
                      <input
                        type="text"
                        maxLength={6}
                        required
                        value={mfaCode}
                        onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                        placeholder="777888"
                        className="w-full h-11 pl-9 pr-3 rounded-lg border border-[#E1E5EC] font-mono text-base tracking-widest text-[#303641] placeholder-[#7B8492] focus:border-[#1877F2] focus:outline-none transition-colors text-center"
                      />
                    </div>
                    <p className="text-[10px] text-[#7B8492] mt-1 text-center">
                      (Test simulation token: <strong className="text-[#1877F2]">777888</strong>)
                    </p>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setRequireMfaStep(false)}
                      className="px-3 h-10 rounded-lg border border-[#E1E5EC] hover:bg-[#F5F7FC] text-xs font-semibold text-[#7B8492] transition-colors"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 h-10 rounded-lg bg-[#1877F2] hover:bg-[#166fe5] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      {isLoading ? (
                        <span>Verifying Credentials...</span>
                      ) : (
                        <>
                          <ShieldCheck className="w-4 h-4" />
                          <span>Authorize & Enter Console</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}
          </form>

          {/* Audit Notice */}
          <div className="pt-3 border-t border-[#E1E5EC] flex items-center gap-2 text-[10px] text-[#7B8492] leading-tight">
            <ShieldAlert className="w-3.5 h-3.5 text-[#F28C28] shrink-0" />
            <span>
              All authentication attempts are cryptographically stamped and written to the immutable admin audit trail.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
