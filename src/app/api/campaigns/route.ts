import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const categoryId = searchParams.get('category_id');
    const status = searchParams.get('status') || 'active';
    const search = searchParams.get('search');

    console.log('API received params:', {
      page,
      limit,
      categoryId,
      status,
      search,
    });

    const offset = (page - 1) * limit;

    // Build query conditions
    let whereConditions = ['c.status = ?'];
    let queryParams: any[] = [status];

    if (categoryId && categoryId !== 'all') {
      whereConditions.push('c.category_id = ?');
      queryParams.push(parseInt(categoryId));
      console.log('Added category filter:', categoryId);
    }

    if (search) {
      whereConditions.push('(c.title LIKE ? OR c.description LIKE ?)');
      queryParams.push(`%${search}%`, `%${search}%`);
      console.log('Added search filter:', search);
    }

    const whereClause = whereConditions.join(' AND ');
    console.log('Final WHERE clause:', whereClause);
    console.log('Query params:', queryParams);

    // Fetch campaigns with creator information
    const campaigns = (await db.query(
      `SELECT 
        c.id,
        c.title,
        c.description,
        c.short_description,
        c.goal_amount,
        c.current_amount,
        c.featured_image,
        c.status,
        c.is_featured,
        c.created_at,
        c.end_date,
        c.backers_count,
        u.organization_name,
        CONCAT(u.first_name, ' ', u.last_name) as creator_name,
        cat.name as category_name
      FROM campaigns c
      JOIN users u ON c.user_id = u.id
      LEFT JOIN categories cat ON c.category_id = cat.id
      WHERE ${whereClause}
      ORDER BY c.created_at DESC
      LIMIT ? OFFSET ?`,
      [...queryParams, limit, offset]
    )) as RowDataPacket[];

    // Get total count for pagination
    const totalResult = (await db.query(
      `SELECT COUNT(*) as total 
      FROM campaigns c 
      JOIN users u ON c.user_id = u.id 
      WHERE ${whereClause}`,
      queryParams
    )) as RowDataPacket[];

    const total = totalResult[0].total;
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      campaigns: campaigns,
      pagination: {
        current_page: page,
        total_pages: totalPages,
        total_campaigns: total,
        has_next: page < totalPages,
        has_prev: page > 1,
      },
    });
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaigns' },
      { status: 500 }
    );
  }
}
