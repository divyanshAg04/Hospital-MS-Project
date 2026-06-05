import { create } from 'zustand';
import { Patient, Doctor, Appointment, ActivityLog, MedicalRecord, Medicine, Invoice } from '@/types';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

interface HospitalState {
  patients: Patient[];
  doctors: Doctor[];
  appointments: Appointment[];
  activities: ActivityLog[];
  toasts: Toast[];
  theme: 'light' | 'dark';
  initialized: boolean;
  records: MedicalRecord[];
  medicines: Medicine[];
  invoices: Invoice[];

  // Initialize
  initializeStore: () => Promise<void>;

  // Theme
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;

  // Toasts
  addToast: (message: string, type: Toast['type']) => void;
  removeToast: (id: string) => void;

  // Patients
  addPatient: (patient: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Patient>;
  updatePatient: (id: string, patient: Partial<Patient>) => Promise<void>;
  deletePatient: (id: string) => Promise<void>;

  // Doctors
  addDoctor: (doctor: Omit<Doctor, 'id' | 'rating' | 'reviewCount'>) => Promise<Doctor>;
  updateDoctor: (id: string, doctor: Partial<Doctor>) => Promise<void>;

  // Appointments
  addAppointment: (appointment: Omit<Appointment, 'id' | 'createdAt'>) => Promise<Appointment>;
  updateAppointment: (id: string, appointment: Partial<Appointment>) => Promise<void>;

  // Activities
  addActivity: (message: string, type: ActivityLog['type'], category: ActivityLog['category']) => Promise<void>;

  // Records
  addMedicalRecord: (record: Omit<MedicalRecord, 'id' | 'createdAt'>) => Promise<MedicalRecord>;

  // Medicines
  addMedicine: (medicine: Omit<Medicine, 'id'>) => Promise<Medicine>;
  updateMedicineStock: (id: string, stock: number) => Promise<void>;

  // Invoices
  addInvoice: (invoice: Omit<Invoice, 'id'>) => Promise<Invoice>;
  updateInvoiceStatus: (id: string, status: Invoice['status'], amountPaid?: number) => Promise<void>;
}

// ─── Helper: post activity log to DB silently ─────────────────────────────────
async function postActivity(log: ActivityLog) {
  try {
    await fetch('/api/activities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(log),
    });
  } catch {
    // Non-critical, ignore errors for activity logs
  }
}

export const useStore = create<HospitalState>((set, get) => ({
  patients: [],
  doctors: [],
  appointments: [],
  activities: [],
  toasts: [],
  theme: 'dark',
  initialized: false,
  records: [],
  medicines: [],
  invoices: [],

  // ─── Initialize: fetch all from MongoDB ──────────────────────────────────────
  initializeStore: async () => {
    if (get().initialized) return;

    // Load theme from localStorage
    let storedTheme: 'light' | 'dark' = 'dark';
    if (typeof window !== 'undefined') {
      const themeVal = localStorage.getItem('medcore-theme') as 'light' | 'dark';
      if (themeVal === 'light' || themeVal === 'dark') storedTheme = themeVal;
      if (storedTheme === 'light') {
        document.documentElement.classList.add('light');
      } else {
        document.documentElement.classList.remove('light');
      }
    }

    // Set theme immediately to avoid hydration flash while fetching data
    set({ theme: storedTheme });

    try {
      // Parallel fetch all collections from MongoDB APIs
      const [
        patientsRes,
        doctorsRes,
        appointmentsRes,
        recordsRes,
        medicinesRes,
        invoicesRes,
        activitiesRes,
      ] = await Promise.all([
        fetch('/api/patients'),
        fetch('/api/doctors'),
        fetch('/api/appointments'),
        fetch('/api/records'),
        fetch('/api/pharmacy'),
        fetch('/api/billing'),
        fetch('/api/activities'),
      ]);

      const [patients, doctors, appointments, records, medicines, invoices, activities] =
        await Promise.all([
          patientsRes.ok ? patientsRes.json() : [],
          doctorsRes.ok ? doctorsRes.json() : [],
          appointmentsRes.ok ? appointmentsRes.json() : [],
          recordsRes.ok ? recordsRes.json() : [],
          medicinesRes.ok ? medicinesRes.json() : [],
          invoicesRes.ok ? invoicesRes.json() : [],
          activitiesRes.ok ? activitiesRes.json() : [],
        ]);

      set({
        patients,
        doctors,
        appointments,
        records,
        medicines,
        invoices,
        activities,
        theme: storedTheme,
        initialized: true,
      });
    } catch (error) {
      console.error('[MedCore] Failed to initialize from MongoDB:', error);
      get().addToast('Failed to connect to database. Check MongoDB connection.', 'error');
      set({ initialized: true, theme: storedTheme });
    }
  },

  // ─── Theme ────────────────────────────────────────────────────────────────────
  setTheme: (theme) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('medcore-theme', theme);
      if (theme === 'light') {
        document.documentElement.classList.add('light');
      } else {
        document.documentElement.classList.remove('light');
      }
    }
    set({ theme });
  },

  toggleTheme: () => {
    const nextTheme = get().theme === 'dark' ? 'light' : 'dark';
    get().setTheme(nextTheme);
  },

  // ─── Toasts ───────────────────────────────────────────────────────────────────
  addToast: (message, type) => {
    const id = `TOAST-${Math.random().toString(36).substring(2, 9)}`;
    set((state) => ({ toasts: [...state.toasts, { id, message, type }] }));
  },

  removeToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
  },

  // ─── Activity Logs ────────────────────────────────────────────────────────────
  addActivity: async (message, type, category) => {
    const newActivity: ActivityLog = {
      id: `ACT-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type,
      message,
      category,
    };
    // Optimistic update
    set((state) => ({
      activities: [newActivity, ...state.activities.slice(0, 49)],
    }));
    await postActivity(newActivity);
  },

  // ─── Patients ─────────────────────────────────────────────────────────────────
  addPatient: async (patientInput) => {
    const newId = `PX-${2000 + get().patients.length + 1}`;
    const now = new Date().toISOString();
    const newPatient: Patient = { ...patientInput, id: newId, createdAt: now, updatedAt: now };

    try {
      const res = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPatient),
      });
      if (!res.ok) throw new Error('API error');
      const saved: Patient = await res.json();
      set((state) => ({ patients: [saved, ...state.patients] }));
      get().addActivity(
        `New Patient Registered: #${saved.id} (${saved.name}) admitted to ${saved.department} — ${saved.admissionType} case`,
        saved.status === 'Critical' ? 'error' : saved.status === 'Under Observation' ? 'warning' : 'success',
        'patient'
      );
      get().addToast(`Patient registered successfully! Admitted to ${saved.department}`, 'success');
      return saved;
    } catch {
      get().addToast('Failed to save patient to database', 'error');
      return newPatient;
    }
  },

  updatePatient: async (id, updatedFields) => {
    const now = new Date().toISOString();
    const merged = { ...get().patients.find((p) => p.id === id), ...updatedFields, updatedAt: now };
    // Optimistic
    set((state) => ({
      patients: state.patients.map((p) => (p.id === id ? { ...p, ...updatedFields, updatedAt: now } : p)),
    }));
    try {
      await fetch(`/api/patients/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(merged),
      });
    } catch {
      get().addToast('Failed to sync patient update to database', 'error');
    }
    const patientName = get().patients.find((p) => p.id === id)?.name || id;
    if (updatedFields.status) {
      get().addActivity(
        `Patient ${patientName} status changed to ${updatedFields.status}`,
        updatedFields.status === 'Critical' ? 'error' : updatedFields.status === 'Discharged' ? 'info' : 'warning',
        'patient'
      );
      get().addToast(`Patient status updated: ${updatedFields.status}`, updatedFields.status === 'Critical' ? 'error' : 'info');
    } else {
      get().addActivity(`Patient record updated for ${patientName}`, 'info', 'patient');
      get().addToast('Patient record updated successfully', 'success');
    }
  },

  deletePatient: async (id) => {
    const patientName = get().patients.find((p) => p.id === id)?.name || id;
    // Optimistic
    set((state) => ({ patients: state.patients.filter((p) => p.id !== id) }));
    try {
      await fetch(`/api/patients/${id}`, { method: 'DELETE' });
    } catch {
      get().addToast('Failed to delete patient from database', 'error');
    }
    get().addActivity(`Patient record deleted for ${patientName}`, 'warning', 'patient');
    get().addToast(`Patient record deleted for ${patientName}`, 'warning');
  },

  // ─── Doctors ──────────────────────────────────────────────────────────────────
  addDoctor: async (doctorInput) => {
    const newId = `DR-${String(get().doctors.length + 1).padStart(4, '0')}`;
    const newDoctor: Doctor = { ...doctorInput, id: newId, rating: 5.0, reviewCount: 0 };

    try {
      const res = await fetch('/api/doctors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDoctor),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save doctor to database');
      const saved: Doctor = data;
      set((state) => ({ doctors: [...state.doctors, saved] }));
      get().addActivity(`New Medical Staff Joined: Dr. ${saved.name} (${saved.department})`, 'success', 'doctor');
      get().addToast(`Staff member Dr. ${saved.name} registered!`, 'success');
      return saved;
    } catch (error: any) {
      get().addToast(error.message || 'Failed to save doctor to database', 'error');
      return newDoctor;
    }
  },

  updateDoctor: async (id, updatedFields) => {
    const merged = { ...get().doctors.find((d) => d.id === id), ...updatedFields };
    set((state) => ({
      doctors: state.doctors.map((d) => (d.id === id ? { ...d, ...updatedFields } : d)),
    }));
    try {
      const res = await fetch(`/api/doctors/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(merged),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to sync doctor update to database');
      }
    } catch (error: any) {
      get().addToast(error.message || 'Failed to sync doctor update to database', 'error');
    }
    const docName = get().doctors.find((d) => d.id === id)?.name || id;
    if (updatedFields.status) {
      get().addActivity(
        `Dr. ${docName} status marked as: ${updatedFields.status}`,
        updatedFields.status === 'Available' ? 'success' : updatedFields.status === 'In Surgery' ? 'warning' : 'info',
        'doctor'
      );
      get().addToast(`Dr. ${docName} is now ${updatedFields.status}`, updatedFields.status === 'Available' ? 'success' : 'info');
    } else {
      get().addActivity(`Doctor profile updated for Dr. ${docName}`, 'info', 'doctor');
      get().addToast('Doctor profile updated successfully', 'success');
    }
  },

  // ─── Appointments ─────────────────────────────────────────────────────────────
  addAppointment: async (aptInput) => {
    const newId = `APT-${5000 + get().appointments.length + 1}`;
    const newApt: Appointment = { ...aptInput, id: newId, createdAt: new Date().toISOString() };

    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newApt),
      });
      if (!res.ok) throw new Error('API error');
      const saved: Appointment = await res.json();
      set((state) => ({ appointments: [saved, ...state.appointments] }));
      const patientName = get().patients.find((p) => p.id === aptInput.patientId)?.name || 'Patient';
      const docName = get().doctors.find((d) => d.id === aptInput.doctorId)?.name || 'Doctor';
      get().addActivity(
        `New Appointment booked for ${patientName} with ${docName} on ${saved.date} at ${saved.time}`,
        'success',
        'appointment'
      );
      get().addToast('Appointment scheduled successfully!', 'success');
      return saved;
    } catch {
      get().addToast('Failed to save appointment to database', 'error');
      return newApt;
    }
  },

  updateAppointment: async (id, updatedFields) => {
    const merged = { ...get().appointments.find((a) => a.id === id), ...updatedFields };
    set((state) => ({
      appointments: state.appointments.map((a) => (a.id === id ? { ...a, ...updatedFields } : a)),
    }));
    try {
      await fetch(`/api/appointments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(merged),
      });
    } catch {
      get().addToast('Failed to sync appointment update to database', 'error');
    }
    const apt = get().appointments.find((a) => a.id === id);
    if (!apt) return;
    const patientName = get().patients.find((p) => p.id === apt.patientId)?.name || 'Patient';
    const docName = get().doctors.find((d) => d.id === apt.doctorId)?.name || 'Doctor';
    if (updatedFields.status) {
      get().addActivity(
        `Appointment #${id} status changed to ${updatedFields.status} (${patientName} → ${docName})`,
        updatedFields.status === 'Completed' ? 'success' : updatedFields.status === 'Cancelled' ? 'error' : 'info',
        'appointment'
      );
      get().addToast(`Appointment ${updatedFields.status}`, updatedFields.status === 'Completed' ? 'success' : 'info');
    } else {
      get().addActivity(`Appointment rescheduled for ${patientName} with ${docName} to ${apt.date} at ${apt.time}`, 'warning', 'appointment');
      get().addToast('Appointment rescheduled successfully', 'success');
    }
  },

  // ─── Medical Records ──────────────────────────────────────────────────────────
  addMedicalRecord: async (recordInput) => {
    const newId = `REC-${3000 + get().records.length + 1}`;
    const newRecord: MedicalRecord = { ...recordInput, id: newId, createdAt: new Date().toISOString() };

    try {
      const res = await fetch('/api/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRecord),
      });
      if (!res.ok) throw new Error('API error');
      const saved: MedicalRecord = await res.json();
      set((state) => ({ records: [saved, ...state.records] }));
      const patientName = get().patients.find((p) => p.id === recordInput.patientId)?.name || 'Patient';
      get().addActivity(`New Medical Record registered for ${patientName}: ${saved.diagnosis}`, 'success', 'patient');
      get().addToast('Medical Record saved successfully!', 'success');
      return saved;
    } catch {
      get().addToast('Failed to save medical record to database', 'error');
      return newRecord;
    }
  },

  // ─── Medicines ────────────────────────────────────────────────────────────────
  addMedicine: async (medInput) => {
    const newId = `MED-${4000 + get().medicines.length + 1}`;
    const newMedicine: Medicine = { ...medInput, id: newId };

    try {
      const res = await fetch('/api/pharmacy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMedicine),
      });
      if (!res.ok) throw new Error('API error');
      const saved: Medicine = await res.json();
      set((state) => ({ medicines: [...state.medicines, saved] }));
      get().addActivity(`Pharmacy Inventory Add: ${saved.name} (${saved.strength}) — ${saved.stock} units`, 'success', 'system');
      get().addToast(`Medicine ${saved.name} added to pharmacy inventory!`, 'success');
      return saved;
    } catch {
      get().addToast('Failed to save medicine to database', 'error');
      return newMedicine;
    }
  },

  updateMedicineStock: async (id, newStock) => {
    const medicine = get().medicines.find((m) => m.id === id);
    if (!medicine) return;
    const updated = { ...medicine, stock: newStock };
    // Optimistic update
    set((state) => ({
      medicines: state.medicines.map((m) => (m.id === id ? updated : m)),
    }));
    try {
      await fetch(`/api/pharmacy/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
    } catch {
      get().addToast('Failed to sync stock update to database', 'error');
    }
    if (newStock <= medicine.threshold) {
      get().addActivity(`Low Stock Alert: ${medicine.name} (${medicine.strength}) stock is down to ${newStock} units`, 'warning', 'system');
      get().addToast(`Low stock warning: ${medicine.name}`, 'warning');
    } else {
      get().addToast(`Stock updated for ${medicine.name}: ${newStock} units`, 'info');
    }
  },

  // ─── Invoices ─────────────────────────────────────────────────────────────────
  addInvoice: async (invInput) => {
    const newId = `INV-${8000 + get().invoices.length + 1}`;
    const newInvoice: Invoice = { ...invInput, id: newId };

    try {
      const res = await fetch('/api/billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newInvoice),
      });
      if (!res.ok) throw new Error('API error');
      const saved: Invoice = await res.json();
      set((state) => ({ invoices: [saved, ...state.invoices] }));
      const patientName = get().patients.find((p) => p.id === invInput.patientId)?.name || 'Patient';
      get().addActivity(`Invoice generated for ${patientName}: #${saved.id} — Total ₹${saved.total.toLocaleString()}`, 'info', 'billing');
      get().addToast(`Invoice #${saved.id} generated successfully!`, 'success');
      return saved;
    } catch {
      get().addToast('Failed to save invoice to database', 'error');
      return newInvoice;
    }
  },

  updateInvoiceStatus: async (id, status, amountPaid) => {
    const invoice = get().invoices.find((i) => i.id === id);
    if (!invoice) return;
    const finalPaid = amountPaid !== undefined ? amountPaid : (status === 'Paid' ? invoice.total : invoice.amountPaid);
    const updated = { ...invoice, status, amountPaid: finalPaid };
    // Optimistic update
    set((state) => ({
      invoices: state.invoices.map((inv) => (inv.id === id ? updated : inv)),
    }));
    try {
      await fetch(`/api/billing/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
    } catch {
      get().addToast('Failed to sync invoice update to database', 'error');
    }
    const patientName = get().patients.find((p) => p.id === invoice.patientId)?.name || 'Patient';
    get().addActivity(
      `Invoice #${id} (${patientName}) updated status to: ${status} (Paid: ₹${finalPaid.toLocaleString()})`,
      status === 'Paid' ? 'success' : 'warning',
      'billing'
    );
    get().addToast(`Invoice #${id} marked as ${status}`, status === 'Paid' ? 'success' : 'info');
  },
}));
