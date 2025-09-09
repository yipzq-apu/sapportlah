import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Fetch user data (excluding password)
    const users = await db.query(
      `SELECT 
        id, email, first_name, last_name, phone, date_of_birth,
        ic_passport_number, ic_passport_type, address, role, status
       FROM users WHERE email = ? AND status = 'rejected'`,
      [email]
    );

    if (!Array.isArray(users) || users.length === 0) {
      return NextResponse.json(
        { error: 'User not found or not eligible for update' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: users[0],
    });
  } catch (error) {
    console.error('Error fetching user data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
