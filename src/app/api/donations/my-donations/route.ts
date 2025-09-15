import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status') || 'all';
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '6');
    const offset = (page - 1) * limit;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Build WHERE clause for status filter
    let statusCondition = '';
    if (status !== 'all') {
      statusCondition = `AND c.status = '${status}'`;
    }

    // Build WHERE clause for search
    let searchCondition = '';
    if (search.trim()) {
      searchCondition = `AND c.title LIKE '%${search.trim()}%'`;
    }

    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM donations d
      JOIN campaigns c ON d.campaign_id = c.id
      WHERE d.user_id = ? AND d.payment_status = 'completed'
      ${statusCondition}
      ${searchCondition}
    `;

    const countResult = (await db.query(countQuery, [
      userId,
    ])) as RowDataPacket[];
    const totalDonations = countResult[0]?.total || 0;
    const totalPages = Math.ceil(totalDonations / limit);

    // Fetch donations with pagination
    const donationsQuery = `
      SELECT 
        d.id,
        d.campaign_id as campaignId,
        d.amount,
        d.message,
        d.anonymous,
        d.created_at as date,
        c.title as campaignTitle,
        c.featured_image as campaignImage,
        c.status as campaignStatus,
        c.goal_amount as campaignGoal,
        c.current_amount as campaignRaised,
        ROUND((c.current_amount / c.goal_amount) * 100, 1) as campaignProgress
      FROM donations d
      JOIN campaigns c ON d.campaign_id = c.id
      WHERE d.user_id = ? AND d.payment_status = 'completed'
      ${statusCondition}
      ${searchCondition}
      ORDER BY d.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const donations = (await db.query(donationsQuery, [
      userId,
      limit,
      offset,
    ])) as RowDataPacket[];

    // Calculate stats
    const statsQuery = `
      SELECT 
        SUM(d.amount) as totalDonated,
        COUNT(DISTINCT d.campaign_id) as campaignsSupported,
        AVG(d.amount) as averageDonation,
        COUNT(*) as totalDonations
      FROM donations d
      JOIN campaigns c ON d.campaign_id = c.id
      WHERE d.user_id = ? AND d.payment_status = 'completed'
    `;

    const statsResult = (await db.query(statsQuery, [
      userId,
    ])) as RowDataPacket[];
    const stats = {
      totalDonated: statsResult[0]?.totalDonated || 0,
      campaignsSupported: statsResult[0]?.campaignsSupported || 0,
      averageDonation: statsResult[0]?.averageDonation || 0,
      totalDonations: statsResult[0]?.totalDonations || 0,
    };

    return NextResponse.json({
      success: true,
      donations,
      stats,
      pagination: {
        current_page: page,
        total_pages: totalPages,
        total_donations: totalDonations,
        per_page: limit,
      },
    });
  } catch (error) {
    console.error('Error fetching user donations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch donations' },
      { status: 500 }
    );
  }
}
