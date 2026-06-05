import React from 'react';
import { getAvatarColor, cn } from '@/lib/utils';

interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  glow?: boolean;
}

export function Avatar({ name, size = 'md', className, glow = false }: AvatarProps) {
  const color = getAvatarColor(name);
  
  // Extract initials
  const parts = name.trim().split(/\s+/);
  let initials = '';
  if (parts.length > 0) {
    // If it starts with Dr. skip it
    if (parts[0].toLowerCase() === 'dr.' && parts.length > 1) {
      initials = (parts[1][0] || '') + (parts[2]?.[0] || '');
    } else {
      initials = (parts[0][0] || '') + (parts[1]?.[0] || '');
    }
  }
  initials = initials.toUpperCase().slice(0, 2);

  const sizeClasses = {
    sm: 'h-8 w-8 text-xs font-semibold',
    md: 'h-10 w-10 text-sm font-bold',
    lg: 'h-12 w-12 text-base font-black',
    xl: 'h-20 w-20 text-2xl font-black'
  };

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full border shrink-0',
        color.bg,
        color.text,
        color.border,
        glow && color.glow,
        sizeClasses[size],
        className
      )}
    >
      {initials}
    </div>
  );
}
