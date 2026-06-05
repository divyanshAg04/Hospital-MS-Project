'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useStore } from '@/hooks/useStore';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Invoice, Patient } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { EmptyState } from '@/components/ui/EmptyState';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CreditCard, Search, Plus, X, Receipt, CheckCircle, 
  AlertTriangle, Clock, ChevronRight, Filter, DollarSign, 
  Download, PlusCircle, MinusCircle, User, Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { AccessBanner } from '@/components/ui/AccessBanner';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getInvoiceStatusVariant(status: Invoice['status']) {
  const map = {
    'Paid': 'green' as const,
    'Unpaid': 'red' as const,
    'Partially Paid': 'amber' as const,
    'Overdue': 'red' as const,
  };
  return map[status] ?? 'grey';
}

// ─── Invoice Drawer (PDF Invoice view) ───────────────────────────────────────

interface InvoiceDrawerProps {
  invoice: Invoice;
  onClose: () => void;
  patients: Patient[];
  onRecordPayment: (id: string) => void;
}

function InvoiceDrawer({ invoice, onClose, patients, onRecordPayment }: InvoiceDrawerProps) {
  const patient = patients.find(p => p.id === invoice.patientId);

  // Compute values
  const subtotal = invoice.lineItems.reduce((acc, item) => acc + (item.amount * item.quantity), 0);
  const discountVal = subtotal * (invoice.discount / 100);
  const taxedSubtotal = subtotal - discountVal;
  const taxVal = taxedSubtotal * (invoice.tax / 100);
  const due = invoice.total - invoice.amountPaid;

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
        <div className="flex items-center justify-between px-6 py-5 border-b border-border/60 bg-brand-surface/80 sticky top-0 z-10 select-none">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-brand-teal/10 border border-brand-teal/20 flex items-center justify-center text-brand-teal glow-teal">
              <Receipt className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Invoice Statement</h2>
              <p className="text-xs text-foreground/45 font-mono mt-0.5">{invoice.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-brand-surface text-foreground/40 hover:text-foreground transition-all">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-6 p-6">
          {/* Invoice Header details */}
          <div className="flex justify-between items-start border-b border-border/40 pb-4 select-none">
            <div className="flex flex-col gap-1">
              <span className="font-display font-black text-sm tracking-wider text-brand-teal">MedCore Care Clinic</span>
              <span className="text-[10px] text-foreground/40 leading-relaxed font-semibold">
                12, Ring Road, Sector V,<br />
                Bengaluru, KA 560001<br />
                support@medcore.in
              </span>
            </div>
            <div className="text-right flex flex-col gap-1 items-end">
              <Badge variant={getInvoiceStatusVariant(invoice.status)} className="mb-1">{invoice.status}</Badge>
              <span className="text-[9px] font-bold text-foreground/35 uppercase tracking-widest">Dated</span>
              <span className="text-xs font-mono font-bold text-foreground/70">{format(parseISO(invoice.date), 'dd MMM yyyy')}</span>
            </div>
          </div>

          {/* Billed To */}
          {patient && (
            <div className="flex flex-col gap-1">
              <span className="text-[9px] font-bold text-foreground/35 uppercase tracking-widest select-none">Billed To</span>
              <div className="bg-brand-surface border border-border rounded-xl p-3.5 flex flex-col gap-1">
                <span className="text-xs font-black text-foreground">{patient.name}</span>
                <span className="text-[10px] text-foreground/40 font-mono">Patient ID: {patient.id}</span>
                <span className="text-[10px] text-foreground/45 mt-0.5">Contact: {patient.phone}</span>
                {patient.address && <span className="text-[10px] text-foreground/45 truncate mt-0.5">Address: {patient.address}</span>}
              </div>
            </div>
          )}

          {/* Bill Line Items */}
          <div>
            <span className="text-[9px] font-bold text-foreground/35 uppercase tracking-widest block mb-2 select-none">Invoice Particulars</span>
            <div className="border border-border rounded-xl overflow-hidden bg-brand-surface">
              <div className="grid grid-cols-[3fr_1fr_1.5fr] gap-2 px-3.5 py-2.5 bg-brand-surface/75 border-b border-border text-[9px] font-bold text-foreground/45 uppercase tracking-widest select-none">
                <span>Description</span>
                <span className="text-center">Qty</span>
                <span className="text-right">Amount</span>
              </div>
              <div className="divide-y divide-border/30">
                {invoice.lineItems.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-[3fr_1fr_1.5fr] gap-2 px-3.5 py-3.5 text-xs font-semibold items-center">
                    <span className="text-foreground truncate">{item.description}</span>
                    <span className="text-center text-foreground/50 font-mono">{item.quantity}</span>
                    <span className="text-right text-foreground/80 font-mono">₹{item.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Finances Breakdown */}
          <div className="bg-brand-surface border border-border rounded-xl p-4 flex flex-col gap-2 font-mono">
            <div className="flex justify-between text-xs text-foreground/50 font-semibold select-none">
              <span>Subtotal</span>
              <span>₹{subtotal.toLocaleString()}</span>
            </div>
            {invoice.discount > 0 && (
              <div className="flex justify-between text-xs text-brand-green font-semibold">
                <span>Discount ({invoice.discount}%)</span>
                <span>- ₹{discountVal.toLocaleString()}</span>
              </div>
            )}
            {invoice.tax > 0 && (
              <div className="flex justify-between text-xs text-brand-amber font-semibold select-none">
                <span>Tax ({invoice.tax}%)</span>
                <span>+ ₹{taxVal.toLocaleString()}</span>
              </div>
            )}
            <div className="h-px bg-border/40 my-1 shrink-0" />
            <div className="flex justify-between text-sm font-black text-foreground">
              <span className="select-none">Grand Total</span>
              <span className="text-brand-teal">₹{invoice.total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xs text-foreground/60 font-semibold select-none">
              <span>Amount Paid</span>
              <span className="text-brand-green font-bold">₹{invoice.amountPaid.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xs font-semibold select-none">
              <span>Outstanding Due</span>
              <span className={cn('font-bold', due > 0 ? 'text-brand-red animate-pulse' : 'text-brand-green')}>
                ₹{due.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Alert for Pending dues */}
          {due > 0 && (
            <div className="flex items-start gap-2.5 bg-brand-red/5 border border-brand-red/20 rounded-xl p-3.5 select-none">
              <AlertTriangle className="h-4.5 w-4.5 text-brand-red shrink-0 mt-0.5" />
              <div className="text-[11px] leading-relaxed text-foreground/65">
                <span className="font-bold text-brand-red">Notice: </span>
                An outstanding balance of ₹{due.toLocaleString()} is remaining on this ledger. Complete payment using the button below.
              </div>
            </div>
          )}

          {/* Payment Method Details */}
          {invoice.paymentMethod && (
            <div className="text-xs text-foreground/45 font-semibold flex items-center gap-1.5 select-none">
              <CreditCard className="h-3.5 w-3.5" /> Payment Method: <Badge variant="teal">{invoice.paymentMethod}</Badge>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-3 border-t border-border/60 select-none">
            {due > 0 && (
              <button
                onClick={() => onRecordPayment(invoice.id)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-primary text-white text-xs font-black transition-all shadow-btn hover:shadow-btn-hover hover:scale-[1.01]"
              >
                Record Payment
              </button>
            )}
            <button className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-surface border border-border text-foreground/70 hover:text-brand-teal hover:bg-brand-surface/80 transition-all ml-auto">
              <Download className="h-3.5 w-3.5" /> Export PDF
            </button>
          </div>
        </div>
      </motion.aside>
    </AnimatePresence>
  );
}

// ─── Record Payment Modal ────────────────────────────────────────────────────

interface RecordPaymentModalProps {
  onClose: () => void;
  invoice: Invoice;
}

function RecordPaymentModal({ onClose, invoice }: RecordPaymentModalProps) {
  const { updateInvoiceStatus } = useStore();
  const outstanding = invoice.total - invoice.amountPaid;

  const [form, setForm] = useState({
    amount: outstanding,
    method: 'UPI' as Invoice['paymentMethod'],
  });

  const inputClass = "w-full bg-brand-surface/30 border border-border/60 rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-brand-teal/40 focus:ring-1 focus:ring-brand-teal/20 transition-all";
  const labelClass = "text-[10px] font-bold uppercase tracking-widest text-foreground/40 mb-1 block";
  const selectClass = inputClass + " appearance-none cursor-pointer";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.amount <= 0) return;

    const newAmountPaid = invoice.amountPaid + form.amount;
    const finalStatus = newAmountPaid >= invoice.total ? 'Paid' : 'Partially Paid';
    
    updateInvoiceStatus(invoice.id, finalStatus, newAmountPaid);
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
          className="glass-card w-full max-w-sm"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-6 py-5 border-b border-border/60">
            <div>
              <h2 className="text-base font-bold text-foreground">Record Payment</h2>
              <p className="text-xs text-foreground/40 mt-0.5">Settle invoice balance for #{invoice.id}</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-brand-surface text-foreground/40 hover:text-foreground transition-all">
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
            <div>
              <label className={labelClass}>Outstanding Dues (Max)</label>
              <div className="text-lg font-black text-brand-red font-mono">₹{outstanding.toLocaleString()}</div>
            </div>

            <div>
              <label className={labelClass}>Payment Method *</label>
              <select value={form.method} onChange={e => setForm({...form, method: e.target.value as Invoice['paymentMethod']})} className={selectClass}>
                {['UPI', 'Cash', 'Card', 'Insurance'].map(m => <option key={m}>{m}</option>)}
              </select>
            </div>

            <div>
              <label className={labelClass}>Settlement Amount (₹) *</label>
              <input required type="number" min={1} max={outstanding} value={form.amount} onChange={e => setForm({...form, amount: Number(e.target.value)})} className={inputClass} />
            </div>

            <div className="flex items-center gap-3 pt-2 border-t border-border/60">
              <button type="button" onClick={onClose} className="flex-1 px-4 py-3 rounded-xl bg-brand-surface border border-border text-foreground/60 text-sm font-bold hover:text-foreground transition-all">
                Cancel
              </button>
              <button type="submit" className="flex-1 px-4 py-3 rounded-xl bg-gradient-primary text-white text-sm font-extrabold transition-all shadow-btn hover:shadow-btn-hover hover:scale-[1.01]">
                Record Payment
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Generate Invoice Modal ──────────────────────────────────────────────────

interface GenerateInvoiceProps {
  onClose: () => void;
  patients: Patient[];
}

function GenerateInvoiceModal({ onClose, patients }: GenerateInvoiceProps) {
  const { addInvoice } = useStore();

  const [form, setForm] = useState({
    patientId: patients[0]?.id ?? '',
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString().split('T')[0], // 7 days payment cycle
    discount: 0,
    tax: 18,
  });

  const [items, setItems] = useState<Array<{ description: string; amount: number; quantity: number }>>([
    { description: 'General Consultation Fee', amount: 500, quantity: 1 }
  ]);

  const handleAddItem = () => {
    setItems([...items, { description: '', amount: 100, quantity: 1 }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: string, value: string | number) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const subtotal = useMemo(() => items.reduce((acc, item) => acc + (item.amount * item.quantity), 0), [items]);
  const finalTotal = useMemo(() => {
    const discountVal = subtotal * (form.discount / 100);
    const taxedSubtotal = subtotal - discountVal;
    return Math.round(taxedSubtotal * (1 + form.tax / 100));
  }, [subtotal, form.discount, form.tax]);

  const inputClass = "w-full bg-brand-surface/30 border border-border/60 rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-brand-teal/40 focus:ring-1 focus:ring-brand-teal/20 transition-all";
  const labelClass = "text-[10px] font-bold uppercase tracking-widest text-foreground/40 mb-1 block";
  const selectClass = inputClass + " appearance-none cursor-pointer";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.patientId) return;

    addInvoice({
      patientId: form.patientId,
      date: form.date,
      dueDate: form.dueDate,
      lineItems: items.filter(i => i.description.trim() !== ''),
      discount: Number(form.discount),
      tax: Number(form.tax),
      total: finalTotal,
      amountPaid: 0,
      status: 'Unpaid',
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
          className="glass-card w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-6 py-5 border-b border-border/60">
            <div>
              <h2 className="text-base font-bold text-foreground">Generate Bill Invoice</h2>
              <p className="text-xs text-foreground/40 mt-0.5">Generate customized ledger bills and invoice sheets</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-brand-surface text-foreground/40 hover:text-foreground transition-all">
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
            {/* Patient selector */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-1">
                <label className={labelClass}>Patient ID *</label>
                <select required value={form.patientId} onChange={e => setForm({...form, patientId: e.target.value})} className={selectClass}>
                  {patients.map(p => <option key={p.id} value={p.id}>{p.name} ({p.id})</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Invoice Date *</label>
                <input required type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Due Date *</label>
                <input required type="date" value={form.dueDate} onChange={e => setForm({...form, dueDate: e.target.value})} className={inputClass} />
              </div>
            </div>

            {/* Line Items List */}
            <div>
              <div className="flex items-center justify-between border-b border-border/40 pb-2 mb-3">
                <p className="text-[11px] font-bold text-brand-teal uppercase tracking-widest">Bill Particulars</p>
                <button type="button" onClick={handleAddItem} className="flex items-center gap-1 text-[10px] text-brand-teal font-extrabold uppercase hover:text-brand-teal/80 transition-all">
                  <PlusCircle className="h-3.5 w-3.5" /> Add Row
                </button>
              </div>

              <div className="flex flex-col gap-3">
                {items.map((item, idx) => (
                  <div key={idx} className="flex items-end gap-2 bg-brand-surface border border-border/50 rounded-xl p-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-1">
                      <div className="sm:col-span-1">
                        <label className={labelClass}>Item Description</label>
                        <input required value={item.description} onChange={e => handleItemChange(idx, 'description', e.target.value)} placeholder="e.g. Ward Charge" className={inputClass} />
                      </div>
                      <div>
                        <label className={labelClass}>Unit Price (₹)</label>
                        <input required type="number" min={0} value={item.amount} onChange={e => handleItemChange(idx, 'amount', Number(e.target.value))} className={inputClass} />
                      </div>
                      <div>
                        <label className={labelClass}>Quantity</label>
                        <input required type="number" min={1} value={item.quantity} onChange={e => handleItemChange(idx, 'quantity', Number(e.target.value))} className={inputClass} />
                      </div>
                    </div>
                    {items.length > 1 && (
                      <button type="button" onClick={() => handleRemoveItem(idx)} className="p-2 rounded-xl text-brand-red bg-brand-red/5 hover:bg-brand-red/10 transition-all border border-brand-red/15 mb-[3px]">
                        <MinusCircle className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Discounts and tax */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Discount applied (%)</label>
                <input type="number" min={0} max={100} value={form.discount} onChange={e => setForm({...form, discount: Number(e.target.value)})} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Taxes (%)</label>
                <input type="number" min={0} max={100} value={form.tax} onChange={e => setForm({...form, tax: Number(e.target.value)})} className={inputClass} />
              </div>
            </div>

            {/* Calculations Banner */}
            <div className="bg-brand-surface border border-border rounded-xl p-4 flex flex-col gap-2 font-mono">
              <div className="flex justify-between text-xs text-foreground/50">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs text-brand-green">
                <span>Discount Deduction</span>
                <span>- ₹{(subtotal * (form.discount / 100)).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs text-brand-amber">
                <span>Tax Addition</span>
                <span>+ ₹{((subtotal - subtotal * (form.discount / 100)) * (form.tax / 100)).toLocaleString()}</span>
              </div>
              <div className="h-px bg-border/40 my-1" />
              <div className="flex justify-between text-sm font-black text-foreground">
                <span>Grand Total Estimation</span>
                <span className="text-brand-teal text-base">₹{finalTotal.toLocaleString()}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2 border-t border-border/60">
              <button type="button" onClick={onClose} className="flex-1 px-4 py-3 rounded-xl bg-brand-surface border border-border text-foreground/60 text-sm font-bold hover:text-foreground transition-all">
                Cancel
              </button>
              <button type="submit" className="flex-1 px-4 py-3 rounded-xl bg-gradient-primary text-white text-sm font-extrabold transition-all shadow-btn hover:shadow-btn-hover hover:scale-[1.01]">
                Record Invoice
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function BillingPage() {
  const { initializeStore, invoices, patients } = useStore();
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string; role: string } | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => { initializeStore(); }, [initializeStore]);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => { if (res.ok) return res.json(); throw new Error(''); })
      .then((data) => { if (data.user) setCurrentUser(data.user); })
      .catch(() => {})
      .finally(() => setLoadingUser(false));
  }, []);

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'All' | Invoice['status']>('All');
  
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [paymentInvoice, setPaymentInvoice] = useState<Invoice | null>(null);

  // Derived role flag — must be BEFORE the filtered useMemo
  const isPatient = currentUser?.role === 'patient';

  const filtered = useMemo(() => {
    return invoices.filter(inv => {
      // Patients only see their own invoices (matched by patient name)
      if (isPatient && currentUser) {
        const pat = patients.find(p => p.id === inv.patientId);
        if (!pat || pat.name.toLowerCase() !== currentUser.name.toLowerCase()) return false;
      }

      // Status filter
      if (filterStatus !== 'All' && inv.status !== filterStatus) return false;

      // Text search
      if (search) {
        const q = search.toLowerCase();
        const pat = patients.find(p => p.id === inv.patientId);
        return (
          inv.id.toLowerCase().includes(q) ||
          (pat?.name ?? '').toLowerCase().includes(q) ||
          inv.patientId.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [invoices, filterStatus, search, patients, isPatient, currentUser]);

  // Financial Stats
  const stats = useMemo(() => {
    let grossCollected = 0;
    let outstandingDue = 0;
    let overdueCount = 0;

    invoices.forEach(inv => {
      grossCollected += inv.amountPaid;
      outstandingDue += (inv.total - inv.amountPaid);
      if (inv.status === 'Overdue') {
        overdueCount += 1;
      }
    });

    return {
      grossCollected,
      outstandingDue,
      totalPaid: invoices.filter(inv => inv.status === 'Paid').length,
      overdueCount,
    };
  }, [invoices]);

  if (loadingUser) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-teal" />
        </div>
      </PageWrapper>
    );
  }


  if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'receptionist' && currentUser.role !== 'patient')) {
    return (
      <PageWrapper>
        <div className="flex flex-col gap-6 pb-10 animate-fade-in-up">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/50 pb-5 select-none">
            <div>
              <h1 className="text-2xl font-black font-display tracking-tight text-foreground">Billing & Invoices</h1>
              <p className="text-xs text-foreground/45 mt-1 font-medium">Record patient invoice payments, track gross clinic revenues, and manage billing accounts</p>
            </div>
          </div>
          <AccessBanner role={currentUser?.role || 'Guest'} allowedRoles={['admin', 'receptionist']} message="" />
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
            <h1 className="text-2xl font-black font-display tracking-tight text-foreground">Billing & Invoices</h1>
            <p className="text-xs text-foreground/45 mt-1 font-medium">Record patient invoice payments, track gross clinic revenues, and manage billing accounts</p>
          </div>
          <div className="flex items-center gap-3 shrink-0 select-none">
            {!isPatient && (
              <button
                onClick={() => setShowGenerateModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-primary text-white text-sm font-extrabold transition-all shadow-btn hover:shadow-btn-hover hover:scale-[1.02]"
              >
                <Plus className="h-4 w-4" />
                Generate Invoice
              </button>
            )}
          </div>
        </div>

        {/* Financial KPI Stats Row — hidden for patients */}
        {!isPatient && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 shrink-0 select-none">
          <div className="glass-card p-4.5 flex flex-col gap-1 border border-border/60 bg-brand-teal/5">
            <span className="text-2xl font-black font-mono text-brand-teal">₹{stats.grossCollected.toLocaleString()}</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-brand-teal/60">Gross Collected Revenue</span>
          </div>
          <div className="glass-card p-4.5 flex flex-col gap-1 border border-border/60 bg-brand-red/5">
            <span className="text-2xl font-black font-mono text-brand-red animate-pulse">₹{stats.outstandingDue.toLocaleString()}</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-brand-red/60">Outstanding Dues</span>
          </div>
          <div className="glass-card p-4.5 flex flex-col gap-1 border border-border/60">
            <span className="text-2xl font-black font-mono text-foreground">{stats.totalPaid} invoices</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/35">Settled Ledger Payments</span>
          </div>
          <div className={cn("glass-card p-4.5 flex flex-col gap-1 border border-border/60", stats.overdueCount > 0 ? "bg-brand-red/5" : "")}>
            <span className={cn("text-2xl font-black font-mono", stats.overdueCount > 0 ? "text-brand-red" : "text-foreground")}>{stats.overdueCount} ledgers</span>
            <span className={cn("text-[10px] font-bold uppercase tracking-widest", stats.overdueCount > 0 ? "text-brand-red/60" : "text-foreground/35")}>Overdue Invoices</span>
          </div>
        </div>
        )}

        {/* Filters & Search */}
        <div className="glass-card p-4 flex flex-col sm:flex-row gap-3 shrink-0">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/30" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by invoice ID, patient name or ID..."
              className="w-full pl-9 pr-3 py-2.5 bg-brand-surface/30 border border-border/60 rounded-xl text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-brand-teal/40 transition-all"
            />
          </div>

          {/* Status Pills */}
          <div className="flex items-center gap-1.5 bg-brand-surface border border-border/65 rounded-xl p-1 shrink-0 select-none">
            {(['All', 'Paid', 'Unpaid', 'Partially Paid', 'Overdue'] as const).map(s => (
              <button key={s} onClick={() => setFilterStatus(s)} className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap',
                filterStatus === s ? 'bg-[#4F8CFF] text-white shadow-sm' : 'text-foreground/50 hover:text-foreground'
              )}>{s}</button>
            ))}
          </div>
        </div>

        {/* Results Info */}
        <div className="flex items-center gap-2 text-xs text-foreground/40 font-semibold -mt-3 select-none">
          <Filter className="h-3.5 w-3.5" />
          Showing <span className="text-foreground/70 font-bold">{filtered.length}</span> of <span className="text-foreground/70">{invoices.length}</span> ledgers
        </div>

        {/* Invoices Table/List */}
        {filtered.length === 0 ? (
          <EmptyState
            icon={<CreditCard className="h-10 w-10" />}
            title="No invoices found"
            description="Adjust filters or generate a patient billing invoice."
          />
        ) : (
          <div className="glass-card overflow-hidden">
            {/* Headers */}
            <div className="hidden md:grid grid-cols-[1fr_2.5fr_1.2fr_1.5fr_1fr_1.2fr_auto] gap-4 px-5 py-3 border-b border-border/60 bg-brand-surface/40 select-none">
              {['Invoice ID', 'Attending Patient', 'Ledger total', 'Ledger Settled', 'Due Date', 'Status', ''].map(h => (
                <span key={h} className="text-[10px] font-bold uppercase tracking-widest text-foreground/35">{h}</span>
              ))}
            </div>

            {/* List */}
            <div className="divide-y divide-border/40">
              <AnimatePresence>
                {filtered.map((inv, idx) => {
                  const pat = patients.find(p => p.id === inv.patientId);
                  const due = inv.total - inv.amountPaid;

                  return (
                    <motion.div
                      key={inv.id}
                      layout
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: idx * 0.02, duration: 0.2 }}
                      onClick={() => setSelectedInvoice(inv)}
                      className="grid grid-cols-1 md:grid-cols-[1fr_2.5fr_1.2fr_1.5fr_1fr_1.2fr_auto] gap-4 px-5 py-4 hover:bg-[#4F8CFF]/5 cursor-pointer transition-all group items-center"
                    >
                      {/* ID */}
                      <div>
                        <span className="text-xs font-mono font-bold text-foreground/50 group-hover:text-brand-teal transition-colors">
                          {inv.id}
                        </span>
                      </div>

                      {/* Patient */}
                      {pat ? (
                        <div className="flex items-center gap-3 min-w-0">
                          <Avatar name={pat.name} size="sm" />
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-foreground truncate">{pat.name}</p>
                            <p className="text-[10px] text-foreground/40 mt-0.5">{pat.id}</p>
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-foreground/50">Unknown Patient</span>
                      )}

                      {/* Total */}
                      <div>
                        <span className="text-xs font-mono font-black text-foreground">₹{inv.total.toLocaleString()}</span>
                      </div>

                      {/* Paid vs Due */}
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-mono text-brand-green font-bold">₹{inv.amountPaid.toLocaleString()} paid</span>
                        {due > 0 && <span className="text-[10px] font-mono text-brand-red font-semibold">₹{due.toLocaleString()} remaining</span>}
                      </div>

                      {/* Due Date */}
                      <div>
                        <span className="text-xs text-foreground/40 font-semibold flex items-center gap-1">
                          <Calendar className="h-3 w-3 shrink-0" />
                          {(() => { try { return format(parseISO(inv.dueDate), 'dd MMM yy'); } catch { return inv.dueDate; } })()}
                        </span>
                      </div>

                      {/* Status */}
                      <div>
                        <Badge variant={getInvoiceStatusVariant(inv.status)}>{inv.status}</Badge>
                      </div>

                      {/* Actions — hidden for patients (read-only) */}
                      {!isPatient && (
                      <div className="flex items-center justify-end select-none">
                        {due > 0 ? (
                          <button
                            onClick={(e) => { e.stopPropagation(); setPaymentInvoice(inv); }}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-brand-surface border border-border text-xs font-bold text-foreground/60 hover:text-brand-teal hover:border-brand-teal/30 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                          >
                            Pay Bill
                          </button>
                        ) : (
                          <ChevronRight className="h-4 w-4 text-foreground/20 group-hover:text-brand-teal transition-colors" />
                        )}
                      </div>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>

      {/* Invoice Detail Drawer */}
      {selectedInvoice && (
        <InvoiceDrawer
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          patients={patients}
          onRecordPayment={(id) => {
            const inv = invoices.find(i => i.id === id);
            if (inv) {
              setSelectedInvoice(null);
              setPaymentInvoice(inv);
            }
          }}
        />
      )}

      {/* Record Payment Modal */}
      {paymentInvoice && (
        <RecordPaymentModal
          onClose={() => setPaymentInvoice(null)}
          invoice={paymentInvoice}
        />
      )}

      {/* Generate Invoice Modal */}
      {showGenerateModal && (
        <GenerateInvoiceModal
          onClose={() => setShowGenerateModal(false)}
          patients={patients}
        />
      )}
    </PageWrapper>
  );
}
