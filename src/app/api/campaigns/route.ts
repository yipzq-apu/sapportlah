import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const category = searchParams.get('category');
    const status = searchParams.get('status') || 'active';
    const search = searchParams.get('search');
    
    const offset = (page - 1) * limit;

    // Build query conditions
    let whereConditions = ['c.status = ?'];
    let queryParams: any[] = [status];

    if (category) {
      whereConditions.push('c.category = ?');
      queryParams.push(category);
    }

    if (search) {
      whereConditions.push('(c.title LIKE ? OR c.description LIKE ?)');
      queryParams.push(`%${search}%`, `%${search}%`);
    }

    const whereClause = whereConditions.join(' AND ');

    // Fetch campaigns with creator information
    const campaigns = await db.query(
      `SELECT 
        c.id,
        c.title,
        c.description,
        c.short_description,
        c.goal_amount,
        c.current_amount,
        c.featured_image,
        c.category,
        c.end_date,
        c.is_featured,
        CONCAT(u.first_name, ' ', u.last_name) as creator_name,
        c.created_at
      FROM campaigns c
      JOIN users u ON c.creator_id = u.id
      WHERE ${whereClause}
      ORDER BY c.is_featured DESC, c.created_at DESC
      LIMIT ? OFFSET ?`,
      [...queryParams, limit, offset]
    ) as RowDataPacket[];

    // Get total count for pagination
    const totalResult = await db.query(
      `SELECT COUNT(*) as total 
      FROM campaigns c 
      JOIN users u ON c.creator_id = u.id 
      WHERE ${whereClause}`,
      queryParams
    ) as RowDataPacket[];

    const total = totalResult[0].total;
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      campaigns: campaigns,
      pagination: {
        current_page: page,
        total_pages: totalPages,
        total_campaigns: total,
        has_next: page < totalPages,
        has_prev: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaigns' },
      { status: 500 }
    );
  }
}
