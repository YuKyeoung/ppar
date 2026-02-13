'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { getAnimal } from '@/constants/animals';
import CountDown from '@/components/game/CountDown';
import { shuffleArray } from '@/utils/random';

const CARD_VALUES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export default function CardDraw() {
  const router = useRouter();
  const { players, updateScore, setResult, selectedGame } = useGameStore();
  const [phase, setPhase] = useState<'countdown' | 'playing'>('countdown');
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [cards] = useState(() => shuffleArray(CARD_VALUES));
  const [revealed, setRevealed] = useState<boolean[]>(Array(10).fill(false));
  const [scores, setScores] = useState<number[]>(players.map(() => 0));
  const [picked, setPicked] = useState<number[]>([]);

  const handleCountdownComplete = useCallback(() => setPhase('playing'), []);

  const pickCard = (index: number) => {
    if (revealed[index] || picked.includes(index)) return;

    const newRevealed = [...revealed];
    newRevealed[index] = true;
    setRevealed(newRevealed);
    setPicked([...picked, index]);

    const value = cards[index];
    const newScores = [...scores];
    newScores[currentPlayer] = value;
    setScores(newScores);
    updateScore(players[currentPlayer].id, value);

    if (currentPlayer >= players.length - 1) {
      setTimeout(() => {
        const ranked = players
          .map((p, i) => ({ ...p, score: newScores[i] }))
          .sort((a, b) => b.score - a.score);
        setResult({
          rankings: ranked,
          loser: ranked[ranked.length - 1],
          gameName: selectedGame?.name || '카드 뽑기',
        });
        router.push('/result');
      }, 1500);
    } else {
      setTimeout(() => setCurrentPlayer(currentPlayer + 1), 1000);
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
        <h2 className="text-[22px] font-black text-coffee-800">🃏 카드 뽑기</h2>
      </div>

      <div className="text-center py-3 px-6 rounded-[16px] bg-gradient-to-br from-coffee-500 to-coffee-500/90 text-white font-black shadow-clay-primary">
        {currentAnimal?.emoji} {players[currentPlayer]?.name} 차례 - 카드를 골라!
      </div>

      <div className="grid grid-cols-5 gap-3 w-full">
        {cards.map((value, index) => (
          <motion.button
            key={index}
            whileTap={!revealed[index] ? { scale: 0.9 } : undefined}
            onClick={() => pickCard(index)}
            className={`
              aspect-[3/4] rounded-[14px] border-none cursor-pointer font-display
              flex items-center justify-center text-2xl font-black
              transition-all
              ${revealed[index]
                ? 'bg-gradient-to-br from-white to-coffee-100 shadow-clay text-coffee-500'
                : 'bg-gradient-to-br from-coffee-500 to-coffee-500/90 shadow-clay-primary text-white'}
            `}
          >
            {revealed[index] ? value : '?'}
          </motion.button>
        ))}
      </div>

      <div className="w-full flex flex-col gap-2 mt-auto">
        {players.map((p, i) => {
          const animal = getAnimal(p.animal);
          return (
            <div key={p.id} className="flex items-center gap-2.5 py-2.5 px-4 rounded-[14px] bg-gradient-to-br from-white to-[#FBF3EA] shadow-[3px_3px_6px_rgba(139,94,60,0.08)]">
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
