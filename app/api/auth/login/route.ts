import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { User } from '@/lib/models/User';
import { verifyPassword, signToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { email, password } = body;

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user
    let user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      if (email.toLowerCase() === 'demoadmin@medcore.com' && password === 'demoadmin123') {
        const { hashPassword } = await import('@/lib/auth');
        user = new User({
          id: 'USR-0002',
          name: 'Demo Admin (Read-Only)',
          email: 'demoadmin@medcore.com',
          password: hashPassword('demoadmin123'),
          role: 'admin',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        await user.save();
      } else {
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        );
      }
    }

    // Verify password
    const isPasswordValid = verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Create session token
    const token = signToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    // Create response
    const response = NextResponse.json({
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

    // Set cookie
    response.cookies.set({
      name: 'medcore_session',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to login' },
      { status: 500 }
    );
  }
}
