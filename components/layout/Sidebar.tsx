'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useStore } from '@/hooks/useStore';
import { 
  Home, Users, Calendar, Stethoscope, FileText, 
  Pill, CreditCard, Settings, ChevronLeft, ChevronRight,
  ShieldAlert, Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar } from '../ui/Avatar';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<any>;
  disabled?: boolean;
}

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(true);
  const [currentUser, setCurrentUser] = useState<{ name: string; role: string } | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { theme } = useStore();

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => { if (res.ok) return res.json(); throw new Error(''); })
      .then((data) => { if (data.user) setCurrentUser(data.user); })
      .catch(() => {});
  }, []);

  const primaryNav: NavItem[] = useMemo(() => [
    { label: 'Dashboard',      href: '/dashboard',   icon: Home },
    { label: 'Patients',       href: '/patients',    icon: Users },
    { label: 'Appointments',   href: '/appointments',icon: Calendar },
    { label: 'Doctors & Staff',href: '/doctors',     icon: Stethoscope },
    { label: 'Medical Records',href: '/records',     icon: FileText },
    { label: 'Pharmacy',       href: '/pharmacy',    icon: Pill },
    { label: 'Billing',        href: '/billing',     icon: CreditCard },
  ], []);

  const secondaryNav: NavItem[] = useMemo(() => [
    { label: 'Settings', href: '/settings', icon: Settings },
  ], []);

  const filteredPrimaryNav = useMemo(() => {
    if (!currentUser) return primaryNav;
    const role = currentUser.role;

    return primaryNav.filter(item => {
      if (item.label === 'Dashboard') return true;
      if (role === 'admin') return true;

      if (role === 'doctor' || role === 'nurse') {
        return ['Patients', 'Appointments', 'Doctors & Staff', 'Medical Records', 'Pharmacy'].includes(item.label);
      }
      if (role === 'receptionist') {
        return ['Patients', 'Doctors & Staff', 'Billing', 'Pharmacy'].includes(item.label);
      }
      if (role === 'patient') {
        return ['Patients', 'Doctors & Staff', 'Medical Records', 'Pharmacy', 'Billing'].includes(item.label);
      }
      if (role === 'pharmacist') {
        return ['Pharmacy', 'Billing'].includes(item.label);
      }
      return false;
    });
  }, [currentUser, primaryNav]);

  const filteredSecondaryNav = useMemo(() => {
    if (!currentUser) return secondaryNav;
    const role = currentUser.role;

    return secondaryNav.filter(item => {
      if (item.label === 'Settings') {
        return role === 'admin';
      }
      return true;
    });
  }, [currentUser, secondaryNav]);

  const handleNavClick = (item: NavItem) => {
    if (item.disabled) return;
    router.push(item.href);
  };

  return (
    <>
      {/* 1. Desktop & Tablet Sidebar */}
      <aside
        onMouseEnter={() => setCollapsed(false)}
        onMouseLeave={() => setCollapsed(true)}
        className={cn(
          'hidden md:flex flex-col fixed top-0 left-0 h-screen z-40 border-r transition-all duration-300 ease-in-out',
          'bg-[var(--sidebar-bg)] backdrop-blur-xl',
          'border-border',
          'shadow-l3',
          collapsed ? 'w-16' : 'w-60'
        )}
      >
        {/* Decorative top gradient line */}
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-brand-cyan via-brand-lavender to-brand-cyan rounded-t-xl" />

        {/* Logo Header */}
        <div 
          onClick={() => { router.push('/dashboard'); }}
          className="flex items-center gap-3 px-4 border-b border-border h-14 shrink-0 relative overflow-hidden select-none cursor-pointer hover:opacity-90 transition-all"
        >
          {/* Subtle logo bg blob */}
          <div className="absolute -top-4 -left-4 h-20 w-20 rounded-full bg-brand-cyan/10 blur-2xl pointer-events-none" />

          <div className="flex items-center justify-center h-8 w-8 rounded-[6px] bg-gradient-to-br from-brand-cyan to-brand-lavender text-white shadow-[0_4px_12px_rgba(0,196,255,0.35)] shrink-0">
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-[2.5]">
              <path d="M12 4v16M4 12h16" />
            </svg>
          </div>

          {!collapsed && (
            <span className="font-display text-lg font-black tracking-wider bg-gradient-to-r from-brand-cyan via-brand-lavender to-brand-cyan bg-clip-text text-transparent">
              MedCore
            </span>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto p-3 flex flex-col gap-1 scrollbar select-none">
          {filteredPrimaryNav.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;

            return (
              <button
                key={item.label}
                onClick={() => handleNavClick(item)}
                className={cn(
                  'group flex items-center gap-3 px-3 py-2.5 rounded-[6px] text-sm font-medium transition-all duration-200 outline-none w-full relative',
                  active ? 'nav-active font-bold' : 'nav-inactive',
                  item.disabled && 'opacity-40 cursor-not-allowed'
                )}
                title={collapsed ? item.label : undefined}
              >
                <Icon
                  className={cn(
                    'h-[18px] w-[18px] shrink-0 transition-all duration-200',
                    active ? 'text-brand-teal' : 'text-[var(--text-secondary)] group-hover:text-brand-teal'
                  )}
                />

                {!collapsed && (
                  <span className="truncate flex-1 text-left">{item.label}</span>
                )}

                {!collapsed && item.disabled && (
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded-full">
                    soon
                  </span>
                )}
              </button>
            );
          })}

          <div className="my-3 border-t border-border shrink-0" />

          {filteredSecondaryNav.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <button
                key={item.label}
                onClick={() => handleNavClick(item)}
                className={cn(
                  'group flex items-center gap-3 px-3 py-2.5 rounded-[6px] text-sm font-medium transition-all duration-200 outline-none w-full',
                  active ? 'nav-active font-bold' : 'nav-inactive'
                )}
                title={collapsed ? item.label : undefined}
              >
                <Icon
                  className={cn(
                    'h-[18px] w-[18px] shrink-0 transition-colors',
                    active ? 'text-brand-teal' : 'text-[var(--text-secondary)] group-hover:text-brand-teal'
                  )}
                />
                {!collapsed && <span className="truncate flex-1 text-left">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-border p-3 shrink-0 bg-[var(--bg-surface)]">
          <div className="flex items-center gap-3">
            <Avatar name={currentUser?.name || 'User'} size="sm" glow={true} />
            {!collapsed && (
              <div className="flex-1 min-w-0 select-none">
                <div className="text-sm font-bold text-[var(--text-primary)] truncate leading-none">{currentUser?.name || 'Loading...'}</div>
                <div className="flex items-center gap-1 mt-1 text-[10px] text-brand-teal font-semibold tracking-wider uppercase leading-none">
                  <ShieldAlert className="h-3 w-3 shrink-0" /> {currentUser?.role || 'Admin'}
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[var(--sidebar-bg)] backdrop-blur-xl border-t border-border z-40 flex items-center justify-around px-2 select-none shadow-l1">
        {filteredPrimaryNav.slice(0, 4).map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;

          return (
            <button
              key={item.label}
              onClick={() => handleNavClick(item)}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full gap-0.5 outline-none transition-all duration-200',
                active ? 'text-brand-teal' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              )}
            >
              <div className={cn('p-1.5 rounded-lg transition-all', active && 'bg-brand-cyan/10')}>
                <Icon className="h-5 w-5" />
              </div>
              <span className={cn('text-[10px] tracking-wide font-semibold', active ? 'text-brand-teal' : 'text-[var(--text-secondary)]')}>
                {item.label.split(' ')[0]}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
