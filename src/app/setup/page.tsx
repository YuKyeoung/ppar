'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useGameStore } from '@/stores/gameStore';
import { generateId, randomAnimalIds } from '@/utils/random';
import { unlockAudio } from '@/utils/sound';
import type { Player } from '@/types';

const MIN_PLAYERS = 2;
const MAX_PLAYERS = 6;

export default function SetupPage() {
  const router = useRouter();
  const setPlayers = useGameStore((s) => s.setPlayers);
  const [names, setNames] = useState<string[]>(['', '']);

  const updateName = (index: number, value: string) => {
    setNames((prev) => prev.map((n, i) => (i === index ? value : n)));
  };

  const addPlayer = () => {
    if (names.length < MAX_PLAYERS) {
      setNames((prev) => [...prev, '']);
    }
  };

  const removePlayer = (index: number) => {
    if (names.length > MIN_PLAYERS) {
      setNames((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleStart = () => {
    unlockAudio();
    const animalIds = randomAnimalIds(names.length);
    const players: Player[] = names.map((name, i) => ({
      id: generateId(),
      name: name.trim() || `Player ${i + 1}`,
      animal: animalIds[i],
      score: 0,
    }));
    setPlayers(players);
    router.push('/games');
  };

  const filledCount = names.filter((n) => n.trim().length > 0).length;
  const canStart = filledCount >= MIN_PLAYERS;

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
          참가자 입력
        </h2>
      </div>

      <p className="text-sm font-bold text-coffee-400 mb-4">
        이름을 입력하면 캐릭터가 자동 배정됩니다 (2~6명)
      </p>

      <div className="flex flex-col gap-3">
        {names.map((name, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-2"
          >
            <span className="text-sm font-black text-coffee-500 w-6 text-center">
              {i + 1}
            </span>
            <Input
              placeholder={`Player ${i + 1}`}
              value={name}
              onChange={(e) => updateName(i, e.target.value)}
              maxLength={10}
              className="!py-3"
            />
            {names.length > MIN_PLAYERS && (
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => removePlayer(i)}
                className="w-9 h-9 rounded-full border-none bg-gradient-to-br from-[#FFCDD2] to-[#EF9A9A] text-[#C62828] text-sm font-black flex items-center justify-center cursor-pointer shadow-clay"
              >
                ✕
              </motion.button>
            )}
          </motion.div>
        ))}
      </div>

      {names.length < MAX_PLAYERS && (
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={addPlayer}
          className="mt-3 w-full py-3 rounded-clay border-2 border-dashed border-coffee-300 bg-transparent text-coffee-400 font-bold text-sm cursor-pointer"
        >
          + 참가자 추가
        </motion.button>
      )}

      <div className="flex-1" />

      <div className="mt-6">
        <Button variant="primary" onClick={handleStart} disabled={!canStart}>
          {canStart ? `${filledCount}명으로 시작!` : '2명 이상 이름을 입력해주세요'}
        </Button>
      </div>
    </div>
  );
}
