'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { getAnimal } from '@/constants/animals';
import { SFX } from '@/utils/sound';
import { haptic } from '@/utils/haptic';

const DICE_FACES = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

export default function Dice() {
  const router = useRouter();
  const { players, setResult } = useGameStore();
  const [rolling, setRolling] = useState(false);
  const [done, setDone] = useState(false);
  const [displayValues, setDisplayValues] = useState<number[]>(() =>
    players.map(() => 0)
  );
  const [finalValues, setFinalValues] = useState<number[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (players.length < 2) router.replace('/');
  }, [players.length, router]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const roll = useCallback(() => {
    if (rolling || done) return;
    setRolling(true);
    SFX.roll();
    haptic('medium');

    // Pre-calculate final values (1-6)
    const finals = players.map(() => Math.floor(Math.random() * 6) + 1);

    // Rapid flicker animation for 1.5s
    intervalRef.current = setInterval(() => {
      setDisplayValues(players.map(() => Math.floor(Math.random() * 6)));
    }, 80);

    setTimeout(() => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
      setDisplayValues(finals.map((v) => v - 1)); // index for DICE_FACES
      setFinalValues(finals);
      setRolling(false);
      setDone(true);
      SFX.success();
      haptic('heavy');

      // Determine loser (lowest score, ties broken randomly)
      const minVal = Math.min(...finals);
      const losersIndices = finals
        .map((v, i) => (v === minVal ? i : -1))
        .filter((i) => i !== -1);
      const loserIdx =
        losersIndices[Math.floor(Math.random() * losersIndices.length)];

      setTimeout(() => {
        const ranked = players
          .map((p, i) => ({ ...p, score: finals[i] }))
          .sort((a, b) => b.score - a.score);

        const loser = { ...players[loserIdx], score: finals[loserIdx] };
        setResult({ rankings: ranked, loser, gameName: '주사위' });
        router.push('/result');
      }, 3000);
    }, 8000);
  }, [rolling, done, players, setResult, router]);

  if (players.length < 2) return null;

  return (
    <div className="flex flex-col items-center min-h-dvh px-5 py-6 gap-5">
      {/* Header */}
      <div className="flex items-center gap-3 w-full">
        <motion.button
          whileTap={{ y: 2 }}
          onClick={() => router.push('/games')}
          className="w-11 h-11 rounded-[14px] border-none bg-gradient-to-br from-white to-coffee-100 shadow-clay flex items-center justify-center text-xl cursor-pointer"
        >
          ←
        </motion.button>
        <h2 className="text-[22px] font-black text-coffee-800">🎲 주사위</h2>
      </div>

      <p className="text-sm font-bold text-coffee-400">
        {rolling
          ? '주사위 굴리는 중...'
          : done
            ? '결과 확인!'
            : '탭 한 번으로 모두 굴리기!'}
      </p>

      {/* All Players Dice Grid */}
      <div className="flex-1 flex items-center justify-center w-full">
        <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
          {players.map((p, i) => {
            const animal = getAnimal(p.animal);
            const isLoser =
              done &&
              finalValues.length > 0 &&
              finalValues[i] === Math.min(...finalValues);
            return (
              <motion.div
                key={p.id}
                className="flex flex-col items-center gap-2 p-4 rounded-clay bg-gradient-to-br from-white to-coffee-100 shadow-clay"
                animate={
                  done
                    ? isLoser
                      ? { scale: [1, 1.1, 1.05], borderColor: '#FF6B6B' }
                      : { opacity: 0.6 }
                    : {}
                }
                transition={{ duration: 0.4 }}
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-xl">{animal?.emoji}</span>
                  <span className="text-xs font-bold text-coffee-700">
                    {p.name}
                  </span>
                </div>
                <motion.span
                  className="text-5xl"
                  animate={rolling ? { rotate: [0, 15, -15, 10, -10, 0] } : {}}
                  transition={
                    rolling
                      ? { duration: 0.3, repeat: Infinity, repeatType: 'loop' }
                      : {}
                  }
                >
                  {DICE_FACES[displayValues[i]] || DICE_FACES[0]}
                </motion.span>
                {done && finalValues[i] !== undefined && (
                  <motion.span
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm font-black text-coffee-700"
                  >
                    {finalValues[i]}점
                  </motion.span>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Roll Button */}
      <div className="mt-auto w-full">
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={roll}
          disabled={rolling || done}
          className="w-full py-4 rounded-clay border-none font-display font-black text-lg bg-gradient-to-br from-accent to-[#FF9F5F] text-white shadow-clay-accent cursor-pointer disabled:opacity-50"
        >
          {rolling ? '🌀 굴리는 중...' : '🎲 주사위 굴리기!'}
        </motion.button>
      </div>
    </div>
  );
}
