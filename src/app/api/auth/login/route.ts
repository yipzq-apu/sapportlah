import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user by email
    const users = await db.query(
      `SELECT id, email, password, first_name, last_name, role, status, rejection_reason 
       FROM users WHERE email = ?`,
      [email]
    );

    if (!Array.isArray(users) || users.length === 0) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const user = users[0] as any;

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check user status
    if (user.status === 'pending') {
      return NextResponse.json(
        {
          error: 'account_pending',
          message:
            'Your account is still under review. Please wait for admin approval.',
          status: 'pending',
        },
        { status: 403 }
      );
    }

    if (user.status === 'rejected') {
      return NextResponse.json(
        {
          error: 'account_rejected',
          message: 'Your account has been rejected.',
          reason: user.rejection_reason || 'No reason provided',
          status: 'rejected',
          email: user.email,
        },
        { status: 403 }
      );
    }

    if (user.status === 'suspended') {
      return NextResponse.json(
        {
          error: 'account_suspended',
          message: 'Your account has been suspended. Please contact support.',
          status: 'suspended',
        },
        { status: 403 }
      );
    }

    if (user.status !== 'active') {
      return NextResponse.json(
        { error: 'Account access denied' },
        { status: 403 }
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    // Return user data without password
    const userData = {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role,
      status: user.status,
    };

    return NextResponse.json({
      success: true,
      token,
      user: userData,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
