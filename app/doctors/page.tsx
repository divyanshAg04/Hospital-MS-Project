'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useStore } from '@/hooks/useStore';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Doctor, Patient, Appointment } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { StatusDot } from '@/components/ui/StatusDot';
import { EmptyState } from '@/components/ui/EmptyState';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Stethoscope, Search, Plus, X, Star, Phone, Mail,
  MapPin, Clock, Award, Languages, Calendar, 
  ChevronRight, Filter, Users, Activity, Building2,
  Briefcase, DollarSign, BookOpen, UserCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AccessBanner } from '@/components/ui/AccessBanner';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getDocStatusVariant(status: Doctor['status']) {
  const map: Record<Doctor['status'], 'teal' | 'red' | 'amber' | 'grey'> = {
    'Available': 'teal',
    'In Surgery': 'red',
    'On Leave': 'amber',
    'Off Duty': 'grey',
  };
  return map[status] ?? 'grey';
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={cn('h-3 w-3', i < Math.floor(rating) ? 'fill-brand-amber text-brand-amber' : 'text-foreground/20')} />
      ))}
      <span className="text-xs font-bold text-foreground ml-1">{rating.toFixed(1)}</span>
    </div>
  );
}

// ─── Doctor Detail Drawer ─────────────────────────────────────────────────────

function DoctorDrawer({ doctor, onClose, patients, appointments, isAdmin }: {
  doctor: Doctor;
  onClose: () => void;
  patients: Patient[];
  appointments: Appointment[];
  isAdmin: boolean;
}) {
  const { updateDoctor } = useStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: doctor.name,
    department: doctor.department,
    phone: doctor.phone,
    email: doctor.email,
    roomNumber: doctor.roomNumber,
    experience: doctor.experience,
    consultationFee: doctor.consultationFee,
    specialty: doctor.specialty.join(', '),
    qualifications: doctor.qualifications.join(', '),
    languages: doctor.languages.join(', '),
    bio: doctor.bio || '',
  });

  const [scheduleForm, setScheduleForm] = useState<Record<string, { start: string; end: string; available: boolean }>>(() => {
    const defaultSchedule: Record<string, { start: string; end: string; available: boolean }> = {
      Monday: { start: '09:00 AM', end: '05:00 PM', available: false },
      Tuesday: { start: '09:00 AM', end: '05:00 PM', available: false },
      Wednesday: { start: '09:00 AM', end: '05:00 PM', available: false },
      Thursday: { start: '09:00 AM', end: '05:00 PM', available: false },
      Friday: { start: '09:00 AM', end: '05:00 PM', available: false },
      Saturday: { start: '09:00 AM', end: '05:00 PM', available: false },
      Sunday: { start: '09:00 AM', end: '05:00 PM', available: false },
    };
    if (doctor.schedule) {
      const s = doctor.schedule instanceof Map ? Object.fromEntries(doctor.schedule) : doctor.schedule;
      for (const day of ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']) {
        if (s[day]) {
          defaultSchedule[day] = {
            start: s[day].start || '09:00 AM',
            end: s[day].end || '05:00 PM',
            available: !!s[day].available
          };
        }
      }
    }
    return defaultSchedule;
  });

  useEffect(() => {
    setIsEditing(false);
    setEditForm({
      name: doctor.name,
      department: doctor.department,
      phone: doctor.phone,
      email: doctor.email,
      roomNumber: doctor.roomNumber,
      experience: doctor.experience,
      consultationFee: doctor.consultationFee,
      specialty: doctor.specialty.join(', '),
      qualifications: doctor.qualifications.join(', '),
      languages: doctor.languages.join(', '),
      bio: doctor.bio || '',
    });

    const defaultSchedule: Record<string, { start: string; end: string; available: boolean }> = {
      Monday: { start: '09:00 AM', end: '05:00 PM', available: false },
      Tuesday: { start: '09:00 AM', end: '05:00 PM', available: false },
      Wednesday: { start: '09:00 AM', end: '05:00 PM', available: false },
      Thursday: { start: '09:00 AM', end: '05:00 PM', available: false },
      Friday: { start: '09:00 AM', end: '05:00 PM', available: false },
      Saturday: { start: '09:00 AM', end: '05:00 PM', available: false },
      Sunday: { start: '09:00 AM', end: '05:00 PM', available: false },
    };
    if (doctor.schedule) {
      const s = doctor.schedule instanceof Map ? Object.fromEntries(doctor.schedule) : doctor.schedule;
      for (const day of ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']) {
        if (s[day]) {
          defaultSchedule[day] = {
            start: s[day].start || '09:00 AM',
            end: s[day].end || '05:00 PM',
            available: !!s[day].available
          };
        }
      }
    }
    setScheduleForm(defaultSchedule);
  }, [doctor]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateDoctor(doctor.id, {
      name: editForm.name,
      department: editForm.department,
      phone: editForm.phone,
      email: editForm.email,
      roomNumber: editForm.roomNumber,
      experience: Number(editForm.experience),
      consultationFee: Number(editForm.consultationFee),
      specialty: editForm.specialty.split(',').map(s => s.trim()).filter(Boolean),
      qualifications: editForm.qualifications.split(',').map(s => s.trim()).filter(Boolean),
      languages: editForm.languages.split(',').map(s => s.trim()).filter(Boolean),
      bio: editForm.bio,
      schedule: scheduleForm,
    });
    setIsEditing(false);
  };

  const docPatients = patients.filter(p => p.assignedDoctorId === doctor.id);
  const docApts = appointments.filter(a => a.doctorId === doctor.id);
  const todayApts = docApts.filter(a => a.date === new Date().toISOString().split('T')[0]);
  const completedApts = docApts.filter(a => a.status === 'Completed');

  const statusOptions: Doctor['status'][] = ['Available', 'In Surgery', 'On Leave', 'Off Duty'];
  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.aside
        initial={{ x: '100%', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '100%', opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed right-0 top-0 h-full w-full max-w-lg z-50 flex flex-col glass-panel border-l border-border/60 overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border/60 bg-brand-surface/80 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <Avatar name={doctor.name} size="lg" />
            <div>
              <h2 className="text-base font-bold text-foreground">{doctor.name}</h2>
              <p className="text-xs text-foreground/45 font-mono mt-0.5">{doctor.id}</p>
              <div className="mt-1"><StarRating rating={doctor.rating} /></div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && !isEditing && (
              <button onClick={() => setIsEditing(true)} className="px-3 py-1.5 rounded-lg bg-[#4F8CFF] text-white text-xs font-bold hover:bg-[#4F8CFF]/90 transition-all select-none">
                Edit Details
              </button>
            )}
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-brand-surface text-foreground/40 hover:text-foreground transition-all">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {isEditing ? (
          <form onSubmit={handleSave} className="flex flex-col gap-4 p-6 select-none">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 mb-1 block">Full Name</label>
              <input required value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="w-full bg-brand-surface/30 border border-border/60 rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-brand-teal/40" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 mb-1 block">Phone</label>
                <input required value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} className="w-full bg-brand-surface/30 border border-border/60 rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-brand-teal/40" />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 mb-1 block">Email</label>
                <input required type="email" value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} className="w-full bg-brand-surface/30 border border-border/60 rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-brand-teal/40" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 mb-1 block">Department</label>
                <select value={editForm.department} onChange={e => setEditForm({...editForm, department: e.target.value as Doctor['department']})} className="w-full bg-brand-surface/30 border border-border/60 rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-brand-teal/40">
                  {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 mb-1 block">Room Number</label>
                <input required value={editForm.roomNumber} onChange={e => setEditForm({...editForm, roomNumber: e.target.value})} className="w-full bg-brand-surface/30 border border-border/60 rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-brand-teal/40" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 mb-1 block">Experience (yrs)</label>
                <input type="number" min={0} value={editForm.experience} onChange={e => setEditForm({...editForm, experience: Number(e.target.value)})} className="w-full bg-brand-surface/30 border border-border/60 rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-brand-teal/40" />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 mb-1 block">Consultation Fee (₹)</label>
                <input type="number" min={0} value={editForm.consultationFee} onChange={e => setEditForm({...editForm, consultationFee: Number(e.target.value)})} className="w-full bg-brand-surface/30 border border-border/60 rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-brand-teal/40" />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 mb-1 block">Specialties (comma-separated)</label>
              <input value={editForm.specialty} onChange={e => setEditForm({...editForm, specialty: e.target.value})} className="w-full bg-brand-surface/30 border border-border/60 rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-brand-teal/40" />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 mb-1 block">Qualifications (comma-separated)</label>
              <input value={editForm.qualifications} onChange={e => setEditForm({...editForm, qualifications: e.target.value})} className="w-full bg-brand-surface/30 border border-border/60 rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-brand-teal/40" />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 mb-1 block">Languages (comma-separated)</label>
              <input value={editForm.languages} onChange={e => setEditForm({...editForm, languages: e.target.value})} className="w-full bg-brand-surface/30 border border-border/60 rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-brand-teal/40" />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 mb-1 block">Biography</label>
              <textarea rows={3} value={editForm.bio} onChange={e => setEditForm({...editForm, bio: e.target.value})} className="w-full bg-brand-surface/30 border border-border/60 rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-brand-teal/40 resize-none" />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 mb-2 block">Weekly Schedule</label>
              <div className="flex flex-col gap-2 bg-brand-surface/30 border border-border/60 rounded-xl p-2.5">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                  <div key={day} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/40 last:border-0 pb-2 last:pb-0 pt-2 first:pt-0">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`edit-avail-${day}`}
                        checked={scheduleForm[day].available}
                        onChange={e => setScheduleForm({
                          ...scheduleForm,
                          [day]: { ...scheduleForm[day], available: e.target.checked }
                        })}
                        className="h-4 w-4 rounded border-border text-[#4f8cff] focus:ring-[#4f8cff]/20 bg-white"
                      />
                      <label htmlFor={`edit-avail-${day}`} className="text-xs font-bold text-foreground/75 select-none w-20 capitalize">{day.slice(0, 3)}</label>
                    </div>
                    {scheduleForm[day].available ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={scheduleForm[day].start}
                          onChange={e => setScheduleForm({
                            ...scheduleForm,
                            [day]: { ...scheduleForm[day], start: e.target.value }
                          })}
                          className="w-24 bg-brand-surface/40 border border-border/50 rounded-lg px-2 py-1 text-xs text-foreground focus:outline-none"
                        />
                        <span className="text-xs text-foreground/45">to</span>
                        <input
                          type="text"
                          value={scheduleForm[day].end}
                          onChange={e => setScheduleForm({
                            ...scheduleForm,
                            [day]: { ...scheduleForm[day], end: e.target.value }
                          })}
                          className="w-24 bg-brand-surface/40 border border-border/50 rounded-lg px-2 py-1 text-xs text-foreground focus:outline-none"
                        />
                      </div>
                    ) : (
                      <span className="text-xs text-foreground/35 font-semibold italic">Not available (Off Day)</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-3 mt-2">
              <button type="button" onClick={() => setIsEditing(false)} className="flex-1 py-2.5 rounded-xl border border-border bg-brand-surface text-foreground/60 text-sm font-bold hover:text-foreground">
                Cancel
              </button>
              <button type="submit" className="flex-1 py-2.5 rounded-xl bg-gradient-primary text-white text-sm font-extrabold shadow-btn hover:shadow-btn-hover">
                Save Changes
              </button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col gap-5 p-6">
            {/* Status & Badges */}
            <div className="flex flex-wrap gap-2">
              <Badge variant={getDocStatusVariant(doctor.status)}>{doctor.status}</Badge>
              <Badge variant="grey">{doctor.department}</Badge>
              <Badge variant="teal">{doctor.experience} yrs exp</Badge>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Patients', value: docPatients.length, icon: <Users className="h-3.5 w-3.5" /> },
                { label: "Today's Apts", value: todayApts.length, icon: <Calendar className="h-3.5 w-3.5" /> },
                { label: 'Completed', value: completedApts.length, icon: <UserCheck className="h-3.5 w-3.5" /> },
              ].map(s => (
                <div key={s.label} className="flex flex-col gap-1.5 bg-brand-surface border border-border/60 rounded-xl p-3">
                  <div className="text-foreground/40">{s.icon}</div>
                  <span className="text-xl font-black text-foreground">{s.value}</span>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-foreground/35">{s.label}</span>
                </div>
              ))}
            </div>

            {/* Contact */}
            <div>
              <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest mb-2">Contact</p>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-xs text-foreground/60">
                  <Phone className="h-3.5 w-3.5 text-brand-teal shrink-0" />
                  <span>{doctor.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-foreground/60">
                  <Mail className="h-3.5 w-3.5 text-brand-teal shrink-0" />
                  <span>{doctor.email}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-foreground/60">
                  <MapPin className="h-3.5 w-3.5 text-brand-teal shrink-0" />
                  <span>Room {doctor.roomNumber}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-foreground/60">
                  <DollarSign className="h-3.5 w-3.5 text-brand-amber shrink-0" />
                  <span>Consultation Fee: ₹{doctor.consultationFee.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Specialties */}
            <div>
              <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest mb-2">Specialties</p>
              <div className="flex flex-wrap gap-1.5">
                {doctor.specialty.map(s => <Badge key={s} variant="teal">{s}</Badge>)}
              </div>
            </div>

            {/* Qualifications */}
            <div>
              <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest mb-2">Qualifications</p>
              <div className="flex flex-col gap-1.5">
                {doctor.qualifications.map(q => (
                  <div key={q} className="flex items-center gap-2 text-xs text-foreground/60">
                    <Award className="h-3.5 w-3.5 text-brand-amber shrink-0" />
                    {q}
                  </div>
                ))}
              </div>
            </div>

            {/* Languages */}
            <div>
              <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest mb-2">Languages</p>
              <div className="flex flex-wrap gap-1.5">
                {doctor.languages.map(l => <Badge key={l} variant="lavender">{l}</Badge>)}
              </div>
            </div>

            {/* Bio */}
            {doctor.bio && (
              <div>
                <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest mb-2">Biography</p>
                <p className="text-xs text-foreground/60 leading-relaxed bg-brand-surface/30 border border-border/60 rounded-xl p-3.5">{doctor.bio}</p>
              </div>
            )}

            {/* Weekly Schedule */}
            <div>
              <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest mb-2">Weekly Schedule</p>
              <div className="flex flex-col gap-1.5">
                {DAYS.map(day => {
                  const slot = doctor.schedule?.[day];
                  return (
                    <div key={day} className={cn('flex items-center justify-between text-xs px-3 py-2 rounded-lg border',
                      slot?.available ? 'border-brand-teal/15 bg-brand-teal/3' : 'border-border/40 bg-brand-surface/10 opacity-50'
                    )}>
                      <span className="font-semibold text-foreground/60 w-24">{day.slice(0, 3)}</span>
                      {slot?.available ? (
                        <span className="font-bold text-brand-teal">{slot.start} – {slot.end}</span>
                      ) : (
                        <span className="text-foreground/30 font-semibold">Off</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Update Status */}
            <div>
              <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest mb-2">Update Status</p>
              <div className="flex flex-wrap gap-2">
                {statusOptions.map(s => (
                  <button key={s} onClick={() => updateDoctor(doctor.id, { status: s })}
                    className={cn('px-3 py-1.5 rounded-lg text-xs font-bold border transition-all',
                      doctor.status === s
                        ? 'bg-brand-teal/20 border-brand-teal/40 text-brand-teal'
                        : 'bg-brand-surface/20 border-border/60 text-foreground/50 hover:border-brand-teal/30 hover:text-foreground'
                    )}>{s}</button>
                ))}
              </div>
            </div>
          </div>
        )}
      </motion.aside>
    </AnimatePresence>
  );
}

// ─── Doctor Card ──────────────────────────────────────────────────────────────

function DoctorCard({ doctor, onClick, patientCount }: {
  doctor: Doctor;
  onClick: () => void;
  patientCount: number;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className="glass-card p-5 cursor-pointer group flex flex-col gap-4"
    >
      {/* Top Row */}
      <div className="flex items-start gap-3">
        <Avatar name={doctor.name} size="md" />
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-foreground truncate group-hover:text-brand-teal transition-colors">{doctor.name}</h3>
          <p className="text-[10px] text-foreground/40 font-mono mt-0.5">{doctor.id}</p>
          <div className="mt-1.5"><StarRating rating={doctor.rating} /></div>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <Badge variant={getDocStatusVariant(doctor.status)}>{doctor.status}</Badge>
          <StatusDot status={doctor.status} />
        </div>
      </div>

      {/* Specialties */}
      <div className="flex flex-wrap gap-1.5">
        {doctor.specialty.slice(0, 2).map(s => (
          <Badge key={s} variant="teal" className="text-[10px]">{s}</Badge>
        ))}
        {doctor.specialty.length > 2 && (
          <Badge variant="grey" className="text-[10px]">+{doctor.specialty.length - 2}</Badge>
        )}
      </div>

      {/* Department & Room */}
      <div className="flex items-center gap-3 text-[11px] text-foreground/45">
        <span className="flex items-center gap-1"><Building2 className="h-3 w-3" /> {doctor.department}</span>
        <span className="text-foreground/20">·</span>
        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> Room {doctor.roomNumber}</span>
      </div>

      {/* Stats Row */}
      <div className="flex items-center justify-between border-t border-border/50 pt-3">
        <div className="flex items-center gap-4">
          <div className="text-center">
            <p className="text-sm font-black text-foreground">{patientCount}</p>
            <p className="text-[9px] text-foreground/35 font-bold uppercase tracking-wider">Patients</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-black text-foreground">{doctor.experience}y</p>
            <p className="text-[9px] text-foreground/35 font-bold uppercase tracking-wider">Exp</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-black text-foreground">{doctor.reviewCount}</p>
            <p className="text-[9px] text-foreground/35 font-bold uppercase tracking-wider">Reviews</p>
          </div>
        </div>
        <ChevronRight className="h-4 w-4 text-foreground/20 group-hover:text-brand-teal transition-colors" />
      </div>
    </motion.div>
  );
}

// ─── Add Doctor Modal ─────────────────────────────────────────────────────────

const DEPARTMENTS = ['Cardiology','Neurology','Orthopedics','Pediatrics','Oncology','Radiology','ICU','Emergency','Dermatology','General Medicine'];

function AddDoctorModal({ onClose }: { onClose: () => void }) {
  const { addDoctor } = useStore();
  const [form, setForm] = useState({
    name: '', department: 'General Medicine' as Doctor['department'],
    phone: '', email: '', roomNumber: '', experience: 1,
    consultationFee: 500,
    specialty: '', qualifications: '', languages: 'English',
    bio: '', status: 'Available' as Doctor['status'],
  });

  const [scheduleForm, setScheduleForm] = useState<Record<string, { start: string; end: string; available: boolean }>>({
    Monday: { start: '09:00 AM', end: '05:00 PM', available: true },
    Tuesday: { start: '09:00 AM', end: '05:00 PM', available: true },
    Wednesday: { start: '09:00 AM', end: '05:00 PM', available: true },
    Thursday: { start: '09:00 AM', end: '05:00 PM', available: true },
    Friday: { start: '09:00 AM', end: '03:00 PM', available: true },
    Saturday: { start: '10:00 AM', end: '01:00 PM', available: false },
    Sunday: { start: '09:00 AM', end: '05:00 PM', available: false },
  });

  const inputClass = "w-full bg-brand-surface/30 border border-border/60 rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-brand-teal/40 focus:ring-1 focus:ring-brand-teal/20 transition-all";
  const labelClass = "text-[10px] font-bold uppercase tracking-widest text-foreground/40 mb-1 block";
  const selectClass = inputClass + " appearance-none cursor-pointer";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addDoctor({
      name: form.name,
      department: form.department,
      phone: form.phone,
      email: form.email,
      roomNumber: form.roomNumber,
      experience: form.experience,
      consultationFee: form.consultationFee,
      specialty: form.specialty.split(',').map(s => s.trim()).filter(Boolean),
      qualifications: form.qualifications.split(',').map(s => s.trim()).filter(Boolean),
      languages: form.languages.split(',').map(s => s.trim()).filter(Boolean),
      bio: form.bio,
      status: form.status,
      schedule: scheduleForm,
    });
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
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
              <h2 className="text-base font-bold text-foreground">Add Medical Staff</h2>
              <p className="text-xs text-foreground/40 mt-0.5">Register a new doctor or specialist</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-brand-surface text-foreground/40 hover:text-foreground transition-all">
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
            <div>
              <p className="text-[11px] font-bold text-brand-teal uppercase tracking-widest border-b border-border/40 pb-2 mb-4">Personal Information</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className={labelClass}>Full Name *</label>
                  <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Dr. Aarav Sharma" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Phone *</label>
                  <input required value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+91 98765 43210" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Email *</label>
                  <input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="doctor@medcore.in" className={inputClass} />
                </div>
              </div>
            </div>

            <div>
              <p className="text-[11px] font-bold text-brand-teal uppercase tracking-widest border-b border-border/40 pb-2 mb-4">Professional Details</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Department *</label>
                  <select required value={form.department} onChange={e => setForm({...form, department: e.target.value as Doctor['department']})} className={selectClass}>
                    {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Room Number *</label>
                  <input required value={form.roomNumber} onChange={e => setForm({...form, roomNumber: e.target.value})} placeholder="OPD-202" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Experience (years)</label>
                  <input type="number" min={0} value={form.experience} onChange={e => setForm({...form, experience: Number(e.target.value)})} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Consultation Fee (₹)</label>
                  <input type="number" min={0} value={form.consultationFee} onChange={e => setForm({...form, consultationFee: Number(e.target.value)})} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Status</label>
                  <select value={form.status} onChange={e => setForm({...form, status: e.target.value as Doctor['status']})} className={selectClass}>
                    <option>Available</option><option>In Surgery</option><option>On Leave</option><option>Off Duty</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <p className="text-[11px] font-bold text-brand-teal uppercase tracking-widest border-b border-border/40 pb-2 mb-4">Expertise <span className="text-foreground/30 normal-case">(comma-separated)</span></p>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className={labelClass}>Specialties *</label>
                  <input required value={form.specialty} onChange={e => setForm({...form, specialty: e.target.value})} placeholder="Interventional Cardiology, Echocardiography" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Qualifications</label>
                  <input value={form.qualifications} onChange={e => setForm({...form, qualifications: e.target.value})} placeholder="MBBS, MD Cardiology, DM" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Languages</label>
                  <input value={form.languages} onChange={e => setForm({...form, languages: e.target.value})} placeholder="English, Hindi, Tamil" className={inputClass} />
                </div>
              </div>
            </div>

            <div>
              <label className={labelClass}>Biography</label>
              <textarea rows={3} value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} placeholder="Brief professional background..." className={inputClass + " resize-none"} />
            </div>

            <div>
              <p className="text-[11px] font-bold text-brand-teal uppercase tracking-widest border-b border-border/40 pb-2 mb-4">Weekly Schedule</p>
              <div className="flex flex-col gap-2.5">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                  <div key={day} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-brand-surface/30 border border-border/60 rounded-xl">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`add-avail-${day}`}
                        checked={scheduleForm[day].available}
                        onChange={e => setScheduleForm({
                          ...scheduleForm,
                          [day]: { ...scheduleForm[day], available: e.target.checked }
                        })}
                        className="h-4 w-4 rounded border-border text-[#4f8cff] focus:ring-[#4f8cff]/20 bg-white"
                      />
                      <label htmlFor={`add-avail-${day}`} className="text-xs font-bold text-foreground/75 select-none w-20 capitalize">{day.slice(0, 3)}</label>
                    </div>
                    {scheduleForm[day].available ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="09:00 AM"
                          value={scheduleForm[day].start}
                          onChange={e => setScheduleForm({
                            ...scheduleForm,
                            [day]: { ...scheduleForm[day], start: e.target.value }
                          })}
                          className="w-24 bg-brand-surface/40 border border-border/50 rounded-lg px-2 py-1 text-xs text-foreground focus:outline-none"
                        />
                        <span className="text-xs text-foreground/45">to</span>
                        <input
                          type="text"
                          placeholder="05:00 PM"
                          value={scheduleForm[day].end}
                          onChange={e => setScheduleForm({
                            ...scheduleForm,
                            [day]: { ...scheduleForm[day], end: e.target.value }
                          })}
                          className="w-24 bg-brand-surface/40 border border-border/50 rounded-lg px-2 py-1 text-xs text-foreground focus:outline-none"
                        />
                      </div>
                    ) : (
                      <span className="text-xs text-foreground/35 font-semibold italic">Not available (Off Day)</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2 border-t border-border/60">
              <button type="button" onClick={onClose} className="flex-1 px-4 py-3 rounded-xl bg-brand-surface border border-border text-foreground/60 text-sm font-bold hover:text-foreground transition-all">
                Cancel
              </button>
              <button type="submit" className="flex-1 px-4 py-3 rounded-xl bg-gradient-primary text-white text-sm font-extrabold transition-all shadow-btn hover:shadow-btn-hover hover:scale-[1.01]">
                Add to Staff
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type ViewMode = 'grid' | 'list';
type FilterStatus = 'All' | Doctor['status'];

export default function DoctorsPage() {
  const { initializeStore, doctors, patients, appointments } = useStore();
  useEffect(() => { initializeStore(); }, [initializeStore]);

  const [currentUser, setCurrentUser] = useState<{ name: string; email: string; role: string } | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => { if (res.ok) return res.json(); throw new Error(''); })
      .then((data) => { if (data.user) setCurrentUser(data.user); })
      .catch(() => {});
  }, []);

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('All');
  const [filterDept, setFilterDept] = useState('All');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedDoc, setSelectedDoc] = useState<Doctor | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const departments = useMemo(() => ['All', ...Array.from(new Set(doctors.map(d => d.department))).sort()], [doctors]);

  const filtered = useMemo(() => {
    return doctors.filter(d => {
      if (filterStatus !== 'All' && d.status !== filterStatus) return false;
      if (filterDept !== 'All' && d.department !== filterDept) return false;
      if (search) {
        const q = search.toLowerCase();
        return d.name.toLowerCase().includes(q) || d.id.toLowerCase().includes(q) ||
          d.specialty.some(s => s.toLowerCase().includes(q)) ||
          d.department.toLowerCase().includes(q);
      }
      return true;
    });
  }, [doctors, filterStatus, filterDept, search]);

  const stats = useMemo(() => ({
    total: doctors.length,
    available: doctors.filter(d => d.status === 'Available').length,
    inSurgery: doctors.filter(d => d.status === 'In Surgery').length,
    onLeave: doctors.filter(d => d.status === 'On Leave').length,
    offDuty: doctors.filter(d => d.status === 'Off Duty').length,
  }), [doctors]);

  return (
    <PageWrapper>
      <div className="flex flex-col gap-6 pb-10 animate-fade-in-up">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/50 pb-5">
          <div>
            <h1 className="text-2xl font-black font-display tracking-tight text-foreground">Medical Staff Directory</h1>
            <p className="text-xs text-foreground/45 mt-1 font-medium">Browse and manage all doctors and specialists</p>
          </div>
          {currentUser?.role === 'admin' && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-primary text-white text-sm font-extrabold transition-all shadow-btn hover:shadow-btn-hover hover:scale-[1.02]"
              >
                <Plus className="h-4 w-4" />
                Add Doctor
              </button>
            </div>
          )}
        </div>

        {currentUser && (
          <AccessBanner
            role={currentUser.role}
            allowedRoles={['admin', 'doctor', 'nurse', 'receptionist', 'patient']}
            message={
              currentUser.role === 'admin' ? "Access Level: Administrator (Full read/write permissions to add doctors & manage weekly schedules.)" :
              currentUser.role === 'receptionist' ? "Access Level: Receptionist (Permissions granted: View directory & edit doctor schedules.)" :
              currentUser.role === 'patient' ? "Access Level: Patient (View-only staff directory. Bookings are handled by reception.)" :
              "Access Level: Clinical Staff (Permissions granted: View directory & update weekly availability.)"
            }
          />
        )}

        {currentUser && ['admin', 'doctor', 'nurse', 'receptionist', 'patient'].includes(currentUser.role) && (
          <>
            {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: 'Total Staff', value: stats.total, color: 'text-foreground' },
            { label: 'Available', value: stats.available, color: 'text-brand-teal' },
            { label: 'In Surgery', value: stats.inSurgery, color: 'text-brand-red' },
            { label: 'On Leave', value: stats.onLeave, color: 'text-brand-amber' },
            { label: 'Off Duty', value: stats.offDuty, color: 'text-foreground/40' },
          ].map(s => (
            <div key={s.label} className="glass-card p-4 flex flex-col gap-1">
              <span className={cn('text-2xl font-black font-mono', s.color)}>{s.value}</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="glass-card p-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/30" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, specialty, department..."
              className="w-full pl-9 pr-3 py-2.5 bg-brand-surface/30 border border-border/60 rounded-xl text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-brand-teal/40 transition-all"
            />
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-1 bg-brand-surface border border-border/60 rounded-xl p-1 shrink-0">
            <button onClick={() => setViewMode('grid')} className={cn('px-3 py-1.5 rounded-lg text-xs font-bold transition-all', viewMode === 'grid' ? 'bg-[#4F8CFF] text-white shadow-sm' : 'text-foreground/40 hover:text-foreground')}>
              Grid
            </button>
            <button onClick={() => setViewMode('list')} className={cn('px-3 py-1.5 rounded-lg text-xs font-bold transition-all', viewMode === 'list' ? 'bg-[#4F8CFF] text-white shadow-sm' : 'text-foreground/40 hover:text-foreground')}>
              List
            </button>
          </div>
        </div>

        {/* Status + Dept Filters */}
        <div className="flex flex-wrap gap-2 -mt-2">
          {(['All', 'Available', 'In Surgery', 'On Leave', 'Off Duty'] as FilterStatus[]).map(s => (
            <button key={s} onClick={() => setFilterStatus(s)} className={cn(
              'px-3 py-1 rounded-full text-[11px] font-bold border transition-all',
              filterStatus === s ? 'bg-gradient-primary text-white border-transparent shadow-sm' : 'bg-brand-dark border-border/60 text-foreground/50 hover:bg-brand-surface hover:text-foreground'
            )}>{s}</button>
          ))}
          <span className="text-foreground/20 flex items-center">·</span>
          {departments.slice(0, 7).map(d => (
            <button key={d} onClick={() => setFilterDept(d)} className={cn(
              'px-3 py-1 rounded-full text-[11px] font-bold border transition-all',
              filterDept === d ? 'bg-amber-500/20 border-amber-500/40 text-amber-700 font-extrabold' : 'bg-brand-dark border-border/60 text-foreground/50 hover:bg-brand-surface hover:text-foreground'
            )}>{d}</button>
          ))}
        </div>

        {/* Results count */}
        <div className="flex items-center gap-2 text-xs text-foreground/40 font-semibold -mt-3">
          <Filter className="h-3.5 w-3.5" />
          Showing <span className="text-foreground/70 font-bold">{filtered.length}</span> of <span className="text-foreground/70">{doctors.length}</span> staff members
        </div>

        {/* Doctor Grid / List */}
        {filtered.length === 0 ? (
          <EmptyState
            icon={<Stethoscope className="h-10 w-10" />}
            title="No staff found"
            description="Try adjusting your search or filters."
          />
        ) : viewMode === 'grid' ? (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {filtered.map(doc => (
                <DoctorCard
                  key={doc.id}
                  doctor={doc}
                  onClick={() => setSelectedDoc(doc)}
                  patientCount={patients.filter(p => p.assignedDoctorId === doc.id).length}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div className="glass-card overflow-hidden">
            {/* Table header */}
            <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-4 px-5 py-3 border-b border-border/60 bg-brand-surface/40">
              {['Doctor', 'Department', 'Status', 'Experience', 'Patients', ''].map(h => (
                <span key={h} className="text-[10px] font-bold uppercase tracking-widest text-foreground/35">{h}</span>
              ))}
            </div>
            <div className="divide-y divide-border/40">
              <AnimatePresence>
                {filtered.map((doc, idx) => {
                  const patientCount = patients.filter(p => p.assignedDoctorId === doc.id).length;
                  return (
                    <motion.div
                      key={doc.id}
                      layout
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: idx * 0.02 }}
                      onClick={() => setSelectedDoc(doc)}
                      className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-4 px-5 py-4 hover:bg-[#4F8CFF]/5 cursor-pointer transition-all group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar name={doc.name} size="sm" />
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-foreground truncate group-hover:text-brand-teal transition-colors">{doc.name}</p>
                          <p className="text-[10px] text-foreground/40 font-mono mt-0.5">{doc.id}</p>
                        </div>
                      </div>
                      <div className="flex items-center"><span className="text-xs text-foreground/60 truncate">{doc.department}</span></div>
                      <div className="flex items-center"><Badge variant={getDocStatusVariant(doc.status)}>{doc.status}</Badge></div>
                      <div className="flex items-center"><span className="text-xs text-foreground/60">{doc.experience} yrs</span></div>
                      <div className="flex items-center"><span className="text-xs text-foreground/60">{patientCount} patients</span></div>
                      <div className="flex items-center justify-end">
                        <ChevronRight className="h-4 w-4 text-foreground/20 group-hover:text-brand-teal transition-colors" />
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        )}
          </>
        )}
      </div>

      {/* Doctor Detail Drawer */}
      {selectedDoc && (
        <DoctorDrawer
          doctor={selectedDoc}
          onClose={() => setSelectedDoc(null)}
          patients={patients}
          appointments={appointments}
          isAdmin={currentUser?.role === 'admin' || currentUser?.role === 'receptionist'}
        />
      )}

      {/* Add Doctor Modal */}
      {showAddModal && (
        <AddDoctorModal onClose={() => setShowAddModal(false)} />
      )}
    </PageWrapper>
  );
}
