import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      short_description,
      goal_amount,
      category_id,
      end_date,
      featured_image,
      video_url,
      userId,
    } = body;

    // Validation
    if (!title || !title.trim()) {
      return NextResponse.json(
        { error: 'Campaign title is required' },
        { status: 400 }
      );
    }

    if (!description || !description.trim()) {
      return NextResponse.json(
        { error: 'Campaign description is required' },
        { status: 400 }
      );
    }

    if (!short_description || !short_description.trim()) {
      return NextResponse.json(
        { error: 'Short description is required' },
        { status: 400 }
      );
    }

    if (!goal_amount || parseFloat(goal_amount) < 100) {
      return NextResponse.json(
        { error: 'Goal amount must be at least 100' },
        { status: 400 }
      );
    }

    if (!category_id) {
      return NextResponse.json(
        { error: 'Category is required' },
        { status: 400 }
      );
    }

    if (!end_date) {
      return NextResponse.json(
        { error: 'End date is required' },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Validate end date is at least 30 days from now
    const endDateTime = new Date(end_date);
    const minEndDate = new Date();
    minEndDate.setDate(minEndDate.getDate() + 30);

    if (endDateTime < minEndDate) {
      return NextResponse.json(
        { error: 'Campaign must run for at least 30 days' },
        { status: 400 }
      );
    }

    // Verify user exists and is a creator
    const users = (await db.query('SELECT id, role FROM users WHERE id = ?', [
      userId,
    ])) as RowDataPacket[];

    if (users.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (users[0].role !== 'creator') {
      return NextResponse.json(
        { error: 'Only creators can create campaigns' },
        { status: 403 }
      );
    }

    // Verify category exists
    const categories = (await db.query(
      'SELECT id FROM categories WHERE id = ?',
      [category_id]
    )) as RowDataPacket[];

    if (categories.length === 0) {
      return NextResponse.json(
        { error: 'Invalid category selected' },
        { status: 400 }
      );
    }

    // Insert campaign
    const result = await db.query(
      `INSERT INTO campaigns (
        user_id,
        category_id,
        title,
        description,
        short_description,
        goal_amount,
        current_amount,
        end_date,
        featured_image,
        video_url,
        status,
        is_featured,
        backers_count,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?, ?, 'pending', 0, 0, NOW(), NOW())`,
      [
        userId,
        category_id,
        title.trim(),
        description.trim(),
        short_description.trim(),
        parseFloat(goal_amount),
        end_date,
        featured_image || null,
        video_url || null,
      ]
    );

    const campaignId = (result as any).insertId;

    return NextResponse.json(
      {
        message: 'Campaign created successfully',
        campaignId: campaignId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating campaign:', error);
    return NextResponse.json(
      { error: 'Failed to create campaign' },
      { status: 500 }
    );
  }
}
