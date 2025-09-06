import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Fetch user profile data
    const users = (await db.query(
      `SELECT 
        u.id,
        u.email,
        u.first_name,
        u.last_name,
        u.profile_image,
        u.phone,
        u.date_of_birth,
        u.address,
        u.role,
        u.created_at
      FROM users u
      WHERE u.id = ?`,
      [userId]
    )) as RowDataPacket[];

    if (users.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = users[0];

    // Calculate donation stats
    const donationStats = (await db.query(
      `SELECT 
        COALESCE(SUM(amount), 0) as total_donated,
        COUNT(DISTINCT campaign_id) as campaigns_supported
      FROM donations 
      WHERE user_id = ? AND payment_status = 'completed'`,
      [userId]
    )) as RowDataPacket[];

    const stats = donationStats[0];

    // Format profile data
    const profileData = {
      id: user.id.toString(),
      name: `${user.first_name} ${user.last_name}`,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      role: user.role,
      avatar:
        user.profile_image ||
        `https://ui-avatars.com/api/?name=${user.first_name}&background=3b82f6&color=fff&size=150`,
      location: user.address || '',
      bio: '', // You can add a bio field to users table if needed
      phone: user.phone || '',
      joinDate: user.created_at,
      totalDonations: parseFloat(stats.total_donated) || 0,
      campaignsSupported: stats.campaigns_supported || 0,
      settings: {
        emailNotifications: true, // You can add these fields to users table
        publicProfile: true,
        anonymousDonations: false,
      },
    };

    return NextResponse.json({
      profile: profileData,
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, firstName, lastName, email, phone, location } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Update user profile
    await db.query(
      `UPDATE users 
       SET first_name = ?, 
           last_name = ?, 
           email = ?, 
           phone = ?, 
           address = ?,
           updated_at = NOW()
       WHERE id = ?`,
      [firstName, lastName, email, phone, location, userId]
    );

    return NextResponse.json({
      message: 'Profile updated successfully',
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
