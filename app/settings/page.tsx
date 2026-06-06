'use client';

import React, { useEffect, useState } from 'react';
import { useStore } from '@/hooks/useStore';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Badge } from '@/components/ui/Badge';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Globe, Palette, Database, Save, RefreshCw, ShieldAlert, Sparkles, User, UserPlus, Stethoscope, HeartPulse, Pill, Users2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AccessBanner } from '@/components/ui/AccessBanner';

type ActiveTab = 'user-profile' | 'profile' | 'defaults' | 'theme' | 'utilities' | 'staff-register';

export default function SettingsPage() {
  const { initializeStore, theme, setTheme, addToast, addActivity } = useStore();
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string; role: string } | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>('user-profile');
  const [resetWarnOpen, setResetWarnOpen] = useState(false);
  const [staffForm, setStaffForm] = useState({ name: '', email: '', password: '', role: 'doctor' as string });
  const [staffLoading, setStaffLoading] = useState(false);

  // Form State - User Profile
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
  });

  // Form State - Hospital Profile
  const [profile, setProfile] = useState({
    name: 'MedCore Care Clinic',
    address: '12, Ring Road, Sector V, Bengaluru, KA 560001',
    email: 'support@medcore.in',
    phone: '+91 98765 01928',
    regId: 'HOSP-2026-X8392',
  });

  // Form State - System Defaults
  const [defaults, setDefaults] = useState({
    consultationFee: 500,
    currency: '₹ (INR)',
    timezone: 'Asia/Kolkata (GMT+05:30)',
    timeFormat: '12-hour',
  });

  const tabs = [
    { id: 'user-profile',    label: 'My Profile',          icon: User },
    { id: 'profile',         label: 'Hospital Profile',     icon: Building2 },
    { id: 'defaults',        label: 'Defaults & Regional',  icon: Globe },
    { id: 'theme',           label: 'Interface & Theme',    icon: Palette },
    { id: 'utilities',       label: 'System Utilities',     icon: Database },
    { id: 'staff-register',  label: 'Staff Registration',   icon: UserPlus },
  ] as const;

  const filteredTabs = React.useMemo(() => {
    if (!currentUser) return tabs;
    if (currentUser.role === 'nurse') return tabs.filter(t => t.id === 'user-profile');
    if (currentUser.role !== 'admin') return tabs.filter(t => t.id !== 'staff-register');
    return tabs;
  }, [currentUser]);

  useEffect(() => { initializeStore(); }, [initializeStore]);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => { if (res.ok) return res.json(); throw new Error(''); })
      .then((data) => { if (data.user) setCurrentUser(data.user); })
      .catch(() => {})
      .finally(() => setLoadingUser(false));
  }, []);

  useEffect(() => {
    if (currentUser) {
      setUserForm({
        name: currentUser.name || '',
        email: currentUser.email || '',
      });
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser && currentUser.role === 'nurse') {
      setActiveTab('user-profile');
    }
  }, [currentUser]);

  if (loadingUser) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-teal" />
        </div>
      </PageWrapper>
    );
  }

  if (currentUser && currentUser.role === 'doctor') {
    return (
      <PageWrapper>
        <div className="flex flex-col gap-6 pb-10 animate-fade-in-up">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/50 pb-5 select-none">
            <div>
              <h1 className="text-2xl font-black font-display tracking-tight text-foreground">HMS Configurations</h1>
              <p className="text-xs text-foreground/45 mt-1 font-medium">Fine-tune general settings, visual configurations, defaults, and backup registries</p>
            </div>
          </div>
          <AccessBanner role={currentUser.role} allowedRoles={['admin']} message="" />
        </div>
      </PageWrapper>
    );
  }

  const handleSaveUserProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update profile');
      addActivity(`Updated User Profile details for ${userForm.name}`, 'info', 'system');
      addToast('Profile saved successfully! Reloading...', 'success');
      window.location.reload();
    } catch (err: any) {
      addToast(err.message, 'error');
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    addActivity(`Updated Hospital General Profile configurations`, 'info', 'system');
    addToast('Hospital Profile saved successfully!', 'success');
  };

  const handleSaveDefaults = (e: React.FormEvent) => {
    e.preventDefault();
    addActivity(`Updated default operational clinical system parameters`, 'info', 'system');
    addToast('Defaults and configuration parameters saved successfully!', 'success');
  };

  // Utilities simulation
  const handleBackup = () => {
    addActivity('Automated full database configuration backup generated.', 'success', 'system');
    addToast('System Backup generated successfully! (JSON archive saved)', 'success');
  };

  // Updated reset handler to reseed via API
  const handleReset = async () => {
    try {
      const response = await fetch('/api/system/reseed', {
        method: 'POST',
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Reseed failed');
      }
      if (typeof window !== 'undefined') {
        localStorage.removeItem('medcore-theme');
      }
      addToast('System parameters reseeded successfully!', 'success');
      setResetWarnOpen(false);
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error: any) {
      addToast(error.message || 'Reseed failed', 'error');
      setResetWarnOpen(false);
    }
  };

  const handleStaffRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setStaffLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(staffForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      addToast(`${staffForm.role.charAt(0).toUpperCase() + staffForm.role.slice(1)} account created for ${staffForm.name}!`, 'success');
      addActivity(`Admin registered new staff: ${staffForm.name} (${staffForm.role})`, 'success', 'system');
      setStaffForm({ name: '', email: '', password: '', role: 'doctor' });
    } catch (err: any) {
      addToast(err.message, 'error');
    } finally {
      setStaffLoading(false);
    }
  };

  const inputClass = "w-full bg-brand-surface/30 border border-border/60 rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-brand-teal/40 focus:ring-1 focus:ring-brand-teal/20 transition-all";
  const labelClass = "text-[10px] font-bold uppercase tracking-widest text-foreground/40 mb-1 block";

  if (currentUser && currentUser.role !== 'admin' && currentUser.role !== 'doctor') {
    return (
      <PageWrapper>
        <div className="flex flex-col gap-6 pb-10 animate-fade-in-up max-w-2xl mx-auto">
          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/50 pb-5 select-none">
            <div>
              <h1 className="text-2xl font-black font-display tracking-tight text-foreground">My Profile</h1>
              <p className="text-xs text-foreground/45 mt-1 font-medium">Manage your personal credentials and account details</p>
            </div>
          </div>

          {/* Profile Form directly */}
          <div className="glass-card p-6">
            <div className="border-b border-border/50 pb-3 mb-5 select-none">
              <h3 className="text-sm font-bold text-foreground">Profile Settings</h3>
              <p className="text-[10px] text-foreground/45 mt-0.5 font-medium">Update your account name and email address</p>
            </div>

            <form onSubmit={handleSaveUserProfile} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Full Name</label>
                  <input value={userForm.name} onChange={e => setUserForm({...userForm, name: e.target.value})} className={inputClass} required />
                </div>
                <div>
                  <label className={labelClass}>Email Address</label>
                  <input type="email" value={userForm.email} onChange={e => setUserForm({...userForm, email: e.target.value})} className={inputClass} required />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClass}>Account Role</label>
                  <input value={currentUser?.role ? currentUser.role.toUpperCase() : ''} disabled className={inputClass + " opacity-50 cursor-not-allowed"} />
                </div>
              </div>

              <button type="submit" className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-primary text-white text-xs font-black transition-all shadow-btn hover:shadow-btn-hover hover:scale-[1.01] self-start mt-2 select-none">
                <Save className="h-4 w-4" /> Save Profile Settings
              </button>
            </form>
          </div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="flex flex-col gap-6 pb-10 animate-fade-in-up">

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/50 pb-5 select-none">
          <div>
            <h1 className="text-2xl font-black font-display tracking-tight text-foreground">HMS Configurations</h1>
            <p className="text-xs text-foreground/45 mt-1 font-medium">Fine-tune general settings, visual configurations, defaults, and backup registries</p>
          </div>
        </div>

        {/* Main Grid split Sidebar/Forms */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
          
          {/* Tab Sidebar */}
          <aside className="md:col-span-1 glass-card p-2 flex flex-col gap-1 select-none shrink-0">
            {filteredTabs.map(t => {
              const Icon = t.icon;
              const active = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide border transition-all text-left outline-none',
                    active 
                      ? 'bg-brand-teal/10 border-brand-teal/15 text-brand-teal glow-teal font-bold'
                      : 'border-transparent text-foreground/50 hover:bg-brand-surface hover:text-foreground'
                  )}
                >
                  <Icon className={cn('h-4 w-4 shrink-0', active ? 'text-brand-teal' : 'text-foreground/40')} />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </aside>

          {/* Form Content Area */}
          <div className="md:col-span-3">
            <AnimatePresence mode="wait">
              {activeTab === 'user-profile' && (
                <motion.div
                  key="user-profile"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="glass-card p-6"
                >
                  <div className="border-b border-border/50 pb-3 mb-5 select-none">
                    <h3 className="text-sm font-bold text-foreground">My Profile</h3>
                    <p className="text-[10px] text-foreground/45 mt-0.5 font-medium">Manage your personal credentials and account role details</p>
                  </div>

                  <form onSubmit={handleSaveUserProfile} className="flex flex-col gap-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>Full Name</label>
                        <input value={userForm.name} onChange={e => setUserForm({...userForm, name: e.target.value})} className={inputClass} required />
                      </div>
                      <div>
                        <label className={labelClass}>Email Address</label>
                        <input
                          type="email"
                          value={userForm.email}
                          onChange={e => setUserForm({...userForm, email: e.target.value})}
                          className={cn(inputClass, currentUser?.role === 'admin' && "opacity-50 cursor-not-allowed")}
                          required
                          disabled={currentUser?.role === 'admin'}
                        />
                        {currentUser?.role === 'admin' && (
                          <span className="text-[9px] text-brand-red font-medium mt-1 block">Email updates are disabled for admin demo security</span>
                        )}
                      </div>
                      <div className="sm:col-span-2">
                        <label className={labelClass}>Account Role</label>
                        <input value={currentUser?.role ? currentUser.role.toUpperCase() : ''} disabled className={inputClass + " opacity-50 cursor-not-allowed"} />
                      </div>
                    </div>

                    <button type="submit" className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-primary text-white text-xs font-black transition-all shadow-btn hover:shadow-btn-hover hover:scale-[1.01] self-start mt-2 select-none">
                      <Save className="h-4 w-4" /> Save Profile Settings
                    </button>
                  </form>
                </motion.div>
              )}

              {activeTab === 'profile' && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="glass-card p-6"
                >
                  <div className="border-b border-border/50 pb-3 mb-5 select-none">
                    <h3 className="text-sm font-bold text-foreground">Hospital Profile</h3>
                    <p className="text-[10px] text-foreground/45 mt-0.5 font-medium">Core institutional credentials and contact points</p>
                  </div>

                  <form onSubmit={handleSaveProfile} className="flex flex-col gap-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <label className={labelClass}>Hospital / Clinic Name</label>
                        <input value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} className={inputClass} />
                      </div>
                      <div className="sm:col-span-2">
                        <label className={labelClass}>Physical Address</label>
                        <input value={profile.address} onChange={e => setProfile({...profile, address: e.target.value})} className={inputClass} />
                      </div>
                      <div>
                        <label className={labelClass}>Official Registry Email</label>
                        <input type="email" value={profile.email} onChange={e => setProfile({...profile, email: e.target.value})} className={inputClass} />
                      </div>
                      <div>
                        <label className={labelClass}>Contact Telephone</label>
                        <input value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} className={inputClass} />
                      </div>
                      <div className="sm:col-span-2">
                        <label className={labelClass}>Institutional Registration ID</label>
                        <input value={profile.regId} onChange={e => setProfile({...profile, regId: e.target.value})} className={inputClass} />
                      </div>
                    </div>

                    <button type="submit" className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-primary text-white text-xs font-black transition-all shadow-btn hover:shadow-btn-hover hover:scale-[1.01] self-start mt-2 select-none">
                      <Save className="h-4 w-4" /> Save Profile
                    </button>
                  </form>
                </motion.div>
              )}

              {activeTab === 'defaults' && (
                <motion.div
                  key="defaults"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="glass-card p-6"
                >
                  <div className="border-b border-border/50 pb-3 mb-5 select-none">
                    <h3 className="text-sm font-bold text-foreground">Operational Defaults</h3>
                    <p className="text-[10px] text-foreground/45 mt-0.5 font-medium">Configure default parameters and regional values</p>
                  </div>

                  <form onSubmit={handleSaveDefaults} className="flex flex-col gap-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>Base Consultation Fee (₹)</label>
                        <input type="number" min={0} value={defaults.consultationFee} onChange={e => setDefaults({...defaults, consultationFee: Number(e.target.value)})} className={inputClass} />
                      </div>
                      <div>
                        <label className={labelClass}>Currency Display</label>
                        <input value={defaults.currency} onChange={e => setDefaults({...defaults, currency: e.target.value})} className={inputClass} />
                      </div>
                      <div>
                        <label className={labelClass}>System Timezone</label>
                        <input value={defaults.timezone} onChange={e => setDefaults({...defaults, timezone: e.target.value})} className={inputClass} />
                      </div>
                      <div>
                        <label className={labelClass}>Format clock</label>
                        <select value={defaults.timeFormat} onChange={e => setDefaults({...defaults, timeFormat: e.target.value})} className={inputClass + " appearance-none cursor-pointer"}>
                          <option>12-hour</option>
                          <option>24-hour</option>
                        </select>
                      </div>
                    </div>

                    <button type="submit" className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-primary text-white text-xs font-black transition-all shadow-btn hover:shadow-btn-hover hover:scale-[1.01] self-start mt-2 select-none">
                      <Save className="h-4 w-4" /> Save Default Parameters
                    </button>
                  </form>
                </motion.div>
              )}

              {activeTab === 'theme' && (
                <motion.div
                  key="theme"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="glass-card p-6 select-none"
                >
                  <div className="border-b border-border/50 pb-3 mb-5">
                    <h3 className="text-sm font-bold text-foreground">Visual theme & Colors</h3>
                    <p className="text-[10px] text-foreground/45 mt-0.5 font-medium">Fine-tune the interface theme and look</p>
                  </div>

                  <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                      <span className={labelClass}>Active Application Theme</span>
                      <div className="flex gap-3">
                        <button
                          onClick={() => setTheme('dark')}
                          className={cn(
                            'flex-1 p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all outline-none',
                            theme === 'dark' 
                              ? 'bg-brand-teal/10 border-brand-teal/40 text-brand-teal glow-teal font-black' 
                              : 'bg-brand-surface border-border/60 text-foreground/50 hover:border-brand-teal/30 hover:bg-brand-surface'
                          )}
                        >
                          <div className="h-6 w-6 rounded-full bg-slate-900 border border-white/10 shrink-0" />
                          <span className="text-xs">Midnight Obsidian (Dark)</span>
                        </button>
                        <button
                          onClick={() => setTheme('light')}
                          className={cn(
                            'flex-1 p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all outline-none',
                            theme === 'light' 
                              ? 'bg-brand-teal/10 border-brand-teal/40 text-brand-teal glow-teal font-black' 
                              : 'bg-brand-surface border-border/60 text-foreground/50 hover:border-brand-teal/30 hover:bg-brand-surface'
                          )}
                        >
                          <div className="h-6 w-6 rounded-full bg-white border border-slate-900/10 shrink-0" />
                          <span className="text-xs">Clinical Alabaster (Light)</span>
                        </button>
                      </div>
                    </div>

                    <div className="bg-brand-surface border border-border rounded-xl p-4 flex gap-2.5 items-start">
                      <Sparkles className="h-5 w-5 text-brand-teal shrink-0 mt-0.5 animate-pulse" />
                      <div className="text-xs leading-relaxed text-foreground/60">
                        <span className="font-bold text-foreground">Theme Synced: </span>
                        Switching themes directly overrides layout classes. Obsidian uses midnight sapphire accents, while Alabaster utilizes soft slate backgrounds with crisp typography.
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'utilities' && (
                <motion.div
                  key="utilities"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="glass-card p-6 select-none"
                >
                  <div className="border-b border-border/50 pb-3 mb-5">
                    <h3 className="text-sm font-bold text-foreground">System Utilities</h3>
                    <p className="text-[10px] text-foreground/45 mt-0.5 font-medium">Settle database backups or reset mutated parameters</p>
                  </div>

                  <div className="flex flex-col gap-6">
                    {/* Database Backup Section */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-brand-surface border border-border rounded-xl p-4.5">
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-foreground">Database Storage Backup</h4>
                        <p className="text-[10px] text-foreground/40 mt-1">Compile full reactive states into a JSON backup archive</p>
                      </div>
                      <button
                        onClick={handleBackup}
                        className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-surface border border-border text-foreground text-xs font-bold hover:border-brand-teal/40 transition-all shrink-0 hover:bg-brand-surface shadow-sm"
                      >
                        <Database className="h-4 w-4 text-brand-teal" /> Backup Database
                      </button>
                    </div>

                    {/* Reseed Section (Disabled) */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-brand-surface/30 border border-border rounded-xl p-4.5 opacity-60">
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-foreground/50">Reseed Clinical Registry</h4>
                        <p className="text-[10px] text-foreground/40 mt-1">Erase local storage mutations and re-inject pristine mock logs</p>
                        <span className="inline-block mt-2 text-[10px] font-bold text-brand-red uppercase tracking-wider">Disabled by system administrator</span>
                      </div>
                      <button
                        disabled
                        className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-surface border border-border text-foreground/30 text-xs font-black cursor-not-allowed shrink-0"
                      >
                        <RefreshCw className="h-4 w-4 opacity-50" /> Reseed Registry
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'staff-register' && currentUser?.role === 'admin' && (
                <motion.div
                  key="staff-register"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="glass-card p-6"
                >
                  <div className="border-b border-border/50 pb-3 mb-5 select-none">
                    <h3 className="text-sm font-bold text-foreground">Staff Registration</h3>
                    <p className="text-[10px] text-foreground/45 mt-0.5 font-medium">Create new staff accounts — Doctor, Nurse, Receptionist, or Pharmacist</p>
                  </div>

                  {/* Role picker */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
                    {[
                      { id: 'doctor',       label: 'Doctor',       icon: Stethoscope },
                      { id: 'nurse',        label: 'Nurse',        icon: HeartPulse },
                      { id: 'receptionist', label: 'Receptionist', icon: Users2 },
                      { id: 'pharmacist',   label: 'Pharmacist',   icon: Pill },
                    ].map(({ id, label, icon: Icon }) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setStaffForm(f => ({ ...f, role: id }))}
                        className={cn(
                          'flex flex-col items-center gap-1.5 p-3 rounded-xl border text-[11px] font-bold transition-all outline-none',
                          staffForm.role === id
                            ? 'bg-brand-teal/10 border-brand-teal text-brand-teal shadow-[0_2px_12px_rgba(0,196,255,0.12)]'
                            : 'bg-brand-surface border-border text-foreground/50 hover:border-brand-teal/30 hover:text-brand-teal'
                        )}
                      >
                        <Icon className="h-5 w-5" />
                        {label}
                      </button>
                    ))}
                  </div>

                  <form onSubmit={handleStaffRegister} className="flex flex-col gap-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>Full Name</label>
                        <input
                          value={staffForm.name}
                          onChange={e => setStaffForm(f => ({ ...f, name: e.target.value }))}
                          placeholder="e.g. Sarah Johnson"
                          className={inputClass}
                          required
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Email Address</label>
                        <input
                          type="email"
                          value={staffForm.email}
                          onChange={e => setStaffForm(f => ({ ...f, email: e.target.value }))}
                          placeholder="staff@medcore.in"
                          className={inputClass}
                          required
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className={labelClass}>Temporary Password</label>
                        <input
                          type="password"
                          value={staffForm.password}
                          onChange={e => setStaffForm(f => ({ ...f, password: e.target.value }))}
                          placeholder="Min. 6 characters"
                          className={inputClass}
                          required
                          minLength={6}
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={staffLoading}
                      className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-primary text-white text-xs font-black transition-all shadow-btn hover:shadow-btn-hover hover:scale-[1.01] self-start mt-2 select-none disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <UserPlus className="h-4 w-4" />
                      {staffLoading ? 'Creating Account...' : `Register ${staffForm.role.charAt(0).toUpperCase() + staffForm.role.slice(1)}`}
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

      </div>

      {/* Reseed Warning Modal */}
      <AnimatePresence>
        {resetWarnOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setResetWarnOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card w-full max-w-sm p-6 flex flex-col gap-4 text-center items-center justify-center"
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              <div className="h-12 w-12 rounded-full bg-brand-red/10 border border-brand-red/20 flex items-center justify-center text-brand-red glow-red animate-bounce">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">Are you absolutely sure?</h3>
                <p className="text-xs text-foreground/45 mt-1.5 leading-relaxed">
                  This will completely clear custom patients, diagnostics, pharmacy dispenses, and invoices, restoring the pristine mock registry data. The page will reload.
                </p>
              </div>
              <div className="flex gap-3 w-full mt-2 select-none">
                <button
                  onClick={() => setResetWarnOpen(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-brand-surface border border-border text-xs font-bold text-foreground/60 hover:text-foreground transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReset}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-brand-red text-white text-xs font-black transition-all shadow-md"
                >
                  Reseed System
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </PageWrapper>
  );
}
