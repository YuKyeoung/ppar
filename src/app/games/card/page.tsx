'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { getAnimal } from '@/constants/animals';
import { SFX } from '@/utils/sound';
import { haptic } from '@/utils/haptic';

const SUITS = ['♠', '♥', '♦', '♣'];
const SUIT_COLORS: Record<string, string> = {
  '♠': '#1a1a2e',
  '♥': '#e74c3c',
  '♦': '#e74c3c',
  '♣': '#1a1a2e',
};

interface CardValue {
  number: number;
  suit: string;
}

export default function Card() {
  const router = useRouter();
  const { players, setResult } = useGameStore();
  const [flipped, setFlipped] = useState(false);
  const [done, setDone] = useState(false);
  const [cards, setCards] = useState<CardValue[]>([]);

  useEffect(() => {
    if (players.length < 2) router.replace('/');
  }, [players.length, router]);

  const flipCards = useCallback(() => {
    if (flipped || done) return;
    SFX.flip();
    haptic('medium');

    // Generate random cards for each player
    const generated = players.map(() => ({
      number: Math.floor(Math.random() * 10) + 1,
      suit: SUITS[Math.floor(Math.random() * SUITS.length)],
    }));
    setCards(generated);
    setFlipped(true);

    // After all flip animations complete, determine loser
    const totalFlipTime = players.length * 100 + 600; // stagger + flip duration
    setTimeout(() => {
      SFX.success();
      haptic('heavy');
      setDone(true);

      const minVal = Math.min(...generated.map((c) => c.number));
      const losersIndices = generated
        .map((c, i) => (c.number === minVal ? i : -1))
        .filter((i) => i !== -1);
      const loserIdx =
        losersIndices[Math.floor(Math.random() * losersIndices.length)];

      setTimeout(() => {
        const ranked = players
          .map((p, i) => ({ ...p, score: generated[i].number }))
          .sort((a, b) => b.score - a.score);
        const loser = { ...players[loserIdx], score: generated[loserIdx].number };
        setResult({ rankings: ranked, loser, gameName: '카드 뽑기' });
        router.push('/result');
      }, 1500);
    }, totalFlipTime);
  }, [flipped, done, players, setResult, router]);

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
          ←
        </motion.button>
        <h2 className="text-[22px] font-black text-coffee-800">🃏 카드 뽑기</h2>
      </div>

      <p className="text-sm font-bold text-coffee-400">
        {!flipped
          ? '탭해서 모든 카드를 오픈!'
          : done
            ? '결과 확인!'
            : '카드 오픈 중...'}
      </p>

      {/* Cards Grid */}
      <div className="flex-1 flex items-center justify-center w-full">
        <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
          {players.map((p, i) => {
            const animal = getAnimal(p.animal);
            const card = cards[i];
            const isLoser =
              done &&
              card &&
              card.number === Math.min(...cards.map((c) => c.number));
            return (
              <div key={p.id} className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-xl">{animal?.emoji}</span>
                  <span className="text-xs font-bold text-coffee-700">
                    {p.name}
                  </span>
                </div>
                <div className="relative" style={{ perspective: 600 }}>
                  <motion.div
                    className="relative w-20 h-28"
                    initial={false}
                    animate={
                      flipped
                        ? { rotateY: 180 }
                        : { rotateY: 0 }
                    }
                    transition={{
                      duration: 0.6,
                      delay: flipped ? i * 0.1 : 0,
                      ease: 'easeOut',
                    }}
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    {/* Card Back */}
                    <div
                      className="absolute inset-0 rounded-xl flex items-center justify-center shadow-clay"
                      style={{
                        backfaceVisibility: 'hidden',
                        background: 'linear-gradient(135deg, #8B6F47, #6B4F37)',
                      }}
                    >
                      <span className="text-4xl">🂠</span>
                    </div>
                    {/* Card Front */}
                    <motion.div
                      className="absolute inset-0 rounded-xl flex flex-col items-center justify-center shadow-clay bg-white"
                      style={{
                        backfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)',
                      }}
                      animate={
                        done
                          ? isLoser
                            ? {
                                scale: [1, 1.1, 1.05],
                                boxShadow: '0 0 20px rgba(255,107,107,0.5)',
                              }
                            : { opacity: 0.6 }
                          : {}
                      }
                      transition={{ duration: 0.4 }}
                    >
                      {card && (
                        <>
                          <span
                            className="text-2xl font-black"
                            style={{ color: SUIT_COLORS[card.suit] }}
                          >
                            {card.number}
                          </span>
                          <span
                            className="text-xl"
                            style={{ color: SUIT_COLORS[card.suit] }}
                          >
                            {card.suit}
                          </span>
                        </>
                      )}
                    </motion.div>
                  </motion.div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Flip Button */}
      <div className="mt-auto w-full">
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={flipCards}
          disabled={flipped}
          className="w-full py-4 rounded-clay border-none font-display font-black text-lg bg-gradient-to-br from-accent to-[#FF9F5F] text-white shadow-clay-accent cursor-pointer disabled:opacity-50"
        >
          {flipped ? '🃏 카드 오픈 중...' : '🃏 카드 오픈!'}
        </motion.button>
      </div>
    </div>
  );
}
