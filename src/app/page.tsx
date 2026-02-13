'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { useGameStore } from '@/stores/gameStore';

export default function Home() {
  const router = useRouter();
  const setMode = useGameStore((s) => s.setMode);

  const handleSolo = () => {
    setMode('solo');
    router.push('/solo/setup');
  };

  const handleMulti = () => {
    setMode('multi');
    router.push('/solo/setup'); // TODO: Phase 6에서 멀티 대기실로 변경
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-dvh px-5 py-6 bg-gradient-to-b from-cream to-coffee-100">
      <div className="flex-1" />

      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        className="text-6xl"
      >
        ☕
      </motion.div>

      <h1 className="text-4xl font-black text-coffee-800 text-center mt-2">
        Coffee Derby
      </h1>

      <p className="text-[15px] font-bold text-coffee-600 mt-2 mb-8">
        동물 친구들과 커피내기 한 판!
      </p>

      <div className="w-full flex flex-col gap-3.5">
        <Button variant="primary" onClick={handleSolo}>
          📱  한 폰으로 같이!
        </Button>
        <Button variant="accent" onClick={handleMulti}>
          📲  각자 폰으로!
        </Button>
      </div>

      <button className="text-coffee-400 text-sm font-bold mt-4 bg-transparent border-none cursor-pointer">
        게임 방법 보기
      </button>

      <motion.div
        animate={{ x: [-20, 20, -20] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        className="flex gap-1.5 text-[28px] mt-6"
      >
        <span>🐱</span>
        <span>🐶</span>
        <span>🐰</span>
        <span>🐻</span>
        <span>🦊</span>
        <span>🐼</span>
      </motion.div>

      <div className="flex-1" />
    </div>
  );
}
