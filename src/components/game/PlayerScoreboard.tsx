'use client';

import { getAnimal } from '@/constants/animals';
import type { Player } from '@/types';

interface PlayerScoreboardProps {
  players: Player[];
  scores: (number | string)[];
  currentPlayerIdx?: number;
}

export default function PlayerScoreboard({ players, scores, currentPlayerIdx }: PlayerScoreboardProps) {
  return (
    <div className="w-full flex flex-col gap-1.5">
      {players.map((p, i) => {
        const a = getAnimal(p.animal);
        const isCurrent = currentPlayerIdx === i;
        return (
          <div
            key={p.id}
            className={`flex items-center gap-2 py-2 px-3 rounded-[12px] text-sm ${
              isCurrent ? 'bg-accent/10 ring-1 ring-accent/30' : 'bg-white/60'
            }`}
          >
            <span>{a?.emoji}</span>
            <span className="font-bold text-coffee-800">{p.name}</span>
            <span className="ml-auto font-black text-coffee-500">{scores[i] ?? '-'}</span>
          </div>
        );
      })}
    </div>
  );
}
