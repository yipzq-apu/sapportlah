import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Get total users count
    const totalUsersResult = await db.query(
      'SELECT COUNT(*) as count FROM users'
    );
    const totalUsers = Array.isArray(totalUsersResult)
      ? (totalUsersResult[0] as any)
      : { count: 0 };

    // Get active users count
    const activeUsersResult = await db.query(
      'SELECT COUNT(*) as count FROM users WHERE status = ?',
      ['active']
    );
    const activeUsers = Array.isArray(activeUsersResult)
      ? (activeUsersResult[0] as any)
      : { count: 0 };

    // Get creators count
    const creatorsResult = await db.query(
      'SELECT COUNT(*) as count FROM users WHERE role = ?',
      ['creator']
    );
    const creators = Array.isArray(creatorsResult)
      ? (creatorsResult[0] as any)
      : { count: 0 };

    // Get pending users count
    const pendingUsersResult = await db.query(
      'SELECT COUNT(*) as count FROM users WHERE status = ?',
      ['pending']
    );
    const pendingUsers = Array.isArray(pendingUsersResult)
      ? (pendingUsersResult[0] as any)
      : { count: 0 };

    // Get donors count
    const donorsResult = await db.query(
      'SELECT COUNT(*) as count FROM users WHERE role = ?',
      ['donor']
    );
    const donors = Array.isArray(donorsResult)
      ? (donorsResult[0] as any)
      : { count: 0 };

    // Get suspended users count
    const suspendedUsersResult = await db.query(
      'SELECT COUNT(*) as count FROM users WHERE status = ?',
      ['suspended']
    );
    const suspendedUsers = Array.isArray(suspendedUsersResult)
      ? (suspendedUsersResult[0] as any)
      : { count: 0 };

    return NextResponse.json({
      totalUsers: totalUsers.count || 0,
      activeUsers: activeUsers.count || 0,
      creators: creators.count || 0,
      pendingUsers: pendingUsers.count || 0,
      donors: donors.count || 0,
      suspendedUsers: suspendedUsers.count || 0,
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
