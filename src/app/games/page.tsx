'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';
import GameCard from '@/components/game/GameCard';
import { useGameStore } from '@/stores/gameStore';
import { GAMES, getGamesByCategory } from '@/constants/games';
import { shuffleArray } from '@/utils/random';

const categories = [
  { id: 'all', label: '전체' },
  { id: 'racing', label: '🏃 경주' },
  { id: 'luck', label: '🎲 운' },
  { id: 'skill', label: '⚡ 스킬' },
  { id: 'party', label: '🎪 파티' },
];

export default function GameSelect() {
  const router = useRouter();
  const { selectGame, players } = useGameStore();
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredGames = getGamesByCategory(activeCategory)
    .filter((g) => g.minPlayers <= players.length);

  const handleSelect = (gameId: string) => {
    const game = GAMES.find((g) => g.id === gameId);
    if (game) {
      selectGame(game);
      router.push(`/games/${gameId}`);
    }
  };

  const handleRandom = () => {
    const available = GAMES.filter((g) => g.minPlayers <= players.length);
    const picked = shuffleArray(available)[0];
    if (picked) {
      selectGame(picked);
      router.push(`/games/${picked.id}`);
    }
  };

  return (
    <div className="flex flex-col min-h-dvh px-5 py-6 gap-3.5">
      <div className="flex items-center gap-3 mb-1">
        <motion.button
          whileTap={{ y: 2 }}
          onClick={() => router.back()}
          className="w-11 h-11 rounded-[14px] border-none bg-gradient-to-br from-white to-coffee-100 shadow-clay flex items-center justify-center text-xl cursor-pointer"
        >
          ←
        </motion.button>
        <h2 className="text-[22px] font-black text-coffee-800">게임 선택</h2>
      </div>

      <Button variant="accent" onClick={handleRandom} className="!text-base !py-3.5">
        🎲 랜덤 게임!
      </Button>

      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`
              py-2.5 px-4 rounded-[14px] border-none font-display text-[13px] font-bold
              whitespace-nowrap cursor-pointer transition-all
              ${activeCategory === cat.id
                ? 'bg-gradient-to-br from-coffee-500 to-coffee-500/90 text-white shadow-clay-primary'
                : 'bg-gradient-to-br from-white to-coffee-100 text-coffee-600 shadow-clay'}
            `}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        {filteredGames.map((game) => (
          <GameCard
            key={game.id}
            game={game}
            onClick={() => handleSelect(game.id)}
          />
        ))}
      </div>
    </div>
  );
}
