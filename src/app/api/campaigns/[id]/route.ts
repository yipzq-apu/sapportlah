import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const campaigns = await db.query(
      `SELECT 
        c.*,
        u.organization_name,
        CONCAT(u.first_name, ' ', u.last_name) as creator_name,
        u.email as creator_email
      FROM campaigns c
      JOIN users u ON c.user_id = u.id
      WHERE c.id = ?`,
      [id]
    );

    console.log(campaigns);

    if (!Array.isArray(campaigns) || campaigns.length === 0) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ campaign: campaigns[0] });
  } catch (error) {
    console.error('Error fetching campaign:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
