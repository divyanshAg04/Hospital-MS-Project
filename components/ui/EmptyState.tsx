import React from 'react';
import { cn } from '@/lib/utils';
import { ClipboardList } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  className?: string;
  icon?: React.ReactNode;
}

export function EmptyState({ title, description, className, icon }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center p-12 glass-card border border-dashed border-border rounded-2xl bg-brand-surface/10 hover:border-brand-teal/20 transition-all select-none',
        className
      )}
    >
      <div className="flex items-center justify-center h-16 w-16 rounded-full border border-border bg-brand-surface/40 mb-4 text-brand-teal/80 glow-teal">
        {icon || <ClipboardList className="h-8 w-8" />}
      </div>
      <h3 className="text-base font-bold text-foreground/95 tracking-tight">{title}</h3>
      <p className="text-xs text-foreground/45 max-w-xs mt-1.5 leading-relaxed">{description}</p>
    </div>
  );
}
