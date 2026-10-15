import React, { useState, useRef, useEffect } from 'react';
import {
  Shield,
  CheckCircle2,
  Phone,
  Wifi,
  Mic,
  RotateCw,
  AlertCircle,
  ChevronLeft,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { AVATAR_MARCUS, AVATAR_CLARA } from '../../services/mockData';
import { sendFirebasePhoneOtp, verifyFirebasePhoneOtp } from '../../lib/firebase';
import { ConfirmationResult } from 'firebase/auth';

interface LoginPageProps {
  onLoginSuccess: () => void;
  onExitToApp: () => void;
}

const COUNTRY_DIAL_CODES = [
  { code: '+91', country: 'India', flag: '🇮🇳' },
  { code: '+1', country: 'United States', flag: '🇺🇸' },
  { code: '+44', country: 'United Kingdom', flag: '🇬🇧' },
  { code: '+1', country: 'Canada', flag: '🇨🇦' },
  { code: '+61', country: 'Australia', flag: '🇦🇺' },
  { code: '+49', country: 'Germany', flag: '🇩🇪' },
  { code: '+33', country: 'France', flag: '🇫🇷' },
  { code: '+971', country: 'UAE', flag: '🇦🇪' },
  { code: '+65', country: 'Singapore', flag: '🇸🇬' },
  { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦' },
  { code: '+81', country: 'Japan', flag: '🇯🇵' },
];

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onExitToApp }) => {
  const { loginWithFirebasePhone, switchProfile, isAuthenticated } = useAuth();

  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [mobileNumber, setMobileNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [isAdultConfirmed, setIsAdultConfirmed] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);

  // 6 separate OTP input boxes
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Active Firebase Phone Confirmation Result
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

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

  // If already authenticated, redirect immediately
  useEffect(() => {
    if (isAuthenticated) {
      onLoginSuccess();
    }
  }, [isAuthenticated, onLoginSuccess]);

  const carouselItems = [
    { title: 'Voice chat shows', subtitle: 'RJ helps to find best FRNDs' },
    { title: 'Connect with verified adults', subtitle: 'Encrypted peer voice & video calls' },
    { title: 'Private & safe conversations', subtitle: 'Your phone number is strictly hidden' },
  ];

  // Request SMS OTP via Firebase Phone Auth
  const handleRequestOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);
    setSuccessNotice(null);

    const cleanNumber = mobileNumber.replace(/\D/g, '');
    if (!cleanNumber || cleanNumber.length < 7 || cleanNumber.length > 15) {
      setErrorMessage('Please enter a valid international mobile phone number.');
      return;
    }

    if (!isAdultConfirmed) {
      setErrorMessage('Mandatory confirmation: You must confirm that you are 18 years or older.');
      return;
    }

    const fullPhoneNumber = `${countryCode}${cleanNumber}`;
    setIsLoading(true);

    try {
      const res = await sendFirebasePhoneOtp(fullPhoneNumber, 'login-recaptcha-container');

      if (res.success && res.confirmationResult) {
        setConfirmationResult(res.confirmationResult);
        setStep('otp');
        setResendCooldown(60);
        setSuccessNotice(
          (res as any).isDemoFallback
            ? `Demo SMS OTP dispatched. Use verification code 123456.`
            : `Verification code dispatched via SMS to ${countryCode} ${cleanNumber}.`
        );
        setTimeout(() => {
          otpInputRefs.current[0]?.focus();
        }, 150);
      } else {
        setErrorMessage(res.error || 'Failed to dispatch SMS verification code.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred while requesting phone authentication.');
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || isLoading) return;
    await handleRequestOtp();
  };

  // Handle single digit input and auto-advance
  const handleOtpDigitChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const updated = [...otpDigits];
    updated[index] = digit;
    setOtpDigits(updated);

    if (digit && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
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

  // Verify Firebase Phone SMS OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessNotice(null);

    const fullCode = otpDigits.join('').trim();
    if (fullCode.length !== 6) {
      setErrorMessage('Please enter the complete 6-digit verification code.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await verifyFirebasePhoneOtp(fullCode, confirmationResult);

      if (res.success && res.user) {
        const fullPhoneNumber = `${countryCode}${mobileNumber.replace(/\D/g, '')}`;
        // Create or retrieve user's profile in backend
        await loginWithFirebasePhone(fullPhoneNumber, res.user.uid);
        onLoginSuccess();
      } else {
        setErrorMessage(res.error || 'Invalid OTP code. Please check and try again.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Verification failed. Please check the code or request a new one.');
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
          <span>Firebase Phone Auth</span>
        </span>
      </div>

      {/* Main International Standard Card */}
      <div className="w-full max-w-md rounded-3xl bg-[#5244E3] overflow-hidden shadow-2xl relative text-left border border-white/10 flex flex-col justify-between">
        {/* Invisible reCAPTCHA Anchor Container for Firebase Phone Auth */}
        <div id="login-recaptcha-container" className="hidden" />

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
              className={`h-1.5 rounded-full transition-all cursor-pointer ${carouselIndex === 0 ? 'w-5 bg-white' : 'w-1.5 bg-white/40'}`}
              aria-label="Slide 1"
            />
            <button
              type="button"
              onClick={() => setCarouselIndex(1)}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${carouselIndex === 1 ? 'w-5 bg-white' : 'w-1.5 bg-white/40'}`}
              aria-label="Slide 2"
            />
            <button
              type="button"
              onClick={() => setCarouselIndex(2)}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${carouselIndex === 2 ? 'w-5 bg-white' : 'w-1.5 bg-white/40'}`}
              aria-label="Slide 3"
            />
          </div>

          {/* Cute Talking Avatars Illustration */}
          <div className="relative h-36 w-full flex items-center justify-center pt-1">
            <div className="relative flex items-center justify-center">
              {/* Guy Avatar with yellow earphones */}
              <div className="w-18 h-18 rounded-full overflow-hidden border-2 border-white/50 bg-[#6E5CF8] shadow-lg relative -mr-4 -mb-2">
                <img
                  src={AVATAR_MARCUS}
                  alt="Voice Chat Member"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-yellow-400 flex items-center justify-center text-slate-950 text-[10px] font-bold shadow">
                  <Mic className="w-3 h-3" />
                </div>
              </div>

              {/* Girl Avatar with earphones & speech wave */}
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-white bg-[#FF80BF] shadow-xl relative z-10">
                <img
                  src={AVATAR_CLARA}
                  alt="Live Peer Chat"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-yellow-400 flex items-center justify-center text-slate-950 text-[10px] font-bold shadow">
                  <Wifi className="w-3 h-3" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM SHEET (White Card + Phone Auth + 6 OTP Boxes + Firebase SMS) */}
        <div className="bg-white rounded-t-[32px] p-6 text-slate-900 shadow-2xl space-y-4">
          {step === 'phone' ? (
            <form onSubmit={handleRequestOtp} className="space-y-3.5">
              <label className="block text-sm font-extrabold text-slate-900">
                Mobile number
              </label>

              {/* Country Dial Code Selector + Mobile Number Input */}
              <div className="flex items-center rounded-2xl bg-[#F3F4F6] border border-slate-200 px-3 py-2.5 text-sm focus-within:border-[#5244E3] transition-colors">
                {/* Country Code Dropdown */}
                <div className="relative flex items-center pr-2 border-r border-slate-300">
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    aria-label="Select country dial code"
                    className="bg-transparent font-bold text-[#0284C7] focus:outline-none cursor-pointer pr-1 text-sm appearance-none"
                  >
                    {COUNTRY_DIAL_CODES.map((item, idx) => (
                      <option key={`${item.code}-${idx}`} value={item.code}>
                        {item.flag} {item.code}
                      </option>
                    ))}
                  </select>
                </div>

                <input
                  type="tel"
                  maxLength={15}
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value.replace(/[^\d]/g, ''))}
                  placeholder="Enter phone number"
                  className="flex-1 pl-3 bg-transparent font-bold text-slate-900 focus:outline-none text-base"
                />
              </div>

              {/* Privacy Guarantee Notice */}
              <p className="text-[12px] font-bold text-[#16A34A] leading-tight flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>We don’t share your number with anyone</span>
              </p>

              {errorMessage && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold flex items-start gap-1.5 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
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
                  <strong className="text-slate-900">I confirm that I am 18 years or older.</strong> Minors are not permitted.
                </span>
              </label>

              {/* Get OTP Button with Firebase SMS */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-2xl bg-[#BAE6FD] hover:bg-[#A5F3FC] text-[#0284C7] font-black text-sm tracking-wide transition-all shadow-md active:scale-98 disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <RotateCw className="w-4 h-4 animate-spin" />
                    <span>Verifying reCAPTCHA & Sending SMS...</span>
                  </>
                ) : (
                  <span>Get OTP</span>
                )}
              </button>

              {/* Fast Instant Demo Persona Switch */}
              <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100">
                <span>Instant Sign In:</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleDemoSignIn('usr_me_001')}
                    className="font-bold text-[#5244E3] hover:underline cursor-pointer"
                  >
                    Alex
                  </button>
                  <span>·</span>
                  <button
                    type="button"
                    onClick={() => handleDemoSignIn('usr_sushmitha_301')}
                    className="font-bold text-[#FF1493] hover:underline cursor-pointer"
                  >
                    Sushmitha
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
          ) : (
            /* STEP 2: OTP VERIFICATION (6 INPUT BOXES + RESEND TIMER) */
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-slate-900">Enter 6-Digit OTP</h3>
                <p className="text-xs text-slate-500">
                  Firebase Phone Auth SMS code sent to{' '}
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
              <div className="flex items-center justify-between gap-1.5 sm:gap-2">
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
                    className="w-11 h-13 sm:w-12 sm:h-14 text-center font-mono text-xl sm:text-2xl font-black rounded-xl bg-[#F3F4F6] border-2 border-slate-200 text-slate-900 focus:bg-white focus:border-[#5244E3] focus:outline-none transition-all shadow-xs"
                  />
                ))}
              </div>

              {errorMessage && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold flex items-start gap-1.5 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Verify & Continue Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-2xl bg-[#5244E3] hover:bg-[#4336c9] text-white font-black text-sm tracking-wide transition-all shadow-md active:scale-98 disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <RotateCw className="w-4 h-4 animate-spin" />
                    <span>Verifying Code with Firebase...</span>
                  </>
                ) : (
                  <span>Verify &amp; Continue</span>
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
                  className="text-slate-600 hover:text-slate-900 font-semibold cursor-pointer"
                >
                  Change Number
                </button>

                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendCooldown > 0 || isLoading}
                  className={`font-bold ${
                    resendCooldown > 0
                      ? 'text-slate-400 cursor-not-allowed'
                      : 'text-[#0284C7] hover:underline cursor-pointer'
                  }`}
                >
                  {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : 'Resend OTP'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
