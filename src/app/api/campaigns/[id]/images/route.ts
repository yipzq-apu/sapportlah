import { NextRequest, NextResponse } from 'next/server';
import { queryService } from '../../../../../database';
import { verifyToken } from '../../../../../lib/auth';

export async function POST(
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

    // Get and verify token
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    let decoded;

    try {
      decoded = verifyToken(token);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { image_url, caption, sort_order } = body;

    if (!image_url) {
      return NextResponse.json(
        { error: 'Image URL is required' },
        { status: 400 }
      );
    }

    // Escape strings for SQL
    const escapedImageUrl = image_url.replace(/'/g, "''");
    const escapedCaption = caption ? caption.replace(/'/g, "''") : '';

    // Insert campaign image into database
    const insertQuery = `
      INSERT INTO campaign_images (campaign_id, image_url, caption, sort_order, created_at)
      VALUES (${campaignId}, '${escapedImageUrl}', '${escapedCaption}', ${
      sort_order || 0
    }, NOW())
    `;

    await queryService.customQuery(insertQuery);

    return NextResponse.json(
      { message: 'Campaign image added successfully' },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Add campaign image error:', error);

    return NextResponse.json(
      { error: 'Failed to add campaign image', details: error.message },
      { status: 500 }
    );
  }
}
