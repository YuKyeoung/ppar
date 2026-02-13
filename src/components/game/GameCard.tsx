'use client';

import Card from '@/components/ui/Card';
import { MiniGame } from '@/types';

interface GameCardProps {
  game: MiniGame;
  onClick: () => void;
}

export default function GameCard({ game, onClick }: GameCardProps) {
  return (
    <Card onClick={onClick} className="flex items-center gap-3.5 p-4">
      <div className="w-14 h-14 rounded-[16px] flex items-center justify-center text-[32px] bg-gradient-to-br from-cream to-coffee-100 shadow-clay-inset flex-shrink-0">
        {game.emoji}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-base font-black text-coffee-800">{game.name}</div>
        <div className="text-[13px] font-semibold text-coffee-400 mt-0.5">
          {game.description}
        </div>
      </div>
      <span className="text-lg text-coffee-300">›</span>
    </Card>
  );
}
