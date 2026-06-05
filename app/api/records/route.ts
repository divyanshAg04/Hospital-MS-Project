import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { MedicalRecord } from '@/lib/models/MedicalRecord';
import { getSessionUser } from '@/lib/api-auth';



export async function GET() {
  const user = getSessionUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    await connectToDatabase();
    const records = await MedicalRecord.find({}).sort({ createdAt: -1 });
    return NextResponse.json(records);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch records' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = getSessionUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    await connectToDatabase();
    const body = await request.json();
    const newRecord = new MedicalRecord(body);
    await newRecord.save();
    return NextResponse.json(newRecord, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create record' }, { status: 500 });
  }
}
