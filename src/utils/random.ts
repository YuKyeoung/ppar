import type { AnimalType } from '@/types';
import { ANIMALS } from '@/constants/animals';

export function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function randomAnimalIds(count: number): AnimalType[] {
  const shuffled = shuffleArray(ANIMALS);
  return shuffled.slice(0, count).map((a) => a.id);
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}
