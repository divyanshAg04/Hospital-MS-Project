'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { cn } from '@/lib/utils';

export function AdmissionsChart() {
  const [mounted, setMounted] = useState(false);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '3m'>('7d');

  useEffect(() => {
    setMounted(true);
  }, []);

  // Mock data for the chart tabs
  const chartData = {
    '7d': [
      { date: 'Mon', Admissions: 12, Discharges: 8 },
      { date: 'Tue', Admissions: 19, Discharges: 13 },
      { date: 'Wed', Admissions: 15, Discharges: 17 },
      { date: 'Thu', Admissions: 25, Discharges: 19 },
      { date: 'Fri', Admissions: 22, Discharges: 20 },
      { date: 'Sat', Admissions: 14, Discharges: 12 },
      { date: 'Sun', Admissions: 18, Discharges: 15 }
    ],
    '30d': [
      { date: 'Wk 1', Admissions: 82, Discharges: 71 },
      { date: 'Wk 2', Admissions: 95, Discharges: 88 },
      { date: 'Wk 3', Admissions: 104, Discharges: 92 },
      { date: 'Wk 4', Admissions: 120, Discharges: 110 }
    ],
    '3m': [
      { date: 'March', Admissions: 380, Discharges: 320 },
      { date: 'April', Admissions: 420, Discharges: 390 },
      { date: 'May', Admissions: 495, Discharges: 450 }
    ]
  };

  const activeData = chartData[timeRange];

  // Custom tooltips to match dark theme premium specs
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-panel p-3 border border-border/80 rounded-xl shadow-card text-xs font-semibold leading-relaxed">
          <p className="text-foreground/50 mb-1 border-b border-border/50 pb-1">{label}</p>
          <p className="text-[#4F8CFF] flex items-center gap-1.5 font-bold">
            <span className="h-1.5 w-1.5 rounded-full bg-[#4F8CFF]" />
            Admissions: <span className="text-foreground font-extrabold">{payload[0].value}</span>
          </p>
          <p className="text-brand-lavender flex items-center gap-1.5 font-bold">
            <span className="h-1.5 w-1.5 rounded-full bg-[#A78BFA]" />
            Discharges: <span className="text-foreground font-extrabold">{payload[1].value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  if (!mounted) {
    return (
      <div className="glass-card p-6 h-80 flex items-center justify-center select-none">
        <div className="h-full w-full rounded-xl bg-brand-surface animate-pulse" />
      </div>
    );
  }

  return (
    <div className="glass-card p-6 h-80 flex flex-col justify-between select-none relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/50 pb-3 shrink-0">
        <div>
          <h3 className="text-sm font-bold text-foreground">Patient Registry Chart</h3>
          <p className="text-[10px] text-foreground/45 mt-0.5">Admissions vs Discharges records</p>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex gap-1 bg-brand-surface/40 border border-border p-1 rounded-xl">
          {(['7d', '30d', '3m'] as const).map((tab) => {
            const labels = { '7d': '7 Days', '30d': '30 Days', '3m': '3 Months' };
            const active = timeRange === tab;
            return (
              <button
                key={tab}
                onClick={() => setTimeRange(tab)}
                className={cn(
                  'text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all outline-none',
                  active ? 'bg-gradient-primary text-white shadow-btn' : 'text-foreground/50 hover:text-foreground'
                )}
              >
                {labels[tab]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Recharts Container */}
      <div className="flex-1 w-full mt-4 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={activeData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis 
              dataKey="date" 
              stroke="var(--border)" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false}
              tick={{ fill: 'var(--text-secondary)', fontSize: 10 }}
            />
            <YAxis 
              stroke="var(--border)" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false} 
              tick={{ fill: 'var(--text-secondary)', fontSize: 10 }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }} />
            <Bar 
              dataKey="Admissions" 
              fill="#4F8CFF" 
              radius={[4, 4, 0, 0]}
              maxBarSize={16}
            />
            <Bar 
              dataKey="Discharges" 
              fill="#A78BFA" 
              radius={[4, 4, 0, 0]}
              maxBarSize={16}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
