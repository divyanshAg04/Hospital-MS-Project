import mongoose, { Schema } from 'mongoose';
import { ActivityLog as IActivityLog } from '@/types';

const ActivityLogSchema = new Schema<IActivityLog>({
  id: { type: String, required: true, unique: true, index: true },
  timestamp: { type: String, required: true },
  type: { type: String, enum: ['info', 'success', 'warning', 'error'], required: true },
  message: { type: String, required: true },
  category: { type: String, enum: ['patient', 'appointment', 'doctor', 'billing', 'system'], required: true },
});

export const ActivityLog = mongoose.models.ActivityLog || mongoose.model<IActivityLog>('ActivityLog', ActivityLogSchema);
