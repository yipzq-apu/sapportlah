import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { RowDataPacket } from 'mysql2';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; questionId: string }> }
) {
  try {
    const { id, questionId } = await params;
    const campaignId = parseInt(id);
    const body = await request.json();
    const { answer, creatorId } = body;

    if (isNaN(campaignId) || !questionId) {
      return NextResponse.json(
        { error: 'Invalid campaign ID or question ID' },
        { status: 400 }
      );
    }

    if (!answer || !answer.trim()) {
      return NextResponse.json(
        { error: 'Answer is required' },
        { status: 400 }
      );
    }

    if (!creatorId) {
      return NextResponse.json(
        { error: 'Creator ID is required' },
        { status: 400 }
      );
    }

    // Verify that the user is the creator of the campaign
    const campaigns = (await db.query(
      'SELECT user_id FROM campaigns WHERE id = ?',
      [campaignId]
    )) as RowDataPacket[];

    if (campaigns.length === 0) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    // Get campaign and question details for email notification
    const campaignData = (await db.query(
      `SELECT 
        c.title as campaign_title,
        c.user_id as creator_id,
        u.first_name as creator_first_name,
        u.last_name as creator_last_name
      FROM campaigns c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.id = ?`,
      [campaignId]
    )) as RowDataPacket[];

    if (campaignData.length === 0) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    const campaign = campaignData[0];

    if (campaign.creator_id != creatorId) {
      return NextResponse.json(
        { error: 'Only the campaign creator can answer questions' },
        { status: 403 }
      );
    }

    // Get question details and asker information
    const questionData = (await db.query(
      `SELECT 
        c.content as question_content,
        c.user_id as asker_id,
        c.anonymous,
        u.email as asker_email,
        u.first_name as asker_first_name,
        u.last_name as asker_last_name,
        u.notifications
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.id = ? AND c.campaign_id = ? AND c.parent_id IS NULL`,
      [questionId, campaignId]
    )) as RowDataPacket[];

    if (questionData.length === 0) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      );
    }

    const questionDetails = questionData[0];

    // Insert the answer as a child comment
    await db.query(
      `INSERT INTO comments (
        user_id,
        campaign_id,
        parent_id,
        content,
        anonymous,
        created_at
      ) VALUES (?, ?, ?, ?, 0, NOW())`,
      [creatorId, campaignId, questionId, answer.trim()]
    );

    // Send email notification to question asker if notifications are enabled
    if (
      questionDetails.notifications === 1 &&
      !questionDetails.anonymous &&
      questionDetails.asker_email
    ) {
      try {
        await resend.emails.send({
          from: 'SapportLah Team <onboarding@resend.dev>',
          to: questionDetails.asker_email,
          subject: `Your question about "${campaign.campaign_title}" has been answered!`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #059669;">🎉 Your Question Has Been Answered!</h2>
              
              <p>Dear ${questionDetails.asker_first_name} ${
            questionDetails.asker_last_name
          },</p>
              
              <p>Great news! The creator of <strong>"${
                campaign.campaign_title
              }"</strong> has answered your question.</p>
              
              <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #6b7280;">
                <h3 style="margin-top: 0; color: #374151; font-size: 16px;">Your Question:</h3>
                <p style="color: #4b5563; font-style: italic; margin-bottom: 0;">"${
                  questionDetails.question_content
                }"</p>
              </div>
              
              <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #059669;">
                <h3 style="margin-top: 0; color: #059669; font-size: 16px;">Answer:</h3>
                <p style="color: #374151; margin-bottom: 0;">"${answer.trim()}"</p>
              </div>
              
              <p>
                <a href="${
                  process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
                }/campaigns/${campaignId}" 
                   style="background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  View Campaign & Discussion
                </a>
              </p>
              
              <p>Thank you for your interest in this campaign!</p>
              
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
              
              <p style="color: #6b7280; font-size: 14px;">
                Best regards,<br>
                The SapportLah Team
              </p>
              
              <p style="color: #9ca3af; font-size: 12px;">
                This is an automated message. You can disable these notifications in your account settings.
              </p>
            </div>
          `,
        });

        console.log(
          `Question answer notification email sent to: ${questionDetails.asker_email}`
        );
      } catch (emailError) {
        console.error(
          'Failed to send question answer notification email:',
          emailError
        );
        // Don't fail the answer posting if email fails
      }
    }

    return NextResponse.json({
      message: 'Answer posted successfully',
    });
  } catch (error) {
    console.error('Error posting answer:', error);
    return NextResponse.json(
      { error: 'Failed to post answer' },
      { status: 500 }
    );
  }
}
