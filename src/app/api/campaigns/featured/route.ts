import { NextRequest, NextResponse } from 'next/server';
import { queryService } from '../../../../database';

export async function GET(request: NextRequest) {
  try {
    console.log('Featured campaigns API called');

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '3');

    // Test database connection
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

    // Alternative approach - use string interpolation for testing
    const cleanLimit = Math.max(1, Math.min(limit, 10));

    const query = `
      SELECT 
        c.*,
        CONCAT(u.first_name, ' ', u.last_name) as creator_name,
        u.email as creator_email
      FROM campaigns c
      JOIN users u ON c.user_id = u.id
      WHERE c.status = 'active' AND c.is_featured = 1
      ORDER BY c.created_at DESC
      LIMIT ${cleanLimit}
    `;

    console.log('Executing featured campaigns query:', query);

    const campaigns = await queryService.customQuery(query);

    console.log('Featured campaigns result:', campaigns);

    return NextResponse.json({ campaigns }, { status: 200 });
  } catch (error: any) {
    console.error('Get featured campaigns error:', error);
    console.error('Error stack:', error.stack);

    return NextResponse.json(
      { error: 'Failed to fetch featured campaigns', details: error.message },
      { status: 500 }
    );
  }
}
