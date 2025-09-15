import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

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

    // Calculate platform fee (5% rounded up to 2 decimal places)
    const platformFeeAmount = Math.ceil(amount * 0.05 * 100) / 100;

    // Begin transaction
    await db.query('START TRANSACTION');

    try {
      // Insert donation
      const donationResult = (await db.query(
        `INSERT INTO donations (
          user_id, campaign_id, amount, message, anonymous, 
          payment_method, payment_status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, 'completed', NOW())`,
        [
          userId,
          campaignId,
          amount,
          message || null,
          anonymous ? 1 : 0,
          paymentMethod,
        ]
      )) as ResultSetHeader;

      const donationId = donationResult.insertId;

      // Insert platform fee
      await db.query(
        `INSERT INTO platform_fees (donation_id, amount) VALUES (?, ?)`,
        [donationId, platformFeeAmount]
      );

      // Update campaign amounts
      await db.query(
        `UPDATE campaigns SET 
          current_amount = current_amount + ?,
          backers_count = (
            SELECT COUNT(DISTINCT user_id) 
            FROM donations 
            WHERE campaign_id = ? AND payment_status = 'completed'
          ),
          updated_at = NOW()
        WHERE id = ?`,
        [amount, campaignId, campaignId]
      );

      // Commit transaction
      await db.query('COMMIT');

      // Calculate total current amount from all donations for this campaign
      const totalAmountResult = (await db.query(
        `SELECT 
          COALESCE(SUM(amount), 0) as total_amount,
          COUNT(*) as total_backers
         FROM donations 
         WHERE campaign_id = ? AND payment_status = 'completed'`,
        [campaignId]
      )) as RowDataPacket[];

      const newCurrentAmount = totalAmountResult[0].total_amount;
      const newBackersCount = totalAmountResult[0].total_backers;

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
          campaign: {
            current_amount: newCurrentAmount,
            backers_count: newBackersCount,
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
