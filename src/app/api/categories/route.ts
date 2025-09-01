import { NextRequest, NextResponse } from 'next/server';
import { queryService } from '../../../database';

export async function GET(request: NextRequest) {
  try {
    // If you have a categories table, use this:
    // const query = 'SELECT id, name FROM categories ORDER BY name';
    
    // For now, return static categories that match your database
    const categories = [
      { id: 1, name: 'Education' },
      { id: 2, name: 'Healthcare' },
      { id: 3, name: 'Environment' },
      { id: 4, name: 'Community' },
      { id: 5, name: 'Technology' },
      { id: 6, name: 'Arts & Culture' },
      { id: 7, name: 'Sports' },
      { id: 8, name: 'Emergency' },
    ];

    return NextResponse.json({ categories }, { status: 200 });

  } catch (error: any) {
    console.error('Get categories error:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch categories', details: error.message },
      { status: 500 }
    );
  }
}
