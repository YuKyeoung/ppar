'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';
import { useGameStore } from '@/stores/gameStore';
import { generateId } from '@/utils/random';
import { ANIMALS } from '@/constants/animals';
import { unlockAudio } from '@/utils/sound';
import type { Player, AnimalType } from '@/types';

export default function SetupPage() {
  const router = useRouter();
  const setPlayers = useGameStore((s) => s.setPlayers);
  const [selected, setSelected] = useState<AnimalType[]>([]);

  const toggle = (id: AnimalType) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : prev.length < 6 ? [...prev, id] : prev
    );
  };

  const handleStart = () => {
    unlockAudio();
    const players: Player[] = selected.map((animalId) => {
      const animal = ANIMALS.find((a) => a.id === animalId);
      return {
        id: generateId(),
        name: animal?.name || animalId,
        animal: animalId,
        score: 0,
      };
    });
    setPlayers(players);
    router.push('/games');
  };

  const canStart = selected.length >= 2;

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
          캐릭터 선택
        </h2>
      </div>

      <p className="text-sm font-bold text-coffee-400 mb-4">
        참가할 캐릭터를 골라주세요 (2~6명)
      </p>

      <div className="grid grid-cols-3 gap-3">
        {ANIMALS.map((animal) => {
          const isSelected = selected.includes(animal.id);
          const order = selected.indexOf(animal.id);
          return (
            <motion.button
              key={animal.id}
              whileTap={{ scale: 0.93 }}
              onClick={() => toggle(animal.id)}
              className={`
                flex flex-col items-center gap-1.5 py-4 px-2 rounded-clay-lg border-none cursor-pointer
                transition-all relative
                ${isSelected
                  ? 'bg-gradient-to-br from-coffee-500 to-coffee-500/90 shadow-clay-primary'
                  : 'bg-gradient-to-br from-white to-coffee-100 shadow-clay'
                }
              `}
            >
              {isSelected && (
                <div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-accent text-white text-xs font-black flex items-center justify-center shadow">
                  {order + 1}
                </div>
              )}
              <span className="text-4xl">{animal.emoji}</span>
              <span className={`text-xs font-bold ${isSelected ? 'text-cream' : 'text-coffee-600'}`}>
                {animal.name}
              </span>
            </motion.button>
          );
        })}
      </div>

      {selected.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 flex items-center gap-2 justify-center"
        >
          <span className="text-sm font-bold text-coffee-500">참가자:</span>
          {selected.map((id) => {
            const a = ANIMALS.find((x) => x.id === id);
            return <span key={id} className="text-2xl">{a?.emoji}</span>;
          })}
        </motion.div>
      )}

      <div className="flex-1" />

      <div className="mt-6">
        <Button variant="primary" onClick={handleStart} disabled={!canStart}>
          {canStart ? `${selected.length}명으로 시작!` : '2명 이상 선택해주세요'}
        </Button>
      </div>
    </div>
  );
}
