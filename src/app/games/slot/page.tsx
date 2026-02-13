'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { getAnimal } from '@/constants/animals';
import { SFX } from '@/utils/sound';
import { haptic } from '@/utils/haptic';

const SYMBOLS = ['🍒', '🍋', '🍊', '⭐', '💎', '7️⃣'];
const VALUES = [1, 2, 3, 4, 5, 6];

interface SlotResult {
  symbols: number[]; // indices into SYMBOLS
  sum: number;
}

export default function Slot() {
  const router = useRouter();
  const { players, setResult } = useGameStore();
  const [spinning, setSpinning] = useState(false);
  const [done, setDone] = useState(false);
  const [reelsStopped, setReelsStopped] = useState([false, false, false]);
  const [displaySymbols, setDisplaySymbols] = useState<number[][]>(() =>
    players.map(() => [0, 0, 0])
  );
  const [results, setResults] = useState<SlotResult[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (players.length < 2) router.replace('/');
  }, [players.length, router]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const spinSlots = useCallback(() => {
    if (spinning || done) return;
    setSpinning(true);
    setReelsStopped([false, false, false]);
    SFX.tick();
    haptic('medium');

    // Pre-calculate final results for each player
    const finalResults: SlotResult[] = players.map(() => {
      const symbols = [
        Math.floor(Math.random() * SYMBOLS.length),
        Math.floor(Math.random() * SYMBOLS.length),
        Math.floor(Math.random() * SYMBOLS.length),
      ];
      const sum = symbols.reduce((acc, idx) => acc + VALUES[idx], 0);
      return { symbols, sum };
    });

    // Rapid flicker animation
    intervalRef.current = setInterval(() => {
      setDisplaySymbols(
        players.map(() => [
          Math.floor(Math.random() * SYMBOLS.length),
          Math.floor(Math.random() * SYMBOLS.length),
          Math.floor(Math.random() * SYMBOLS.length),
        ])
      );
    }, 80);

    // Stop reel 1 at 5s
    setTimeout(() => {
      setReelsStopped((prev) => [true, prev[1], prev[2]]);
      setDisplaySymbols((prev) =>
        prev.map((syms, pi) => [finalResults[pi].symbols[0], syms[1], syms[2]])
      );
      SFX.tap();
      haptic('light');
    }, 5000);

    // Stop reel 2 at 8s
    setTimeout(() => {
      setReelsStopped((prev) => [prev[0], true, prev[2]]);
      setDisplaySymbols((prev) =>
        prev.map((syms, pi) => [
          finalResults[pi].symbols[0],
          finalResults[pi].symbols[1],
          syms[2],
        ])
      );
      SFX.tap();
      haptic('light');
    }, 8000);

    // Stop reel 3 at 11s
    setTimeout(() => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
      setReelsStopped([true, true, true]);
      setDisplaySymbols(finalResults.map((r) => r.symbols));
      setResults(finalResults);
      setSpinning(false);
      setDone(true);
      SFX.success();
      haptic('heavy');

      // Determine loser (lowest sum, ties broken randomly)
      const minSum = Math.min(...finalResults.map((r) => r.sum));
      const losersIndices = finalResults
        .map((r, i) => (r.sum === minSum ? i : -1))
        .filter((i) => i !== -1);
      const loserIdx =
        losersIndices[Math.floor(Math.random() * losersIndices.length)];

      setTimeout(() => {
        const ranked = players
          .map((p, i) => ({ ...p, score: finalResults[i].sum }))
          .sort((a, b) => b.score - a.score);
        const loser = { ...players[loserIdx], score: finalResults[loserIdx].sum };
        setResult({ rankings: ranked, loser, gameName: '슬롯머신' });
        router.push('/result');
      }, 3000);
    }, 11000);
  }, [spinning, done, players, setResult, router]);

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
        <h2 className="text-[22px] font-black text-coffee-800">🎰 슬롯머신</h2>
      </div>

      <p className="text-sm font-bold text-coffee-400">
        {spinning
          ? '릴이 돌아가는 중...'
          : done
            ? '결과 확인!'
            : '탭 한 번으로 슬롯 돌리기!'}
      </p>

      {/* Slot Results Grid */}
      <div className="flex-1 flex items-center justify-center w-full">
        <div className="flex flex-col gap-3 w-full max-w-sm">
          {players.map((p, pi) => {
            const animal = getAnimal(p.animal);
            const result = results[pi];
            const isLoser =
              done &&
              result &&
              result.sum === Math.min(...results.map((r) => r.sum));
            return (
              <motion.div
                key={p.id}
                className="flex items-center gap-3 p-3 rounded-clay bg-gradient-to-br from-white to-coffee-100 shadow-clay"
                animate={
                  done
                    ? isLoser
                      ? {
                          scale: [1, 1.05, 1.02],
                          boxShadow: '0 0 20px rgba(255,107,107,0.5)',
                        }
                      : { opacity: 0.6 }
                    : {}
                }
                transition={{ duration: 0.4 }}
              >
                {/* Player info */}
                <div className="flex flex-col items-center gap-0.5 min-w-[50px]">
                  <span className="text-xl">{animal?.emoji}</span>
                  <span className="text-[10px] font-bold text-coffee-700">
                    {p.name}
                  </span>
                </div>

                {/* 3 Reels */}
                <div className="flex gap-2 flex-1 justify-center">
                  {[0, 1, 2].map((reelIdx) => (
                    <motion.div
                      key={reelIdx}
                      className="w-12 h-12 rounded-lg bg-coffee-800 flex items-center justify-center"
                      animate={
                        spinning && !reelsStopped[reelIdx]
                          ? { y: [0, -3, 3, 0] }
                          : {}
                      }
                      transition={
                        spinning && !reelsStopped[reelIdx]
                          ? {
                              duration: 0.15,
                              repeat: Infinity,
                              repeatType: 'loop',
                            }
                          : {}
                      }
                    >
                      <span className="text-2xl">
                        {SYMBOLS[displaySymbols[pi]?.[reelIdx] ?? 0]}
                      </span>
                    </motion.div>
                  ))}
                </div>

                {/* Score */}
                <div className="min-w-[40px] text-right">
                  {done && result && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-sm font-black text-coffee-700"
                    >
                      {result.sum}점
                    </motion.span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Spin Button */}
      <div className="mt-auto w-full">
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={spinSlots}
          disabled={spinning || done}
          className="w-full py-4 rounded-clay border-none font-display font-black text-lg bg-gradient-to-br from-accent to-[#FF9F5F] text-white shadow-clay-accent cursor-pointer disabled:opacity-50"
        >
          {spinning ? '🌀 돌아가는 중...' : '🎰 돌리기!'}
        </motion.button>
      </div>
    </div>
  );
}
