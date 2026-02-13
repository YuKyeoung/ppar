'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { useGameStore } from '@/stores/gameStore';
import { ANIMALS } from '@/constants/animals';
import { AnimalType, Player } from '@/types';
import { generateId, randomAnimalIds } from '@/utils/random';

export default function SoloSetup() {
  const router = useRouter();
  const setPlayers = useGameStore((s) => s.setPlayers);
  const [count, setCount] = useState(4);
  const [names, setNames] = useState<string[]>(Array(8).fill(''));
  const [step, setStep] = useState<'count' | 'characters'>('count');
  const [selectedAnimals, setSelectedAnimals] = useState<(AnimalType | null)[]>(Array(8).fill(null));
  const [currentPicker, setCurrentPicker] = useState(0);

  const handleCountChange = (delta: number) => {
    setCount((c) => Math.min(8, Math.max(2, c + delta)));
  };

  const handleNameChange = (index: number, value: string) => {
    setNames((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const handleAnimalSelect = (animal: AnimalType) => {
    if (selectedAnimals.includes(animal)) return;
    setSelectedAnimals((prev) => {
      const next = [...prev];
      next[currentPicker] = animal;
      return next;
    });
    if (currentPicker < count - 1) {
      setCurrentPicker(currentPicker + 1);
    }
  };

  const handleRandomAll = () => {
    const ids = randomAnimalIds(count);
    const newSelected = Array(8).fill(null) as (AnimalType | null)[];
    ids.forEach((id, i) => { newSelected[i] = id; });
    setSelectedAnimals(newSelected);
    setCurrentPicker(count - 1);
  };

  const handleStart = (useRandom: boolean) => {
    let animals: (AnimalType | null)[];
    if (useRandom) {
      const ids = randomAnimalIds(count);
      animals = Array(8).fill(null) as (AnimalType | null)[];
      ids.forEach((id, i) => { animals[i] = id; });
    } else {
      animals = selectedAnimals;
    }

    const players: Player[] = Array.from({ length: count }, (_, i) => ({
      id: generateId(),
      name: names[i] || `Player ${i + 1}`,
      animal: animals[i] || randomAnimalIds(1)[0],
      score: 0,
    }));

    setPlayers(players);
    router.push('/games');
  };

  const allPicked = selectedAnimals.slice(0, count).every((a) => a !== null);

  return (
    <div className="flex flex-col min-h-dvh px-5 py-6 gap-4">
      <div className="flex items-center gap-3 mb-2">
        <motion.button
          whileTap={{ y: 2 }}
          onClick={() => step === 'characters' ? setStep('count') : router.push('/')}
          className="w-11 h-11 rounded-[14px] border-none bg-gradient-to-br from-white to-coffee-100 shadow-clay flex items-center justify-center text-xl cursor-pointer"
        >
          ←
        </motion.button>
        <h2 className="text-[22px] font-black text-coffee-800">
          {step === 'count' ? '몇 명이야 해?' : '동물 선택'}
        </h2>
      </div>

      {step === 'count' ? (
        <>
          <Card>
            <div className="flex items-center justify-center gap-6">
              <motion.button
                whileTap={{ y: 2 }}
                onClick={() => handleCountChange(-1)}
                className="w-14 h-14 rounded-full border-none text-[28px] font-black text-coffee-800 bg-gradient-to-br from-white to-coffee-100 shadow-clay cursor-pointer font-display"
              >
                −
              </motion.button>
              <div className="text-[56px] font-black text-coffee-500 w-20 text-center">
                {count}
              </div>
              <motion.button
                whileTap={{ y: 2 }}
                onClick={() => handleCountChange(1)}
                className="w-14 h-14 rounded-full border-none text-[28px] font-black text-coffee-800 bg-gradient-to-br from-white to-coffee-100 shadow-clay cursor-pointer font-display"
              >
                +
              </motion.button>
            </div>
            <p className="text-center text-sm font-bold text-coffee-600 -mt-1">명</p>
          </Card>

          <div className="flex flex-col gap-2.5">
            {Array.from({ length: count }, (_, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <span className="text-[28px] w-10 text-center">
                  {ANIMALS[i % ANIMALS.length].emoji}
                </span>
                <Input
                  placeholder={`Player ${i + 1}`}
                  value={names[i]}
                  onChange={(e) => handleNameChange(i, e.target.value)}
                />
              </div>
            ))}
          </div>

          <div className="mt-auto flex flex-col gap-2.5">
            <Button variant="secondary" onClick={() => setStep('characters')}>
              🎲 동물 직접 선택
            </Button>
            <Button variant="primary" onClick={() => handleStart(true)}>
              ✨ 랜덤 배정 + 바로 시작!
            </Button>
          </div>
        </>
      ) : (
        <>
          <div className="text-center py-3 rounded-[16px] bg-gradient-to-br from-coffee-500 to-coffee-500/90 text-white font-black shadow-clay-primary">
            {ANIMALS.find(a => a.id === selectedAnimals[currentPicker])?.emoji || '?'} {names[currentPicker] || `Player ${currentPicker + 1}`} 차례
          </div>

          <div className="grid grid-cols-3 gap-3">
            {ANIMALS.map((animal) => {
              const pickedBy = selectedAnimals.indexOf(animal.id);
              const isSelected = pickedBy === currentPicker;
              const isDisabled = pickedBy >= 0 && pickedBy !== currentPicker;
              return (
                <motion.button
                  key={animal.id}
                  whileTap={!isDisabled ? { y: 2, scale: 0.97 } : undefined}
                  onClick={() => handleAnimalSelect(animal.id)}
                  disabled={isDisabled}
                  className={`
                    flex flex-col items-center gap-1 py-3.5 px-2 rounded-clay border-none cursor-pointer font-display
                    transition-all
                    ${isSelected
                      ? 'bg-gradient-to-br from-coffee-500 to-coffee-500/90 shadow-clay-primary'
                      : 'bg-gradient-to-br from-white to-[#FBF3EA] shadow-clay'}
                    ${isDisabled ? 'opacity-30 cursor-not-allowed' : ''}
                  `}
                >
                  <span className="text-4xl">{animal.emoji}</span>
                  <span className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-coffee-600'}`}>
                    {animal.name}
                  </span>
                </motion.button>
              );
            })}
          </div>

          <Button variant="secondary" onClick={handleRandomAll} className="!text-[15px] !py-3.5">
            🎲 전체 랜덤 배정
          </Button>

          <div className="mt-auto">
            <Button
              variant="primary"
              onClick={() => handleStart(false)}
              disabled={!allPicked}
            >
              게임 선택으로! →
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
