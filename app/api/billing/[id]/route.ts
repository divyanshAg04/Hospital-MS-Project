import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Invoice } from '@/lib/models/Invoice';
import { getSessionUser } from '@/lib/api-auth';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const user = getSessionUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (user.role !== 'admin' && user.role !== 'receptionist') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  try {
    await connectToDatabase();
    const body = await request.json();
    const updated = await Invoice.findOneAndUpdate({ id: params.id }, body, { new: true });
    if (!updated) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update invoice' }, { status: 500 });
  }
}
