import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        id,
        name,
        email,
        message,
        status,
        created_at,
        updated_at
      FROM contact_us
      WHERE 1=1
    `;

    const params: any[] = [];

    // Add status filter
    if (status && status !== 'all') {
      // Map frontend status values to database values
      let dbStatus = status;
      if (status === 'in progress') {
        dbStatus = 'in progress';
      }
      query += ` AND status = ?`;
      params.push(dbStatus);
    }

    // Get total count for pagination
    const countQuery = query.replace(
      'SELECT id, name, email, message, status, created_at, updated_at',
      'SELECT COUNT(*) as total'
    );
    const countResult = await db.query(countQuery, params);
    const total = Array.isArray(countResult)
      ? (countResult[0] as any).total
      : 0;

    // Add ordering and pagination
    query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const messages = await db.query(query, params);

    return NextResponse.json({
      messages,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
