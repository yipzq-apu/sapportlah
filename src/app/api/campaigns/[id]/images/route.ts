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
    const body = await request.json();
    const { image_url, caption, sort_order } = body;

    if (isNaN(campaignId)) {
      return NextResponse.json(
        { error: 'Invalid campaign ID' },
        { status: 400 }
      );
    }

    if (!image_url) {
      return NextResponse.json(
        { error: 'Image URL is required' },
        { status: 400 }
      );
    }

    // Verify campaign exists
    const campaigns = (await db.query('SELECT id FROM campaigns WHERE id = ?', [
      campaignId,
    ])) as RowDataPacket[];

    if (campaigns.length === 0) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    // Check current image count
    const imageCount = (await db.query(
      'SELECT COUNT(*) as count FROM campaign_images WHERE campaign_id = ?',
      [campaignId]
    )) as RowDataPacket[];

    if (imageCount[0].count >= 5) {
      return NextResponse.json(
        { error: 'Maximum 5 images allowed per campaign' },
        { status: 400 }
      );
    }

    // Insert campaign image
    await db.query(
      `INSERT INTO campaign_images (
        campaign_id,
        image_url,
        caption,
        sort_order,
        created_at
      ) VALUES (?, ?, ?, ?, NOW())`,
      [campaignId, image_url, caption || null, sort_order || 1]
    );

    return NextResponse.json({
      message: 'Campaign image added successfully',
    });
  } catch (error) {
    console.error('Error adding campaign image:', error);
    return NextResponse.json(
      { error: 'Failed to add campaign image' },
      { status: 500 }
    );
  }
}
