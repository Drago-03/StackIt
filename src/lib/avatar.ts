import { createAvatar } from '@dicebear/core';
import { personas } from '@dicebear/collection';

export function generateAvatar(seed: string): string {
  const avatar = createAvatar(personas, {
    seed,
    size: 40,
    backgroundColor: ['b6e3f4', 'c0aede', 'd1d4f9', 'ffd5dc', 'ffdfbf'],
  });

  return avatar.toDataUriSync();
}

export function generateLargeAvatar(seed: string): string {
  const avatar = createAvatar(personas, {
    seed,
    size: 80,
    backgroundColor: ['b6e3f4', 'c0aede', 'd1d4f9', 'ffd5dc', 'ffdfbf'],
  });

  return avatar.toDataUriSync();
}