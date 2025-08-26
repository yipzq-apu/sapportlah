import { NextRequest, NextResponse } from 'next/server';
import { queryService } from '../../../../../database';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const campaignId = parseInt(id);

    if (isNaN(campaignId)) {
      return NextResponse.json(
        { error: 'Invalid campaign ID' },
        { status: 400 }
      );
    }

    // Fetch donations from database
    const query = `
      SELECT 
        d.id,
        d.amount,
        d.message,
        d.anonymous,
        d.created_at as date,
        CONCAT(u.first_name, ' ', u.last_name) as donor_name
      FROM donations d
      LEFT JOIN users u ON d.user_id = u.id
      WHERE d.campaign_id = ${campaignId} AND d.payment_status = 'completed'
      ORDER BY d.created_at DESC
      LIMIT 20
    `;

    const donations = await queryService.customQuery(query);

    // Format donations for frontend
    const formattedDonations = (donations as any[]).map((donation: any) => ({
      id: donation.id.toString(),
      donorName: donation.anonymous ? 'Anonymous' : donation.donor_name,
      amount: parseFloat(donation.amount),
      message: donation.message || '',
      date: donation.date,
      anonymous: donation.anonymous === 1,
    }));

    return NextResponse.json(
      { donations: formattedDonations },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Get donations error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch donations', details: error.message },
      { status: 500 }
    );
  }
}
