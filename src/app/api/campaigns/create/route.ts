import { NextRequest, NextResponse } from 'next/server';
import { queryService } from '../../../../database';
import { verifyToken } from '../../../../lib/auth';

export async function POST(request: NextRequest) {
  try {
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

    const userId = decoded.userId;
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
    } = body;

    // Validate required fields
    if (
      !title ||
      !description ||
      !short_description ||
      !goal_amount ||
      !category_id ||
      !end_date
    ) {
      return NextResponse.json(
        { error: 'Required fields missing' },
        { status: 400 }
      );
    }

    // Test database connection
    try {
      await queryService.customQuery('SELECT 1 as test');
    } catch (dbError) {
      console.error('Database connection failed:', dbError);
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    // Escape strings for SQL
    const escapedTitle = title.replace(/'/g, "''");
    const escapedDescription = description.replace(/'/g, "''");
    const escapedShortDescription = short_description.replace(/'/g, "''");
    const escapedFeaturedImage = featured_image
      ? featured_image.replace(/'/g, "''")
      : null;
    const escapedVideoUrl = video_url ? video_url.replace(/'/g, "''") : null;

    // Insert campaign into database and get the ID
    const insertQuery = `
      INSERT INTO campaigns (
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
        created_at
      ) VALUES (
        ${userId}, 
        ${parseInt(category_id)}, 
        '${escapedTitle}', 
        '${escapedDescription}', 
        '${escapedShortDescription}', 
        ${parseFloat(goal_amount)}, 
        0, 
        '${end_date}', 
        ${escapedFeaturedImage ? `'${escapedFeaturedImage}'` : 'NULL'}, 
        ${escapedVideoUrl ? `'${escapedVideoUrl}'` : 'NULL'}, 
        'draft', 
        0, 
        0, 
        NOW()
      )
    `;

    await queryService.customQuery(insertQuery);

    // Get the campaign ID
    const getIdQuery = 'SELECT LAST_INSERT_ID() as campaign_id';
    const result = (await queryService.customQuery(getIdQuery)) as any[];
    const campaignId = result[0]?.campaign_id;

    console.log(
      'Campaign created successfully for user:',
      userId,
      'Campaign ID:',
      campaignId
    );

    return NextResponse.json(
      { message: 'Campaign created successfully', campaignId },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create campaign error:', error);

    return NextResponse.json(
      { error: 'Failed to create campaign', details: error.message },
      { status: 500 }
    );
  }
}
