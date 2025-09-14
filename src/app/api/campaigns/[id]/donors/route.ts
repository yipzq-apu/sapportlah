import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: campaignId } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    // Verify that the requesting user is the creator of this campaign
    const campaignCheck = await db.query(
      'SELECT user_id FROM campaigns WHERE id = ?',
      [campaignId]
    );

    if (!Array.isArray(campaignCheck) || campaignCheck.length === 0) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    const campaign = campaignCheck[0] as any;
    if (campaign.user_id !== parseInt(userId || '0')) {
      return NextResponse.json(
        {
          error:
            'Unauthorized - You can only view donors for your own campaigns',
        },
        { status: 403 }
      );
    }

    // Fetch donors with their donation details
    const donors = await db.query(
      `SELECT 
        d.id as donation_id,
        d.amount,
        d.message,
        d.anonymous,
        d.created_at as donation_date,
        CASE 
          WHEN d.anonymous = 1 THEN 'Anonymous Donor'
          ELSE CONCAT(u.first_name, ' ', u.last_name)
        END as donor_name,
        CASE 
          WHEN d.anonymous = 1 THEN 'anonymous@hidden.com'
          ELSE u.email
        END as donor_email,
        u.id as donor_id
      FROM donations d
      LEFT JOIN users u ON d.user_id = u.id
      WHERE d.campaign_id = ?
      ORDER BY d.created_at DESC`,
      [campaignId]
    );

    // Calculate summary statistics
    const totalDonations = (donors as any[]).length;
    const totalAmount = (donors as any[]).reduce(
      (sum, donor) => sum + parseFloat(donor.amount),
      0
    );
    const anonymousDonors = (donors as any[]).filter(
      (donor) => donor.anonymous
    ).length;
    const uniqueDonors = new Set(
      (donors as any[])
        .filter((donor) => !donor.anonymous)
        .map((donor) => donor.donor_id)
    ).size;

    return NextResponse.json({
      success: true,
      donors: donors,
      summary: {
        totalDonations,
        totalAmount,
        anonymousDonors,
        uniqueDonors: uniqueDonors + anonymousDonors, // Include anonymous as unique
      },
    });
  } catch (error) {
    console.error('Error fetching campaign donors:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
