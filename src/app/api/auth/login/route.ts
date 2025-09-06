import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { RowDataPacket } from 'mysql2';
import { db } from '@/lib/db'; // Adjust import path based on your database setup

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user by email
    const users = (await db.query(
      'SELECT id, email, password, first_name, last_name, role FROM users WHERE email = ?',
      [email]
    )) as RowDataPacket[];

    if (!users || users.length === 0) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const user = users[0];
    console.log(users);
    console.log('iwdidinwd');
    console.log(user);

    // Compare password with hashed password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Return user data (excluding password)
    const userData = {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role,
    };

    // Determine redirect URL based on role
    let redirectUrl = '/';
    if (user.role === 'admin') {
      redirectUrl = '/admin';
    } else if (user.role === 'creator') {
      redirectUrl = '/dashboard';
    }

    return NextResponse.json(
      {
        message: 'Login successful',
        user: userData,
        redirectUrl: redirectUrl,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
