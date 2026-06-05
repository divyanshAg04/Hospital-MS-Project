'use client';

import React, { useEffect, useState } from 'react';
import { useStore } from '@/hooks/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserPlus, CalendarRange, UserMinus, ShieldAlert, 
  Activity, ArrowDown, ActivitySquare, CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function ActivityFeed() {
  const { activities, addActivity } = useStore();
  const [items, setItems] = useState(activities);

  // Sync initial items
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setItems(activities);
    setMounted(true);
  }, [activities]);

  // Set interval to simulate live-feel events appearing every 9 seconds
  useEffect(() => {
    const liveEventTemplates = [
      { message: 'Patient #PX-2032 admitted to Emergency — Dr. Aisha Al-Sayed', type: 'error', category: 'patient' },
      { message: 'Appointment booked — Kiara Advani with Dr. Robert Carter', type: 'success', category: 'appointment' },
      { message: 'Critical alert: ICU Bed 12 vitals check required', type: 'error', category: 'system' },
      { message: 'Discharge processed — Selena Kyle approved by Dr. Aaron Sharma', type: 'info', category: 'patient' },
      { message: 'Staff Member Dr. Sneha Reddy marked Available', type: 'success', category: 'doctor' },
      { message: 'Appointment rescheduled: SELINA KYLE -> Dr. Priya Patel', type: 'warning', category: 'appointment' },
      { message: 'Bed G-102 (Pediatrics) assigned to child patient', type: 'info', category: 'patient' }
    ];

    const interval = setInterval(() => {
      const randomEvent = liveEventTemplates[Math.floor(Math.random() * liveEventTemplates.length)];
      addActivity(randomEvent.message, randomEvent.type as any, randomEvent.category as any);
    }, 9000); // 9 seconds

    return () => clearInterval(interval);
  }, [addActivity]);

  return (
    <div className="glass-card p-6 h-80 flex flex-col justify-between select-none relative overflow-hidden">
      {/* Header */}
      <div className="border-b border-border/50 pb-3 shrink-0 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-foreground">Recent Activities</h3>
          <p className="text-[10px] text-foreground/45 mt-0.5 font-medium">Real-time clinical operations feed</p>
        </div>
        <span className="flex items-center gap-1 text-[9px] uppercase tracking-wider text-brand-teal font-extrabold bg-brand-teal/10 border border-brand-teal/10 px-2 py-0.5 rounded-full">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-teal animate-ping" />
          Live Feed
        </span>
      </div>

      {/* Feed List */}
      <div className="flex-1 mt-4 overflow-y-auto pr-1 flex flex-col gap-3 relative scrollbar max-h-[190px]">
        <AnimatePresence initial={false}>
          {items.map((act, index) => {
            let icon = <Activity className="h-4 w-4" />;
            let colorClasses = 'bg-brand-teal/10 text-brand-teal border-brand-teal/20';

            switch (act.category) {
              case 'patient':
                icon = <UserPlus className="h-4 w-4" />;
                colorClasses = 'bg-brand-teal/10 text-brand-teal border-brand-teal/20';
                break;
              case 'appointment':
                icon = <CalendarRange className="h-4 w-4" />;
                colorClasses = 'bg-brand-lavender/10 text-brand-lavender border-brand-lavender/20';
                break;
              case 'doctor':
                icon = <CheckCircle2 className="h-4 w-4" />;
                colorClasses = 'bg-brand-green/10 text-brand-green border-brand-green/20';
                break;
              case 'system':
                icon = <ShieldAlert className="h-4 w-4" />;
                colorClasses = 'bg-brand-red/10 text-brand-red border-brand-red/20';
                break;
            }

            // Stagger delay based on index
            const isFirst = index === 0;

            return (
              <motion.div
                key={act.id}
                initial={isFirst ? { opacity: 0, x: -30, height: 0, scale: 0.95 } : { opacity: 0, y: 15 }}
                animate={{ opacity: 1, x: 0, y: 0, height: 'auto', scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: 'spring', duration: 0.45 }}
                className={cn(
                  'flex gap-3 p-3 rounded-xl border glass-panel transition-all items-start relative',
                  isFirst && 'border-brand-teal/30 bg-brand-teal/5 glow-teal'
                )}
              >
                {/* Icon box */}
                <div className={cn('p-2 rounded-lg border shrink-0', colorClasses)}>
                  {icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pr-2">
                  <div className="text-[11px] font-bold text-foreground/90 leading-relaxed">
                    {act.message}
                  </div>
                  <div className="text-[9px] text-foreground/35 mt-1">
                    {mounted ? new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : ''}
                  </div>
                </div>

                {/* Highlight dot for newest alert */}
                {isFirst && (
                  <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-brand-teal animate-pulse" />
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Subtle fade gradient overlay at the bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-brand-dark via-brand-dark/20 to-transparent pointer-events-none z-10 shrink-0" />
    </div>
  );
}
