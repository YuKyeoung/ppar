'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { getAnimal } from '@/constants/animals';
import CountDown from '@/components/game/CountDown';

export default function BombPass() {
  const router = useRouter();
  const { players, setResult, selectedGame } = useGameStore();
  const [phase, setPhase] = useState<'countdown' | 'playing' | 'boom'>('countdown');
  const [holder, setHolder] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [shaking, setShaking] = useState(false);
  const totalTime = useRef(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleCountdownComplete = useCallback(() => {
    const duration = 5 + Math.random() * 15;
    totalTime.current = duration;
    setTimeLeft(duration);
    setPhase('playing');
  }, []);

  // Guard: redirect if no players (direct access / refresh)
  useEffect(() => {
    if (players.length < 2) router.replace('/');
  }, [players.length, router]);

  useEffect(() => {
    if (phase !== 'playing') return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        const next = t - 0.1;
        if (next <= 3) setShaking(true);
        if (next <= 0) {
          clearInterval(timerRef.current!);
          setPhase('boom');
          setTimeout(() => {
            const others = players.filter((_, i) => i !== holder).map((p, i, arr) => ({ ...p, score: arr.length - i }));
            const loserCopy = { ...players[holder], score: 0 };
            const rankings = [...others, loserCopy];
            setResult({ rankings, loser: loserCopy, gameName: selectedGame?.name || '폭탄 돌리기' });
            router.push('/result');
          }, 2000);
          return 0;
        }
        return next;
      });
    }, 100);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase]);

  if (players.length < 2) return null;

  const pass = () => {
    if (phase !== 'playing') return;
    setHolder((h) => (h + 1) % players.length);
  };

  if (phase === 'countdown') return <CountDown onComplete={handleCountdownComplete} />;

  const urgency = Math.max(0, Math.min(1, 1 - timeLeft / totalTime.current));

  return (
    <div className="flex flex-col items-center min-h-dvh px-5 py-6 gap-4">
      <h2 className="text-[22px] font-black text-coffee-800 w-full">💣 폭탄 돌리기</h2>

      <div className="flex justify-center gap-2 w-full flex-wrap">
        {players.map((p, i) => {
          const a = getAnimal(p.animal);
          return (
            <div key={p.id} className={`flex flex-col items-center gap-1 p-2 rounded-[14px] transition-all ${i === holder ? 'bg-danger/20 scale-110' : ''}`}>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${i === holder ? 'bg-gradient-to-br from-danger to-[#EF9A9A] shadow-lg' : 'bg-gradient-to-br from-white to-coffee-100 shadow-clay'}`}>
                {a?.emoji}
              </div>
              <span className="text-[10px] font-bold text-coffee-600">{p.name}</span>
            </div>
          );
        })}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        {phase === 'boom' ? (
          <motion.div initial={{ scale: 0.5 }} animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 0.3 }} className="text-8xl">
            💥
          </motion.div>
        ) : (
          <motion.div
            animate={shaking ? { rotate: [-5, 5, -5, 5, 0], scale: [1, 1.05, 1] } : {}}
            transition={{ duration: 0.2, repeat: shaking ? Infinity : 0 }}
            className="text-8xl"
          >
            💣
          </motion.div>
        )}
        <p className="text-xl font-black text-coffee-800">
          {phase === 'boom' ? `💥 ${players[holder].name}에게서 터졌다!` : `${players[holder].name}이 들고 있어!`}
        </p>
      </div>

      {phase === 'playing' && (
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={pass}
          className="w-full py-6 rounded-clay border-none font-display font-black text-xl bg-gradient-to-br from-accent to-[#FF9F5F] text-white shadow-clay-accent cursor-pointer"
          style={{ backgroundColor: `rgba(229, 115, 115, ${urgency})` }}
        >
          👉 넘겨! 빨리!
        </motion.button>
      )}
    </div>
  );
}
