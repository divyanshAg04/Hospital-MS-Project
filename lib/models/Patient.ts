import mongoose, { Schema } from 'mongoose';
import { Patient as IPatient } from '@/types';

const EmergencyContactSchema = new Schema({
  name: { type: String, required: true },
  relation: { type: String, required: true },
  phone: { type: String, required: true },
}, { _id: false });

const PatientSchema = new Schema<IPatient>({
  id: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  dob: { type: String, required: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
  bloodGroup: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  address: { type: String, required: true },
  department: { type: String, required: true },
  assignedDoctorId: { type: String, required: true },
  status: { type: String, enum: ['Active', 'Critical', 'Discharged', 'Under Observation'], required: true },
  admissionType: { type: String, enum: ['OPD', 'IPD', 'Emergency'], required: true },
  admissionDate: { type: String, required: true },
  ward: { type: String },
  bedNumber: { type: String },
  allergies: { type: [String], default: [] },
  conditions: { type: [String], default: [] },
  symptoms: { type: [String], default: [] },
  insuranceProvider: { type: String },
  insuranceId: { type: String },
  emergencyContact: { type: EmergencyContactSchema, required: true },
  notes: { type: String },
  createdAt: { type: String, required: true },
  updatedAt: { type: String, required: true },
});

export const Patient = mongoose.models.Patient || mongoose.model<IPatient>('Patient', PatientSchema);
