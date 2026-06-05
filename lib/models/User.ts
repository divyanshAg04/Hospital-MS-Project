import mongoose, { Schema } from 'mongoose';
import { User as IUser } from '@/types';

const UserSchema = new Schema<IUser>({
  id: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'doctor', 'nurse', 'receptionist', 'patient', 'pharmacist'], default: 'patient', required: true },
  avatar: { type: String },
  createdAt: { type: String, required: true },
  updatedAt: { type: String, required: true },
});

export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
