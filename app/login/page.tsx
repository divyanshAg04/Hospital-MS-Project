'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/hooks/useStore';
import {
  Shield, Mail, Lock, User, UserPlus, LogIn,
  Eye, EyeOff, Loader2, ArrowRight, HeartPulse, Users,
  Sun, Moon
} from 'lucide-react';

type Tab = 'login' | 'register';
type Role = 'admin' | 'doctor' | 'nurse' | 'receptionist' | 'patient' | 'pharmacist';

function LoginContent() {
  const [activeTab, setActiveTab] = useState<Tab>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<Role>('patient');

  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToast, theme, toggleTheme, initializeStore } = useStore();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  useEffect(() => {
    initializeStore();
  }, [initializeStore]);

  useEffect(() => { setErrorMsg(null); }, [activeTab]);

  const validateForm = () => {
    if (!email || !email.includes('@')) { setErrorMsg('Please enter a valid email address.'); return false; }
    if (!password || password.length < 6) { setErrorMsg('Password must be at least 6 characters.'); return false; }
    if (activeTab === 'register' && !name) { setErrorMsg('Please enter your full name.'); return false; }
    setErrorMsg(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    setErrorMsg(null);
    const endpoint = activeTab === 'login' ? '/api/auth/login' : '/api/auth/register';
    const payload = activeTab === 'login' ? { email, password } : { name, email, password, role };
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong.');
      if (activeTab === 'login') {
        addToast('Welcome to MedCore Command Center!', 'success');
        router.push(callbackUrl);
        router.refresh();
      } else {
        addToast('Account created! Please sign in.', 'success');
        setName(''); setPassword(''); setActiveTab('login');
      }
    } catch (err: any) {
      setErrorMsg(err.message);
      addToast(err.message, 'error');
    } finally { setLoading(false); }
  };

  const inputClass = "w-full pl-10 pr-4 py-3 bg-[var(--bg-base)] border border-border hover:border-brand-teal focus:border-brand-teal focus:ring-1 focus:ring-brand-teal/20 rounded-xl text-sm font-semibold text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none transition-all duration-200 shadow-sm";

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative bg-[var(--bg-base)] px-4 py-12 select-none overflow-hidden font-sans transition-colors duration-150">

      {/* Theme Toggle Button */}
      <div className="absolute top-4 right-4 z-20">
        <button
          onClick={toggleTheme}
          type="button"
          className="flex items-center justify-center h-10 w-10 rounded-xl border border-border bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-brand-teal transition-all outline-none"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? (
            <Sun className="h-5 w-5 text-amber-500" />
          ) : (
            <Moon className="h-5 w-5 text-slate-500" />
          )}
        </button>
      </div>

      {/* ── Floating Orbs Background ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {/* Orb 1: Cyan/Teal (Top Left) */}
        <motion.div
          animate={{
            x: [0, 40, -20, 30, 0],
            y: [0, -60, 40, -30, 0],
            scale: [1, 1.1, 0.95, 1.05, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
          className="absolute -top-20 -left-20 w-80 h-80 md:w-[450px] md:h-[450px] rounded-full"
          style={{
            background: 'radial-gradient(circle, var(--accent-cyan) 0%, var(--accent-violet) 40%, transparent 70%)',
            opacity: theme === 'dark' ? 0.28 : 0.35,
          }}
        />

        {/* Orb 2: Lavender/Red (Bottom Right) */}
        <motion.div
          animate={{
            x: [0, -50, 30, -20, 0],
            y: [0, 70, -40, 50, 0],
            scale: [1, 0.95, 1.1, 0.9, 1],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
          className="absolute -bottom-20 -right-20 w-80 h-80 md:w-[480px] md:h-[480px] rounded-full"
          style={{
            background: 'radial-gradient(circle, var(--accent-violet) 0%, var(--accent-cyan) 40%, transparent 70%)',
            opacity: theme === 'dark' ? 0.30 : 0.38,
          }}
        />

        {/* Orb 3: Teal/Cyan (Middle Left-Center) */}
        <motion.div
          animate={{
            x: [0, 60, -30, 40, 0],
            y: [0, 40, -50, 30, 0],
            scale: [1, 1.05, 0.9, 1.1, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
          className="absolute top-[35%] -left-10 w-72 h-72 md:w-[350px] md:h-[350px] rounded-full"
          style={{
            background: 'radial-gradient(circle, var(--brand-teal) 0%, var(--accent-cyan) 40%, transparent 70%)',
            opacity: theme === 'dark' ? 0.24 : 0.30,
          }}
        />

        {/* Orb 4: Lavender/Cyan (Top Right-Center) */}
        <motion.div
          animate={{
            x: [0, -30, 40, -40, 0],
            y: [0, -50, 60, -30, 0],
            scale: [1, 1.1, 0.95, 1.05, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
          className="absolute top-[10%] right-[15%] w-64 h-64 md:w-[400px] md:h-[400px] rounded-full"
          style={{
            background: 'radial-gradient(circle, var(--accent-violet) 0%, var(--accent-amber) 40%, transparent 70%)',
            opacity: theme === 'dark' ? 0.26 : 0.32,
          }}
        />

        {/* Orb 5: Amber/Cyan (Bottom Left-Center) */}
        <motion.div
          animate={{
            x: [0, 50, -40, 20, 0],
            y: [0, -30, 40, -50, 0],
            scale: [1, 0.9, 1.1, 0.95, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
          className="absolute bottom-[15%] left-[20%] w-60 h-60 md:w-[300px] md:h-[300px] rounded-full"
          style={{
            background: 'radial-gradient(circle, var(--accent-amber) 0%, var(--accent-cyan) 40%, transparent 70%)',
            opacity: theme === 'dark' ? 0.20 : 0.26,
          }}
        />
      </div>

      {/* Subtle dot grid */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, var(--border-strong) 1px, transparent 0)', backgroundSize: '28px 28px' }}
      />

      <div className="w-full max-w-md z-10">

        {/* Brand Header — click to go back to landing page */}
        <div className="text-center mb-8">
          <button
            type="button"
            onClick={() => router.push('/')}
            className="inline-flex flex-col items-center gap-1 group outline-none cursor-pointer"
            title="Back to Landing Page"
          >
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-brand-cyan to-brand-lavender text-white shadow-[0_8px_24px_rgba(0,196,255,0.3)] mb-4 relative group-hover:scale-105 transition-transform duration-200">
              <HeartPulse className="h-8 w-8 stroke-[2] group-hover:scale-110 transition-transform duration-300" />
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-brand-cyan to-brand-lavender opacity-20 blur-md group-hover:opacity-35 transition-opacity pointer-events-none" />
            </div>
            <h1 className="text-3xl font-black font-display tracking-tight group-hover:opacity-80 transition-opacity">
              <span className="text-[var(--text-primary)]">MED</span>
              <span className="bg-gradient-to-r from-brand-cyan to-brand-lavender bg-clip-text text-transparent">CORE</span>
            </h1>
            <p className="text-xs text-[var(--text-secondary)] mt-1.5 font-semibold tracking-wide uppercase group-hover:text-brand-cyan transition-colors">
              Hospital Operations Control Center
            </p>
          </button>
        </div>

        {/* Auth Card */}
        <div className="glass-card w-full max-w-md border border-border rounded-3xl p-7 shadow-l2 relative overflow-hidden">

          {/* Top gradient line */}
          <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-brand-cyan via-brand-lavender to-brand-cyan" />

          {/* Tab switcher */}
          <div className="flex bg-[var(--bg-base)] border border-border p-1.5 rounded-2xl mb-7 relative select-none">
            {(['login', 'register'] as Tab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs md:text-sm font-bold rounded-xl relative transition-all duration-300 ${activeTab === tab ? 'text-white' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
              >
                {activeTab === tab && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-r from-brand-cyan to-brand-lavender rounded-xl shadow-[0_4px_14px_rgba(0,196,255,0.25)]"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">
                  {tab === 'login' ? <LogIn className="h-4 w-4 inline mr-1.5" /> : <UserPlus className="h-4 w-4 inline mr-1.5" />}
                  {tab === 'login' ? 'Sign In' : 'Register'}
                </span>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Error */}
            <AnimatePresence mode="wait">
              {errorMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  className="bg-brand-red/5 border border-brand-red/20 text-brand-red rounded-2xl p-3.5 text-xs font-semibold flex items-center gap-2.5"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-red animate-ping flex-shrink-0" />
                  {errorMsg}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Name (register only) */}
            <AnimatePresence mode="popLayout">
              {activeTab === 'register' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-1.5">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
                    <input type="text" placeholder="Patient Name" value={name} onChange={e => setName(e.target.value)} disabled={loading} className={inputClass} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email */}
            <div>
              <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
                <input type="email" placeholder="patient@gmail.com" value={email} onChange={e => setEmail(e.target.value)} disabled={loading} required className={inputClass} />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password} onChange={e => setPassword(e.target.value)}
                  disabled={loading} required
                  className={inputClass + ' pr-10'}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} disabled={loading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-secondary)] outline-none transition-colors">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Role selector (register only) */}
            <AnimatePresence mode="popLayout">
              {activeTab === 'register' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.22 }}
                  className="overflow-hidden"
                >
                  <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-2">Access Role</label>
                  <div className="flex">
                    {[
                      { id: 'patient', label: 'Patient', icon: Users },
                    ].map(({ id, label, icon: Icon }) => {
                      const active = role === id;
                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => setRole(id as Role)}
                          disabled={loading}
                          className={`flex w-full items-center justify-center gap-2.5 p-3 rounded-2xl border text-xs font-bold transition-all outline-none ${
                            active
                              ? 'bg-brand-teal/10 border-brand-teal text-brand-teal shadow-[0_2px_12px_rgba(0,196,255,0.12)]'
                              : 'bg-[var(--bg-base)] border-border text-[var(--text-secondary)] hover:border-brand-teal/30 hover:text-brand-teal hover:bg-[var(--bg-hover)]'
                          }`}
                        >
                          <Icon className={`h-4 w-4 ${active ? 'text-brand-teal' : 'text-[var(--text-muted)]'}`} />
                          <span>{label}</span>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Forgot password */}
            {activeTab === 'login' && (
              <div className="flex justify-end -mt-1">
                <button type="button"
                  onClick={() => addToast('Password recovery is managed by MedCore IT support.', 'info')}
                  className="text-[11px] text-[var(--text-muted)] hover:text-brand-teal font-semibold transition-colors duration-200">
                  Forgot Password?
                </button>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 btn-gradient rounded-xl text-sm font-black text-[var(--text-inverted)] outline-none disabled:opacity-60 disabled:cursor-not-allowed shadow-btn hover:shadow-btn-hover"
            >
              {loading ? (
                <><Loader2 className="h-4 w-4 animate-spin" /><span>Processing...</span></>
              ) : (
                <><span>{activeTab === 'login' ? 'Authorize & Enter' : 'Create Account'}</span>
                  <ArrowRight className="h-4 w-4" /></>
              )}
            </button>
          </form>
        </div>

        {/* Footer note */}
        <p className="text-center mt-6 text-[10px] text-[var(--text-muted)] font-medium max-w-xs mx-auto leading-relaxed">
          🔒 Secure authorization. Complies with HIPAA medical records guidelines and MedCore administrative standards.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen w-full flex items-center justify-center bg-[var(--bg-base)] font-sans">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-brand-teal" />
          <span className="text-xs font-semibold text-[var(--text-secondary)]">Loading MedCore Portal...</span>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
