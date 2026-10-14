import React, { useState } from 'react';
import { X, Sparkles, Check, Gift, Zap, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface CoinWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClaimDailyCoins: () => void;
  isClaimed: boolean;
}

export const CoinWalletModal: React.FC<CoinWalletModalProps> = ({
  isOpen,
  onClose,
  onClaimDailyCoins,
  isClaimed,
}) => {
  const { currentUser, updateCurrentUserProfile } = useAuth();
  const [purchaseSuccess, setPurchaseSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentCoins = currentUser?.coins ?? 80;

  const handleBuyCoins = (amount: number, price: string) => {
    updateCurrentUserProfile({ coins: currentCoins + amount });
    setPurchaseSuccess(`Successfully added +${amount} coins to your wallet!`);
    setTimeout(() => {
      setPurchaseSuccess(null);
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto text-left">
      <div className="w-full max-w-md rounded-3xl bg-[#0F1622] border border-amber-500/30 p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with Golden Emblem */}
        <div className="text-center mb-6 space-y-2">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-300 to-amber-600 p-1 mx-auto shadow-xl shadow-amber-500/25 flex items-center justify-center">
            <div className="w-full h-full rounded-full bg-[#101722] flex items-center justify-center text-amber-400">
              <span className="text-2xl font-black">🪙</span>
            </div>
          </div>

          <h2 className="text-xl font-bold text-white tracking-tight">VibeTalk Coins &amp; Wallet</h2>
          <div className="flex items-center justify-center gap-1.5 text-2xl font-black text-amber-400 font-mono">
            <span>{currentCoins}</span>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Coins Balance</span>
          </div>
        </div>

        {purchaseSuccess && (
          <div className="mb-4 p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 text-[#20D9C3] shrink-0" />
            <span>{purchaseSuccess}</span>
          </div>
        )}

        {/* Daily Bounty Card */}
        <div className="mb-5 p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent border border-amber-500/30 flex items-center justify-between gap-3">
          <div className="space-y-0.5">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Daily Bonus</span>
            </span>
            <p className="text-xs font-bold text-white">150 Free Coins</p>
            <p className="text-[10px] text-slate-400">Claimable every 24 hours</p>
          </div>

          <button
            onClick={onClaimDailyCoins}
            disabled={isClaimed}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${
              isClaimed
                ? 'bg-white/10 text-slate-400 cursor-default'
                : 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 hover:brightness-110 shadow-amber-500/20'
            }`}
          >
            {isClaimed ? 'Claimed ✓' : 'Claim Now'}
          </button>
        </div>

        {/* Coin Packs */}
        <div className="space-y-2.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Top Up Coins
          </span>

          <div
            onClick={() => handleBuyCoins(100, '$1.99')}
            className="p-3.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/5 hover:border-amber-500/30 flex items-center justify-between cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center text-lg">
                🪙
              </div>
              <div>
                <span className="text-xs font-bold text-white block">100 Coins</span>
                <span className="text-[10px] text-slate-400">Casual calls &amp; chats</span>
              </div>
            </div>
            <span className="px-3 py-1.5 rounded-xl bg-white/10 text-xs font-bold text-white">
              $1.99
            </span>
          </div>

          <div
            onClick={() => handleBuyCoins(500, '$7.99')}
            className="p-3.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-amber-500/30 flex items-center justify-between cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center text-lg">
                💰
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white">500 Coins</span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#FF4F9A] text-white">
                    POPULAR
                  </span>
                </div>
                <span className="text-[10px] text-slate-400">Extended HD video calls</span>
              </div>
            </div>
            <span className="px-3 py-1.5 rounded-xl bg-[#7C5CFF] text-xs font-bold text-white shadow-md shadow-[#7C5CFF]/20">
              $7.99
            </span>
          </div>

          <div
            onClick={() => handleBuyCoins(1200, '$14.99')}
            className="p-3.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/5 hover:border-amber-500/30 flex items-center justify-between cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center text-lg">
                👑
              </div>
              <div>
                <span className="text-xs font-bold text-white block">1,200 Coins</span>
                <span className="text-[10px] text-slate-400">Best value package</span>
              </div>
            </div>
            <span className="px-3 py-1.5 rounded-xl bg-white/10 text-xs font-bold text-white">
              $14.99
            </span>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-[#20D9C3]" />
          <span>Encrypted payment processing &amp; instant delivery</span>
        </div>
      </div>
    </div>
  );
};
