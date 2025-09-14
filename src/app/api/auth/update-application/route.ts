import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const {
      email,
      firstName,
      lastName,
      phone,
      dateOfBirth,
      idType,
      idNumber,
      address,
      password,
      role,
    } = await request.json();

    if (!email || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user exists and is rejected
    const users = await db.query(
      'SELECT id, status FROM users WHERE email = ?',
      [email]
    );

    if (!Array.isArray(users) || users.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = users[0] as any;
    if (user.status !== 'rejected') {
      return NextResponse.json(
        { error: 'User is not eligible for application update' },
        { status: 400 }
      );
    }

    // Prepare update query
    let updateQuery = `
      UPDATE users SET 
        first_name = ?, last_name = ?, phone = ?, date_of_birth = ?,
        ic_passport_number = ?, ic_passport_type = ?, address = ?, role = ?,
        status = 'pending', rejection_reason = NULL, updated_at = NOW()
    `;

    let updateParams = [
      firstName,
      lastName,
      phone,
      dateOfBirth,
      idNumber,
      idType,
      address,
      role,
    ];

    // Add password update if provided
    if (password && password.trim()) {
      const hashedPassword = await bcrypt.hash(password, 12);
      updateQuery += ', password = ?';
      updateParams.push(hashedPassword);
    }

    updateQuery += ' WHERE email = ?';
    updateParams.push(email);

    // Update user data
    await db.query(updateQuery, updateParams);

    return NextResponse.json({
      success: true,
      message:
        'Application updated successfully. Your account is now pending review again.',
    });
  } catch (error) {
    console.error('Update application error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
