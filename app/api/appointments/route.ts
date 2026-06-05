import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Appointment } from '@/lib/models/Appointment';
import { getSessionUser } from '@/lib/api-auth';

export async function GET() {
  const user = getSessionUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    await connectToDatabase();
    const appointments = await Appointment.find({}).sort({ date: -1, time: 1 });
    return NextResponse.json(appointments);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch appointments' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = getSessionUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (user.role !== 'admin' && user.role !== 'receptionist') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  try {
    await connectToDatabase();
    const body = await request.json();
    const newAppointment = new Appointment(body);
    await newAppointment.save();
    return NextResponse.json(newAppointment, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create appointment' }, { status: 500 });
  }
}
