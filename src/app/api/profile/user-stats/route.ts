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

    // Get total donations and campaigns supported for the user
    const donationStats = (await db.query(
      `SELECT 
        COALESCE(SUM(d.amount), 0) as totalDonated,
        COUNT(DISTINCT d.campaign_id) as campaignsSupported,
        COUNT(*) as totalDonations
      FROM donations d
      WHERE d.user_id = ? AND d.payment_status = 'completed'`,
      [userId]
    )) as RowDataPacket[];

    const stats = {
      totalDonated: donationStats[0]?.totalDonated || 0,
      campaignsSupported: donationStats[0]?.campaignsSupported || 0,
      totalDonations: donationStats[0]?.totalDonations || 0,
    };

    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user statistics' },
      { status: 500 }
    );
  }
}
