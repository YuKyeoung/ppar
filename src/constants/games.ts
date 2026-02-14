import type { MiniGame } from '@/types';

export const GAMES: MiniGame[] = [
  {
    id: 'race',
    name: '달리기 경주',
    description: '동물들이 달린다! 꼴찌는 커피!',
    emoji: '🏃',
    minPlayers: 2,
    maxPlayers: 6,
  },
  {
    id: 'roulette',
    name: '룰렛',
    description: '룰렛 돌려서 꼴찌 결정!',
    emoji: '🎡',
    minPlayers: 2,
    maxPlayers: 6,
  },
  {
    id: 'dice',
    name: '주사위',
    description: '한 번에 전원 주사위! 최저 꼴찌!',
    emoji: '🎲',
    minPlayers: 2,
    maxPlayers: 6,
  },
  {
    id: 'card',
    name: '카드 뽑기',
    description: '카드 동시 오픈! 최저 꼴찌!',
    emoji: '🃏',
    minPlayers: 2,
    maxPlayers: 6,
  },
  {
    id: 'slot',
    name: '슬롯머신',
    description: '슬롯 돌려서 운명 결정!',
    emoji: '🎰',
    minPlayers: 2,
    maxPlayers: 6,
  },
  {
    id: 'ladder',
    name: '사다리 타기',
    description: '사다리 타고 커피 당첨!',
    emoji: '🪜',
    minPlayers: 2,
    maxPlayers: 6,
  },
  {
    id: 'straw',
    name: '제비뽑기',
    description: '짧은 제비 뽑으면 꼴찌!',
    emoji: '🎋',
    minPlayers: 2,
    maxPlayers: 6,
  },
];

export function getGame(id: string): MiniGame | undefined {
  return GAMES.find((g) => g.id === id);
}
