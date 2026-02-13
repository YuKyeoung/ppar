import { AnimalType } from '@/types';
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

export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
