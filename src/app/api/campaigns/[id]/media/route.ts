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

    if (isNaN(campaignId)) {
      return NextResponse.json(
        { error: 'Invalid campaign ID' },
        { status: 400 }
      );
    }

    // Fetch campaign images
    const images = (await db.query(
      `SELECT 
        id,
        image_url,
        caption,
        sort_order
      FROM campaign_images 
      WHERE campaign_id = ?
      ORDER BY sort_order ASC
      LIMIT 5`,
      [campaignId]
    )) as RowDataPacket[];

    // Fetch campaign video URL
    const campaignVideo = (await db.query(
      `SELECT video_url FROM campaigns WHERE id = ?`,
      [campaignId]
    )) as RowDataPacket[];

    const videoUrl =
      campaignVideo.length > 0 ? campaignVideo[0].video_url : null;

    return NextResponse.json({
      images: images,
      videoUrl: videoUrl,
    });
  } catch (error) {
    console.error('Error fetching campaign media:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaign media' },
      { status: 500 }
    );
  }
}
