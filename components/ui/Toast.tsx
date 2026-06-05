'use client';

import React, { useEffect } from 'react';
import { useStore, Toast } from '@/hooks/useStore';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ToastContainer() {
  const { toasts, removeToast } = useStore();
  return (
    <div className="fixed bottom-6 right-6 z-[99999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastCard key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
}

interface ToastCardProps { toast: Toast; onClose: () => void; }

function ToastCard({ toast, onClose }: ToastCardProps) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  const icons = {
    success: <CheckCircle2 className="h-5 w-5 text-brand-green shrink-0" />,
    error:   <AlertCircle  className="h-5 w-5 text-brand-red shrink-0 animate-pulse" />,
    warning: <AlertTriangle className="h-5 w-5 text-brand-amber shrink-0" />,
    info:    <Info         className="h-5 w-5 text-brand-teal shrink-0" />,
  };

  const styles = {
    success: 'bg-[var(--bg-elevated)] border-brand-green/20 shadow-l2',
    error:   'bg-[var(--bg-elevated)] border-brand-red/20 shadow-l2',
    warning: 'bg-[var(--bg-elevated)] border-brand-amber/20 shadow-l2',
    info:    'bg-[var(--bg-elevated)] border-brand-teal/20 shadow-l2',
  };

  const barColor = {
    success: 'bg-brand-green',
    error:   'bg-brand-red',
    warning: 'bg-brand-amber',
    info:    'bg-brand-teal',
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 40, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.18 } }}
      transition={{ type: 'spring', stiffness: 320, damping: 26 }}
      className={cn(
        'p-4 rounded-[6px] border flex gap-3 pointer-events-auto overflow-hidden relative',
        styles[toast.type]
      )}
    >
      {icons[toast.type]}
      <div className="flex-1 text-sm font-semibold pr-4 leading-relaxed text-[var(--text-primary)]">
        {toast.message}
      </div>
      <button
        onClick={onClose}
        className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors self-start shrink-0 -mt-1 -mr-1 p-1 rounded-lg hover:bg-white/10"
      >
        <X className="h-4 w-4" />
      </button>

      {/* Auto-dismiss progress bar */}
      <motion.div
        initial={{ width: '100%' }}
        animate={{ width: '0%' }}
        transition={{ duration: 4, ease: 'linear' }}
        className={cn('absolute bottom-0 left-0 h-[3px] rounded-b-2xl', barColor[toast.type])}
      />
    </motion.div>
  );
}
