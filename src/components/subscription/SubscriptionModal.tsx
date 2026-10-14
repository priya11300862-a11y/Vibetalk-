import React from 'react';
import { X, Sparkles, Check, ShieldCheck, Zap, Crown } from 'lucide-react';
import { useSocial } from '../../contexts/SocialContext';
import { useAuth } from '../../contexts/AuthContext';
import { SubscriptionTier } from '../../types';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose }) => {
  const { currentUser } = useAuth();
  const { upgradeSubscription } = useSocial();

  if (!isOpen) return null;

  const handleSelectTier = (tier: SubscriptionTier) => {
    upgradeSubscription(tier);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto text-left">
      <div className="w-full max-w-3xl rounded-3xl bg-[#0D131D] border border-[#7C5CFF]/30 p-6 sm:p-8 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center max-w-md mx-auto mb-8 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#7C5CFF]/15 border border-[#7C5CFF]/30 text-xs text-[#7C5CFF] font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Elevate Your Presence</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            VibeTalk VIP Membership
          </h2>
          <p className="text-xs text-slate-400">
            Enjoy enhanced profile discovery, VIP badge recognition, and priority matching.
          </p>
        </div>

        {/* Essential Safety Free Notice */}
        <div className="mb-6 p-3 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center gap-2.5 text-xs text-slate-300">
          <ShieldCheck className="w-4 h-4 text-[#20D9C3] shrink-0" />
          <span>
            <strong>Zero compromises on privacy:</strong> Essential safety features, call encryption, blocking, and report tools are unconditionally 100% free for everyone.
          </span>
        </div>

        {/* Tiers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* FREE TIER */}
          <div className="p-5 rounded-2xl bg-[#141B26] border border-white/[0.06] flex flex-col justify-between space-y-4">
            <div>
              <h3 className="font-bold text-white text-sm">Free Basic</h3>
              <div className="text-2xl font-bold text-white mt-2">$0</div>
              <p className="text-[11px] text-slate-400 mt-1">Standard adult social communication.</p>

              <ul className="mt-4 space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#20D9C3]" />
                  <span>Private Text Messaging</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#20D9C3]" />
                  <span>Encrypted Voice &amp; Video Calls</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#20D9C3]" />
                  <span>Full Safety &amp; Privacy Center</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => handleSelectTier('free')}
              className={`w-full py-2 rounded-xl text-xs font-semibold transition-colors ${
                currentUser?.subscriptionTier === 'free'
                  ? 'bg-white/10 text-slate-400 cursor-default'
                  : 'bg-white/5 hover:bg-white/10 text-white'
              }`}
            >
              {currentUser?.subscriptionTier === 'free' ? 'Current Plan' : 'Downgrade to Free'}
            </button>
          </div>

          {/* GOLD VIP */}
          <div className="p-5 rounded-2xl bg-[#141B26] border border-[#7C5CFF]/40 relative flex flex-col justify-between space-y-4 shadow-lg shadow-[#7C5CFF]/10">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-white text-sm flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>Gold VIP</span>
                </h3>
              </div>
              <div className="text-2xl font-bold text-white mt-2">
                $14.99 <span className="text-xs font-normal text-slate-400">/ mo</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">For frequent social discoverers.</p>

              <ul className="mt-4 space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#20D9C3]" />
                  <span>All Free Features</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#20D9C3]" />
                  <span>Gold VIP Badge on Profile</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#20D9C3]" />
                  <span>2x Profile Discovery Boost</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#20D9C3]" />
                  <span>Unlimited Discover Filters</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => handleSelectTier('gold_vip')}
              className={`w-full py-2.5 rounded-xl text-xs font-bold transition-colors ${
                currentUser?.subscriptionTier === 'gold_vip'
                  ? 'bg-[#7C5CFF]/20 text-[#7C5CFF] cursor-default'
                  : 'bg-[#7C5CFF] hover:bg-[#6846f3] text-white shadow-md shadow-[#7C5CFF]/25'
              }`}
            >
              {currentUser?.subscriptionTier === 'gold_vip' ? 'Current Plan' : 'Activate Gold VIP'}
            </button>
          </div>

          {/* BLACK ELITE */}
          <div className="p-5 rounded-2xl bg-[#141B26] border border-[#FF4F9A]/40 relative flex flex-col justify-between space-y-4 shadow-lg shadow-[#FF4F9A]/10">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-white text-sm flex items-center gap-1.5">
                  <Crown className="w-4 h-4 text-[#FF4F9A]" />
                  <span>Black Elite</span>
                </h3>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#FF4F9A]/20 text-[#FF4F9A]">
                  TOP TIER
                </span>
              </div>
              <div className="text-2xl font-bold text-white mt-2">
                $29.99 <span className="text-xs font-normal text-slate-400">/ mo</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Maximum luxury and prominence.</p>

              <ul className="mt-4 space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#20D9C3]" />
                  <span>All Gold VIP Features</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#20D9C3]" />
                  <span>Black Elite Holographic Badge</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#20D9C3]" />
                  <span>5x Priority Matching Boost</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#20D9C3]" />
                  <span>Concierge Verification Support</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => handleSelectTier('black_elite')}
              className={`w-full py-2.5 rounded-xl text-xs font-bold transition-colors ${
                currentUser?.subscriptionTier === 'black_elite'
                  ? 'bg-[#FF4F9A]/20 text-[#FF4F9A] cursor-default'
                  : 'bg-gradient-to-r from-[#7C5CFF] to-[#FF4F9A] text-white shadow-md'
              }`}
            >
              {currentUser?.subscriptionTier === 'black_elite' ? 'Current Plan' : 'Join Black Elite'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
