import { NextRequest, NextResponse } from 'next/server';
import { queryService } from '../../../../database';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const campaignId = parseInt(id);

    if (isNaN(campaignId)) {
      return NextResponse.json(
        { error: 'Invalid campaign ID' },
        { status: 400 }
      );
    }

    console.log('Fetching campaign details for ID:', campaignId);

    // Test database connection
    try {
      await queryService.customQuery('SELECT 1 as test');
    } catch (dbError) {
      console.error('Database connection failed:', dbError);
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    // Fetch campaign details with creator information
    const campaignQuery = `
      SELECT 
        c.*,
        CONCAT(u.first_name, ' ', u.last_name) as creator_name,
        u.email as creator_email
      FROM campaigns c
      JOIN users u ON c.user_id = u.id
      WHERE c.id = ${campaignId}
    `;

    const campaigns = await queryService.customQuery(campaignQuery);

    if (!campaigns || !Array.isArray(campaigns) || campaigns.length === 0) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    const campaign = campaigns[0];

    // Fetch recent donations from database
    const donationsQuery = `
      SELECT 
        d.id,
        d.amount,
        d.message,
        d.anonymous,
        d.created_at as date,
        CONCAT(u.first_name, ' ', u.last_name) as donor_name
      FROM donations d
      LEFT JOIN users u ON d.user_id = u.id
      WHERE d.campaign_id = ${campaignId} AND d.payment_status = 'completed'
      ORDER BY d.created_at DESC
      LIMIT 10
    `;

    const donations = await queryService.customQuery(donationsQuery);

    // Format donations for frontend
    const recentDonations = Array.isArray(donations)
      ? donations.map((donation: any) => ({
          id: donation.id.toString(),
          donorName: donation.anonymous ? 'Anonymous' : donation.donor_name,
          amount: parseFloat(donation.amount),
          message: donation.message || '',
          date: donation.date,
          anonymous: donation.anonymous === 1,
        }))
      : [];

    // Fetch Q&A from comments table (top-level comments only, parent_id is null for questions)
    const questionsQuery = `
      SELECT 
        c.id,
        c.content as question,
        c.created_at as date_asked,
        CONCAT(u.first_name, ' ', u.last_name) as asker_name,
        u.id as asker_id
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.campaign_id = ${campaignId} AND c.parent_id IS NULL AND c.is_active = 1
      ORDER BY c.created_at DESC
    `;

    const questionsData = await queryService.customQuery(questionsQuery);

    // Fetch answers for each question
    const questions = Array.isArray(questionsData)
      ? await Promise.all(
          questionsData.map(async (question: any) => {
            const answersQuery = `
          SELECT 
            c.content as answer,
            c.created_at as date_answered,
            CONCAT(u.first_name, ' ', u.last_name) as answerer_name
          FROM comments c
          LEFT JOIN users u ON c.user_id = u.id
          WHERE c.parent_id = ${question.id} AND c.is_active = 1
          ORDER BY c.created_at ASC
          LIMIT 1
        `;

            const answers = await queryService.customQuery(answersQuery);
            const answer =
              Array.isArray(answers) && answers.length > 0 ? answers[0] : null;

            return {
              id: question.id.toString(),
              question: question.question,
              answer:
                answer && typeof answer === 'object' && 'answer' in answer
                  ? (answer as any).answer
                  : null,
              askerName: question.asker_name || 'Anonymous',
              dateAsked: question.date_asked,
              dateAnswered:
                answer &&
                typeof answer === 'object' &&
                'date_answered' in answer
                  ? (answer as any).date_answered
                  : null,
              anonymous: !question.asker_name, // Anonymous if no user name
            };
          })
        )
      : [];

    return NextResponse.json(
      {
        campaign,
        recentDonations,
        questions,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Get campaign details error:', error);

    return NextResponse.json(
      { error: 'Failed to fetch campaign details', details: error.message },
      { status: 500 }
    );
  }
}
