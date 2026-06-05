import mongoose, { Schema } from 'mongoose';
import { Doctor as IDoctor } from '@/types';

const ScheduleDaySchema = new Schema({
  start: { type: String, required: true },
  end: { type: String, required: true },
  available: { type: Boolean, required: true },
}, { _id: false });

const DoctorSchema = new Schema<IDoctor>({
  id: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  photo: { type: String },
  specialty: { type: [String], default: [] },
  department: { type: String, required: true },
  qualifications: { type: [String], default: [] },
  experience: { type: Number, required: true },
  languages: { type: [String], default: [] },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  roomNumber: { type: String, required: true },
  consultationFee: { type: Number, required: true },
  rating: { type: Number, required: true, default: 5 },
  reviewCount: { type: Number, required: true, default: 0 },
  status: { type: String, enum: ['Available', 'In Surgery', 'On Leave', 'Off Duty'], required: true },
  schedule: { type: Map, of: ScheduleDaySchema, required: true },
  bio: { type: String, required: true },
});

export const Doctor = mongoose.models.Doctor || mongoose.model<IDoctor>('Doctor', DoctorSchema);
