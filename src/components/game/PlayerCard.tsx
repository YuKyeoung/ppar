'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import { getAnimal } from '@/constants/animals';
import type { Player } from '@/types';

interface PlayerCardProps extends HTMLMotionProps<'div'> {
  player: Player;
  /** Highlight as loser */
  isLoser?: boolean;
  /** Dim when game is done but player is not loser */
  dimmed?: boolean;
  children?: React.ReactNode;
}

export default function PlayerCard({
  player,
  isLoser = false,
  dimmed = false,
  children,
  className = '',
  ...props
}: PlayerCardProps) {
  const animal = getAnimal(player.animal);

  return (
    <motion.div
      className={`flex flex-col items-center gap-2 p-4 rounded-clay bg-gradient-to-br from-white to-coffee-100 shadow-clay ${className}`}
      animate={
        isLoser
          ? { scale: [1, 1.1, 1.05], boxShadow: '0 0 20px rgba(255,107,107,0.5)' }
          : dimmed
            ? { opacity: 0.6 }
            : {}
      }
      transition={{ duration: 0.4 }}
      {...props}
    >
      <div className="flex items-center gap-1.5">
        <span className="text-xl">{animal?.emoji}</span>
        <span className="text-xs font-bold text-coffee-700">{player.name}</span>
      </div>
      {children}
    </motion.div>
  );
}
