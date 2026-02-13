'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { useGameStore } from '@/stores/gameStore';

export default function Home() {
  const router = useRouter();
  const setMode = useGameStore((s) => s.setMode);
  const [showHelp, setShowHelp] = useState(false);

  const handleSolo = () => {
    setMode('solo');
    router.push('/solo/setup');
  };

  const handleMulti = () => {
    setMode('multi');
    router.push('/multi/setup');
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

      <div className="flex gap-4 mt-4">
        <button
          onClick={() => setShowHelp(true)}
          className="text-coffee-400 text-sm font-bold bg-transparent border-none cursor-pointer"
        >
          게임 방법 보기
        </button>
        <button
          onClick={() => router.push('/join')}
          className="text-accent text-sm font-bold bg-transparent border-none cursor-pointer"
        >
          방 코드로 입장
        </button>
      </div>

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

      <AnimatePresence>
        {showHelp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center"
            onClick={() => setShowHelp(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-[393px] bg-white rounded-t-[28px] p-6 pb-10 shadow-clay"
            >
              <div className="w-10 h-1 bg-coffee-200 rounded-full mx-auto mb-5" />
              <h3 className="text-xl font-black text-coffee-800 mb-4">게임 방법</h3>
              <div className="flex flex-col gap-3 text-sm text-coffee-600 font-medium">
                <div className="flex gap-3 items-start">
                  <span className="text-lg">1️⃣</span>
                  <p><strong>모드 선택</strong> — 한 폰으로 돌려쓰기 또는 각자 폰으로 참여</p>
                </div>
                <div className="flex gap-3 items-start">
                  <span className="text-lg">2️⃣</span>
                  <p><strong>인원 & 동물</strong> — 참가자 수를 정하고 동물 캐릭터를 골라요</p>
                </div>
                <div className="flex gap-3 items-start">
                  <span className="text-lg">3️⃣</span>
                  <p><strong>미니게임 선택</strong> — 12가지 미니게임 중 하나를 골라요</p>
                </div>
                <div className="flex gap-3 items-start">
                  <span className="text-lg">4️⃣</span>
                  <p><strong>게임 진행</strong> — 주사위, 달리기, 퀴즈 등 재밌게 대결!</p>
                </div>
                <div className="flex gap-3 items-start">
                  <span className="text-lg">5️⃣</span>
                  <p><strong>결과 발표</strong> — 꼴찌가 커피 사기! ☕</p>
                </div>
              </div>
              <Button variant="secondary" onClick={() => setShowHelp(false)} className="mt-5">
                닫기
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
