import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function PUT(request: NextRequest) {
  try {
    const { userId, firstName, lastName, email, currentPassword, newPassword } =
      await request.json();

    // Validate required fields
    if (!userId || !firstName || !lastName || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user exists and is admin
    const users = await db.query(
      'SELECT id, email, password, role FROM users WHERE id = ? AND role = ?',
      [userId, 'admin']
    );

    if (!Array.isArray(users) || users.length === 0) {
      return NextResponse.json(
        { error: 'Admin user not found' },
        { status: 404 }
      );
    }

    const user = users[0] as any;

    // If password change is requested, verify current password
    if (currentPassword && newPassword) {
      const isValidPassword = await bcrypt.compare(
        currentPassword,
        user.password
      );
      if (!isValidPassword) {
        return NextResponse.json(
          { error: 'Current password is incorrect' },
          { status: 400 }
        );
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 12);

      // Update user with new password
      await db.query(
        'UPDATE users SET first_name = ?, last_name = ?, email = ?, password = ?, updated_at = NOW() WHERE id = ?',
        [firstName, lastName, email, hashedNewPassword, userId]
      );
    } else {
      // Update user without password change
      await db.query(
        'UPDATE users SET first_name = ?, last_name = ?, email = ?, updated_at = NOW() WHERE id = ?',
        [firstName, lastName, email, userId]
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
    });
  } catch (error) {
    console.error('Error updating admin profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
