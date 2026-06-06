import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { User } from '@/lib/models/User';

export async function GET() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('medcore_session')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    await connectToDatabase();
    
    // Fetch fresh user from DB to ensure they still exist and have correct details
    const user = await User.findOne({ id: payload.id });
    if (!user) {
      return NextResponse.json({ error: 'User no longer exists' }, { status: 401 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar || '',
        createdAt: user.createdAt,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch current user' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('medcore_session')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    const { name, email } = await request.json();
    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

    await connectToDatabase();

    const user = await User.findOne({ id: payload.id });
    if (!user) {
      return NextResponse.json({ error: 'User no longer exists' }, { status: 404 });
    }

    // Protect administrative email from modification
    if (user.role === 'admin' && email.toLowerCase() !== user.email.toLowerCase()) {
      return NextResponse.json(
        { error: 'Modifying the administrator email address is disabled to prevent account lockout.' },
        { status: 403 }
      );
    }

    user.name = name;
    user.email = email;
    user.updatedAt = new Date().toISOString();
    await user.save();

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar || '',
        createdAt: user.createdAt,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update profile' },
      { status: 500 }
    );
  }
}
