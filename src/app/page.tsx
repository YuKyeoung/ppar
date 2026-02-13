'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';
import { unlockAudio } from '@/utils/sound';

export default function Home() {
  const router = useRouter();

  const handleStart = () => {
    unlockAudio();
    router.push('/setup');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-dvh px-5 py-6 bg-gradient-to-b from-cream to-coffee-100">
      <div className="flex-1" />

      <motion.div
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        className="text-7xl"
      >
        ☕
      </motion.div>

      <h1 className="font-display text-4xl font-black text-coffee-800 text-center mt-3">
        Coffee Derby
      </h1>

      <p className="text-[15px] font-bold text-coffee-600 mt-2 mb-10 text-center">
        누가 커피 살래? 터치 한 번에 결정!
      </p>

      <div className="w-full max-w-xs">
        <Button variant="primary" onClick={handleStart}>
          시작하기
        </Button>
      </div>

      <div className="flex-1" />

      <motion.div
        animate={{ x: [-20, 20, -20] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        className="flex gap-2 text-[28px] mt-6"
      >
        <span>🐱</span>
        <span>🐶</span>
        <span>🐰</span>
        <span>🐻</span>
        <span>🦊</span>
        <span>🐼</span>
      </motion.div>
    </div>
  );
}
