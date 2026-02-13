import { create } from 'zustand';
import type { Player, GameResult } from '@/types';

interface GameState {
  players: Player[];
  result: GameResult | null;
  setPlayers: (players: Player[]) => void;
  setResult: (result: GameResult) => void;
  clear: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  players: [],
  result: null,

  setPlayers: (players) => set({ players, result: null }),

  setResult: (result) => set({ result }),

  clear: () => set({ players: [], result: null }),
}));
