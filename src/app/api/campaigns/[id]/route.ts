import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get campaign details with creator information
    const campaigns = await db.query(
      `SELECT 
        c.*,
        u.first_name as creator_first_name,
        u.last_name as creator_last_name,
        u.email as creator_email,
        u.organization_name as creator_organization_name,
        u.profile_image as creator_profile_image,
        cat.name as category_name
       FROM campaigns c 
       LEFT JOIN users u ON c.user_id = u.id 
       LEFT JOIN categories cat ON c.category_id = cat.id 
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

    const campaign = campaigns[0] as any;

    return NextResponse.json({
      success: true,
      campaign: {
        id: campaign.id,
        title: campaign.title,
        description: campaign.description,
        short_description: campaign.short_description,
        goal_amount: campaign.goal_amount,
        current_amount: campaign.current_amount,
        start_date: campaign.start_date,
        end_date: campaign.end_date,
        featured_image: campaign.featured_image,
        status: campaign.status,
        is_featured: campaign.is_featured,
        backers_count: campaign.backers_count,
        created_at: campaign.created_at,
        updated_at: campaign.updated_at,
        category_id: campaign.category_id,
        category_name: campaign.category_name,
        user_id: campaign.user_id,
        creator_name:
          campaign.creator_organization_name ||
          `${campaign.creator_first_name} ${campaign.creator_last_name}`,
        creator_email: campaign.creator_email,
        organization_name: campaign.creator_organization_name,
        creator_profile_image: campaign.creator_profile_image,
      },
    });
  } catch (error) {
    console.error('Error fetching campaign:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
