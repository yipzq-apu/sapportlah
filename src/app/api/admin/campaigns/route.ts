import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let query = `
      SELECT 
        c.*,
        u.organization_name,
        CONCAT(u.first_name, ' ', u.last_name) as creator_name,
        u.email as creator_email,
        cat.name as category_name
      FROM campaigns c
      JOIN users u ON c.user_id = u.id
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
