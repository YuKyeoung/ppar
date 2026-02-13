'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { getAnimal } from '@/constants/animals';
import CountDown from '@/components/game/CountDown';
import { SFX } from '@/utils/sound';
import { haptic } from '@/utils/haptic';

export default function NunchiGame() {
  const router = useRouter();
  const { players, setResult, selectedGame } = useGameStore();
  const [phase, setPhase] = useState<'countdown' | 'playing'>('countdown');
  const [currentNumber, setCurrentNumber] = useState(1);
  const [alive, setAlive] = useState<boolean[]>(players.map(() => true));
  const [lastAction, setLastAction] = useState('');
  const botTimers = useRef<NodeJS.Timeout[]>([]);

  const handleCountdownComplete = useCallback(() => setPhase('playing'), []);

  // Guard: redirect if no players (direct access / refresh)
  useEffect(() => {
    if (players.length < 2) router.replace('/');
  }, [players.length, router]);

  const aliveCount = alive.filter(Boolean).length;

  useEffect(() => {
    if (phase !== 'playing') return;
    if (aliveCount <= 1) {
      const loserIdx = alive.findIndex(Boolean);
      const others = players.filter((_, i) => i !== loserIdx).map((p, i, arr) => ({ ...p, score: arr.length - i }));
      const loserCopy = { ...players[loserIdx], score: 0 };
      const rankings = [...others, loserCopy];
      setTimeout(() => {
        setResult({ rankings, loser: loserCopy, gameName: selectedGame?.name || '눈치 게임' });
        router.push('/result');
      }, 1500);
      return;
    }

    // Bot players auto-press after random delay (player 0 is human)
    botTimers.current.forEach(clearTimeout);
    botTimers.current = [];
    players.forEach((_, i) => {
      if (i === 0 || !alive[i]) return;
      const delay = 1000 + Math.random() * 3000;
      botTimers.current.push(setTimeout(() => pressNumber(i), delay));
    });

    return () => botTimers.current.forEach(clearTimeout);
  }, [currentNumber, phase, alive]);

  const pressNumber = (playerIdx: number) => {
    if (!alive[playerIdx]) return;
    setCurrentNumber((prev) => {
      const num = prev;
      setLastAction(`${players[playerIdx].name}이 ${num}을 눌렀다!`);
      return prev + 1;
    });
  };

  const humanPress = () => {
    if (!alive[0]) return;
    SFX.tap();
    haptic('light');
    pressNumber(0);
  };

  // Simplified: random elimination when numbers collide
  useEffect(() => {
    if (currentNumber > players.length * 2 && aliveCount > 1) {
      // Random elimination for fun
      const aliveIndices = alive.map((a, i) => a ? i : -1).filter((i) => i >= 0);
      const eliminateIdx = aliveIndices[Math.floor(Math.random() * aliveIndices.length)];
      const newAlive = [...alive];
      newAlive[eliminateIdx] = false;
      setAlive(newAlive);
      setLastAction(`${players[eliminateIdx].name}이 탈락! 🚫`);
      setCurrentNumber(1);
    }
  }, [currentNumber]);

  if (players.length < 2) return null;

  if (phase === 'countdown') return <CountDown onComplete={handleCountdownComplete} />;

  return (
    <div className="flex flex-col items-center min-h-dvh px-5 py-6 gap-4">
      <h2 className="text-[22px] font-black text-coffee-800 w-full">🎪 눈치 게임</h2>

      <div className="flex justify-center gap-2 w-full flex-wrap">
        {players.map((p, i) => {
          const a = getAnimal(p.animal);
          return (
            <div key={p.id} className={`flex flex-col items-center gap-1 p-2 rounded-[14px] ${!alive[i] ? 'opacity-30' : ''}`}>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${alive[i] ? 'bg-gradient-to-br from-white to-coffee-100 shadow-clay' : 'bg-gray-200'}`}>
                {a?.emoji}
              </div>
              <span className="text-[10px] font-bold text-coffee-600">{p.name}</span>
              {!alive[i] && <span className="text-[10px] text-danger font-bold">OUT</span>}
            </div>
          );
        })}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <motion.div
          key={currentNumber}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-7xl font-black text-coffee-500"
        >
          {currentNumber}
        </motion.div>
        <p className="text-sm font-bold text-coffee-400 text-center h-5">{lastAction}</p>
      </div>

      {alive[0] && (
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={humanPress}
          className="w-full py-6 rounded-clay border-none font-display font-black text-xl bg-gradient-to-br from-success to-[#66BB6A] text-white shadow-[6px_6px_12px_rgba(76,175,80,0.3)] cursor-pointer"
        >
          👆 {currentNumber} 누르기!
        </motion.button>
      )}

      {!alive[0] && (
        <div className="w-full py-6 rounded-clay text-center font-black text-xl text-danger">
          😵 탈락했어요!
        </div>
      )}
    </div>
  );
}
