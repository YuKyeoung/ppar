'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useAnimation } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { getAnimal } from '@/constants/animals';
import { SFX } from '@/utils/sound';
import { haptic } from '@/utils/haptic';
import TapButton from '@/components/game/TapButton';

export default function Roulette() {
  const router = useRouter();
  const { players, setResult } = useGameStore();
  const [spinning, setSpinning] = useState(false);
  const [loserIdx, setLoserIdx] = useState<number | null>(null);
  const controls = useAnimation();
  const currentRotation = useRef(0);

  useEffect(() => {
    if (players.length < 2) router.replace('/');
  }, [players.length, router]);

  if (players.length < 2) return null;

  const segmentAngle = 360 / players.length;
  const radius = 130;

  const spin = async () => {
    if (spinning) return;
    setSpinning(true);
    setLoserIdx(null);
    SFX.tick();
    haptic('medium');

    const chosenIdx = Math.floor(Math.random() * players.length);
    const targetAngle = 360 * 12 + (360 - chosenIdx * segmentAngle - segmentAngle / 2);
    const newRotation = currentRotation.current + targetAngle;

    await controls.start({
      rotate: newRotation,
      transition: { duration: 10, ease: [0.2, 0.8, 0.3, 1] },
    });

    currentRotation.current = newRotation;
    setLoserIdx(chosenIdx);
    setSpinning(false);
    SFX.fail();
    haptic('heavy');

    setTimeout(() => {
      const loser = { ...players[chosenIdx], score: 0 };
      const others = players
        .filter((_, i) => i !== chosenIdx)
        .map((p, i, arr) => ({ ...p, score: arr.length - i }));
      const rankings = [...others, loser];
      setResult({ rankings, loser, gameName: '룰렛' });
      router.push('/result');
    }, 3000);
  };

  return (
    <div className="flex flex-col items-center min-h-dvh px-5 py-6 gap-5">
      <div className="flex items-center gap-3 w-full">
        <motion.button
          whileTap={{ y: 2 }}
          onClick={() => router.push('/games')}
          className="w-11 h-11 rounded-[14px] border-none bg-gradient-to-br from-white to-coffee-100 shadow-clay flex items-center justify-center text-xl cursor-pointer"
        >
          ←
        </motion.button>
        <h2 className="text-[22px] font-black text-coffee-800">🎡 룰렛</h2>
      </div>

      {/* Player Avatars */}
      <div className="flex flex-wrap justify-center gap-3">
        {players.map((p) => {
          const animal = getAnimal(p.animal);
          return (
            <div key={p.id} className="flex flex-col items-center gap-1">
              <span className="text-2xl">{animal?.emoji}</span>
              <span className="text-[10px] font-bold text-coffee-600">{p.name}</span>
            </div>
          );
        })}
      </div>

      <p className="text-sm font-bold text-coffee-400">
        {spinning
          ? '돌아가는 중...'
          : loserIdx !== null
            ? `${players[loserIdx].name} 당첨!`
            : '탭해서 룰렛을 돌려보세요!'}
      </p>

      {/* Wheel */}
      <div
        className="relative flex items-center justify-center"
        style={{ width: radius * 2 + 20, height: radius * 2 + 20 }}
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 text-3xl z-10">
          ▼
        </div>
        <motion.div
          animate={controls}
          className="relative rounded-full bg-gradient-to-br from-white to-coffee-100 shadow-clay"
          style={{ width: radius * 2, height: radius * 2 }}
        >
          {players.map((p, i) => {
            const animal = getAnimal(p.animal);
            const angle = (i * segmentAngle - 90) * (Math.PI / 180);
            const x = Math.cos(angle) * (radius * 0.65) + radius;
            const y = Math.sin(angle) * (radius * 0.65) + radius;
            return (
              <motion.div
                key={p.id}
                className="absolute flex flex-col items-center"
                style={{ left: x, top: y, transform: 'translate(-50%, -50%)' }}
                animate={
                  loserIdx === i
                    ? { scale: [1, 1.4, 1.2], opacity: 1 }
                    : loserIdx !== null
                      ? { opacity: 0.4 }
                      : {}
                }
                transition={{ duration: 0.4 }}
              >
                <span className="text-3xl">{animal?.emoji}</span>
                <span className="text-[10px] font-bold text-coffee-600 mt-0.5">
                  {p.name}
                </span>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Spin Button */}
      <div className="mt-auto w-full">
        <TapButton onClick={spin} disabled={spinning || loserIdx !== null}>
          {spinning ? '🌀 돌아가는 중...' : '🎡 룰렛 돌리기!'}
        </TapButton>
      </div>
    </div>
  );
}
