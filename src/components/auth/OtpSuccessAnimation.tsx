import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';

interface OtpSuccessAnimationProps {
  message?: string;
}

export const OtpSuccessAnimation: React.FC<OtpSuccessAnimationProps> = ({
  message = 'Verification Successful!',
}) => {
  useEffect(() => {
    // Subtle celebratory confetti burst with tactile emerald and golden colors
    try {
      confetti({
        particleCount: 35,
        spread: 60,
        origin: { y: 0.65 },
        colors: ['#10B981', '#34D399', '#6EE7B7', '#FBBF24', '#5244E3'],
        disableForReducedMotion: true,
      });
    } catch {
      // Fallback gracefully if canvas-confetti is unsupported
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-4 space-y-3">
      {/* Lottie-style SVG Checkmark with Radial Burst */}
      <div className="relative flex items-center justify-center">
        {/* Pulsing Radial Aura */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: [0.8, 1.3, 1.1], opacity: [0.3, 0.7, 0.4] }}
          transition={{ duration: 1.2, repeat: Infinity, repeatType: 'reverse' }}
          className="absolute w-20 h-20 rounded-full bg-emerald-400/25 blur-md"
        />

        {/* Outer Circular Ring with Draw Animation */}
        <svg className="w-18 h-18 text-emerald-500" viewBox="0 0 52 52">
          <motion.circle
            cx="26"
            cy="26"
            r="23"
            fill="none"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
          {/* Inner Checkmark with Path Drawing */}
          <motion.path
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14 27l7 7 17-17"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.35, ease: 'easeOut' }}
          />
        </svg>

        {/* Orbiting Sparkles */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.3 }}
          className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-400 shadow-sm animate-ping"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.3 }}
        className="text-center space-y-0.5"
      >
        <span className="text-sm font-black text-emerald-600 block tracking-tight">
          {message}
        </span>
        <span className="text-[11px] font-semibold text-slate-500">
          Authenticated via MiniMoth
        </span>
      </motion.div>
    </div>
  );
};
