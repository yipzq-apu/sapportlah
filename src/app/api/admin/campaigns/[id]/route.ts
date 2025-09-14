import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const campaigns = await db.query(
      `SELECT 
        c.*,
        cat.name as category_name,
        CONCAT(u.first_name, ' ', u.last_name) as creator_name,
        u.email as creator_email,
        u.first_name,
        u.last_name
      FROM campaigns c
      LEFT JOIN categories cat ON c.category_id = cat.id
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.id = ?`,
      [id]
    );

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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { status, reason, reviewedBy } = await request.json();

    // Validate required fields
    if (!status || !['approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be "approved" or "rejected"' },
        { status: 400 }
      );
    }

    if (status === 'rejected' && !reason) {
      return NextResponse.json(
        { error: 'Reason is required for rejection' },
        { status: 400 }
      );
    }

    // Get campaign details first
    const campaigns = await db.query(
      `SELECT 
        c.*,
        u.email as creator_email,
        u.first_name,
        u.last_name
      FROM campaigns c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.id = ?`,
      [id]
    );

    if (!Array.isArray(campaigns) || campaigns.length === 0) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    const campaign = campaigns[0] as any;

    // Update campaign status - only update fields that exist in your table
    const updateQuery =
      status === 'rejected'
        ? 'UPDATE campaigns SET status = ?, reason = ?, updated_at = NOW() WHERE id = ?'
        : 'UPDATE campaigns SET status = ?, reason = NULL, updated_at = NOW() WHERE id = ?';

    const updateParams = [status, status === 'rejected' ? reason : null, id];

    await db.query(updateQuery, updateParams);

    // Send email notification to campaign creator
    try {
      const isApproved = status === 'approved';
      const emailSubject = isApproved
        ? `Great news! Your campaign "${campaign.title}" has been approved!`
        : `Update needed for your campaign "${campaign.title}"`;

      await resend.emails.send({
        from: 'SapportLah Team <onboarding@resend.dev>',
        to: campaign.creator_email,
        subject: emailSubject,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: ${isApproved ? '#059669' : '#dc2626'};">
              ${
                isApproved
                  ? '🎉 Campaign Approved!'
                  : '📝 Campaign Review Update'
              }
            </h2>
            
            <p>Dear ${campaign.first_name} ${campaign.last_name},</p>
            
            ${
              isApproved
                ? `
              <p>Congratulations! Your campaign <strong>"${
                campaign.title
              }"</strong> has been approved by our review team.</p>
              
              <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #059669;">
                <h3 style="margin-top: 0; color: #059669;">What happens next?</h3>
                <ul style="color: #374151;">
                  <li>Your campaign will go live on the scheduled start date</li>
                  <li>You can start sharing your campaign with potential supporters</li>
                  <li>You'll be able to post updates and answer questions from backers</li>
                  <li>Track your progress through your creator dashboard</li>
                </ul>
              </div>
              
              <p>
                <a href="${
                  process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
                }/campaigns/${id}" 
                   style="background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  View Your Campaign
                </a>
              </p>
            `
                : `
              <p>Your campaign <strong>"${
                campaign.title
              }"</strong> has been reviewed and requires some updates before it can be approved.</p>
              
              <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
                <h3 style="margin-top: 0; color: #dc2626;">Review Feedback:</h3>
                <p style="color: #374151; font-style: italic;">"${reason}"</p>
              </div>
              
              <div style="background-color: #eff6ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h4 style="margin-top: 0; color: #1d4ed8;">Next Steps:</h4>
                <ol style="color: #374151;">
                  <li>Review the feedback provided above</li>
                  <li>Make the necessary changes to your campaign</li>
                  <li>Resubmit your campaign for review</li>
                </ol>
              </div>
              
              <p>
                <a href="${
                  process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
                }/campaigns/${id}/edit" 
                   style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  Edit Your Campaign
                </a>
              </p>
            `
            }
            
            <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
            
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
        `Campaign ${status} email sent to: ${campaign.creator_email}`
      );
    } catch (emailError) {
      console.error('Failed to send campaign status email:', emailError);
      // Don't fail the status update if email fails
    }

    // Fetch updated campaign data
    const updatedCampaigns = await db.query(
      `SELECT 
        c.*,
        cat.name as category_name,
        CONCAT(u.first_name, ' ', u.last_name) as creator_name,
        u.email as creator_email
      FROM campaigns c
      LEFT JOIN categories cat ON c.category_id = cat.id
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.id = ?`,
      [id]
    );

    return NextResponse.json({
      success: true,
      message: `Campaign ${status} successfully`,
      campaign: (updatedCampaigns as any[])[0],
    });
  } catch (error) {
    console.error('Error updating campaign status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
