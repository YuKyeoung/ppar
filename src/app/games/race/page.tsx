'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { getAnimal } from '@/constants/animals';
import { SFX } from '@/utils/sound';
import { haptic } from '@/utils/haptic';
import TapButton from '@/components/game/TapButton';

type Phase = 'ready' | 'countdown' | 'racing' | 'done';

export default function RaceGame() {
  const router = useRouter();
  const { players, setResult } = useGameStore();
  const [phase, setPhase] = useState<Phase>('ready');
  const [countdown, setCountdown] = useState(3);
  const [positions, setPositions] = useState<number[]>(() =>
    players.map(() => 0)
  );
  const [finishOrder, setFinishOrder] = useState<number[]>([]);
  const animFrame = useRef<number>(0);
  const speeds = useRef<number[]>([]);
  const posRef = useRef<number[]>([]);
  const finishRef = useRef<number[]>([]);

  useEffect(() => {
    if (players.length < 2) router.replace('/');
  }, [players.length, router]);

  useEffect(() => {
    return () => {
      if (animFrame.current) cancelAnimationFrame(animFrame.current);
    };
  }, []);

  const startRaceRef = useRef<() => void>(() => {});

  const startCountdown = useCallback(() => {
    if (phase !== 'ready') return;
    setPhase('countdown');
    haptic('light');

    let count = 3;
    setCountdown(3);
    SFX.countdownTick();

    const interval = setInterval(() => {
      count--;
      if (count > 0) {
        setCountdown(count);
        SFX.countdownTick();
        haptic('light');
      } else {
        clearInterval(interval);
        setCountdown(0);
        SFX.countdownGo();
        haptic('heavy');
        startRaceRef.current();
      }
    }, 1000);
  }, [phase]);

  const startRace = useCallback(() => {
    setPhase('racing');

    // Small initial speed variance per player
    speeds.current = players.map(
      () => 0.15 + (Math.random() - 0.5) * 0.03
    );
    posRef.current = players.map(() => 0);
    finishRef.current = [];

    let lastTime = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(now - lastTime, 50);
      lastTime = now;

      const newPos = [...posRef.current];

      // Rank players by current position (descending)
      const ranked = newPos
        .map((p, i) => ({ i, p }))
        .sort((a, b) => b.p - a.p);

      for (let ri = 0; ri < players.length; ri++) {
        const i = ranked[ri].i;
        if (newPos[i] >= 100) continue;

        const rank = ri; // 0 = leader
        const distBehind = ranked[0].p - newPos[i];

        // Re-roll base speed occasionally (speed varies over time)
        if (Math.random() < 0.03) {
          speeds.current[i] = 0.15 + (Math.random() - 0.5) * 0.03;
        }

        // Frame noise: bigger range for lower ranks (comeback chance)
        const noiseRange = 0.10 + rank * 0.14;
        const noise = (Math.random() - 0.35) * noiseRange;

        // Rubber-band: trailing players get boost proportional to gap
        const rubberBand = distBehind * 0.01;

        // Leader penalty
        const penalty = rank === 0 ? 0.035 : 0;

        const speed = Math.max(0.02, speeds.current[i] + noise + rubberBand - penalty);
        newPos[i] = Math.min(100, newPos[i] + speed * (dt / 16));

        if (newPos[i] >= 100 && !finishRef.current.includes(i)) {
          finishRef.current.push(i);
          if (finishRef.current.length === 1) {
            SFX.success();
            haptic('heavy');
          } else {
            SFX.tap();
          }
        }
      }

      posRef.current = newPos;
      setPositions([...newPos]);

      if (finishRef.current.length < players.length) {
        animFrame.current = requestAnimationFrame(tick);
      } else {
        setFinishOrder([...finishRef.current]);
        setPhase('done');
        SFX.fanfare();
        haptic('heavy');

        setTimeout(() => {
          const order = finishRef.current;
          const loserIdx = order[order.length - 1];
          const rankings = order.map((playerIdx, rank) => ({
            ...players[playerIdx],
            score: players.length - rank,
          }));
          setResult({
            rankings,
            loser: { ...players[loserIdx], score: 0 },
            gameName: '달리기 경주',
          });
          router.push('/result');
        }, 3000);
      }
    };

    animFrame.current = requestAnimationFrame(tick);
  }, [players, setResult, router]);

  startRaceRef.current = startRace;

  if (players.length < 2) return null;

  return (
    <div className="flex flex-col min-h-dvh px-5 py-6 gap-4 bg-gradient-to-b from-cream to-coffee-100">
      {/* Header */}
      <div className="flex items-center gap-3 w-full">
        <motion.button
          whileTap={{ y: 2 }}
          onClick={() => router.push('/games')}
          className="w-11 h-11 rounded-[14px] border-none bg-gradient-to-br from-white to-coffee-100 shadow-clay flex items-center justify-center text-xl cursor-pointer"
        >
          ←
        </motion.button>
        <h2 className="text-[22px] font-black text-coffee-800">
          🏃 달리기 경주
        </h2>
      </div>

      <p className="text-sm font-bold text-coffee-400 text-center">
        {phase === 'ready' && '버튼을 눌러 경주를 시작하세요!'}
        {phase === 'countdown' && '준비...'}
        {phase === 'racing' && '달리는 중!'}
        {phase === 'done' && '결과 확인!'}
      </p>

      {/* Countdown overlay */}
      {phase === 'countdown' && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.span
            key={countdown}
            initial={{ scale: 3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="text-8xl font-black text-white drop-shadow-lg"
          >
            {countdown > 0 ? countdown : 'GO!'}
          </motion.span>
        </motion.div>
      )}

      {/* Race Track */}
      <div className="flex-1 flex flex-col justify-center gap-1">
        {/* Finish line indicator */}
        <div className="flex items-center mb-2">
          <div className="flex-1" />
          <span className="text-xs font-bold text-coffee-400 mr-1">FINISH</span>
        </div>

        {players.map((p, i) => {
          const animal = getAnimal(p.animal);
          const pos = positions[i];
          const isRacing = phase === 'racing' || phase === 'done';
          const finishRank = finishOrder.indexOf(i);
          const isLoser =
            phase === 'done' && finishRank === finishOrder.length - 1;
          const isWinner = phase === 'done' && finishRank === 0;

          return (
            <div key={p.id} className="relative">
              {/* Lane */}
              <div className="relative h-14 rounded-xl bg-gradient-to-r from-coffee-100 to-coffee-200/50 border border-coffee-200/30 overflow-hidden">
                {/* Track lines */}
                <div className="absolute inset-y-0 right-2 w-px bg-coffee-300/50" />
                <div className="absolute inset-y-0 right-3 w-px bg-coffee-300/30" />

                {/* Runner */}
                <motion.div
                  className="absolute top-1/2 -translate-y-1/2 flex items-center"
                  style={{ left: `${Math.min(pos, 92)}%` }}
                >
                  {/* Dust particles when racing */}
                  {isRacing && pos < 95 && pos > 2 && (
                    <div className="absolute -left-4 top-1/2 -translate-y-1/2">
                      <motion.span
                        className="text-xs text-coffee-300 opacity-60"
                        style={{ display: 'inline-block', scaleX: -1 }}
                        animate={{ opacity: [0.6, 0, 0.6], x: [-2, -10] }}
                        transition={{
                          duration: 0.3,
                          repeat: Infinity,
                          repeatType: 'loop',
                        }}
                      >
                        💨
                      </motion.span>
                    </div>
                  )}

                  {/* Animal with running animation */}
                  <div className="relative flex flex-col items-center">
                    {/* Emoji body with bounce */}
                    <motion.span
                      className="text-3xl relative z-10"
                      animate={
                        phase === 'racing'
                          ? {
                              y: [-2, -6, -2],
                              rotate: [-3, 3, -3],
                            }
                          : isWinner
                            ? { y: [0, -8, 0], scale: [1, 1.2, 1] }
                            : isLoser
                              ? { rotate: [0, -10, 0] }
                              : {}
                      }
                      transition={
                        phase === 'racing'
                          ? {
                              duration: 0.25,
                              repeat: Infinity,
                              ease: 'easeInOut',
                            }
                          : {
                              duration: 0.6,
                              repeat: Infinity,
                            }
                      }
                    >
                      {animal?.emoji}
                    </motion.span>

                    {/* Animated legs */}
                    {phase === 'racing' && pos < 98 && (
                      <div className="flex gap-[3px] -mt-1 relative z-0">
                        <motion.div
                          className="w-[3px] h-3 rounded-full bg-coffee-600"
                          animate={{
                            rotate: [-30, 30, -30],
                            y: [0, -1, 0],
                          }}
                          transition={{
                            duration: 0.2,
                            repeat: Infinity,
                            ease: 'linear',
                          }}
                          style={{ transformOrigin: 'top center' }}
                        />
                        <motion.div
                          className="w-[3px] h-3 rounded-full bg-coffee-600"
                          animate={{
                            rotate: [30, -30, 30],
                            y: [-1, 0, -1],
                          }}
                          transition={{
                            duration: 0.2,
                            repeat: Infinity,
                            ease: 'linear',
                          }}
                          style={{ transformOrigin: 'top center' }}
                        />
                      </div>
                    )}
                  </div>
                </motion.div>

                {/* Player name on the left */}
                <div className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center gap-1 z-20 bg-white/80 rounded-lg px-1.5 py-0.5">
                  <span className="text-[10px] font-black text-coffee-700 whitespace-nowrap">
                    {p.name}
                  </span>
                </div>

                {/* Rank badge when done */}
                {phase === 'done' && finishRank >= 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={`absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-black text-white ${
                      finishRank === 0
                        ? 'bg-yellow-400'
                        : isLoser
                          ? 'bg-red-400'
                          : 'bg-coffee-400'
                    }`}
                  >
                    {finishRank + 1}
                  </motion.div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Start Button */}
      <div className="w-full">
        <TapButton onClick={startCountdown} disabled={phase !== 'ready'}>
          {phase === 'ready' && '🏁 출발!'}
          {phase === 'countdown' && '준비 중...'}
          {phase === 'racing' && '🏃 달리는 중...'}
          {phase === 'done' && '🏆 결과 확인 중...'}
        </TapButton>
      </div>
    </div>
  );
}
