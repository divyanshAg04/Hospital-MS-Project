import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ActivityLog } from '@/lib/models/ActivityLog';
import { getSessionUser } from '@/lib/api-auth';

export async function GET() {
  const user = getSessionUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    await connectToDatabase();
    const logs = await ActivityLog.find({}).sort({ timestamp: -1 }).limit(100);
    return NextResponse.json(logs);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch activity logs' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = getSessionUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    await connectToDatabase();
    const body = await request.json();
    const newLog = new ActivityLog(body);
    await newLog.save();
    return NextResponse.json(newLog, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create activity log' }, { status: 500 });
  }
}
