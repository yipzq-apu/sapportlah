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
    const { title, content, isBackersOnly, creatorId } = body;

    if (isNaN(campaignId)) {
      return NextResponse.json(
        { error: 'Invalid campaign ID' },
        { status: 400 }
      );
    }

    if (!title || !title.trim()) {
      return NextResponse.json(
        { error: 'Update title is required' },
        { status: 400 }
      );
    }

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: 'Update content is required' },
        { status: 400 }
      );
    }

    if (!creatorId) {
      return NextResponse.json(
        { error: 'Creator ID is required' },
        { status: 400 }
      );
    }

    // Verify that the user is the creator of the campaign
    const campaigns = (await db.query(
      'SELECT user_id FROM campaigns WHERE id = ?',
      [campaignId]
    )) as RowDataPacket[];

    if (campaigns.length === 0) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    if (campaigns[0].user_id != creatorId) {
      return NextResponse.json(
        { error: 'Only the campaign creator can post updates' },
        { status: 403 }
      );
    }

    // Insert the update
    await db.query(
      `INSERT INTO campaign_updates (
        campaign_id,
        title,
        content,
        is_backers_only,
        created_at
      ) VALUES (?, ?, ?, ?, NOW())`,
      [campaignId, title.trim(), content.trim(), isBackersOnly ? 1 : 0]
    );

    return NextResponse.json({
      message: 'Update posted successfully',
    });
  } catch (error) {
    console.error('Error posting update:', error);
    return NextResponse.json(
      { error: 'Failed to post update' },
      { status: 500 }
    );
  }
}
