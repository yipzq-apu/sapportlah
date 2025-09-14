import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
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

    // Validate required fields
    if (
      !userId ||
      !title ||
      !description ||
      !goal_amount ||
      !category_id ||
      !start_date ||
      !end_date
    ) {
      return NextResponse.json(
        { error: 'Missing required fields' },
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

    // Insert campaign into database
    const result = await db.query(
      `INSERT INTO campaigns (
        user_id, category_id, title, description, short_description,
        goal_amount, current_amount, start_date, end_date, featured_image,
        status, is_featured, backers_count, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?, ?, 'pending', false, 0, NOW(), NOW())`,
      [
        userId,
        category_id,
        title,
        description,
        short_description,
        parseFloat(goal_amount),
        start_date,
        end_date,
        featured_image,
      ]
    );

    const campaignId = (result as any).insertId;

    return NextResponse.json({
      success: true,
      message: 'Campaign created successfully and is pending review',
      campaignId,
    });
  } catch (error) {
    console.error('Error creating campaign:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
