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

    const users = await db.query(
      `SELECT 
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        u.date_of_birth,
        u.ic_passport_number,
        u.ic_passport_type,
        u.address,
        u.role,
        u.status,
        u.rejection_reason,
        u.created_at,
        u.updated_at,
        COALESCE(d.total_donations, 0) as total_donations,
        COALESCE(c.campaigns_created, 0) as campaigns_created
      FROM users u
      LEFT JOIN (
        SELECT user_id, SUM(amount) as total_donations
        FROM donations 
        WHERE payment_status = 'completed'
        GROUP BY user_id
      ) d ON u.id = d.user_id
      LEFT JOIN (
        SELECT user_id, COUNT(*) as campaigns_created
        FROM campaigns
        GROUP BY user_id
      ) c ON u.id = c.user_id
      WHERE u.id = ?`,
      [id]
    );

    if (!Array.isArray(users) || users.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user: users[0] });
  } catch (error) {
    console.error('Error fetching user:', error);
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
    const { status, rejection_reason } = await request.json();

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ['active', 'suspended', 'pending', 'rejected'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // Check if user exists and get user details
    const existingUser = await db.query(
      'SELECT id, status, email, first_name, last_name FROM users WHERE id = ?',
      [id]
    );

    if (!Array.isArray(existingUser) || existingUser.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = existingUser[0] as any;

    // Update user status
    let updateQuery = 'UPDATE users SET status = ?, updated_at = NOW()';
    let updateParams = [status];

    // Add rejection reason if status is rejected
    if (status === 'rejected' && rejection_reason) {
      updateQuery += ', rejection_reason = ?';
      updateParams.push(rejection_reason);
    } else if (status !== 'rejected') {
      updateQuery += ', rejection_reason = NULL';
    }

    updateQuery += ' WHERE id = ?';
    updateParams.push(id);

    await db.query(updateQuery, updateParams);

    // Send email notification if status is rejected
    if (status === 'rejected' && user.email) {
      try {
        await resend.emails.send({
          from: 'SapportLah <onboarding@resend.dev>',
          to: [user.email],
          subject: 'Application Status Update - SapportLah',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #dc2626;">Application Rejected</h2>
              
              <p>Dear ${user.first_name} ${user.last_name},</p>
              
              <p>We regret to inform you that your application to join SapportLah has been rejected.</p>
              
              <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; margin: 16px 0;">
                <h3 style="color: #dc2626; margin: 0 0 8px 0;">Reason for rejection:</h3>
                <p style="margin: 0; color: #991b1b;">${
                  rejection_reason || 'No specific reason provided.'
                }</p>
              </div>
              
              <p>If you believe this decision was made in error or if you have additional information to provide, you can:</p>
              
              <ul>
                <li>Update your application with the correct information</li>
                <li>Contact our support team for clarification</li>
              </ul>
              
              <div style="background-color: #f3f4f6; border-radius: 8px; padding: 16px; margin: 16px 0;">
                <p style="margin: 0;"><strong>Need help?</strong></p>
                <p style="margin: 8px 0 0 0;">Contact us at <a href="mailto:support@sapportlah.com">support@sapportlah.com</a></p>
              </div>
              
              <p>Thank you for your interest in SapportLah.</p>
              
              <p>Best regards,<br>
              The SapportLah Team</p>
              
              <hr style="margin: 32px 0; border: none; border-top: 1px solid #e5e7eb;">
              <p style="font-size: 12px; color: #6b7280;">
                This is an automated message. Please do not reply to this email.
              </p>
            </div>
          `,
        });

        console.log(`Rejection email sent to ${user.email}`);
      } catch (emailError) {
        console.error('Error sending rejection email:', emailError);
        // Don't fail the request if email fails
      }
    }

    // Fetch updated user data
    const updatedUser = await db.query(
      `SELECT 
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        u.role,
        u.status,
        u.rejection_reason,
        u.created_at,
        u.updated_at,
        COALESCE(d.total_donations, 0) as total_donations,
        COALESCE(c.campaigns_created, 0) as campaigns_created
      FROM users u
      LEFT JOIN (
        SELECT user_id, SUM(amount) as total_donations
        FROM donations 
        WHERE payment_status = 'completed'
        GROUP BY user_id
      ) d ON u.id = d.user_id
      LEFT JOIN (
        SELECT user_id, COUNT(*) as campaigns_created
        FROM campaigns
        GROUP BY user_id
      ) c ON u.id = c.user_id
      WHERE u.id = ?`,
      [id]
    );

    return NextResponse.json({
      success: true,
      message: `User status updated to ${status}`,
      user: Array.isArray(updatedUser) ? updatedUser[0] : updatedUser,
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
