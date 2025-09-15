import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export async function GET(request: NextRequest) {
  try {
    // Combine multiple queries into fewer database calls to reduce connection usage
    const [
      platformStats,
      campaignStats,
      userStats,
      financialStats,
      recentActivities,
      pendingItems,
    ] = await Promise.all([
      getPlatformStats(),
      getCampaignStats(),
      getUserStats(),
      getFinancialStats(),
      getRecentActivities(),
      getPendingItems(),
    ]);

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
  try {
    // Combine multiple counts into a single query
    const stats = (await db.query(
      `SELECT 
        (SELECT COUNT(*) FROM campaigns) as totalCampaigns,
        (SELECT COUNT(*) FROM campaigns WHERE status = 'active') as activeCampaigns,
        (SELECT COUNT(*) FROM users) as totalUsers,
        (SELECT COALESCE(SUM(amount), 0) FROM donations WHERE payment_status = 'completed') as totalDonationsAmount`
    )) as RowDataPacket[];

    return {
      totalCampaigns: stats[0].totalCampaigns,
      activeCampaigns: stats[0].activeCampaigns,
      totalUsers: stats[0].totalUsers,
      totalDonationsAmount: parseFloat(stats[0].totalDonationsAmount),
    };
  } catch (error) {
    console.error('Error in getPlatformStats:', error);
    return {
      totalCampaigns: 0,
      activeCampaigns: 0,
      totalUsers: 0,
      totalDonationsAmount: 0,
    };
  }
}

async function getCampaignStats() {
  try {
    // Combine related queries
    const [statusBreakdown, additionalStats] = await Promise.all([
      db.query(
        `SELECT 
          status,
          COUNT(*) as count
        FROM campaigns 
        GROUP BY status`
      ) as Promise<RowDataPacket[]>,

      db.query(
        `SELECT 
          (SELECT COUNT(*) FROM campaigns WHERE is_featured = 1) as featuredCount,
          (SELECT COUNT(*) FROM campaigns WHERE current_amount >= goal_amount) as successfulCampaigns`
      ) as Promise<RowDataPacket[]>,
    ]);

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
      featuredCount: additionalStats[0].featuredCount,
      successfulCampaigns: additionalStats[0].successfulCampaigns,
      completionRates,
    };
  } catch (error) {
    console.error('Error in getCampaignStats:', error);
    return {
      statusBreakdown: [],
      featuredCount: 0,
      successfulCampaigns: 0,
      completionRates: [],
    };
  }
}

async function getUserStats() {
  try {
    // Combine user stats into fewer queries
    const [roleBreakdown, userCounts] = await Promise.all([
      db.query(
        `SELECT 
          role,
          COUNT(*) as count
        FROM users 
        GROUP BY role`
      ) as Promise<RowDataPacket[]>,

      db.query(
        `SELECT 
          (SELECT COUNT(*) FROM users WHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH)) as newUsersThisMonth,
          (SELECT COUNT(DISTINCT user_id) FROM donations WHERE payment_status = 'completed') as activeDonors,
          (SELECT COUNT(DISTINCT user_id) FROM campaigns) as activeCreators`
      ) as Promise<RowDataPacket[]>,
    ]);

    return {
      roleBreakdown,
      newUsersThisMonth: userCounts[0].newUsersThisMonth,
      activeDonors: userCounts[0].activeDonors,
      activeCreators: userCounts[0].activeCreators,
    };
  } catch (error) {
    console.error('Error in getUserStats:', error);
    return {
      roleBreakdown: [],
      newUsersThisMonth: 0,
      activeDonors: 0,
      activeCreators: 0,
    };
  }
}

async function getFinancialStats() {
  try {
    // Financial statistics
    const financialQueries = await Promise.all([
      // Monthly donation trends
      db.query(`
        SELECT 
          DATE_FORMAT(created_at, '%Y-%m') as month,
          COUNT(*) as donation_count,
          SUM(amount) as total_amount
        FROM donations 
        WHERE payment_status = 'completed'
        AND created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
        GROUP BY DATE_FORMAT(created_at, '%Y-%m')
        ORDER BY month DESC
        LIMIT 12
      `),

      // Average donation and total donations
      db.query(`
        SELECT 
          AVG(amount) as avg_donation,
          COUNT(*) as total_donations
        FROM donations 
        WHERE payment_status = 'completed'
      `),

      // Platform fees from platform_fees table
      db.query(`
        SELECT SUM(amount) as total_platform_fees
        FROM platform_fees
      `),
    ]);

    const monthlyTrends = financialQueries[0] as any[];
    const donationStats = (financialQueries[1] as any[])[0];
    const platformFeesResult = (financialQueries[2] as any[])[0];

    const financialStats = {
      monthlyTrends: monthlyTrends,
      avgDonation: parseFloat(donationStats?.avg_donation || 0),
      totalDonations: donationStats?.total_donations || 0,
      platformFees: parseFloat(platformFeesResult?.total_platform_fees || 0),
    };

    return financialStats;
  } catch (error) {
    console.error('Error in getFinancialStats:', error);
    return {
      monthlyTrends: [],
      avgDonation: 0,
      totalDonations: 0,
      platformFees: 0,
    };
  }
}

async function getRecentActivities() {
  try {
    // Use Promise.all for concurrent queries but limit the data returned
    const [recentCampaigns, recentDonations, recentUsers] = await Promise.all([
      db.query(
        `SELECT 
          c.id,
          c.title,
          c.status,
          c.created_at,
          CONCAT(u.first_name, ' ', u.last_name) as creator_name
        FROM campaigns c
        JOIN users u ON c.user_id = u.id
        ORDER BY c.created_at DESC
        LIMIT 5`
      ) as Promise<RowDataPacket[]>,

      db.query(
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
        WHERE d.payment_status = 'completed'
        ORDER BY d.created_at DESC
        LIMIT 5`
      ) as Promise<RowDataPacket[]>,

      db.query(
        `SELECT 
          id,
          CONCAT(first_name, ' ', last_name) as name,
          email,
          role,
          created_at
        FROM users
        ORDER BY created_at DESC
        LIMIT 5`
      ) as Promise<RowDataPacket[]>,
    ]);

    return {
      recentCampaigns,
      recentDonations,
      recentUsers,
    };
  } catch (error) {
    console.error('Error in getRecentActivities:', error);
    return {
      recentCampaigns: [],
      recentDonations: [],
      recentUsers: [],
    };
  }
}

async function getPendingItems() {
  try {
    // Pending items that need attention
    const pendingQueries = await Promise.all([
      // Pending campaigns
      db.query(`
        SELECT c.id, c.title, c.created_at, 
               CONCAT(u.first_name, ' ', u.last_name) as creator_name
        FROM campaigns c
        LEFT JOIN users u ON c.user_id = u.id
        WHERE c.status = 'pending'
        ORDER BY c.created_at DESC
        LIMIT 10
      `),

      // Unanswered questions from contact_us table
      db.query(`
        SELECT id, name, email, message, created_at, status
        FROM contact_us
        WHERE status != 'resolved'
        ORDER BY created_at DESC
        LIMIT 10
      `),

      // Failed campaigns
      db.query(`
        SELECT c.id, c.title, c.created_at,
               CONCAT(u.first_name, ' ', u.last_name) as creator_name
        FROM campaigns c
        LEFT JOIN users u ON c.user_id = u.id
        WHERE c.status = 'failed'
        ORDER BY c.created_at DESC
        LIMIT 10
      `),

      // Get actual counts
      db.query(`
        SELECT 
          (SELECT COUNT(*) FROM campaigns WHERE status = 'pending') as pendingCampaignsCount,
          (SELECT COUNT(*) FROM contact_us WHERE status != 'resolved') as unansweredQuestionsCount,
          (SELECT COUNT(*) FROM campaigns WHERE status = 'failed') as failedCampaignsCount
      `),
    ]);

    const pendingCampaigns = pendingQueries[0] as any[];
    const unansweredQuestions = pendingQueries[1] as any[];
    const failedCampaigns = pendingQueries[2] as any[];
    const counts = (pendingQueries[3] as any[])[0];

    const pendingItems = {
      pendingCampaigns,
      unansweredQuestions,
      failedCampaigns,
      counts: {
        pendingCampaigns: counts.pendingCampaignsCount,
        unansweredQuestions: counts.unansweredQuestionsCount,
        failedCampaigns: counts.failedCampaignsCount,
      },
    };

    return pendingItems;
  } catch (error) {
    console.error('Error in getPendingItems:', error);
    return {
      pendingCampaigns: [],
      unansweredQuestions: [],
      failedCampaigns: [],
      counts: {
        pendingCampaigns: 0,
        unansweredQuestions: 0,
        failedCampaigns: 0,
      },
    };
  }
}
