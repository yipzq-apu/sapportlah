import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const images = await db.query(
      `SELECT id, image_url, caption, sort_order
       FROM campaign_images 
       WHERE campaign_id = ? 
       ORDER BY sort_order ASC`,
      [id]
    );

    return NextResponse.json({ images: images || [] });
  } catch (error) {
    console.error('Error fetching campaign media:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
