import { NextRequest, NextResponse } from 'next/server';
import { queryService } from '../../../../../database';
import { verifyToken } from '../../../../../lib/auth';

// Get campaign updates
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

    // Fetch campaign updates
    const query = `
      SELECT 
        id,
        title,
        content,
        image_url,
        created_at,
        updated_at
      FROM campaign_updates
      WHERE campaign_id = ${campaignId}
      ORDER BY created_at DESC
    `;

    const updates = await queryService.customQuery(query);

    return NextResponse.json({ updates }, { status: 200 });
  } catch (error: any) {
    console.error('Get campaign updates error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch updates', details: error.message },
      { status: 500 }
    );
  }
}

// Add campaign update
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

    // For testing, skip authentication
    /*
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
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Verify user owns the campaign
    const campaignQuery = `SELECT user_id FROM campaigns WHERE id = ${campaignId}`;
    const campaign = await queryService.customQuery(campaignQuery);
    
    if (!campaign.length || campaign[0].user_id !== decoded.userId) {
      return NextResponse.json(
        { error: 'Unauthorized to update this campaign' },
        { status: 403 }
      );
    }
    */

    const body = await request.json();
    const { title, content, image_url } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    // Escape strings for SQL
    const escapedTitle = title.replace(/'/g, "''");
    const escapedContent = content.replace(/'/g, "''");
    const escapedImageUrl = image_url ? image_url.replace(/'/g, "''") : null;

    // Insert campaign update
    const insertQuery = `
      INSERT INTO campaign_updates (campaign_id, title, content, image_url, created_at)
      VALUES (${campaignId}, '${escapedTitle}', '${escapedContent}', ${
      escapedImageUrl ? `'${escapedImageUrl}'` : 'NULL'
    }, NOW())
    `;

    await queryService.customQuery(insertQuery);

    return NextResponse.json(
      { message: 'Update posted successfully' },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Post campaign update error:', error);
    return NextResponse.json(
      { error: 'Failed to post update', details: error.message },
      { status: 500 }
    );
  }
}
