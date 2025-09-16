import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: campaignId } = await params;
    const { userId, amount, message, anonymous, paymentMethod } =
      await request.json();

    // Validate required fields
    if (!userId || !amount) {
      return NextResponse.json(
        { error: 'User ID and amount are required' },
        { status: 400 }
      );
    }

    // Validate amount
    const donationAmount = parseFloat(amount);
    if (isNaN(donationAmount) || donationAmount <= 0) {
      return NextResponse.json(
        { error: 'Invalid donation amount' },
        { status: 400 }
      );
    }

    // Check if campaign exists and is active
    const campaigns = (await db.query(
      'SELECT id, status, goal_amount, current_amount FROM campaigns WHERE id = ?',
      [campaignId]
    )) as RowDataPacket[];

    if (campaigns.length === 0) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    const campaign = campaigns[0];
    if (campaign.status !== 'active') {
      return NextResponse.json(
        { error: 'Campaign is not accepting donations' },
        { status: 400 }
      );
    }

    // Calculate platform fee (5% + RM1 rounded up to 2 decimal places)
    const platformFeeAmount = Math.ceil((amount * 0.05 + 1) * 100) / 100;

    // Begin transaction
    await db.query('START TRANSACTION');

    try {
      // Insert donation
      const donationResult = await db.query(
        `INSERT INTO donations (
          user_id, campaign_id, amount, message, anonymous, 
          payment_method, payment_status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, 'pending', NOW())`,
        [
          userId,
          campaignId,
          amount,
          message || null,
          anonymous ? 1 : 0,
          paymentMethod,
        ]
      );

      const donationId = (donationResult as any).insertId;

      // Insert platform fee
      await db.query(
        `INSERT INTO platform_fees (donation_id, amount) VALUES (?, ?)`,
        [donationId, platformFeeAmount]
      );

      // Commit transaction
      await db.query('COMMIT');

      return NextResponse.json(
        {
          message: 'Donation successful',
          donation: {
            id: donationId,
            amount: donationAmount,
            campaign_id: campaignId,
            user_id: userId,
            anonymous: anonymous,
          },
        },
        { status: 201 }
      );
    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error processing donation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
