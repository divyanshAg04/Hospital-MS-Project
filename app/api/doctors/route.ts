import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Doctor } from '@/lib/models/Doctor';
import { getSessionUser } from '@/lib/api-auth';

export async function GET() {
  try {
    const user = getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const doctors = await Doctor.find({}).sort({ name: 1 });
    return NextResponse.json(doctors);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch doctors' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = getSessionUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const body = await request.json();
    const newDoctor = new Doctor(body);
    await newDoctor.save();
    return NextResponse.json(newDoctor, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create doctor' }, { status: 500 });
  }
}
