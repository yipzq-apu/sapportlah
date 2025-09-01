import { NextRequest, NextResponse } from 'next/server';
import { queryService } from '../../../../database';
import { verifyToken } from '../../../../lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Get and verify token
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    let decoded;

    try {
      decoded = verifyToken(token);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userId = decoded.userId;
    console.log('Fetching campaigns for user:', userId);

    // Test database connection
    try {
      await queryService.customQuery('SELECT 1 as test');
    } catch (dbError) {
      console.error('Database connection failed:', dbError);
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    // Fetch user's campaigns
    const query = `
      SELECT 
        c.id,
        c.title,
        c.goal_amount,
        c.current_amount,
        c.end_date,
        c.status,
        c.is_featured,
        c.backers_count,
        c.created_at
      FROM campaigns c
      WHERE c.user_id = ${userId}
      ORDER BY c.created_at DESC
    `;

    const result = await queryService.customQuery(query);
    const campaigns = Array.isArray(result) ? result : [];

    // Format campaigns for frontend
    const formattedCampaigns = campaigns.map((campaign: any) => ({
      id: campaign.id.toString(),
      title: campaign.title,
      goal: parseFloat(campaign.goal_amount),
      raised: parseFloat(campaign.current_amount),
      donorCount: campaign.backers_count,
      status: campaign.status,
      endDate: campaign.end_date,
      createdDate: campaign.created_at,
    }));

    return NextResponse.json(
      {
        campaigns: formattedCampaigns,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Get user campaigns error:', error);

    return NextResponse.json(
      { error: 'Failed to fetch campaigns', details: error.message },
      { status: 500 }
    );
  }
}
