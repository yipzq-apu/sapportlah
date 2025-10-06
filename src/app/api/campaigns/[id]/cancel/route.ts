import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Check if campaign exists and user owns it
    const campaigns = await db.query(
      'SELECT id, user_id, status FROM campaigns WHERE id = ?',
      [id]
    );

    if (!Array.isArray(campaigns) || campaigns.length === 0) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    const campaign = campaigns[0] as any;

    if (campaign.user_id !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized to cancel this campaign' },
        { status: 403 }
      );
    }

    // Check if campaign can be cancelled
    const allowedStatuses = ['pending', 'approved', 'rejected', 'active'];
    if (!allowedStatuses.includes(campaign.status)) {
      return NextResponse.json(
        { error: `Cannot cancel campaign with status: ${campaign.status}` },
        { status: 400 }
      );
    }

    // Update campaign status to cancelled
    await db.query(
      'UPDATE campaigns SET status = ?, updated_at = NOW() WHERE id = ?',
      ['cancelled', id]
    );

    return NextResponse.json({
      success: true,
      message: 'Campaign cancelled successfully',
    });
  } catch (error) {
    console.error('Error cancelling campaign:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
