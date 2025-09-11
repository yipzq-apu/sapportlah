import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    // Verify the request is from a legitimate cron service
    const authHeader = request.headers.get('authorization');
    const expectedAuth = `Bearer ${process.env.CRON_SECRET_KEY}`;

    if (authHeader !== expectedAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Starting automated campaign status update...');

    let activatedCount = 0;
    let completedCount = 0;

    // 1. Activate approved campaigns whose start date is today
    const campaignsToActivate = await db.query(
      `SELECT id, title FROM campaigns 
       WHERE status = 'approved' 
       AND DATE(start_date) = CURDATE()`
    );

    if (Array.isArray(campaignsToActivate) && campaignsToActivate.length > 0) {
      for (const campaign of campaignsToActivate) {
        await db.query(
          'UPDATE campaigns SET status = ?, updated_at = NOW() WHERE id = ?',
          ['active', (campaign as any).id]
        );
        activatedCount++;
        console.log(`Activated campaign: ${(campaign as any).title}`);
      }
    }

    // 2. Complete active campaigns whose end date was yesterday
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const campaignsToComplete = await db.query(
      `SELECT id, title, current_amount, goal_amount 
       FROM campaigns 
       WHERE status = 'active' 
       AND DATE(end_date) = ?`,
      [yesterdayStr]
    );

    if (Array.isArray(campaignsToComplete) && campaignsToComplete.length > 0) {
      for (const campaign of campaignsToComplete) {
        const c = campaign as any;
        const newStatus =
          c.current_amount >= c.goal_amount ? 'successful' : 'failed';

        await db.query(
          'UPDATE campaigns SET status = ?, updated_at = NOW() WHERE id = ?',
          [newStatus, c.id]
        );
        completedCount++;
        console.log(`Completed campaign: ${c.title} - Status: ${newStatus}`);
      }
    }

    const logMessage = `Automated status update completed - Activated: ${activatedCount}, Completed: ${completedCount}`;
    console.log(logMessage);

    return NextResponse.json({
      success: true,
      message: logMessage,
      updates: {
        activatedToday: activatedCount,
        completedYesterday: completedCount,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error in automated campaign status update:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
