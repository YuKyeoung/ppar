'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { getAnimal } from '@/constants/animals';
import CountDown from '@/components/game/CountDown';
import { SFX } from '@/utils/sound';
import { haptic } from '@/utils/haptic';

export default function RocketLaunch() {
  const router = useRouter();
  const { players, updateScore, setResult, selectedGame } = useGameStore();
  const [phase, setPhase] = useState<'countdown' | 'playing'>('countdown');
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [power, setPower] = useState(0);
  const [filling, setFilling] = useState(false);
  const [launched, setLaunched] = useState(false);
  const [scores, setScores] = useState<number[]>(players.map(() => 0));
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const dirRef = useRef(1);

  const handleCountdownComplete = useCallback(() => { setPhase('playing'); startFill(); }, []);

  // Guard: redirect if no players (direct access / refresh)
  useEffect(() => {
    if (players.length < 2) router.replace('/');
  }, [players.length, router]);

  const startFill = () => {
    setPower(0);
    setFilling(true);
    setLaunched(false);
    dirRef.current = 1;
    intervalRef.current = setInterval(() => {
      setPower((p) => {
        const next = p + dirRef.current * 2;
        if (next >= 100) dirRef.current = -1;
        if (next <= 0) dirRef.current = 1;
        return Math.max(0, Math.min(100, next));
      });
    }, 30);
  };

  const stopFill = () => {
    if (!filling) return;
    if (intervalRef.current) clearInterval(intervalRef.current);
    setFilling(false);
    setLaunched(true);
    SFX.countdownGo();
    haptic('heavy');

    const score = power;
    const newScores = [...scores];
    newScores[currentPlayer] = score;
    setScores(newScores);
    updateScore(players[currentPlayer].id, score);

    setTimeout(() => {
      if (currentPlayer >= players.length - 1) {
        const ranked = players.map((p, i) => ({ ...p, score: newScores[i] })).sort((a, b) => b.score - a.score);
        setResult({ rankings: ranked, loser: ranked[ranked.length - 1], gameName: selectedGame?.name || '로켓 발사' });
        router.push('/result');
      } else {
        setCurrentPlayer((c) => c + 1);
        startFill();
      }
    }, 1500);
  };

  useEffect(() => { return () => { if (intervalRef.current) clearInterval(intervalRef.current); }; }, []);

  if (players.length < 2) return null;

  if (phase === 'countdown') return <CountDown onComplete={handleCountdownComplete} />;

  const animal = getAnimal(players[currentPlayer]?.animal);

  return (
    <div className="flex flex-col items-center min-h-dvh px-5 py-6 gap-4">
      <h2 className="text-[22px] font-black text-coffee-800 w-full">🚀 로켓 발사</h2>
      <div className="text-center py-3 px-6 rounded-[16px] bg-gradient-to-br from-coffee-500 to-coffee-500/90 text-white font-black shadow-clay-primary w-full">
        {animal?.emoji} {players[currentPlayer]?.name} 차례
      </div>

      <div className="flex-1 flex items-center justify-center gap-6">
        <div className="w-12 h-64 rounded-full bg-coffee-100 shadow-clay-inset relative overflow-hidden">
          <motion.div
            className="absolute bottom-0 left-0 right-0 rounded-full bg-gradient-to-t from-danger to-accent"
            animate={{ height: `${power}%` }}
            transition={{ duration: 0.05 }}
          />
        </div>
        <motion.div
          animate={launched ? { y: -200, opacity: 0 } : {}}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="text-6xl"
        >
          🚀
        </motion.div>
        <div className="text-4xl font-black text-coffee-500">{power}</div>
      </div>

      <button onClick={stopFill} disabled={!filling} className="w-full py-6 rounded-clay border-none font-display font-black text-xl bg-gradient-to-br from-danger to-[#EF9A9A] text-white shadow-[6px_6px_12px_rgba(229,115,115,0.3)] cursor-pointer disabled:opacity-50">
        {filling ? '🎯 STOP!' : launched ? `파워: ${power}` : '대기 중...'}
      </button>

      <div className="w-full flex flex-col gap-1.5">
        {players.map((p, i) => {
          const a = getAnimal(p.animal);
          return (
            <div key={p.id} className="flex items-center gap-2 py-2 px-3 rounded-[12px] bg-white/60 text-sm">
              <span>{a?.emoji}</span><span className="font-bold text-coffee-800">{p.name}</span>
              <span className="ml-auto font-black text-coffee-500">{scores[i] || '-'}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
