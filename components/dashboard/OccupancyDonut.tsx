'use client';

import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { cn } from '@/lib/utils';

export function OccupancyDonut() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const data = [
    { name: 'ICU', value: 28, capacity: 32, color: '#EF4444' }, // Red (Critical)
    { name: 'Cardiology', value: 38, capacity: 45, color: '#4F8CFF' }, // Primary Blue
    { name: 'General Medicine', value: 85, capacity: 120, color: '#A78BFA' }, // Purple Accent
    { name: 'Pediatrics', value: 20, capacity: 40, color: '#67E8F9' }, // Soft Cyan
    { name: 'Orthopedics', value: 25, capacity: 40, color: '#F59E0B' } // Amber
  ];

  const totalBeds = data.reduce((acc, curr) => acc + curr.capacity, 0);
  const occupiedBeds = data.reduce((acc, curr) => acc + curr.value, 0);
  const occupancyPercentage = Math.round((occupiedBeds / totalBeds) * 100);

  // Custom tooltips to match dark theme premium specs
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      const rate = Math.round((item.value / item.capacity) * 100);
      return (
        <div className="glass-panel p-2.5 border border-border rounded-xl shadow-card text-xs font-semibold leading-relaxed">
          <p className="text-foreground font-bold flex items-center gap-1.5 mb-1">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
            {item.name}
          </p>
          <p className="text-foreground/50">Beds Occupied: <span className="text-foreground font-bold">{item.value} / {item.capacity}</span></p>
          <p className="text-foreground/50">Occupancy Rate: <span className="text-foreground font-extrabold">{rate}%</span></p>
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
      <div className="border-b border-border/50 pb-3 shrink-0">
        <h3 className="text-sm font-bold text-foreground">Department Bed Occupancy</h3>
        <p className="text-[10px] text-foreground/45 mt-0.5">Real-time bed utilization index</p>
      </div>

      <div className="flex-1 flex items-center justify-between min-h-0 py-2">
        {/* Donut Chart Container */}
        <div className="relative w-40 h-40 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip content={<CustomTooltip />} />
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={70}
                paddingAngle={4}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="var(--background)" strokeWidth={1} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Central Percentage */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-black font-display tracking-tighter text-foreground leading-none">
              {occupancyPercentage}%
            </span>
            <span className="text-[9px] font-bold text-foreground/40 mt-1 uppercase tracking-wider">
              {occupiedBeds}/{totalBeds} Beds
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 flex flex-col gap-1.5 pl-6 min-w-0">
          {data.map((item) => {
            const pct = Math.round((item.value / item.capacity) * 100);
            return (
              <div key={item.name} className="flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-2 min-w-0 pr-1.5">
                  <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-foreground/75 truncate">{item.name}</span>
                </div>
                <span className="text-foreground font-extrabold">{pct}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
