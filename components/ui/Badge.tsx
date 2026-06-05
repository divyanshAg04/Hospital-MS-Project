import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'teal' | 'lavender' | 'amber' | 'red' | 'green' | 'grey' | 'blue';
  className?: string;
}

export function Badge({ children, variant = 'grey', className }: BadgeProps) {
  const variantStyles: Record<string, string> = {
    teal:     'bg-[rgba(0,196,255,0.12)] text-[#00C4FF] border border-[rgba(0,196,255,0.22)]',
    lavender: 'bg-[rgba(139,111,255,0.12)] text-[#8B6FFF] border border-[rgba(139,111,255,0.22)]',
    amber:    'bg-[rgba(255,181,71,0.12)] text-[#FFB547] border border-[rgba(255,181,71,0.22)]',
    red:      'bg-[rgba(255,71,87,0.12)] text-[#FF4757] border border-[rgba(255,71,87,0.22)]',
    green:    'bg-[rgba(0,217,139,0.12)] text-[#00D98B] border border-[rgba(0,217,139,0.22)]',
    grey:     'bg-[rgba(136,150,176,0.12)] text-[#8896B0] border border-[rgba(136,150,176,0.22)]',
    blue:     'bg-[rgba(0,196,255,0.12)] text-[#00C4FF] border border-[rgba(0,196,255,0.22)]',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide',
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
