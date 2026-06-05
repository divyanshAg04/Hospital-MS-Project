'use client';

import React from 'react';
import { StatsCounter } from '../ui/StatsCounter';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: number;
  prefix?: string;
  suffix?: string;
  sublabel: string;
  icon: React.ReactNode;
  variant?: 'teal' | 'amber' | 'green' | 'red';
  className?: string;
}

export function StatsCard({
  title, value, prefix = '', suffix = '',
  sublabel, icon, variant = 'teal', className,
}: StatsCardProps) {

  const hoverGlow = {
    teal:  'hover:shadow-[0_12px_40px_rgba(79,140,255,0.18)] hover:border-[rgba(79,140,255,0.35)]',
    amber: 'hover:shadow-[0_12px_40px_rgba(245,158,11,0.14)]  hover:border-[rgba(245,158,11,0.30)]',
    green: 'hover:shadow-[0_12px_40px_rgba(16,185,129,0.14)]  hover:border-[rgba(16,185,129,0.30)]',
    red:   'hover:shadow-[0_12px_40px_rgba(239,68,68,0.14)]   hover:border-[rgba(239,68,68,0.25)]',
  };

  /* gradient bg blob behind icon */
  const blobColor = {
    teal:  'bg-[#4F8CFF]',
    amber: 'bg-amber-400',
    green: 'bg-emerald-400',
    red:   'bg-red-400',
  };

  /* icon container gradient */
  const iconGrad = {
    teal:  'from-[#4F8CFF] to-[#A78BFA] shadow-[0_4px_14px_rgba(79,140,255,0.35)]',
    amber: 'from-amber-400 to-orange-400   shadow-[0_4px_14px_rgba(245,158,11,0.30)]',
    green: 'from-emerald-400 to-teal-400   shadow-[0_4px_14px_rgba(16,185,129,0.30)]',
    red:   'from-red-400 to-rose-500        shadow-[0_4px_14px_rgba(239,68,68,0.28)]',
  };

  const valueColor = {
    teal:  'text-brand-teal',
    amber: 'text-brand-amber',
    green: 'text-brand-green',
    red:   'text-brand-red',
  };

  /* 3px top border color per variant — matches existing theme tokens */
  const topBorderColor = {
    teal:  '#4F8CFF',
    amber: '#f59e0b',
    green: '#10b981',
    red:   '#ef4444',
  };

  return (
    <div
      className={cn(
        'glass-card p-5 relative overflow-hidden select-none transition-all duration-300 hover:-translate-y-1.5 cursor-default',
        hoverGlow[variant],
        className
      )}
    >
      {/* 3px colored top border accent */}
      <div
        className="absolute inset-x-0 top-0 h-[3px] rounded-t-[inherit] z-20"
        style={{ background: topBorderColor[variant] }}
      />

      {/* Soft background blob */}
      <div className={cn(
        'absolute -top-10 -right-10 h-36 w-36 rounded-full filter blur-3xl opacity-[0.10]',
        blobColor[variant]
      )} />

      {/* Card inner gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--card-overlay-from)] to-[var(--card-overlay-to)] rounded-[inherit] pointer-events-none" />

      <div className="flex items-center justify-between relative z-10">
        <span className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">{title}</span>
        <div className={cn(
          'p-2 rounded-xl bg-gradient-to-br text-white',
          iconGrad[variant]
        )}>
          {icon}
        </div>
      </div>

      <div className="mt-4 relative z-10 flex items-baseline gap-1">
        <span className={cn('text-4xl font-black tracking-tight font-display', valueColor[variant])}>
          <StatsCounter value={value} prefix={prefix} suffix={suffix} />
        </span>
      </div>

      <div className="mt-2 text-xs font-medium text-[var(--text-secondary)] flex items-center gap-1.5 relative z-10">
        {variant === 'red' && <span className="h-1.5 w-1.5 rounded-full bg-brand-red animate-ping" />}
        <span>{sublabel}</span>
      </div>
    </div>
  );
}
