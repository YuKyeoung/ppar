'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { getAnimal } from '@/constants/animals';
import { SFX } from '@/utils/sound';
import { haptic } from '@/utils/haptic';
import TapButton from '@/components/game/TapButton';

const SYMBOLS = ['🍒', '🍋', '🍊', '⭐', '💎', '7️⃣'];
const VALUES = [1, 2, 3, 4, 5, 6];
const SYMBOL_LABELS = ['1점', '2점', '3점', '4점', '5점', '6점'];

interface SlotResult {
  symbols: number[];
  sum: number;
}

// Vertical scrolling reel component
function SlotReel({
  spinning,
  stopped,
  finalSymbol,
}: {
  spinning: boolean;
  stopped: boolean;
  finalSymbol: number;
}) {
  const reelRef = useRef<HTMLDivElement>(null);
  const [displayIdx, setDisplayIdx] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (spinning && !stopped) {
      let idx = 0;
      intervalRef.current = setInterval(() => {
        idx = (idx + 1) % SYMBOLS.length;
        setDisplayIdx(idx);
      }, 60);
    } else if (stopped) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
      setDisplayIdx(finalSymbol);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [spinning, stopped, finalSymbol]);

  const prevIdx = (displayIdx - 1 + SYMBOLS.length) % SYMBOLS.length;
  const nextIdx = (displayIdx + 1) % SYMBOLS.length;

  return (
    <div className="w-14 h-16 rounded-lg bg-coffee-800 overflow-hidden relative">
      {/* Gradient overlay top */}
      <div
        className="absolute inset-x-0 top-0 h-4 z-10"
        style={{
          background:
            'linear-gradient(to bottom, rgba(62,39,35,0.9), transparent)',
        }}
      />
      {/* Gradient overlay bottom */}
      <div
        className="absolute inset-x-0 bottom-0 h-4 z-10"
        style={{
          background:
            'linear-gradient(to top, rgba(62,39,35,0.9), transparent)',
        }}
      />

      <motion.div
        ref={reelRef}
        className="flex flex-col items-center"
        animate={
          spinning && !stopped
            ? { y: [0, -10, 0] }
            : { y: 0 }
        }
        transition={
          spinning && !stopped
            ? { duration: 0.12, repeat: Infinity, ease: 'linear' }
            : { duration: 0.2, type: 'spring', stiffness: 300 }
        }
      >
        <div className="h-4 flex items-center justify-center opacity-30">
          <span className="text-sm">{SYMBOLS[prevIdx]}</span>
        </div>
        <motion.div
          className="h-8 flex items-center justify-center"
          animate={stopped ? { scale: [1, 1.2, 1] } : {}}
          transition={{ duration: 0.3 }}
        >
          <span className="text-2xl">{SYMBOLS[displayIdx]}</span>
        </motion.div>
        <div className="h-4 flex items-center justify-center opacity-30">
          <span className="text-sm">{SYMBOLS[nextIdx]}</span>
        </div>
      </motion.div>

      {/* Center line */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[2px] bg-accent/40 z-20" />
    </div>
  );
}

export default function Slot() {
  const router = useRouter();
  const { players, setResult } = useGameStore();
  const [spinning, setSpinning] = useState(false);
  const [done, setDone] = useState(false);
  const [reelsStopped, setReelsStopped] = useState([false, false, false]);
  const [results, setResults] = useState<SlotResult[]>([]);
  const [finalResults, setFinalResults] = useState<SlotResult[]>([]);

  useEffect(() => {
    if (players.length < 2) router.replace('/');
  }, [players.length, router]);

  const spinSlots = useCallback(() => {
    if (spinning || done) return;
    setSpinning(true);
    setReelsStopped([false, false, false]);
    SFX.tick();
    haptic('medium');

    const calculated: SlotResult[] = players.map(() => {
      const symbols = [
        Math.floor(Math.random() * SYMBOLS.length),
        Math.floor(Math.random() * SYMBOLS.length),
        Math.floor(Math.random() * SYMBOLS.length),
      ];
      const sum = symbols.reduce((acc, idx) => acc + VALUES[idx], 0);
      return { symbols, sum };
    });
    setFinalResults(calculated);

    // Stop reels sequentially: 1.5s, 2.5s, 3.5s
    setTimeout(() => {
      setReelsStopped([true, false, false]);
      SFX.tap();
      haptic('light');
    }, 1500);

    setTimeout(() => {
      setReelsStopped([true, true, false]);
      SFX.tap();
      haptic('light');
    }, 2500);

    setTimeout(() => {
      setReelsStopped([true, true, true]);
      setResults(calculated);
      setSpinning(false);
      setDone(true);
      SFX.success();
      haptic('heavy');

      const minSum = Math.min(...calculated.map((r) => r.sum));
      const losersIndices = calculated
        .map((r, i) => (r.sum === minSum ? i : -1))
        .filter((i) => i !== -1);
      const loserIdx =
        losersIndices[Math.floor(Math.random() * losersIndices.length)];

      setTimeout(() => {
        const ranked = players
          .map((p, i) => ({ ...p, score: calculated[i].sum }))
          .sort((a, b) => b.score - a.score);
        const loser = {
          ...players[loserIdx],
          score: calculated[loserIdx].sum,
        };
        setResult({ rankings: ranked, loser, gameName: '슬롯머신' });
        router.push('/result');
      }, 3000);
    }, 3500);
  }, [spinning, done, players, setResult, router]);

  if (players.length < 2) return null;

  return (
    <div className="flex flex-col items-center min-h-dvh px-5 py-6 gap-4">
      {/* Header */}
      <div className="flex items-center gap-3 w-full">
        <motion.button
          whileTap={{ y: 2 }}
          onClick={() => router.back()}
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
            : '3개 릴의 합산 점수로 승부!'}
      </p>

      {/* Score legend */}
      <div className="flex gap-1.5 flex-wrap justify-center">
        {SYMBOLS.map((sym, i) => (
          <span
            key={i}
            className="text-[10px] font-bold text-coffee-500 bg-coffee-100 rounded-full px-2 py-0.5"
          >
            {sym}={SYMBOL_LABELS[i]}
          </span>
        ))}
      </div>

      {/* Slot Results */}
      <div className="flex-1 flex items-center justify-center w-full">
        <div className="flex flex-col gap-3 w-full max-w-sm">
          {players.map((p, pi) => {
            const animal = getAnimal(p.animal);
            const result = results[pi];
            const fr = finalResults[pi];
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
                <div className="flex flex-col items-center gap-0.5 min-w-[44px]">
                  <span className="text-xl">{animal?.emoji}</span>
                  <span className="text-[10px] font-bold text-coffee-700">
                    {p.name}
                  </span>
                </div>

                {/* 3 Reels with vertical scroll */}
                <div className="flex gap-2 flex-1 justify-center">
                  {[0, 1, 2].map((reelIdx) => (
                    <SlotReel
                      key={reelIdx}
                      spinning={spinning}
                      stopped={reelsStopped[reelIdx]}
                      finalSymbol={fr?.symbols[reelIdx] ?? 0}
                    />
                  ))}
                </div>

                {/* Score */}
                <div className="min-w-[40px] text-right">
                  {done && result && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col items-end"
                    >
                      <span className="text-base font-black text-coffee-700">
                        {result.sum}점
                      </span>
                      <span className="text-[9px] text-coffee-400">
                        {result.symbols.map((s) => VALUES[s]).join('+')}
                      </span>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Spin Button */}
      <div className="mt-auto w-full">
        <TapButton onClick={spinSlots} disabled={spinning || done}>
          {spinning ? '🌀 돌아가는 중...' : '🎰 돌리기!'}
        </TapButton>
      </div>
    </div>
  );
}
