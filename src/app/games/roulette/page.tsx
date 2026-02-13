'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useAnimation } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { getAnimal } from '@/constants/animals';
import CountDown from '@/components/game/CountDown';

export default function Roulette() {
  const router = useRouter();
  const { players, setResult, selectedGame } = useGameStore();
  const [phase, setPhase] = useState<'countdown' | 'playing' | 'done'>('countdown');
  const [spinning, setSpinning] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const controls = useAnimation();
  const currentRotation = useRef(0);

  const handleCountdownComplete = useCallback(() => setPhase('playing'), []);

  // Guard: redirect if no players (direct access / refresh)
  useEffect(() => {
    if (players.length < 2) router.replace('/');
  }, [players.length, router]);

  if (players.length < 2) return null;

  const spin = async () => {
    if (spinning) return;
    setSpinning(true);
    setSelectedIdx(null);

    const loserIdx = Math.floor(Math.random() * players.length);
    const segmentAngle = 360 / players.length;
    const targetAngle = 360 * 5 + (360 - loserIdx * segmentAngle - segmentAngle / 2);
    const newRotation = currentRotation.current + targetAngle;

    await controls.start({
      rotate: newRotation,
      transition: { duration: 3, ease: [0.2, 0.8, 0.3, 1] },
    });

    currentRotation.current = newRotation;
    setSelectedIdx(loserIdx);
    setSpinning(false);

    setTimeout(() => {
      const others = players.filter((_, i) => i !== loserIdx).map((p, i, arr) => ({ ...p, score: arr.length - i }));
      const loserCopy = { ...players[loserIdx], score: 0 };
      const rankings = [...others, loserCopy];
      setResult({
        rankings,
        loser: loserCopy,
        gameName: selectedGame?.name || '룰렛',
      });
      router.push('/result');
    }, 1500);
  };

  if (phase === 'countdown') {
    return <CountDown onComplete={handleCountdownComplete} />;
  }

  const segmentAngle = 360 / players.length;
  const radius = 130;

  return (
    <div className="flex flex-col items-center min-h-dvh px-5 py-6 gap-5">
      <div className="flex items-center gap-3 w-full">
        <motion.button whileTap={{ y: 2 }} onClick={() => router.push('/games')} className="w-11 h-11 rounded-[14px] border-none bg-gradient-to-br from-white to-coffee-100 shadow-clay flex items-center justify-center text-xl cursor-pointer">←</motion.button>
        <h2 className="text-[22px] font-black text-coffee-800">🎡 룰렛</h2>
      </div>

      <p className="text-sm font-bold text-coffee-400">
        {spinning ? '돌아가는 중...' : selectedIdx !== null ? `${players[selectedIdx].name} 당첨!` : '탭해서 돌려!'}
      </p>

      <div className="relative flex items-center justify-center" style={{ width: radius * 2 + 20, height: radius * 2 + 20 }}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 text-3xl z-10">▼</div>
        <motion.div
          animate={controls}
          className="relative rounded-full bg-gradient-to-br from-white to-coffee-100 shadow-clay"
          style={{ width: radius * 2, height: radius * 2 }}
          onClick={spin}
        >
          {players.map((p, i) => {
            const animal = getAnimal(p.animal);
            const angle = (i * segmentAngle - 90) * (Math.PI / 180);
            const x = Math.cos(angle) * (radius * 0.65) + radius;
            const y = Math.sin(angle) * (radius * 0.65) + radius;
            return (
              <div
                key={p.id}
                className="absolute flex flex-col items-center"
                style={{ left: x, top: y, transform: 'translate(-50%, -50%)' }}
              >
                <span className="text-3xl">{animal?.emoji}</span>
                <span className="text-[10px] font-bold text-coffee-600 mt-0.5">{p.name}</span>
              </div>
            );
          })}
        </motion.div>
      </div>

      <div className="mt-auto w-full">
        <button
          onClick={spin}
          disabled={spinning}
          className="w-full py-4 rounded-clay border-none font-display font-black text-lg bg-gradient-to-br from-accent to-[#FF9F5F] text-white shadow-clay-accent cursor-pointer disabled:opacity-50"
        >
          {spinning ? '🌀 돌아가는 중...' : '🎡 룰렛 돌리기!'}
        </button>
      </div>
    </div>
  );
}
