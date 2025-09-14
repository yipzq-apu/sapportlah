import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export async function GET(request: NextRequest) {
  try {
    // Fetch all campaigns with their featured status
    const campaigns = (await db.query(
      `SELECT 
        c.id,
        c.title,
        c.description,
        c.short_description,
        c.goal_amount,
        c.current_amount,
        c.featured_image,
        c.status,
        c.is_featured,
        c.created_at,
        CONCAT(u.first_name, ' ', u.last_name) as creator_name,
        cat.name as category_name
      FROM campaigns c
      JOIN users u ON c.user_id = u.id
      LEFT JOIN categories cat ON c.category_id = cat.id
      ORDER BY c.is_featured DESC, c.created_at DESC`
    )) as RowDataPacket[];

    return NextResponse.json({
      campaigns: campaigns,
    });
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaigns' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { campaignId, isFeatured } = body;

    if (!campaignId || typeof isFeatured !== 'boolean') {
      return NextResponse.json(
        { error: 'Campaign ID and featured status are required' },
        { status: 400 }
      );
    }

    // If trying to feature a campaign, check the current count
    if (isFeatured) {
      const featuredCount = (await db.query(
        'SELECT COUNT(*) as count FROM campaigns WHERE is_featured = 1'
      )) as RowDataPacket[];

      if (featuredCount[0].count >= 3) {
        return NextResponse.json(
          {
            error:
              'Maximum of 3 campaigns can be featured at a time. Please remove a featured campaign first.',
          },
          { status: 400 }
        );
      }
    }

    // Update campaign featured status
    await db.query(
      'UPDATE campaigns SET is_featured = ?, updated_at = NOW() WHERE id = ?',
      [isFeatured ? 1 : 0, campaignId]
    );

    return NextResponse.json({
      message: `Campaign ${
        isFeatured ? 'added to' : 'removed from'
      } featured list`,
    });
  } catch (error) {
    console.error('Error updating featured status:', error);
    return NextResponse.json(
      { error: 'Failed to update featured status' },
      { status: 500 }
    );
  }
}
