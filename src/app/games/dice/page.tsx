'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { SFX } from '@/utils/sound';
import { haptic } from '@/utils/haptic';
import TapButton from '@/components/game/TapButton';
import PlayerCard from '@/components/game/PlayerCard';

// 3D dice face rotations: [rotateX, rotateY] to show each face (1-6)
const FACE_ROTATIONS: Record<number, { rx: number; ry: number }> = {
  1: { rx: 0, ry: 0 },
  2: { rx: -90, ry: 0 },
  3: { rx: 0, ry: -90 },
  4: { rx: 0, ry: 90 },
  5: { rx: 90, ry: 0 },
  6: { rx: 180, ry: 0 },
};

// Dot positions for each dice face (3x3 grid coordinates)
const DOTS: Record<number, number[][]> = {
  1: [[1, 1]],
  2: [[0, 0], [2, 2]],
  3: [[0, 0], [1, 1], [2, 2]],
  4: [[0, 0], [0, 2], [2, 0], [2, 2]],
  5: [[0, 0], [0, 2], [1, 1], [2, 0], [2, 2]],
  6: [[0, 0], [0, 2], [1, 0], [1, 2], [2, 0], [2, 2]],
};

function DiceFace({ value, size }: { value: number; size: number }) {
  const dots = DOTS[value] || DOTS[1];
  const dotSize = size * 0.17;
  const padding = size * 0.22;
  const gap = (size - padding * 2 - dotSize) / 2;

  return (
    <div
      className="absolute rounded-lg"
      style={{
        width: size,
        height: size,
        background: 'linear-gradient(145deg, #FFFEF9, #F0EBE0)',
        border: '1.5px solid rgba(139,94,60,0.12)',
        boxShadow: 'inset 0 1px 3px rgba(255,255,255,0.8)',
      }}
    >
      {dots.map(([row, col], i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: dotSize,
            height: dotSize,
            background: 'radial-gradient(circle at 35% 35%, #5D4037, #3E2723)',
            left: padding + col * gap,
            top: padding + row * gap,
            boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.25)',
          }}
        />
      ))}
    </div>
  );
}

function Dice3D({
  value,
  rolling,
  size = 60,
}: {
  value: number;
  rolling: boolean;
  size?: number;
}) {
  const target = FACE_ROTATIONS[value] || FACE_ROTATIONS[1];
  const half = size / 2;

  const rollRx = rolling ? 720 + Math.random() * 360 : target.rx;
  const rollRy = rolling ? 540 + Math.random() * 360 : target.ry;

  return (
    <div style={{ perspective: 400, width: size, height: size }}>
      <motion.div
        style={{
          width: size,
          height: size,
          position: 'relative',
          transformStyle: 'preserve-3d',
        }}
        animate={{ rotateX: rollRx, rotateY: rollRy }}
        transition={
          rolling
            ? { duration: 2, ease: [0.15, 0.85, 0.25, 1] }
            : { duration: 0.5, ease: 'easeOut' }
        }
      >
        {/* Front (1) */}
        <div className="absolute" style={{ transform: `translateZ(${half}px)` }}>
          <DiceFace value={1} size={size} />
        </div>
        {/* Back (6) */}
        <div className="absolute" style={{ transform: `rotateY(180deg) translateZ(${half}px)` }}>
          <DiceFace value={6} size={size} />
        </div>
        {/* Top (5) */}
        <div className="absolute" style={{ transform: `rotateX(90deg) translateZ(${half}px)` }}>
          <DiceFace value={5} size={size} />
        </div>
        {/* Bottom (2) */}
        <div className="absolute" style={{ transform: `rotateX(-90deg) translateZ(${half}px)` }}>
          <DiceFace value={2} size={size} />
        </div>
        {/* Right (4) */}
        <div className="absolute" style={{ transform: `rotateY(90deg) translateZ(${half}px)` }}>
          <DiceFace value={4} size={size} />
        </div>
        {/* Left (3) */}
        <div className="absolute" style={{ transform: `rotateY(-90deg) translateZ(${half}px)` }}>
          <DiceFace value={3} size={size} />
        </div>
      </motion.div>
    </div>
  );
}

export default function DicePage() {
  const router = useRouter();
  const { players, setResult } = useGameStore();
  const [rolling, setRolling] = useState(false);
  const [done, setDone] = useState(false);
  const [diceValues, setDiceValues] = useState<number[]>(() =>
    players.map(() => 1)
  );
  const [finalValues, setFinalValues] = useState<number[]>([]);

  useEffect(() => {
    if (players.length < 2) router.replace('/');
  }, [players.length, router]);

  const roll = useCallback(() => {
    if (rolling || done) return;
    setRolling(true);
    SFX.roll();
    haptic('medium');

    const finals = players.map(() => Math.floor(Math.random() * 6) + 1);
    setDiceValues(finals);

    setTimeout(() => {
      setFinalValues(finals);
      setRolling(false);
      setDone(true);
      SFX.success();
      haptic('heavy');

      const minVal = Math.min(...finals);
      const losersIndices = finals
        .map((v, i) => (v === minVal ? i : -1))
        .filter((i) => i !== -1);
      const loserIdx =
        losersIndices[Math.floor(Math.random() * losersIndices.length)];

      setTimeout(() => {
        const ranked = players
          .map((p, i) => ({ ...p, score: finals[i] }))
          .sort((a, b) => b.score - a.score);
        const loser = { ...players[loserIdx], score: finals[loserIdx] };
        setResult({ rankings: ranked, loser, gameName: '주사위' });
        router.push('/result');
      }, 3000);
    }, 2500);
  }, [rolling, done, players, setResult, router]);

  if (players.length < 2) return null;

  return (
    <div className="flex flex-col items-center min-h-dvh px-5 py-6 gap-5">
      {/* Header */}
      <div className="flex items-center gap-3 w-full">
        <motion.button
          whileTap={{ y: 2 }}
          onClick={() => router.push('/games')}
          className="w-11 h-11 rounded-[14px] border-none bg-gradient-to-br from-white to-coffee-100 shadow-clay flex items-center justify-center text-xl cursor-pointer"
        >
          ←
        </motion.button>
        <h2 className="text-[22px] font-black text-coffee-800">🎲 주사위</h2>
      </div>

      <p className="text-sm font-bold text-coffee-400">
        {rolling
          ? '주사위 굴리는 중...'
          : done
            ? '결과 확인!'
            : '탭 한 번으로 모두 굴리기!'}
      </p>

      {/* Dice Grid */}
      <div className="flex-1 flex items-center justify-center w-full">
        <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
          {players.map((p, i) => {
            const isLoser =
              done &&
              finalValues.length > 0 &&
              finalValues[i] === Math.min(...finalValues);
            return (
              <PlayerCard
                key={p.id}
                player={p}
                isLoser={done && isLoser}
                dimmed={done && !isLoser}
              >
                <div className="flex flex-col items-center gap-2">
                  <Dice3D value={diceValues[i]} rolling={rolling} size={58} />
                  {done && finalValues[i] !== undefined && (
                    <motion.span
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm font-black text-coffee-700"
                    >
                      {finalValues[i]}점
                    </motion.span>
                  )}
                </div>
              </PlayerCard>
            );
          })}
        </div>
      </div>

      {/* Roll Button */}
      <div className="mt-auto w-full">
        <TapButton onClick={roll} disabled={rolling || done}>
          {rolling ? '🌀 굴리는 중...' : '🎲 주사위 굴리기!'}
        </TapButton>
      </div>
    </div>
  );
}
