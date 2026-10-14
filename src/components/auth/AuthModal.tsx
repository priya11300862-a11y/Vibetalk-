import React, { useState } from 'react';
import {
  X,
  Shield,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  Phone,
  Sparkles,
  Wifi,
  Mic,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { AVATAR_MARCUS, AVATAR_CLARA } from '../../services/mockData';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'login' | 'register';
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, register, verifyOtp, switchProfile } = useAuth();

  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [mobileNumber, setMobileNumber] = useState('9876543210');
  const [countryCode, setCountryCode] = useState('+91');
  const [otpCode, setOtpCode] = useState('');
  const [isAdultConfirmed, setIsAdultConfirmed] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [carouselIndex, setCarouselIndex] = useState(0);

  if (!isOpen) return null;

  const carouselItems = [
    { title: 'Voice chat shows', subtitle: 'RJ helps to find best FRNDs' },
    { title: 'Connect with verified adults', subtitle: 'Encrypted peer voice & video calls' },
    { title: 'Private & safe conversations', subtitle: 'Your phone number is strictly hidden' },
  ];

  const handleGetOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!mobileNumber || mobileNumber.length < 8) {
      setErrorMessage('Please enter a valid mobile number.');
      return;
    }

    if (!isAdultConfirmed) {
      setErrorMessage('You must confirm that you are 18 years or older.');
      return;
    }

    setStep('otp');
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const res = await login(`${countryCode}${mobileNumber}`, 'password123');
    if (res.success) {
      onClose();
    } else {
      setErrorMessage(res.error || 'Verification failed');
    }
  };

  const handleDemoSignIn = (personaId: string) => {
    switchProfile(personaId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-2 sm:p-4 overflow-y-auto select-none">
      <div className="w-full max-w-md rounded-3xl bg-[#5244E3] overflow-hidden shadow-2xl relative text-left border border-white/10 flex flex-col justify-between">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 text-white/80 hover:text-white p-1 rounded-full bg-black/20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* =========================================================================
            TOP HALF (Purple Banner + Cursive Logo + Safety Shield + Illustration)
            ========================================================================= */}
        <div className="pt-6 px-6 pb-2 text-white space-y-4">
          
          {/* Top Logo & Shield Badge */}
          <div className="flex items-center justify-between">
            <span className="font-serif italic font-extrabold text-3xl tracking-tight text-white drop-shadow">
              frnd
            </span>

            {/* Shield with person silhouette */}
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
            <span
              onClick={() => setCarouselIndex(0)}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${carouselIndex === 0 ? 'w-5 bg-white' : 'w-1.5 bg-white/40'}`}
            />
            <span
              onClick={() => setCarouselIndex(1)}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${carouselIndex === 1 ? 'w-5 bg-white' : 'w-1.5 bg-white/40'}`}
            />
            <span
              onClick={() => setCarouselIndex(2)}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${carouselIndex === 2 ? 'w-5 bg-white' : 'w-1.5 bg-white/40'}`}
            />
          </div>

          {/* Cute Talking Avatars Illustration (Earphones, Smartphone, Mic & Wifi badges) */}
          <div className="relative h-44 w-full flex items-center justify-center pt-2">
            {/* Background circular glowing badges */}
            <div className="relative flex items-center justify-center">
              {/* Guy Avatar with yellow earphones */}
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white/50 bg-[#6E5CF8] shadow-lg relative -mr-4 -mb-2">
                <img
                  src={AVATAR_MARCUS}
                  alt="Voice Chat"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-yellow-400 flex items-center justify-center text-slate-950 text-[10px] font-bold shadow">
                  <Mic className="w-3 h-3" />
                </div>
              </div>

              {/* Girl Avatar with earphones & speech wave */}
              <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-white bg-[#FF80BF] shadow-xl relative z-10">
                <img
                  src={AVATAR_CLARA}
                  alt="Voice Chat"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-1 right-1 w-6 h-6 rounded-full bg-yellow-400 flex items-center justify-center text-slate-950 text-[10px] font-bold shadow">
                  <Wifi className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            BOTTOM SHEET (White Card + Mobile Number + Get OTP + Policy)
            ========================================================================= */}
        <div className="bg-white rounded-t-[32px] p-6 text-slate-900 shadow-2xl space-y-4">
          
          {step === 'phone' ? (
            <form onSubmit={handleGetOtp} className="space-y-3.5">
              <label className="block text-sm font-extrabold text-slate-900">
                Mobile number
              </label>

              {/* Number Input with +91 Prefix */}
              <div className="flex items-center rounded-2xl bg-[#F3F4F6] border border-slate-200 px-4 py-3 text-sm focus-within:border-[#5244E3] transition-colors">
                <span className="font-bold text-[#0284C7] pr-3 border-r border-slate-300">
                  {countryCode}
                </span>
                <input
                  type="tel"
                  maxLength={10}
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter phone number"
                  className="flex-1 pl-3 bg-transparent font-bold text-slate-900 focus:outline-none text-base"
                />
              </div>

              {/* Safe Green Guarantee Text from Screenshot */}
              <p className="text-[12px] font-bold text-[#16A34A] leading-tight">
                We don’t share your number with anyone
              </p>

              {errorMessage && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold">
                  {errorMessage}
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

              {/* Big Rounded CTA Button */}
              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-[#BAE6FD] hover:bg-[#A5F3FC] text-[#0284C7] font-black text-sm tracking-wide transition-all shadow-md active:scale-98"
              >
                Get OTP
              </button>

              {/* Fast Instant Demo Persona Switch */}
              <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100">
                <span>Instant Sign In:</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleDemoSignIn('usr_me_001')}
                    className="font-bold text-[#5244E3] hover:underline"
                  >
                    Alex (Admin)
                  </button>
                  <span>·</span>
                  <button
                    type="button"
                    onClick={() => handleDemoSignIn('usr_sushmitha_301')}
                    className="font-bold text-[#FF1493] hover:underline"
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
            /* OTP VERIFICATION STEP */
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-slate-900">Enter 6-Digit OTP</h3>
                <p className="text-xs text-slate-500">
                  Verification code sent to {countryCode} {mobileNumber}
                </p>
              </div>

              <input
                type="text"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="123456"
                className="w-full text-center tracking-[0.5em] font-mono text-2xl py-3 rounded-2xl bg-[#F3F4F6] border border-slate-200 text-slate-900 font-bold focus:outline-none"
              />

              {errorMessage && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold">
                  {errorMessage}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-[#5244E3] text-white font-black text-sm tracking-wide transition-all shadow-md active:scale-98"
              >
                Verify &amp; Continue
              </button>

              <button
                type="button"
                onClick={() => setStep('phone')}
                className="w-full text-center text-xs text-slate-500 hover:text-slate-900"
              >
                Change mobile number
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};
