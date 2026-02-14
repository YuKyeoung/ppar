'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { useGameStore } from '@/stores/gameStore';
import { getAnimal } from '@/constants/animals';
import { SFX } from '@/utils/sound';
import { haptic } from '@/utils/haptic';

const rankStyles = [
  'bg-gradient-to-br from-[#FFD54F] to-[#FFB300] shadow-[3px_3px_6px_rgba(255,179,0,0.3)]',
  'bg-gradient-to-br from-[#E0E0E0] to-[#BDBDBD] shadow-[3px_3px_6px_rgba(0,0,0,0.1)]',
  'bg-gradient-to-br from-[#FFAB91] to-[#FF8A65] shadow-[3px_3px_6px_rgba(255,138,101,0.3)]',
];
const lastStyle =
  'bg-gradient-to-br from-[#EF9A9A] to-danger shadow-[3px_3px_6px_rgba(229,115,115,0.3)]';

export default function ResultPage() {
  const router = useRouter();
  const { result, players, clear } = useGameStore();

  // Guard: redirect if no players or no result
  useEffect(() => {
    if (players.length < 2 || !result) {
      router.replace('/');
    }
  }, [players.length, result, router]);

  // Sound & haptic on mount when result exists
  useEffect(() => {
    if (result) {
      SFX.fanfare();
      haptic('heavy');
    }
  }, [result]);

  if (players.length < 2 || !result) return null;

  const { rankings, loser } = result;
  const loserAnimal = getAnimal(loser.animal);

  return (
    <div className="flex flex-col items-center min-h-dvh px-5 py-6 gap-3.5">
      {/* Title */}
      <motion.h2
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-[26px] font-black text-coffee-800 mt-2"
      >
        🏆 결과 발표!
      </motion.h2>

      {/* Rankings list */}
      <div className="w-full flex flex-col gap-3">
        {rankings.map((player, index) => {
          const animal = getAnimal(player.animal);
          const isFirst = index === 0;
          const isLast = index === rankings.length - 1;
          const rankStyle = isLast
            ? lastStyle
            : rankStyles[index] || rankStyles[2];

          return (
            <motion.div
              key={player.id}
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.15 }}
            >
              <Card className="flex items-center gap-3.5 !p-3.5">
                {/* Rank badge */}
                <div
                  className={`w-8 h-8 rounded-[10px] flex items-center justify-center font-black text-[15px] text-white ${rankStyle}`}
                >
                  {index + 1}
                </div>
                {/* Animal emoji */}
                <span className="text-[32px]">{animal?.emoji}</span>
                {/* Name & score */}
                <div className="flex-1">
                  <div className="font-black text-base text-coffee-800">
                    {player.name}
                  </div>
                  <div className="text-[13px] font-semibold text-coffee-400">
                    점수: {player.score}
                  </div>
                </div>
                {/* Crown for 1st, coffee for last */}
                {isFirst && <span className="text-xl">👑</span>}
                {isLast && <span className="text-xl">☕</span>}
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Loser highlight box */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          delay: rankings.length * 0.15 + 0.2,
          type: 'spring',
        }}
        className="w-full text-center p-6 rounded-clay-lg bg-gradient-to-br from-[#FFEBEE] to-[#FFCDD2] shadow-clay"
      >
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="text-5xl"
        >
          {loserAnimal?.emoji}☕
        </motion.div>
        <div className="text-[22px] font-black text-[#C62828] mt-2">
          {loser.name}, 커피 사세요!
        </div>
      </motion.div>

      {/* Action buttons */}
      <div className="w-full flex flex-col gap-2.5 mt-2">
        <Button
          variant="primary"
          onClick={() => {
            router.push('/games');
          }}
        >
          🎮 다른 게임 하기
        </Button>
        <Button
          variant="secondary"
          onClick={() => {
            clear();
            router.push('/setup');
          }}
        >
          🐾 동물 다시 고르기
        </Button>
      </div>
    </div>
  );
}
