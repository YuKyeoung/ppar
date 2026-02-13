import { create } from 'zustand';
import { Player, MiniGame, GameResult, PlayMode } from '@/types';

interface GameState {
  mode: PlayMode;
  players: Player[];
  selectedGame: MiniGame | null;
  result: GameResult | null;

  setMode: (mode: PlayMode) => void;
  setPlayers: (players: Player[]) => void;
  selectGame: (game: MiniGame) => void;
  updateScore: (playerId: string, score: number) => void;
  setResult: (result: GameResult) => void;
  reset: () => void;
  resetScores: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  mode: 'solo',
  players: [],
  selectedGame: null,
  result: null,

  setMode: (mode) => set({ mode }),

  setPlayers: (players) => set({ players }),

  selectGame: (game) => set({ selectedGame: game, result: null }),

  updateScore: (playerId, score) =>
    set((state) => ({
      players: state.players.map((p) =>
        p.id === playerId ? { ...p, score } : p
      ),
    })),

  setResult: (result) => set({ result }),

  reset: () =>
    set({
      mode: 'solo',
      players: [],
      selectedGame: null,
      result: null,
    }),

  resetScores: () =>
    set((state) => ({
      players: state.players.map((p) => ({ ...p, score: 0 })),
      result: null,
    })),
}));
