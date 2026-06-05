export type Department =
  | 'Cardiology'
  | 'Neurology'
  | 'Orthopedics'
  | 'Pediatrics'
  | 'Oncology'
  | 'Radiology'
  | 'ICU'
  | 'Emergency'
  | 'Dermatology'
  | 'General Medicine';

export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'O+' | 'O-' | 'AB+' | 'AB-';

export interface WeeklySchedule {
  [day: string]: {
    start: string; // e.g. "08:00 AM"
    end: string;   // e.g. "05:00 PM"
    available: boolean;
  };
}

export interface Patient {
  id: string;                  // "PX-2041"
  name: string;
  dob: string;                 // ISO date
  gender: 'Male' | 'Female' | 'Other';
  bloodGroup: BloodGroup;
  phone: string;
  email: string;
  address: string;
  department: Department;
  assignedDoctorId: string;
  status: 'Active' | 'Critical' | 'Discharged' | 'Under Observation';
  admissionType: 'OPD' | 'IPD' | 'Emergency';
  admissionDate: string;
  ward?: string;
  bedNumber?: string;
  allergies: string[];
  conditions: string[];
  symptoms: string[];
  insuranceProvider?: string;
  insuranceId?: string;
  emergencyContact: {
    name: string;
    relation: string;
    phone: string;
  };
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Doctor {
  id: string;                  // "DR-0042"
  name: string;
  photo?: string;
  specialty: string[];
  department: Department;
  qualifications: string[];    // ["MBBS", "MD Cardiology"]
  experience: number;          // years
  languages: string[];
  phone: string;
  email: string;
  roomNumber: string;
  consultationFee: number;
  rating: number;              // 1-5
  reviewCount: number;
  status: 'Available' | 'In Surgery' | 'On Leave' | 'Off Duty';
  schedule: WeeklySchedule;
  bio: string;
}

export interface Appointment {
  id: string;                  // "APT-5012"
  patientId: string;
  doctorId: string;
  department: Department;
  date: string;                // YYYY-MM-DD
  time: string;                // HH:MM
  duration: 15 | 30 | 45 | 60;
  type: 'Consultation' | 'Follow-up' | 'Emergency' | 'Procedure' | 'Checkup';
  status: 'Scheduled' | 'Checked In' | 'In Progress' | 'Completed' | 'Cancelled' | 'No Show';
  reason: string;
  notes?: string;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string; // ISO date
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  category: 'patient' | 'appointment' | 'doctor' | 'billing' | 'system';
}

export interface MedicalRecord {
  id: string; // "REC-3001"
  patientId: string;
  doctorId: string;
  department: Department;
  diagnosis: string;
  treatmentPlan: string;
  prescriptions: Array<{
    medicineName: string;
    dosage: string;
    duration: string;
    instructions: string;
  }>;
  labResults?: Array<{
    testName: string;
    result: string;
    normalRange: string;
    status: 'Normal' | 'Abnormal' | 'Critical';
  }>;
  vitals: {
    bloodPressure: string;
    heartRate: number;
    temperature: number;
    respiratoryRate?: number;
    spO2?: number;
  };
  notes?: string;
  date: string;
  createdAt: string;
}

export interface Medicine {
  id: string; // "MED-4001"
  name: string;
  category: string;
  stock: number;
  threshold: number;
  price: number;
  dosageForm: 'Tablet' | 'Capsule' | 'Syrup' | 'Injection' | 'Ointment';
  strength: string;
  manufacturer: string;
  expiryDate: string;
}

export interface Invoice {
  id: string; // "INV-8001"
  patientId: string;
  appointmentId?: string;
  date: string;
  dueDate: string;
  lineItems: Array<{
    description: string;
    amount: number;
    quantity: number;
  }>;
  discount: number;
  tax: number;
  total: number;
  amountPaid: number;
  status: 'Paid' | 'Unpaid' | 'Partially Paid' | 'Overdue';
  paymentMethod?: 'Cash' | 'Card' | 'UPI' | 'Insurance';
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: 'admin' | 'doctor' | 'nurse' | 'receptionist' | 'patient' | 'pharmacist';
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}


