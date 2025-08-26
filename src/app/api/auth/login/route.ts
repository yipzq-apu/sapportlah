import { NextRequest, NextResponse } from 'next/server';
import { queryService } from '../../../../database';
import { verifyPassword, generateToken } from '../../../../lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Login attempt for email:', body.email);

    // Validate required fields
    if (!body.email || !body.password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user by email
    const users = await queryService.findWhere('users', { email: body.email });

    if (!users || !Array.isArray(users) || users.length === 0) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const user = users[0] as any;

    // Verify password
    const isValidPassword = await verifyPassword(body.password, user.password);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = generateToken(user.id, user.email, user.role);

    // Remove password from response
    const { password, ...userWithoutPassword } = user;

    // Determine redirect URL based on role
    let redirectUrl = '/';
    if (user.role === 'admin') {
      redirectUrl = '/admin';
    } else if (user.role === 'creator') {
      redirectUrl = '/dashboard';
    } else if (user.role === 'donor') {
      redirectUrl = '/';
    }

    // Return success response
    return NextResponse.json(
      {
        message: 'Login successful',
        user: userWithoutPassword,
        token,
        redirectUrl,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Login error:', error);

    return NextResponse.json(
      { error: 'Login failed', details: error.message },
      { status: 500 }
    );
  }
}
