'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { getAnimal } from '@/constants/animals';
import CountDown from '@/components/game/CountDown';
import { SFX } from '@/utils/sound';
import { haptic } from '@/utils/haptic';

function generateProblem() {
  const ops = ['+', '-', '×'];
  const op = ops[Math.floor(Math.random() * ops.length)];
  let a: number, b: number, answer: number;
  if (op === '+') { a = Math.floor(Math.random() * 50) + 1; b = Math.floor(Math.random() * 50) + 1; answer = a + b; }
  else if (op === '-') { a = Math.floor(Math.random() * 50) + 20; b = Math.floor(Math.random() * a); answer = a - b; }
  else { a = Math.floor(Math.random() * 12) + 2; b = Math.floor(Math.random() * 12) + 2; answer = a * b; }
  return { text: `${a} ${op} ${b} = ?`, answer };
}

export default function MathBattle() {
  const router = useRouter();
  const { players, updateScore, setResult, selectedGame } = useGameStore();
  const [phase, setPhase] = useState<'countdown' | 'playing'>('countdown');
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [problem, setProblem] = useState(generateProblem);
  const [input, setInput] = useState('');
  const [qNum, setQNum] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [scores, setScores] = useState<number[]>(players.map(() => 0));
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const startTime = useRef(Date.now());
  const TOTAL_Q = 5;

  const handleCountdownComplete = useCallback(() => { setPhase('playing'); startTime.current = Date.now(); }, []);

  // Guard: redirect if no players (direct access / refresh)
  useEffect(() => {
    if (players.length < 2) router.replace('/');
  }, [players.length, router]);

  if (players.length < 2) return null;

  const submit = () => {
    const isCorrect = parseInt(input) === problem.answer;
    if (isCorrect) { SFX.success(); haptic('light'); } else { SFX.fail(); haptic('medium'); }
    setFeedback(isCorrect ? 'correct' : 'wrong');
    const newCorrect = isCorrect ? correct + 1 : correct;
    setCorrect(newCorrect);

    setTimeout(() => {
      setFeedback(null);
      setInput('');
      const nextQ = qNum + 1;
      if (nextQ >= TOTAL_Q) {
        const elapsed = Date.now() - startTime.current;
        const score = newCorrect * 1000 - Math.floor(elapsed / 100);
        const newScores = [...scores];
        newScores[currentPlayer] = Math.max(0, score);
        setScores(newScores);
        updateScore(players[currentPlayer].id, Math.max(0, score));

        if (currentPlayer >= players.length - 1) {
          setTimeout(() => {
            const ranked = players.map((p, i) => ({ ...p, score: newScores[i] })).sort((a, b) => b.score - a.score);
            setResult({ rankings: ranked, loser: ranked[ranked.length - 1], gameName: selectedGame?.name || '암산 배틀' });
            router.push('/result');
          }, 800);
        } else {
          setTimeout(() => {
            setCurrentPlayer((c) => c + 1);
            setQNum(0);
            setCorrect(0);
            setProblem(generateProblem());
            startTime.current = Date.now();
          }, 800);
        }
      } else {
        setQNum(nextQ);
        setProblem(generateProblem());
      }
    }, 600);
  };

  if (phase === 'countdown') return <CountDown onComplete={handleCountdownComplete} />;

  const animal = getAnimal(players[currentPlayer]?.animal);

  return (
    <div className="flex flex-col items-center min-h-dvh px-5 py-6 gap-4">
      <h2 className="text-[22px] font-black text-coffee-800 w-full">🧮 암산 배틀</h2>
      <div className="text-center py-3 px-6 rounded-[16px] bg-gradient-to-br from-coffee-500 to-coffee-500/90 text-white font-black shadow-clay-primary w-full">
        {animal?.emoji} {players[currentPlayer]?.name} — {qNum + 1}/{TOTAL_Q}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-4 w-full">
        <motion.div
          key={problem.text}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`text-4xl font-black ${feedback === 'correct' ? 'text-success' : feedback === 'wrong' ? 'text-danger' : 'text-coffee-800'}`}
        >
          {feedback === 'correct' ? '⭕ 정답!' : feedback === 'wrong' ? `❌ ${problem.answer}` : problem.text}
        </motion.div>

        {!feedback && (
          <>
            <input
              type="number"
              inputMode="numeric"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && input && submit()}
              autoFocus
              className="w-40 text-center text-3xl font-black py-3 rounded-clay border-none bg-gradient-to-br from-coffee-100 to-cream shadow-clay-inset outline-none text-coffee-800 font-display"
              placeholder="?"
            />
            <button
              onClick={submit}
              disabled={!input}
              className="py-3 px-10 rounded-clay border-none font-display font-black text-lg bg-gradient-to-br from-accent to-[#FF9F5F] text-white shadow-clay-accent cursor-pointer disabled:opacity-50"
            >
              확인
            </button>
          </>
        )}
      </div>

      <div className="w-full flex flex-col gap-1.5">
        {players.map((p, i) => {
          const a = getAnimal(p.animal);
          return (
            <div key={p.id} className="flex items-center gap-2 py-2 px-3 rounded-[12px] bg-white/60 text-sm">
              <span>{a?.emoji}</span><span className="font-bold text-coffee-800">{p.name}</span>
              <span className="ml-auto font-black text-coffee-500">{scores[i] || '-'}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
