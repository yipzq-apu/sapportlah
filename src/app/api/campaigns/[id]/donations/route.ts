import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { RowDataPacket } from 'mysql2';

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

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    // Fetch recent donations for the campaign
    const donations = (await db.query(
      `SELECT 
        d.id,
        d.amount,
        d.message,
        d.anonymous,
        d.created_at,
        CASE 
          WHEN d.anonymous = 1 THEN 'Anonymous'
          ELSE CONCAT(u.first_name, ' ', u.last_name)
        END as donor_name
      FROM donations d
      LEFT JOIN users u ON d.user_id = u.id
      WHERE d.campaign_id = ? AND d.payment_status = 'completed'
      ORDER BY d.created_at DESC
      LIMIT ?`,
      [campaignId, limit]
    )) as RowDataPacket[];

    // Format donations for frontend
    const formattedDonations = donations.map((donation) => ({
      id: donation.id.toString(),
      donorName: donation.donor_name,
      amount: donation.amount,
      message: donation.message || '',
      date: donation.created_at,
      anonymous: donation.anonymous === 1,
    }));

    return NextResponse.json({
      donations: formattedDonations,
    });
  } catch (error) {
    console.error('Error fetching donations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch donations' },
      { status: 500 }
    );
  }
}
