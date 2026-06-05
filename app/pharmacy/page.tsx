'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useStore } from '@/hooks/useStore';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Medicine, Patient } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Pill, Search, Plus, X, Package, ShieldAlert, 
  ChevronRight, Filter, ShoppingCart, RefreshCw, 
  DollarSign, Activity, Truck, Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';

// ─── Add Medicine Modal ──────────────────────────────────────────────────────

function AddMedicineModal({ onClose }: { onClose: () => void }) {
  const { addMedicine } = useStore();
  const [form, setForm] = useState({
    name: '', category: 'Antibiotic', stock: 100, threshold: 20,
    price: 10, dosageForm: 'Tablet' as Medicine['dosageForm'],
    strength: '500 mg', manufacturer: '', expiryDate: '',
  });

  const inputClass = "w-full bg-brand-surface/30 border border-border/60 rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-brand-teal/40 focus:ring-1 focus:ring-brand-teal/20 transition-all";
  const labelClass = "text-[10px] font-bold uppercase tracking-widest text-foreground/40 mb-1 block";
  const selectClass = inputClass + " appearance-none cursor-pointer";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addMedicine({
      name: form.name,
      category: form.category,
      stock: Number(form.stock),
      threshold: Number(form.threshold),
      price: Number(form.price),
      dosageForm: form.dosageForm,
      strength: form.strength,
      manufacturer: form.manufacturer || 'Generic Meds',
      expiryDate: form.expiryDate || new Date(Date.now() + 1000 * 60 * 60 * 24 * 365).toISOString().split('T')[0],
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
          className="glass-card w-full max-w-lg max-h-[90vh] overflow-y-auto"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-6 py-5 border-b border-border/60">
            <div>
              <h2 className="text-base font-bold text-foreground">Stock New Medicine</h2>
              <p className="text-xs text-foreground/40 mt-0.5">Add a new pharmaceutical product to inventory</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-brand-surface text-foreground/40 hover:text-foreground transition-all">
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className={labelClass}>Product Name *</label>
                <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. Ibuprofen" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Category *</label>
                <input required value={form.category} onChange={e => setForm({...form, category: e.target.value})} placeholder="e.g. Analgesic" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Strength *</label>
                <input required value={form.strength} onChange={e => setForm({...form, strength: e.target.value})} placeholder="e.g. 400 mg" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Dosage Form</label>
                <select value={form.dosageForm} onChange={e => setForm({...form, dosageForm: e.target.value as Medicine['dosageForm']})} className={selectClass}>
                  {['Tablet', 'Capsule', 'Syrup', 'Injection', 'Ointment'].map(f => <option key={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Price per Unit (₹) *</label>
                <input required type="number" min={0} value={form.price} onChange={e => setForm({...form, price: Number(e.target.value)})} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Initial Stock Count *</label>
                <input required type="number" min={0} value={form.stock} onChange={e => setForm({...form, stock: Number(e.target.value)})} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Low-Stock Threshold *</label>
                <input required type="number" min={0} value={form.threshold} onChange={e => setForm({...form, threshold: Number(e.target.value)})} className={inputClass} />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Manufacturer *</label>
                <input required value={form.manufacturer} onChange={e => setForm({...form, manufacturer: e.target.value})} placeholder="e.g. Abbott Laboratories" className={inputClass} />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Batch Expiry Date *</label>
                <input required type="date" value={form.expiryDate} onChange={e => setForm({...form, expiryDate: e.target.value})} className={inputClass} />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2 border-t border-border/60">
              <button type="button" onClick={onClose} className="flex-1 px-4 py-3 rounded-xl bg-brand-surface border border-border text-foreground/60 text-sm font-bold hover:text-foreground transition-all">
                Cancel
              </button>
              <button type="submit" className="flex-1 px-4 py-3 rounded-xl bg-gradient-primary text-white text-sm font-extrabold transition-all shadow-btn hover:shadow-btn-hover hover:scale-[1.01]">
                Add Medicine
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Dispense Modal ─────────────────────────────────────────────────────────

interface DispenseModalProps {
  onClose: () => void;
  medicines: Medicine[];
  patients: Patient[];
}

function DispenseModal({ onClose, medicines, patients }: DispenseModalProps) {
  const { updateMedicineStock, addActivity, addToast } = useStore();
  const availableMeds = medicines.filter(m => m.stock > 0);

  const [form, setForm] = useState({
    medicineId: availableMeds[0]?.id ?? '',
    patientId: patients[0]?.id ?? '',
    quantity: 1,
  });

  const selectedMed = medicines.find(m => m.id === form.medicineId);
  const patient = patients.find(p => p.id === form.patientId);

  const inputClass = "w-full bg-brand-surface/30 border border-border/60 rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-brand-teal/40 focus:ring-1 focus:ring-brand-teal/20 transition-all";
  const labelClass = "text-[10px] font-bold uppercase tracking-widest text-foreground/40 mb-1 block";
  const selectClass = inputClass + " appearance-none cursor-pointer";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMed || !patient) return;

    if (form.quantity > selectedMed.stock) {
      addToast(`Insufficient stock! Only ${selectedMed.stock} units available.`, 'error');
      return;
    }

    const newStock = selectedMed.stock - form.quantity;
    updateMedicineStock(selectedMed.id, newStock);

    addActivity(
      `Dispensed ${form.quantity} unit(s) of ${selectedMed.name} (${selectedMed.strength}) to Patient: ${patient.name} (${patient.id})`,
      'success',
      'system'
    );

    addToast(`Successfully dispensed ${selectedMed.name} to ${patient.name}!`, 'success');
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
          className="glass-card w-full max-w-md"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-6 py-5 border-b border-border/60">
            <div>
              <h2 className="text-base font-bold text-foreground">Dispense Medicine</h2>
              <p className="text-xs text-foreground/40 mt-0.5">Dispense stocked drugs to registered patients</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-brand-surface text-foreground/40 hover:text-foreground transition-all">
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
            <div>
              <label className={labelClass}>Select Medicine *</label>
              {availableMeds.length === 0 ? (
                <p className="text-xs text-brand-red font-bold">No medicines available in stock!</p>
              ) : (
                <select value={form.medicineId} onChange={e => setForm({...form, medicineId: e.target.value})} className={selectClass}>
                  {availableMeds.map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({m.strength}) · In Stock: {m.stock}</option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className={labelClass}>Dispense to Patient *</label>
              <select value={form.patientId} onChange={e => setForm({...form, patientId: e.target.value})} className={selectClass}>
                {patients.map(p => <option key={p.id} value={p.id}>{p.name} ({p.id})</option>)}
              </select>
            </div>

            <div>
              <label className={labelClass}>Quantity *</label>
              <input required type="number" min={1} max={selectedMed?.stock ?? 1} value={form.quantity} onChange={e => setForm({...form, quantity: Number(e.target.value)})} className={inputClass} />
              {selectedMed && (
                <p className="text-[10px] text-foreground/40 mt-1 font-semibold">Total cost: ₹{(selectedMed.price * form.quantity).toLocaleString()}</p>
              )}
            </div>

            <div className="flex items-center gap-3 pt-2 border-t border-border/60">
              <button type="button" onClick={onClose} className="flex-1 px-4 py-3 rounded-xl bg-brand-surface border border-border text-foreground/60 text-sm font-bold hover:text-foreground transition-all">
                Cancel
              </button>
              <button type="submit" disabled={availableMeds.length === 0} className="flex-1 px-4 py-3 rounded-xl bg-gradient-primary text-white text-sm font-extrabold transition-all shadow-btn hover:shadow-btn-hover hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed">
                Dispense
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Restock Modal ──────────────────────────────────────────────────────────

interface RestockModalProps {
  onClose: () => void;
  medicines: Medicine[];
  initialSelectedId?: string;
}

function RestockModal({ onClose, medicines, initialSelectedId }: RestockModalProps) {
  const { updateMedicineStock, addActivity, addToast } = useStore();

  const [form, setForm] = useState({
    medicineId: initialSelectedId || medicines[0]?.id || '',
    quantity: 50,
  });

  const selectedMed = medicines.find(m => m.id === form.medicineId);

  const inputClass = "w-full bg-brand-surface/30 border border-border/60 rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-brand-teal/40 focus:ring-1 focus:ring-brand-teal/20 transition-all";
  const labelClass = "text-[10px] font-bold uppercase tracking-widest text-foreground/40 mb-1 block";
  const selectClass = inputClass + " appearance-none cursor-pointer";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMed) return;

    const newStock = selectedMed.stock + form.quantity;
    updateMedicineStock(selectedMed.id, newStock);

    addActivity(
      `Restocked Pharmacy Inventory: ${selectedMed.name} (+${form.quantity} units) — New Total: ${newStock}`,
      'success',
      'system'
    );

    addToast(`Restocked ${selectedMed.name} successfully!`, 'success');
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
          className="glass-card w-full max-w-md"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-6 py-5 border-b border-border/60">
            <div>
              <h2 className="text-base font-bold text-foreground">Restock Inventory</h2>
              <p className="text-xs text-foreground/40 mt-0.5">Procure units of clinical medications</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-brand-surface text-foreground/40 hover:text-foreground transition-all">
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
            <div>
              <label className={labelClass}>Select Medicine *</label>
              <select value={form.medicineId} onChange={e => setForm({...form, medicineId: e.target.value})} className={selectClass}>
                {medicines.map(m => (
                  <option key={m.id} value={m.id}>{m.name} ({m.strength}) · Current Stock: {m.stock}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>Quantity to Add *</label>
              <input required type="number" min={1} value={form.quantity} onChange={e => setForm({...form, quantity: Number(e.target.value)})} className={inputClass} />
            </div>

            <div className="flex items-center gap-3 pt-2 border-t border-border/60">
              <button type="button" onClick={onClose} className="flex-1 px-4 py-3 rounded-xl bg-brand-surface border border-border text-foreground/60 text-sm font-bold hover:text-foreground transition-all">
                Cancel
              </button>
              <button type="submit" className="flex-1 px-4 py-3 rounded-xl bg-gradient-primary text-white text-sm font-extrabold transition-all shadow-btn hover:shadow-btn-hover hover:scale-[1.01]">
                Confirm Restock
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PharmacyPage() {
  const { initializeStore, medicines, patients } = useStore();

  useEffect(() => { initializeStore(); }, [initializeStore]);

  const [search, setSearch] = useState('');
  const [filterForm, setFilterForm] = useState('All');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Low Stock' | 'Out of Stock' | 'In Stock'>('All');
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDispenseModal, setShowDispenseModal] = useState(false);
  const [restockMedicineId, setRestockMedicineId] = useState<string | null>(null);

  const dosageForms = ['All', 'Tablet', 'Capsule', 'Syrup', 'Injection', 'Ointment'];

  const filtered = useMemo(() => {
    return medicines.filter(m => {
      // Form filter
      if (filterForm !== 'All' && m.dosageForm !== filterForm) return false;
      
      // Stock status filter
      if (filterStatus === 'Out of Stock' && m.stock > 0) return false;
      if (filterStatus === 'Low Stock' && (m.stock > m.threshold || m.stock === 0)) return false;
      if (filterStatus === 'In Stock' && m.stock <= m.threshold) return false;

      // Text search
      if (search) {
        const q = search.toLowerCase();
        return (
          m.name.toLowerCase().includes(q) ||
          m.category.toLowerCase().includes(q) ||
          m.id.toLowerCase().includes(q) ||
          m.manufacturer.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [medicines, filterForm, filterStatus, search]);

  const stats = useMemo(() => {
    const totalItems = medicines.length;
    const lowStock = medicines.filter(m => m.stock <= m.threshold && m.stock > 0).length;
    const outOfStock = medicines.filter(m => m.stock === 0).length;
    const totalCategories = Array.from(new Set(medicines.map(m => m.category))).length;

    return { totalItems, lowStock, outOfStock, totalCategories };
  }, [medicines]);

  return (
    <PageWrapper>
      <div className="flex flex-col gap-6 pb-10 animate-fade-in-up">

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/50 pb-5">
          <div>
            <h1 className="text-2xl font-black font-display tracking-tight text-foreground">Pharmacy Inventory</h1>
            <p className="text-xs text-foreground/45 mt-1 font-medium">Monitor clinical medicine stock levels, restock pharmaceutical batches, and dispense drugs</p>
          </div>
          <div className="flex items-center gap-3 shrink-0 select-none">
            <button
              onClick={() => setShowDispenseModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-surface border border-border text-foreground text-sm font-bold hover:border-brand-teal/40 transition-all hover:bg-brand-surface shadow-sm"
            >
              <ShoppingCart className="h-4 w-4 text-[#4F8CFF]" />
              Dispense Drug
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-primary text-white text-sm font-extrabold transition-all shadow-btn hover:shadow-btn-hover hover:scale-[1.02]"
            >
              <Plus className="h-4 w-4" />
              Procure Medicine
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 shrink-0 select-none">
          <div className="glass-card p-4 flex flex-col gap-1.5 border border-border/60">
            <span className="text-2xl font-black font-mono text-foreground">{stats.totalItems}</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/35">Total Active Catalog</span>
          </div>
          <div className={cn("glass-card p-4 flex flex-col gap-1.5 border border-border/60", stats.lowStock > 0 ? "bg-brand-amber/5" : "")}>
            <span className={cn("text-2xl font-black font-mono", stats.lowStock > 0 ? "text-brand-amber" : "text-foreground")}>{stats.lowStock}</span>
            <span className={cn("text-[10px] font-bold uppercase tracking-widest", stats.lowStock > 0 ? "text-brand-amber/60" : "text-foreground/35")}>Low Stock Warning</span>
          </div>
          <div className={cn("glass-card p-4 flex flex-col gap-1.5 border border-border/60", stats.outOfStock > 0 ? "bg-brand-red/5" : "")}>
            <span className={cn("text-2xl font-black font-mono", stats.outOfStock > 0 ? "text-brand-red animate-pulse" : "text-foreground")}>{stats.outOfStock}</span>
            <span className={cn("text-[10px] font-bold uppercase tracking-widest", stats.outOfStock > 0 ? "text-brand-red/60" : "text-foreground/35")}>Out of Stock</span>
          </div>
          <div className="glass-card p-4 flex flex-col gap-1.5 border border-border/60">
            <span className="text-2xl font-black font-mono text-brand-teal">{stats.totalCategories}</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-brand-teal/60">Stocked Categories</span>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="glass-card p-4 flex flex-col sm:flex-row gap-3 shrink-0">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/30" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by medicine name, therapeutic category, manufacturer, or ID..."
              className="w-full pl-9 pr-3 py-2.5 bg-brand-surface/30 border border-border/60 rounded-xl text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-brand-teal/40 transition-all"
            />
          </div>

          {/* Stock Status Selector */}
          <div className="flex items-center gap-1.5 bg-brand-surface border border-border/65 rounded-xl p-1 shrink-0 select-none">
            {(['All', 'In Stock', 'Low Stock', 'Out of Stock'] as const).map(s => (
              <button key={s} onClick={() => setFilterStatus(s)} className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap',
                filterStatus === s ? 'bg-[#4F8CFF] text-white shadow-sm' : 'text-foreground/50 hover:text-foreground'
              )}>{s}</button>
            ))}
          </div>
        </div>

        {/* Dosage Form pills */}
        <div className="flex flex-wrap gap-2 shrink-0 -mt-2 select-none">
          {dosageForms.map(f => (
            <button key={f} onClick={() => setFilterForm(f)} className={cn(
              'px-3.5 py-1 rounded-full text-[11px] font-bold border transition-all',
              filterForm === f 
                ? 'bg-brand-lavender/15 border-brand-lavender/30 text-brand-lavender font-bold' 
                : 'bg-brand-surface border-border/60 text-foreground/50 hover:bg-brand-surface hover:text-foreground'
            )}>{f}</button>
          ))}
        </div>

        {/* Results Info */}
        <div className="flex items-center gap-2 text-xs text-foreground/40 font-semibold -mt-3 select-none">
          <Filter className="h-3.5 w-3.5" />
          Showing <span className="text-foreground/70 font-bold">{filtered.length}</span> of <span className="text-foreground/70">{medicines.length}</span> stocked medicines
        </div>

        {/* Inventory Directory List */}
        {filtered.length === 0 ? (
          <EmptyState
            icon={<Pill className="h-10 w-10" />}
            title="No medicine matches found"
            description="Adjust filters or add a new medicine procurement log."
          />
        ) : (
          <div className="glass-card overflow-hidden">
            {/* Headers */}
            <div className="hidden md:grid grid-cols-[2fr_1.2fr_1.2fr_1fr_1fr_1fr_auto] gap-4 px-5 py-3 border-b border-border/60 bg-brand-surface/40 select-none">
              {['Product Details', 'Category', 'Stock Status', 'Dosage Form', 'Unit Price', 'Expiry', ''].map(h => (
                <span key={h} className="text-[10px] font-bold uppercase tracking-widest text-foreground/35">{h}</span>
              ))}
            </div>

            {/* List */}
            <div className="divide-y divide-border/40">
              <AnimatePresence>
                {filtered.map((med, idx) => {
                  const status = med.stock === 0 ? 'Out of Stock' : (med.stock <= med.threshold ? 'Low Stock' : 'In Stock');
                  
                  return (
                    <motion.div
                      key={med.id}
                      layout
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: idx * 0.02, duration: 0.2 }}
                      className="grid grid-cols-1 md:grid-cols-[2fr_1.2fr_1.2fr_1fr_1fr_1fr_auto] gap-4 px-5 py-4.5 hover:bg-[#4F8CFF]/5 transition-all group items-center"
                    >
                      {/* Name Details */}
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className={cn(
                          'h-9 w-9 rounded-xl border flex items-center justify-center shrink-0',
                          status === 'Out of Stock' ? 'bg-brand-red/10 border-brand-red/20 text-brand-red glow-red' :
                          status === 'Low Stock' ? 'bg-brand-amber/10 border-brand-amber/20 text-brand-amber glow-amber' :
                          'bg-brand-teal/10 border-brand-teal/20 text-brand-teal glow-teal'
                        )}>
                          <Pill className="h-4.5 w-4.5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-black text-foreground group-hover:text-brand-teal transition-colors truncate">
                            {med.name}
                          </p>
                          <p className="text-[10px] text-foreground/45 mt-0.5">
                            {med.strength} · Mfg: {med.manufacturer} · {med.id}
                          </p>
                        </div>
                      </div>

                      {/* Category */}
                      <div className="truncate">
                        <span className="text-xs font-semibold text-foreground/70">{med.category}</span>
                      </div>

                      {/* Stock Level */}
                      <div className="flex items-center gap-2">
                        <span className={cn('text-xs font-mono font-black', 
                          status === 'Out of Stock' ? 'text-brand-red' :
                          status === 'Low Stock' ? 'text-brand-amber' : 'text-brand-green'
                        )}>
                          {med.stock} units
                        </span>
                        {status === 'Out of Stock' && <Badge variant="red" className="text-[8px] py-0">Empty</Badge>}
                        {status === 'Low Stock' && <Badge variant="amber" className="text-[8px] py-0">Low</Badge>}
                      </div>

                      {/* Dosage Form */}
                      <div>
                        <Badge variant="grey">{med.dosageForm}</Badge>
                      </div>

                      {/* Unit Cost */}
                      <div>
                        <span className="text-xs font-mono font-bold text-foreground/70">₹{med.price.toLocaleString()}</span>
                      </div>

                      {/* Expiry Date */}
                      <div>
                        <span className="text-xs text-foreground/40 font-semibold flex items-center gap-1">
                          <Calendar className="h-3 w-3 shrink-0" />
                          {(() => { try { return format(parseISO(med.expiryDate), 'dd MMM yy'); } catch { return med.expiryDate; } })()}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-end select-none">
                        <button
                          onClick={() => setRestockMedicineId(med.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-surface border border-border text-xs font-bold text-foreground/60 hover:text-brand-teal hover:border-brand-teal/30 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                        >
                          <RefreshCw className="h-3.5 w-3.5" /> Restock
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>

      {/* Add Medicine Modal */}
      {showAddModal && (
        <AddMedicineModal onClose={() => setShowAddModal(false)} />
      )}

      {/* Dispense Medicine Modal */}
      {showDispenseModal && (
        <DispenseModal 
          onClose={() => setShowDispenseModal(false)}
          medicines={medicines}
          patients={patients}
        />
      )}

      {/* Restock Medicine Modal */}
      {restockMedicineId && (
        <RestockModal
          onClose={() => setRestockMedicineId(null)}
          medicines={medicines}
          initialSelectedId={restockMedicineId}
        />
      )}
    </PageWrapper>
  );
}
