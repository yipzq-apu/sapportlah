import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status') || 'all';

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Build the WHERE clause based on status filter
    let statusCondition = '';
    if (status !== 'all') {
      statusCondition = 'AND c.status = ?';
    }

    // Fetch user's donations with campaign details
    const donationsQuery = `
      SELECT 
        d.id,
        d.campaign_id,
        d.amount,
        d.message,
        d.anonymous,
        d.created_at as donation_date,
        c.title as campaign_title,
        c.featured_image as campaign_image,
        c.status as campaign_status,
        c.goal_amount,
        c.current_amount
      FROM donations d
      JOIN campaigns c ON d.campaign_id = c.id
      WHERE d.user_id = ? AND d.payment_status = 'completed'
      ${statusCondition}
      ORDER BY d.created_at DESC
    `;

    const queryParams = status !== 'all' ? [userId, status] : [userId];
    const donations = (await db.query(
      donationsQuery,
      queryParams
    )) as RowDataPacket[];

    // Calculate statistics
    const totalDonated = donations.reduce(
      (sum, d) => sum + parseFloat(d.amount),
      0
    );
    const campaignsSupported = new Set(donations.map((d) => d.campaign_id))
      .size;
    const averageDonation =
      donations.length > 0 ? totalDonated / donations.length : 0;

    // Format donations for frontend
    const formattedDonations = donations.map((donation) => {
      const progress = Math.min(
        (donation.current_amount / donation.goal_amount) * 100,
        100
      );

      return {
        id: donation.id.toString(),
        campaignId: donation.campaign_id.toString(),
        campaignTitle: donation.campaign_title,
        campaignImage: donation.campaign_image || '/api/placeholder/300/200',
        amount: parseFloat(donation.amount),
        date: donation.donation_date,
        message: donation.message || '',
        anonymous: donation.anonymous === 1,
        campaignStatus: donation.campaign_status,
        campaignProgress: progress,
        campaignGoal: parseFloat(donation.goal_amount),
        campaignRaised: parseFloat(donation.current_amount),
      };
    });

    const stats = {
      totalDonated,
      campaignsSupported,
      averageDonation,
      totalDonations: donations.length,
    };

    return NextResponse.json({
      donations: formattedDonations,
      stats: stats,
    });
  } catch (error) {
    console.error('Error fetching user donations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch donations' },
      { status: 500 }
    );
  }
}
