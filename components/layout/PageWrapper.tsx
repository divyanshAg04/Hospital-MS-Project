'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface PageWrapperProps {
  children: React.ReactNode;
}

export function PageWrapper({ children }: PageWrapperProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.12, ease: 'linear' }}
      className="w-full h-full min-h-screen relative pb-10"
    >
      {/* ── Grid + Cross Background ── */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden select-none">
        {/* Animated grid */}
        <div className="dash-grid-bg absolute inset-0" />

        {/* 6 scattered ✚ crosses with staggered delays */}
        <span className="dash-cross" style={{ top: '6%',  left: '4%',   fontSize: '2rem',   animationDelay: '0s',    animationDuration: '5s',   opacity: 0.3 }}>✚</span>
        <span className="dash-cross" style={{ top: '14%', left: '52%',  fontSize: '2.5rem', animationDelay: '1s',    animationDuration: '6s',   opacity: 0.3 }}>✚</span>
        <span className="dash-cross" style={{ top: '38%', left: '88%',  fontSize: '1.8rem', animationDelay: '2s',    animationDuration: '4.5s', opacity: 0.3 }}>✚</span>
        <span className="dash-cross" style={{ top: '58%', left: '20%',  fontSize: '2.2rem', animationDelay: '0.7s',  animationDuration: '5.5s', opacity: 0.3 }}>✚</span>
        <span className="dash-cross" style={{ top: '72%', left: '68%',  fontSize: '1.6rem', animationDelay: '1.8s',  animationDuration: '6.5s', opacity: 0.3 }}>✚</span>
        <span className="dash-cross" style={{ top: '88%', left: '38%',  fontSize: '2rem',   animationDelay: '3s',    animationDuration: '5s',   opacity: 0.3 }}>✚</span>
      </div>

      {/* Page Content */}
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </motion.div>
  );
}
