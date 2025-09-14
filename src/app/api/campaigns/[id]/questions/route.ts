import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { RowDataPacket } from 'mysql2';

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

    // Fetch questions (parent comments) and their answers (child comments)
    const questions = (await db.query(
      `SELECT 
        q.id,
        q.content as question,
        q.created_at as date_asked,
        q.anonymous,
        CASE 
          WHEN q.anonymous = 1 THEN 'Anonymous'
          ELSE CONCAT(qu.first_name, ' ', qu.last_name)
        END as asker_name,
        a.content as answer,
        a.created_at as date_answered
      FROM comments q
      LEFT JOIN users qu ON q.user_id = qu.id
      LEFT JOIN comments a ON a.parent_id = q.id
      WHERE q.campaign_id = ? AND q.parent_id IS NULL
      ORDER BY q.created_at DESC`,
      [campaignId]
    )) as RowDataPacket[];

    // Format questions for frontend
    const formattedQuestions = questions.map((q) => ({
      id: q.id.toString(),
      question: q.question,
      answer: q.answer || null,
      askerName: q.asker_name,
      dateAsked: q.date_asked,
      dateAnswered: q.date_answered || null,
      anonymous: q.anonymous === 1,
    }));

    return NextResponse.json({
      questions: formattedQuestions,
    });
  } catch (error) {
    console.error('Error fetching questions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch questions' },
      { status: 500 }
    );
  }
}

export async function POST(
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

    const body = await request.json();
    const { question, userId, anonymous } = body;

    // Validate required fields
    if (!question || !question.trim()) {
      return NextResponse.json(
        { error: 'Question is required' },
        { status: 400 }
      );
    }

    // Insert question into comments table
    await db.query(
      `INSERT INTO comments (
        user_id,
        campaign_id,
        parent_id,
        content,
        anonymous,
        created_at
      ) VALUES (?, ?, NULL, ?, ?, NOW())`,
      [userId, campaignId, question.trim(), anonymous ? 1 : 0]
    );

    return NextResponse.json(
      { message: 'Question submitted successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error submitting question:', error);
    return NextResponse.json(
      { error: 'Failed to submit question' },
      { status: 500 }
    );
  }
}
