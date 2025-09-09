import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let query = `
      SELECT 
        c.id,
        c.user_id,
        c.category_id,
        c.title,
        c.description,
        c.short_description,
        c.goal_amount,
        c.current_amount,
        c.end_date,
        c.featured_image,
        c.status,
        c.reason,
        c.is_featured,
        c.backers_count,
        c.created_at,
        c.updated_at,
        CONCAT(u.first_name, ' ', u.last_name) as creator_name,
        u.email as creator_email,
        cat.name as category_name
      FROM campaigns c
      LEFT JOIN users u ON c.user_id = u.id
      LEFT JOIN categories cat ON c.category_id = cat.id
    `;

    const params: any[] = [];
    if (status && status !== 'all') {
      query += ' WHERE c.status = ?';
      params.push(status);
    }

    query += ' ORDER BY c.created_at DESC';

    const campaigns = await db.query(query, params);

    return NextResponse.json({
      campaigns,
      total: Array.isArray(campaigns) ? campaigns.length : 0,
    });
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 }
    );
  }
}
