'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import AnimalAvatar from '@/components/game/AnimalAvatar';
import { ANIMALS } from '@/constants/animals';
import { useRoomStore } from '@/stores/roomStore';
import { AnimalType } from '@/types';

type Step = 'nickname' | 'animal';

export default function JoinRoom() {
  const router = useRouter();
  const params = useParams();
  const code = (params.code as string).toUpperCase();

  const joinRoom = useRoomStore((s) => s.joinRoom);

  const [step, setStep] = useState<Step>('nickname');
  const [name, setName] = useState('');
  const [selectedAnimal, setSelectedAnimal] = useState<AnimalType | null>(null);
  const [error, setError] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  const handleNextStep = () => {
    if (name.trim().length === 0) return;
    setStep('animal');
  };

  const handleAnimalSelect = async (animal: AnimalType) => {
    setSelectedAnimal(animal);
    setError('');
    setIsJoining(true);

    try {
      await joinRoom(code, { name: name.trim(), animal });
      router.push(`/room/${code}`);
    } catch {
      setError('방을 찾을 수 없습니다. 코드를 확인해주세요.');
      setIsJoining(false);
    }
  };

  return (
    <div className="flex flex-col min-h-dvh px-5 py-6 bg-gradient-to-b from-cream to-coffee-100">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <motion.button
          whileTap={{ y: 2 }}
          onClick={() => {
            if (step === 'animal') {
              setStep('nickname');
              setSelectedAnimal(null);
              setError('');
            } else {
              router.push('/join');
            }
          }}
          className="
            w-11 h-11 rounded-[14px] border-none
            bg-gradient-to-br from-white to-coffee-100
            shadow-clay flex items-center justify-center
            text-xl cursor-pointer
          "
        >
          ←
        </motion.button>
        <div>
          <h2 className="font-display font-black text-[22px] text-coffee-800">
            {step === 'nickname' ? '닉네임을 입력하세요' : '동물을 선택하세요'}
          </h2>
          <p className="font-display font-bold text-sm text-coffee-400">
            방 코드: {code}
          </p>
        </div>
      </div>

      {step === 'nickname' ? (
        <motion.div
          key="nickname"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="flex flex-col flex-1 gap-5"
        >
          <div
            className="
              p-6 rounded-clay-lg
              bg-gradient-to-br from-white to-coffee-50
              shadow-clay
            "
          >
            <label className="font-display font-bold text-sm text-coffee-600 mb-3 block">
              닉네임
            </label>
            <Input
              placeholder="닉네임을 입력하세요"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={10}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleNextStep();
              }}
            />
          </div>

          <div className="mt-auto">
            <Button
              variant="primary"
              onClick={handleNextStep}
              disabled={name.trim().length === 0}
            >
              다음으로 →
            </Button>
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="animal"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="flex flex-col flex-1 gap-5"
        >
          <div
            className="
              text-center py-3 rounded-[16px]
              bg-gradient-to-br from-coffee-500 to-coffee-500/90
              text-white font-display font-black
              shadow-clay-primary
            "
          >
            {name}
          </div>

          <div className="grid grid-cols-4 gap-3">
            {ANIMALS.map((animal) => (
              <motion.button
                key={animal.id}
                whileTap={{ y: 2, scale: 0.95 }}
                onClick={() => handleAnimalSelect(animal.id)}
                disabled={isJoining}
                className={`
                  flex flex-col items-center gap-1.5 py-3.5 px-2
                  rounded-clay border-none cursor-pointer font-display
                  transition-all
                  ${
                    selectedAnimal === animal.id
                      ? 'bg-gradient-to-br from-coffee-500 to-coffee-500/90 shadow-clay-primary'
                      : 'bg-gradient-to-br from-white to-coffee-50 shadow-clay'
                  }
                  ${isJoining && selectedAnimal !== animal.id ? 'opacity-30' : ''}
                `}
              >
                <AnimalAvatar
                  animal={animal.id}
                  size="md"
                  selected={selectedAnimal === animal.id}
                />
                <span
                  className={`text-xs font-bold ${
                    selectedAnimal === animal.id
                      ? 'text-white'
                      : 'text-coffee-600'
                  }`}
                >
                  {animal.name}
                </span>
              </motion.button>
            ))}
          </div>

          {isJoining && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center font-display font-bold text-coffee-500"
            >
              입장 중...
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="
                text-center py-3 px-4 rounded-clay
                bg-gradient-to-br from-red-50 to-red-100
                shadow-clay
              "
            >
              <p className="font-display font-bold text-sm text-red-600">
                {error}
              </p>
              <button
                onClick={() => {
                  setSelectedAnimal(null);
                  setError('');
                }}
                className="
                  mt-2 font-display font-bold text-xs text-red-400
                  bg-transparent border-none cursor-pointer underline
                "
              >
                다시 시도하기
              </button>
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
}
