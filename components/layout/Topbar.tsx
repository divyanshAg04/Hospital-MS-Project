'use client';

import React, { useState, useEffect } from 'react';
import { SearchBar } from '../ui/SearchBar';
import { useStore } from '@/hooks/useStore';
import { useRouter } from 'next/navigation';
import { 
  Bell, Plus, MapPin, 
  User, Calendar, Stethoscope, Settings, LogOut,
  Sun, Moon, X, Building2, Phone, Mail
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar } from '../ui/Avatar';
import { AnimatePresence, motion } from 'framer-motion';

export function Topbar() {
  const { theme, toggleTheme, initializeStore, activities } = useStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showQuickAction, setShowQuickAction] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showHospitalInfo, setShowHospitalInfo] = useState(false);
  const [showAnalogClockModal, setShowAnalogClockModal] = useState(false);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    let animFrameId: number;
    const update = () => {
      setTime(new Date());
      animFrameId = requestAnimationFrame(update);
    };
    animFrameId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animFrameId);
  }, []);

  const [mounted, setMounted] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string; role: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    initializeStore();
    setMounted(true);
    fetch('/api/auth/me')
      .then((res) => { if (res.ok) return res.json(); throw new Error(''); })
      .then((data) => { if (data.user) setCurrentUser(data.user); })
      .catch(() => {});
  }, [initializeStore]);

  const handleLogout = async () => {
    setShowProfileDropdown(false);
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) { router.push('/login'); router.refresh(); }
    } catch {}
  };

  const unreadCount = activities.filter(a => a.type === 'error' || a.type === 'warning').length;

  const handleQuickAction = (path: string) => {
    setShowQuickAction(false);
    router.push(path);
  };

  const ms = time.getMilliseconds();
  const sec = time.getSeconds() + ms / 1000;
  const min = time.getMinutes() + sec / 60;
  const hr = (time.getHours() % 12) + min / 60;

  const hrAngle = (hr / 12) * 2 * Math.PI;
  const minAngle = (min / 60) * 2 * Math.PI;
  const secAngle = (sec / 60) * 2 * Math.PI;

  // Small Clock coordinates
  const tinyHrX = 50 + 18 * Math.sin(hrAngle);
  const tinyHrY = 50 - 18 * Math.cos(hrAngle);
  const tinyMinX = 50 + 28 * Math.sin(minAngle);
  const tinyMinY = 50 - 28 * Math.cos(minAngle);
  const tinySecX = 50 + 32 * Math.sin(secAngle);
  const tinySecY = 50 - 32 * Math.cos(secAngle);

  // Big Clock coordinates
  const bigHrX = 50 + 22 * Math.sin(hrAngle);
  const bigHrY = 50 - 22 * Math.cos(hrAngle);
  const bigMinX = 50 + 32 * Math.sin(minAngle);
  const bigMinY = 50 - 32 * Math.cos(minAngle);
  const bigSecX = 50 + 36 * Math.sin(secAngle);
  const bigSecY = 50 - 36 * Math.cos(secAngle);

  /* ── shared class snippets ── */
  const iconBtn = "flex items-center justify-center h-9 w-9 md:h-10 md:w-10 rounded-[6px] border border-border bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)] hover:border-brand-teal text-[var(--text-secondary)] hover:text-brand-teal transition-all outline-none";
  const dropdownRow = "flex items-center gap-2.5 w-full px-3 py-2 text-sm text-[var(--text-secondary)] hover:text-brand-teal hover:bg-[var(--bg-hover)] rounded-[6px] transition-all text-left outline-none font-medium";

  return (
    <>
      <header className="fixed top-0 left-0 md:left-16 right-0 h-14 border-b border-border bg-[var(--bg-overlay)] backdrop-blur-md z-20 flex items-center justify-between px-4 select-none shadow-[0_1px_4px_rgba(0,0,0,0.5)]">

        {/* Decorative top gradient shimmer */}
        <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-brand-cyan/40 via-brand-lavender/30 to-brand-cyan/30 pointer-events-none" />

        {/* 1. Left */}
        <div className="flex items-center gap-3">
          {/* Mobile Logo */}
          <div 
            onClick={() => router.push('/')}
            className="flex md:hidden items-center gap-2 cursor-pointer hover:opacity-90 transition-all select-none"
          >
            <div className="flex items-center justify-center h-8 w-8 rounded-[6px] bg-gradient-to-br from-brand-cyan to-brand-lavender text-white shadow-[0_4px_12px_rgba(0,196,255,0.30)]">
              <svg viewBox="0 0 24 24" className="h-4.5 w-4.5 fill-none stroke-current stroke-[2.5]">
                <path d="M12 4v16M4 12h16" />
              </svg>
            </div>
            <span className="font-display font-black text-sm tracking-wide bg-gradient-to-r from-brand-cyan to-brand-lavender bg-clip-text text-transparent">
              MedCore
            </span>
          </div>

          {/* Ward Pill / Hospital Info Button */}
          <button
            onClick={() => setShowHospitalInfo(true)}
            className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-border bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)] text-xs text-[var(--text-secondary)] hover:text-brand-teal hover:border-brand-teal transition-all font-semibold outline-none"
          >
            <MapPin className="h-3.5 w-3.5 text-brand-teal" />
            <span>🏥 General Hospital · Ward A</span>
          </button>

          {/* Tiny Live Analog Clock Button with Digital Time Readout */}
          {mounted && (
            <div className="hidden sm:flex items-center gap-2 bg-[var(--bg-surface)] border border-border px-2.5 py-1 rounded-full shadow-sm animate-fade-in-up shrink-0 select-none">
              <button
                onClick={() => setShowAnalogClockModal(true)}
                className="flex items-center justify-center h-5 w-5 text-[var(--text-secondary)] hover:text-brand-teal transition-all outline-none"
                title="View Operations Clock"
              >
                <svg className="h-full w-full" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="8" fill="transparent" />
                  <circle cx="50" cy="50" r="5" fill="currentColor" />
                  <line x1="50" y1="50" x2={tinyHrX} y2={tinyHrY} stroke="currentColor" strokeWidth="11" strokeLinecap="round" />
                  <line x1="50" y1="50" x2={tinyMinX} y2={tinyMinY} stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
                  <line x1="50" y1="50" x2={tinySecX} y2={tinySecY} stroke="var(--accent-red)" strokeWidth="4.5" strokeLinecap="round" />
                </svg>
              </button>
              <span 
                onClick={() => setShowAnalogClockModal(true)}
                className="font-mono text-[10px] font-black text-[var(--text-secondary)] hover:text-brand-teal transition-colors cursor-pointer tracking-wider shrink-0"
                title="View Operations Clock"
              >
                {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
              </span>
            </div>
          )}
        </div>

        {/* 2. Center */}
        <SearchBar />

        {/* 3. Right */}
        <div className="flex items-center gap-2 md:gap-2.5">

          {/* Quick "+" */}
          <div className="relative">
            <button
              onClick={() => { setShowQuickAction(!showQuickAction); setShowNotifications(false); setShowProfileDropdown(false); }}
              className="flex items-center justify-center h-9 w-9 md:h-10 md:w-10 rounded-xl btn-gradient text-white shadow-btn hover:shadow-btn-hover outline-none select-none"
              title="Quick Action"
            >
              <Plus className="h-5 w-5 stroke-[2.5]" />
            </button>

            {showQuickAction && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowQuickAction(false)} />
                <div className="absolute right-0 mt-2.5 w-52 glass-panel rounded-2xl p-1.5 z-50 animate-fade-in-up">
                  <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-[rgba(79,140,255,0.10)] mb-1">
                    Quick Actions
                  </div>
                  {currentUser && [
                    { label: 'Add New Patient',  path: '/patients?new=true',    Icon: User, allowed: ['admin', 'receptionist', 'doctor', 'nurse'] },
                    { label: 'New Appointment',  path: '/appointments?new=true', Icon: Calendar, allowed: ['admin', 'receptionist'] },
                    { label: 'Add Staff Member', path: '/doctors?new=true',     Icon: Stethoscope, allowed: ['admin'] },
                  ].filter(item => item.allowed.includes(currentUser.role)).map(({ label, path, Icon }) => (
                    <button
                      key={label}
                      onClick={() => handleQuickAction(path)}
                      className={dropdownRow}
                    >
                      <Icon className="h-4 w-4 text-brand-teal" /> {label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className={iconBtn}
            title={mounted && theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {mounted && theme === 'dark' ? (
              <Sun className="h-4.5 w-4.5 text-amber-500" />
            ) : (
              <Moon className="h-4.5 w-4.5 text-slate-500" />
            )}
          </button>

          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => { setShowNotifications(!showNotifications); setShowQuickAction(false); setShowProfileDropdown(false); }}
              className={cn(iconBtn, 'relative')}
              title="Notifications"
            >
              <Bell className="h-4.5 w-4.5" />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                </span>
              )}
            </button>

            {showNotifications && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                <div className="absolute right-0 mt-2.5 w-80 glass-panel rounded-2xl p-2 z-50 animate-fade-in-up">
                  <div className="flex items-center justify-between px-3 py-2 border-b border-[rgba(79,140,255,0.10)] mb-2">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Recent Alerts</div>
                    {unreadCount > 0 && (
                      <span className="text-[10px] bg-red-50 text-red-500 border border-red-100 px-2 py-0.5 rounded-full font-bold">
                        {unreadCount} Warning
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col gap-1.5 max-h-[250px] overflow-y-auto scrollbar">
                    {activities.slice(0, 5).map((act) => (
                      <div
                        key={act.id}
                        className={cn(
                          "p-2.5 rounded-xl border text-xs leading-relaxed",
                          act.type === 'error'   && 'bg-brand-red/10 border-brand-red/20 text-brand-red',
                          act.type === 'warning' && 'bg-brand-amber/10 border-brand-amber/20 text-brand-amber',
                          act.type === 'success' && 'bg-brand-green/10 border-brand-green/20 text-brand-green',
                          act.type === 'info'    && 'bg-brand-teal/10 border-brand-teal/20 text-brand-teal'
                        )}
                      >
                        <div className="font-semibold mb-0.5 truncate">{act.message}</div>
                        <div className="text-[9px] text-[var(--text-secondary)]">
                          {mounted ? new Date(act.timestamp).toLocaleTimeString() : ''}
                        </div>
                      </div>
                    ))}
                    {activities.length === 0 && (
                      <div className="p-8 text-center text-xs text-slate-400">No notifications at this time.</div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* User Avatar Dropdown */}
          <div className="relative">
            <button
              onClick={() => { setShowProfileDropdown(!showProfileDropdown); setShowNotifications(false); setShowQuickAction(false); }}
              className="flex items-center gap-2 outline-none group"
            >
              <Avatar
                name={currentUser?.name || 'Alex Sterling'}
                size="sm"
                glow={true}
                className="ring-2 ring-[rgba(79,140,255,0.20)] group-hover:ring-[rgba(79,140,255,0.45)] transition-all duration-300"
              />
            </button>

            {showProfileDropdown && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowProfileDropdown(false)} />
                <div className="absolute right-0 mt-2.5 w-52 glass-panel rounded-[6px] p-1.5 z-50 animate-fade-in-up">
                  {/* User header */}
                  <div className="px-3 py-2.5 border-b border-border mb-1 select-none">
                    <div className="text-xs font-bold text-[var(--text-primary)] truncate">{currentUser?.name || 'Alex Sterling'}</div>
                    <div className="text-[10px] text-[var(--text-secondary)] mt-0.5 truncate">{currentUser?.email || 'alex.sterling@medcore.com'}</div>
                    {currentUser?.role && (
                      <span className="inline-flex mt-1.5 items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest bg-[rgba(0,196,255,0.12)] text-brand-cyan border border-[rgba(0,196,255,0.20)]">
                        {currentUser.role}
                      </span>
                    )}
                  </div>

                  {currentUser?.role !== 'doctor' && (
                    <button onClick={() => { setShowProfileDropdown(false); router.push('/settings'); }} className={dropdownRow}>
                      <User className="h-4 w-4 text-brand-cyan" /> My Profile
                    </button>
                  )}
                  {currentUser?.role === 'admin' && (
                    <button onClick={() => { setShowProfileDropdown(false); router.push('/settings'); }} className={dropdownRow}>
                      <Settings className="h-4 w-4 text-brand-cyan" /> Settings
                    </button>
                  )}

                  <div className="my-1 border-t border-border" />

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-brand-red hover:bg-brand-red/10 rounded-[6px] transition-all text-left outline-none font-bold"
                  >
                    <LogOut className="h-4 w-4" /> Logout
                  </button>
                </div>
              </>
            )}
          </div>

        </div>
      </header>

      {/* Hospital Info Modal */}
      <AnimatePresence>
        {showHospitalInfo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Modal Backdrop */}
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowHospitalInfo(false)}
            />
            {/* Modal Box */}
            <div
              className="relative w-full max-w-md glass-card border border-border shadow-l3 p-6 flex flex-col gap-5 animate-fade-in-up"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border/60 pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-[6px] bg-gradient-to-br from-brand-cyan to-brand-lavender text-white flex items-center justify-center shadow-lg">
                    <Building2 className="h-5.5 w-5.5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">Hospital Registry</h3>
                    <p className="text-[10px] text-foreground/45 font-bold uppercase tracking-wider mt-0.5">Identity</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowHospitalInfo(false)}
                  className="p-1.5 rounded-lg hover:bg-brand-surface text-foreground/40 hover:text-foreground transition-colors"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              {/* Body */}
              <div className="flex flex-col gap-4">
                <div className="bg-brand-surface/50 border border-border/50 p-3 rounded-[6px]">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-foreground/40">Official Name</span>
                  <div className="text-sm font-black text-foreground mt-0.5">MedCore Care Clinic & General Hospital</div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-0.5 px-3.5 py-2.5 rounded-[6px] border border-border/50 bg-brand-surface/20">
                    <span className="text-[9px] font-bold text-foreground/40 uppercase tracking-widest">Registry ID</span>
                    <span className="text-xs font-black text-foreground/80 font-mono mt-0.5">HOSP-2026-X8392</span>
                  </div>
                  <div className="flex flex-col gap-0.5 px-3.5 py-2.5 rounded-[6px] border border-border/50 bg-brand-surface/20">
                    <span className="text-[9px] font-bold text-foreground/40 uppercase tracking-widest">Active Ward</span>
                    <span className="text-xs font-black text-foreground/80 mt-0.5">Ward A (General)</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2.5 px-1">
                  <div className="flex items-center gap-3 text-xs text-foreground/60">
                    <MapPin className="h-4 w-4 text-brand-cyan shrink-0" />
                    <span className="font-semibold text-slate-600 dark:text-slate-300">12, Ring Road, Sector V, Bengaluru, KA 560001</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-foreground/60">
                    <Phone className="h-4 w-4 text-brand-cyan shrink-0" />
                    <span className="font-semibold text-slate-600 dark:text-slate-300">+91 98765 01928</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-foreground/60">
                    <Mail className="h-4 w-4 text-brand-cyan shrink-0" />
                    <span className="font-semibold text-slate-600 dark:text-slate-300">support@medcore.in</span>
                  </div>
                </div>

                <div className="border-t border-border/50 pt-4">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-foreground/40 block mb-2 px-1">Infrastructure Departments</span>
                  <div className="flex flex-wrap gap-1.5">
                    {['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Oncology', 'Radiology', 'ICU', 'Emergency', 'Dermatology', 'General Medicine'].map((dept) => (
                      <span
                        key={dept}
                        className="text-[10px] font-bold bg-brand-cyan/10 text-brand-cyan px-2.5 py-1 rounded-full border border-brand-cyan/20"
                      >
                        {dept}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Close Footer button */}
              <button
                onClick={() => setShowHospitalInfo(false)}
                className="w-full py-2.5 rounded-[6px] bg-gradient-primary text-white text-xs font-black transition-all outline-none shadow-btn hover:shadow-btn-hover"
              >
                Acknowledge Info
              </button>
            </div>
          </div>
        )}

        {/* Central Big Analog Clock Modal */}
        {showAnalogClockModal && (
          <div 
            className="fixed inset-0 z-[9999] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowAnalogClockModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className="glass-card w-full max-w-xs p-6 flex flex-col items-center justify-center gap-5 text-center relative select-none"
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="w-full flex items-center justify-between border-b border-border/50 pb-2.5">
                <div className="text-left">
                  <h3 className="text-xs font-bold text-foreground">Operations Timepiece</h3>
                  <p className="text-[9px] text-foreground/45 mt-0.5 font-medium">Synchronized surgical & administrative time</p>
                </div>
                <button 
                  onClick={() => setShowAnalogClockModal(false)} 
                  className="p-1.5 rounded-lg hover:bg-brand-surface text-foreground/40 hover:text-foreground transition-all"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              {/* Big Clock SVG */}
              <div className="relative w-52 h-52 flex items-center justify-center">
                <svg className="w-full h-full text-[var(--text-primary)]" viewBox="0 0 100 100">
                  {/* outer glow ring */}
                  <circle cx="50" cy="50" r="46" stroke="var(--border-strong)" strokeWidth="2.5" fill="var(--bg-surface)" className="shadow-accent-glow" />
                  <circle cx="50" cy="50" r="44" stroke="var(--border)" strokeWidth="0.75" fill="transparent" />
                  
                  {/* Tick marks */}
                  {Array.from({ length: 12 }).map((_, i) => {
                    const angle = (i * 30 * Math.PI) / 180;
                    const x1 = 50 + 38 * Math.sin(angle);
                    const y1 = 50 - 38 * Math.cos(angle);
                    const x2 = 50 + 43 * Math.sin(angle);
                    const y2 = 50 - 43 * Math.cos(angle);
                    return (
                      <line
                        key={i}
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke="var(--text-secondary)"
                        strokeWidth={i % 3 === 0 ? "1.5" : "0.75"}
                        opacity={i % 3 === 0 ? "0.9" : "0.4"}
                      />
                    );
                  })}

                  {/* Clock face branding */}
                  <text x="50" y="32" textAnchor="middle" fontSize="4.5" fontWeight="bold" fill="var(--text-muted)" letterSpacing="1.2">
                    MEDCORE
                  </text>

                  {/* Date display window */}
                  <rect x="64" y="44.5" width="11" height="11" rx="1.5" fill="var(--bg-elevated)" stroke="var(--border)" strokeWidth="0.5" />
                  <text x="69.5" y="52" textAnchor="middle" fontSize="6.5" fontWeight="extrabold" fill="var(--accent-cyan)">
                    {time.getDate()}
                  </text>

                  {/* Sweeping Hands */}
                  {/* Hour Hand */}
                  <line x1="50" y1="50" x2={bigHrX} y2={bigHrY} stroke="var(--text-primary)" strokeWidth="2.5" strokeLinecap="round" />
                  {/* Minute Hand */}
                  <line x1="50" y1="50" x2={bigMinX} y2={bigMinY} stroke="var(--text-primary)" strokeWidth="1.75" strokeLinecap="round" />
                  {/* Second Hand (red, sweeps smoothly) */}
                  <line x1="50" y1="50" x2={bigSecX} y2={bigSecY} stroke="var(--accent-red)" strokeWidth="0.75" strokeLinecap="round" />
                  
                  {/* Central pin cap */}
                  <circle cx="50" cy="50" r="2.2" fill="var(--accent-cyan)" />
                  <circle cx="50" cy="50" r="0.9" fill="var(--bg-base)" />
                </svg>
              </div>

              {/* Readouts */}
              <div className="flex flex-col gap-0.5 items-center">
                <span className="font-mono text-base font-black tracking-widest text-foreground">
                  {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
                <span className="text-[9px] font-bold text-foreground/45 uppercase tracking-wider">
                  {time.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
