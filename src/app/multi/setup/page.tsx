'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import AnimalAvatar from '@/components/game/AnimalAvatar';
import { ANIMALS } from '@/constants/animals';
import { AnimalType } from '@/types';
import { useRoomStore } from '@/stores/roomStore';

export default function MultiSetup() {
  const router = useRouter();
  const createRoom = useRoomStore((s) => s.createRoom);

  const [step, setStep] = useState<1 | 2>(1);
  const [nickname, setNickname] = useState('');
  const [selectedAnimal, setSelectedAnimal] = useState<AnimalType | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const handleNext = () => {
    if (nickname.trim().length === 0) return;
    setStep(2);
  };

  const handleCreateRoom = async () => {
    if (!selectedAnimal || isCreating) return;
    setIsCreating(true);

    try {
      const roomCode = await createRoom({
        name: nickname.trim(),
        animal: selectedAnimal,
      });

      if (roomCode) {
        router.push(`/room/${roomCode}`);
      }
    } catch (error) {
      console.error('Failed to create room:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="flex flex-col min-h-dvh px-5 py-6 gap-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <motion.button
          whileTap={{ y: 2 }}
          onClick={() => (step === 2 ? setStep(1) : router.push('/'))}
          className="w-11 h-11 rounded-[14px] border-none bg-gradient-to-br from-white to-coffee-100 shadow-clay flex items-center justify-center text-xl cursor-pointer"
        >
          ←
        </motion.button>
        <h2 className="text-[22px] font-display font-black text-coffee-800">
          {step === 1 ? '닉네임을 입력하세요' : '동물을 선택하세요'}
        </h2>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col flex-1 gap-4"
          >
            <div className="rounded-clay-lg bg-gradient-to-br from-white to-coffee-50 shadow-clay p-6">
              <label className="block text-sm font-display font-bold text-coffee-600 mb-3">
                게임에서 사용할 이름
              </label>
              <Input
                placeholder="닉네임 입력"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                maxLength={10}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleNext();
                }}
              />
              <p className="text-xs font-display font-bold text-coffee-400 mt-2 text-right">
                {nickname.length}/10
              </p>
            </div>

            <div className="mt-auto">
              <Button
                variant="primary"
                onClick={handleNext}
                disabled={nickname.trim().length === 0}
              >
                다음
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col flex-1 gap-4"
          >
            {/* Selected preview */}
            <div className="flex items-center justify-center py-3">
              {selectedAnimal ? (
                <motion.div
                  key={selectedAnimal}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex flex-col items-center gap-1"
                >
                  <AnimalAvatar animal={selectedAnimal} size="lg" selected />
                  <span className="text-sm font-display font-bold text-coffee-500 mt-1">
                    {nickname}
                  </span>
                </motion.div>
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-coffee-100 to-coffee-50 shadow-clay-inset flex items-center justify-center text-2xl text-coffee-300">
                  ?
                </div>
              )}
            </div>

            {/* Animal grid */}
            <div className="grid grid-cols-4 gap-3">
              {ANIMALS.map((animal) => (
                <motion.button
                  key={animal.id}
                  whileTap={{ y: 2, scale: 0.95 }}
                  onClick={() => setSelectedAnimal(animal.id)}
                  className={`
                    flex flex-col items-center gap-1 py-3 px-1 rounded-clay border-none cursor-pointer font-display
                    transition-all
                    ${
                      selectedAnimal === animal.id
                        ? 'bg-gradient-to-br from-coffee-500 to-coffee-500/90 shadow-clay-primary'
                        : 'bg-gradient-to-br from-white to-coffee-50 shadow-clay'
                    }
                  `}
                >
                  <span className="text-3xl">{animal.emoji}</span>
                  <span
                    className={`text-[11px] font-bold ${
                      selectedAnimal === animal.id ? 'text-white' : 'text-coffee-600'
                    }`}
                  >
                    {animal.name}
                  </span>
                </motion.button>
              ))}
            </div>

            <div className="mt-auto">
              <Button
                variant="accent"
                onClick={handleCreateRoom}
                disabled={!selectedAnimal || isCreating}
              >
                {isCreating ? '방 만드는 중...' : '방 만들기!'}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
