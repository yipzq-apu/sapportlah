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

    // Fetch user's favorite campaigns with full campaign details
    const favoriteCampaigns = (await db.query(
      `SELECT 
        c.id,
        c.title,
        c.description,
        c.short_description,
        c.goal_amount,
        c.current_amount,
        c.end_date,
        c.featured_image,
        c.status,
        c.backers_count,
        CONCAT(u.first_name, ' ', u.last_name) as creator_name,
        uf.created_at as favorited_at
      FROM user_favorites uf
      JOIN campaigns c ON uf.campaign_id = c.id
      JOIN users u ON c.user_id = u.id
      WHERE uf.user_id = ?
      ORDER BY uf.created_at DESC`,
      [userId]
    )) as RowDataPacket[];

    // Format campaigns for frontend
    const formattedCampaigns = favoriteCampaigns.map((campaign) => {
      const progress = Math.min(
        (campaign.current_amount / campaign.goal_amount) * 100,
        100
      );

      return {
        id: campaign.id.toString(),
        title: campaign.title,
        shortDescription: campaign.short_description || campaign.description,
        goal: campaign.goal_amount,
        raised: campaign.current_amount,
        progress: progress,
        endDate: campaign.end_date,
        image: campaign.featured_image || '/api/placeholder/300/200',
        status: campaign.status,
        backersCount: campaign.backers_count,
        creatorName: campaign.creator_name,
        favoritedAt: campaign.favorited_at,
      };
    });

    return NextResponse.json({
      favorites: formattedCampaigns,
    });
  } catch (error) {
    console.error('Error fetching favorite campaigns:', error);
    return NextResponse.json(
      { error: 'Failed to fetch favorite campaigns' },
      { status: 500 }
    );
  }
}
