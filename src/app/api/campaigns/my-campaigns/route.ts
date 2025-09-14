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

    // Fetch user's campaigns
    const campaigns = (await db.query(
      `SELECT 
        c.id,
        c.title,
        c.goal_amount,
        c.current_amount,
        c.backers_count,
        c.status,
        c.end_date,
        c.created_at
      FROM campaigns c
      WHERE c.user_id = ?
      ORDER BY c.created_at DESC`,
      [userId]
    )) as RowDataPacket[];

    // Format campaigns for frontend
    const formattedCampaigns = campaigns.map((campaign) => ({
      id: campaign.id.toString(),
      title: campaign.title,
      goal: parseFloat(campaign.goal_amount),
      raised: parseFloat(campaign.current_amount),
      donorCount: campaign.backers_count,
      status: campaign.status,
      endDate: campaign.end_date,
      createdDate: campaign.created_at,
    }));

    return NextResponse.json({
      campaigns: formattedCampaigns,
    });
  } catch (error) {
    console.error('Error fetching user campaigns:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaigns' },
      { status: 500 }
    );
  }
}
