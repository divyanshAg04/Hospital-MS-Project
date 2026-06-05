'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useStore } from '@/hooks/useStore';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Appointment } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { EmptyState } from '@/components/ui/EmptyState';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CalendarCheck, Search, Plus, X, Clock, 
  ChevronLeft, ChevronRight, Calendar, 
  User, Stethoscope, Activity, MoreVertical,
  CheckCircle, XCircle, AlertCircle, Timer,
  Filter, RefreshCw, Edit3, ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, parseISO, addDays, subDays, isToday, isTomorrow, isYesterday, startOfWeek, addWeeks, subWeeks } from 'date-fns';
import { AccessBanner } from '@/components/ui/AccessBanner';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getStatusVariant(status: Appointment['status']) {
  const map: Record<Appointment['status'], 'teal' | 'amber' | 'green' | 'grey' | 'red' | 'lavender'> = {
    'Scheduled': 'teal',
    'Checked In': 'amber',
    'In Progress': 'lavender',
    'Completed': 'green',
    'Cancelled': 'red',
    'No Show': 'grey',
  };
  return map[status] ?? 'grey';
}

function getTypeVariant(type: Appointment['type']) {
  const map: Record<Appointment['type'], 'teal' | 'amber' | 'red' | 'lavender' | 'green'> = {
    'Consultation': 'teal',
    'Follow-up': 'amber',
    'Emergency': 'red',
    'Procedure': 'lavender',
    'Checkup': 'green',
  };
  return map[type] ?? 'grey' as 'teal';
}

function formatDateLabel(dateStr: string) {
  try {
    const d = parseISO(dateStr);
    if (isToday(d)) return 'Today';
    if (isTomorrow(d)) return 'Tomorrow';
    if (isYesterday(d)) return 'Yesterday';
    return format(d, 'EEE, dd MMM');
  } catch {
    return dateStr;
  }
}

// ─── Status Action Button ─────────────────────────────────────────────────────

function StatusButton({ id, current }: { id: string; current: Appointment['status'] }) {
  const { updateAppointment } = useStore();
  const [open, setOpen] = useState(false);
  const statuses: Appointment['status'][] = ['Scheduled', 'Checked In', 'In Progress', 'Completed', 'Cancelled', 'No Show'];
  
  return (
    <div className="relative">
      <button onClick={(e) => { e.stopPropagation(); setOpen(o => !o); }} className="p-1.5 rounded-lg hover:bg-brand-surface text-foreground/40 hover:text-foreground transition-all">
        <MoreVertical className="h-4 w-4" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute right-0 top-8 z-20 glass-card p-2 min-w-[160px] flex flex-col gap-0.5"
            onClick={(e) => e.stopPropagation()}
          >
            {statuses.map(s => (
              <button key={s} onClick={() => { updateAppointment(id, { status: s }); setOpen(false); }}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all text-left',
                  current === s ? 'bg-[#4F8CFF]/15 text-[#4F8CFF] font-bold' : 'hover:bg-brand-surface text-foreground/60 hover:text-foreground'
                )}>
                {current === s && <CheckCircle className="h-3 w-3 shrink-0" />}
                {s}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Appointment Card (for calendar/day view) ─────────────────────────────────

function AppointmentCard({ appointment, onClick, role }: { appointment: Appointment; onClick: () => void; role?: string }) {
  const { patients, doctors } = useStore();
  const patient = patients.find(p => p.id === appointment.patientId);
  const doctor = doctors.find(d => d.id === appointment.doctorId);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -15 }}
      onClick={onClick}
      className={cn(
        'flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer group transition-all hover:border-brand-teal/40 hover:shadow-card',
        appointment.status === 'Cancelled' ? 'opacity-50 border-border/30' : 'border-border/60',
        appointment.status === 'Completed' ? 'bg-brand-green/5' : 'bg-[var(--card-bg)] hover:bg-[var(--card-bg)]/90 shadow-[0_2px_8px_rgba(79,140,255,0.02)]'
      )}
    >
      {/* Time */}
      <div className="flex flex-col items-center gap-0.5 shrink-0 pt-0.5">
        <span className="text-xs font-black text-foreground/70 font-mono">{appointment.time}</span>
        <span className="text-[9px] text-foreground/30 font-bold">{appointment.duration}m</span>
      </div>

      {/* Divider */}
      <div className={cn('w-0.5 self-stretch rounded-full shrink-0', {
        'bg-brand-teal/60': appointment.status === 'Scheduled',
        'bg-brand-amber/60': appointment.status === 'Checked In',
        'bg-brand-lavender/60': appointment.status === 'In Progress',
        'bg-brand-green/60': appointment.status === 'Completed',
        'bg-brand-red/40': appointment.status === 'Cancelled',
        'bg-foreground/20': appointment.status === 'No Show',
      })} />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-bold text-foreground group-hover:text-brand-teal transition-colors truncate">
            {patient?.name ?? appointment.patientId}
          </span>
          <Badge variant={getStatusVariant(appointment.status)}>{appointment.status}</Badge>
        </div>
        <div className="flex items-center gap-2 mt-1 text-[11px] text-foreground/45">
          <Stethoscope className="h-3 w-3 shrink-0" />
          <span className="truncate">{doctor?.name ?? appointment.doctorId}</span>
          <span className="text-foreground/20">·</span>
          <span>{appointment.type}</span>
        </div>
        {appointment.reason && (
          <p className="text-[10px] text-foreground/35 mt-1 truncate">{appointment.reason}</p>
        )}
      </div>

      {!['doctor', 'nurse'].includes(role || '') && (
        <StatusButton id={appointment.id} current={appointment.status} />
      )}
    </motion.div>
  );
}

// ─── Appointment Detail Modal ─────────────────────────────────────────────────

function AppointmentDetailModal({ appointment, onClose, role }: { appointment: Appointment; onClose: () => void; role?: string }) {
  const { patients, doctors, updateAppointment } = useStore();
  const patient = patients.find(p => p.id === appointment.patientId);
  const doctor = doctors.find(d => d.id === appointment.doctorId);
  const statuses: Appointment['status'][] = ['Scheduled', 'Checked In', 'In Progress', 'Completed', 'Cancelled', 'No Show'];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="glass-card w-full max-w-md"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-6 py-5 border-b border-border/60">
            <div>
              <h2 className="text-sm font-bold text-foreground font-mono">{appointment.id}</h2>
              <p className="text-xs text-foreground/40 mt-0.5">{format(parseISO(appointment.date), 'EEEE, dd MMMM yyyy')} at {appointment.time}</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-brand-surface text-foreground/40 hover:text-foreground transition-all">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-6 flex flex-col gap-5">
            {/* Patient */}
            {patient && (
              <div className="flex items-center gap-3 bg-brand-surface/30 border border-border/60 rounded-xl p-3.5">
                <Avatar name={patient.name} size="sm" />
                <div>
                  <p className="text-sm font-bold text-foreground">{patient.name}</p>
                  <p className="text-[10px] text-foreground/40 font-mono mt-0.5">{patient.id} · {patient.department}</p>
                </div>
              </div>
            )}

            {/* Doctor */}
            {doctor && (
              <div className="flex items-center gap-3 bg-brand-teal/5 border border-brand-teal/15 rounded-xl p-3.5">
                <Avatar name={doctor.name} size="sm" />
                <div>
                  <p className="text-sm font-bold text-foreground">{doctor.name}</p>
                  <p className="text-[10px] text-foreground/40 mt-0.5">{doctor.specialty[0]} · {doctor.department}</p>
                </div>
              </div>
            )}

            {/* Details */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/35">Type</span>
                <Badge variant={getTypeVariant(appointment.type)}>{appointment.type}</Badge>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/35">Duration</span>
                <span className="text-sm font-bold text-foreground">{appointment.duration} minutes</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/35">Reason</span>
                <span className="text-xs text-foreground/60">{appointment.reason}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/35">Department</span>
                <span className="text-xs text-foreground/60">{appointment.department}</span>
              </div>
            </div>

            {appointment.notes && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/35 mb-1">Notes</p>
                <p className="text-xs text-foreground/60 bg-brand-surface/30 border border-border/60 rounded-xl p-3">{appointment.notes}</p>
              </div>
            )}

            {/* Status Buttons */}
            {!['doctor', 'nurse'].includes(role || '') && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/35 mb-2">Update Status</p>
                <div className="flex flex-wrap gap-2">
                  {statuses.map(s => (
                    <button key={s} onClick={() => updateAppointment(appointment.id, { status: s })}
                      className={cn('px-3 py-1.5 rounded-lg text-xs font-bold border transition-all',
                        appointment.status === s
                          ? 'bg-[#4F8CFF]/15 border-[#4F8CFF]/30 text-[#4F8CFF]'
                          : 'bg-brand-surface border-border/60 text-foreground/50 hover:border-brand-teal/30 hover:text-foreground'
                      )}>{s}</button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Add Appointment Modal ────────────────────────────────────────────────────

function AddAppointmentModal({ onClose, defaultDate }: { onClose: () => void; defaultDate: string }) {
  const { addAppointment, patients, doctors } = useStore();

  const [form, setForm] = useState({
    patientId: patients[0]?.id ?? '',
    doctorId: doctors[0]?.id ?? '',
    department: 'General Medicine' as Appointment['department'],
    date: defaultDate,
    time: '09:00',
    duration: 30 as Appointment['duration'],
    type: 'Consultation' as Appointment['type'],
    reason: '',
    notes: '',
  });

  const [patientSearch, setPatientSearch] = useState('');
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);

  const filteredPatientsForSelect = useMemo(() => {
    if (!patientSearch) return patients;
    const q = patientSearch.toLowerCase();
    return patients.filter(p => 
      p.name.toLowerCase().includes(q) || 
      p.id.toLowerCase().includes(q) || 
      p.phone.includes(q)
    );
  }, [patients, patientSearch]);

  const selectedPatientObj = patients.find(p => p.id === form.patientId);

  const inputClass = "w-full bg-brand-surface/30 border border-border/60 rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-brand-teal/40 focus:ring-1 focus:ring-brand-teal/20 transition-all";
  const labelClass = "text-[10px] font-bold uppercase tracking-widest text-foreground/40 mb-1 block";
  const selectClass = inputClass + " appearance-none cursor-pointer";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const chosenDoc = doctors.find(d => d.id === form.doctorId);
    addAppointment({
      ...form,
      department: chosenDoc?.department ?? form.department,
      status: 'Scheduled',
    });
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="glass-card w-full max-w-xl max-h-[90vh] overflow-y-auto"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-6 py-5 border-b border-border/60">
            <div>
              <h2 className="text-base font-bold text-foreground">Schedule Appointment</h2>
              <p className="text-xs text-foreground/40 mt-0.5">Book a new appointment slot</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-brand-surface text-foreground/40 hover:text-foreground transition-all">
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 relative">
                <label className={labelClass}>Patient *</label>
                <button
                  type="button"
                  onClick={() => setShowPatientDropdown(!showPatientDropdown)}
                  className="w-full flex items-center justify-between bg-brand-surface/30 border border-border/60 rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-brand-teal/40 transition-all text-left"
                >
                  <span>
                    {selectedPatientObj ? `${selectedPatientObj.name} (${selectedPatientObj.id})` : 'Select a patient...'}
                  </span>
                  <ChevronDown className={cn("h-4 w-4 text-foreground/40 transition-transform duration-200", showPatientDropdown && "rotate-180")} />
                </button>

                {showPatientDropdown && (
                  <>
                    {/* Backdrop */}
                    <div className="fixed inset-0 z-20" onClick={() => setShowPatientDropdown(false)} />
                    <div className="absolute left-0 right-0 mt-1.5 z-30 glass-panel border border-border/60 rounded-2xl shadow-xl p-2 animate-fade-in flex flex-col gap-2 max-h-60">
                      {/* Search Input inside Dropdown */}
                      <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-foreground/30" />
                        <input
                          type="text"
                          value={patientSearch}
                          onChange={e => setPatientSearch(e.target.value)}
                          placeholder="Search patient by name, ID or phone..."
                          className="w-full pl-8 pr-3 py-1.5 bg-brand-surface/50 border border-border/40 rounded-lg text-xs text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-brand-teal/40 transition-all"
                          autoFocus
                          onClick={e => e.stopPropagation()}
                        />
                        {patientSearch && (
                          <button
                            type="button"
                            onClick={() => setPatientSearch('')}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-foreground/45 hover:text-foreground"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </div>

                      {/* Options List */}
                      <div className="overflow-y-auto max-h-40 flex flex-col gap-0.5 scrollbar pr-1">
                        {filteredPatientsForSelect.length === 0 ? (
                          <span className="text-[11px] text-foreground/40 text-center py-3">No patients found</span>
                        ) : (
                          filteredPatientsForSelect.map(p => (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => {
                                setForm({ ...form, patientId: p.id });
                                setShowPatientDropdown(false);
                                setPatientSearch('');
                              }}
                              className={cn(
                                "w-full text-left px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-between",
                                form.patientId === p.id 
                                  ? "bg-brand-teal/10 text-brand-teal font-bold" 
                                  : "text-foreground/70 hover:bg-brand-surface hover:text-foreground"
                              )}
                            >
                              <span>{p.name}</span>
                              <span className="text-[10px] font-mono text-foreground/35">{p.id}</span>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Assigned Doctor *</label>
                <select required value={form.doctorId} onChange={e => setForm({...form, doctorId: e.target.value})} className={selectClass}>
                  {doctors.map(d => <option key={d.id} value={d.id}>{d.name} · {d.department}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Date *</label>
                <input required type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Time *</label>
                <input required type="time" value={form.time} onChange={e => setForm({...form, time: e.target.value})} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Duration</label>
                <select value={form.duration} onChange={e => setForm({...form, duration: Number(e.target.value) as Appointment['duration']})} className={selectClass}>
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={45}>45 minutes</option>
                  <option value={60}>60 minutes</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Type</label>
                <select value={form.type} onChange={e => setForm({...form, type: e.target.value as Appointment['type']})} className={selectClass}>
                  {['Consultation', 'Follow-up', 'Emergency', 'Procedure', 'Checkup'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Reason *</label>
                <input required value={form.reason} onChange={e => setForm({...form, reason: e.target.value})} placeholder="e.g. Routine checkup, chest pain..." className={inputClass} />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Additional Notes</label>
                <textarea rows={2} value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="Any special instructions..." className={inputClass + " resize-none"} />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2 border-t border-border/60">
              <button type="button" onClick={onClose} className="flex-1 px-4 py-3 rounded-xl bg-brand-surface border border-border text-foreground/60 text-sm font-bold hover:text-foreground transition-all">
                Cancel
              </button>
              <button type="submit" className="flex-1 px-4 py-3 rounded-xl bg-gradient-primary text-white text-sm font-extrabold transition-all shadow-btn hover:shadow-btn-hover hover:scale-[1.01]">
                Schedule Appointment
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

type ViewMode = 'day' | 'week' | 'list';
type FilterStatus = 'All' | Appointment['status'];

export default function AppointmentsPage() {
  const { initializeStore, appointments, patients, doctors } = useStore();
  useEffect(() => { initializeStore(); }, [initializeStore]);

  const [currentUser, setCurrentUser] = useState<{ name: string; role: string } | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => { if (res.ok) return res.json(); throw new Error(''); })
      .then((data) => { if (data.user) setCurrentUser(data.user); })
      .catch(() => {});
  }, []);

  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(format(today, 'yyyy-MM-dd'));
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('All');
  const [search, setSearch] = useState('');
  const [selectedApt, setSelectedApt] = useState<Appointment | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Month Calendar Helpers
  const currentMonthStart = useMemo(() => {
    try {
      const d = parseISO(selectedDate);
      return new Date(d.getFullYear(), d.getMonth(), 1);
    } catch {
      return new Date();
    }
  }, [selectedDate]);

  const calendarDays = useMemo(() => {
    const startOfCal = startOfWeek(currentMonthStart, { weekStartsOn: 1 });
    return Array.from({ length: 42 }, (_, i) => addDays(startOfCal, i));
  }, [currentMonthStart]);

  const appointmentsByDate = useMemo(() => {
    const map: Record<string, number> = {};
    appointments.forEach(a => {
      map[a.date] = (map[a.date] || 0) + 1;
    });
    return map;
  }, [appointments]);

  const changeMonth = (offset: number) => {
    try {
      const d = parseISO(selectedDate);
      const newDate = new Date(d.getFullYear(), d.getMonth() + offset, Math.min(d.getDate(), 28));
      setSelectedDate(format(newDate, 'yyyy-MM-dd'));
    } catch {}
  };

  // Week navigation
  const weekStart = startOfWeek(parseISO(selectedDate), { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => format(addDays(weekStart, i), 'yyyy-MM-dd'));

  // Filter appointments
  const filteredApts = useMemo(() => {
    return appointments.filter(a => {
      if (filterStatus !== 'All' && a.status !== filterStatus) return false;
      if (viewMode === 'day' && a.date !== selectedDate) return false;
      if (viewMode === 'week' && !weekDays.includes(a.date)) return false;
      if (search) {
        const q = search.toLowerCase();
        const pat = patients.find(p => p.id === a.patientId);
        const doc = doctors.find(d => d.id === a.doctorId);
        return (
          (pat?.name ?? '').toLowerCase().includes(q) ||
          (doc?.name ?? '').toLowerCase().includes(q) ||
          a.id.toLowerCase().includes(q) ||
          a.reason.toLowerCase().includes(q)
        );
      }
      return true;
    }).sort((a, b) => a.time.localeCompare(b.time));
  }, [appointments, filterStatus, viewMode, selectedDate, weekDays, search, patients, doctors]);

  // Stats for selected date
  const dayApts = appointments.filter(a => a.date === selectedDate);
  const stats = {
    total: dayApts.length,
    scheduled: dayApts.filter(a => a.status === 'Scheduled').length,
    inProgress: dayApts.filter(a => a.status === 'In Progress' || a.status === 'Checked In').length,
    completed: dayApts.filter(a => a.status === 'Completed').length,
    cancelled: dayApts.filter(a => a.status === 'Cancelled' || a.status === 'No Show').length,
  };

  const navigateDay = (dir: 1 | -1) => {
    const newDate = dir === 1 ? addDays(parseISO(selectedDate), 1) : subDays(parseISO(selectedDate), 1);
    setSelectedDate(format(newDate, 'yyyy-MM-dd'));
  };

  const navigateWeek = (dir: 1 | -1) => {
    const base = parseISO(selectedDate);
    const newDate = dir === 1 ? addWeeks(base, 1) : subWeeks(base, 1);
    setSelectedDate(format(newDate, 'yyyy-MM-dd'));
  };

  return (
    <PageWrapper>
      <div className="flex flex-col gap-6 pb-10 animate-fade-in-up">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/50 pb-5">
          <div>
            <h1 className="text-2xl font-black font-display tracking-tight text-foreground">Appointment Scheduler</h1>
            <p className="text-xs text-foreground/45 mt-1 font-medium">Manage and track all patient appointments across departments</p>
          </div>
          {currentUser && ['admin', 'receptionist'].includes(currentUser.role) && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-primary text-white text-sm font-extrabold transition-all shadow-btn hover:shadow-btn-hover hover:scale-[1.02]"
              >
                <Plus className="h-4 w-4" />
                Book Appointment
              </button>
            </div>
          )}
        </div>

        {currentUser && (
          <AccessBanner
            role={currentUser.role}
            allowedRoles={['admin', 'doctor', 'nurse', 'receptionist']}
            message={
              ['doctor', 'nurse'].includes(currentUser.role)
                ? `Access Level: ${currentUser.role.toUpperCase()} — Read-only access to view appointment schedules.`
                : `Access Level: ${currentUser.role.toUpperCase()} — Full permissions granted to schedule and manage patient appointments.`
            }
          />
        )}

        {currentUser && ['admin', 'doctor', 'nurse', 'receptionist'].includes(currentUser.role) && (
          <>
            {/* Responsive Calendar & Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 items-start">
          {/* Left Column: Monthly Calendar & Day Summary Stats */}
          <div className="flex flex-col gap-6">
            {/* 1. Monthly Calendar */}
            <div className="glass-card p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-brand-teal" />
                  Calendar
                </span>
                <div className="flex items-center gap-1">
                  <button type="button" onClick={() => changeMonth(-1)} className="p-1 rounded hover:bg-brand-surface text-foreground/50 hover:text-foreground transition-all">
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </button>
                  <span className="text-xs font-black text-foreground min-w-[85px] text-center select-none">
                    {format(currentMonthStart, 'MMMM yyyy')}
                  </span>
                  <button type="button" onClick={() => changeMonth(1)} className="p-1 rounded hover:bg-brand-surface text-foreground/50 hover:text-foreground transition-all">
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center mt-1 select-none">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((dayName, idx) => (
                  <span key={idx} className="text-[9px] font-extrabold text-foreground/30 uppercase tracking-wider">{dayName}</span>
                ))}

                {calendarDays.map((day, idx) => {
                  const dayStr = format(day, 'yyyy-MM-dd');
                  const isSel = dayStr === selectedDate;
                  const isTodayDate = format(day, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
                  const count = appointmentsByDate[dayStr] || 0;
                  const isCurrentMonth = day.getMonth() === currentMonthStart.getMonth();

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setSelectedDate(dayStr);
                        setViewMode('day');
                      }}
                      className={cn(
                        "h-8 w-full rounded-xl text-xs font-black flex flex-col items-center justify-center relative transition-all",
                        isSel 
                          ? "bg-[#4F8CFF] text-white shadow-[0_4px_12px_rgba(79,140,255,0.25)] scale-[1.05]" 
                          : isCurrentMonth
                            ? "text-foreground/80 hover:bg-brand-surface hover:text-foreground"
                            : "text-foreground/20 hover:bg-brand-surface/50",
                        isTodayDate && !isSel && "border border-brand-teal/50 text-brand-teal bg-brand-teal/5"
                      )}
                    >
                      <span>{format(day, 'd')}</span>
                      {count > 0 && (
                        <span className={cn(
                          "absolute bottom-1 h-1 w-1 rounded-full",
                          isSel ? "bg-white" : "bg-brand-teal"
                        )} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Stats (stacked compact grid) */}
            <div className="glass-card p-4 flex flex-col gap-3">
              <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">Day Summary</span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Total Apts", value: stats.total, color: 'text-foreground' },
                  { label: 'Scheduled', value: stats.scheduled, color: 'text-brand-teal' },
                  { label: 'In Progress', value: stats.inProgress, color: 'text-brand-lavender' },
                  { label: 'Completed', value: stats.completed, color: 'text-brand-green' },
                  { label: 'Cancelled', value: stats.cancelled, color: 'text-brand-red', span: 'col-span-2' },
                ].map(s => (
                  <div key={s.label} className={cn("bg-brand-surface/30 border border-border/40 rounded-xl p-2.5 flex flex-col gap-0.5", s.span)}>
                    <span className={cn('text-lg font-black font-mono', s.color)}>{s.value}</span>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-foreground/45 mt-0.5 leading-none">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Navigation & View Toggle, Status Filter, Appointments list */}
          <div className="flex flex-col gap-6">
            {/* Navigation & View Toggle */}
            <div className="glass-card p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center shrink-0">
              {/* Date Nav */}
              <div className="flex items-center gap-2">
                <button onClick={() => viewMode === 'week' ? navigateWeek(-1) : navigateDay(-1)} className="p-2 rounded-xl bg-brand-surface border border-border/65 text-foreground/50 hover:text-foreground hover:border-brand-teal/30 transition-all">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <div className="text-center min-w-[160px]">
                  <p className="text-sm font-black text-foreground">{formatDateLabel(selectedDate)}</p>
                  <p className="text-[10px] text-foreground/40">{format(parseISO(selectedDate), 'EEEE, dd MMMM yyyy')}</p>
                </div>
                <button onClick={() => viewMode === 'week' ? navigateWeek(1) : navigateDay(1)} className="p-2 rounded-xl bg-brand-surface border border-border/65 text-foreground/50 hover:text-foreground hover:border-brand-teal/30 transition-all">
                  <ChevronRight className="h-4 w-4" />
                </button>
                <button onClick={() => setSelectedDate(format(today, 'yyyy-MM-dd'))} className="px-3 py-2 rounded-xl bg-brand-surface border border-border/65 text-xs font-bold text-foreground/50 hover:text-foreground hover:border-brand-teal/30 transition-all ml-1">
                  Today
                </button>
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center gap-1 bg-brand-surface border border-border/65 rounded-xl p-1 ml-auto">
                {(['day', 'week', 'list'] as ViewMode[]).map(v => (
                  <button key={v} onClick={() => setViewMode(v)} className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all',
                    viewMode === v ? 'bg-[#4F8CFF] text-white shadow-sm' : 'text-foreground/40 hover:text-foreground'
                  )}>{v}</button>
                ))}
              </div>

              {/* Search */}
              <div className="relative flex-1 max-w-xs ml-0 sm:ml-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-foreground/30" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search appointments..."
                  className="w-full pl-8 pr-3 py-2 bg-brand-surface/30 border border-border/60 rounded-xl text-xs text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-brand-teal/40 transition-all"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex flex-wrap gap-2 shrink-0 -mt-2">
              {(['All', 'Scheduled', 'Checked In', 'In Progress', 'Completed', 'Cancelled', 'No Show'] as FilterStatus[]).map(s => (
                <button key={s} onClick={() => setFilterStatus(s)} className={cn(
                  'px-3 py-1 rounded-full text-[11px] font-bold border transition-all',
                  filterStatus === s ? 'bg-gradient-primary text-white border-transparent shadow-sm' : 'bg-brand-dark border-border/60 text-foreground/50 hover:bg-brand-surface hover:text-foreground'
                )}>{s}</button>
              ))}
            </div>

            {/* Week Calendar (week view) */}
            {viewMode === 'week' && (
              <div className="glass-card overflow-hidden shrink-0">
                <div className="grid grid-cols-7 divide-x divide-border/40">
                  {weekDays.map(day => {
                    const count = appointments.filter(a => a.date === day).length;
                    const completed = appointments.filter(a => a.date === day && a.status === 'Completed').length;
                    const isSelected = day === selectedDate;
                    const isCurrentDay = day === format(today, 'yyyy-MM-dd');
                    return (
                      <button key={day} onClick={() => { setSelectedDate(day); setViewMode('day'); }}
                        className={cn('flex flex-col items-center gap-1 p-3 hover:bg-brand-teal/5 transition-all', isSelected && 'bg-brand-teal/10')}>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/35">{format(parseISO(day), 'EEE')}</span>
                        <span className={cn('text-lg font-black', isCurrentDay ? 'text-brand-teal' : 'text-foreground', isSelected && 'text-brand-teal')}>
                          {format(parseISO(day), 'd')}
                        </span>
                        {count > 0 && (
                          <div className="flex flex-col items-center gap-0.5">
                            <span className="text-[10px] font-bold text-foreground/50">{count} apts</span>
                            <div className="h-1 w-8 bg-border/40 rounded-full overflow-hidden">
                              <div className="h-full bg-brand-green rounded-full" style={{ width: count > 0 ? `${(completed / count) * 100}%` : '0%' }} />
                            </div>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Appointment List */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-xs text-foreground/40 font-semibold mb-1">
                <Filter className="h-3.5 w-3.5" />
                <span>{filteredApts.length} appointment{filteredApts.length !== 1 ? 's' : ''}</span>
                {viewMode !== 'list' && <span className="text-foreground/25">· {formatDateLabel(selectedDate)}</span>}
              </div>

              {filteredApts.length === 0 ? (
                <EmptyState
                  icon={<CalendarCheck className="h-10 w-10" />}
                  title="No appointments found"
                  description={viewMode === 'day' ? 'No appointments scheduled for this day. Book a new one!' : 'Try adjusting your filters.'}
                />
              ) : (
                <AnimatePresence>
                  {viewMode === 'week' ? (
                    // Group by day in week view
                    weekDays.map(day => {
                      const dayApts = filteredApts.filter(a => a.date === day);
                      if (dayApts.length === 0) return null;
                      return (
                        <div key={day}>
                          <div className="flex items-center gap-2 mb-2 mt-1">
                            <span className="text-xs font-black text-foreground/50">{formatDateLabel(day)}</span>
                            <div className="flex-1 h-px bg-border/40" />
                            <Badge variant="grey">{dayApts.length}</Badge>
                          </div>
                          <div className="flex flex-col gap-2">
                            {dayApts.map(a => (
                              <AppointmentCard key={a.id} appointment={a} onClick={() => setSelectedApt(a)} role={currentUser?.role} />
                            ))}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="flex flex-col gap-2">
                      {filteredApts.map(a => (
                        <AppointmentCard key={a.id} appointment={a} onClick={() => setSelectedApt(a)} role={currentUser?.role} />
                      ))}
                    </div>
                  )}
                </AnimatePresence>
              )}
            </div>
          </div>
        </div>
          </>
        )}
      </div>

      {/* Appointment Detail Modal */}
      {selectedApt && (
        <AppointmentDetailModal appointment={selectedApt} onClose={() => setSelectedApt(null)} role={currentUser?.role} />
      )}

      {/* Add Appointment Modal */}
      {showAddModal && (
        <AddAppointmentModal onClose={() => setShowAddModal(false)} defaultDate={selectedDate} />
      )}
    </PageWrapper>
  );
}
