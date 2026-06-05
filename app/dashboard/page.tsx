'use client';

import React, { useEffect, useState } from 'react';
import { useStore } from '@/hooks/useStore';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { AdmissionsChart } from '@/components/dashboard/AdmissionsChart';
import { OccupancyDonut } from '@/components/dashboard/OccupancyDonut';
import { AppointmentQueue } from '@/components/dashboard/AppointmentQueue';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import {
  Users, CalendarCheck, Stethoscope, AlertTriangle, Star, Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AccessBanner } from '@/components/ui/AccessBanner';

export default function DashboardPage() {
  const { initializeStore, patients, doctors, appointments } = useStore();
  const [mounted, setMounted] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState('');
  const [currentUser, setCurrentUser] = useState<{ name: string; role: string } | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => { if (res.ok) return res.json(); throw new Error(''); })
      .then((data) => { if (data.user) setCurrentUser(data.user); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setLastSyncTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 60000);
    // Initialize immediately
    const now = new Date();
    setLastSyncTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    return () => clearInterval(interval);
  }, []);

  // Compute live statistics
  const activeAdmissions = patients.filter(p => p.status !== 'Discharged').length;

  const todayDateStr = new Date().toISOString().split('T')[0];
  const todayApts = appointments.filter(a => a.date === todayDateStr);
  const activeAptsCount = todayApts.filter(a => a.status === 'Scheduled' || a.status === 'Checked In' || a.status === 'In Progress').length;

  const availableDocs = doctors.filter(d => d.status === 'Available').length;
  const totalDocs = doctors.length;

  const criticalCases = patients.filter(p => p.status === 'Critical').length;

  // Top Performing Doctors list
  const topDoctors = React.useMemo(() => {
    return doctors
      .map(doc => {
        const docApts = appointments.filter(a => a.doctorId === doc.id);
        const patientsSeen = docApts.filter(a => a.status === 'Completed').length;
        
        // Calculate score out of 100 based on experience and rating
        const experienceScore = Math.min(doc.experience * 4, 40); // Max 40% based on experience
        const ratingScore = doc.rating * 12; // Max 60% based on rating
        const score = Math.round(experienceScore + ratingScore);
        
        return {
          id: doc.id,
          name: doc.name,
          specialty: doc.specialty,
          rating: doc.rating,
          patientsSeen,
          score: Math.min(score, 100),
        };
      })
      .sort((a, b) => b.patientsSeen - a.patientsSeen || b.score - a.score)
      .slice(0, 4);
  }, [doctors, appointments]);

  return (
    <PageWrapper>
      {/* ── Main Dashboard Content ── */}
      <div className="relative z-10 flex flex-col gap-6 animate-fade-in-up">

        {/* Page title header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/50 pb-5 shrink-0">
          <div>
            <h1 className="text-2xl font-black font-display tracking-tight text-foreground">Command Center</h1>
            <p className="text-xs text-foreground/45 mt-1 font-medium">Real-time hospital administrative and operational overview</p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Systems Operations Pill */}
            <span className="flex items-center gap-1.5 text-[10px] font-bold text-brand-green bg-brand-green/10 border border-brand-green/10 px-3 py-1 rounded-full glow-green select-none">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-green opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-green" />
              </span>
              All Systems Operational
            </span>
            <div className="text-[10px] text-foreground/40 font-semibold flex items-center gap-1">
              <Clock className="h-3 w-3 shrink-0 text-foreground/30" /> Last sync: {lastSyncTime}
            </div>
          </div>
        </div>

        {currentUser && (
          <AccessBanner
            role={currentUser.role}
            allowedRoles={['admin', 'doctor', 'nurse', 'receptionist', 'patient', 'pharmacist']}
            message={`Access Level: ${currentUser.role.toUpperCase()} — Full hospital operational dashboard access granted.`}
          />
        )}

        {/* 1. Hero Stats Row (4 animated KPI Cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
          <StatsCard
            title="Active Admissions"
            value={activeAdmissions}
            icon={<Users className="h-5 w-5" />}
            sublabel="↑ 12% from yesterday"
            variant="teal"
          />
          <StatsCard
            title="Active Appointments"
            value={activeAptsCount}
            icon={<CalendarCheck className="h-5 w-5" />}
            sublabel={`${todayApts.filter(a => a.status === 'Completed').length} consultations completed`}
            variant="amber"
          />
          <StatsCard
            title="Available Specialists"
            value={availableDocs}
            suffix={`/${totalDocs}`}
            icon={<Stethoscope className="h-5 w-5" />}
            sublabel={`${doctors.filter(d => d.status === 'In Surgery').length} currently in surgery`}
            variant="green"
          />
          <StatsCard
            title="Critical Cases"
            value={criticalCases}
            icon={<AlertTriangle className="h-5 w-5" />}
            sublabel="Requires nurse supervision"
            variant="red"
          />
        </div>

        {/* 2. Main Grid: Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 shrink-0">
          <div className="lg:col-span-3">
            <AdmissionsChart />
          </div>
          <div className="lg:col-span-2">
            <OccupancyDonut />
          </div>
        </div>

        {/* 3. Main Grid: Live Lists Section */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 shrink-0">
          <div className="lg:col-span-3">
            <AppointmentQueue />
          </div>
          <div className="lg:col-span-2">
            <ActivityFeed />
          </div>
        </div>

        {/* 4. Leaderboard & Quick Details Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 shrink-0">
          {/* Leaders Board */}
          <div className="lg:col-span-2 glass-card p-6 flex flex-col justify-between overflow-hidden relative">
            <div className="border-b border-border/50 pb-3 shrink-0 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-foreground">Top Performing Specialists</h3>
                <p className="text-[10px] text-foreground/45 mt-0.5 font-medium">Weekly patient feedback leaderboard</p>
              </div>
              <Badge variant="teal" className="text-[9px] uppercase font-extrabold py-0.5">This Week</Badge>
            </div>

            <div className="flex flex-col gap-4 mt-4">
              {topDoctors.map((doc, idx) => (
                <div key={doc.id} className="flex items-center gap-4 bg-brand-surface/60 border border-border p-3.5 rounded-xl hover:border-brand-teal/40 hover:bg-[#4F8CFF]/5 transition-all shadow-[0_2px_8px_rgba(79,140,255,0.03)]">
                  {/* Position number */}
                  <span className="font-mono text-base font-black text-foreground/20 w-4 select-none">
                    0{idx + 1}
                  </span>

                  {/* Avatar & Specialty */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <Avatar name={doc.name} size="sm" />
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-foreground truncate">{doc.name}</div>
                      <div className="text-[10px] text-foreground/45 truncate mt-0.5">{doc.specialty[0]}</div>
                    </div>
                  </div>

                  {/* Sparkline Bar / Progress indicator */}
                  <div className="hidden sm:flex flex-col gap-1 w-32 select-none">
                    <div className="flex items-center justify-between text-[10px] text-foreground/45 font-bold">
                      <span>Performance</span>
                      <span className="text-brand-teal font-extrabold">{doc.score}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-brand-muted rounded-full overflow-hidden border border-border">
                      <div
                        className="h-full bg-brand-teal rounded-full glow-teal transition-all duration-1000"
                        style={{ width: `${doc.score}%` }}
                      />
                    </div>
                  </div>

                  {/* Stats Counter */}
                  <div className="text-right select-none pl-3 shrink-0 border-l border-border/60">
                    <div className="text-sm font-black text-foreground">{doc.patientsSeen}</div>
                    <div className="text-[9px] text-foreground/45 font-bold uppercase tracking-wider mt-0.5">Seen</div>
                  </div>

                  {/* Rating Stars */}
                  <div className="hidden sm:flex items-center gap-1 text-brand-amber pl-3 shrink-0 border-l border-border/60 select-none">
                    <Star className="h-3.5 w-3.5 fill-current" />
                    <span className="text-xs font-bold text-foreground">{doc.rating}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Support / Hospital Metrics Stubs */}
          <div className="glass-card p-6 flex flex-col justify-between overflow-hidden relative">
            <div className="border-b border-border/50 pb-3 shrink-0">
              <h3 className="text-sm font-bold text-foreground">Operational Status</h3>
              <p className="text-[10px] text-foreground/45 mt-0.5 font-medium">Core hospital infrastructure status</p>
            </div>

            <div className="flex flex-col gap-3.5 mt-4">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-foreground/60">Pharmacy Dispensation</span>
                <Badge variant="teal">98.2% Accurate</Badge>
              </div>
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-foreground/60">Radiology Turnaround</span>
                <Badge variant="blue">45 Min Avg</Badge>
              </div>
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-foreground/60">Emergency Response</span>
                <Badge variant="amber">&lt; 4 Mins Response</Badge>
              </div>
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-foreground/60">Billing Dispatch</span>
                <Badge variant="lavender">99.9% Complete</Badge>
              </div>
              <div className="flex items-center justify-between text-xs font-semibold border-t border-border/50 pt-3">
                <span className="text-foreground/60">Maintenance Portal</span>
                <span className="flex items-center gap-1 text-[10px] text-brand-green font-bold uppercase">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-green animate-pulse" />
                  Idle
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </PageWrapper>
  );
}
