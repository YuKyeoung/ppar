'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { getAnimal } from '@/constants/animals';
import { SFX } from '@/utils/sound';
import { haptic } from '@/utils/haptic';
import TapButton from '@/components/game/TapButton';

type Phase = 'ready' | 'drawing' | 'done';

export default function StrawGame() {
  const router = useRouter();
  const { players, setResult } = useGameStore();
  const [phase, setPhase] = useState<Phase>('ready');
  const [currentIdx, setCurrentIdx] = useState(-1);
  const [revealedSet, setRevealedSet] = useState<Set<number>>(new Set());

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
      if (i === loserIdx) return 80;
      return 160 + Math.random() * 40;
    });
  }, [players, loserIdx]);

  // Draw order: randomize which player draws which straw position
  const drawOrder = useMemo(() => {
    const indices = players.map((_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    return indices;
  }, [players]);

  const handleStart = useCallback(() => {
    if (phase !== 'ready') return;
    SFX.tap();
    haptic('medium');
    setPhase('drawing');

    let count = 0;

    const drawNext = () => {
      const idx = drawOrder[count];
      setCurrentIdx(idx);
      SFX.tick();
      haptic('light');

      // After a delay, reveal this straw
      setTimeout(() => {
        setRevealedSet((prev) => {
          const next = new Set(Array.from(prev));
          next.add(idx);
          return next;
        });

        const isShort = idx === loserIdx;
        if (isShort) {
          SFX.fail();
          haptic('heavy');
        } else {
          SFX.tap();
        }

        count++;

        // If loser found, end early
        if (isShort) {
          setTimeout(() => {
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
            }, 2000);
          }, 600);
          return;
        }

        if (count < players.length) {
          setTimeout(drawNext, 800);
        } else {
          // All drawn without finding loser (shouldn't happen)
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
          }, 2000);
        }
      }, 600);
    };

    // Small initial delay then start
    setTimeout(drawNext, 500);
  }, [phase, players, loserIdx, drawOrder, setResult, router]);

  if (players.length < 2) return null;

  const HIDDEN_HEIGHT = 50; // visible portion above the line when hidden
  const LINE_Y = 200; // where the "ground line" is

  return (
    <div className="flex flex-col items-center min-h-dvh px-5 py-6 gap-4">
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
        {phase === 'ready' && '짧은 제비를 뽑으면 커피 당첨!'}
        {phase === 'drawing' &&
          currentIdx >= 0 &&
          `${players[currentIdx]?.name} 뽑는 중...`}
        {phase === 'done' && `${players[loserIdx]?.name} 꽝! ☕`}
      </p>

      {/* Straw drawing area */}
      <div className="flex-1 flex items-center justify-center w-full">
        <div className="relative w-full max-w-sm">
          {/* Straws */}
          <div className="flex items-start justify-center gap-3 px-2">
            {players.map((p, i) => {
              const animal = getAnimal(p.animal);
              const isRevealed = revealedSet.has(i);
              const isShort = i === loserIdx;
              const isCurrent = phase === 'drawing' && currentIdx === i && !isRevealed;
              const isLoser = phase === 'done' && isShort;
              const fullHeight = strawLengths[i];

              return (
                <div
                  key={p.id}
                  className="flex flex-col items-center"
                  style={{ width: 56 }}
                >
                  {/* Player emoji + name at top */}
                  <motion.div
                    className="flex flex-col items-center gap-0.5 mb-3"
                    animate={
                      isCurrent
                        ? { y: [0, -8, 0], scale: [1, 1.15, 1] }
                        : isLoser
                          ? { y: [0, -4, 0] }
                          : {}
                    }
                    transition={
                      isCurrent
                        ? { duration: 0.4, repeat: Infinity }
                        : isLoser
                          ? { duration: 0.5, repeat: Infinity }
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

                  {/* Straw container */}
                  <div
                    className="relative flex flex-col items-center"
                    style={{ height: LINE_Y }}
                  >
                    {/* The straw itself */}
                    <motion.div
                      className="relative rounded-full overflow-hidden"
                      style={{
                        width: 20,
                        originY: 0,
                      }}
                      initial={{ height: HIDDEN_HEIGHT }}
                      animate={{
                        height: isRevealed ? fullHeight : HIDDEN_HEIGHT,
                        x: isCurrent ? [0, -3, 3, -2, 2, 0] : 0,
                      }}
                      transition={{
                        height: { duration: 0.5, ease: 'easeOut' },
                        x: isCurrent
                          ? { duration: 0.3, repeat: Infinity }
                          : { duration: 0.2 },
                      }}
                    >
                      {/* Straw body */}
                      <div
                        className="absolute inset-0 rounded-full"
                        style={{
                          background: isRevealed
                            ? isShort
                              ? 'linear-gradient(to bottom, #EF5350, #C62828)'
                              : 'linear-gradient(to bottom, #81C784, #388E3C)'
                            : 'linear-gradient(to bottom, #BCAAA4, #8D6E63)',
                        }}
                      />
                      {/* Stripe pattern on straw */}
                      {isRevealed &&
                        Array.from({
                          length: Math.floor(fullHeight / 25),
                        }).map((_, li) => (
                          <div
                            key={li}
                            className="absolute left-1/2 -translate-x-1/2 w-3/5 h-px bg-white/25"
                            style={{ top: 12 + li * 25 }}
                          />
                        ))}
                      {/* Top cap */}
                      <div
                        className="absolute top-0 left-1/2 -translate-x-1/2 rounded-t-full"
                        style={{
                          width: 24,
                          height: 8,
                          background: isRevealed
                            ? isShort
                              ? '#B71C1C'
                              : '#2E7D32'
                            : '#6D4C41',
                        }}
                      />
                    </motion.div>

                    {/* Result badge below straw */}
                    {isRevealed && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{
                          type: 'spring',
                          stiffness: 400,
                          damping: 15,
                          delay: 0.15,
                        }}
                        className="mt-2"
                      >
                        <div
                          className={`px-2 py-1 rounded-lg text-xs font-black ${
                            isShort
                              ? 'bg-red-100 text-[#C62828] border border-red-300'
                              : 'bg-green-100 text-green-700 border border-green-300'
                          }`}
                        >
                          {isShort ? '☕ 꽝!' : '✓ 통과'}
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Guide text */}
          {phase === 'ready' && (
            <div className="text-center mt-4">
              <span className="text-xs text-coffee-300">
                제비가 짧으면 꽝! 긴 제비를 뽑아야 통과!
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Start button */}
      <div className="w-full">
        <TapButton onClick={handleStart} disabled={phase !== 'ready'}>
          {phase === 'ready' && '🎋 제비 뽑기 시작!'}
          {phase === 'drawing' && '🎋 뽑는 중...'}
          {phase === 'done' && '☕ 결과 확인 중...'}
        </TapButton>
      </div>
    </div>
  );
}
