import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export async function POST(
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

    const body = await request.json();
    const {
      userId,
      amount,
      message,
      anonymous,
      paymentMethod = 'online',
    } = body;

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

    // Insert donation record
    const donationResult = (await db.query(
      `INSERT INTO donations (
        user_id,
        campaign_id,
        amount,
        message,
        anonymous,
        payment_status,
        payment_method,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, 'completed', ?, NOW(), NOW())`,
      [
        userId,
        campaignId,
        donationAmount,
        message || null,
        anonymous ? 1 : 0,
        paymentMethod,
      ]
    )) as any;

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

    // Update campaign with calculated totals
    await db.query(
      `UPDATE campaigns 
       SET current_amount = ?, 
           backers_count = ?,
           updated_at = NOW()
       WHERE id = ?`,
      [newCurrentAmount, newBackersCount, campaignId]
    );

    return NextResponse.json(
      {
        message: 'Donation successful',
        donation: {
          id: donationResult.insertId,
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
    console.error('Error processing donation:', error);
    return NextResponse.json(
      { error: 'Failed to process donation' },
      { status: 500 }
    );
  }
}
