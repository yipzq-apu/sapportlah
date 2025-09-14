import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter is required' },
        { status: 400 }
      );
    }

    // Fetch user data from database using correct column names
    const users = await db.query(
      `SELECT 
        id,
        first_name,
        last_name,
        email,
        phone,
        date_of_birth,
        ic_passport_type,
        ic_passport_number,
        address,
        role,
        organization_name,
        supporting_document,
        status,
        created_at
      FROM users 
      WHERE email = ?`,
      [email]
    );

    if (!Array.isArray(users) || users.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = users[0] as any;

    // The date_of_birth is already in YYYY-MM-DD format from database
    // No conversion needed, just use it directly
    if (user.date_of_birth) {
      // Ensure it's a string and just take the date part
      user.date_of_birth = String(user.date_of_birth).split('T')[0];
    }

    return NextResponse.json({
      success: true,
      user: user,
    });
  } catch (error) {
    console.error('User data fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
