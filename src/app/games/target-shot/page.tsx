'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { getAnimal } from '@/constants/animals';
import CountDown from '@/components/game/CountDown';
import { SFX } from '@/utils/sound';
import { haptic } from '@/utils/haptic';

export default function TargetShot() {
  const router = useRouter();
  const { players, updateScore, setResult, selectedGame } = useGameStore();
  const [phase, setPhase] = useState<'countdown' | 'playing'>('countdown');
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [shots, setShots] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [lastHit, setLastHit] = useState<number | null>(null);
  const [targetPos, setTargetPos] = useState({ x: 50, y: 50 });
  const [scores, setScores] = useState<number[]>(players.map(() => 0));

  const handleCountdownComplete = useCallback(() => { setPhase('playing'); moveTarget(); }, []);

  // Guard: redirect if no players (direct access / refresh)
  useEffect(() => {
    if (players.length < 2) router.replace('/');
  }, [players.length, router]);

  if (players.length < 2) return null;

  const moveTarget = () => {
    setTargetPos({ x: 15 + Math.random() * 70, y: 15 + Math.random() * 70 });
  };

  const handleShot = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (shots >= 3) return;
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    let clientX: number, clientY: number;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    const tapX = ((clientX - rect.left) / rect.width) * 100;
    const tapY = ((clientY - rect.top) / rect.height) * 100;
    const dist = Math.sqrt((tapX - targetPos.x) ** 2 + (tapY - targetPos.y) ** 2);
    const points = Math.max(0, Math.round(100 - dist * 2));
    SFX.tap();
    haptic(points > 50 ? 'medium' : 'light');
    setLastHit(points);
    const newTotal = totalScore + points;
    setTotalScore(newTotal);
    const newShots = shots + 1;
    setShots(newShots);

    if (newShots >= 3) {
      const newScores = [...scores];
      newScores[currentPlayer] = newTotal;
      setScores(newScores);
      updateScore(players[currentPlayer].id, newTotal);

      setTimeout(() => {
        if (currentPlayer >= players.length - 1) {
          const ranked = players.map((p, i) => ({ ...p, score: newScores[i] })).sort((a, b) => b.score - a.score);
          setResult({ rankings: ranked, loser: ranked[ranked.length - 1], gameName: selectedGame?.name || '과녁 맞추기' });
          router.push('/result');
        } else {
          setCurrentPlayer((c) => c + 1);
          setShots(0);
          setTotalScore(0);
          setLastHit(null);
          moveTarget();
        }
      }, 1200);
    } else {
      setTimeout(moveTarget, 500);
    }
  };

  if (phase === 'countdown') return <CountDown onComplete={handleCountdownComplete} />;

  const animal = getAnimal(players[currentPlayer]?.animal);

  return (
    <div className="flex flex-col items-center min-h-dvh px-5 py-6 gap-4">
      <h2 className="text-[22px] font-black text-coffee-800 w-full">🎯 과녁 맞추기</h2>
      <div className="text-center py-3 px-6 rounded-[16px] bg-gradient-to-br from-coffee-500 to-coffee-500/90 text-white font-black shadow-clay-primary w-full">
        {animal?.emoji} {players[currentPlayer]?.name} — {shots}/3발
      </div>

      {lastHit !== null && (
        <motion.div initial={{ scale: 2, opacity: 1 }} animate={{ scale: 1, opacity: 0.7 }} className="text-2xl font-black text-accent">+{lastHit}점!</motion.div>
      )}

      <div
        className="relative w-full aspect-square rounded-clay-lg bg-gradient-to-br from-white to-coffee-100 shadow-clay overflow-hidden cursor-crosshair"
        onClick={handleShot}
      >
        <div className="absolute inset-0 flex items-center justify-center opacity-10">
          <div className="w-3/4 aspect-square rounded-full border-4 border-coffee-300" />
          <div className="absolute w-1/2 aspect-square rounded-full border-4 border-coffee-300" />
          <div className="absolute w-1/4 aspect-square rounded-full border-4 border-coffee-300" />
        </div>
        <motion.div
          animate={{ left: `${targetPos.x}%`, top: `${targetPos.y}%` }}
          transition={{ type: 'spring', stiffness: 300 }}
          className="absolute w-12 h-12 -ml-6 -mt-6 rounded-full bg-danger flex items-center justify-center text-2xl shadow-lg"
        >
          🎯
        </motion.div>
      </div>

      <div className="text-xl font-black text-coffee-500">총점: {totalScore}</div>

      <div className="w-full flex flex-col gap-1.5 mt-auto">
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
