'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { getAnimal } from '@/constants/animals';
import { SFX } from '@/utils/sound';
import { haptic } from '@/utils/haptic';
import TapButton from '@/components/game/TapButton';

interface Rung {
  row: number;
  col: number;
}

interface LadderPath {
  points: { col: number; row: number }[];
  endCol: number;
}

const ROWS = 10;
const COL_WIDTH = 72;
const ROW_HEIGHT = 36;
const LADDER_TOP = 64;

function generateRungs(numCols: number): Rung[] {
  const rungs: Rung[] = [];
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
    const key = `${row}-${col}`;
    const rung = rungMap.get(key);
    if (rung) {
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
  // Animated tracer ball position
  const [tracerPos, setTracerPos] = useState<{ x: number; y: number } | null>(
    null
  );
  const animRef = useRef<number>(0);

  useEffect(() => {
    if (players.length < 2) router.replace('/');
  }, [players.length, router]);

  useEffect(() => {
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  const numCols = players.length;
  const traceDuration = 3; // seconds per player (faster than before)

  const rungs = useMemo(() => {
    if (numCols < 2) return [];
    return generateRungs(numCols);
  }, [numCols]);

  const coffeeCol = useMemo(() => {
    if (numCols < 2) return 0;
    return Math.floor(Math.random() * numCols);
  }, [numCols]);

  const paths = useMemo(() => {
    if (numCols < 2) return [];
    return players.map((_, i) => tracePath(i, rungs));
  }, [players, rungs, numCols]);

  const loserIdx = useMemo(() => {
    return paths.findIndex((p) => p.endCol === coffeeCol);
  }, [paths, coffeeCol]);

  const ladderWidth = numCols * COL_WIDTH;
  const ladderHeight = ROWS * ROW_HEIGHT;

  const toX = useCallback(
    (col: number) => col * COL_WIDTH + COL_WIDTH / 2,
    []
  );
  const toY = useCallback((row: number) => row * ROW_HEIGHT, []);

  // Animate a tracer ball along a path
  const animateTracer = useCallback(
    (pathPoints: { col: number; row: number }[], duration: number) => {
      return new Promise<void>((resolve) => {
        // Build pixel segments
        const segments: { x: number; y: number }[] = pathPoints.map((pt) => ({
          x: toX(pt.col),
          y: toY(pt.row),
        }));

        // Calculate total path length
        let totalLength = 0;
        const segLengths: number[] = [0];
        for (let i = 1; i < segments.length; i++) {
          const dx = segments[i].x - segments[i - 1].x;
          const dy = segments[i].y - segments[i - 1].y;
          totalLength += Math.sqrt(dx * dx + dy * dy);
          segLengths.push(totalLength);
        }

        const startTime = performance.now();
        const durationMs = duration * 1000;

        const tick = (now: number) => {
          const elapsed = now - startTime;
          const progress = Math.min(elapsed / durationMs, 1);

          // Find position along path at this progress
          const targetDist = progress * totalLength;
          let segIdx = 0;
          for (let i = 1; i < segLengths.length; i++) {
            if (segLengths[i] >= targetDist) {
              segIdx = i - 1;
              break;
            }
            segIdx = i - 1;
          }

          const segStart = segLengths[segIdx];
          const segEnd = segLengths[segIdx + 1] || totalLength;
          const segProgress =
            segEnd - segStart > 0
              ? (targetDist - segStart) / (segEnd - segStart)
              : 0;

          const p1 = segments[segIdx];
          const p2 = segments[segIdx + 1] || segments[segIdx];
          const x = p1.x + (p2.x - p1.x) * segProgress;
          const y = p1.y + (p2.y - p1.y) * segProgress;

          setTracerPos({ x, y });

          if (progress < 1) {
            animRef.current = requestAnimationFrame(tick);
          } else {
            setTracerPos(null);
            resolve();
          }
        };

        animRef.current = requestAnimationFrame(tick);
      });
    },
    [toX, toY]
  );

  const handleStart = useCallback(async () => {
    if (phase !== 'ready') return;
    SFX.tap();
    haptic('medium');
    setPhase('tracing');

    // Trace one at a time for dramatic effect
    for (let i = 0; i < players.length; i++) {
      setTracingIdx(i);
      SFX.tick();
      haptic('light');
      await animateTracer(paths[i].points, traceDuration);
      setRevealedPaths((prev) => {
        const next = new Set(Array.from(prev));
        next.add(i);
        return next;
      });
    }

    setPhase('done');
    SFX.fail();
    haptic('heavy');

    setTimeout(() => {
      const loser = players[loserIdx];
      const rankings = players
        .map((p, i) => ({
          ...p,
          score:
            i === loserIdx
              ? 0
              : players.length -
                (paths[i].endCol === coffeeCol
                  ? players.length
                  : Math.abs(paths[i].endCol - coffeeCol)),
        }))
        .sort((a, b) => b.score - a.score);

      setResult({
        rankings,
        loser: { ...loser, score: 0 },
        gameName: '사다리 타기',
      });
      router.push('/result');
    }, 2000);
  }, [
    phase,
    players,
    loserIdx,
    paths,
    coffeeCol,
    traceDuration,
    animateTracer,
    setResult,
    router,
  ]);

  if (players.length < 2) return null;

  const buildPathD = (path: LadderPath) => {
    const segs = path.points.map((pt, i) => {
      const px = toX(pt.col);
      const py = toY(pt.row);
      return i === 0 ? `M ${px} ${py}` : `L ${px} ${py}`;
    });
    return segs.join(' ');
  };

  // Get current tracing player's animal for tracer color
  const tracingAnimal =
    tracingIdx >= 0 ? getAnimal(players[tracingIdx]?.animal) : null;

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
        {phase === 'tracing' &&
          tracingIdx >= 0 &&
          `${players[tracingIdx]?.name} 내려가는 중...`}
        {phase === 'done' && `${players[loserIdx]?.name} 당첨!`}
      </p>

      {/* Ladder container */}
      <div
        className="relative bg-gradient-to-br from-white to-coffee-100 rounded-clay-lg shadow-clay overflow-visible"
        style={{ width: ladderWidth + 16, padding: '0 8px' }}
      >
        {/* Player labels at top */}
        <div className="flex" style={{ height: LADDER_TOP }}>
          {players.map((p, i) => {
            const animal = getAnimal(p.animal);
            const isActive = phase === 'tracing' && tracingIdx === i;
            return (
              <div
                key={p.id}
                className="flex flex-col items-center justify-end pb-1"
                style={{ width: COL_WIDTH }}
              >
                <motion.span
                  className="text-2xl"
                  animate={
                    isActive
                      ? { scale: [1, 1.3, 1], y: [0, -4, 0] }
                      : {}
                  }
                  transition={
                    isActive
                      ? { duration: 0.5, repeat: Infinity }
                      : {}
                  }
                >
                  {animal?.emoji}
                </motion.span>
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
          className="block overflow-visible"
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

          {/* Traced paths (revealed) */}
          {players.map((p, i) => {
            const animal = getAnimal(p.animal);
            const isRevealed = revealedPaths.has(i);
            if (!isRevealed) return null;

            const pathD = buildPathD(paths[i]);

            return (
              <g key={`trace-${p.id}`}>
                <path
                  d={pathD}
                  fill="none"
                  stroke={animal?.color || '#FF8A3D'}
                  strokeWidth={4}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity={0.5}
                />
              </g>
            );
          })}

          {/* Active tracing path with animation */}
          {phase === 'tracing' && tracingIdx >= 0 && !revealedPaths.has(tracingIdx) && (
            <motion.path
              d={buildPathD(paths[tracingIdx])}
              fill="none"
              stroke={tracingAnimal?.color || '#FF8A3D'}
              strokeWidth={5}
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: traceDuration, ease: 'linear' }}
            />
          )}

          {/* Animated tracer ball */}
          {tracerPos && (
            <>
              {/* Glow */}
              <circle
                cx={tracerPos.x}
                cy={tracerPos.y}
                r={12}
                fill={tracingAnimal?.color || '#FF8A3D'}
                opacity={0.25}
              />
              {/* Ball */}
              <circle
                cx={tracerPos.x}
                cy={tracerPos.y}
                r={7}
                fill={tracingAnimal?.color || '#FF8A3D'}
                stroke="white"
                strokeWidth={2}
              />
              {/* Emoji on ball */}
              <text
                x={tracerPos.x}
                y={tracerPos.y + 1}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="9"
              >
                {tracingAnimal?.emoji}
              </text>
            </>
          )}
        </svg>

        {/* Bottom labels - hidden until tracing starts */}
        <div className="flex" style={{ height: 48 }}>
          {players.map((_, i) => {
            const isCoffee = i === coffeeCol;
            const showResult = phase === 'done';
            return (
              <div
                key={`bottom-${i}`}
                className="flex flex-col items-center justify-start pt-1"
                style={{ width: COL_WIDTH }}
              >
                {showResult ? (
                  <motion.span
                    className={`text-sm font-black ${isCoffee ? 'text-[#C62828]' : 'text-success'}`}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', delay: 0.2 }}
                  >
                    {isCoffee ? '커피☕' : 'safe✓'}
                  </motion.span>
                ) : (
                  <span className="text-lg">❓</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Start button */}
      <div className="mt-auto w-full">
        <TapButton onClick={handleStart} disabled={phase !== 'ready'}>
          {phase === 'ready' && '🪜 사다리 타기!'}
          {phase === 'tracing' && '🪜 내려가는 중...'}
          {phase === 'done' && '☕ 결과 확인 중...'}
        </TapButton>
      </div>
    </div>
  );
}
