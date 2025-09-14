import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; questionId: string }> }
) {
  try {
    const { id, questionId } = await params;
    const campaignId = parseInt(id);
    const body = await request.json();
    const { answer, creatorId } = body;

    if (isNaN(campaignId) || !questionId) {
      return NextResponse.json(
        { error: 'Invalid campaign ID or question ID' },
        { status: 400 }
      );
    }

    if (!answer || !answer.trim()) {
      return NextResponse.json(
        { error: 'Answer is required' },
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
        { error: 'Only the campaign creator can answer questions' },
        { status: 403 }
      );
    }

    // Insert the answer as a child comment
    await db.query(
      `INSERT INTO comments (
        user_id,
        campaign_id,
        parent_id,
        content,
        anonymous,
        created_at
      ) VALUES (?, ?, ?, ?, 0, NOW())`,
      [creatorId, campaignId, questionId, answer.trim()]
    );

    return NextResponse.json({
      message: 'Answer posted successfully',
    });
  } catch (error) {
    console.error('Error posting answer:', error);
    return NextResponse.json(
      { error: 'Failed to post answer' },
      { status: 500 }
    );
  }
}
