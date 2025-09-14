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

    // Fetch latest 5 donations for the campaign
    const donations = (await db.query(
      `SELECT 
        d.id,
        d.amount,
        d.message,
        d.anonymous,
        d.created_at as date,
        CONCAT(u.first_name, ' ', u.last_name) as donorName
      FROM donations d
      JOIN users u ON d.user_id = u.id
      WHERE d.campaign_id = ? AND d.payment_status = 'completed'
      ORDER BY d.created_at DESC
      LIMIT 5`,
      [campaignId]
    )) as RowDataPacket[];

    return NextResponse.json({
      success: true,
      donations: donations || [],
    });
  } catch (error) {
    console.error('Error fetching donations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch donations' },
      { status: 500 }
    );
  }
}
