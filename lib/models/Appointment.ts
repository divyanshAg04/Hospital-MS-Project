import mongoose, { Schema } from 'mongoose';
import { Appointment as IAppointment } from '@/types';

const AppointmentSchema = new Schema<IAppointment>({
  id: { type: String, required: true, unique: true, index: true },
  patientId: { type: String, required: true, index: true },
  doctorId: { type: String, required: true, index: true },
  department: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  duration: { type: Number, enum: [15, 30, 45, 60], required: true },
  type: { type: String, enum: ['Consultation', 'Follow-up', 'Emergency', 'Procedure', 'Checkup'], required: true },
  status: { type: String, enum: ['Scheduled', 'Checked In', 'In Progress', 'Completed', 'Cancelled', 'No Show'], required: true },
  reason: { type: String, required: true },
  notes: { type: String },
  createdAt: { type: String, required: true },
});

export const Appointment = mongoose.models.Appointment || mongoose.model<IAppointment>('Appointment', AppointmentSchema);
