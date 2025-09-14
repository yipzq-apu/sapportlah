import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Fetch user's favorite campaign IDs
    const favorites = (await db.query(
      'SELECT campaign_id FROM user_favorites WHERE user_id = ?',
      [userId]
    )) as RowDataPacket[];

    const favoriteCampaignIds = favorites.map((fav) => fav.campaign_id);

    return NextResponse.json({
      favorites: favoriteCampaignIds,
    });
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return NextResponse.json(
      { error: 'Failed to fetch favorites' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, campaignId } = await request.json();

    if (!userId || !campaignId) {
      return NextResponse.json(
        { error: 'User ID and Campaign ID are required' },
        { status: 400 }
      );
    }

    // Check if user already has maximum favorites (6)
    const existingFavorites = (await db.query(
      'SELECT COUNT(*) as count FROM user_favorites WHERE user_id = ?',
      [userId]
    )) as RowDataPacket[];

    const favoriteCount = existingFavorites[0]?.count || 0;
    if (favoriteCount >= 6) {
      return NextResponse.json(
        { error: 'Maximum 6 favorite campaigns allowed per user' },
        { status: 400 }
      );
    }

    // Check if already favorited
    const existing = (await db.query(
      'SELECT id FROM user_favorites WHERE user_id = ? AND campaign_id = ?',
      [userId, campaignId]
    )) as RowDataPacket[];

    if (existing.length > 0) {
      return NextResponse.json(
        { error: 'Campaign is already in favorites' },
        { status: 400 }
      );
    }

    // Add to favorites
    await db.query(
      'INSERT INTO user_favorites (user_id, campaign_id, created_at) VALUES (?, ?, NOW())',
      [userId, campaignId]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Add favorite error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const campaignId = searchParams.get('campaignId');

    if (!userId || !campaignId) {
      return NextResponse.json(
        { error: 'User ID and Campaign ID are required' },
        { status: 400 }
      );
    }

    // Remove from favorites
    await db.query(
      'DELETE FROM user_favorites WHERE user_id = ? AND campaign_id = ?',
      [userId, campaignId]
    );

    return NextResponse.json(
      { message: 'Campaign removed from favorites' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error removing from favorites:', error);
    return NextResponse.json(
      { error: 'Failed to remove from favorites' },
      { status: 500 }
    );
  }
}
