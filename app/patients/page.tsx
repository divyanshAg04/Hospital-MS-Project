'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useStore } from '@/hooks/useStore';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Patient, Doctor } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { StatusDot } from '@/components/ui/StatusDot';
import { EmptyState } from '@/components/ui/EmptyState';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Search, Filter, Plus, X, ChevronDown, 
  Phone, Mail, MapPin, Calendar, Heart, Shield,
  AlertTriangle, Activity, Bed, Clock, ChevronRight,
  FileText, Trash2, Edit3, Download, MoreVertical,
  UserCheck, Stethoscope, ArrowUpDown, ArrowUp, ArrowDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, differenceInYears, parseISO } from 'date-fns';
import { AccessBanner } from '@/components/ui/AccessBanner';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getPatientStatusVariant(status: Patient['status']) {
  const map: Record<Patient['status'], 'teal' | 'red' | 'grey' | 'amber'> = {
    'Active': 'teal',
    'Critical': 'red',
    'Discharged': 'grey',
    'Under Observation': 'amber',
  };
  return map[status] ?? 'grey';
}

function getAdmissionTypeVariant(type: Patient['admissionType']) {
  const map: Record<Patient['admissionType'], 'teal' | 'amber' | 'red'> = {
    'OPD': 'teal',
    'IPD': 'amber',
    'Emergency': 'red',
  };
  return map[type] ?? 'grey' as 'teal';
}

function calcAge(dob: string) {
  try {
    return differenceInYears(new Date(), parseISO(dob));
  } catch {
    return '--';
  }
}

// ─── Patient Drawer ───────────────────────────────────────────────────────────

function PatientDrawer({ patient, onClose, doctors }: {
  patient: Patient;
  onClose: () => void;
  doctors: Doctor[];
}) {
  const { updatePatient, deletePatient } = useStore();
  const assignedDoc = doctors.find(d => d.id === patient.assignedDoctorId);
  const age = calcAge(patient.dob);

  const statusOptions: Patient['status'][] = ['Active', 'Critical', 'Under Observation', 'Discharged'];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.aside
        initial={{ x: '100%', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '100%', opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed right-0 top-0 h-full w-full max-w-lg z-50 flex flex-col glass-panel border-l border-border/60 overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border/60 bg-brand-surface/80 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <Avatar name={patient.name} size="md" />
            <div>
              <h2 className="text-base font-bold text-foreground">{patient.name}</h2>
              <p className="text-xs text-foreground/45 font-mono mt-0.5">{patient.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-brand-surface text-foreground/40 hover:text-foreground transition-all">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-5 p-6">
          {/* Status badges row */}
          <div className="flex flex-wrap gap-2">
            <Badge variant={getPatientStatusVariant(patient.status)}>{patient.status}</Badge>
            <Badge variant={getAdmissionTypeVariant(patient.admissionType)}>{patient.admissionType}</Badge>
            <Badge variant="grey">{patient.bloodGroup}</Badge>
            <Badge variant="grey">{patient.gender}</Badge>
            <Badge variant="grey">{age} yrs old</Badge>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-3">
            <InfoTile icon={<Phone className="h-3.5 w-3.5" />} label="Phone" value={patient.phone} />
            <InfoTile icon={<Mail className="h-3.5 w-3.5" />} label="Email" value={patient.email} />
            <InfoTile icon={<MapPin className="h-3.5 w-3.5" />} label="Address" value={patient.address} />
            <InfoTile icon={<Calendar className="h-3.5 w-3.5" />} label="Admitted" value={format(parseISO(patient.admissionDate), 'dd MMM yyyy')} />
            {patient.ward && <InfoTile icon={<Bed className="h-3.5 w-3.5" />} label="Ward / Bed" value={`${patient.ward} / Bed ${patient.bedNumber ?? '-'}`} />}
            <InfoTile icon={<Activity className="h-3.5 w-3.5" />} label="Department" value={patient.department} />
          </div>

          {/* Assigned Doctor */}
          {assignedDoc && (
            <div className="flex items-center gap-3 bg-brand-teal/5 border border-brand-teal/15 rounded-xl p-3.5">
              <Avatar name={assignedDoc.name} size="sm" />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-foreground truncate">{assignedDoc.name}</div>
                <div className="text-[10px] text-foreground/45 mt-0.5 truncate">{assignedDoc.specialty[0]} · {assignedDoc.department}</div>
              </div>
              <StatusDot status={assignedDoc.status} />
            </div>
          )}

          {/* Medical Info */}
          <div className="flex flex-col gap-3">
            <SectionTitle icon={<Heart className="h-3.5 w-3.5" />} title="Medical Details" />
            {patient.conditions.length > 0 && (
              <div>
                <p className="text-[10px] text-foreground/40 font-bold uppercase tracking-widest mb-2">Conditions</p>
                <div className="flex flex-wrap gap-1.5">
                  {patient.conditions.map(c => <Badge key={c} variant="red">{c}</Badge>)}
                </div>
              </div>
            )}
            {patient.symptoms.length > 0 && (
              <div>
                <p className="text-[10px] text-foreground/40 font-bold uppercase tracking-widest mb-2">Symptoms</p>
                <div className="flex flex-wrap gap-1.5">
                  {patient.symptoms.map(s => <Badge key={s} variant="amber">{s}</Badge>)}
                </div>
              </div>
            )}
            {patient.allergies.length > 0 && (
              <div>
                <p className="text-[10px] text-foreground/40 font-bold uppercase tracking-widest mb-2">Allergies</p>
                <div className="flex flex-wrap gap-1.5">
                  {patient.allergies.map(a => <Badge key={a} variant="lavender">{a}</Badge>)}
                </div>
              </div>
            )}
          </div>

          {/* Insurance */}
          {patient.insuranceProvider && (
            <div className="flex items-center gap-3 bg-brand-surface/30 border border-border/60 rounded-xl p-3.5">
              <Shield className="h-4 w-4 text-brand-lavender shrink-0" />
              <div>
                <p className="text-xs font-bold text-foreground">{patient.insuranceProvider}</p>
                <p className="text-[10px] text-foreground/45 font-mono">{patient.insuranceId}</p>
              </div>
            </div>
          )}

          {/* Emergency Contact */}
          <div className="flex flex-col gap-2">
            <SectionTitle icon={<AlertTriangle className="h-3.5 w-3.5" />} title="Emergency Contact" />
            <div className="bg-brand-red/5 border border-brand-red/15 rounded-xl p-3.5">
              <p className="text-xs font-bold text-foreground">{patient.emergencyContact.name}</p>
              <p className="text-[10px] text-foreground/45 mt-0.5">{patient.emergencyContact.relation}</p>
              <p className="text-[10px] text-brand-teal mt-1 font-mono">{patient.emergencyContact.phone}</p>
            </div>
          </div>

          {/* Notes */}
          {patient.notes && (
            <div>
              <SectionTitle icon={<FileText className="h-3.5 w-3.5" />} title="Clinical Notes" />
              <p className="text-xs text-foreground/60 leading-relaxed mt-2 bg-brand-surface/30 border border-border/60 rounded-xl p-3.5">{patient.notes}</p>
            </div>
          )}

          {/* Status Change */}
          <div>
            <SectionTitle icon={<Activity className="h-3.5 w-3.5" />} title="Update Status" />
            <div className="flex flex-wrap gap-2 mt-2">
              {statusOptions.map(s => (
                <button
                  key={s}
                  onClick={() => updatePatient(patient.id, { status: s })}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-bold transition-all border',
                    patient.status === s
                      ? 'bg-brand-teal/20 border-brand-teal/40 text-brand-teal'
                      : 'bg-brand-surface/20 border-border/60 text-foreground/50 hover:border-brand-teal/30 hover:text-foreground'
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2 border-t border-border/60">
            <button
              onClick={() => { deletePatient(patient.id); onClose(); }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-red/10 border border-brand-red/20 text-brand-red text-xs font-bold hover:bg-brand-red/20 transition-all"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete Patient
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-surface border border-border text-foreground/60 text-xs font-bold hover:text-foreground hover:bg-brand-surface/80 transition-all ml-auto">
              <Download className="h-3.5 w-3.5" />
              Export Record
            </button>
          </div>
        </div>
      </motion.aside>
    </AnimatePresence>
  );
}

function InfoTile({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 bg-brand-surface/20 border border-border/60 rounded-xl p-3">
      <div className="flex items-center gap-1.5 text-foreground/40">
        {icon}
        <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
      </div>
      <span className="text-xs font-semibold text-foreground truncate">{value}</span>
    </div>
  );
}

function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 text-foreground/50">
      {icon}
      <span className="text-[11px] font-bold uppercase tracking-widest">{title}</span>
    </div>
  );
}

// ─── Add Patient Modal ────────────────────────────────────────────────────────

const DEPARTMENTS = ['Cardiology','Neurology','Orthopedics','Pediatrics','Oncology','Radiology','ICU','Emergency','Dermatology','General Medicine'];
const BLOOD_GROUPS = ['A+','A-','B+','B-','O+','O-','AB+','AB-'];

function AddPatientModal({ onClose, doctors }: {
  onClose: () => void;
  doctors: Doctor[];
}) {
  const { addPatient } = useStore();

  const [form, setForm] = useState({
    name: '', dob: '', gender: 'Male' as Patient['gender'],
    bloodGroup: 'O+' as Patient['bloodGroup'],
    phone: '', email: '', address: '',
    department: 'General Medicine' as Patient['department'],
    assignedDoctorId: '',
    status: 'Active' as Patient['status'],
    admissionType: 'OPD' as Patient['admissionType'],
    admissionDate: new Date().toISOString().split('T')[0],
    ward: '', bedNumber: '', insuranceProvider: '', insuranceId: '',
    emergencyName: '', emergencyRelation: '', emergencyPhone: '',
    conditions: '', symptoms: '', allergies: '', notes: '',
  });

  const availableDoctors = doctors.filter(d => d.department === form.department || true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addPatient({
      name: form.name,
      dob: form.dob,
      gender: form.gender,
      bloodGroup: form.bloodGroup,
      phone: form.phone,
      email: form.email,
      address: form.address,
      department: form.department,
      assignedDoctorId: form.assignedDoctorId || (doctors[0]?.id ?? ''),
      status: form.status,
      admissionType: form.admissionType,
      admissionDate: form.admissionDate,
      ward: form.ward || undefined,
      bedNumber: form.bedNumber || undefined,
      allergies: form.allergies.split(',').map(s => s.trim()).filter(Boolean),
      conditions: form.conditions.split(',').map(s => s.trim()).filter(Boolean),
      symptoms: form.symptoms.split(',').map(s => s.trim()).filter(Boolean),
      insuranceProvider: form.insuranceProvider || undefined,
      insuranceId: form.insuranceId || undefined,
      emergencyContact: {
        name: form.emergencyName,
        relation: form.emergencyRelation,
        phone: form.emergencyPhone,
      },
      notes: form.notes || undefined,
    });
    onClose();
  };

  const inputClass = "w-full bg-brand-surface/30 border border-border/60 rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-brand-teal/40 focus:ring-1 focus:ring-brand-teal/20 transition-all";
  const labelClass = "text-[10px] font-bold uppercase tracking-widest text-foreground/40 mb-1 block";
  const selectClass = inputClass + " appearance-none cursor-pointer";

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
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="glass-card w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-6 py-5 border-b border-border/60">
            <div>
              <h2 className="text-base font-bold text-foreground">Register New Patient</h2>
              <p className="text-xs text-foreground/40 mt-0.5">Fill in the patient details below</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-brand-surface text-foreground/40 hover:text-foreground transition-all">
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
            {/* Personal Info */}
            <div>
              <p className="text-[11px] font-bold text-brand-teal uppercase tracking-widest border-b border-border/40 pb-2 mb-4">Personal Information</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className={labelClass}>Full Name *</label>
                  <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. Priya Mehta" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Date of Birth *</label>
                  <input required type="date" value={form.dob} onChange={e => setForm({...form, dob: e.target.value})} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Gender</label>
                  <select value={form.gender} onChange={e => setForm({...form, gender: e.target.value as Patient['gender']})} className={selectClass}>
                    <option>Male</option><option>Female</option><option>Other</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Blood Group</label>
                  <select value={form.bloodGroup} onChange={e => setForm({...form, bloodGroup: e.target.value as Patient['bloodGroup']})} className={selectClass}>
                    {BLOOD_GROUPS.map(b => <option key={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Phone *</label>
                  <input required value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+91 98765 43210" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Email</label>
                  <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="patient@email.com" className={inputClass} />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClass}>Address</label>
                  <input value={form.address} onChange={e => setForm({...form, address: e.target.value})} placeholder="Street, City, State" className={inputClass} />
                </div>
              </div>
            </div>

            {/* Admission Info */}
            <div>
              <p className="text-[11px] font-bold text-brand-teal uppercase tracking-widest border-b border-border/40 pb-2 mb-4">Admission Details</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Department *</label>
                  <select required value={form.department} onChange={e => setForm({...form, department: e.target.value as Patient['department']})} className={selectClass}>
                    {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Assigned Doctor</label>
                  <select value={form.assignedDoctorId} onChange={e => setForm({...form, assignedDoctorId: e.target.value})} className={selectClass}>
                    <option value="">-- Auto-assign --</option>
                    {availableDoctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Admission Type</label>
                  <select value={form.admissionType} onChange={e => setForm({...form, admissionType: e.target.value as Patient['admissionType']})} className={selectClass}>
                    <option>OPD</option><option>IPD</option><option>Emergency</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Status</label>
                  <select value={form.status} onChange={e => setForm({...form, status: e.target.value as Patient['status']})} className={selectClass}>
                    <option>Active</option><option>Critical</option><option>Under Observation</option><option>Discharged</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Admission Date *</label>
                  <input required type="date" value={form.admissionDate} onChange={e => setForm({...form, admissionDate: e.target.value})} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Ward</label>
                  <input value={form.ward} onChange={e => setForm({...form, ward: e.target.value})} placeholder="e.g. General Ward A" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Bed Number</label>
                  <input value={form.bedNumber} onChange={e => setForm({...form, bedNumber: e.target.value})} placeholder="e.g. B-204" className={inputClass} />
                </div>
              </div>
            </div>

            {/* Medical Info */}
            <div>
              <p className="text-[11px] font-bold text-brand-teal uppercase tracking-widest border-b border-border/40 pb-2 mb-4">Medical Information <span className="text-foreground/30 normal-case">(comma-separated)</span></p>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className={labelClass}>Conditions</label>
                  <input value={form.conditions} onChange={e => setForm({...form, conditions: e.target.value})} placeholder="Hypertension, Diabetes Type 2" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Symptoms</label>
                  <input value={form.symptoms} onChange={e => setForm({...form, symptoms: e.target.value})} placeholder="Chest Pain, Fatigue" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Allergies</label>
                  <input value={form.allergies} onChange={e => setForm({...form, allergies: e.target.value})} placeholder="Penicillin, Peanuts" className={inputClass} />
                </div>
              </div>
            </div>

            {/* Insurance & Emergency */}
            <div>
              <p className="text-[11px] font-bold text-brand-teal uppercase tracking-widest border-b border-border/40 pb-2 mb-4">Insurance & Emergency Contact</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Insurance Provider</label>
                  <input value={form.insuranceProvider} onChange={e => setForm({...form, insuranceProvider: e.target.value})} placeholder="Star Health" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Insurance ID</label>
                  <input value={form.insuranceId} onChange={e => setForm({...form, insuranceId: e.target.value})} placeholder="SH-29384729" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Emergency Contact Name *</label>
                  <input required value={form.emergencyName} onChange={e => setForm({...form, emergencyName: e.target.value})} placeholder="Rahul Mehta" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Relation</label>
                  <input value={form.emergencyRelation} onChange={e => setForm({...form, emergencyRelation: e.target.value})} placeholder="Spouse" className={inputClass} />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClass}>Emergency Phone *</label>
                  <input required value={form.emergencyPhone} onChange={e => setForm({...form, emergencyPhone: e.target.value})} placeholder="+91 98765 00000" className={inputClass} />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className={labelClass}>Clinical Notes</label>
              <textarea rows={3} value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="Any special notes for the attending staff..." className={inputClass + " resize-none"} />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2 border-t border-border/60">
              <button type="button" onClick={onClose} className="flex-1 px-4 py-3 rounded-xl bg-brand-surface border border-border text-foreground/60 text-sm font-bold hover:text-foreground transition-all">
                Cancel
              </button>
              <button type="submit" className="flex-1 px-4 py-3 rounded-xl bg-gradient-primary text-white text-sm font-extrabold transition-all shadow-btn hover:shadow-btn-hover hover:scale-[1.01]">
                Register Patient
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type FilterStatus = 'All' | Patient['status'];
type FilterType = 'All' | Patient['admissionType'];

export default function PatientsPage() {
  const { initializeStore, patients, doctors } = useStore();

  useEffect(() => { initializeStore(); }, [initializeStore]);

  const [currentUser, setCurrentUser] = useState<{ name: string; email: string; role: string } | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => { if (res.ok) return res.json(); throw new Error(''); })
      .then((data) => { if (data.user) setCurrentUser(data.user); })
      .catch(() => {})
      .finally(() => setLoadingUser(false));
  }, []);

  const patientRecord = useMemo(() => {
    if (!currentUser || currentUser.role !== 'patient') return null;
    return patients.find(p => p.email.toLowerCase() === currentUser.email.toLowerCase()) || null;
  }, [patients, currentUser]);

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('All');
  const [filterType, setFilterType] = useState<FilterType>('All');
  const [filterDept, setFilterDept] = useState('All');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [sortBy, setSortBy] = useState<'recent' | 'name' | 'status' | 'department' | 'type'>('recent');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  const departments = useMemo(() => ['All', ...Array.from(new Set(patients.map(p => p.department))).sort()], [patients]);

  const filtered = useMemo(() => {
    const list = patients.filter(p => {
      if (filterStatus !== 'All' && p.status !== filterStatus) return false;
      if (filterType !== 'All' && p.admissionType !== filterType) return false;
      if (filterDept !== 'All' && p.department !== filterDept) return false;
      if (search) {
        const q = search.toLowerCase();
        return p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q) || p.phone.includes(q) || p.department.toLowerCase().includes(q);
      }
      return true;
    });

    return [...list].sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'recent') {
        const dateA = a.createdAt || '';
        const dateB = b.createdAt || '';
        if (dateA && dateB && dateA !== dateB) {
          comparison = dateA.localeCompare(dateB);
        } else {
          comparison = a.id.localeCompare(b.id);
        }
      } else if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === 'status') {
        comparison = a.status.localeCompare(b.status);
      } else if (sortBy === 'department') {
        comparison = a.department.localeCompare(b.department);
      } else if (sortBy === 'type') {
        comparison = a.admissionType.localeCompare(b.admissionType);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [patients, filterStatus, filterType, filterDept, search, sortBy, sortOrder]);

  // Stats
  const stats = useMemo(() => ({
    total: patients.length,
    active: patients.filter(p => p.status === 'Active').length,
    critical: patients.filter(p => p.status === 'Critical').length,
    observation: patients.filter(p => p.status === 'Under Observation').length,
    discharged: patients.filter(p => p.status === 'Discharged').length,
    emergency: patients.filter(p => p.admissionType === 'Emergency').length,
  }), [patients]);

  if (loadingUser) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-teal" />
        </div>
      </PageWrapper>
    );
  }

  if (currentUser && currentUser.role === 'patient') {
    if (!patientRecord) {
      return (
        <PageWrapper>
          <div className="flex flex-col gap-6 pb-10 animate-fade-in-up">
            <div>
              <h1 className="text-2xl font-black font-display tracking-tight text-foreground">My Medical Profile</h1>
              <p className="text-xs text-foreground/45 mt-1 font-medium">View your registered medical records and treatment details</p>
            </div>
            <AccessBanner
              role={currentUser.role}
              allowedRoles={['admin', 'doctor', 'nurse', 'receptionist', 'patient']}
              message="Access Level: Patient (Authorized to view your own medical record only)"
            />
            <EmptyState
              icon={<Users className="h-10 w-10 text-brand-red animate-pulse" />}
              title="No Patient Record Found"
              description={`We could not locate a registered patient record matching your email address (${currentUser.email}). Please contact a receptionist or administrator to link your account.`}
            />
          </div>
        </PageWrapper>
      );
    }

    const assignedDoc = doctors.find(d => d.id === patientRecord.assignedDoctorId);
    const age = calcAge(patientRecord.dob);

    return (
      <PageWrapper>
        <div className="flex flex-col gap-6 pb-10 animate-fade-in-up">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/50 pb-5">
            <div>
              <h1 className="text-2xl font-black font-display tracking-tight text-foreground">My Medical Profile</h1>
              <p className="text-xs text-foreground/45 mt-1 font-medium">Your personal medical chart and clinic registration details</p>
            </div>
          </div>

          <AccessBanner
            role={currentUser.role}
            allowedRoles={['admin', 'doctor', 'nurse', 'receptionist', 'patient']}
            message="Access Level: Patient (Authorized to view your own medical record only)"
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Basic Info Card */}
            <div className="glass-card flex flex-col gap-6 p-6 lg:col-span-1">
              <div className="flex flex-col items-center text-center gap-3">
                <Avatar name={patientRecord.name} size="lg" />
                <div>
                  <h2 className="text-lg font-black text-foreground">{patientRecord.name}</h2>
                  <p className="text-xs text-foreground/40 font-mono mt-0.5">{patientRecord.id}</p>
                </div>
                <div className="flex flex-wrap gap-1.5 justify-center mt-2">
                  <Badge variant={getPatientStatusVariant(patientRecord.status)}>{patientRecord.status}</Badge>
                  <Badge variant={getAdmissionTypeVariant(patientRecord.admissionType)}>{patientRecord.admissionType}</Badge>
                </div>
              </div>

              <div className="border-t border-border/40 pt-4 flex flex-col gap-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-foreground/40 font-bold uppercase tracking-wider">Gender</span>
                  <span className="text-foreground font-semibold">{patientRecord.gender}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-foreground/40 font-bold uppercase tracking-wider">DOB / Age</span>
                  <span className="text-foreground font-semibold">{patientRecord.dob} ({age} yrs)</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-foreground/40 font-bold uppercase tracking-wider">Blood Group</span>
                  <span className="text-foreground font-semibold">{patientRecord.bloodGroup}</span>
                </div>
              </div>
            </div>

            {/* Right/Middle Column: Clinical & Contact Details */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              {/* Info Grid */}
              <div className="glass-card p-6 flex flex-col gap-4">
                <h3 className="text-xs font-extrabold uppercase tracking-widest text-brand-teal border-b border-border/40 pb-2">Contact & Registration</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InfoTile icon={<Phone className="h-3.5 w-3.5" />} label="Phone Number" value={patientRecord.phone} />
                  <InfoTile icon={<Mail className="h-3.5 w-3.5" />} label="Email Address" value={patientRecord.email} />
                  <InfoTile icon={<MapPin className="h-3.5 w-3.5" />} label="Home Address" value={patientRecord.address} />
                  <InfoTile icon={<Calendar className="h-3.5 w-3.5" />} label="Admitted Date" value={format(parseISO(patientRecord.admissionDate), 'dd MMM yyyy')} />
                  {patientRecord.ward && <InfoTile icon={<Bed className="h-3.5 w-3.5" />} label="Ward / Bed" value={`${patientRecord.ward} / Bed ${patientRecord.bedNumber ?? '-'}`} />}
                  <InfoTile icon={<Activity className="h-3.5 w-3.5" />} label="Clinic Department" value={patientRecord.department} />
                </div>
              </div>

              {/* Attending Doctor */}
              {assignedDoc && (
                <div className="glass-card p-6 flex flex-col gap-4">
                  <h3 className="text-xs font-extrabold uppercase tracking-widest text-brand-teal border-b border-border/40 pb-2">Attending Clinician</h3>
                  <div className="flex items-center gap-4 bg-brand-teal/5 border border-brand-teal/15 rounded-xl p-4">
                    <Avatar name={assignedDoc.name} size="md" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-foreground truncate">{assignedDoc.name}</div>
                      <div className="text-xs text-foreground/45 mt-0.5 truncate">{assignedDoc.specialty.join(', ')} · {assignedDoc.department}</div>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <StatusDot status={assignedDoc.status} />
                      <span className="text-[10px] text-foreground/40 font-bold uppercase tracking-wider">{assignedDoc.status}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Medical Information */}
              <div className="glass-card p-6 flex flex-col gap-4">
                <h3 className="text-xs font-extrabold uppercase tracking-widest text-brand-teal border-b border-border/40 pb-2">Medical History</h3>
                
                {patientRecord.conditions.length > 0 && (
                  <div>
                    <p className="text-[10px] text-foreground/40 font-bold uppercase tracking-widest mb-2">Active Conditions</p>
                    <div className="flex flex-wrap gap-1.5">
                      {patientRecord.conditions.map(c => <Badge key={c} variant="red">{c}</Badge>)}
                    </div>
                  </div>
                )}
                
                {patientRecord.symptoms.length > 0 && (
                  <div>
                    <p className="text-[10px] text-foreground/40 font-bold uppercase tracking-widest mb-2">Current Symptoms</p>
                    <div className="flex flex-wrap gap-1.5">
                      {patientRecord.symptoms.map(s => <Badge key={s} variant="amber">{s}</Badge>)}
                    </div>
                  </div>
                )}
                
                {patientRecord.allergies.length > 0 && (
                  <div>
                    <p className="text-[10px] text-foreground/40 font-bold uppercase tracking-widest mb-2">Known Allergies</p>
                    <div className="flex flex-wrap gap-1.5">
                      {patientRecord.allergies.map(a => <Badge key={a} variant="lavender">{a}</Badge>)}
                    </div>
                  </div>
                )}

                {patientRecord.insuranceProvider && (
                  <div className="flex items-center gap-3 bg-brand-surface border border-border/50 rounded-xl p-3.5 mt-2">
                    <Shield className="h-4 w-4 text-brand-lavender shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-foreground">Insurance Carrier: {patientRecord.insuranceProvider}</p>
                      <p className="text-[10px] text-foreground/45 font-mono">Policy ID: {patientRecord.insuranceId}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Emergency Contact */}
              <div className="glass-card p-6 flex flex-col gap-4">
                <h3 className="text-xs font-extrabold uppercase tracking-widest text-brand-teal border-b border-border/40 pb-2">Emergency Contact</h3>
                <div className="bg-brand-red/5 border border-brand-red/15 rounded-xl p-4">
                  <p className="text-sm font-bold text-foreground">{patientRecord.emergencyContact.name}</p>
                  <p className="text-xs text-foreground/45 mt-0.5">Relationship: {patientRecord.emergencyContact.relation}</p>
                  <p className="text-xs text-brand-teal mt-2 font-mono font-bold">Contact Number: {patientRecord.emergencyContact.phone}</p>
                </div>
              </div>

              {/* Notes */}
              {patientRecord.notes && (
                <div className="glass-card p-6 flex flex-col gap-4">
                  <h3 className="text-xs font-extrabold uppercase tracking-widest text-brand-teal border-b border-border/40 pb-2">Patient Disclosure Notes</h3>
                  <p className="text-xs text-foreground/60 leading-relaxed bg-brand-surface border border-border/50 rounded-xl p-4">{patientRecord.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="flex flex-col gap-6 pb-10 animate-fade-in-up">

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/50 pb-5">
          <div>
            <h1 className="text-2xl font-black font-display tracking-tight text-foreground">Patient Registry</h1>
            <p className="text-xs text-foreground/45 mt-1 font-medium">Manage and monitor all patient records across departments</p>
          </div>
          {currentUser && (currentUser.role === 'admin' || currentUser.role === 'receptionist') && (
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-primary text-white text-sm font-extrabold transition-all shadow-btn hover:shadow-btn-hover hover:scale-[1.02]"
              >
                <Plus className="h-4 w-4" />
                Register Patient
              </button>
            </div>
          )}
        </div>

        {currentUser && (
          <AccessBanner
            role={currentUser.role}
            allowedRoles={['admin', 'doctor', 'nurse', 'receptionist', 'patient']}
            message={
              currentUser.role === 'admin' ? "Access Level: Administrator (Full read/write permissions to add, edit & delete patient records.)" :
              currentUser.role === 'receptionist' ? "Access Level: Receptionist (Permissions granted: Add/register new patients & view directory.)" :
              currentUser.role === 'patient' ? "Access Level: Patient (View-only patient directory. You cannot register or edit records.)" :
              "Access Level: Clinical Staff (Permissions granted: View patient registry & details.)"
            }
          />
        )}

        {currentUser && ['admin', 'doctor', 'nurse', 'receptionist'].includes(currentUser.role) && (
          <>
            {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 shrink-0">
          {[
            { label: 'Total', value: stats.total, color: 'text-foreground', bg: 'bg-brand-surface/30' },
            { label: 'Active', value: stats.active, color: 'text-brand-teal', bg: 'bg-brand-teal/5' },
            { label: 'Critical', value: stats.critical, color: 'text-brand-red', bg: 'bg-brand-red/5' },
            { label: 'Observation', value: stats.observation, color: 'text-brand-amber', bg: 'bg-brand-amber/5' },
            { label: 'Discharged', value: stats.discharged, color: 'text-foreground/40', bg: 'bg-brand-surface/20' },
            { label: 'Emergency', value: stats.emergency, color: 'text-brand-red', bg: 'bg-brand-red/5' },
          ].map(s => (
            <div key={s.label} className={cn('glass-card p-4 flex flex-col gap-1 border border-border/60', s.bg)}>
              <span className={cn('text-2xl font-black font-mono', s.color)}>{s.value}</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Filters & Search */}
        <div className="glass-card p-4 flex flex-col sm:flex-row gap-3 shrink-0 items-stretch sm:items-center">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/30" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, ID, phone, department..."
              className="w-full pl-9 pr-3 py-2.5 bg-brand-surface/30 border border-border/60 rounded-xl text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-brand-teal/40 transition-all"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
            {(['All', 'Active', 'Critical', 'Under Observation', 'Discharged'] as FilterStatus[]).map(s => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={cn(
                  'px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border',
                  filterStatus === s
                    ? 'bg-gradient-primary text-white border-transparent shadow-sm'
                    : 'bg-brand-dark border-border/60 text-foreground/50 hover:bg-brand-surface hover:text-foreground'
                )}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Sort Control */}
          <div className="relative shrink-0">
            <button
              onClick={() => setShowSortDropdown(!showSortDropdown)}
              className="flex items-center justify-between gap-2 px-3 py-2 bg-brand-dark border border-border/60 hover:bg-brand-surface text-foreground/75 hover:text-foreground rounded-xl text-xs font-bold transition-all shadow-sm w-full sm:w-auto"
            >
              <div className="flex items-center gap-1.5">
                <ArrowUpDown className="h-3.5 w-3.5 text-foreground/45" />
                <span>Sort: {
                  sortBy === 'recent' ? 'Recently Registered' : 
                  sortBy === 'name' ? 'Name' : 
                  sortBy === 'status' ? 'Status' : 
                  sortBy === 'department' ? 'Department' : 
                  'Type'
                }</span>
              </div>
              <ChevronDown className={cn("h-3.5 w-3.5 text-foreground/40 transition-transform duration-200", showSortDropdown && "rotate-180")} />
            </button>

            {showSortDropdown && (
              <>
                {/* Backdrop to close dropdown */}
                <div className="fixed inset-0 z-20" onClick={() => setShowSortDropdown(false)} />
                <div className="absolute right-0 mt-2 w-52 z-30 glass-panel border border-border/60 rounded-2xl shadow-xl p-1.5 animate-fade-in">
                  <div className="text-[9px] font-extrabold text-foreground/40 uppercase tracking-widest px-2.5 py-1.5 border-b border-border/30 mb-1.5">
                    Sort Patients By
                  </div>
                  {[
                    { id: 'recent', label: 'Recently Registered' },
                    { id: 'name', label: 'Patient Name' },
                    { id: 'status', label: 'Status' },
                    { id: 'department', label: 'Department' },
                    { id: 'type', label: 'Admission Type' }
                  ].map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => {
                        if (sortBy === option.id) {
                          // Toggle order if clicking the active option
                          setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                        } else {
                          setSortBy(option.id as any);
                          // Default to desc for recent, asc for others
                          setSortOrder(option.id === 'recent' ? 'desc' : 'asc');
                        }
                        setShowSortDropdown(false);
                      }}
                      className={cn(
                        "w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-bold rounded-lg transition-all",
                        sortBy === option.id
                          ? "bg-brand-teal/10 text-brand-teal"
                          : "text-foreground/60 hover:bg-brand-surface hover:text-foreground"
                      )}
                    >
                      <span>{option.label}</span>
                      {sortBy === option.id && (
                        sortOrder === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Department & Type Filters */}
        <div className="flex flex-wrap gap-2 shrink-0">
          {(['All', 'OPD', 'IPD', 'Emergency'] as FilterType[]).map(t => (
            <button key={t} onClick={() => setFilterType(t)} className={cn(
              'px-3 py-1 rounded-full text-[11px] font-bold border transition-all',
              filterType === t ? 'bg-[#A78BFA]/20 border-[#A78BFA]/40 text-purple-700 font-extrabold' : 'bg-brand-dark border-border/60 text-foreground/50 hover:text-foreground'
            )}>{t} {t !== 'All' && 'Admission'}</button>
          ))}
          <span className="text-foreground/20 flex items-center">·</span>
          {departments.slice(0, 6).map(d => (
            <button key={d} onClick={() => setFilterDept(d)} className={cn(
              'px-3 py-1 rounded-full text-[11px] font-bold border transition-all',
              filterDept === d ? 'bg-amber-500/20 border-amber-500/40 text-amber-700 font-extrabold' : 'bg-brand-dark border-border/60 text-foreground/50 hover:text-foreground'
            )}>{d}</button>
          ))}
        </div>

        {/* Results count */}
        <div className="flex items-center gap-2 text-xs text-foreground/40 font-semibold -mt-3">
          <Filter className="h-3.5 w-3.5" />
          Showing <span className="text-foreground/70 font-bold">{filtered.length}</span> of <span className="text-foreground/70">{patients.length}</span> patients
        </div>

        {/* Patient Table */}
        {filtered.length === 0 ? (
          <EmptyState
            icon={<Users className="h-10 w-10" />}
            title="No patients found"
            description="Try adjusting your search or filters to find what you're looking for."
          />
        ) : (
          <div className="glass-card overflow-hidden">
            {/* Table Header */}
            <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_auto] gap-4 px-5 py-3 border-b border-border/60 bg-brand-surface/40 select-none">
              {[
                { label: 'Patient', key: 'name' },
                { label: 'ID', key: 'recent' },
                { label: 'Department', key: 'department' },
                { label: 'Status', key: 'status' },
                { label: 'Type', key: 'type' },
                { label: 'Admitted', key: 'recent' },
              ].map((h, i) => {
                const isSorted = sortBy === h.key;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      if (sortBy === h.key) {
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      } else {
                        setSortBy(h.key as any);
                        setSortOrder(h.key === 'recent' ? 'desc' : 'asc');
                      }
                    }}
                    className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-foreground/35 hover:text-foreground/75 transition-all text-left focus:outline-none"
                  >
                    <span>{h.label}</span>
                    {isSorted && (
                      sortOrder === 'asc' ? <ArrowUp className="h-3 w-3 text-brand-teal" /> : <ArrowDown className="h-3 w-3 text-brand-teal" />
                    )}
                  </button>
                );
              })}
              <span />
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-border/40">
              <AnimatePresence>
                {filtered.map((patient, idx) => {
                  const assignedDoc = doctors.find(d => d.id === patient.assignedDoctorId);
                  const age = calcAge(patient.dob);
                  return (
                    <motion.div
                      key={patient.id}
                      layout
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: idx * 0.02, duration: 0.2 }}
                      onClick={() => setSelectedPatient(patient)}
                      className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_auto] gap-4 px-5 py-4 hover:bg-[#4F8CFF]/5 cursor-pointer transition-all group"
                    >
                      {/* Patient Name */}
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar name={patient.name} size="sm" />
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-foreground truncate group-hover:text-brand-teal transition-colors">{patient.name}</p>
                          <p className="text-[10px] text-foreground/40 mt-0.5">{patient.gender} · {age} yrs · {patient.bloodGroup}</p>
                        </div>
                      </div>

                      {/* ID */}
                      <div className="flex items-center">
                        <span className="text-xs font-mono text-foreground/50">{patient.id}</span>
                      </div>

                      {/* Department */}
                      <div className="flex items-center">
                        <span className="text-xs text-foreground/60 truncate">{patient.department}</span>
                      </div>

                      {/* Status */}
                      <div className="flex items-center gap-2">
                        <StatusDot status={patient.status === 'Active' ? 'Active' : patient.status === 'Critical' ? 'Critical' : patient.status === 'Discharged' ? 'Discharged' : 'Under Observation'} />
                        <Badge variant={getPatientStatusVariant(patient.status)}>{patient.status}</Badge>
                      </div>

                      {/* Admission Type */}
                      <div className="flex items-center">
                        <Badge variant={getAdmissionTypeVariant(patient.admissionType)}>{patient.admissionType}</Badge>
                      </div>

                      {/* Admitted Date */}
                      <div className="flex items-center">
                        <span className="text-xs text-foreground/40">
                          {(() => { try { return format(parseISO(patient.admissionDate), 'dd MMM yy'); } catch { return '—'; } })()}
                        </span>
                      </div>

                      {/* Chevron */}
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

      {/* Patient Detail Drawer */}
      {selectedPatient && (
        <PatientDrawer
          patient={selectedPatient}
          onClose={() => setSelectedPatient(null)}
          doctors={doctors}
        />
      )}

      {/* Add Patient Modal */}
      {showAddModal && (
        <AddPatientModal
          onClose={() => setShowAddModal(false)}
          doctors={doctors}
        />
      )}
    </PageWrapper>
  );
}
