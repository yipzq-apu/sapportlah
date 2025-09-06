import { NextRequest, NextResponse } from 'next/server';
import { queryService } from '../../../../database';
import { verifyToken } from '../../../../lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Get and verify token (commented out for testing)
    /*
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
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    if (decoded.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }
    */

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // Build query based on status filter
    let whereClause = '';
    if (status !== 'all') {
      whereClause = `WHERE status = '${status}'`;
    }

    // Fetch contact messages
    const query = `
      SELECT 
        id,
        name,
        email,
        message,
        status,
        created_at,
        updated_at
      FROM contact_us
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const messages = await queryService.customQuery(query);

    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM contact_us
      ${whereClause}
    `;
    const countResult = await queryService.customQuery(countQuery);
    const total = (countResult as any[])[0]?.total || 0;

    return NextResponse.json(
      {
        messages,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Get contact messages error:', error);

    return NextResponse.json(
      { error: 'Failed to fetch contact messages', details: error.message },
      { status: 500 }
    );
  }
}

// Update message status
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { messageId, status } = body;

    if (!messageId || !status) {
      return NextResponse.json(
        { error: 'Message ID and status are required' },
        { status: 400 }
      );
    }

    if (!['new', 'in_progress', 'resolved'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const updateQuery = `
      UPDATE contact_us 
      SET status = '${status}', updated_at = NOW()
      WHERE id = ${parseInt(messageId)}
    `;

    await queryService.customQuery(updateQuery);

    return NextResponse.json(
      { message: 'Status updated successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Update message status error:', error);

    return NextResponse.json(
      { error: 'Failed to update status', details: error.message },
      { status: 500 }
    );
  }
}
