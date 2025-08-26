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
    console.log('Fetching donations for user:', userId);

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

    // Fetch user's donations with campaign information
    const query = `
      SELECT 
        d.id,
        d.amount,
        d.message,
        d.anonymous,
        d.payment_status,
        d.created_at as date,
        c.id as campaign_id,
        c.title as campaign_title,
        c.featured_image as campaign_image,
        c.status as campaign_status,
        c.goal_amount as campaign_goal,
        c.current_amount as campaign_raised
      FROM donations d
      JOIN campaigns c ON d.campaign_id = c.id
      WHERE d.user_id = ${userId} AND d.payment_status = 'completed'
      ORDER BY d.created_at DESC
    `;

    const donationsResult = await queryService.customQuery(query);
    const donations = Array.isArray(donationsResult)
      ? donationsResult
      : (donationsResult as any).rows || [];

    // Format donations for frontend
    const formattedDonations = donations.map((donation: any) => {
      const campaignProgress =
        donation.campaign_goal > 0
          ? Math.min(
              (donation.campaign_raised / donation.campaign_goal) * 100,
              100
            )
          : 0;

      return {
        id: donation.id.toString(),
        campaignId: donation.campaign_id.toString(),
        campaignTitle: donation.campaign_title,
        campaignImage: donation.campaign_image || '/api/placeholder/300/200',
        amount: parseFloat(donation.amount),
        date: donation.date,
        message: donation.message || '',
        anonymous: donation.anonymous === 1,
        campaignStatus: donation.campaign_status,
        campaignProgress: Math.round(campaignProgress),
        campaignGoal: parseFloat(donation.campaign_goal),
        campaignRaised: parseFloat(donation.campaign_raised),
      };
    });

    // Calculate stats
    const totalDonated = formattedDonations.reduce(
      (sum: number, d: any) => sum + d.amount,
      0
    );
    const campaignsSupported = new Set(
      formattedDonations.map((d: any) => d.campaignId)
    ).size;
    const averageDonation =
      formattedDonations.length > 0
        ? totalDonated / formattedDonations.length
        : 0;

    return NextResponse.json(
      {
        donations: formattedDonations,
        stats: {
          totalDonated,
          campaignsSupported,
          averageDonation,
          totalDonations: formattedDonations.length,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Get user donations error:', error);

    return NextResponse.json(
      { error: 'Failed to fetch donations', details: error.message },
      { status: 500 }
    );
  }
}
