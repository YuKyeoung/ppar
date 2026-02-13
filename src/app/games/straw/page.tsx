'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { getAnimal } from '@/constants/animals';
import { SFX } from '@/utils/sound';
import { haptic } from '@/utils/haptic';

type Phase = 'ready' | 'revealing' | 'done';

const LONG_HEIGHT = 85; // percent
const SHORT_HEIGHT = 40; // percent
const STRAW_WIDTH = 28;
// REVEAL_STAGGER is computed dynamically inside the component based on player count

export default function StrawGame() {
  const router = useRouter();
  const { players, setResult } = useGameStore();
  const [phase, setPhase] = useState<Phase>('ready');
  const [revealedCount, setRevealedCount] = useState(0);

  // Guard
  useEffect(() => {
    if (players.length < 2) router.replace('/');
  }, [players.length, router]);

  // Dynamic stagger: total ~10s across all players
  const revealStagger = 10 / players.length; // seconds between each straw

  // Random loser index (determined on mount)
  const loserIdx = useMemo(() => {
    if (players.length < 2) return 0;
    return Math.floor(Math.random() * players.length);
  }, [players.length]);

  const handleDraw = useCallback(() => {
    if (phase !== 'ready') return;
    SFX.tap();
    haptic('medium');
    setPhase('revealing');

    // Reveal straws one by one
    let count = 0;
    const interval = setInterval(() => {
      count++;
      setRevealedCount(count);
      SFX.tick();
      haptic('light');

      if (count >= players.length) {
        clearInterval(interval);

        // Dramatic pause, then play fail for the short straw
        setTimeout(() => {
          SFX.fail();
          haptic('heavy');
          setPhase('done');

          // Navigate to result after viewing time
          setTimeout(() => {
            const loser = players[loserIdx];
            const rankings = players
              .map((p, i) => ({
                ...p,
                score: i === loserIdx ? 0 : 1,
              }))
              .sort((a, b) => b.score - a.score);

            setResult({
              rankings,
              loser: { ...loser, score: 0 },
              gameName: '제비뽑기',
            });
            router.push('/result');
          }, 2000);
        }, 1000);
      }
    }, revealStagger * 1000);
  }, [phase, players, loserIdx, revealStagger, setResult, router]);

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
          &larr;
        </motion.button>
        <h2 className="text-[22px] font-black text-coffee-800">
          🎋 제비뽑기
        </h2>
      </div>

      <p className="text-sm font-bold text-coffee-400">
        {phase === 'ready' && '버튼을 눌러 제비를 뽑으세요!'}
        {phase === 'revealing' && '제비를 뽑는 중...'}
        {phase === 'done' && `${players[loserIdx]?.name} 꽝!`}
      </p>

      {/* Straws area */}
      <div className="flex-1 flex items-end justify-center w-full">
        <div className="relative w-full max-w-md">
          {/* Hand bar that hides the straw bottoms */}
          <div
            className="absolute bottom-0 left-0 right-0 bg-gradient-to-br from-coffee-300 to-coffee-400 rounded-clay shadow-clay z-10"
            style={{ height: 56 }}
          >
            <div className="flex items-center justify-center h-full">
              <span className="text-sm font-black text-coffee-100">
                {phase === 'ready' ? '뽑아보세요!' : ''}
              </span>
            </div>
          </div>

          {/* Straws container - positioned above the hand bar */}
          <div
            className="flex items-end justify-center gap-3 pb-[28px] px-4"
            style={{ minHeight: 280 }}
          >
            {players.map((p, i) => {
              const animal = getAnimal(p.animal);
              const isShort = i === loserIdx;
              const isRevealed = i < revealedCount;
              const targetHeight = isShort ? SHORT_HEIGHT : LONG_HEIGHT;
              const showHeight = isRevealed ? targetHeight : 50; // initial same visible height
              const isLoser = phase === 'done' && isShort;

              return (
                <div
                  key={p.id}
                  className="flex flex-col items-center gap-2"
                  style={{ width: STRAW_WIDTH + 24 }}
                >
                  {/* Straw */}
                  <motion.div
                    className="relative rounded-full"
                    style={{
                      width: STRAW_WIDTH,
                      background: isRevealed
                        ? isShort
                          ? 'linear-gradient(to bottom, #EF5350, #C62828)'
                          : 'linear-gradient(to bottom, #66BB6A, #388E3C)'
                        : 'linear-gradient(to bottom, #BCAAA4, #8D6E63)',
                    }}
                    initial={{ height: `50%` }}
                    animate={
                      isLoser
                        ? {
                            height: `${showHeight}%`,
                            x: [0, -4, 4, -4, 4, 0],
                          }
                        : { height: `${showHeight}%` }
                    }
                    transition={
                      isLoser
                        ? {
                            height: { duration: 0.4, ease: 'easeOut' },
                            x: {
                              duration: 0.5,
                              delay: 0.1,
                              ease: 'easeInOut',
                            },
                          }
                        : {
                            duration: 0.4,
                            ease: 'easeOut',
                          }
                    }
                  >
                    {/* Straw top cap */}
                    <div
                      className="absolute -top-1 left-1/2 -translate-x-1/2 rounded-full"
                      style={{
                        width: STRAW_WIDTH + 4,
                        height: 8,
                        background: isRevealed
                          ? isShort
                            ? '#C62828'
                            : '#2E7D32'
                          : '#795548',
                      }}
                    />

                    {/* Result icon on revealed straw */}
                    {isRevealed && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2, type: 'spring' }}
                        className="absolute -top-8 left-1/2 -translate-x-1/2 text-lg"
                      >
                        {isShort ? '☕' : '✓'}
                      </motion.div>
                    )}
                  </motion.div>

                  {/* Player name & emoji below */}
                  <div className="flex flex-col items-center relative z-20">
                    <span className="text-xl">{animal?.emoji}</span>
                    <span
                      className={`text-[11px] font-bold truncate max-w-[60px] ${
                        isLoser ? 'text-[#C62828]' : 'text-coffee-600'
                      }`}
                    >
                      {p.name}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Draw button */}
      <div className="w-full">
        <button
          onClick={handleDraw}
          disabled={phase !== 'ready'}
          className="w-full py-4 rounded-clay border-none font-display font-black text-lg bg-gradient-to-br from-accent to-[#FF9F5F] text-white shadow-clay-accent cursor-pointer disabled:opacity-50"
        >
          {phase === 'ready' && '🎋 제비 뽑기!'}
          {phase === 'revealing' && '🎋 뽑는 중...'}
          {phase === 'done' && '☕ 결과 확인 중...'}
        </button>
      </div>
    </div>
  );
}
