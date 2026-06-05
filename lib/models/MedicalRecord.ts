import mongoose, { Schema } from 'mongoose';
import { MedicalRecord as IMedicalRecord } from '@/types';

const PrescriptionSchema = new Schema({
  medicineName: { type: String, required: true },
  dosage: { type: String, required: true },
  duration: { type: String, required: true },
  instructions: { type: String, required: true },
}, { _id: false });

const LabResultSchema = new Schema({
  testName: { type: String, required: true },
  result: { type: String, required: true },
  normalRange: { type: String, required: true },
  status: { type: String, enum: ['Normal', 'Abnormal', 'Critical'], required: true },
}, { _id: false });

const VitalsSchema = new Schema({
  bloodPressure: { type: String, required: true },
  heartRate: { type: Number, required: true },
  temperature: { type: Number, required: true },
  respiratoryRate: { type: Number },
  spO2: { type: Number },
}, { _id: false });

const MedicalRecordSchema = new Schema<IMedicalRecord>({
  id: { type: String, required: true, unique: true, index: true },
  patientId: { type: String, required: true, index: true },
  doctorId: { type: String, required: true, index: true },
  department: { type: String, required: true },
  diagnosis: { type: String, required: true },
  treatmentPlan: { type: String, required: true },
  prescriptions: { type: [PrescriptionSchema], default: [] },
  labResults: { type: [LabResultSchema], default: [] },
  vitals: { type: VitalsSchema, required: true },
  notes: { type: String },
  date: { type: String, required: true },
  createdAt: { type: String, required: true },
});

export const MedicalRecord = mongoose.models.MedicalRecord || mongoose.model<IMedicalRecord>('MedicalRecord', MedicalRecordSchema);
