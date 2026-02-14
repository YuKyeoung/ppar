'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';
import AnimalAvatar from '@/components/game/AnimalAvatar';
import { ANIMALS } from '@/constants/animals';
import { useGameStore } from '@/stores/gameStore';
import { generateId } from '@/utils/random';
import { unlockAudio } from '@/utils/sound';
import type { AnimalType, Player } from '@/types';

const MIN_PLAYERS = 2;
const MAX_PLAYERS = 6;

export default function SetupPage() {
  const router = useRouter();
  const setPlayers = useGameStore((s) => s.setPlayers);
  const [selected, setSelected] = useState<AnimalType[]>([]);

  const toggleAnimal = (id: AnimalType) => {
    setSelected((prev) => {
      if (prev.includes(id)) {
        return prev.filter((a) => a !== id);
      }
      if (prev.length >= MAX_PLAYERS) return prev;
      return [...prev, id];
    });
  };

  const handleStart = () => {
    unlockAudio();
    const players: Player[] = selected.map((animalId) => {
      const animal = ANIMALS.find((a) => a.id === animalId)!;
      return {
        id: generateId(),
        name: animal.name,
        animal: animalId,
        score: 0,
      };
    });
    setPlayers(players);
    router.push('/games');
  };

  const canStart = selected.length >= MIN_PLAYERS;

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

      <p className="text-sm font-bold text-coffee-400 mb-5">
        참가할 캐릭터를 선택하세요 (2~6마리)
      </p>

      <div className="grid grid-cols-4 gap-4">
        {ANIMALS.map((animal, i) => (
          <motion.div
            key={animal.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.03 }}
          >
            <AnimalAvatar
              animal={animal.id}
              size="lg"
              selected={selected.includes(animal.id)}
              disabled={!selected.includes(animal.id) && selected.length >= MAX_PLAYERS}
              showName
              onClick={() => toggleAnimal(animal.id)}
            />
          </motion.div>
        ))}
      </div>

      <div className="flex-1" />

      <div className="mt-6">
        <Button variant="primary" onClick={handleStart} disabled={!canStart}>
          {canStart
            ? `${selected.length}명으로 시작!`
            : '2마리 이상 선택해주세요'}
        </Button>
      </div>
    </div>
  );
}
