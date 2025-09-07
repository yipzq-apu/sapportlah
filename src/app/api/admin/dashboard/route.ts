import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export async function GET(request: NextRequest) {
  try {
    // Get overall platform statistics
    const platformStats = await getPlatformStats();

    // Get campaign statistics
    const campaignStats = await getCampaignStats();

    // Get user statistics
    const userStats = await getUserStats();

    // Get financial statistics
    const financialStats = await getFinancialStats();

    // Get recent activities
    const recentActivities = await getRecentActivities();

    // Get pending items that need admin attention
    const pendingItems = await getPendingItems();

    return NextResponse.json({
      platformStats,
      campaignStats,
      userStats,
      financialStats,
      recentActivities,
      pendingItems,
    });
  } catch (error) {
    console.error('Error fetching admin dashboard data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}

async function getPlatformStats() {
  // Total campaigns
  const totalCampaignsResult = (await db.query(
    'SELECT COUNT(*) as count FROM campaigns'
  )) as RowDataPacket[];

  // Active campaigns
  const activeCampaignsResult = (await db.query(
    'SELECT COUNT(*) as count FROM campaigns WHERE status = "active"'
  )) as RowDataPacket[];

  // Total users
  const totalUsersResult = (await db.query(
    'SELECT COUNT(*) as count FROM users'
  )) as RowDataPacket[];

  // Total donations amount
  const totalDonationsResult = (await db.query(
    'SELECT COALESCE(SUM(amount), 0) as total FROM donations WHERE payment_status = "completed"'
  )) as RowDataPacket[];

  return {
    totalCampaigns: totalCampaignsResult[0].count,
    activeCampaigns: activeCampaignsResult[0].count,
    totalUsers: totalUsersResult[0].count,
    totalDonationsAmount: parseFloat(totalDonationsResult[0].total),
  };
}

async function getCampaignStats() {
  // Campaign status breakdown
  const statusBreakdown = (await db.query(
    `SELECT 
      status,
      COUNT(*) as count
    FROM campaigns 
    GROUP BY status`
  )) as RowDataPacket[];

  // Featured campaigns
  const featuredCount = (await db.query(
    'SELECT COUNT(*) as count FROM campaigns WHERE is_featured = 1'
  )) as RowDataPacket[];

  // Successful campaigns (reached goal)
  const successfulCampaigns = (await db.query(
    'SELECT COUNT(*) as count FROM campaigns WHERE current_amount >= goal_amount'
  )) as RowDataPacket[];

  // Campaign completion rates
  const completionRates = (await db.query(
    `SELECT 
      CASE 
        WHEN current_amount >= goal_amount THEN 'completed'
        WHEN current_amount >= goal_amount * 0.75 THEN 'high_progress'
        WHEN current_amount >= goal_amount * 0.25 THEN 'medium_progress'
        ELSE 'low_progress'
      END as progress_level,
      COUNT(*) as count
    FROM campaigns 
    WHERE status IN ('active', 'completed')
    GROUP BY progress_level`
  )) as RowDataPacket[];

  return {
    statusBreakdown,
    featuredCount: featuredCount[0].count,
    successfulCampaigns: successfulCampaigns[0].count,
    completionRates,
  };
}

async function getUserStats() {
  // User role breakdown
  const roleBreakdown = (await db.query(
    `SELECT 
      role,
      COUNT(*) as count
    FROM users 
    GROUP BY role`
  )) as RowDataPacket[];

  // New users this month
  const newUsersThisMonth = (await db.query(
    `SELECT COUNT(*) as count 
    FROM users 
    WHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH)`
  )) as RowDataPacket[];

  // Active donors (users who have made donations)
  const activeDonors = (await db.query(
    `SELECT COUNT(DISTINCT user_id) as count 
    FROM donations 
    WHERE payment_status = "completed"`
  )) as RowDataPacket[];

  // Active creators (users who have created campaigns)
  const activeCreators = (await db.query(
    `SELECT COUNT(DISTINCT user_id) as count 
    FROM campaigns`
  )) as RowDataPacket[];

  return {
    roleBreakdown,
    newUsersThisMonth: newUsersThisMonth[0].count,
    activeDonors: activeDonors[0].count,
    activeCreators: activeCreators[0].count,
  };
}

async function getFinancialStats() {
  // Monthly donation trends (last 6 months)
  const monthlyTrends = (await db.query(
    `SELECT 
      DATE_FORMAT(created_at, '%Y-%m') as month,
      COUNT(*) as donation_count,
      SUM(amount) as total_amount
    FROM donations 
    WHERE payment_status = "completed" 
      AND created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
    GROUP BY DATE_FORMAT(created_at, '%Y-%m')
    ORDER BY month ASC`
  )) as RowDataPacket[];

  // Average donation amount
  const avgDonation = (await db.query(
    `SELECT AVG(amount) as average 
    FROM donations 
    WHERE payment_status = "completed"`
  )) as RowDataPacket[];

  // Total donations count
  const totalDonations = (await db.query(
    `SELECT COUNT(*) as count 
    FROM donations 
    WHERE payment_status = "completed"`
  )) as RowDataPacket[];

  // Platform fees collected (assuming 5% fee)
  const platformFees = (await db.query(
    `SELECT SUM(amount * 0.05) as total_fees 
    FROM donations 
    WHERE payment_status = "completed"`
  )) as RowDataPacket[];

  return {
    monthlyTrends,
    avgDonation: parseFloat(avgDonation[0].average || 0),
    totalDonations: totalDonations[0].count,
    platformFees: parseFloat(platformFees[0].total_fees || 0),
  };
}

async function getRecentActivities() {
  // Recent campaigns
  const recentCampaigns = (await db.query(
    `SELECT 
      c.id,
      c.title,
      c.status,
      c.created_at,
      CONCAT(u.first_name, ' ', u.last_name) as creator_name
    FROM campaigns c
    JOIN users u ON c.user_id = u.id
    ORDER BY c.created_at DESC
    LIMIT 10`
  )) as RowDataPacket[];

  // Recent donations
  const recentDonations = (await db.query(
    `SELECT 
      d.id,
      d.amount,
      d.created_at,
      CONCAT(u.first_name, ' ', u.last_name) as donor_name,
      c.title as campaign_title,
      d.anonymous
    FROM donations d
    JOIN users u ON d.user_id = u.id
    JOIN campaigns c ON d.campaign_id = c.id
    WHERE d.payment_status = "completed"
    ORDER BY d.created_at DESC
    LIMIT 10`
  )) as RowDataPacket[];

  // Recent user registrations
  const recentUsers = (await db.query(
    `SELECT 
      id,
      CONCAT(first_name, ' ', last_name) as name,
      email,
      role,
      created_at
    FROM users
    ORDER BY created_at DESC
    LIMIT 10`
  )) as RowDataPacket[];

  return {
    recentCampaigns,
    recentDonations,
    recentUsers,
  };
}

async function getPendingItems() {
  // Pending campaigns awaiting approval
  const pendingCampaigns = (await db.query(
    `SELECT 
      c.id,
      c.title,
      c.created_at,
      CONCAT(u.first_name, ' ', u.last_name) as creator_name,
      u.email as creator_email
    FROM campaigns c
    JOIN users u ON c.user_id = u.id
    WHERE c.status = "pending"
    ORDER BY c.created_at ASC`
  )) as RowDataPacket[];

  // Unanswered questions
  const unansweredQuestions = (await db.query(
    `SELECT 
      q.id,
      q.content as question,
      q.created_at,
      c.title as campaign_title,
      CONCAT(u.first_name, ' ', u.last_name) as asker_name
    FROM comments q
    JOIN campaigns c ON q.campaign_id = c.id
    JOIN users u ON q.user_id = u.id
    WHERE q.parent_id IS NULL 
      AND q.id NOT IN (
        SELECT DISTINCT parent_id 
        FROM comments 
        WHERE parent_id IS NOT NULL
      )
    ORDER BY q.created_at DESC
    LIMIT 20`
  )) as RowDataPacket[];

  // Failed/problematic donations
  const failedDonations = (await db.query(
    `SELECT 
      d.id,
      d.amount,
      d.created_at,
      d.payment_status,
      CONCAT(u.first_name, ' ', u.last_name) as donor_name,
      c.title as campaign_title
    FROM donations d
    JOIN users u ON d.user_id = u.id
    JOIN campaigns c ON d.campaign_id = c.id
    WHERE d.payment_status IN ("failed", "pending")
    ORDER BY d.created_at DESC
    LIMIT 10`
  )) as RowDataPacket[];

  return {
    pendingCampaigns,
    unansweredQuestions,
    failedDonations,
    counts: {
      pendingCampaigns: pendingCampaigns.length,
      unansweredQuestions: unansweredQuestions.length,
      failedDonations: failedDonations.length,
    },
  };
}
