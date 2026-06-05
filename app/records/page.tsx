'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useStore } from '@/hooks/useStore';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { MedicalRecord, Patient, Doctor } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { EmptyState } from '@/components/ui/EmptyState';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, Search, Plus, X, Calendar, Heart, Shield,
  Activity, Clipboard, Thermometer, User, Stethoscope, 
  Trash2, Download, ChevronRight, Filter, PlusCircle, MinusCircle, 
  AlertTriangle, CheckCircle, Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, parseISO, differenceInYears } from 'date-fns';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getLabStatusVariant(status: 'Normal' | 'Abnormal' | 'Critical') {
  const map = {
    'Normal': 'green' as const,
    'Abnormal': 'amber' as const,
    'Critical': 'red' as const,
  };
  return map[status] ?? 'grey';
}

function calcAge(dob: string) {
  try {
    return differenceInYears(new Date(), parseISO(dob));
  } catch {
    return '--';
  }
}

// ─── Detail Drawer ───────────────────────────────────────────────────────────

interface RecordDrawerProps {
  record: MedicalRecord;
  onClose: () => void;
  patients: Patient[];
  doctors: Doctor[];
}

function RecordDrawer({ record, onClose, patients, doctors }: RecordDrawerProps) {
  const patient = patients.find(p => p.id === record.patientId);
  const doctor = doctors.find(d => d.id === record.doctorId);
  const age = patient ? calcAge(patient.dob) : '--';

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
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border/60 bg-brand-surface/80 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-brand-teal/10 border border-brand-teal/20 flex items-center justify-center text-brand-teal glow-teal">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Consultation Record</h2>
              <p className="text-xs text-foreground/45 font-mono mt-0.5">{record.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-brand-surface text-foreground/40 hover:text-foreground transition-all">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-6 p-6">
          {/* Patient Card */}
          {patient && (
            <div className="flex items-center gap-3 bg-brand-surface/30 border border-border/60 rounded-xl p-4">
              <Avatar name={patient.name} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground truncate">{patient.name}</p>
                <p className="text-[10px] text-foreground/40 mt-0.5">
                  {patient.gender} · {age} yrs · Blood: {patient.bloodGroup} · ID: {patient.id}
                </p>
              </div>
              <Badge variant="teal">{record.department}</Badge>
            </div>
          )}

          {/* Diagnosis & Treatment */}
          <div className="flex flex-col gap-3">
            <div>
              <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest block mb-1">Diagnosis</span>
              <p className="text-sm font-bold text-brand-teal bg-brand-teal/5 border border-brand-teal/15 rounded-xl p-3.5 leading-relaxed">
                {record.diagnosis}
              </p>
            </div>
            {record.treatmentPlan && (
              <div>
                <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest block mb-1">Treatment Plan</span>
                <p className="text-xs text-foreground/75 bg-brand-surface/20 border border-border/60 rounded-xl p-3.5 leading-relaxed">
                  {record.treatmentPlan}
                </p>
              </div>
            )}
          </div>

          {/* Doctor */}
          {doctor && (
            <div className="flex items-center gap-3 bg-brand-surface/20 border border-border/60 rounded-xl p-3.5">
              <Avatar name={doctor.name} size="sm" />
              <div>
                <p className="text-xs font-bold text-foreground">{doctor.name}</p>
                <p className="text-[10px] text-foreground/45 mt-0.5">{doctor.specialty[0]} · Room {doctor.roomNumber}</p>
              </div>
            </div>
          )}

          {/* Vitals Panel */}
          <div>
            <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest block mb-2">Patient Vitals</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <VitalTile label="BP" value={record.vitals.bloodPressure} icon={<Activity className="h-3.5 w-3.5 text-brand-teal" />} />
              <VitalTile label="Heart Rate" value={`${record.vitals.heartRate} bpm`} icon={<Heart className="h-3.5 w-3.5 text-brand-red animate-pulse" />} />
              <VitalTile label="Temp" value={`${record.vitals.temperature} °F`} icon={<Thermometer className="h-3.5 w-3.5 text-brand-amber" />} />
              {record.vitals.spO2 !== undefined && (
                <VitalTile label="SpO2" value={`${record.vitals.spO2}%`} icon={<Shield className="h-3.5 w-3.5 text-brand-green" />} />
              )}
            </div>
          </div>

          {/* Prescriptions */}
          {record.prescriptions.length > 0 && (
            <div>
              <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest block mb-2">Prescribed Medication</span>
              <div className="border border-border/60 rounded-xl overflow-hidden bg-brand-surface">
                <div className="grid grid-cols-[1.5fr_1fr_1fr] gap-2 px-3 py-2 bg-brand-surface/75 border-b border-border/60 text-[9px] font-bold text-foreground/45 uppercase tracking-widest">
                  <span>Medicine</span>
                  <span>Dosage</span>
                  <span>Duration</span>
                </div>
                <div className="divide-y divide-border/30">
                  {record.prescriptions.map((p, idx) => (
                    <div key={idx} className="flex flex-col gap-1 p-3">
                      <div className="grid grid-cols-[1.5fr_1fr_1fr] gap-2 text-xs font-semibold text-foreground">
                        <span className="text-[#4F8CFF] font-bold">{p.medicineName}</span>
                        <span>{p.dosage}</span>
                        <span className="text-foreground/60">{p.duration}</span>
                      </div>
                      {p.instructions && (
                        <span className="text-[10px] text-foreground/45 italic mt-0.5">Note: {p.instructions}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Lab Results */}
          {record.labResults && record.labResults.length > 0 && (
            <div>
              <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest block mb-2">Lab Test Findings</span>
              <div className="flex flex-col gap-2">
                {record.labResults.map((t, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3.5 rounded-xl border border-border/60 bg-brand-surface/60">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-foreground truncate">{t.testName}</p>
                      <p className="text-[10px] text-foreground/45 mt-1">Normal Range: {t.normalRange}</p>
                    </div>
                    <div className="text-right pl-3 shrink-0 flex flex-col items-end gap-1.5">
                      <span className="text-xs font-black text-foreground">{t.result}</span>
                      <Badge variant={getLabStatusVariant(t.status)} className="text-[8px] py-0">{t.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {record.notes && (
            <div>
              <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest block mb-1">Clinical Assessment Notes</span>
              <p className="text-xs text-foreground/60 leading-relaxed bg-brand-surface/20 border border-border/60 rounded-xl p-3.5 italic">
                "{record.notes}"
              </p>
            </div>
          )}

          {/* Date & Action */}
          <div className="flex items-center justify-between pt-3 border-t border-border/60 text-xs text-foreground/40 font-semibold select-none">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" /> Checked in: {format(parseISO(record.createdAt), 'dd MMM yyyy, hh:mm a')}
            </span>
            <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-surface border border-border text-foreground/70 hover:text-brand-teal hover:bg-brand-surface/80 transition-all">
              <Download className="h-3.5 w-3.5" /> Export PDF
            </button>
          </div>
        </div>
      </motion.aside>
    </AnimatePresence>
  );
}

function VitalTile({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5 p-3 rounded-xl border border-border/60 bg-brand-surface text-center items-center justify-center">
      <div className="text-center">{icon}</div>
      <span className="text-xs font-black text-foreground truncate max-w-full">{value}</span>
      <span className="text-[8px] font-bold uppercase tracking-widest text-foreground/45">{label}</span>
    </div>
  );
}

// ─── Add Record Modal ────────────────────────────────────────────────────────

interface AddRecordModalProps {
  onClose: () => void;
  patients: Patient[];
  doctors: Doctor[];
}

function AddRecordModal({ onClose, patients, doctors }: AddRecordModalProps) {
  const { addMedicalRecord } = useStore();

  const [form, setForm] = useState({
    patientId: patients[0]?.id ?? '',
    doctorId: doctors[0]?.id ?? '',
    diagnosis: '',
    treatmentPlan: '',
    bloodPressure: '120/80',
    heartRate: 72,
    temperature: 98.6,
    spO2: 98,
    notes: '',
  });

  const [prescriptions, setPrescriptions] = useState<Array<{
    medicineName: string;
    dosage: string;
    duration: string;
    instructions: string;
  }>>([
    { medicineName: '', dosage: '1-0-1', duration: '5 days', instructions: 'After meals' }
  ]);

  const chosenDoc = doctors.find(d => d.id === form.doctorId);

  const handleAddMed = () => {
    setPrescriptions([...prescriptions, { medicineName: '', dosage: '1-0-1', duration: '5 days', instructions: '' }]);
  };

  const handleRemoveMed = (index: number) => {
    setPrescriptions(prescriptions.filter((_, i) => i !== index));
  };

  const handleMedChange = (index: number, field: string, value: string) => {
    const updated = [...prescriptions];
    updated[index] = { ...updated[index], [field]: value };
    setPrescriptions(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.patientId || !form.doctorId) return;

    addMedicalRecord({
      patientId: form.patientId,
      doctorId: form.doctorId,
      department: chosenDoc?.department ?? 'General Medicine',
      diagnosis: form.diagnosis,
      treatmentPlan: form.treatmentPlan,
      notes: form.notes || undefined,
      vitals: {
        bloodPressure: form.bloodPressure,
        heartRate: Number(form.heartRate),
        temperature: Number(form.temperature),
        spO2: Number(form.spO2),
      },
      prescriptions: prescriptions.filter(p => p.medicineName.trim() !== ''),
      date: new Date().toISOString().split('T')[0],
    });

    onClose();
  };

  const inputClass = "w-full bg-brand-surface/30 border border-border/60 rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-brand-teal/40 focus:ring-1 focus:ring-brand-teal/20 transition-all";
  const labelClass = "text-[10px] font-bold uppercase tracking-widest text-foreground/40 mb-1 block";
  const selectClass = inputClass + " appearance-none cursor-pointer";

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
          className="glass-card w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-6 py-5 border-b border-border/60">
            <div>
              <h2 className="text-base font-bold text-foreground">Log Patient Consultation</h2>
              <p className="text-xs text-foreground/40 mt-0.5">Submit new diagnosis, vitals, and prescription chart</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-brand-surface text-foreground/40 hover:text-foreground transition-all">
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
            {/* Core Patient & Doctor Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Attending Patient *</label>
                <select required value={form.patientId} onChange={e => setForm({...form, patientId: e.target.value})} className={selectClass}>
                  {patients.map(p => <option key={p.id} value={p.id}>{p.name} ({p.id})</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Consulting Specialist *</label>
                <select required value={form.doctorId} onChange={e => setForm({...form, doctorId: e.target.value})} className={selectClass}>
                  {doctors.map(d => <option key={d.id} value={d.id}>{d.name} · {d.department}</option>)}
                </select>
              </div>
            </div>

            {/* Diagnosis */}
            <div>
              <label className={labelClass}>Diagnosis *</label>
              <input required value={form.diagnosis} onChange={e => setForm({...form, diagnosis: e.target.value})} placeholder="e.g. Chronic Bronchitis, Type 2 Diabetes" className={inputClass} />
            </div>

            {/* Treatment Plan */}
            <div>
              <label className={labelClass}>Treatment Plan & Instructions</label>
              <textarea rows={2} value={form.treatmentPlan} onChange={e => setForm({...form, treatmentPlan: e.target.value})} placeholder="Outline treatment protocols..." className={inputClass + " resize-none"} />
            </div>

            {/* Vitals */}
            <div>
              <p className="text-[11px] font-bold text-brand-teal uppercase tracking-widest border-b border-border/40 pb-2 mb-3">Vitals Panel</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className={labelClass}>Blood Pressure</label>
                  <input value={form.bloodPressure} onChange={e => setForm({...form, bloodPressure: e.target.value})} placeholder="120/80" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Pulse (bpm)</label>
                  <input type="number" value={form.heartRate} onChange={e => setForm({...form, heartRate: Number(e.target.value)})} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Temp (°F)</label>
                  <input type="number" step="0.1" value={form.temperature} onChange={e => setForm({...form, temperature: Number(e.target.value)})} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>SpO2 (%)</label>
                  <input type="number" min={0} max={100} value={form.spO2} onChange={e => setForm({...form, spO2: Number(e.target.value)})} className={inputClass} />
                </div>
              </div>
            </div>

            {/* Prescriptions (Dynamic Rows) */}
            <div>
              <div className="flex items-center justify-between border-b border-border/40 pb-2 mb-3">
                <p className="text-[11px] font-bold text-brand-teal uppercase tracking-widest">Medications & Prescriptions</p>
                <button type="button" onClick={handleAddMed} className="flex items-center gap-1 text-[10px] text-brand-teal font-extrabold uppercase hover:text-brand-teal/80 transition-all">
                  <PlusCircle className="h-3.5 w-3.5" /> Add Drug
                </button>
              </div>

              <div className="flex flex-col gap-3">
                {prescriptions.map((p, idx) => (
                  <div key={idx} className="flex items-end gap-2 bg-brand-surface border border-border/50 rounded-xl p-3 relative">
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 flex-1">
                      <div>
                        <label className={labelClass}>Medicine Name</label>
                        <input required value={p.medicineName} onChange={e => handleMedChange(idx, 'medicineName', e.target.value)} placeholder="e.g. Paracetamol" className={inputClass} />
                      </div>
                      <div>
                        <label className={labelClass}>Dosage Chart</label>
                        <input required value={p.dosage} onChange={e => handleMedChange(idx, 'dosage', e.target.value)} placeholder="e.g. 1-0-1" className={inputClass} />
                      </div>
                      <div>
                        <label className={labelClass}>Duration</label>
                        <input required value={p.duration} onChange={e => handleMedChange(idx, 'duration', e.target.value)} placeholder="e.g. 5 days" className={inputClass} />
                      </div>
                      <div>
                        <label className={labelClass}>Instructions</label>
                        <input value={p.instructions} onChange={e => handleMedChange(idx, 'instructions', e.target.value)} placeholder="e.g. After meals" className={inputClass} />
                      </div>
                    </div>
                    {prescriptions.length > 1 && (
                      <button type="button" onClick={() => handleRemoveMed(idx)} className="p-2 rounded-xl text-brand-red bg-brand-red/5 hover:bg-brand-red/10 transition-all border border-brand-red/15 mb-[3px]">
                        <MinusCircle className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Assessment Notes */}
            <div>
              <label className={labelClass}>Clinical Assessment Notes</label>
              <textarea rows={2} value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="Any supplementary notes..." className={inputClass + " resize-none"} />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2 border-t border-border/60">
              <button type="button" onClick={onClose} className="flex-1 px-4 py-3 rounded-xl bg-brand-surface border border-border text-foreground/60 text-sm font-bold hover:text-foreground transition-all">
                Cancel
              </button>
              <button type="submit" className="flex-1 px-4 py-3 rounded-xl bg-gradient-primary text-white text-sm font-extrabold transition-all shadow-btn hover:shadow-btn-hover hover:scale-[1.01]">
                Save Clinical Record
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function RecordsPage() {
  const { initializeStore, records, patients, doctors } = useStore();

  useEffect(() => { initializeStore(); }, [initializeStore]);

  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('All');
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const departments = useMemo(() => ['All', ...Array.from(new Set(records.map(r => r.department))).sort()], [records]);

  const filtered = useMemo(() => {
    return records.filter(r => {
      if (filterDept !== 'All' && r.department !== filterDept) return false;
      if (search) {
        const q = search.toLowerCase();
        const pat = patients.find(p => p.id === r.patientId);
        const doc = doctors.find(d => d.id === r.doctorId);
        return (
          r.id.toLowerCase().includes(q) ||
          r.diagnosis.toLowerCase().includes(q) ||
          (pat?.name ?? '').toLowerCase().includes(q) ||
          (doc?.name ?? '').toLowerCase().includes(q) ||
          r.department.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [records, filterDept, search, patients, doctors]);

  // Compute Statistics
  const stats = useMemo(() => {
    // Total Lab tests across all records
    let totalLabs = 0;
    let criticalLabs = 0;
    records.forEach(r => {
      if (r.labResults) {
        totalLabs += r.labResults.length;
        criticalLabs += r.labResults.filter(l => l.status === 'Critical').length;
      }
    });

    return {
      total: records.length,
      criticalLabs,
      departmentsCount: Array.from(new Set(records.map(r => r.department))).length,
    };
  }, [records]);

  return (
    <PageWrapper>
      <div className="flex flex-col gap-6 pb-10 animate-fade-in-up">

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/50 pb-5">
          <div>
            <h1 className="text-2xl font-black font-display tracking-tight text-foreground">Clinical Records</h1>
            <p className="text-xs text-foreground/45 mt-1 font-medium">Log and review patient consultation histories, diagnostics, and vitals</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-primary text-white text-sm font-extrabold transition-all shadow-btn hover:shadow-btn-hover hover:scale-[1.02]"
            >
              <Plus className="h-4 w-4" />
              New Clinical Record
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 shrink-0">
          <div className="glass-card p-4.5 flex flex-col gap-1 border border-border/60 bg-brand-surface/30">
            <span className="text-2xl font-black font-mono text-foreground">{stats.total}</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">Total Records Logged</span>
          </div>
          <div className="glass-card p-4.5 flex flex-col gap-1 border border-border/60 bg-brand-red/5">
            <span className="text-2xl font-black font-mono text-brand-red">{stats.criticalLabs}</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-brand-red/60">Critical Lab Reports</span>
          </div>
          <div className="glass-card p-4.5 flex flex-col gap-1 border border-border/60 bg-brand-amber/5">
            <span className="text-2xl font-black font-mono text-brand-amber">{stats.departmentsCount}</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-brand-amber/60">Attended Specialty Wards</span>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="glass-card p-4 flex flex-col sm:flex-row gap-3 shrink-0">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/30" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by diagnosis, record ID, patient, specialist..."
              className="w-full pl-9 pr-3 py-2.5 bg-brand-surface/30 border border-border/60 rounded-xl text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-brand-teal/40 transition-all"
            />
          </div>
        </div>

        {/* Department Filter Pills */}
        <div className="flex flex-wrap gap-2 shrink-0 -mt-2">
          {departments.map(d => (
            <button key={d} onClick={() => setFilterDept(d)} className={cn(
              'px-3.5 py-1 rounded-full text-[11px] font-bold border transition-all',
              filterDept === d 
                ? 'bg-[#4F8CFF]/15 border-[#4F8CFF]/30 text-[#4F8CFF] font-bold' 
                : 'bg-brand-surface border-border/60 text-foreground/50 hover:bg-brand-surface hover:text-foreground'
            )}>{d}</button>
          ))}
        </div>

        {/* Results Info */}
        <div className="flex items-center gap-2 text-xs text-foreground/40 font-semibold -mt-3">
          <Filter className="h-3.5 w-3.5" />
          Showing <span className="text-foreground/70 font-bold">{filtered.length}</span> of <span className="text-foreground/70">{records.length}</span> clinical records
        </div>

        {/* Records Directory Grid */}
        {filtered.length === 0 ? (
          <EmptyState
            icon={<FileText className="h-10 w-10" />}
            title="No records found"
            description="Adjust search tags or register a new patient diagnostic consultation."
          />
        ) : (
          <div className="glass-card overflow-hidden">
            {/* Headers */}
            <div className="hidden md:grid grid-cols-[1fr_2.5fr_1.5fr_1.5fr_1fr_auto] gap-4 px-5 py-3 border-b border-border/60 bg-brand-surface/40">
              {['Record ID', 'Patient', 'Diagnosis', 'Department', 'Logged Date', ''].map(h => (
                <span key={h} className="text-[10px] font-bold uppercase tracking-widest text-foreground/35">{h}</span>
              ))}
            </div>

            {/* List */}
            <div className="divide-y divide-border/40">
              <AnimatePresence>
                {filtered.map((rec, idx) => {
                  const pat = patients.find(p => p.id === rec.patientId);
                  const isCritical = rec.labResults?.some(l => l.status === 'Critical');

                  return (
                    <motion.div
                      key={rec.id}
                      layout
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: idx * 0.02, duration: 0.2 }}
                      onClick={() => setSelectedRecord(rec)}
                      className="grid grid-cols-1 md:grid-cols-[1fr_2.5fr_1.5fr_1.5fr_1fr_auto] gap-4 px-5 py-4 hover:bg-[#4F8CFF]/5 cursor-pointer transition-all group items-center"
                    >
                      {/* ID */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-foreground/50 group-hover:text-brand-teal transition-colors">
                          {rec.id}
                        </span>
                        {isCritical && (
                          <span className="h-1.5 w-1.5 rounded-full bg-brand-red animate-pulse" title="Critical Lab Findings" />
                        )}
                      </div>

                      {/* Patient Details */}
                      {pat ? (
                        <div className="flex items-center gap-3 min-w-0">
                          <Avatar name={pat.name} size="sm" />
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-foreground truncate">{pat.name}</p>
                            <p className="text-[10px] text-foreground/40 mt-0.5">{pat.gender} · {calcAge(pat.dob)}y · {pat.id}</p>
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-foreground/50">Unknown Patient</span>
                      )}

                      {/* Diagnosis */}
                      <div className="truncate">
                        <span className="text-xs font-bold text-foreground/80">{rec.diagnosis}</span>
                      </div>

                      {/* Department */}
                      <div>
                        <Badge variant="grey">{rec.department}</Badge>
                      </div>

                      {/* Date */}
                      <div>
                        <span className="text-xs text-foreground/40 font-semibold">
                          {(() => { try { return format(parseISO(rec.createdAt), 'dd MMM yyyy'); } catch { return rec.date; } })()}
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
      </div>

      {/* Record Drawer */}
      {selectedRecord && (
        <RecordDrawer
          record={selectedRecord}
          onClose={() => setSelectedRecord(null)}
          patients={patients}
          doctors={doctors}
        />
      )}

      {/* Add Record Modal */}
      {showAddModal && (
        <AddRecordModal
          onClose={() => setShowAddModal(false)}
          patients={patients}
          doctors={doctors}
        />
      )}
    </PageWrapper>
  );
}
