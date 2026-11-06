import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Shield,
  CheckCircle2,
  Phone,
  Wifi,
  Mic,
  RotateCw,
  AlertCircle,
  ChevronLeft,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { AVATAR_MARCUS, AVATAR_CLARA } from '../../services/mockData';
import { ProfileOnboardingStep } from './ProfileOnboardingStep';
import { OtpSuccessAnimation } from './OtpSuccessAnimation';

interface LoginPageProps {
  onLoginSuccess: () => void;
  onExitToApp: () => void;
}

const COUNTRY_DIAL_CODES = [
  { code: '+91', country: 'India', flag: '🇮🇳' },
  { code: '+1', country: 'United States', flag: '🇺🇸' },
  { code: '+44', country: 'United Kingdom', flag: '🇬🇧' },
  { code: '+971', country: 'UAE', flag: '🇦🇪' },
  { code: '+65', country: 'Singapore', flag: '🇸🇬' },
  { code: '+61', country: 'Australia', flag: '🇦🇺' },
  { code: '+49', country: 'Germany', flag: '🇩🇪' },
  { code: '+33', country: 'France', flag: '🇫🇷' },
  { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦' },
  { code: '+81', country: 'Japan', flag: '🇯🇵' },
];

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onExitToApp }) => {
  const { sendMiniMothOtp, verifyMiniMothOtp, switchProfile, isAuthenticated } = useAuth();

  // Navigation steps: 'phone' | 'otp' | 'onboarding'
  const [step, setStep] = useState<'phone' | 'otp' | 'onboarding'>('phone');
  const [mobileNumber, setMobileNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [isAdultConfirmed, setIsAdultConfirmed] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);

  // MiniMoth verification details
  const [otpRequestId, setOtpRequestId] = useState<string | null>(null);
  const [verifiedFullPhone, setVerifiedFullPhone] = useState('');
  const [isSandboxMode, setIsSandboxMode] = useState(false);

  // 6 separate OTP input boxes
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Resend OTP countdown timer
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    let timer: number | null = null;
    if (resendCooldown > 0) {
      timer = window.setInterval(() => {
        setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [resendCooldown]);

  // If already authenticated and not currently on onboarding, redirect
  useEffect(() => {
    if (isAuthenticated && step !== 'onboarding') {
      onLoginSuccess();
    }
  }, [isAuthenticated, onLoginSuccess, step]);

  const carouselItems = [
    { title: 'Voice chat shows', subtitle: 'RJ helps to find best FRNDs' },
    { title: 'Connect with verified adults', subtitle: 'Encrypted peer voice & video calls' },
    { title: 'Private & safe conversations', subtitle: 'Your phone number is strictly hidden' },
  ];

  // Validate Indian or international phone number
  const validateNumber = (number: string, code: string): { valid: boolean; error?: string } => {
    const clean = number.replace(/\D/g, '');
    if (!clean) {
      return { valid: false, error: 'Please enter your mobile phone number.' };
    }
    if (code === '+91') {
      if (clean.length !== 10) {
        return { valid: false, error: 'Please enter a valid 10-digit Indian mobile number.' };
      }
      if (!/^[6-9]/.test(clean)) {
        return { valid: false, error: 'Indian mobile numbers must begin with 6, 7, 8, or 9.' };
      }
    } else {
      if (clean.length < 7 || clean.length > 14) {
        return { valid: false, error: 'Please enter a valid phone number with 7 to 14 digits.' };
      }
    }
    return { valid: true };
  };

  // Step 2: Request OTP through MiniMoth
  const handleRequestOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);
    setSuccessNotice(null);

    const validation = validateNumber(mobileNumber, countryCode);
    if (!validation.valid) {
      setErrorMessage(validation.error || 'Please enter a valid mobile number.');
      return;
    }

    if (!isAdultConfirmed) {
      setErrorMessage('Mandatory confirmation: You must confirm that you are 18 years or older.');
      return;
    }

    const cleanNumber = mobileNumber.replace(/\D/g, '');
    const fullPhoneNumber = `${countryCode}${cleanNumber}`;
    setIsLoading(true);

    try {
      const res = await sendMiniMothOtp(fullPhoneNumber);

      if (res.success) {
        setOtpRequestId(res.otp_id || `req_${Date.now()}`);
        setVerifiedFullPhone(fullPhoneNumber);
        setIsSandboxMode(Boolean(res.isSandbox));
        setStep('otp');
        setResendCooldown(res.retryAfterSeconds || 60);

        if (res.isSandbox) {
          setSuccessNotice(
            `OTP sent successfully. Please check your phone. (Sandbox mode: Use code 000000)`
          );
        } else {
          setSuccessNotice(`OTP sent successfully. Please check your phone.`);
        }

        setTimeout(() => {
          otpInputRefs.current[0]?.focus();
        }, 150);
      } else {
        setErrorMessage(res.error || 'Failed to dispatch verification code via MiniMoth.');
        if (res.retryAfterSeconds) {
          setResendCooldown(res.retryAfterSeconds);
        }
      }
    } catch (err: any) {
      setErrorMessage(
        err.message || 'Unable to communicate with verification service. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || isLoading) return;
    await handleRequestOtp();
  };

  const [isSuccessVerified, setIsSuccessVerified] = useState(false);
  const [successMode, setSuccessMode] = useState<'returning' | 'new' | null>(null);
  const [shakeKey, setShakeKey] = useState(0);

  // Step 3: Handle individual OTP digit inputs & auto-advance
  const handleOtpDigitChange = (index: number, value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (!cleaned) {
      const updated = [...otpDigits];
      updated[index] = '';
      setOtpDigits(updated);
      return;
    }

    const digit = cleaned.slice(-1);
    const updated = [...otpDigits];
    updated[index] = digit;
    setOtpDigits(updated);

    // Automatically move focus to next input field as user types
    if (index < 5) {
      otpInputRefs.current[index + 1]?.focus();
      otpInputRefs.current[index + 1]?.select();
    }
  };

  // Support backspace and arrow navigation across 6 inputs
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!otpDigits[index] && index > 0) {
        // Current input is already empty: navigate to previous input and clear it
        e.preventDefault();
        const updated = [...otpDigits];
        updated[index - 1] = '';
        setOtpDigits(updated);
        otpInputRefs.current[index - 1]?.focus();
      } else if (otpDigits[index]) {
        // Current input has a digit: clear it
        const updated = [...otpDigits];
        updated[index] = '';
        setOtpDigits(updated);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      otpInputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      e.preventDefault();
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData) {
      const updated = ['', '', '', '', '', ''];
      for (let i = 0; i < pastedData.length; i++) {
        updated[i] = pastedData[i];
      }
      setOtpDigits(updated);
      const nextIndex = Math.min(pastedData.length, 5);
      otpInputRefs.current[nextIndex]?.focus();
    }
  };

  // Step 4: Verify OTP code through MiniMoth
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessNotice(null);

    const fullCode = otpDigits.join('').trim();
    if (fullCode.length !== 6) {
      setErrorMessage('Please enter the complete 6-digit verification code.');
      setShakeKey((prev) => prev + 1);
      return;
    }

    const cleanNumber = mobileNumber.replace(/\D/g, '');
    const fullPhoneNumber = `${countryCode}${cleanNumber}`;
    setIsLoading(true);

    try {
      const res = await verifyMiniMothOtp(fullPhoneNumber, fullCode);

      if (res.success) {
        setIsSuccessVerified(true);
        setSuccessMode(res.isNewUser ? 'new' : 'returning');

        // Tactile pause allowing user to enjoy the celebratory success checkmark
        setTimeout(() => {
          if (res.isNewUser) {
            setStep('onboarding');
            setIsSuccessVerified(false);
          } else {
            onLoginSuccess();
          }
        }, 1100);
      } else {
        setErrorMessage(
          res.error || 'The OTP you entered is incorrect or has expired. Please try again.'
        );
        setShakeKey((prev) => prev + 1);
      }
    } catch (err: any) {
      setErrorMessage(
        err.message || 'Verification failed. Please check the code or request a new one.'
      );
      setShakeKey((prev) => prev + 1);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoSignIn = (personaId: string) => {
    switchProfile(personaId);
    onLoginSuccess();
  };

  return (
    <div className="min-h-screen bg-[#F5F7FC] flex flex-col justify-center items-center py-6 px-3 sm:px-6 lg:px-8 font-sans selection:bg-[#5244E3]/20 selection:text-[#5244E3]">
      {/* Top Header Return Bar */}
      <div className="w-full max-w-md px-2 mb-3 flex items-center justify-between">
        <button
          onClick={onExitToApp}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#7B8492] hover:text-[#1877F2] transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Exit to VibeTalk Main Site</span>
        </button>

        <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-[#16865C] bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-[#16865C] animate-pulse" />
          <span>MiniMoth Verified OTP</span>
        </span>
      </div>

      {/* Main International Standard Card */}
      <div className="w-full max-w-md rounded-3xl bg-[#5244E3] overflow-hidden shadow-2xl relative text-left border border-white/10 flex flex-col justify-between">
        {/* TOP HALF (Purple Banner + VibeTalk Logo + Safety Shield + Illustration) */}
        <div className="pt-6 px-6 pb-2 text-white space-y-4">
          {/* Top Logo & Shield Badge */}
          <div className="flex items-center justify-between">
            <span className="font-sans font-black text-2xl tracking-tight text-white drop-shadow flex items-center gap-1.5">
              <span>VibeTalk</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            </span>

            {/* Shield with verified badge */}
            <div className="w-9 h-9 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-white shadow-sm">
              <Shield className="w-5 h-5 fill-white text-transparent" />
            </div>
          </div>

          {/* Carousel Titles */}
          <div className="pt-2 space-y-1">
            <h1 className="text-2xl font-black text-white tracking-tight leading-tight">
              {carouselItems[carouselIndex].title}
            </h1>
            <p className="text-xs text-white/90 font-medium">
              {carouselItems[carouselIndex].subtitle}
            </p>
          </div>

          {/* Pagination Carousel Dots */}
          <div className="flex items-center gap-1.5 pt-1">
            <button
              type="button"
              onClick={() => setCarouselIndex(0)}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                carouselIndex === 0 ? 'w-5 bg-white' : 'w-1.5 bg-white/40'
              }`}
              aria-label="Slide 1"
            />
            <button
              type="button"
              onClick={() => setCarouselIndex(1)}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                carouselIndex === 1 ? 'w-5 bg-white' : 'w-1.5 bg-white/40'
              }`}
              aria-label="Slide 2"
            />
            <button
              type="button"
              onClick={() => setCarouselIndex(2)}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                carouselIndex === 2 ? 'w-5 bg-white' : 'w-1.5 bg-white/40'
              }`}
              aria-label="Slide 3"
            />
          </div>

          {/* Talking Avatars Illustration */}
          <div className="relative h-32 w-full flex items-center justify-center pt-1">
            <div className="relative flex items-center justify-center">
              {/* Guy Avatar with yellow earphones */}
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white/50 bg-[#6E5CF8] shadow-lg relative -mr-4 -mb-2">
                <img
                  src={AVATAR_MARCUS}
                  alt="Voice Chat Member"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-1 right-1 w-4.5 h-4.5 rounded-full bg-yellow-400 flex items-center justify-center text-slate-950 text-[9px] font-bold shadow">
                  <Mic className="w-2.5 h-2.5" />
                </div>
              </div>

              {/* Girl Avatar with earphones & speech wave */}
              <div className="w-22 h-22 rounded-full overflow-hidden border-2 border-white bg-[#FF80BF] shadow-xl relative z-10">
                <img
                  src={AVATAR_CLARA}
                  alt="Live Peer Chat"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-1 right-1 w-4.5 h-4.5 rounded-full bg-yellow-400 flex items-center justify-center text-slate-950 text-[9px] font-bold shadow">
                  <Wifi className="w-2.5 h-2.5" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM SHEET (White Card + Phone Auth / 6 OTP Boxes / Onboarding) */}
        <div className="bg-white rounded-t-[32px] p-6 text-slate-900 shadow-2xl space-y-4">
          {step === 'phone' ? (
            /* STEP 1: ENTER MOBILE NUMBER */
            <form onSubmit={handleRequestOtp} className="space-y-3.5">
              <label className="block text-sm font-extrabold text-slate-900">
                Mobile number
              </label>

              {/* Country Dial Code Selector (+91 Default) + Mobile Number Input */}
              <div className="flex items-center rounded-2xl bg-[#F3F4F6] border border-slate-200 px-3 py-2.5 text-sm focus-within:border-[#5244E3] transition-colors">
                <div className="relative flex items-center pr-2 border-r border-slate-300">
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    aria-label="Select country dial code"
                    className="bg-transparent font-bold text-[#0284C7] focus:outline-none cursor-pointer pr-1 text-sm appearance-none"
                  >
                    {COUNTRY_DIAL_CODES.map((item, idx) => (
                      <option key={`${item.code}-${idx}`} value={item.code}>
                        {item.flag} {item.code} ({item.country})
                      </option>
                    ))}
                  </select>
                </div>

                <input
                  type="tel"
                  maxLength={14}
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value.replace(/[^\d]/g, ''))}
                  placeholder={countryCode === '+91' ? '10-digit mobile number' : 'Phone number'}
                  className="flex-1 pl-3 bg-transparent font-bold text-slate-900 focus:outline-none text-base"
                />
              </div>

              {/* Privacy Guarantee Notice */}
              <p className="text-[12px] font-bold text-[#16A34A] leading-tight flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>We don’t share your number with anyone</span>
              </p>

              {errorMessage && (
                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold space-y-2 animate-in fade-in text-left">
                  <div className="flex items-start gap-1.5">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                    <span className="leading-snug">{errorMessage}</span>
                  </div>
                  {errorMessage.includes('MINIMOTH_API_KEY') && (
                    <div className="p-2.5 rounded-xl bg-white border border-rose-200/90 font-mono text-[11px] text-slate-800 space-y-1.5">
                      <div className="flex items-center justify-between text-slate-500 font-sans text-[10px] font-bold uppercase tracking-wider">
                        <span>Required in .env:</span>
                        <span className="text-[#5244E3] font-bold">Server Environment</span>
                      </div>
                      <div className="bg-slate-100 p-2 rounded-lg select-all text-slate-900 font-bold overflow-x-auto text-left">
                        MINIMOTH_API_KEY="mm_test_your_key_here"
                      </div>
                      <p className="text-[10.5px] font-sans text-slate-500 font-normal leading-relaxed">
                        Get your sandbox key (<strong className="text-slate-800">mm_test_...</strong>) or production key (<strong className="text-slate-800">mm_live_...</strong>) from{' '}
                        <a
                          href="https://minimoth.dev"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#5244E3] font-bold underline"
                        >
                          minimoth.dev
                        </a>{' '}
                        and add it to your <code className="bg-slate-100 px-1 py-0.5 rounded text-purple-700">.env</code> file.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Mandatory 18+ Adult Confirmation */}
              <label className="flex items-start gap-2 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAdultConfirmed}
                  onChange={(e) => setIsAdultConfirmed(e.target.checked)}
                  className="mt-0.5 rounded text-[#5244E3]"
                />
                <span className="text-[11px] text-slate-600 select-none">
                  <strong className="text-slate-900">I confirm that I am 18 years or older.</strong> Minors are strictly not permitted.
                </span>
              </label>

              {/* Send OTP Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-2xl bg-[#BAE6FD] hover:bg-[#A5F3FC] text-[#0284C7] font-black text-sm tracking-wide transition-all shadow-md active:scale-98 disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <RotateCw className="w-4 h-4 animate-spin" />
                    <span>Sending OTP via MiniMoth...</span>
                  </>
                ) : (
                  <span>Send OTP</span>
                )}
              </button>

              {/* Fast Instant Demo Persona Switch */}
              <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100">
                <span>Quick Test Persona:</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleDemoSignIn('usr_me_001')}
                    className="font-bold text-[#5244E3] hover:underline cursor-pointer"
                  >
                    Alex (+91 9876543210)
                  </button>
                  <span>·</span>
                  <button
                    type="button"
                    onClick={() => handleDemoSignIn('usr_sushmitha_301')}
                    className="font-bold text-[#FF1493] hover:underline cursor-pointer"
                  >
                    Sushmitha (+91 9812345678)
                  </button>
                </div>
              </div>

              {/* Terms Footer */}
              <p className="text-[11px] text-slate-500 text-left pt-1 leading-relaxed">
                By proceeding I accept the{' '}
                <strong className="text-slate-900 font-bold">Community Guidelines</strong> &amp;{' '}
                <strong className="text-slate-900 font-bold">Terms of Use</strong>
              </p>
            </form>
          ) : step === 'otp' ? (
            /* STEP 3: OTP VERIFICATION (6 INPUT BOXES + RESEND TIMER + BACK BUTTON) */
            isSuccessVerified ? (
              <div className="py-4 animate-in zoom-in-95 duration-200">
                <OtpSuccessAnimation
                  message={
                    successMode === 'new'
                      ? 'Code Verified! Setting Up Profile...'
                      : 'Code Verified! Welcome Back!'
                  }
                />
              </div>
            ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      setStep('phone');
                      setErrorMessage(null);
                      setSuccessNotice(null);
                    }}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>
                  {otpRequestId && (
                    <span className="text-[10px] text-slate-400 font-mono">
                      Ref: {otpRequestId.slice(0, 12)}
                    </span>
                  )}
                </div>

                <h3 className="text-base font-extrabold text-slate-900">Enter 6-Digit OTP</h3>
                <p className="text-xs text-slate-500">
                  Verification code dispatched via MiniMoth to{' '}
                  <strong className="text-slate-900">{countryCode} {mobileNumber}</strong>
                </p>
              </div>

              {successNotice && (
                <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-[#16865C] font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>{successNotice}</span>
                </div>
              )}

              {/* 6 Individual OTP Input Boxes */}
              <motion.div
                key={`otp-shake-${shakeKey}`}
                animate={shakeKey > 0 ? { x: [0, -12, 12, -8, 8, -4, 4, 0] } : {}}
                transition={{ duration: 0.45, ease: 'easeInOut' }}
                className="flex items-center justify-between gap-1.5 sm:gap-2"
              >
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      otpInputRefs.current[idx] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    onPaste={idx === 0 ? handleOtpPaste : undefined}
                    aria-label={`Digit ${idx + 1} of 6`}
                    className={`w-11 h-13 sm:w-12 sm:h-14 text-center font-mono text-xl sm:text-2xl font-black rounded-xl border-2 text-slate-900 focus:outline-none transition-all shadow-xs ${
                      errorMessage
                        ? 'border-rose-400 bg-rose-50/70 focus:border-rose-500 focus:bg-white'
                        : 'border-slate-200 bg-[#F3F4F6] focus:bg-white focus:border-[#5244E3]'
                    }`}
                  />
                ))}
              </motion.div>

              {errorMessage && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold flex items-start gap-1.5 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Verify OTP Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-2xl bg-[#5244E3] hover:bg-[#4336c9] text-white font-black text-sm tracking-wide transition-all shadow-md active:scale-98 disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <RotateCw className="w-4 h-4 animate-spin" />
                    <span>Verifying OTP with MiniMoth...</span>
                  </>
                ) : (
                  <span>Verify OTP</span>
                )}
              </button>

              {/* Resend OTP & Change Number */}
              <div className="pt-2 flex items-center justify-between text-xs text-slate-500">
                <button
                  type="button"
                  onClick={() => {
                    setStep('phone');
                    setOtpDigits(['', '', '', '', '', '']);
                    setErrorMessage(null);
                  }}
                  className="text-slate-600 hover:text-slate-900 font-semibold cursor-pointer underline"
                >
                  Change Number
                </button>

                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendCooldown > 0 || isLoading}
                  className={`font-bold transition-colors ${
                    resendCooldown > 0
                      ? 'text-slate-400 cursor-not-allowed'
                      : 'text-[#0284C7] hover:underline cursor-pointer'
                  }`}
                >
                  {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : 'Resend OTP'}
                </button>
              </div>
            </form>
            )
          ) : (
            /* STEP 4: ONBOARDING FOR NEW USERS */
            <ProfileOnboardingStep
              verifiedPhone={verifiedFullPhone || `${countryCode}${mobileNumber.replace(/\D/g, '')}`}
              onComplete={onLoginSuccess}
              onBackToPhone={() => {
                setStep('phone');
                setOtpDigits(['', '', '', '', '', '']);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};
