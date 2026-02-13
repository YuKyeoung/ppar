'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { getAnimal } from '@/constants/animals';
import CountDown from '@/components/game/CountDown';

const DICE_FACES = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

export default function DiceBattle() {
  const router = useRouter();
  const { players, updateScore, setResult, selectedGame } = useGameStore();
  const [phase, setPhase] = useState<'countdown' | 'playing' | 'done'>('countdown');
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [rolling, setRolling] = useState(false);
  const [diceValue, setDiceValue] = useState<number | null>(null);
  const [scores, setScores] = useState<number[]>(players.map(() => 0));

  const handleCountdownComplete = useCallback(() => setPhase('playing'), []);

  const roll = () => {
    if (rolling || currentPlayer >= players.length) return;
    setRolling(true);
    setDiceValue(null);

    let count = 0;
    const interval = setInterval(() => {
      setDiceValue(Math.floor(Math.random() * 6));
      count++;
      if (count > 15) {
        clearInterval(interval);
        const result = Math.floor(Math.random() * 6) + 1;
        setDiceValue(result - 1);
        const newScores = [...scores];
        newScores[currentPlayer] = result;
        setScores(newScores);
        updateScore(players[currentPlayer].id, result);
        setRolling(false);

        if (currentPlayer >= players.length - 1) {
          setTimeout(() => {
            const ranked = players
              .map((p, i) => ({ ...p, score: newScores[i] }))
              .sort((a, b) => b.score - a.score);
            setResult({
              rankings: ranked,
              loser: ranked[ranked.length - 1],
              gameName: selectedGame?.name || '주사위 대결',
            });
            router.push('/result');
          }, 1200);
        } else {
          setTimeout(() => setCurrentPlayer(currentPlayer + 1), 800);
        }
      }
    }, 60);
  };

  if (phase === 'countdown') {
    return <CountDown onComplete={handleCountdownComplete} />;
  }

  return (
    <div className="flex flex-col items-center min-h-dvh px-5 py-6 gap-5">
      <div className="flex items-center gap-3 w-full">
        <motion.button
          whileTap={{ y: 2 }}
          onClick={() => router.push('/games')}
          className="w-11 h-11 rounded-[14px] border-none bg-gradient-to-br from-white to-coffee-100 shadow-clay flex items-center justify-center text-xl cursor-pointer"
        >
          ←
        </motion.button>
        <h2 className="text-[22px] font-black text-coffee-800">🎲 주사위 대결</h2>
      </div>

      <div className="flex justify-center gap-3 w-full">
        {players.map((p, i) => {
          const animal = getAnimal(p.animal);
          return (
            <div key={p.id} className="flex flex-col items-center gap-1">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all ${
                i === currentPlayer
                  ? 'bg-gradient-to-br from-[#FFB74D] to-[#FFA726] shadow-[4px_4px_8px_rgba(255,152,0,0.3)]'
                  : 'bg-gradient-to-br from-white to-coffee-100 shadow-clay'
              }`}>
                {animal?.emoji}
              </div>
              <span className="text-[11px] font-bold text-coffee-600">{p.name}</span>
            </div>
          );
        })}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <motion.div
          onClick={roll}
          animate={rolling ? { rotate: [0, 10, -10, 0], scale: [1, 1.05, 1] } : {}}
          transition={rolling ? { duration: 0.15, repeat: Infinity } : {}}
          className="w-[120px] h-[120px] rounded-[28px] flex items-center justify-center text-[64px] cursor-pointer bg-gradient-to-br from-white to-coffee-100 shadow-clay select-none"
        >
          {diceValue !== null ? DICE_FACES[diceValue] : '🎲'}
        </motion.div>
        <p className="text-base font-bold text-coffee-400">
          {currentPlayer < players.length
            ? `${players[currentPlayer].name} - 탭해서 굴려!`
            : '결과 확인!'}
        </p>
      </div>

      <div className="w-full flex flex-col gap-2">
        {players.map((p, i) => {
          const animal = getAnimal(p.animal);
          return (
            <div key={p.id} className="flex items-center gap-2.5 py-2.5 px-4 rounded-[14px] bg-gradient-to-br from-white to-[#FBF3EA] shadow-[3px_3px_6px_rgba(139,94,60,0.08),-2px_-2px_4px_rgba(255,255,255,0.7)]">
              <span className="text-[22px]">{animal?.emoji}</span>
              <span className="flex-1 font-bold text-sm text-coffee-800">{p.name}</span>
              <span className="font-black text-xl text-coffee-500">{scores[i] || '-'}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
