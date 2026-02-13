export type PlayMode = 'solo' | 'multi';

export type AnimalType =
  | 'cat' | 'dog' | 'rabbit' | 'bear' | 'fox' | 'panda'
  | 'penguin' | 'hamster' | 'owl' | 'lion' | 'koala' | 'duck';

export type GameCategory = 'racing' | 'luck' | 'skill' | 'party';

export interface Player {
  id: string;
  name: string;
  animal: AnimalType;
  score: number;
  isHost?: boolean;
}

export interface AnimalData {
  id: AnimalType;
  name: string;
  emoji: string;
  color: string;
}

export interface MiniGame {
  id: string;
  name: string;
  description: string;
  emoji: string;
  category: GameCategory;
  minPlayers: number;
  maxPlayers: number;
}

export interface GameResult {
  rankings: Player[];
  loser: Player;
  gameName: string;
}
