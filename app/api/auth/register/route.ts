import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { User } from '@/lib/models/User';
import { hashPassword } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { name, email, password, role } = body;

    // Validation
    if (role === 'admin') {
      return NextResponse.json(
        { error: 'Admin registration is disabled' },
        { status: 400 }
      );
    }

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Generate a unique ID (e.g., USR-4829)
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const userId = `USR-${randomNum}`;

    // Hash the password
    const hashedPassword = hashPassword(password);

    // Create the user
    const newUser = new User({
      id: userId,
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role || 'patient',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    await newUser.save();

    // Remove password from response
    const userResponse = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      createdAt: newUser.createdAt,
    };

    return NextResponse.json(
      { message: 'User registered successfully', user: userResponse },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to register user' },
      { status: 500 }
    );
  }
}
