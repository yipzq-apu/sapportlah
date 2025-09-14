import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const currentDate = new Date();
    const currentDateString = currentDate.toISOString().split('T')[0];

    // Update campaigns to 'active' when start_date is reached
    await db.query(
      `
      UPDATE campaigns 
      SET status = 'active', updated_at = NOW()
      WHERE status = 'approved' 
      AND DATE(start_date) <= ?
    `,
      [currentDateString]
    );

    // Update campaigns to 'successful' when the day AFTER end_date is reached and goal is met
    await db.query(
      `
      UPDATE campaigns 
      SET status = 'successful', updated_at = NOW()
      WHERE status = 'active' 
      AND DATE(end_date) < ?
      AND current_amount >= goal_amount
    `,
      [currentDateString]
    );

    // Update campaigns to 'failed' when the day AFTER end_date is reached and goal is not met
    await db.query(
      `
      UPDATE campaigns 
      SET status = 'failed', updated_at = NOW()
      WHERE status = 'active' 
      AND DATE(end_date) < ?
      AND current_amount < goal_amount
    `,
      [currentDateString]
    );

    // Get counts of updated campaigns
    const activeCount = await db.query(
      `
      SELECT COUNT(*) as count FROM campaigns 
      WHERE status = 'active' AND DATE(start_date) = ?
    `,
      [currentDateString]
    );

    const completedCount = await db.query(
      `
      SELECT COUNT(*) as count FROM campaigns 
      WHERE (status = 'successful' OR status = 'failed') 
      AND DATE(end_date) = DATE_SUB(?, INTERVAL 1 DAY)
    `,
      [currentDateString]
    );

    return NextResponse.json({
      success: true,
      message: 'Campaign statuses updated successfully',
      updates: {
        activatedToday: Array.isArray(activeCount)
          ? (activeCount[0] as any).count
          : 0,
        completedYesterday: Array.isArray(completedCount)
          ? (completedCount[0] as any).count
          : 0,
      },
    });
  } catch (error) {
    console.error('Error updating campaign statuses:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get campaigns that need status updates
    const currentDate = new Date().toISOString().split('T')[0];

    const campaignsToActivate = await db.query(
      `
      SELECT id, title, start_date 
      FROM campaigns 
      WHERE status = 'approved' 
      AND DATE(start_date) <= ?
    `,
      [currentDate]
    );

    // Show campaigns that will complete the day AFTER their end_date
    const campaignsToComplete = await db.query(
      `
      SELECT id, title, end_date, current_amount, goal_amount,
             CASE 
               WHEN current_amount >= goal_amount THEN 'successful'
               ELSE 'failed'
             END as new_status
      FROM campaigns 
      WHERE status = 'active' 
      AND DATE(end_date) < ?
    `,
      [currentDate]
    );

    return NextResponse.json({
      campaignsToActivate,
      campaignsToComplete,
      totalPending:
        (Array.isArray(campaignsToActivate) ? campaignsToActivate.length : 0) +
        (Array.isArray(campaignsToComplete) ? campaignsToComplete.length : 0),
    });
  } catch (error) {
    console.error('Error fetching campaigns for status update:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
