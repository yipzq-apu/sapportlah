import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, message } = body;

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate message length
    if (message.length < 10) {
      return NextResponse.json(
        { error: 'Message must be at least 10 characters long' },
        { status: 400 }
      );
    }

    // Insert contact message into database
    await db.query(
      `INSERT INTO contact_us (
        name, 
        email, 
        message, 
        status, 
        created_at, 
        updated_at
      ) VALUES (?, ?, ?, 'new', NOW(), NOW())`,
      [name, email, message]
    );

    return NextResponse.json(
      { message: 'Thank you for your message! We will get back to you soon.' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Failed to send message. Please try again.' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // Build query conditions
    let whereClause = '';
    let queryParams: any[] = [];

    if (status) {
      whereClause = 'WHERE status = ?';
      queryParams.push(status);
    }

    // Fetch contact messages
    const contacts = (await db.query(
      `SELECT 
        id, 
        name, 
        email, 
        message, 
        status, 
        created_at 
      FROM contact_us 
      ${whereClause}
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?`,
      [...queryParams, limit, offset]
    )) as RowDataPacket[];

    // Get total count
    const totalResult = (await db.query(
      `SELECT COUNT(*) as total FROM contact_us ${whereClause}`,
      queryParams
    )) as RowDataPacket[];

    const total = totalResult[0].total;

    return NextResponse.json({
      contacts: contacts,
      pagination: {
        current_page: page,
        total_pages: Math.ceil(total / limit),
        total_contacts: total,
        has_next: page < Math.ceil(total / limit),
        has_prev: page > 1,
      },
    });
  } catch (error) {
    console.error('Error fetching contact messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contact messages' },
      { status: 500 }
    );
  }
}
