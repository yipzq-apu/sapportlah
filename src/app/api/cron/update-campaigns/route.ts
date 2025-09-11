import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized access
    const cronSecret = request.headers.get('authorization');
    if (cronSecret !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentDate = new Date();
    const currentDateString = currentDate.toISOString().split('T')[0];

    console.log(
      `[CRON] Starting campaign status update for ${currentDateString}`
    );

    // Update campaigns to 'active' when start_date is reached
    const activatedResult = await db.query(
      `
      UPDATE campaigns 
      SET status = 'active', updated_at = NOW()
      WHERE status = 'approved' 
      AND DATE(start_date) <= ?
    `,
      [currentDateString]
    );

    // Update campaigns to 'successful' when the day AFTER end_date is reached and goal is met
    const successfulResult = await db.query(
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
    const failedResult = await db.query(
      `
      UPDATE campaigns 
      SET status = 'failed', updated_at = NOW()
      WHERE status = 'active' 
      AND DATE(end_date) < ?
      AND current_amount < goal_amount
    `,
      [currentDateString]
    );

    const updates = {
      activated: (activatedResult as any).affectedRows || 0,
      successful: (successfulResult as any).affectedRows || 0,
      failed: (failedResult as any).affectedRows || 0,
    };

    console.log(`[CRON] Campaign status update completed:`, updates);

    return NextResponse.json({
      success: true,
      timestamp: currentDate.toISOString(),
      updates,
    });
  } catch (error) {
    console.error('[CRON] Error updating campaign statuses:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
