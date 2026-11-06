import React, { useState } from 'react';
import {
  Sparkles,
  User,
  Calendar,
  AlertCircle,
  RotateCw,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { useAuth, calculateAge, RegisterData } from '../../contexts/AuthContext';
import {
  AVATAR_CLARA,
  AVATAR_MARCUS,
  AVATAR_ELENA,
  PORTRAIT_SUSHMITHA,
  PORTRAIT_VICHU,
  PORTRAIT_RUHI,
} from '../../services/mockData';

interface ProfileOnboardingStepProps {
  verifiedPhone: string;
  onComplete: () => void;
  onBackToPhone?: () => void;
}

const AVATAR_OPTIONS = [
  { id: 'clara', label: 'Clara', url: AVATAR_CLARA },
  { id: 'marcus', label: 'Marcus', url: AVATAR_MARCUS },
  { id: 'elena', label: 'Elena', url: AVATAR_ELENA },
  { id: 'sushmitha', label: 'Sushmitha', url: PORTRAIT_SUSHMITHA },
  { id: 'vichu', label: 'Vichu', url: PORTRAIT_VICHU },
  { id: 'ruhi', label: 'Ruhi', url: PORTRAIT_RUHI },
];

export const ProfileOnboardingStep: React.FC<ProfileOnboardingStepProps> = ({
  verifiedPhone,
  onComplete,
}) => {
  const { completeOnboarding } = useAuth();

  const [firstName, setFirstName] = useState('');
  const [username, setUsername] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('2000-01-01');
  const [gender, setGender] = useState<'female' | 'male' | 'non-binary' | 'other'>('female');
  const [bio, setBio] = useState('Excited to connect with real vibes on VibeTalk ✨');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_CLARA);
  const [isAdultConfirmed, setIsAdultConfirmed] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Automatically generate suggested username from first name
  const handleFirstNameChange = (val: string) => {
    setFirstName(val);
    if (!username || username.startsWith('user_')) {
      const slug = val.toLowerCase().replace(/[^a-z0-9]/g, '');
      const randomSuffix = verifiedPhone.replace(/\D/g, '').slice(-4);
      setUsername(slug ? `${slug}_${randomSuffix}` : `user_${randomSuffix}`);
    }
  };

  const computedAge = calculateAge(dateOfBirth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!firstName.trim()) {
      setErrorMessage('Please enter your first name.');
      return;
    }

    if (!username.trim()) {
      setErrorMessage('Please choose a username.');
      return;
    }

    if (computedAge < 18) {
      setErrorMessage(
        `Age Restriction: You must be at least 18 years old to join VibeTalk (calculated age: ${computedAge}). Minors are strictly prohibited.`
      );
      return;
    }

    if (!isAdultConfirmed) {
      setErrorMessage('You must confirm that you are 18 years or older.');
      return;
    }

    setIsLoading(true);

    try {
      const regData: RegisterData = {
        firstName: firstName.trim(),
        username: username.toLowerCase().trim(),
        phoneNumber: verifiedPhone,
        dateOfBirth,
        gender,
        country: 'India',
        bio: bio.trim(),
        avatarUrl: selectedAvatar,
        interests: ['#Chatting', '#Music', '#Dating', '#Hangout'],
        languages: ['English', 'Hindi'],
        isAdultConfirmed: true,
      };

      const result = await completeOnboarding(regData);

      if (result.success) {
        onComplete();
      } else {
        setErrorMessage(result.error || 'Failed to complete profile creation.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-left">
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[#16865C] text-[11px] font-bold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Phone Verified: {verifiedPhone}</span>
        </div>
        <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-1.5">
          <span>Create Your VibeTalk Profile</span>
          <Sparkles className="w-4 h-4 text-amber-500" />
        </h3>
        <p className="text-xs text-slate-500">
          Almost done! Set up your display identity to start connecting with verified members.
        </p>
      </div>

      {/* Avatar Picker */}
      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-slate-700">Choose Profile Photo</label>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {AVATAR_OPTIONS.map((item) => {
            const isSelected = selectedAvatar === item.url;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedAvatar(item.url)}
                className={`relative w-12 h-12 rounded-full overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                  isSelected
                    ? 'border-[#5244E3] scale-105 shadow-md ring-2 ring-[#5244E3]/30'
                    : 'border-slate-200 opacity-80 hover:opacity-100'
                }`}
              >
                <img src={item.url} alt={item.label} className="w-full h-full object-cover" />
                {isSelected && (
                  <div className="absolute inset-0 bg-[#5244E3]/30 flex items-center justify-center">
                    <Check className="w-4 h-4 text-white stroke-[3]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* First Name & Username */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="space-y-1">
          <label className="block text-xs font-bold text-slate-700">First Name</label>
          <div className="flex items-center rounded-xl bg-[#F3F4F6] border border-slate-200 px-3 py-2 text-sm focus-within:border-[#5244E3]">
            <input
              type="text"
              required
              value={firstName}
              onChange={(e) => handleFirstNameChange(e.target.value)}
              placeholder="e.g. Priya"
              className="w-full bg-transparent font-semibold text-slate-900 text-xs focus:outline-none"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-bold text-slate-700">Username</label>
          <div className="flex items-center rounded-xl bg-[#F3F4F6] border border-slate-200 px-3 py-2 text-sm focus-within:border-[#5244E3]">
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
              placeholder="priya_vibe"
              className="w-full bg-transparent font-semibold text-slate-900 text-xs focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Date of Birth & Age validation */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="space-y-1">
          <label className="block text-xs font-bold text-slate-700">
            Date of Birth <span className="text-rose-500">*</span>
          </label>
          <div className="flex items-center rounded-xl bg-[#F3F4F6] border border-slate-200 px-3 py-2 text-sm focus-within:border-[#5244E3]">
            <Calendar className="w-3.5 h-3.5 text-slate-400 mr-1.5 shrink-0" />
            <input
              type="date"
              required
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className="w-full bg-transparent font-semibold text-slate-900 text-xs focus:outline-none"
            />
          </div>
          <span
            className={`text-[10px] font-bold block ${
              computedAge >= 18 ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            Age: {computedAge} years {computedAge >= 18 ? '✓ (18+ Adult)' : '✗ (Must be 18+)'}
          </span>
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-bold text-slate-700">Gender</label>
          <div className="flex items-center rounded-xl bg-[#F3F4F6] border border-slate-200 px-2.5 py-1.5 text-xs focus-within:border-[#5244E3]">
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value as any)}
              className="w-full bg-transparent font-semibold text-slate-900 focus:outline-none cursor-pointer"
            >
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="non-binary">Non-Binary</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Short Bio */}
      <div className="space-y-1">
        <label className="block text-xs font-bold text-slate-700">About / Vibe</label>
        <textarea
          rows={2}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="What's your vibe? Music, deep talks, hobbies..."
          className="w-full rounded-xl bg-[#F3F4F6] border border-slate-200 p-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:border-[#5244E3]"
        />
      </div>

      {/* Error Notice */}
      {errorMessage && (
        <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold flex items-start gap-1.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Mandatory 18+ Confirmation */}
      <label className="flex items-start gap-2 pt-1 cursor-pointer">
        <input
          type="checkbox"
          checked={isAdultConfirmed}
          onChange={(e) => setIsAdultConfirmed(e.target.checked)}
          className="mt-0.5 rounded text-[#5244E3]"
        />
        <span className="text-[11px] text-slate-600 select-none">
          <strong className="text-slate-900">I confirm that I am 18 years or older.</strong> I agree to VibeTalk's Terms of Use &amp; Community Guidelines.
        </span>
      </label>

      {/* Complete Profile Button */}
      <button
        type="submit"
        disabled={isLoading || computedAge < 18}
        className="w-full py-3.5 rounded-2xl bg-[#5244E3] hover:bg-[#4336c9] text-white font-black text-sm tracking-wide transition-all shadow-md active:scale-98 disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <RotateCw className="w-4 h-4 animate-spin" />
            <span>Setting Up Your VibeTalk Profile...</span>
          </>
        ) : (
          <span>Enter VibeTalk</span>
        )}
      </button>
    </form>
  );
};
