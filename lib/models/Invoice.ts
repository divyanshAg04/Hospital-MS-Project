import mongoose, { Schema } from 'mongoose';
import { Invoice as IInvoice } from '@/types';

const LineItemSchema = new Schema({
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  quantity: { type: Number, required: true, default: 1 },
}, { _id: false });

const InvoiceSchema = new Schema<IInvoice>({
  id: { type: String, required: true, unique: true, index: true },
  patientId: { type: String, required: true, index: true },
  appointmentId: { type: String },
  date: { type: String, required: true },
  dueDate: { type: String, required: true },
  lineItems: { type: [LineItemSchema], default: [] },
  discount: { type: Number, required: true, default: 0 },
  tax: { type: Number, required: true, default: 0 },
  total: { type: Number, required: true },
  amountPaid: { type: Number, required: true, default: 0 },
  status: { type: String, enum: ['Paid', 'Unpaid', 'Partially Paid', 'Overdue'], required: true },
  paymentMethod: { type: String, enum: ['Cash', 'Card', 'UPI', 'Insurance'] },
});

export const Invoice = mongoose.models.Invoice || mongoose.model<IInvoice>('Invoice', InvoiceSchema);
