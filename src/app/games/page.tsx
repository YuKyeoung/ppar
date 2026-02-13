'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';
import GameCard from '@/components/game/GameCard';
import { useGameStore } from '@/stores/gameStore';
import { GAMES } from '@/constants/games';
import { shuffleArray } from '@/utils/random';

export default function GameSelectPage() {
  const router = useRouter();
  const players = useGameStore((s) => s.players);

  // Guard: redirect if no players
  useEffect(() => {
    if (players.length < 2) router.replace('/');
  }, [players.length, router]);

  if (players.length < 2) return null;

  const handleSelect = (gameId: string) => {
    router.push(`/games/${gameId}`);
  };

  const handleRandom = () => {
    const picked = shuffleArray(GAMES)[0];
    if (picked) {
      router.push(`/games/${picked.id}`);
    }
  };

  return (
    <div className="flex flex-col min-h-dvh px-5 py-6 bg-gradient-to-b from-cream to-coffee-100">
      <div className="flex items-center gap-3 mb-2">
        <motion.button
          whileTap={{ y: 2 }}
          onClick={() => router.back()}
          className="w-11 h-11 rounded-clay border-none bg-gradient-to-br from-white to-coffee-100 shadow-clay flex items-center justify-center text-xl cursor-pointer"
        >
          ←
        </motion.button>
        <h2 className="font-display text-[22px] font-black text-coffee-800">
          게임 선택
        </h2>
        <span className="ml-auto bg-gradient-to-br from-coffee-500 to-coffee-500/90 text-cream text-xs font-bold font-display px-3 py-1.5 rounded-clay shadow-clay-primary">
          {players.length}명 참가
        </span>
      </div>

      <div className="mt-3 mb-4">
        <Button variant="accent" onClick={handleRandom} className="!text-base !py-3.5">
          🎲 랜덤 게임!
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {GAMES.map((game, index) => (
          <motion.div
            key={game.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06 }}
          >
            <GameCard game={game} onClick={() => handleSelect(game.id)} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
