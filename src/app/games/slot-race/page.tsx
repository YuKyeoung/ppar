'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { getAnimal } from '@/constants/animals';
import CountDown from '@/components/game/CountDown';
import { SFX } from '@/utils/sound';
import { haptic } from '@/utils/haptic';

const SYMBOLS = ['🍒', '🍋', '🍊', '⭐', '💎', '7️⃣'];
const VALUES = [1, 2, 3, 4, 5, 6];

export default function SlotRace() {
  const router = useRouter();
  const { players, updateScore, setResult, selectedGame } = useGameStore();
  const [phase, setPhase] = useState<'countdown' | 'playing'>('countdown');
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [round, setRound] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [slots, setSlots] = useState([0, 0, 0]);
  const [scores, setScores] = useState<number[]>(players.map(() => 0));

  const handleCountdownComplete = useCallback(() => setPhase('playing'), []);

  // Guard: redirect if no players (direct access / refresh)
  useEffect(() => {
    if (players.length < 2) router.replace('/');
  }, [players.length, router]);

  if (players.length < 2) return null;

  const spin = () => {
    if (spinning) return;
    setSpinning(true);
    SFX.roll();
    haptic('medium');

    setTimeout(() => {
      const results = [0, 1, 2].map(() => Math.floor(Math.random() * 6));
      setSlots(results);
      const points = results.reduce((sum, r) => sum + VALUES[r], 0);

      setScores((prev) => {
        const next = [...prev];
        next[currentPlayer] += points;

        const nextRound = round + 1;
        if (nextRound >= 3) {
          if (currentPlayer >= players.length - 1) {
            // Use `next` (the latest scores) instead of stale `scores` closure
            setTimeout(() => {
              next.forEach((s, i) => updateScore(players[i].id, s));
              const ranked = players.map((p, i) => ({ ...p, score: next[i] })).sort((a, b) => b.score - a.score);
              setResult({ rankings: ranked, loser: ranked[ranked.length - 1], gameName: selectedGame?.name || '슬롯 레이스' });
              router.push('/result');
            }, 1000);
          } else {
            setTimeout(() => { setCurrentPlayer((c) => c + 1); setRound(0); }, 1000);
          }
        } else {
          setRound(nextRound);
        }

        return next;
      });
      setSpinning(false);
    }, 1200);
  };

  if (phase === 'countdown') return <CountDown onComplete={handleCountdownComplete} />;

  const animal = getAnimal(players[currentPlayer]?.animal);

  return (
    <div className="flex flex-col items-center min-h-dvh px-5 py-6 gap-4">
      <h2 className="text-[22px] font-black text-coffee-800 w-full">🎰 슬롯 레이스</h2>
      <div className="text-center py-3 px-6 rounded-[16px] bg-gradient-to-br from-coffee-500 to-coffee-500/90 text-white font-black shadow-clay-primary w-full">
        {animal?.emoji} {players[currentPlayer]?.name} — 라운드 {round + 1}/3
      </div>

      <div className="flex gap-3 my-6">
        {slots.map((s, i) => (
          <motion.div
            key={i}
            animate={spinning ? { y: [0, -20, 0] } : {}}
            transition={spinning ? { duration: 0.2, repeat: Infinity, delay: i * 0.1 } : {}}
            className="w-20 h-20 rounded-clay flex items-center justify-center text-4xl bg-gradient-to-br from-white to-coffee-100 shadow-clay"
          >
            {spinning ? SYMBOLS[Math.floor(Math.random() * 6)] : SYMBOLS[s]}
          </motion.div>
        ))}
      </div>

      <button onClick={spin} disabled={spinning} className="w-full py-4 rounded-clay border-none font-display font-black text-lg bg-gradient-to-br from-accent to-[#FF9F5F] text-white shadow-clay-accent cursor-pointer disabled:opacity-50">
        {spinning ? '🌀 돌아가는 중...' : '🎰 돌리기!'}
      </button>

      <div className="w-full flex flex-col gap-1.5 mt-auto">
        {players.map((p, i) => {
          const a = getAnimal(p.animal);
          return (
            <div key={p.id} className="flex items-center gap-2 py-2 px-3 rounded-[12px] bg-white/60 text-sm">
              <span>{a?.emoji}</span>
              <span className="font-bold text-coffee-800">{p.name}</span>
              <span className="ml-auto font-black text-coffee-500">{scores[i]}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
