'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { getAnimal } from '@/constants/animals';
import CountDown from '@/components/game/CountDown';
import { SFX } from '@/utils/sound';
import { haptic } from '@/utils/haptic';

export default function QuickTap() {
  const router = useRouter();
  const { players, updateScore, setResult, selectedGame } = useGameStore();
  const [phase, setPhase] = useState<'countdown' | 'playing'>('countdown');
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [state, setState] = useState<'wait' | 'ready' | 'go' | 'done' | 'early'>('wait');
  const [reactionTime, setReactionTime] = useState(0);
  const [scores, setScores] = useState<number[]>(players.map(() => 0));
  const startTimeRef = useRef(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleCountdownComplete = useCallback(() => { setPhase('playing'); startRound(); }, []);

  // Guard: redirect if no players (direct access / refresh)
  useEffect(() => {
    if (players.length < 2) router.replace('/');
  }, [players.length, router]);

  if (players.length < 2) return null;

  const startRound = () => {
    setState('ready');
    const delay = 1500 + Math.random() * 3000;
    timerRef.current = setTimeout(() => {
      setState('go');
      startTimeRef.current = Date.now();
    }, delay);
  };

  const handleTap = () => {
    if (state === 'ready') {
      if (timerRef.current) clearTimeout(timerRef.current);
      setState('early');
      SFX.fail();
      haptic('heavy');
      setTimeout(() => startRound(), 1500);
      return;
    }
    if (state !== 'go') return;

    const ms = Date.now() - startTimeRef.current;
    setReactionTime(ms);
    setState('done');
    SFX.success();
    haptic('medium');

    const score = Math.max(0, 1000 - ms);
    const newScores = [...scores];
    newScores[currentPlayer] = score;
    setScores(newScores);
    updateScore(players[currentPlayer].id, score);

    setTimeout(() => {
      if (currentPlayer >= players.length - 1) {
        const ranked = players.map((p, i) => ({ ...p, score: newScores[i] })).sort((a, b) => b.score - a.score);
        setResult({ rankings: ranked, loser: ranked[ranked.length - 1], gameName: selectedGame?.name || '반응속도 테스트' });
        router.push('/result');
      } else {
        setCurrentPlayer((c) => c + 1);
        startRound();
      }
    }, 1500);
  };

  if (phase === 'countdown') return <CountDown onComplete={handleCountdownComplete} />;

  const animal = getAnimal(players[currentPlayer]?.animal);

  const bgColor = {
    wait: 'bg-coffee-100',
    ready: 'bg-danger',
    go: 'bg-success',
    done: 'bg-coffee-100',
    early: 'bg-[#FFB74D]',
  }[state];

  return (
    <div className="flex flex-col items-center min-h-dvh px-5 py-6 gap-4">
      <h2 className="text-[22px] font-black text-coffee-800 w-full">⚡ 반응속도 테스트</h2>
      <div className="text-center py-3 px-6 rounded-[16px] bg-gradient-to-br from-coffee-500 to-coffee-500/90 text-white font-black shadow-clay-primary w-full">
        {animal?.emoji} {players[currentPlayer]?.name} 차례
      </div>

      <motion.div
        onClick={handleTap}
        className={`flex-1 w-full rounded-clay-lg flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors ${bgColor}`}
      >
        {state === 'ready' && <><span className="text-6xl">🔴</span><p className="text-xl font-black text-white">기다려...</p></>}
        {state === 'go' && <><span className="text-6xl">🟢</span><p className="text-xl font-black text-white">지금! 탭!</p></>}
        {state === 'done' && <><span className="text-4xl font-black text-coffee-500">{reactionTime}ms</span><p className="text-base font-bold text-coffee-400">반응속도</p></>}
        {state === 'early' && <><span className="text-4xl">😅</span><p className="text-lg font-black text-white">너무 빨랐어! 다시...</p></>}
        {state === 'wait' && <p className="text-lg font-bold text-coffee-400">준비 중...</p>}
      </motion.div>

      <div className="w-full flex flex-col gap-1.5">
        {players.map((p, i) => {
          const a = getAnimal(p.animal);
          return (
            <div key={p.id} className="flex items-center gap-2 py-2 px-3 rounded-[12px] bg-white/60 text-sm">
              <span>{a?.emoji}</span><span className="font-bold text-coffee-800">{p.name}</span>
              <span className="ml-auto font-black text-coffee-500">{scores[i] ? `${1000 - scores[i]}ms` : '-'}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
