import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const {
      userId,
      title,
      description,
      short_description,
      goal_amount,
      category_id,
      start_date,
      end_date,
      featured_image,
    } = await request.json();

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
        { error: 'Unauthorized to edit this campaign' },
        { status: 403 }
      );
    }

    // Check if campaign can be edited (pending or rejected campaigns)
    if (campaign.status !== 'pending' && campaign.status !== 'rejected') {
      return NextResponse.json(
        {
          error:
            'Campaign can only be edited while in pending or rejected status',
        },
        { status: 400 }
      );
    }

    // Validate date ranges
    const today = new Date();
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);

    // Validate start date (3-10 days from today)
    const minStartDate = new Date();
    minStartDate.setDate(today.getDate() + 3);
    const maxStartDate = new Date();
    maxStartDate.setDate(today.getDate() + 10);

    if (startDate < minStartDate || startDate > maxStartDate) {
      return NextResponse.json(
        { error: 'Start date must be between 3-10 days from today' },
        { status: 400 }
      );
    }

    // Validate end date (7-60 days from start date)
    const minEndDate = new Date(startDate);
    minEndDate.setDate(startDate.getDate() + 7);
    const maxEndDate = new Date(startDate);
    maxEndDate.setDate(startDate.getDate() + 60);

    if (endDate < minEndDate || endDate > maxEndDate) {
      return NextResponse.json(
        { error: 'End date must be between 7-60 days after start date' },
        { status: 400 }
      );
    }

    // Update campaign - if it was rejected, change status back to pending
    const newStatus =
      campaign.status === 'rejected' ? 'pending' : campaign.status;

    await db.query(
      `UPDATE campaigns SET 
        title = ?, 
        description = ?, 
        short_description = ?, 
        goal_amount = ?, 
        category_id = ?, 
        start_date = ?, 
        end_date = ?, 
        featured_image = ?,
        status = ?,
        reason = NULL,
        updated_at = NOW()
      WHERE id = ?`,
      [
        title,
        description,
        short_description,
        parseFloat(goal_amount),
        category_id,
        start_date,
        end_date,
        featured_image,
        newStatus,
        id,
      ]
    );

    const message =
      campaign.status === 'rejected'
        ? 'Campaign resubmitted successfully for review'
        : 'Campaign updated successfully';

    return NextResponse.json({
      success: true,
      message,
    });
  } catch (error) {
    console.error('Error updating campaign:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
