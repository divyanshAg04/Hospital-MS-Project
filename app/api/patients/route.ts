import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Patient } from '@/lib/models/Patient';
import { getSessionUser } from '@/lib/api-auth';

export async function GET() {
  try {
    const user = getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const patients = await Patient.find({}).sort({ name: 1 });
    return NextResponse.json(patients);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch patients' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role !== 'admin' && user.role !== 'receptionist') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await connectToDatabase();
    const body = await request.json();
    const newPatient = new Patient(body);
    await newPatient.save();
    return NextResponse.json(newPatient, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create patient' }, { status: 500 });
  }
}
