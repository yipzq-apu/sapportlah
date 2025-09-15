import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function PUT(request: NextRequest) {
  try {
    const {
      userId,
      firstName,
      lastName,
      email,
      organizationName,
      phone,
      address,
      profileImage,
      notifications,
      currentPassword,
      newPassword,
    } = await request.json();

    console.log('Profile update request received:', {
      userId,
      firstName,
      lastName,
      email,
      organizationName,
      phone,
      address,
      profileImage, // Debug log to see what image URL is being sent
      notifications,
    });

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const users = await db.query(
      'SELECT id, password FROM users WHERE id = ?',
      [userId]
    );

    if (!Array.isArray(users) || users.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // If changing password, verify current password
    if (currentPassword && newPassword) {
      const user = users[0] as any;
      const passwordMatch = await bcrypt.compare(
        currentPassword,
        user.password
      );

      if (!passwordMatch) {
        return NextResponse.json(
          { error: 'Current password is incorrect' },
          { status: 400 }
        );
      }
    }

    // Build update query with correct column name
    let updateQuery = `
      UPDATE users SET 
        first_name = ?, 
        last_name = ?, 
        email = ?, 
        organization_name = ?, 
        phone = ?, 
        address = ?, 
        profile_image = ?, 
        notifications = ?, 
        updated_at = NOW()
    `;

    let queryParams = [
      firstName,
      lastName,
      email,
      organizationName || null,
      phone || null,
      address || null,
      profileImage || null,
      notifications,
    ];

    console.log('Updating profile_image to:', profileImage); // Debug log

    // Add password update if provided
    if (currentPassword && newPassword) {
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      updateQuery += ', password = ?';
      queryParams.push(hashedPassword);
    }

    updateQuery += ' WHERE id = ?';
    queryParams.push(userId);

    console.log('Executing query:', updateQuery);
    console.log('With params:', queryParams);

    await db.query(updateQuery, queryParams);

    // Verify the update worked
    const verifyResult = await db.query(
      'SELECT profile_image FROM users WHERE id = ?',
      [userId]
    );

    console.log(
      'Updated profile_image in database:',
      (verifyResult as any[])[0]?.profile_image
    );

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
