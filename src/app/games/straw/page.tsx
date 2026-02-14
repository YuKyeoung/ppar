'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { getAnimal } from '@/constants/animals';
import { SFX } from '@/utils/sound';
import { haptic } from '@/utils/haptic';
import TapButton from '@/components/game/TapButton';

type Phase = 'ready' | 'shaking' | 'pulling' | 'done';

const STRAW_WIDTH = 24;

export default function StrawGame() {
  const router = useRouter();
  const { players, setResult } = useGameStore();
  const [phase, setPhase] = useState<Phase>('ready');
  const [pulledIdx, setPulledIdx] = useState(-1);
  const [pulledSet, setPulledSet] = useState<Set<number>>(new Set());
  const [pullOffsets, setPullOffsets] = useState<number[]>(() =>
    players.map(() => 0)
  );

  useEffect(() => {
    if (players.length < 2) router.replace('/');
  }, [players.length, router]);

  const loserIdx = useMemo(() => {
    if (players.length < 2) return 0;
    return Math.floor(Math.random() * players.length);
  }, [players.length]);

  // Straw lengths: loser gets short, rest get varying long lengths
  const strawLengths = useMemo(() => {
    return players.map((_, i) => {
      if (i === loserIdx) return 60; // short straw (px)
      return 120 + Math.random() * 40; // long straws 120-160px
    });
  }, [players, loserIdx]);

  const handleDraw = useCallback(() => {
    if (phase !== 'ready') return;
    SFX.tap();
    haptic('medium');

    // Shake phase - straws wiggle before pulling
    setPhase('shaking');

    setTimeout(() => {
      setPhase('pulling');
      haptic('light');

      // Pull each straw one by one
      let count = 0;
      const pullInterval = setInterval(() => {
        const idx = count;
        setPulledIdx(idx);

        // Animate pull-up: straw slides up out of the holder
        setPullOffsets((prev) => {
          const next = [...prev];
          next[idx] = -80; // pull up by 80px
          return next;
        });

        SFX.tick();
        haptic('light');

        setTimeout(() => {
          setPulledSet((prev) => {
            const next = new Set(Array.from(prev));
            next.add(idx);
            return next;
          });
        }, 400);

        count++;
        if (count >= players.length) {
          clearInterval(pullInterval);

          setTimeout(() => {
            SFX.fail();
            haptic('heavy');
            setPhase('done');

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
            }, 2500);
          }, 800);
        }
      }, 1200);
    }, 1500); // shake for 1.5s before pulling
  }, [phase, players, loserIdx, setResult, router]);

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
        {phase === 'shaking' && '흔들흔들...'}
        {phase === 'pulling' &&
          pulledIdx >= 0 &&
          `${players[pulledIdx]?.name} 뽑는 중...`}
        {phase === 'done' && `${players[loserIdx]?.name} 꽝!`}
      </p>

      {/* Straws area */}
      <div className="flex-1 flex items-center justify-center w-full">
        <div className="relative w-full max-w-md">
          {/* Hand/holder bar */}
          <div
            className="absolute left-0 right-0 bg-gradient-to-br from-coffee-300 to-coffee-500 rounded-clay shadow-clay z-10"
            style={{ height: 64, top: '50%', transform: 'translateY(-50%)' }}
          >
            <div className="flex items-center justify-center h-full gap-1">
              <motion.span
                className="text-base font-black text-coffee-100"
                animate={
                  phase === 'shaking'
                    ? { opacity: [1, 0.5, 1] }
                    : {}
                }
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                {phase === 'ready'
                  ? '🤜 뽑아보세요! 🤛'
                  : phase === 'shaking'
                    ? '🫨 흔들흔들...'
                    : phase === 'pulling'
                      ? '🖐️ 뽑는 중...'
                      : ''}
              </motion.span>
            </div>
          </div>

          {/* Straws sticking out of the holder */}
          <div
            className="flex items-end justify-center gap-4 px-4 relative"
            style={{ minHeight: 320 }}
          >
            {players.map((p, i) => {
              const animal = getAnimal(p.animal);
              const isShort = i === loserIdx;
              const isPulled = pulledSet.has(i);
              const isBeingPulled = phase === 'pulling' && pulledIdx === i;
              const isLoser = phase === 'done' && isShort;

              // Visible height: before pull all look same,
              // after pull shows actual length
              const visibleStrawHeight = isPulled
                ? strawLengths[i]
                : 80; // same height visible before pull

              return (
                <div
                  key={p.id}
                  className="flex flex-col items-center"
                  style={{ width: STRAW_WIDTH + 32 }}
                >
                  {/* Player emoji above */}
                  <motion.div
                    className="flex flex-col items-center gap-0.5 mb-2"
                    animate={
                      isBeingPulled
                        ? { y: [0, -12, 0], scale: [1, 1.2, 1] }
                        : isLoser
                          ? { y: [0, -5, 0] }
                          : {}
                    }
                    transition={
                      isBeingPulled
                        ? { duration: 0.4 }
                        : isLoser
                          ? { duration: 0.4, repeat: Infinity }
                          : {}
                    }
                  >
                    <span className="text-2xl">{animal?.emoji}</span>
                    <span
                      className={`text-[10px] font-bold ${
                        isLoser ? 'text-[#C62828]' : 'text-coffee-600'
                      }`}
                    >
                      {p.name}
                    </span>
                  </motion.div>

                  {/* Straw */}
                  <motion.div
                    className="relative rounded-full overflow-visible"
                    style={{
                      width: STRAW_WIDTH,
                      background: isPulled
                        ? isShort
                          ? 'linear-gradient(to bottom, #EF5350, #C62828)'
                          : 'linear-gradient(to bottom, #66BB6A, #388E3C)'
                        : 'linear-gradient(to bottom, #D7CCC8, #8D6E63)',
                    }}
                    animate={{
                      height: visibleStrawHeight,
                      y: pullOffsets[i],
                      x:
                        phase === 'shaking'
                          ? [0, -3, 3, -2, 2, 0]
                          : isLoser
                            ? [0, -5, 5, -5, 5, 0]
                            : 0,
                    }}
                    transition={{
                      height: { duration: 0.5, ease: 'easeOut' },
                      y: { duration: 0.5, ease: 'easeOut' },
                      x:
                        phase === 'shaking'
                          ? {
                              duration: 0.3,
                              repeat: Infinity,
                              repeatType: 'loop' as const,
                            }
                          : isLoser
                            ? {
                                duration: 0.4,
                                repeat: 3,
                              }
                            : { duration: 0.3 },
                    }}
                  >
                    {/* Top cap */}
                    <div
                      className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full"
                      style={{
                        width: STRAW_WIDTH + 6,
                        height: 10,
                        background: isPulled
                          ? isShort
                            ? '#C62828'
                            : '#2E7D32'
                          : '#795548',
                        boxShadow: '0 -2px 4px rgba(0,0,0,0.15)',
                      }}
                    />

                    {/* Result badge */}
                    {isPulled && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0, y: 10 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        transition={{
                          type: 'spring',
                          stiffness: 500,
                          damping: 15,
                          delay: 0.2,
                        }}
                        className="absolute -top-10 left-1/2 -translate-x-1/2"
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-lg shadow-lg ${
                            isShort
                              ? 'bg-red-100 border-2 border-red-400'
                              : 'bg-green-100 border-2 border-green-400'
                          }`}
                        >
                          {isShort ? '☕' : '✓'}
                        </div>
                      </motion.div>
                    )}

                    {/* Length indicator lines on straw */}
                    {isPulled &&
                      Array.from({
                        length: Math.floor(visibleStrawHeight / 20),
                      }).map((_, li) => (
                        <div
                          key={li}
                          className="absolute left-1/2 -translate-x-1/2 w-3/5 h-px bg-white/20"
                          style={{ top: 15 + li * 20 }}
                        />
                      ))}
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Draw button */}
      <div className="w-full">
        <TapButton onClick={handleDraw} disabled={phase !== 'ready'}>
          {phase === 'ready' && '🎋 제비 뽑기!'}
          {phase === 'shaking' && '🫨 흔들흔들...'}
          {phase === 'pulling' && '🎋 뽑는 중...'}
          {phase === 'done' && '☕ 결과 확인 중...'}
        </TapButton>
      </div>
    </div>
  );
}
