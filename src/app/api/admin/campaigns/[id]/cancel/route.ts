import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: campaignId } = await params;

    // Get campaign details
    const campaigns = await db.query(
      `SELECT 
        c.*,
        u.email as creator_email,
        u.first_name,
        u.last_name
      FROM campaigns c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.id = ?`,
      [campaignId]
    );

    if (!Array.isArray(campaigns) || campaigns.length === 0) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    const campaign = campaigns[0] as any;

    // Check if campaign can be cancelled (only active campaigns)
    if (campaign.status !== 'active') {
      return NextResponse.json(
        { error: 'Only active campaigns can be cancelled' },
        { status: 400 }
      );
    }

    // Update campaign status to cancelled
    await db.query(
      'UPDATE campaigns SET status = ?, updated_at = NOW() WHERE id = ?',
      ['cancelled', campaignId]
    );

    // Send cancellation email to campaign creator
    try {
      await resend.emails.send({
        from: 'SapportLah Team <admin@sapportlah.com>',
        to: campaign.creator_email,
        subject: `Your campaign "${campaign.title}" has been cancelled`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #dc2626;">Campaign Cancelled</h2>
            
            <p>Dear ${campaign.first_name} ${campaign.last_name},</p>
            
            <p>We regret to inform you that your campaign <strong>"${campaign.title}"</strong> has been cancelled by our administration team.</p>
            
            <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
              <h3 style="margin-top: 0; color: #dc2626;">What this means:</h3>
              <ul style="color: #374151;">
                <li>Your campaign is no longer accepting donations</li>
                <li>The campaign page will show as cancelled</li>
                <li>If you have any questions, please contact our support team</li>
              </ul>
            </div>
            
            <p>If you believe this cancellation was made in error or if you have any questions, please don't hesitate to contact our support team.</p>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            
            <p style="color: #6b7280; font-size: 14px;">
              Best regards,<br>
              The SapportLah Team
            </p>
            
            <p style="color: #9ca3af; font-size: 12px;">
              This is an automated message. Please do not reply to this email.
            </p>
          </div>
        `,
      });

      console.log(
        `Campaign cancellation email sent to: ${campaign.creator_email}`
      );
    } catch (emailError) {
      console.error('Failed to send campaign cancellation email:', emailError);
      // Don't fail the cancellation if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Campaign cancelled successfully',
    });
  } catch (error) {
    console.error('Error cancelling campaign:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
