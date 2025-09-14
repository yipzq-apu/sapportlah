import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Build query conditions
    let whereConditions = ['d.user_id = ? AND d.payment_status = ?'];
    let queryParams: any[] = [userId, 'completed'];

    if (status && status !== 'all') {
      whereConditions.push('c.status = ?');
      queryParams.push(status);
    }

    const whereClause = whereConditions.join(' AND ');

    // Fetch user's donations with campaign details
    const donations = (await db.query(
      `SELECT 
        d.id,
        d.amount,
        d.message,
        d.anonymous,
        d.created_at as date,
        c.id as campaign_id,
        c.title as campaign_title,
        c.featured_image as campaign_image,
        c.status as campaign_status,
        c.goal_amount as campaign_goal,
        c.current_amount as campaign_raised
      FROM donations d
      JOIN campaigns c ON d.campaign_id = c.id
      WHERE ${whereClause}
      ORDER BY d.created_at DESC`,
      queryParams
    )) as RowDataPacket[];

    // Calculate campaign progress and format data
    const formattedDonations = donations.map((donation) => ({
      id: donation.id.toString(),
      campaignId: donation.campaign_id.toString(),
      campaignTitle: donation.campaign_title,
      campaignImage: donation.campaign_image || '/api/placeholder/300/200',
      amount: donation.amount,
      date: donation.date,
      message: donation.message || '',
      anonymous: donation.anonymous === 1,
      campaignStatus: donation.campaign_status,
      campaignProgress: Math.min(
        (donation.campaign_raised / donation.campaign_goal) * 100,
        100
      ),
      campaignGoal: donation.campaign_goal,
      campaignRaised: donation.campaign_raised,
    }));

    // Calculate statistics
    const totalDonated = donations.reduce(
      (sum, d) => sum + parseFloat(d.amount),
      0
    );
    const uniqueCampaigns = new Set(donations.map((d) => d.campaign_id)).size;
    const averageDonation =
      donations.length > 0 ? totalDonated / donations.length : 0;

    const stats = {
      totalDonated: totalDonated || 0,
      campaignsSupported: uniqueCampaigns || 0,
      averageDonation: averageDonation || 0,
      totalDonations: donations.length || 0,
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
