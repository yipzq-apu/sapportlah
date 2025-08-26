import { NextRequest, NextResponse } from 'next/server';
import { queryService } from '../../../database';

export async function GET(request: NextRequest) {
  try {
    console.log('Campaigns API called');

    // Test database connection first
    try {
      await queryService.customQuery('SELECT 1 as test');
      console.log('Database connection successful');
    } catch (dbError) {
      console.error('Database connection failed:', dbError);
      return NextResponse.json(
        {
          error: 'Database connection failed',
          details: dbError instanceof Error ? dbError.message : 'Unknown error',
        },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);

    const search = searchParams.get('search');
    const category_id = searchParams.get('category_id');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '6');

    console.log('Query params:', { search, category_id, page, limit });

    // Build the main query without parameters first (safer approach)
    let query = `
      SELECT 
        c.*,
        CONCAT(u.first_name, ' ', u.last_name) as creator_name,
        u.email as creator_email
      FROM campaigns c
      JOIN users u ON c.user_id = u.id
      WHERE c.status = 'active'
    `;

    // Add search filter
    if (search) {
      const searchEscaped = search.replace(/'/g, "''"); // Basic SQL injection protection
      query += ` AND (c.title LIKE '%${searchEscaped}%' OR c.description LIKE '%${searchEscaped}%' OR c.short_description LIKE '%${searchEscaped}%')`;
    }

    // Add category filter
    if (category_id && category_id !== 'all') {
      const categoryNum = parseInt(category_id);
      if (!isNaN(categoryNum)) {
        query += ` AND c.category_id = ${categoryNum}`;
      }
    }

    // Add ordering and pagination
    const cleanLimit = Math.max(1, Math.min(limit, 100));
    const cleanOffset = Math.max(0, (page - 1) * cleanLimit);

    query += ` ORDER BY c.is_featured DESC, c.created_at DESC LIMIT ${cleanLimit} OFFSET ${cleanOffset}`;

    console.log('Executing query:', query);

    const campaigns = await queryService.customQuery(query);
    console.log('Campaigns result:', campaigns);

    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) as total
      FROM campaigns c
      WHERE c.status = 'active'
    `;

    if (search) {
      const searchEscaped = search.replace(/'/g, "''");
      countQuery += ` AND (c.title LIKE '%${searchEscaped}%' OR c.description LIKE '%${searchEscaped}%' OR c.short_description LIKE '%${searchEscaped}%')`;
    }

    if (category_id && category_id !== 'all') {
      const categoryNum = parseInt(category_id);
      if (!isNaN(categoryNum)) {
        countQuery += ` AND c.category_id = ${categoryNum}`;
      }
    }

    console.log('Executing count query:', countQuery);

    const countResult = await queryService.customQuery(countQuery);
    console.log('Count result:', countResult);

    const total = (countResult as any[])[0]?.total || 0;

    return NextResponse.json(
      {
        campaigns,
        pagination: {
          total,
          page,
          limit: cleanLimit,
          totalPages: Math.ceil(total / cleanLimit),
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Get campaigns error:', error);
    console.error('Error stack:', error.stack);

    return NextResponse.json(
      { error: 'Failed to fetch campaigns', details: error.message },
      { status: 500 }
    );
  }
}
