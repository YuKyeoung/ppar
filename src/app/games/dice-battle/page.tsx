'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { getAnimal } from '@/constants/animals';
import CountDown from '@/components/game/CountDown';
import PlayerScoreboard from '@/components/game/PlayerScoreboard';
import { SFX } from '@/utils/sound';
import { haptic } from '@/utils/haptic';

const DICE_FACES = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

export default function DiceBattle() {
  const router = useRouter();
  const { players, updateScore, setResult, selectedGame } = useGameStore();
  const [phase, setPhase] = useState<'countdown' | 'playing' | 'done'>('countdown');
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [rolling, setRolling] = useState(false);
  const [diceValue, setDiceValue] = useState<number | null>(null);
  const [scores, setScores] = useState<number[]>(players.map(() => 0));
  const rollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleCountdownComplete = useCallback(() => setPhase('playing'), []);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => { if (rollIntervalRef.current) clearInterval(rollIntervalRef.current); };
  }, []);

  // Guard: redirect if no players (direct access / refresh)
  useEffect(() => {
    if (players.length < 2) router.replace('/');
  }, [players.length, router]);

  if (players.length < 2) return null;

  const roll = () => {
    if (rolling || currentPlayer >= players.length) return;
    setRolling(true);
    setDiceValue(null);
    SFX.roll();
    haptic('medium');

    let count = 0;
    rollIntervalRef.current = setInterval(() => {
      setDiceValue(Math.floor(Math.random() * 6));
      count++;
      if (count > 15) {
        clearInterval(rollIntervalRef.current!);
        const result = Math.floor(Math.random() * 6) + 1;
        setDiceValue(result - 1);
        const newScores = [...scores];
        newScores[currentPlayer] = result;
        setScores(newScores);
        updateScore(players[currentPlayer].id, result);
        setRolling(false);

        if (currentPlayer >= players.length - 1) {
          setTimeout(() => {
            const ranked = players
              .map((p, i) => ({ ...p, score: newScores[i] }))
              .sort((a, b) => b.score - a.score);
            setResult({
              rankings: ranked,
              loser: ranked[ranked.length - 1],
              gameName: selectedGame?.name || '주사위 대결',
            });
            router.push('/result');
          }, 1200);
        } else {
          setTimeout(() => setCurrentPlayer(currentPlayer + 1), 800);
        }
      }
    }, 60);
  };

  if (phase === 'countdown') {
    return <CountDown onComplete={handleCountdownComplete} />;
  }

  return (
    <div className="flex flex-col items-center min-h-dvh px-5 py-6 gap-5">
      <div className="flex items-center gap-3 w-full">
        <motion.button
          whileTap={{ y: 2 }}
          onClick={() => router.push('/games')}
          className="w-11 h-11 rounded-[14px] border-none bg-gradient-to-br from-white to-coffee-100 shadow-clay flex items-center justify-center text-xl cursor-pointer"
        >
          ←
        </motion.button>
        <h2 className="text-[22px] font-black text-coffee-800">🎲 주사위 대결</h2>
      </div>

      <div className="flex justify-center gap-3 w-full">
        {players.map((p, i) => {
          const animal = getAnimal(p.animal);
          return (
            <div key={p.id} className="flex flex-col items-center gap-1">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all ${
                i === currentPlayer
                  ? 'bg-gradient-to-br from-[#FFB74D] to-[#FFA726] shadow-[4px_4px_8px_rgba(255,152,0,0.3)]'
                  : 'bg-gradient-to-br from-white to-coffee-100 shadow-clay'
              }`}>
                {animal?.emoji}
              </div>
              <span className="text-[11px] font-bold text-coffee-600">{p.name}</span>
            </div>
          );
        })}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <motion.div
          onClick={roll}
          animate={rolling ? { rotate: [0, 10, -10, 0], scale: [1, 1.05, 1] } : {}}
          transition={rolling ? { duration: 0.15, repeat: Infinity } : {}}
          className="w-[120px] h-[120px] rounded-[28px] flex items-center justify-center text-[64px] cursor-pointer bg-gradient-to-br from-white to-coffee-100 shadow-clay select-none"
        >
          {diceValue !== null ? DICE_FACES[diceValue] : '🎲'}
        </motion.div>
        <p className="text-base font-bold text-coffee-400">
          {currentPlayer < players.length
            ? `${players[currentPlayer].name} - 탭해서 굴려!`
            : '결과 확인!'}
        </p>
      </div>

      <PlayerScoreboard players={players} scores={scores} currentPlayerIdx={currentPlayer} />
    </div>
  );
}
