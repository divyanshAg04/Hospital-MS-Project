'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HeartPulse, Activity, Shield, ArrowRight, Users,
  Calendar, Stethoscope, FileText, Pill, CreditCard,
  Sparkles, Clock, ChevronRight, CheckCircle2,
  ExternalLink, Layers, Lock, ShieldCheck, Zap,
  MessageSquare, Star, Sun, Moon, Hospital, Heart,
  UploadCloud, Database, GraduationCap, ChevronDown,
  Brain, BarChart2, FileSpreadsheet, AppWindow, User
} from 'lucide-react';
import { useStore } from '@/hooks/useStore';

// Expandable FAQ Accordion Item Component
function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div
      onClick={() => setIsOpen(!isOpen)}
      className="bg-[var(--bg-surface)] border border-border hover:border-brand-cyan/20 rounded-2xl p-5 cursor-pointer transition-all duration-200 select-none flex flex-col gap-2"
    >
      <div className="flex items-center justify-between gap-4">
        <span className="text-xs sm:text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
          <span className="text-brand-cyan font-sans">🔹</span> {question}
        </span>
        <ChevronDown className={`h-4.5 w-4.5 text-[var(--text-secondary)] transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-medium pt-3 border-t border-border/40 mt-2">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function LandingPage() {
  const router = useRouter();
  const { theme, toggleTheme, initializeStore } = useStore();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'emr' | 'scheduling' | 'pharmacy' | 'billing'>('emr');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    initializeStore();
    fetch('/api/auth/me')
      .then((res) => { if (res.ok) return res.json(); throw new Error(''); })
      .then((data) => { if (data.user) setCurrentUser(data.user); })
      .catch(() => { });
  }, [initializeStore]);

  const solutions = {
    emr: {
      title: 'Electronic Medical Records (EMR)',
      description: 'Centralized, secure patient database with instant updates. Experience a truly digital clinical chart system built for speed.',
      metrics: ['100% HIPAA Compliant', 'Instant record lookup', 'Integrated lab results'],
      accent: '#0ea5e9'
    },
    scheduling: {
      title: 'Dynamic Appointment Queues',
      description: 'Streamlined specialist schedules with real-time occupancy status. Avoid overlapping appointments and optimize wait times.',
      metrics: ['Smart triage routing', 'SMS reminders', 'Live queue updates'],
      accent: '#f59e0b'
    },
    pharmacy: {
      title: 'Real-time Pharmacy & RX',
      description: 'Track medicine stock levels, record distribution logs, and dispatch prescriptions without paperwork overhead.',
      metrics: ['Auto low-stock alerts', 'Batch expiry tracking', 'E-prescription sync'],
      accent: '#10b981'
    },
    billing: {
      title: 'Consolidated Billing Hub',
      description: 'Transparent invoicing, direct payment actions, and granular invoices matching patient records exactly.',
      metrics: ['Automated PDF generation', 'One-click pay status', 'Granular audit logs'],
      accent: '#6366f1'
    }
  };

  const currentSol = solutions[activeTab];

  return (
    <div className="min-h-screen w-full bg-[var(--bg-base)] text-[var(--text-primary)] relative overflow-x-hidden font-sans transition-colors duration-150 selection:bg-brand-cyan/20">

      {/* ── Animated Background: Dual Radial Gradients + SVG Noise (Landing Page Only) ── */}
      <style>{`
        @keyframes slowDrift {
          0%   { background-position: 0% 0%,   100% 100%, 0 0; }
          50%  { background-position: 50% 30%,  30% 70%,  0 0; }
          100% { background-position: 100% 100%, 0% 0%,   0 0; }
        }
        @keyframes floatOrb1 {
          0%   { transform: translate(0px, 0px) scale(1); }
          33%  { transform: translate(15px, -15px) scale(1.05); }
          66%  { transform: translate(-10px, 10px) scale(0.97); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes floatOrb2 {
          0%   { transform: translate(0px, 0px) scale(1); }
          50%  { transform: translate(-20px, 15px) scale(0.95); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes floatOrb3 {
          0%   { transform: translate(0px, 0px) scale(1); }
          33%  { transform: translate(-10px, -15px) scale(1.03); }
          66%  { transform: translate(15px, 5px) scale(0.98); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .landing-bg {
          animation: slowDrift 40s infinite alternate ease-in-out;
        }
      `}</style>
      <div
        className="landing-bg"
        style={{
          position: 'fixed',
          inset: '-50%',
          zIndex: 0,
          pointerEvents: 'none',
          backgroundImage: `
            radial-gradient(circle at 20% 20%, #00C4FF, transparent 50%),
            radial-gradient(circle at 80% 80%, #8B6FFF, transparent 50%),
            url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")
          `,
          backgroundBlendMode: 'overlay',
          backgroundSize: '200% 200%, 200% 200%, 150px 150px',
          opacity: 0.15,
        }}
      />

      {/* Small Floating Blurry Orbs — identical across dark and light modes */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div
          className="absolute rounded-full bg-[#00C4FF] blur-[60px]"
          style={{
            width: '200px',
            height: '200px',
            top: '5%',
            left: '-6%',
            animation: 'floatOrb1 38s infinite ease-in-out',
            opacity: 0.15,
          }}
        />
        <div
          className="absolute rounded-full bg-[#8B6FFF] blur-[70px]"
          style={{
            width: '240px',
            height: '240px',
            bottom: '10%',
            right: '-8%',
            animation: 'floatOrb2 45s infinite ease-in-out',
            opacity: 0.14,
          }}
        />
        <div
          className="absolute rounded-full bg-[#00D98B] blur-[55px]"
          style={{
            width: '180px',
            height: '180px',
            bottom: '-6%',
            left: '10%',
            animation: 'floatOrb3 42s infinite ease-in-out',
            opacity: 0.12,
          }}
        />
      </div>

      {/* ── Login Modal ── */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] flex items-center justify-center"
            onClick={() => setShowModal(false)}
          >
            <div className="absolute inset-0 bg-[var(--bg-base)]/70 backdrop-blur-md" />

            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="relative z-10 bg-[var(--bg-surface)] border border-border rounded-2xl shadow-l3 p-8 max-w-sm w-full mx-4 flex flex-col gap-5 text-center overflow-hidden"
            >
              <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-[#6366f1] via-[#0ea5e9] to-[#10b981]" />

              {/* X Close Button */}
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-3 right-3 flex items-center justify-center h-7 w-7 rounded-lg bg-[var(--bg-hover)] hover:bg-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all outline-none"
                aria-label="Close"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>

              <div className="flex items-center justify-center mx-auto h-14 w-14 rounded-2xl bg-gradient-to-br from-brand-cyan/15 to-brand-lavender/10 border border-brand-cyan/20">
                <HeartPulse className="h-7 w-7 text-brand-cyan" />
              </div>

              <div className="flex flex-col gap-2">
                <h2 className="text-xl font-black font-display text-[var(--text-primary)] tracking-tight">Login to explore the portal</h2>
                <p className="text-xs text-[var(--text-secondary)] font-medium leading-relaxed">
                  Access the full MedCore administrative suite — clinical records, billing dispatch, pharmacy logs, and live patient queues.
                </p>
              </div>

              <div className="flex flex-col gap-2.5 mt-1">
                <button
                  onClick={() => router.push('/login')}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-gradient-primary hover:opacity-95 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-btn transition-all outline-none"
                >
                  Login to MedCore <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="w-full px-5 py-2.5 bg-transparent border border-border hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] rounded-xl text-xs font-bold transition-all outline-none"
                >
                  Back to Landing Page
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Global Top Border ── */}
      <div className="fixed top-0 inset-x-0 h-[3px] bg-gradient-to-r from-[#6366f1] via-[#0ea5e9] to-[#10b981] z-50 pointer-events-none" />

      {/* ── Header Navbar ── */}
      <header className="sticky top-0 z-40 w-full bg-[var(--bg-overlay)] backdrop-blur-md border-b border-border/80 transition-all select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => router.push('/')}>
            <span className="text-xl">🏥</span>
            <span className="font-display text-lg font-black tracking-wider bg-gradient-to-r from-brand-cyan via-brand-lavender to-brand-cyan bg-clip-text text-transparent">
              MedCore
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
            <a href="#features" className="hover:text-brand-cyan transition-colors">Features</a>
            <a href="#solutions" className="hover:text-brand-cyan transition-colors">Solutions</a>
            <a href="#testimonials" className="hover:text-brand-cyan transition-colors">Testimonials</a>
            <a href="#stats" className="hover:text-brand-cyan transition-colors">Impact</a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="flex items-center justify-center h-9 w-9 rounded-lg border border-border bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] transition-all outline-none"
            >
              {theme === 'dark' ? <Sun className="h-4.5 w-4.5 text-amber-500" /> : <Moon className="h-4.5 w-4.5 text-slate-500" />}
            </button>

            <button
              onClick={() => router.push('/login')}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-primary hover:opacity-90 text-white rounded-lg text-xs font-bold uppercase tracking-wider shadow-btn transition-all outline-none"
            >
              {currentUser ? 'Enter Portal' : 'Login'} <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* ── Hero Section ── */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 select-none">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          {/* Hero Left Content */}
          <div className="lg:col-span-7 flex flex-col gap-6 text-left">
            <div className="inline-flex self-start items-center gap-1.5 px-3 py-1 rounded-full border border-brand-cyan/20 bg-brand-cyan/5 text-brand-cyan text-[10px] font-black uppercase tracking-widest glow-cyan">
              <Activity className="h-3.5 w-3.5" /> TRUSTED BY 250+ HOSPITALS
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black font-display tracking-tight text-[var(--text-primary)] leading-tight">
              Streamline hospital operations & elevate patient care
            </h1>

            <p className="text-sm sm:text-base text-[var(--text-secondary)] font-medium leading-relaxed max-w-xl">
              From check-in to discharge, MedCore brings clinical charts, appointment scheduling, pharmacy, and billing together with zero-latency sync and enterprise security.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3.5 mt-2">
              <button
                onClick={() => setShowModal(true)}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-primary hover:opacity-95 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-btn transition-all outline-none"
              >
                Access Portal <ArrowRight className="h-4 w-4" />
              </button>
              <a
                href="#solutions"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)] border border-border text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-xl text-xs font-black uppercase tracking-widest transition-all"
              >
                See Features
              </a>
            </div>

            {/* Direct Hero Stats */}
            <div className="flex flex-wrap gap-8 mt-6 border-t border-border/40 pt-6">
              <div className="flex flex-col">
                <span className="text-2xl font-black text-brand-cyan">28</span>
                <span className="text-[10px] uppercase font-bold text-[var(--text-secondary)] tracking-wider">Active Admissions</span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black text-brand-cyan">45</span>
                <span className="text-[10px] uppercase font-bold text-[var(--text-secondary)] tracking-wider">Today's Consults</span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black text-brand-cyan">99.99%</span>
                <span className="text-[10px] uppercase font-bold text-[var(--text-secondary)] tracking-wider">Platform Uptime</span>
              </div>
            </div>
          </div>

          {/* Hero Right Demo Card */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="bg-[var(--bg-surface)] border border-border/80 rounded-3xl p-6 shadow-l2 relative overflow-hidden group hover:border-brand-cyan/25 transition-all duration-300 w-full max-w-md">
              <div className="flex justify-between items-center pb-3 border-b border-border/50">
                <div className="flex items-center gap-2">
                  <User className="h-4.5 w-4.5 text-brand-cyan" />
                  <span className="text-xs font-bold text-[var(--text-primary)]">
                    <strong>Alexander Mercer</strong> | Checked In
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[9.5px] font-extrabold uppercase tracking-wider bg-red-500/10 border border-red-500/25 text-red-500 animate-pulse">
                  EMR ACTIVE
                </span>
              </div>
              <div className="flex flex-col gap-3.5 py-5 text-xs text-[var(--text-secondary)] font-medium">
                <div className="flex items-center gap-2.5">
                  <Shield className="h-4.5 w-4.5 text-brand-teal shrink-0" />
                  <span>100% HIPAA Compliant • Instant record lookup</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Activity className="h-4.5 w-4.5 text-brand-teal shrink-0" />
                  <span>Integrated lab results • Audit trail ready</span>
                </div>
              </div>
              <hr className="border-border/50 pb-3" />
              <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-primary)]">
                <ShieldCheck className="h-4.5 w-4.5 text-brand-cyan shrink-0" />
                <span>Enterprise Operations Control – zero latency sync</span>
              </div>
            </div>
          </div>

        </div>
      </section>



      {/* ── Key Metrics / Stats Section ── */}
      <section id="stats" className="border-y border-border/80 bg-[var(--bg-surface)] py-12 relative z-10 select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {[
              { number: '28', label: 'Active Admissions', desc: 'Real-time occupancy' },
              { number: '45', label: 'Today\'s Consultations', desc: 'Outpatient visits' },
              { number: '14/19', label: 'Availability Ratio', desc: 'Specialist slots remaining' },
              { number: '04', label: 'Critical Cases', desc: 'Emergency priority' },
              { number: '99.99%', label: 'Platform Uptime SLA', desc: 'Secure cloud hosting' },
              { number: '15M+', label: 'Records Synced', desc: 'Zero data discrepancies' },
              { number: '250+', label: 'Healthcare Hubs', desc: 'Global deployment reach' },
              { number: '< 4 Mins', label: 'Emergency Response Log', desc: 'Optimized triage routing' }
            ].map((stat, idx) => (
              <div key={idx} className="flex flex-col gap-1.5">
                <span className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-brand-cyan to-brand-lavender bg-clip-text text-transparent">{stat.number}</span>
                <span className="text-xs font-bold text-[var(--text-primary)]">{stat.label}</span>
                <span className="text-[10px] text-[var(--text-muted)] font-semibold">{stat.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Core Solution Slider/Tabs ── */}
      <section id="solutions" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10 select-none">
        <div className="text-center max-w-xl mx-auto flex flex-col gap-3">
          <h2 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-[var(--text-primary)]">Clinical Modules Crafted for Excellence</h2>
          <p className="text-xs text-[var(--text-secondary)] font-medium">Click each operational category below to preview how our administrative solution keeps operations organized.</p>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-10">
          {[
            { id: 'emr', label: 'EMR Records', icon: FileText },
            { id: 'scheduling', label: 'Appointments', icon: Calendar },
            { id: 'pharmacy', label: 'Pharmacy Logs', icon: Pill },
            { id: 'billing', label: 'Billing Dispatch', icon: CreditCard }
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all duration-200 outline-none ${active
                  ? 'bg-gradient-primary text-white border-transparent shadow-btn'
                  : 'bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)] border-border text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
              >
                <Icon className="h-4.5 w-4.5" /> {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content Display */}
        <div className="mt-8 max-w-4xl mx-auto bg-[var(--bg-surface)] border border-border/80 rounded-2xl p-6 sm:p-10 shadow-l2 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 rounded-full filter blur-3xl opacity-10" style={{ background: currentSol.accent }} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="flex flex-col gap-4 text-left">
              <h3 className="text-xl font-black text-[var(--text-primary)]">{currentSol.title}</h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-medium">{currentSol.description}</p>

              <div className="flex flex-col gap-2 mt-2">
                {currentSol.metrics.map((m, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs font-bold text-[var(--text-primary)]">
                    <CheckCircle2 className="h-4 w-4 shrink-0" style={{ color: currentSol.accent }} />
                    <span>{m}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[var(--bg-base)] border border-border rounded-xl p-5 flex flex-col gap-4 select-none relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-border/50 pb-2">
                <span className="text-[10px] font-bold text-[var(--text-muted)] tracking-wider">PREVIEW MODULE</span>
                <span className="h-2 w-2 rounded-full animate-ping" style={{ backgroundColor: currentSol.accent }} />
              </div>

              {activeTab === 'emr' && (
                <div className="flex flex-col gap-2.5 text-left">
                  <div className="p-3 bg-[var(--bg-surface)] border border-border rounded-lg">
                    <span className="text-[9px] font-bold text-[var(--text-muted)]">PATIENT CASE FILE</span>
                    <span className="text-xs font-bold text-[var(--text-primary)] block mt-0.5">Alexander Mercer</span>
                    <span className="text-[10px] text-brand-teal font-medium mt-1 block">Status: Checked In</span>
                  </div>
                  <div className="h-6 w-full bg-border/50 rounded" />
                  <div className="h-6 w-3/4 bg-border/50 rounded" />
                </div>
              )}

              {activeTab === 'scheduling' && (
                <div className="flex flex-col gap-2.5 text-left">
                  <div className="flex items-center justify-between p-3 bg-[var(--bg-surface)] border border-border rounded-lg">
                    <div>
                      <span className="text-[9px] font-bold text-[var(--text-muted)]">NEXT UP (OPD QUEUE)</span>
                      <span className="text-xs font-bold text-[var(--text-primary)] block mt-0.5">Dr. Sarah Jenkins</span>
                    </div>
                    <span className="px-2 py-0.5 bg-amber-500/10 text-amber-500 text-[9px] font-extrabold rounded">10 mins left</span>
                  </div>
                  <div className="h-6 w-full bg-border/50 rounded animate-pulse" />
                </div>
              )}

              {activeTab === 'pharmacy' && (
                <div className="flex flex-col gap-2.5 text-left">
                  <div className="p-3 bg-[var(--bg-surface)] border border-border rounded-lg flex items-center justify-between">
                    <div>
                      <span className="text-[9px] font-bold text-[var(--text-muted)]">INVENTORY DISPATCH</span>
                      <span className="text-xs font-bold text-[var(--text-primary)] block mt-0.5">Amoxicillin 500mg</span>
                    </div>
                    <span className="text-brand-green text-xs font-black">200 Units</span>
                  </div>
                  <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
                    <div className="h-full bg-brand-green" style={{ width: '85%' }} />
                  </div>
                </div>
              )}

              {activeTab === 'billing' && (
                <div className="flex flex-col gap-2.5 text-left">
                  <div className="p-3 bg-[var(--bg-surface)] border border-border rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-bold text-[var(--text-muted)]">INVOICE #MC-8283</span>
                      <span className="px-2 py-0.5 bg-brand-cyan/15 text-brand-cyan text-[8px] font-black rounded-full">SENT</span>
                    </div>
                    <span className="text-xs font-black text-[var(--text-primary)] block mt-1">Total: $425.00</span>
                  </div>
                  <div className="h-6 w-full bg-border/50 rounded" />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Enterprise Operations Control Section ── */}
      <section id="features" className="bg-[var(--bg-surface)] py-20 relative z-10 select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center max-w-xl mx-auto flex flex-col gap-3">
            <h2 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-[var(--text-primary)]">Enterprise Operations Control</h2>
            <p className="text-xs text-[var(--text-secondary)] font-medium">MedCore brings institutional safety guidelines, audit checks, and high productivity tools under one canopy.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            {[
              {
                icon: ShieldCheck,
                title: 'High-Level Security',
                desc: 'Consolidated logs, auto session-expiries, and granular role assignments protecting sensitive clinical data.'
              },
              {
                icon: Zap,
                title: 'Zero Latency Sync',
                desc: 'Websockets and cache optimization keep doctor queues and occupancy records matched instantly.'
              },
              {
                icon: Layers,
                title: 'Consolidated Auditing',
                desc: 'A permanent tracking log is kept for medicine releases, consult changes, and dispatcher billing.'
              }
            ].map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="bg-[var(--bg-surface)] border border-border/80 p-6 rounded-2xl shadow-l2 flex flex-col gap-3 hover:-translate-y-1 hover:border-brand-cyan/20 transition-all duration-300">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-brand-cyan/15 to-brand-lavender/10 text-brand-cyan w-fit">
                    <Icon className="h-5.5 w-5.5" />
                  </div>
                  <h3 className="text-sm font-bold text-[var(--text-primary)] mt-1">{f.title}</h3>
                  <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed font-medium">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── How MedCore Works Section ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10 select-none">
        <div className="text-center max-w-xl mx-auto flex flex-col gap-3">
          <h2 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-[var(--text-primary)]">
            How MedCore Works
          </h2>
          <p className="text-xs text-[var(--text-secondary)] font-medium">
            From deployment to daily operations – integrated in days, not months.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          {[
            {
              step: '1',
              icon: UploadCloud,
              title: '1. Deploy Cloud',
              desc: 'One-click provisioning, role-based access, and HIPAA-ready environment.'
            },
            {
              step: '2',
              icon: Database,
              title: '2. Sync Records',
              desc: 'Migrate EMR, pharmacy, and billing data with zero downtime.'
            },
            {
              step: '3',
              icon: GraduationCap,
              title: '3. Train & Go Live',
              desc: 'Onboarding checklists, 24/7 support, and real-time analytics dashboard.'
            }
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} className="bg-[var(--bg-surface)] border border-border/80 p-6 rounded-2xl shadow-l2 text-center flex flex-col items-center gap-4 relative overflow-hidden group hover:-translate-y-1 hover:border-brand-cyan/20 transition-all duration-300">
                <div className="absolute top-3 right-4 text-4xl font-black text-border/10 select-none">
                  {item.step}
                </div>
                <div className="p-3.5 rounded-full bg-brand-cyan/10 border border-brand-cyan/20 text-brand-cyan">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-sm font-bold text-[var(--text-primary)]">{item.title}</h3>
                <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed font-medium max-w-xs">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Seamless Integrations Ecosystem Section ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10 select-none">
        <div className="bg-[var(--bg-surface)] border border-border/80 rounded-3xl p-8 text-center flex flex-col gap-6 shadow-l2 hover:border-brand-cyan/20 transition-all duration-300">
          <h3 className="text-lg font-bold text-[var(--text-primary)] tracking-tight">Seamless Integrations</h3>
          <div className="flex flex-wrap justify-center items-center gap-x-10 gap-y-4 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
            <span className="flex items-center gap-2"><AppWindow className="h-4.5 w-4.5 text-brand-cyan shrink-0" /> MS Health</span>
            <span className="flex items-center gap-2"><BarChart2 className="h-4.5 w-4.5 text-brand-cyan shrink-0" /> Tableau</span>
            <span className="flex items-center gap-2"><FileSpreadsheet className="h-4.5 w-4.5 text-brand-cyan shrink-0" /> Epic Systems</span>
            <span className="flex items-center gap-2"><CreditCard className="h-4.5 w-4.5 text-brand-cyan shrink-0" /> Stripe Connect</span>
            <span className="flex items-center gap-2"><Brain className="h-4.5 w-4.5 text-brand-cyan shrink-0" /> AI Triage</span>
          </div>
        </div>
      </section>

      {/* ── Testimonials Section ── */}
      <section id="testimonials" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10 select-none">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
          <div className="text-left flex flex-col gap-2">
            <h2 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-[var(--text-primary)]">
              Trusted by Leading Administrators
            </h2>
            <p className="text-xs text-[var(--text-secondary)] font-medium">
              MedCore transforms how hospital chains manage day-to-day coordination logs.
            </p>
          </div>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[
            {
              quote: 'MedCore consolidated our patient records and pharmacy pipelines perfectly. The zero latency syncing saved our triage center over 15 hours per week in redundant checks.',
              author: 'Dr. Evelyn Martinez',
              role: 'CMO, Memorial Health'
            },
            {
              quote: 'The consolidated billing features combined with patient access portals are phenomenal. It gave patients absolute transparency over their invoices while streamlining receptionist duties.',
              author: 'Marcus Vance',
              role: 'Operations Director, CareBridge Hospitals'
            },
            {
              quote: 'Real-time dashboard and audit-ready logs reduced our compliance overhead by 40%. MedCore is a game-changer for multi-site hospital chains.',
              author: 'Dr. Sarah Chen',
              role: 'Chief of Staff, Pacific Health'
            }
          ].map((t, idx) => (
            <div key={idx} className="bg-[var(--bg-surface)] border border-border/80 p-6 rounded-2xl shadow-l2 flex flex-col justify-between gap-4 text-left hover:-translate-y-1 hover:border-brand-cyan/20 transition-all duration-300">
              <div className="flex gap-1 text-brand-amber">
                {[...Array(5)].map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-current" />)}
              </div>
              <p className="text-xs italic text-[var(--text-secondary)] leading-relaxed font-medium">"{t.quote}"</p>
              <div className="border-t border-border/50 pt-3 mt-1">
                <span className="text-xs font-bold text-[var(--text-primary)] block">{t.author}</span>
                <span className="text-[10px] text-[var(--text-muted)] font-semibold mt-0.5 block">{t.role}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Frequently Asked Questions (FAQ) Section ── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10 select-none">
        <div className="text-center max-w-xl mx-auto flex flex-col gap-3 mb-12">
          <h2 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-[var(--text-primary)]">
            Frequently Asked Questions
          </h2>
          <p className="text-xs text-[var(--text-secondary)] font-medium">
            Everything you need to know about integrating MedCore in your facility.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {[
            {
              q: 'Is MedCore HIPAA and GDPR compliant?',
              a: 'Yes, we maintain full HIPAA, GDPR, and SOC2 Type II compliance with annual third-party audits.'
            },
            {
              q: 'Can we integrate existing EHR systems?',
              a: 'Absolutely. MedCore provides APIs and bulk migration tools to sync with Epic, Cerner, and other major EHRs.'
            },
            {
              q: 'What is the average deployment time?',
              a: 'Cloud deployment takes 2–4 weeks; custom enterprise solutions can be rolled out within 8 weeks.'
            },
            {
              q: 'Do you offer 24/7 support?',
              a: 'Yes, enterprise plans include 24/7/365 support with a 15-minute SLA for critical issues.'
            }
          ].map((faq, i) => (
            <FAQItem key={i} question={faq.q} answer={faq.a} />
          ))}
        </div>
      </section>

      {/* ── Footer Banner CTA ── */}
      <section className="bg-gradient-to-r from-brand-cyan/10 to-brand-lavender/5 border-y border-border py-16 relative z-10 text-center select-none">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-6">
          <h2 className="text-2xl sm:text-3xl font-black font-display text-[var(--text-primary)]">Revolutionize Your Medical Administrative Console</h2>
          <p className="text-xs text-[var(--text-secondary)] max-w-xl mx-auto font-medium">
            Contact our systems integration team today for cloud deployment options, custom role definitions, and onboarding checklists.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="self-center flex items-center gap-2 px-6 py-3.5 bg-gradient-primary hover:opacity-95 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-btn transition-all outline-none"
          >
            Launch Medical Portal <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-[var(--bg-surface)] py-12 relative z-10 border-t border-border/80 select-none text-xs text-[var(--text-secondary)] font-medium">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pb-10 border-b border-border/50 text-left">
            <div className="flex flex-col gap-3">
              <strong className="text-[var(--text-primary)] uppercase tracking-wider text-[10px]">MedCore</strong>
              <a href="#features" className="hover:text-brand-cyan transition-colors">Features</a>
              <a href="#solutions" className="hover:text-brand-cyan transition-colors">Solutions</a>
              <a href="#testimonials" className="hover:text-brand-cyan transition-colors">Testimonials</a>
              <a href="#stats" className="hover:text-brand-cyan transition-colors">Impact</a>
            </div>
            <div className="flex flex-col gap-3">
              <strong className="text-[var(--text-primary)] uppercase tracking-wider text-[10px]">Support</strong>
              <a href="mailto:divyanshagrawal536@gmail.com" className="hover:text-brand-cyan transition-colors text-[var(--text-secondary)] break-all">divyanshagrawal536@gmail.com</a>
              <span className="text-[var(--text-muted)]">+1 (888) 422-3324</span>
              <span className="hover:text-brand-cyan cursor-pointer transition-colors">Documentation</span>
              <span className="hover:text-brand-cyan cursor-pointer transition-colors">Status</span>
            </div>
            <div className="flex flex-col gap-3">
              <strong className="text-[var(--text-primary)] uppercase tracking-wider text-[10px]">Legal</strong>
              <span className="hover:text-brand-cyan cursor-pointer transition-colors">Privacy Policy</span>
              <span className="hover:text-brand-cyan cursor-pointer transition-colors">Terms of Service</span>
              <span className="hover:text-brand-cyan cursor-pointer transition-colors">Compliance</span>
              <span className="hover:text-brand-cyan cursor-pointer transition-colors">Security</span>
            </div>
            <div className="flex flex-col gap-3">
              <strong className="text-[var(--text-primary)] uppercase tracking-wider text-[10px]">Social</strong>
              <a href="https://www.linkedin.com/in/divyansh-agrawal04/" target="_blank" rel="noopener noreferrer" className="hover:text-brand-cyan transition-colors">LinkedIn</a>
              <span className="hover:text-brand-cyan cursor-pointer transition-colors">Twitter</span>
              <a href="https://github.com/divyanshAg04" target="_blank" rel="noopener noreferrer" className="hover:text-brand-cyan transition-colors">GitHub</a>
            </div>
          </div>

          <div className="flex flex-col items-center gap-6 mt-8">


            <p className="text-center text-[10px] text-[var(--text-muted)]">
              © {new Date().getFullYear()} MedCore Inc. — Consolidated Hospital Management & Operations Suite. All rights reserved.
            </p>
          </div>

        </div>
      </footer>

    </div>
  );
}
