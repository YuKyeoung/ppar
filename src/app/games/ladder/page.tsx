'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { getAnimal } from '@/constants/animals';
import { SFX } from '@/utils/sound';
import { haptic } from '@/utils/haptic';

// Types for ladder data
interface Rung {
  row: number;
  col: number; // connects col and col+1
}

interface LadderPath {
  /** Sequence of (col, row) points the tracer visits */
  points: { col: number; row: number }[];
  endCol: number;
}

const ROWS = 10;
const COL_WIDTH = 72;
const ROW_HEIGHT = 36;
const LADDER_TOP = 64;
// TRACE_DURATION is computed dynamically inside the component based on player count

function generateRungs(numCols: number): Rung[] {
  const rungs: Rung[] = [];
  // For each row, randomly add rungs between adjacent columns
  // Ensure no two rungs share the same column on the same row
  for (let row = 1; row < ROWS; row++) {
    const usedCols = new Set<number>();
    for (let col = 0; col < numCols - 1; col++) {
      if (usedCols.has(col)) continue;
      if (Math.random() < 0.4) {
        rungs.push({ row, col });
        usedCols.add(col);
        usedCols.add(col + 1);
      }
    }
  }
  return rungs;
}

function tracePath(startCol: number, rungs: Rung[]): LadderPath {
  const rungMap = new Map<string, Rung>();
  for (const r of rungs) {
    rungMap.set(`${r.row}-${r.col}`, r);
    rungMap.set(`${r.row}-${r.col + 1}`, r);
  }

  const points: { col: number; row: number }[] = [{ col: startCol, row: 0 }];
  let col = startCol;

  for (let row = 1; row <= ROWS; row++) {
    // Check for rung at this row where current col is involved
    const key = `${row}-${col}`;
    const rung = rungMap.get(key);
    if (rung) {
      // Move horizontally
      const newCol = rung.col === col ? rung.col + 1 : rung.col;
      points.push({ col, row });
      points.push({ col: newCol, row });
      col = newCol;
    } else {
      points.push({ col, row });
    }
  }

  return { points, endCol: col };
}

export default function LadderGame() {
  const router = useRouter();
  const { players, setResult } = useGameStore();
  const [phase, setPhase] = useState<'ready' | 'tracing' | 'done'>('ready');
  const [tracingIdx, setTracingIdx] = useState(-1);
  const [revealedPaths, setRevealedPaths] = useState<Set<number>>(new Set());

  // Guard
  useEffect(() => {
    if (players.length < 2) router.replace('/');
  }, [players.length, router]);

  // Dynamic trace duration: total ~10s across all players
  const numCols = players.length;
  const traceDuration = 10 / numCols; // seconds per player

  const rungs = useMemo(() => {
    if (numCols < 2) return [];
    return generateRungs(numCols);
  }, [numCols]);

  // Randomly pick which bottom column is the "coffee" position
  const coffeeCol = useMemo(() => {
    if (numCols < 2) return 0;
    return Math.floor(Math.random() * numCols);
  }, [numCols]);

  // Compute all paths
  const paths = useMemo(() => {
    if (numCols < 2) return [];
    return players.map((_, i) => tracePath(i, rungs));
  }, [players, rungs, numCols]);

  // Find who ends at the coffee column
  const loserIdx = useMemo(() => {
    return paths.findIndex((p) => p.endCol === coffeeCol);
  }, [paths, coffeeCol]);

  const ladderWidth = numCols * COL_WIDTH;
  const ladderHeight = ROWS * ROW_HEIGHT;

  // Convert grid coords to pixel coords
  const toX = useCallback((col: number) => col * COL_WIDTH + COL_WIDTH / 2, []);
  const toY = useCallback((row: number) => row * ROW_HEIGHT, []);

  // Start tracing
  const handleStart = useCallback(async () => {
    if (phase !== 'ready') return;
    SFX.tap();
    haptic('medium');
    setPhase('tracing');

    // Trace each player one at a time with stagger
    for (let i = 0; i < players.length; i++) {
      setTracingIdx(i);
      SFX.tick();
      await new Promise((resolve) => setTimeout(resolve, traceDuration * 1000 + 200));
      setRevealedPaths((prev) => { const next = new Set(Array.from(prev)); next.add(i); return next; });
    }

    setPhase('done');
    SFX.fail();
    haptic('heavy');

    // Delay then navigate (2s viewing time)
    setTimeout(() => {
      const loser = players[loserIdx];
      const rankings = players
        .map((p, i) => ({
          ...p,
          score: i === loserIdx ? 0 : players.length - (paths[i].endCol === coffeeCol ? players.length : Math.abs(paths[i].endCol - coffeeCol)),
        }))
        .sort((a, b) => b.score - a.score);

      setResult({
        rankings,
        loser: { ...loser, score: 0 },
        gameName: '사다리 타기',
      });
      router.push('/result');
    }, 2000);
  }, [phase, players, loserIdx, paths, coffeeCol, traceDuration, setResult, router]);

  if (players.length < 2) return null;

  // Build SVG path string for a player's traced route
  const buildPathD = (path: LadderPath) => {
    const segs = path.points.map((pt, i) => {
      const px = toX(pt.col);
      const py = toY(pt.row);
      return i === 0 ? `M ${px} ${py}` : `L ${px} ${py}`;
    });
    return segs.join(' ');
  };

  return (
    <div className="flex flex-col items-center min-h-dvh px-5 py-6 gap-4">
      {/* Header */}
      <div className="flex items-center gap-3 w-full">
        <motion.button
          whileTap={{ y: 2 }}
          onClick={() => router.push('/games')}
          className="w-11 h-11 rounded-[14px] border-none bg-gradient-to-br from-white to-coffee-100 shadow-clay flex items-center justify-center text-xl cursor-pointer"
        >
          &larr;
        </motion.button>
        <h2 className="text-[22px] font-black text-coffee-800">
          🪜 사다리 타기
        </h2>
      </div>

      <p className="text-sm font-bold text-coffee-400">
        {phase === 'ready' && '버튼을 눌러 사다리를 타세요!'}
        {phase === 'tracing' && '사다리를 타는 중...'}
        {phase === 'done' && `${players[loserIdx]?.name} 당첨!`}
      </p>

      {/* Ladder container */}
      <div
        className="relative bg-gradient-to-br from-white to-coffee-100 rounded-clay-lg shadow-clay overflow-hidden"
        style={{ width: ladderWidth + 16, padding: '0 8px' }}
      >
        {/* Player labels at top */}
        <div className="flex" style={{ height: LADDER_TOP }}>
          {players.map((p) => {
            const animal = getAnimal(p.animal);
            return (
              <div
                key={p.id}
                className="flex flex-col items-center justify-end pb-1"
                style={{ width: COL_WIDTH }}
              >
                <span className="text-2xl">{animal?.emoji}</span>
                <span className="text-[11px] font-bold text-coffee-600 truncate max-w-[60px]">
                  {p.name}
                </span>
              </div>
            );
          })}
        </div>

        {/* SVG Ladder */}
        <svg
          width={ladderWidth}
          height={ladderHeight + ROW_HEIGHT}
          className="block"
        >
          {/* Vertical lines */}
          {players.map((_, i) => (
            <line
              key={`v-${i}`}
              x1={toX(i)}
              y1={0}
              x2={toX(i)}
              y2={ladderHeight}
              stroke="#D7CCC8"
              strokeWidth={3}
              strokeLinecap="round"
            />
          ))}

          {/* Horizontal rungs */}
          {rungs.map((rung, i) => (
            <line
              key={`h-${i}`}
              x1={toX(rung.col)}
              y1={toY(rung.row)}
              x2={toX(rung.col + 1)}
              y2={toY(rung.row)}
              stroke="#BCAAA4"
              strokeWidth={3}
              strokeLinecap="round"
            />
          ))}

          {/* Traced paths */}
          {players.map((p, i) => {
            const animal = getAnimal(p.animal);
            const isTracing = phase === 'tracing' && tracingIdx === i;
            const isRevealed = revealedPaths.has(i);
            if (!isTracing && !isRevealed) return null;

            const pathD = buildPathD(paths[i]);
            const pathLength = paths[i].points.length * (COL_WIDTH + ROW_HEIGHT); // rough estimate

            return (
              <g key={`trace-${p.id}`}>
                <motion.path
                  d={pathD}
                  fill="none"
                  stroke={animal?.color || '#FF8A3D'}
                  strokeWidth={4}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{
                    duration: isTracing ? traceDuration : 0,
                    ease: 'linear',
                  }}
                  style={{
                    strokeDasharray: pathLength,
                    strokeDashoffset: 0,
                    opacity: isRevealed && !isTracing ? 0.6 : 1,
                  }}
                />
              </g>
            );
          })}
        </svg>

        {/* Bottom labels */}
        <div className="flex" style={{ height: 48 }}>
          {players.map((_, i) => {
            const isCoffee = i === coffeeCol;
            const showResult = phase === 'done' || (phase === 'tracing' && revealedPaths.size > 0);
            return (
              <div
                key={`bottom-${i}`}
                className="flex flex-col items-center justify-start pt-1"
                style={{ width: COL_WIDTH }}
              >
                {showResult || phase === 'ready' ? (
                  <motion.span
                    className={`text-sm font-black ${isCoffee ? 'text-[#C62828]' : 'text-success'}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {isCoffee ? '커피☕' : 'safe✓'}
                  </motion.span>
                ) : (
                  <span className="text-sm text-coffee-300">?</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Start button */}
      <div className="mt-auto w-full">
        <button
          onClick={handleStart}
          disabled={phase !== 'ready'}
          className="w-full py-4 rounded-clay border-none font-display font-black text-lg bg-gradient-to-br from-accent to-[#FF9F5F] text-white shadow-clay-accent cursor-pointer disabled:opacity-50"
        >
          {phase === 'ready' && '🪜 사다리 타기!'}
          {phase === 'tracing' && '🪜 내려가는 중...'}
          {phase === 'done' && '☕ 결과 확인 중...'}
        </button>
      </div>
    </div>
  );
}
