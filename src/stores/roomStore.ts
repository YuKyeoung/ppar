import { create } from 'zustand';
import type { Player, AnimalType } from '@/types';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { generateRoomCode, generateId } from '@/utils/random';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface RoomState {
  roomCode: string | null;
  isHost: boolean;
  players: Player[];
  myPlayerId: string | null;
  gameStarted: boolean;
  selectedGameId: string | null;

  createRoom: (player: { name: string; animal: AnimalType }) => Promise<string>;
  joinRoom: (
    code: string,
    player: { name: string; animal: AnimalType },
  ) => Promise<boolean>;
  leaveRoom: () => void;
  startGame: (gameId: string) => void;
  cleanup: () => void;
}

// Module-level channel reference (not stored in state)
let channel: RealtimeChannel | null = null;

/**
 * Subscribe to a Supabase Realtime channel for a room.
 * Uses Presence for player list syncing and Broadcast for game state.
 */
function subscribeToRoom(
  roomCode: string,
  playerId: string,
  playerInfo: { name: string; animal: AnimalType; isHost: boolean },
  set: (
    partial:
      | Partial<RoomState>
      | ((state: RoomState) => Partial<RoomState>),
  ) => void,
) {
  // Clean up any existing channel
  if (channel) {
    supabase.removeChannel(channel);
    channel = null;
  }

  channel = supabase.channel(`room:${roomCode}`, {
    config: { presence: { key: playerId } },
  });

  // ---- Presence: real-time player list sync ----
  channel.on('presence', { event: 'sync' }, () => {
    const presenceState = channel!.presenceState<{
      id: string;
      name: string;
      animal: AnimalType;
      score: number;
      isHost: boolean;
    }>();

    const players: Player[] = [];

    for (const key of Object.keys(presenceState)) {
      const presences = presenceState[key];
      if (presences && presences.length > 0) {
        const p = presences[0];
        players.push({
          id: p.id,
          name: p.name,
          animal: p.animal,
          score: p.score ?? 0,
          isHost: p.isHost,
        });
      }
    }

    // Sort: host first, then by id for stable ordering
    players.sort((a, b) => {
      if (a.isHost && !b.isHost) return -1;
      if (!a.isHost && b.isHost) return 1;
      return a.id.localeCompare(b.id);
    });

    set({ players });
  });

  // ---- Broadcast: game selection ----
  channel.on('broadcast', { event: 'game:select' }, ({ payload }) => {
    set({ selectedGameId: payload.gameId });
  });

  // ---- Broadcast: game start signal ----
  channel.on('broadcast', { event: 'game:start' }, ({ payload }) => {
    set({ gameStarted: true, selectedGameId: payload.gameId });
  });

  // ---- Broadcast: score updates ----
  channel.on('broadcast', { event: 'game:score' }, ({ payload }) => {
    set((state) => ({
      players: state.players.map((p) =>
        p.id === payload.playerId ? { ...p, score: payload.score } : p,
      ),
    }));
  });

  // Subscribe to the channel and track presence
  channel.subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      await channel!.track({
        id: playerId,
        name: playerInfo.name,
        animal: playerInfo.animal,
        score: 0,
        isHost: playerInfo.isHost,
      });
    }
  });
}

export const useRoomStore = create<RoomState>((set, get) => ({
  roomCode: null,
  isHost: false,
  players: [],
  myPlayerId: null,
  gameStarted: false,
  selectedGameId: null,

  createRoom: async (player) => {
    if (!isSupabaseConfigured()) {
      console.warn('Supabase is not configured. Room creation skipped.');
      return '';
    }

    const roomCode = generateRoomCode();
    const playerId = generateId();

    set({
      roomCode,
      isHost: true,
      myPlayerId: playerId,
      gameStarted: false,
      selectedGameId: null,
      players: [],
    });

    subscribeToRoom(
      roomCode,
      playerId,
      { name: player.name, animal: player.animal, isHost: true },
      set,
    );

    return roomCode;
  },

  joinRoom: async (code, player) => {
    if (!isSupabaseConfigured()) {
      console.warn('Supabase is not configured. Room join skipped.');
      return false;
    }

    const roomCode = code.toUpperCase().trim();
    const playerId = generateId();

    set({
      roomCode,
      isHost: false,
      myPlayerId: playerId,
      gameStarted: false,
      selectedGameId: null,
      players: [],
    });

    subscribeToRoom(
      roomCode,
      playerId,
      { name: player.name, animal: player.animal, isHost: false },
      set,
    );

    return true;
  },

  leaveRoom: () => {
    if (channel) {
      channel.untrack();
      supabase.removeChannel(channel);
      channel = null;
    }

    set({
      roomCode: null,
      isHost: false,
      players: [],
      myPlayerId: null,
      gameStarted: false,
      selectedGameId: null,
    });
  },

  startGame: (gameId) => {
    const { isHost } = get();
    if (!isHost || !channel) return;

    channel.send({
      type: 'broadcast',
      event: 'game:start',
      payload: { gameId },
    });

    set({ gameStarted: true, selectedGameId: gameId });
  },

  cleanup: () => {
    if (channel) {
      channel.untrack();
      supabase.removeChannel(channel);
      channel = null;
    }

    set({
      roomCode: null,
      isHost: false,
      players: [],
      myPlayerId: null,
      gameStarted: false,
      selectedGameId: null,
    });
  },
}));
