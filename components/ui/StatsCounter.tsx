'use client';

import { useState, useEffect } from 'react';

interface StatsCounterProps {
  value: number;
  prefix?: string;
  suffix?: string;
}

export function StatsCounter({ value, prefix = '', suffix = '' }: StatsCounterProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let current = 0;
    const target = value;
    const duration = 1800;
    const step = 16;
    const increment = target / (duration / step);

    setCount(0);

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.round(current));
      }
    }, step);

    return () => {
      clearInterval(timer);
    };
  }, [value]);

  return (
    <span className="font-semibold tabular-nums" style={{ fontVariantNumeric: 'tabular-nums' }}>
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}
