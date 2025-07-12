import { memo } from 'react';
import { generateAvatar, generateLargeAvatar } from '@/lib/avatar';

interface AvatarProps {
  seed: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Avatar = memo(function Avatar({ seed, size = 'md', className = '' }: AvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  };

  const avatarUrl = size === 'lg' ? generateLargeAvatar(seed) : generateAvatar(seed);

  return (
    <img
      src={avatarUrl}
      alt="User Avatar"
      className={`${sizeClasses[size]} rounded-full ${className}`}
    />
  );
});