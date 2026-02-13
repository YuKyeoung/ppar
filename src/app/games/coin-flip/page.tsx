'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { getAnimal } from '@/constants/animals';
import CountDown from '@/components/game/CountDown';

export default function CoinFlip() {
  const router = useRouter();
  const { players, updateScore, setResult, selectedGame } = useGameStore();
  const [phase, setPhase] = useState<'countdown' | 'choosing' | 'flipping' | 'result'>('countdown');
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [choices, setChoices] = useState<('heads' | 'tails')[]>([]);
  const [coinResult, setCoinResult] = useState<'heads' | 'tails' | null>(null);
  const [, setScores] = useState<number[]>(players.map(() => 0));
  const [flipping, setFlipping] = useState(false);

  const handleCountdownComplete = useCallback(() => setPhase('choosing'), []);

  // Guard: redirect if no players (direct access / refresh)
  useEffect(() => {
    if (players.length < 2) router.replace('/');
  }, [players.length, router]);

  if (players.length < 2) return null;

  const choose = (choice: 'heads' | 'tails') => {
    const newChoices = [...choices, choice];
    setChoices(newChoices);

    if (currentPlayer < players.length - 1) {
      setCurrentPlayer(currentPlayer + 1);
    } else {
      setPhase('flipping');
      setFlipping(true);
      setTimeout(() => {
        const result = Math.random() > 0.5 ? 'heads' : 'tails';
        setCoinResult(result);
        setFlipping(false);

        const newScores = players.map((_, i) => newChoices[i] === result ? 1 : 0);
        setScores(newScores);
        newScores.forEach((s, i) => updateScore(players[i].id, s));

        setTimeout(() => {
          const ranked = players
            .map((p, i) => ({ ...p, score: newScores[i] }))
            .sort((a, b) => b.score - a.score);
          setResult({
            rankings: ranked,
            loser: ranked[ranked.length - 1],
            gameName: selectedGame?.name || '동전 던지기',
          });
          router.push('/result');
        }, 2000);
      }, 1500);
    }
  };

  if (phase === 'countdown') {
    return <CountDown onComplete={handleCountdownComplete} />;
  }

  const currentAnimal = getAnimal(players[currentPlayer]?.animal);

  return (
    <div className="flex flex-col items-center min-h-dvh px-5 py-6 gap-5">
      <div className="flex items-center gap-3 w-full">
        <motion.button whileTap={{ y: 2 }} onClick={() => router.push('/games')} className="w-11 h-11 rounded-[14px] border-none bg-gradient-to-br from-white to-coffee-100 shadow-clay flex items-center justify-center text-xl cursor-pointer">←</motion.button>
        <h2 className="text-[22px] font-black text-coffee-800">🪙 동전 던지기</h2>
      </div>

      {phase === 'choosing' && (
        <>
          <div className="text-center py-3 px-6 rounded-[16px] bg-gradient-to-br from-coffee-500 to-coffee-500/90 text-white font-black shadow-clay-primary">
            {currentAnimal?.emoji} {players[currentPlayer]?.name} - 앞? 뒤?
          </div>
          <div className="flex-1 flex items-center justify-center gap-6">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => choose('heads')}
              className="w-32 h-32 rounded-full border-none cursor-pointer bg-gradient-to-br from-[#FFD54F] to-[#FFB300] shadow-clay-accent flex flex-col items-center justify-center gap-1"
            >
              <span className="text-4xl">👑</span>
              <span className="font-black text-white text-sm">앞</span>
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => choose('tails')}
              className="w-32 h-32 rounded-full border-none cursor-pointer bg-gradient-to-br from-coffee-400 to-coffee-500 shadow-clay-primary flex flex-col items-center justify-center gap-1"
            >
              <span className="text-4xl">🌿</span>
              <span className="font-black text-white text-sm">뒤</span>
            </motion.button>
          </div>
          <div className="w-full flex flex-col gap-1.5">
            {players.map((p, i) => {
              const animal = getAnimal(p.animal);
              return (
                <div key={p.id} className="flex items-center gap-2 py-2 px-3 rounded-[12px] bg-white/60 text-sm">
                  <span>{animal?.emoji}</span>
                  <span className="font-bold text-coffee-800">{p.name}</span>
                  <span className="ml-auto font-bold text-coffee-400">{choices[i] ? (choices[i] === 'heads' ? '앞' : '뒤') : '...'}</span>
                </div>
              );
            })}
          </div>
        </>
      )}

      {(phase === 'flipping') && (
        <div className="flex-1 flex flex-col items-center justify-center gap-6">
          <motion.div
            animate={flipping ? { rotateY: [0, 180, 360] } : {}}
            transition={flipping ? { duration: 0.4, repeat: Infinity } : {}}
            className="w-32 h-32 rounded-full bg-gradient-to-br from-[#FFD54F] to-[#FFB300] shadow-clay-accent flex items-center justify-center text-5xl"
          >
            {coinResult ? (coinResult === 'heads' ? '👑' : '🌿') : '🪙'}
          </motion.div>
          <p className="text-xl font-black text-coffee-800">
            {coinResult ? `${coinResult === 'heads' ? '앞' : '뒤'}!` : '던지는 중...'}
          </p>
        </div>
      )}
    </div>
  );
}
