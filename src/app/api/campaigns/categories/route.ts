import { NextRequest, NextResponse } from 'next/server';
import { queryService } from '../../../../database';

export async function GET(request: NextRequest) {
  try {
    // Get distinct categories from campaigns table
    // If you have a separate categories table, use that instead
    const query = `
      SELECT DISTINCT c.category_id as id, c.category_id as name
      FROM campaigns c
      WHERE c.status = 'active' AND c.category_id IS NOT NULL
      ORDER BY c.category_id
    `;

    const categories = await queryService.customQuery(query);

    return NextResponse.json({ categories }, { status: 200 });
  } catch (error: any) {
    console.error('Get categories error:', error);

    return NextResponse.json(
      { error: 'Failed to fetch categories', details: error.message },
      { status: 500 }
    );
  }
}
