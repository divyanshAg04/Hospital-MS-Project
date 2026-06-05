import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Doctor } from '@/lib/models/Doctor';
import { getSessionUser } from '@/lib/api-auth';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    if (user.role !== 'admin') {
      const keys = Object.keys(body);
      const invalidKeys = keys.filter(k => k !== 'status' && k !== '_id' && k !== 'id');
      if (invalidKeys.length > 0) {
        return NextResponse.json({ error: 'Only administrators can change main details.' }, { status: 403 });
      }
    }

    await connectToDatabase();
    const updated = await Doctor.findOneAndUpdate({ id: params.id }, body, { new: true });
    if (!updated) return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update doctor' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = getSessionUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await connectToDatabase();
    const deleted = await Doctor.findOneAndDelete({ id: params.id });
    if (!deleted) return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete doctor' }, { status: 500 });
  }
}
