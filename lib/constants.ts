import { Department, BloodGroup } from '@/types';

export const DEPARTMENTS: Department[] = [
  'Cardiology',
  'Neurology',
  'Orthopedics',
  'Pediatrics',
  'Oncology',
  'Radiology',
  'ICU',
  'Emergency',
  'Dermatology',
  'General Medicine'
];

export const BLOOD_GROUPS: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

export const APPOINTMENT_TYPES = ['Consultation', 'Follow-up', 'Emergency', 'Procedure', 'Checkup'] as const;

export const APPOINTMENT_STATUSES = ['Scheduled', 'Checked In', 'In Progress', 'Completed', 'Cancelled', 'No Show'] as const;

export const PATIENT_STATUSES = ['Active', 'Critical', 'Discharged', 'Under Observation'] as const;

export const ADMISSION_TYPES = ['OPD', 'IPD', 'Emergency'] as const;
