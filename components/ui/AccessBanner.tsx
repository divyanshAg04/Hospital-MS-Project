'use client';

import React from 'react';
import { ShieldCheck, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AccessBannerProps {
  role: string;
  allowedRoles: string[];
  message: string;
  className?: string;
}

export function AccessBanner({ role, allowedRoles, message, className }: AccessBannerProps) {
  const hasAccess = allowedRoles.includes(role);

  if (!hasAccess) {
    return (
      <div className={cn(
        "glass-panel border-brand-red/20 bg-brand-red/5 p-6 rounded-2xl flex flex-col items-center justify-center text-center gap-3 my-12 max-w-lg mx-auto animate-fade-in-up",
        className
      )}>
        <div className="h-12 w-12 rounded-full bg-brand-red/10 border border-brand-red/20 flex items-center justify-center text-brand-red">
          <ShieldAlert className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-sm font-black text-foreground">Restricted Section</h3>
          <p className="text-xs text-foreground/45 font-medium mt-1 uppercase tracking-wider">
            Role: <span className="font-mono text-brand-red font-bold">{role}</span>
          </p>
        </div>
        <p className="text-xs text-foreground/50 leading-relaxed max-w-sm">
          Your current account role does not have authorization to view or manage this section. Access is restricted under hospital security guidelines.
        </p>
      </div>
    );
  }

  return (
    <div className={cn(
      "flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-brand-teal/15 bg-brand-teal/5 text-xs text-foreground/60 font-semibold mb-4 select-none animate-fade-in",
      className
    )}>
      <ShieldCheck className="h-4 w-4 text-brand-teal shrink-0" />
      <span>{message}</span>
    </div>
  );
}
