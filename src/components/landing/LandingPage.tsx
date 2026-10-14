import React from 'react';
import {
  ShieldCheck,
  Lock,
  PhoneCall,
  Video,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  EyeOff,
  UserCheck,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';
import { HERO_IMAGE_URL, AVATAR_CLARA, AVATAR_MARCUS } from '../../services/mockData';

interface LandingPageProps {
  onOpenAuth: (mode?: 'login' | 'register') => void;
  onExplore: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenAuth, onExplore }) => {
  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#FFFDF9] via-[#FAF8F5] to-[#F5F2EB] text-black font-bold selection:bg-[#FF4F9A]/30 selection:text-black">
      {/* Hero Section */}
      <section className="relative pt-12 pb-24 md:pt-20 md:pb-32 overflow-hidden border-b border-stone-200/80">
        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-[#7C5CFF]/15 via-[#20D9C3]/10 to-[#FF4F9A]/12 blur-[120px] pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Typography & CTAs */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 border border-stone-200 text-xs text-slate-600 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-[#20D9C3] animate-pulse" />
                <span className="font-semibold text-slate-900">Verified 18+ Adults Only</span>
                <span className="text-slate-400">·</span>
                <span>Encrypted Peer WebRTC</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1] text-balance">
                Meet people. Start conversations.{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7C5CFF] via-[#20D9C3] to-[#FF4F9A]">
                  Talk your way.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed">
                Connect with verified adults through private messaging, crystal-clear voice calls, and immersive HD video calling in a secure, luxury environment.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => onOpenAuth('register')}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#7C5CFF] to-[#633bf3] text-white text-sm font-semibold hover:opacity-95 shadow-lg shadow-[#7C5CFF]/25 transition-all flex items-center gap-2 group"
                >
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </button>
                <button
                  onClick={() => onOpenAuth('login')}
                  className="px-6 py-3 rounded-xl bg-white hover:bg-stone-50 text-slate-800 text-sm font-semibold border border-stone-200 shadow-xs transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={onExplore}
                  className="px-4 py-3 text-xs font-semibold text-slate-600 hover:text-[#7C5CFF] transition-colors flex items-center gap-1"
                >
                  <span>Explore VibeTalk</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Trust Badges */}
              <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-slate-600 border-t border-stone-200">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#20D9C3]" />
                  <span>No Phone Exposure</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-[#7C5CFF]" />
                  <span>Zero Call Recording</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-[#FF4F9A]" />
                  <span>Strict ID Verification</span>
                </div>
              </div>
            </div>

            {/* Right Column: Floating Preview & Hero Glass Showcase */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-[#101722]/80 backdrop-blur-xl group">
                {/* Hero Graphic */}
                <div className="relative h-64 sm:h-72 w-full overflow-hidden">
                  <img
                    src={HERO_IMAGE_URL}
                    alt="VibeTalk futuristic call interface"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#101722] via-[#101722]/40 to-transparent" />
                  
                  {/* Floating Live Call Pill */}
                  <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-xs">
                    <span className="w-2 h-2 rounded-full bg-[#20D9C3] animate-pulse" />
                    <span className="font-mono text-white text-[11px]">HD WebRTC Call · 08:42</span>
                  </div>
                </div>

                {/* Simulated Floating Chat Cards */}
                <div className="p-6 space-y-3.5 -mt-6 relative z-10">
                  {/* Message bubble from Clara */}
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full overflow-hidden border border-[#20D9C3]/50 shrink-0">
                      <img
                        src={AVATAR_CLARA}
                        alt="Clara"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="flex-1 bg-white/[0.06] border border-white/10 rounded-2xl rounded-tl-sm p-3 text-xs text-slate-200">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-white">Clara Delacroix</span>
                        <span className="text-[10px] text-slate-400">Paris · Verified</span>
                      </div>
                      <p>Hey Alex! Loved your new sound design reel. Are you free for a video call later?</p>
                    </div>
                  </div>

                  {/* Audio message pill */}
                  <div className="flex items-center gap-3 bg-[#7C5CFF]/15 border border-[#7C5CFF]/30 rounded-2xl p-3">
                    <div className="w-8 h-8 rounded-full bg-[#7C5CFF] flex items-center justify-center text-white shrink-0">
                      <PhoneCall className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="font-medium text-white">Voice Memo (0:24)</span>
                        <span className="text-[#20D9C3] font-mono">Played</span>
                      </div>
                      <div className="flex items-center gap-1 h-3">
                        <span className="w-1 bg-[#20D9C3] h-full rounded-full" />
                        <span className="w-1 bg-[#20D9C3] h-2 rounded-full" />
                        <span className="w-1 bg-[#7C5CFF] h-3 rounded-full" />
                        <span className="w-1 bg-[#7C5CFF] h-1.5 rounded-full" />
                        <span className="w-1 bg-slate-600 h-2.5 rounded-full" />
                        <span className="w-1 bg-slate-600 h-1 rounded-full" />
                        <span className="w-1 bg-slate-600 h-3 rounded-full" />
                        <span className="w-1 bg-slate-600 h-2 rounded-full" />
                      </div>
                    </div>
                  </div>

                  {/* Quick Action Triggers */}
                  <div className="pt-2 flex items-center justify-between gap-2">
                    <button
                      onClick={() => onOpenAuth('login')}
                      className="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-medium text-white text-center transition-colors"
                    >
                      Answer Call
                    </button>
                    <button
                      onClick={() => onOpenAuth('register')}
                      className="flex-1 py-2 rounded-xl bg-[#7C5CFF] hover:bg-[#6e49f5] text-xs font-medium text-white text-center transition-colors shadow-md shadow-[#7C5CFF]/20"
                    >
                      Connect with Clara
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Sections: Why VibeTalk */}
      <section className="py-20 border-b border-stone-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-left">
          <div className="max-w-2xl mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Why adult communicators choose VibeTalk
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Designed from the ground up to respect boundaries, eliminate spam bots, and guarantee absolute confidentiality.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white/90 border border-stone-200/90 shadow-sm hover:border-[#7C5CFF]/40 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-[#7C5CFF]/15 text-[#7C5CFF] flex items-center justify-center mb-4">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 mb-2">Absolute Privacy First</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Your email, phone number, and exact GPS coordinates are never exposed publicly. You choose exactly who can message or call you.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/90 border border-stone-200/90 shadow-sm hover:border-[#20D9C3]/40 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-[#20D9C3]/15 text-[#20D9C3] flex items-center justify-center mb-4">
                <Video className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 mb-2">Ephemeral WebRTC Calls</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Peer-to-peer audio and video calls with zero server-side recording. Once your call finishes, media tracks are completely released.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/90 border border-stone-200/90 shadow-sm hover:border-[#FF4F9A]/40 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-[#FF4F9A]/15 text-[#FF4F9A] flex items-center justify-center mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 mb-2">18+ Identity Verification</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Mandatory adult age calculation during registration, plus optional verified document badges to filter out bots and bad actors.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Deep Dive Bento Grid */}
      <section className="py-20 border-b border-stone-200/80 bg-[#F5F2EB]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-left">
          <div className="max-w-2xl mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Crafted for intimate, modern conversation
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              High-definition video, fluid text messaging with reactions, and granular privacy controls.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Bento Card 1: Private Messaging */}
            <div className="p-6 rounded-2xl bg-white/95 border border-stone-200/90 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#7C5CFF]/15 text-[#7C5CFF]">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Private Messaging</h3>
                  <span className="text-[11px] text-slate-500">Reactions, Voice Notes &amp; Read Receipts</span>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Chat in real-time with swipe-to-reply, custom emojis, voice waveforms, media sharing, and instant delete-for-everyone protections.
              </p>
            </div>

            {/* Bento Card 2: Voice Calling */}
            <div className="p-6 rounded-2xl bg-white/95 border border-stone-200/90 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#20D9C3]/15 text-[#20D9C3]">
                  <PhoneCall className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Voice Calling</h3>
                  <span className="text-[11px] text-slate-500">High-Fidelity Audio</span>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Crystal-clear audio without ever exchanging phone numbers. Integrated noise suppression and dynamic connection quality monitoring.
              </p>
            </div>

            {/* Bento Card 3: Video Calling */}
            <div className="p-6 rounded-2xl bg-white/95 border border-stone-200/90 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#FF4F9A]/15 text-[#FF4F9A]">
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Video Calling</h3>
                  <span className="text-[11px] text-slate-500">Full-Screen &amp; Picture-in-Picture</span>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Experience ultra-low-latency video with front/back camera toggling, local preview overlay, and zero background recording.
              </p>
            </div>

            {/* Bento Card 4: Verified Profiles */}
            <div className="p-6 rounded-2xl bg-white/95 border border-stone-200/90 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-400/15 text-amber-500">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Verified Badges</h3>
                  <span className="text-[11px] text-slate-500">Real Adults, No Bots</span>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Confidential identity verification queues reviewed by human administrators. ID documents are never publicly accessible.
              </p>
            </div>

            {/* Bento Card 5: Privacy Center */}
            <div className="p-6 rounded-2xl bg-white/95 border border-stone-200/90 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-400/15 text-emerald-600">
                  <EyeOff className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Privacy Controls</h3>
                  <span className="text-[11px] text-slate-500">Granular Visibility</span>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Toggle online status, last seen, read receipts, and discovery reachability anytime. Download your full data archive or delete your account in one click.
              </p>
            </div>

            {/* Bento Card 6: Safety Center */}
            <div className="p-6 rounded-2xl bg-white/95 border border-stone-200/90 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-rose-500/15 text-rose-500">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Safety Center</h3>
                  <span className="text-[11px] text-slate-500">One-Tap Block &amp; Report</span>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Immediate protection against harassment, spam, and financial scams. Dedicated incident triage and transparent audit tracking.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Premium CTA Section */}
      <section className="py-24 relative overflow-hidden text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#7C5CFF]/15 border border-[#7C5CFF]/30 text-xs text-[#7C5CFF]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Encrypted. Intimate. Verified.</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
            “Your conversations should stay yours.”
          </h2>

          <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
            Join thousands of verified adults having real, spontaneous, and private conversations right now.
          </p>

          <div className="pt-4 flex flex-wrap justify-center gap-4">
            <button
              onClick={() => onOpenAuth('register')}
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#7C5CFF] to-[#20D9C3] text-white text-sm font-bold shadow-xl shadow-[#7C5CFF]/20 hover:opacity-95 transition-all"
            >
              Get Started (18+)
            </button>
            <button
              onClick={onExplore}
              className="px-8 py-3.5 rounded-xl bg-white hover:bg-stone-50 text-slate-800 text-sm font-semibold border border-stone-200 shadow-xs transition-colors"
            >
              Browse Profiles
            </button>
          </div>
        </div>
      </section>

      {/* Quiet Footer */}
      <footer className="py-8 border-t border-white/[0.06] text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">VibeTalk</span>
            <span>·</span>
            <span>Connect. Talk. Share.</span>
            <span>·</span>
            <span className="text-[#FF4F9A]">Strictly 18+</span>
          </div>
          <div className="flex items-center gap-4">
            <span>End-to-End Signaling</span>
            <span>Zero Call Recording</span>
            <span>© 2026 VibeTalk</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
