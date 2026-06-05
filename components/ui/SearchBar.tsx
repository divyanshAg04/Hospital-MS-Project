'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useStore } from '@/hooks/useStore';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, User, Stethoscope, Calendar, Command, X, History } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export function SearchBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  
  const { initializeStore, patients, doctors, appointments } = useStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Sync state
  useEffect(() => {
    initializeStore();
    // Load recent searches
    const stored = localStorage.getItem('medcore-recent-searches');
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored));
      } catch (e) {}
    }
  }, [initializeStore]);

  // Handle Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setSelectedIndex(0);
      document.body.style.overflow = 'hidden';
    } else {
      setQuery('');
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  // Fuzzy Search results
  const searchResults = useMemo(() => {
    if (!query.trim()) return [];

    const lowerQuery = query.toLowerCase();
    const results: { id: string; title: string; subtitle: string; type: 'patient' | 'doctor' | 'appointment'; path: string }[] = [];

    // Search Patients
    patients.forEach(p => {
      if (p.id.toLowerCase().includes(lowerQuery) || p.name.toLowerCase().includes(lowerQuery)) {
        results.push({
          id: p.id,
          title: p.name,
          subtitle: `Patient ID: ${p.id} · ${p.department} · Status: ${p.status}`,
          type: 'patient',
          path: `/patients?id=${p.id}`
        });
      }
    });

    // Search Doctors
    doctors.forEach(d => {
      if (d.id.toLowerCase().includes(lowerQuery) || d.name.toLowerCase().includes(lowerQuery) || d.specialty.some(s => s.toLowerCase().includes(lowerQuery))) {
        results.push({
          id: d.id,
          title: d.name,
          subtitle: `${d.department} · ${d.specialty.join(', ')}`,
          type: 'doctor',
          path: `/doctors?id=${d.id}`
        });
      }
    });

    // Search Appointments
    appointments.forEach(a => {
      const patientName = patients.find(p => p.id === a.patientId)?.name || 'Patient';
      const docName = doctors.find(d => d.id === a.doctorId)?.name || 'Doctor';
      if (a.id.toLowerCase().includes(lowerQuery) || patientName.toLowerCase().includes(lowerQuery) || docName.toLowerCase().includes(lowerQuery) || a.reason.toLowerCase().includes(lowerQuery)) {
        results.push({
          id: a.id,
          title: `Appointment #${a.id}`,
          subtitle: `${patientName} with Dr. ${docName.replace('Dr. ', '')} on ${a.date} (${a.time})`,
          type: 'appointment',
          path: `/appointments?id=${a.id}`
        });
      }
    });

    return results.slice(0, 10); // cap at 10 results
  }, [query, patients, doctors, appointments]);

  const handleSelect = (item: typeof searchResults[0]) => {
    // Add to recents
    const updated = [item.title, ...recentSearches.filter(s => s !== item.title)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('medcore-recent-searches', JSON.stringify(updated));

    setIsOpen(false);
    
    // Custom trigger or route pushing
    router.push(item.path);
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(searchResults.length, 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + Math.max(searchResults.length, 1)) % Math.max(searchResults.length, 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (searchResults[selectedIndex]) {
        handleSelect(searchResults[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Trigger in header */}
      <button
        onClick={() => setIsOpen(true)}
        className="hidden md:flex items-center gap-3 px-3.5 py-1.5 flex-1 max-w-xl mx-8 text-left rounded-lg border border-border bg-brand-surface/40 hover:bg-brand-surface/80 hover:border-brand-teal/30 transition-all text-xs text-foreground/50 hover:text-foreground/80 outline-none"
      >
        <Search className="h-3.5 w-3.5 shrink-0" />
        <span className="flex-1">Search anything...</span>
        <kbd className="inline-flex items-center gap-1 border border-border bg-brand-surface px-1.5 py-0.5 rounded text-[9px] font-mono tracking-widest text-foreground/50 shrink-0">
          <Command className="h-2.5 w-2.5" />K
        </kbd>
      </button>

      {/* Full screen Search modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-[15vh] px-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-slate-950/20 backdrop-blur-md"
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ type: 'spring', duration: 0.3 }}
              className="relative w-full max-w-xl glass-panel rounded-2xl shadow-2xl border border-border overflow-hidden"
              ref={containerRef}
            >
              {/* Header Input */}
              <div className="flex items-center gap-3 px-4 border-b border-border bg-brand-surface/65 h-14">
                <Search className="h-5 w-5 text-brand-teal shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search patients, doctors, medical records, appointments..."
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setSelectedIndex(0);
                  }}
                  onKeyDown={handleKeyDown}
                  className="flex-1 bg-transparent border-none outline-none text-sm text-foreground placeholder-foreground/30 py-4 h-full"
                />
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-foreground/30 hover:text-foreground/80 transition-colors p-1 rounded-lg hover:bg-brand-surface"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Content Panel */}
              <div className="max-h-[350px] overflow-y-auto p-2 scrollbar">
                {query.trim() === '' ? (
                  /* Recent searches / Empty state helper */
                  recentSearches.length > 0 ? (
                    <div className="p-3">
                      <div className="text-xs font-semibold text-foreground/40 mb-2 flex items-center gap-1.5">
                        <History className="h-3 w-3" /> Recent Searches
                      </div>
                      <div className="flex flex-col gap-1">
                        {recentSearches.map((term, i) => (
                          <button
                            key={i}
                            onClick={() => setQuery(term)}
                            className="flex items-center gap-3 px-3 py-2 text-left rounded-lg text-sm text-foreground/75 hover:bg-brand-surface transition-colors"
                          >
                            <History className="h-4 w-4 text-foreground/30 shrink-0" />
                            {term}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 text-center text-foreground/30 text-sm">
                      Type name or ID to search MedCore records...
                    </div>
                  )
                ) : searchResults.length > 0 ? (
                  /* Search Results */
                  <div className="flex flex-col gap-0.5">
                    {searchResults.map((item, idx) => {
                      const icons = {
                        patient: <User className="h-4 w-4 text-brand-teal" />,
                        doctor: <Stethoscope className="h-4 w-4 text-brand-amber" />,
                        appointment: <Calendar className="h-4 w-4 text-brand-lavender" />
                      };

                      const isSelected = idx === selectedIndex;

                      return (
                        <button
                          key={item.id}
                          onClick={() => handleSelect(item)}
                          className={cn(
                            'flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all border border-transparent',
                            isSelected 
                              ? 'bg-brand-teal/10 border-brand-teal/20 text-foreground glow-teal scale-[1.01]' 
                              : 'hover:bg-brand-surface text-foreground/80'
                          )}
                        >
                          <div className={cn(
                            'flex items-center justify-center p-2 rounded-lg border border-border bg-brand-surface/60',
                            isSelected && 'border-brand-teal/30 bg-brand-teal/10'
                          )}>
                            {icons[item.type]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold truncate flex items-center gap-2">
                              {item.title}
                              <span className="text-[10px] uppercase font-mono tracking-wider text-foreground/60 border border-border px-1.5 py-0.5 rounded-full bg-brand-surface">
                                {item.type}
                              </span>
                            </div>
                            <div className="text-xs text-foreground/50 truncate mt-0.5">
                              {item.subtitle}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  /* No results */
                  <div className="p-8 text-center text-foreground/40 text-sm flex flex-col items-center justify-center gap-2">
                    <span>No results found for &ldquo;{query}&rdquo;</span>
                    <span className="text-xs text-foreground/30">Verify spelling or try patient initials/ID</span>
                  </div>
                )}
              </div>

              {/* Footer navigation guide */}
              <div className="flex items-center gap-4 px-4 py-3 bg-brand-surface border-t border-border text-[10px] text-foreground/45 font-medium shrink-0">
                <span className="flex items-center gap-1"><kbd className="bg-white border border-border px-1.5 py-0.5 rounded">↑↓</kbd> Navigate</span>
                <span className="flex items-center gap-1"><kbd className="bg-white border border-border px-1.5 py-0.5 rounded">Enter</kbd> Select</span>
                <span className="flex items-center gap-1"><kbd className="bg-white border border-border px-1.5 py-0.5 rounded">Esc</kbd> Close</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
