import { NextRequest, NextResponse } from 'next/server';
import { queryService } from '../../../../../database';

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

    // Fetch questions (top-level comments) from database
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
    const questions = await Promise.all(
      (Array.isArray(questionsData) ? questionsData : []).map(
        async (question: any) => {
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
            Array.isArray(answers) && answers.length > 0
              ? (answers[0] as any)
              : null;

          return {
            id: question.id.toString(),
            question: question.question,
            answer: answer ? answer.answer : null,
            askerName: question.asker_name || 'Anonymous',
            dateAsked: question.date_asked,
            dateAnswered: answer ? answer.date_answered : null,
            anonymous: !question.asker_name,
          };
        }
      )
    );

    return NextResponse.json({ questions }, { status: 200 });
  } catch (error: any) {
    console.error('Get questions error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch questions', details: error.message },
      { status: 500 }
    );
  }
}

// POST endpoint to submit new questions
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const campaignId = parseInt(id);
    const body = await request.json();

    if (isNaN(campaignId)) {
      return NextResponse.json(
        { error: 'Invalid campaign ID' },
        { status: 400 }
      );
    }

    const { question, userId, anonymous } = body;

    if (!question?.trim()) {
      return NextResponse.json(
        { error: 'Question is required' },
        { status: 400 }
      );
    }

    // Insert new question into comments table
    const insertQuery = `
      INSERT INTO comments (user_id, campaign_id, parent_id, content, is_active, created_at)
      VALUES (${
        anonymous ? 'NULL' : userId
      }, ${campaignId}, NULL, '${question.replace(/'/g, "''")}', 1, NOW())
    `;

    await queryService.customQuery(insertQuery);

    return NextResponse.json(
      { message: 'Question submitted successfully' },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Submit question error:', error);
    return NextResponse.json(
      { error: 'Failed to submit question', details: error.message },
      { status: 500 }
    );
  }
}
