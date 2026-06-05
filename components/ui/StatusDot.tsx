import React from 'react';
import { cn } from '@/lib/utils';

interface StatusDotProps {
  status: 
    | 'Waiting' 
    | 'In Progress' 
    | 'Completed' 
    | 'Cancelled' 
    | 'Scheduled'
    | 'Checked In'
    | 'No Show'
    | 'Active' 
    | 'Critical' 
    | 'Discharged' 
    | 'Under Observation'
    | 'Available'
    | 'In Surgery'
    | 'On Leave'
    | 'Off Duty';
  className?: string;
}

export function StatusDot({ status, className }: StatusDotProps) {
  let colorClass = 'bg-slate-400';
  let pulse = false;

  switch (status) {
    case 'Active':
    case 'Available':
    case 'Completed':
      colorClass = 'bg-brand-green';
      break;
    case 'Critical':
    case 'Cancelled':
    case 'No Show':
      colorClass = 'bg-brand-red';
      pulse = true;
      break;
    case 'Under Observation':
    case 'In Progress':
    case 'In Surgery':
      colorClass = 'bg-brand-amber';
      pulse = status === 'In Surgery' || status === 'In Progress';
      break;
    case 'Checked In':
    case 'Waiting':
      colorClass = 'bg-blue-400';
      break;
    case 'Scheduled':
      colorClass = 'bg-brand-lavender';
      break;
    case 'Discharged':
    case 'Off Duty':
    case 'On Leave':
      colorClass = 'bg-slate-500';
      break;
  }

  return (
    <span className={cn('relative flex h-2 w-2', className)}>
      {pulse && (
        <span className={cn('animate-ping absolute inline-flex h-full w-full rounded-full opacity-75', colorClass)}></span>
      )}
      <span className={cn('relative inline-flex rounded-full h-2 w-2', colorClass)}></span>
    </span>
  );
}
