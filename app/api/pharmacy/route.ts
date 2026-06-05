import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Medicine } from '@/lib/models/Medicine';
import { getSessionUser } from '@/lib/api-auth';
export async function GET() {
  const user = getSessionUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    await connectToDatabase();
    const medicines = await Medicine.find({}).sort({ name: 1 });
    return NextResponse.json(medicines);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch medicines' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = getSessionUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    await connectToDatabase();
    const body = await request.json();
    const newMedicine = new Medicine(body);
    await newMedicine.save();
    return NextResponse.json(newMedicine, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create medicine' }, { status: 500 });
  }
}
