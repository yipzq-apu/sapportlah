import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '6');

    console.log('Fetching featured campaigns with limit:', limit);

    // Single query to fetch featured campaigns with creator information
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
        u.organization_name,
        CONCAT(u.first_name, ' ', u.last_name) as creator_name
      FROM campaigns c
      JOIN users u ON c.user_id = u.id
      WHERE c.is_featured = 1 AND c.status = 'active'
      ORDER BY c.created_at DESC
      LIMIT ?`,
      [limit]
    )) as RowDataPacket[];

    console.log('Featured campaigns found:', campaigns?.length || 0);

    // Ensure we always return a valid array
    const validCampaigns = Array.isArray(campaigns) ? campaigns : [];

    return NextResponse.json({
      success: true,
      campaigns: validCampaigns,
      total: validCampaigns.length,
    });
  } catch (error) {
    console.error('Featured campaigns API error:', error);

    // Always return a valid JSON response, even on error
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch featured campaigns',
        campaigns: [],
        total: 0,
      },
      { status: 500 }
    );
  }
}
