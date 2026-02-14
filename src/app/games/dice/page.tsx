'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { SFX } from '@/utils/sound';
import { haptic } from '@/utils/haptic';
import TapButton from '@/components/game/TapButton';
import PlayerCard from '@/components/game/PlayerCard';

// Dot positions for each dice face (3x3 grid)
const DOTS: Record<number, number[][]> = {
  1: [[1, 1]],
  2: [[0, 2], [2, 0]],
  3: [[0, 2], [1, 1], [2, 0]],
  4: [[0, 0], [0, 2], [2, 0], [2, 2]],
  5: [[0, 0], [0, 2], [1, 1], [2, 0], [2, 2]],
  6: [[0, 0], [0, 2], [1, 0], [1, 2], [2, 0], [2, 2]],
};

function DiceFace({ value, size, bg }: { value: number; size: number; bg?: string }) {
  const dots = DOTS[value] || DOTS[1];
  const dotSize = size * 0.16;
  const padding = size * 0.2;
  const gap = (size - padding * 2 - dotSize) / 2;

  return (
    <div
      className="rounded-xl relative"
      style={{
        width: size,
        height: size,
        background: bg || 'linear-gradient(145deg, #FFFEF9, #F0EBE0)',
        border: '2px solid rgba(139,94,60,0.1)',
        boxShadow: bg ? 'none' :
          '4px 4px 8px rgba(139,94,60,0.15), -2px -2px 6px rgba(255,255,255,0.8), inset 1px 1px 2px rgba(255,255,255,0.6)',
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
            boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.3)',
          }}
        />
      ))}
    </div>
  );
}

// 3D rolling cube - shows all 6 faces rotating
function Dice3D({ size, animId }: { size: number; animId: number }) {
  const half = size / 2;

  return (
    <div style={{ perspective: 300, width: size, height: size }}>
      <div
        key={animId}
        className="dice-spin"
        style={{
          width: size,
          height: size,
          position: 'relative',
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Front face - 1 */}
        <div className="absolute inset-0" style={{ transform: `translateZ(${half}px)` }}>
          <DiceFace value={1} size={size} bg="linear-gradient(145deg, #FFFEF9, #F0EBE0)" />
        </div>
        {/* Back face - 6 */}
        <div className="absolute inset-0" style={{ transform: `rotateY(180deg) translateZ(${half}px)` }}>
          <DiceFace value={6} size={size} bg="linear-gradient(145deg, #FFFEF9, #F0EBE0)" />
        </div>
        {/* Right face - 3 */}
        <div className="absolute inset-0" style={{ transform: `rotateY(90deg) translateZ(${half}px)` }}>
          <DiceFace value={3} size={size} bg="linear-gradient(145deg, #FFFEF9, #F0EBE0)" />
        </div>
        {/* Left face - 4 */}
        <div className="absolute inset-0" style={{ transform: `rotateY(-90deg) translateZ(${half}px)` }}>
          <DiceFace value={4} size={size} bg="linear-gradient(145deg, #FFFEF9, #F0EBE0)" />
        </div>
        {/* Top face - 2 */}
        <div className="absolute inset-0" style={{ transform: `rotateX(90deg) translateZ(${half}px)` }}>
          <DiceFace value={2} size={size} bg="linear-gradient(145deg, #FFFEF9, #F0EBE0)" />
        </div>
        {/* Bottom face - 5 */}
        <div className="absolute inset-0" style={{ transform: `rotateX(-90deg) translateZ(${half}px)` }}>
          <DiceFace value={5} size={size} bg="linear-gradient(145deg, #FFFEF9, #F0EBE0)" />
        </div>
      </div>

      <style jsx>{`
        @keyframes diceSpin {
          0% { transform: rotateX(0deg) rotateY(0deg) rotateZ(0deg); }
          25% { transform: rotateX(90deg) rotateY(180deg) rotateZ(45deg); }
          50% { transform: rotateX(180deg) rotateY(360deg) rotateZ(0deg); }
          75% { transform: rotateX(270deg) rotateY(540deg) rotateZ(-45deg); }
          100% { transform: rotateX(360deg) rotateY(720deg) rotateZ(0deg); }
        }
        .dice-spin {
          animation: diceSpin 0.8s infinite linear;
        }
      `}</style>
    </div>
  );
}

export default function DicePage() {
  const router = useRouter();
  const { players, setResult } = useGameStore();
  const [rolling, setRolling] = useState(false);
  const [done, setDone] = useState(false);
  const [finalValues, setFinalValues] = useState<number[]>([]);
  const [animId, setAnimId] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (players.length < 2) router.replace('/');
  }, [players.length, router]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const roll = useCallback(() => {
    if (rolling || done) return;
    setRolling(true);
    setAnimId((prev) => prev + 1);
    SFX.roll();
    haptic('medium');

    const finals = players.map(() => Math.floor(Math.random() * 6) + 1);

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
    }, 2000);
  }, [rolling, done, players, setResult, router]);

  if (players.length < 2) return null;

  return (
    <div className="flex flex-col items-center min-h-dvh px-5 py-6 gap-5">
      {/* Header */}
      <div className="flex items-center gap-3 w-full">
        <motion.button
          whileTap={{ y: 2 }}
          onClick={() => router.back()}
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
                  {rolling ? (
                    /* 3D spinning cube during roll */
                    <motion.div
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 0.3, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      <Dice3D size={64} animId={animId} />
                    </motion.div>
                  ) : (
                    /* Flat 2D face for idle + result */
                    <motion.div
                      animate={
                        done ? { scale: [1, 1.1, 1] } : {}
                      }
                      transition={{ duration: 0.3 }}
                    >
                      <DiceFace value={done ? finalValues[i] : 1} size={64} />
                    </motion.div>
                  )}

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
