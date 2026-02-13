import { MiniGame } from '@/types';

export const GAMES: MiniGame[] = [
  {
    id: 'tap-race',
    name: '달리기 경주',
    description: '빨리 탭해서 동물을 달리게 해!',
    emoji: '🏃',
    category: 'racing',
    minPlayers: 2,
    maxPlayers: 8,
  },
  {
    id: 'slot-race',
    name: '슬롯 레이스',
    description: '슬롯을 돌려 숫자만큼 전진!',
    emoji: '🎰',
    category: 'racing',
    minPlayers: 2,
    maxPlayers: 8,
  },
  {
    id: 'rocket-launch',
    name: '로켓 발사',
    description: '타이밍 맞춰 가장 높이 날려!',
    emoji: '🚀',
    category: 'racing',
    minPlayers: 2,
    maxPlayers: 8,
  },
  {
    id: 'dice-battle',
    name: '주사위 대결',
    description: '주사위를 굴려 승부!',
    emoji: '🎲',
    category: 'luck',
    minPlayers: 2,
    maxPlayers: 8,
  },
  {
    id: 'card-draw',
    name: '카드 뽑기',
    description: '높은 숫자 카드를 뽑아라!',
    emoji: '🃏',
    category: 'luck',
    minPlayers: 2,
    maxPlayers: 8,
  },
  {
    id: 'roulette',
    name: '룰렛',
    description: '룰렛 돌려서 꼴찌 결정!',
    emoji: '🎡',
    category: 'luck',
    minPlayers: 2,
    maxPlayers: 8,
  },
  {
    id: 'quick-tap',
    name: '반응속도 테스트',
    description: '초록빛이면 바로 탭!',
    emoji: '⚡',
    category: 'skill',
    minPlayers: 2,
    maxPlayers: 8,
  },
  {
    id: 'target-shot',
    name: '과녁 맞추기',
    description: '정확히 과녁 중심을 탭!',
    emoji: '🎯',
    category: 'skill',
    minPlayers: 2,
    maxPlayers: 8,
  },
  {
    id: 'math-battle',
    name: '암산 배틀',
    description: '산수 문제를 가장 빨리 풀어!',
    emoji: '🧮',
    category: 'skill',
    minPlayers: 2,
    maxPlayers: 8,
  },
  {
    id: 'bomb-pass',
    name: '폭탄 돌리기',
    description: '터지기 전에 넘겨!',
    emoji: '💣',
    category: 'party',
    minPlayers: 2,
    maxPlayers: 8,
  },
  {
    id: 'coin-flip',
    name: '동전 던지기',
    description: '앞뒤를 맞춰봐!',
    emoji: '🪙',
    category: 'party',
    minPlayers: 2,
    maxPlayers: 8,
  },
  {
    id: 'nunchi-game',
    name: '눈치 게임',
    description: '같은 숫자 누르면 탈락!',
    emoji: '🎪',
    category: 'party',
    minPlayers: 3,
    maxPlayers: 8,
  },
];

export function getGame(id: string): MiniGame | undefined {
  return GAMES.find((g) => g.id === id);
}

export function getGamesByCategory(category: string): MiniGame[] {
  if (category === 'all') return GAMES;
  return GAMES.filter((g) => g.category === category);
}
