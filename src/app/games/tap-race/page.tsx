'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { getAnimal } from '@/constants/animals';
import CountDown from '@/components/game/CountDown';
import { haptic } from '@/utils/haptic';

const DURATION = 10;

export default function TapRace() {
  const router = useRouter();
  const { players, updateScore, setResult, selectedGame } = useGameStore();
  const [phase, setPhase] = useState<'countdown' | 'playing'>('countdown');
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [taps, setTaps] = useState(0);
  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [scores, setScores] = useState<number[]>(players.map(() => 0));
  const [active, setActive] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const tapsRef = useRef(0);

  // Guard: redirect if no players (direct access / refresh)
  useEffect(() => {
    if (players.length < 2) router.replace('/');
  }, [players.length, router]);

  const startRound = useCallback(() => {
    setTaps(0);
    tapsRef.current = 0;
    setTimeLeft(DURATION);
    setActive(true);
  }, []);

  const handleCountdownComplete = useCallback(() => {
    setPhase('playing');
    startRound();
  }, [startRound]);

  const finishRound = useCallback(() => {
    const finalTaps = tapsRef.current;
    setScores((prev) => {
      const next = [...prev];
      next[currentPlayer] = finalTaps;
      updateScore(players[currentPlayer].id, finalTaps);

      if (currentPlayer >= players.length - 1) {
        setTimeout(() => {
          const ranked = players
            .map((p, i) => ({ ...p, score: next[i] }))
            .sort((a, b) => b.score - a.score);
          setResult({
            rankings: ranked,
            loser: ranked[ranked.length - 1],
            gameName: selectedGame?.name || '달리기 경주',
          });
          router.push('/result');
        }, 1000);
      } else {
        setTimeout(() => {
          setCurrentPlayer((c) => c + 1);
          startRound();
        }, 1500);
      }
      return next;
    });
  }, [currentPlayer, players, updateScore, setResult, selectedGame, router, startRound]);

  useEffect(() => {
    if (!active) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          setActive(false);
          finishRound();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [active, finishRound]);

  if (players.length < 2) return null;

  const handleTap = () => {
    if (!active) return;
    tapsRef.current += 1;
    setTaps((t) => t + 1);
    haptic('light');
  };

  if (phase === 'countdown') {
    return <CountDown onComplete={handleCountdownComplete} />;
  }

  const animal = getAnimal(players[currentPlayer]?.animal);
  const progress = Math.min(taps / 50, 1);

  return (
    <div className="flex flex-col items-center min-h-dvh px-5 py-6 gap-4">
      <div className="flex items-center gap-3 w-full">
        <h2 className="text-[22px] font-black text-coffee-800">🏃 달리기 경주</h2>
      </div>

      <div className="text-center py-3 px-6 rounded-[16px] bg-gradient-to-br from-coffee-500 to-coffee-500/90 text-white font-black shadow-clay-primary w-full">
        {animal?.emoji} {players[currentPlayer]?.name} 차례 — {timeLeft}초 남음!
      </div>

      <div className="w-full h-4 rounded-full bg-coffee-100 shadow-clay-inset overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-accent to-[#FF9F5F]"
          animate={{ width: `${progress * 100}%` }}
        />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <motion.div className="text-7xl">{animal?.emoji}</motion.div>
        <div className="text-5xl font-black text-coffee-500">{taps}</div>
        <p className="text-sm font-bold text-coffee-400">탭 수</p>
      </div>

      <motion.button
        whileTap={{ scale: 0.95 }}
        onPointerDown={handleTap}
        className="w-full py-8 rounded-clay-lg border-none font-display font-black text-2xl bg-gradient-to-br from-accent to-[#FF9F5F] text-white shadow-clay-accent cursor-pointer"
      >
        {active ? '빠르게 탭! 🔥' : '대기 중...'}
      </motion.button>

      <div className="w-full flex flex-col gap-1.5">
        {players.map((p, i) => {
          const a = getAnimal(p.animal);
          return (
            <div key={p.id} className="flex items-center gap-2 py-2 px-3 rounded-[12px] bg-white/60 text-sm">
              <span>{a?.emoji}</span>
              <span className="font-bold text-coffee-800">{p.name}</span>
              <span className="ml-auto font-black text-coffee-500">{scores[i] || '-'}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
