import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const campaignId = parseInt(params.id);

    if (isNaN(campaignId)) {
      return NextResponse.json(
        { error: 'Invalid campaign ID' },
        { status: 400 }
      );
    }

    // Fetch campaign details with creator information
    const campaigns = await db.query(
      `SELECT 
        c.id,
        c.title,
        c.description,
        c.short_description,
        c.goal_amount,
        c.current_amount,
        c.featured_image,
        c.status,
        c.category,
        c.end_date,
        c.is_featured,
        c.created_at,
        c.updated_at,
        u.id as creator_id,
        CONCAT(u.first_name, ' ', u.last_name) as creator_name,
        u.email as creator_email,
        u.profile_image as creator_image
      FROM campaigns c
      JOIN users u ON c.creator_id = u.id
      WHERE c.id = ?`,
      [campaignId]
    ) as RowDataPacket[];

    if (campaigns.length === 0) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    const campaign = campaigns[0];

    // Calculate additional metrics
    const progressPercentage = Math.min((campaign.current_amount / campaign.goal_amount) * 100, 100);
    const daysLeft = campaign.end_date ? Math.max(0, Math.ceil((new Date(campaign.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))) : null;

    return NextResponse.json({
      campaign: {
        ...campaign,
        progress_percentage: progressPercentage,
        days_left: daysLeft
      }
    });

  } catch (error) {
    console.error('Error fetching campaign details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaign details' },
      { status: 500 }
    );
  }
}
