'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { Player } from '@/types';

/**
 * Common hook for all mini-game pages.
 * - Redirects to home if players array is empty (direct access guard)
 * - Provides helpers for finishing a game and navigating to results
 */
export function useGameFlow() {
  const router = useRouter();
  const { players, updateScore, setResult, selectedGame } = useGameStore();
  const hasPlayers = players.length >= 2;

  // Guard: redirect if no players
  useEffect(() => {
    if (!hasPlayers) {
      router.replace('/');
    }
  }, [hasPlayers, router]);

  /**
   * Finish a ranked game (score-based: higher = better).
   * Creates rankings, determines loser, navigates to /result.
   */
  const finishRanked = (scoreMap: { playerId: string; score: number }[]) => {
    scoreMap.forEach(({ playerId, score }) => updateScore(playerId, score));

    const ranked = scoreMap
      .map(({ playerId, score }) => {
        const player = players.find((p) => p.id === playerId);
        return player ? { ...player, score } : null;
      })
      .filter((p): p is Player => p !== null)
      .sort((a, b) => b.score - a.score);

    const loser = ranked[ranked.length - 1];
    setResult({
      rankings: ranked,
      loser,
      gameName: selectedGame?.name || '',
    });
    router.push('/result');
  };

  /**
   * Finish a loser-only game (roulette, bomb-pass style).
   * The loser gets score 0, everyone else gets descending scores.
   */
  const finishWithLoser = (loserIdx: number) => {
    const others = players
      .filter((_, i) => i !== loserIdx)
      .map((p, i, arr) => ({ ...p, score: arr.length - i }));
    const loserCopy = { ...players[loserIdx], score: 0 };
    const rankings = [...others, loserCopy];

    setResult({
      rankings,
      loser: loserCopy,
      gameName: selectedGame?.name || '',
    });
    router.push('/result');
  };

  return {
    players,
    selectedGame,
    hasPlayers,
    finishRanked,
    finishWithLoser,
    router,
  };
}
