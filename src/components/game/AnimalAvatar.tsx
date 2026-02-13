'use client';

import { getAnimal } from '@/constants/animals';
import { AnimalType } from '@/types';

interface AnimalAvatarProps {
  animal: AnimalType;
  size?: 'sm' | 'md' | 'lg';
  selected?: boolean;
  disabled?: boolean;
  showName?: boolean;
  onClick?: () => void;
}

const sizes = {
  sm: 'w-10 h-10 text-xl',
  md: 'w-12 h-12 text-2xl',
  lg: 'w-16 h-16 text-4xl',
};

export default function AnimalAvatar({
  animal,
  size = 'md',
  selected = false,
  disabled = false,
  showName = false,
  onClick,
}: AnimalAvatarProps) {
  const data = getAnimal(animal);
  if (!data) return null;

  return (
    <div
      onClick={disabled ? undefined : onClick}
      className={`
        flex flex-col items-center gap-1
        ${onClick && !disabled ? 'cursor-pointer' : ''}
        ${disabled ? 'opacity-30' : ''}
      `}
    >
      <div
        className={`
          ${sizes[size]} rounded-full
          flex items-center justify-center
          transition-all
          ${
            selected
              ? 'bg-gradient-to-br from-coffee-500 to-coffee-500/90 shadow-clay-primary'
              : 'bg-gradient-to-br from-white to-coffee-100 shadow-clay'
          }
        `}
      >
        {data.emoji}
      </div>
      {showName && (
        <span
          className={`text-xs font-bold ${
            selected ? 'text-coffee-500' : 'text-coffee-600'
          }`}
        >
          {data.name}
        </span>
      )}
    </div>
  );
}
