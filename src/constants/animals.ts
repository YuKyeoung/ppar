import { AnimalData } from '@/types';

export const ANIMALS: AnimalData[] = [
  { id: 'cat', name: '고양이', emoji: '🐱', color: '#FFB74D' },
  { id: 'dog', name: '강아지', emoji: '🐶', color: '#A1887F' },
  { id: 'rabbit', name: '토끼', emoji: '🐰', color: '#F48FB1' },
  { id: 'bear', name: '곰', emoji: '🐻', color: '#8D6E63' },
  { id: 'fox', name: '여우', emoji: '🦊', color: '#FF8A65' },
  { id: 'panda', name: '판다', emoji: '🐼', color: '#90A4AE' },
  { id: 'penguin', name: '펭귄', emoji: '🐧', color: '#78909C' },
  { id: 'hamster', name: '햄스터', emoji: '🐹', color: '#FFCC80' },
  { id: 'owl', name: '부엉이', emoji: '🦉', color: '#BCAAA4' },
  { id: 'lion', name: '사자', emoji: '🦁', color: '#FFB300' },
  { id: 'koala', name: '코알라', emoji: '🐨', color: '#B0BEC5' },
  { id: 'duck', name: '오리', emoji: '🦆', color: '#81C784' },
];

export function getAnimal(id: string): AnimalData | undefined {
  return ANIMALS.find((a) => a.id === id);
}
