import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const userId = searchParams.get('userId');

    if (!email && !userId) {
      return NextResponse.json(
        { error: 'Email or User ID is required' },
        { status: 400 }
      );
    }

    // Build query based on available parameter
    let query = `SELECT 
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
      profile_image,
      notifications,
      status,
      created_at
    FROM users 
    WHERE `;

    let queryParam;
    if (userId) {
      query += 'id = ?';
      queryParam = userId;
    } else {
      query += 'email = ?';
      queryParam = email;
    }

    // Fetch user data from database
    const users = (await db.query(query, [queryParam])) as RowDataPacket[];

    if (!users || users.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = users[0];

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone: user.phone,
        date_of_birth: user.date_of_birth,
        ic_passport_type: user.ic_passport_type,
        ic_passport_number: user.ic_passport_number,
        address: user.address,
        role: user.role,
        organization_name: user.organization_name,
        supporting_document: user.supporting_document,
        profile_image: user.profile_image,
        notifications: user.notifications,
        status: user.status,
        created_at: user.created_at,
      },
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
