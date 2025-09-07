import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const campaignId = parseInt(id);
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (isNaN(campaignId)) {
      return NextResponse.json(
        { error: 'Invalid campaign ID' },
        { status: 400 }
      );
    }

    // Check if user is a backer (has donated to this campaign)
    let isBacker = false;
    if (userId) {
      const donations = (await db.query(
        'SELECT id FROM donations WHERE user_id = ? AND campaign_id = ? AND payment_status = "completed"',
        [userId, campaignId]
      )) as RowDataPacket[];
      isBacker = donations.length > 0;
    }

    // Fetch campaign updates based on user status
    let whereClause = 'WHERE campaign_id = ?';
    let queryParams: any[] = [campaignId];

    if (!isBacker) {
      whereClause += ' AND is_backers_only = 0';
    }

    const updates = (await db.query(
      `SELECT 
        id,
        title,
        content,
        is_backers_only,
        created_at
      FROM campaign_updates
      ${whereClause}
      ORDER BY created_at DESC`,
      queryParams
    )) as RowDataPacket[];

    // Format updates for frontend
    const formattedUpdates = updates.map((update) => ({
      id: update.id.toString(),
      title: update.title,
      content: update.content,
      isBackersOnly: update.is_backers_only === 1,
      createdAt: update.created_at,
    }));

    return NextResponse.json({
      updates: formattedUpdates,
      isBacker: isBacker,
    });
  } catch (error) {
    console.error('Error fetching campaign updates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaign updates' },
      { status: 500 }
    );
  }
}
