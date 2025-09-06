import { NextRequest, NextResponse } from 'next/server';
import { queryService } from '../../../database';
import { verifyToken } from '../../../lib/auth';

// Get user's favorite campaigns
export async function GET(request: NextRequest) {
  try {
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

    // Fetch favorite campaigns with campaign details
    const query = `
      SELECT 
        c.id,
        c.title,
        c.short_description,
        c.goal_amount,
        c.current_amount,
        c.end_date,
        c.featured_image,
        c.status,
        c.backers_count,
        f.created_at as favorited_at,
        CONCAT(u.first_name, ' ', u.last_name) as creator_name
      FROM favorites f
      JOIN campaigns c ON f.campaign_id = c.id
      JOIN users u ON c.user_id = u.id
      WHERE f.user_id = ${userId}
      ORDER BY f.created_at DESC
    `;

    const result = await queryService.customQuery(query);
    const favorites = Array.isArray(result) ? result : [];

    // Format favorites for frontend
    const formattedFavorites = favorites.map((fav: any) => ({
      id: fav.id.toString(),
      title: fav.title,
      shortDescription: fav.short_description,
      goal: parseFloat(fav.goal_amount),
      raised: parseFloat(fav.current_amount),
      progress:
        fav.goal_amount > 0
          ? Math.min((fav.current_amount / fav.goal_amount) * 100, 100)
          : 0,
      endDate: fav.end_date,
      image: fav.featured_image || '/api/placeholder/300/200',
      status: fav.status,
      backersCount: fav.backers_count,
      creatorName: fav.creator_name,
      favoritedAt: fav.favorited_at,
    }));

    return NextResponse.json(
      { favorites: formattedFavorites },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Get favorites error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch favorites', details: error.message },
      { status: 500 }
    );
  }
}

// Add campaign to favorites
export async function POST(request: NextRequest) {
  try {
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
    const { campaignId } = body;

    if (!campaignId) {
      return NextResponse.json(
        { error: 'Campaign ID is required' },
        { status: 400 }
      );
    }

    // Insert favorite
    const insertQuery = `
      INSERT IGNORE INTO favorites (user_id, campaign_id, created_at)
      VALUES (${userId}, ${parseInt(campaignId)}, NOW())
    `;

    await queryService.customQuery(insertQuery);

    return NextResponse.json(
      { message: 'Campaign added to favorites' },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Add favorite error:', error);
    return NextResponse.json(
      { error: 'Failed to add favorite', details: error.message },
      { status: 500 }
    );
  }
}

// Remove campaign from favorites
export async function DELETE(request: NextRequest) {
  try {
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
    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get('campaignId');

    if (!campaignId) {
      return NextResponse.json(
        { error: 'Campaign ID is required' },
        { status: 400 }
      );
    }

    // Delete favorite
    const deleteQuery = `
      DELETE FROM favorites 
      WHERE user_id = ${userId} AND campaign_id = ${parseInt(campaignId)}
    `;

    await queryService.customQuery(deleteQuery);

    return NextResponse.json(
      { message: 'Campaign removed from favorites' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Remove favorite error:', error);
    return NextResponse.json(
      { error: 'Failed to remove favorite', details: error.message },
      { status: 500 }
    );
  }
}
