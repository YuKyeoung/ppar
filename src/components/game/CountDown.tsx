'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SFX } from '@/utils/sound';
import { haptic } from '@/utils/haptic';

interface CountDownProps {
  from?: number;
  onComplete: () => void;
}

export default function CountDown({ from = 3, onComplete }: CountDownProps) {
  const [count, setCount] = useState(from);

  useEffect(() => {
    if (count === 0) {
      SFX.countdownGo();
      haptic('heavy');
      onComplete();
      return;
    }
    SFX.countdownTick();
    haptic('light');
    const timer = setTimeout(() => setCount(count - 1), 800);
    return () => clearTimeout(timer);
  }, [count, onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-coffee-800/40 backdrop-blur-sm">
      <AnimatePresence mode="wait">
        <motion.div
          key={count}
          initial={{ scale: 0.3, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 2, opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="text-8xl font-black font-display text-cream drop-shadow-lg"
        >
          {count === 0 ? 'GO!' : count}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
