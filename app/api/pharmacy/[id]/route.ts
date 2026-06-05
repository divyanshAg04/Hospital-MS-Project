import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Medicine } from '@/lib/models/Medicine';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const updated = await Medicine.findOneAndUpdate({ id: params.id }, body, { new: true });
    if (!updated) return NextResponse.json({ error: 'Medicine not found' }, { status: 404 });
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update medicine' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const deleted = await Medicine.findOneAndDelete({ id: params.id });
    if (!deleted) return NextResponse.json({ error: 'Medicine not found' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete medicine' }, { status: 500 });
  }
}
