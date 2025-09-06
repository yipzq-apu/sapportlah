import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '6');

    console.log('Fetching featured campaigns with limit:', limit);

    // Fetch featured campaigns with creator information
    const campaigns = (await db.query(
      `SELECT 
        c.id,
        c.title,
        c.description,
        c.short_description,
        c.goal_amount,
        c.current_amount,
        c.featured_image,
        c.created_at,
        CONCAT(u.first_name, ' ', u.last_name) as creator_name
      FROM campaigns c
      JOIN users u ON c.user_id = u.id
      WHERE c.is_featured = 1 AND c.status = 'active'
      ORDER BY c.created_at DESC
      LIMIT ?`,
      [limit]
    )) as RowDataPacket[];

    console.log('Featured campaigns found:', campaigns.length);

    return NextResponse.json({
      campaigns: campaigns,
      total: campaigns.length,
    });
  } catch (error) {
    console.error('Detailed error in featured campaigns API:');

    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error code:', (error as any).code);
      console.error('Full error object:', error);

      return NextResponse.json(
        { error: 'Failed to fetch featured campaigns', details: error.message },
        { status: 500 }
      );
    } else {
      console.error('Unknown error:', error);
      return NextResponse.json(
        {
          error: 'Failed to fetch featured campaigns',
          details: 'Unknown error occurred',
        },
        { status: 500 }
      );
    }
  }
}
