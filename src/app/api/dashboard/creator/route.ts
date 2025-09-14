import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const creatorId = searchParams.get('creatorId');

    if (!creatorId) {
      return NextResponse.json(
        { error: 'Creator ID is required' },
        { status: 400 }
      );
    }

    // Fetch creator's campaigns
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
      [creatorId]
    )) as RowDataPacket[];

    // Calculate dashboard statistics
    const totalCampaigns = campaigns.length;
    const activeCampaigns = campaigns.filter(
      (c) => c.status === 'active'
    ).length;
    const totalRaised = campaigns.reduce(
      (sum, c) => sum + parseFloat(c.current_amount),
      0
    );
    const totalDonors = campaigns.reduce((sum, c) => sum + c.backers_count, 0);

    // Get pending questions count
    const pendingQuestionsResult = (await db.query(
      `SELECT COUNT(*) as count 
       FROM comments 
       WHERE campaign_id IN (
         SELECT id FROM campaigns WHERE user_id = ?
       ) AND parent_id IS NULL 
       AND id NOT IN (
         SELECT DISTINCT parent_id FROM comments WHERE parent_id IS NOT NULL
       )`,
      [creatorId]
    )) as RowDataPacket[];

    const pendingQuestions = pendingQuestionsResult[0].count;

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

    const stats = {
      totalCampaigns,
      activeCampaigns,
      totalRaised,
      totalDonors,
      pendingQuestions,
    };

    return NextResponse.json({
      campaigns: formattedCampaigns,
      stats: stats,
    });
  } catch (error) {
    console.error('Error fetching creator dashboard data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
