import mongoose, { Schema } from 'mongoose';
import { Medicine as IMedicine } from '@/types';

const MedicineSchema = new Schema<IMedicine>({
  id: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true, index: true },
  category: { type: String, required: true },
  stock: { type: Number, required: true, default: 0 },
  threshold: { type: Number, required: true, default: 10 },
  price: { type: Number, required: true },
  dosageForm: { type: String, enum: ['Tablet', 'Capsule', 'Syrup', 'Injection', 'Ointment'], required: true },
  strength: { type: String, required: true },
  manufacturer: { type: String, required: true },
  expiryDate: { type: String, required: true },
});

export const Medicine = mongoose.models.Medicine || mongoose.model<IMedicine>('Medicine', MedicineSchema);
