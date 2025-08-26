import { NextRequest, NextResponse } from 'next/server';
import { queryService } from '../../../database';

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
        { error: 'Please provide a valid email address' },
        { status: 400 }
      );
    }

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

    // Escape single quotes for SQL
    const escapedName = name.replace(/'/g, "''");
    const escapedEmail = email.replace(/'/g, "''");
    const escapedMessage = message.replace(/'/g, "''");

    // Insert contact message into database
    const insertQuery = `
      INSERT INTO contact_us (name, email, message, status, created_at)
      VALUES ('${escapedName}', '${escapedEmail}', '${escapedMessage}', 'new', NOW())
    `;

    await queryService.customQuery(insertQuery);

    console.log('Contact message submitted:', { name, email });

    return NextResponse.json(
      { message: 'Thank you for your message! We will get back to you soon.' },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Contact form submission error:', error);

    return NextResponse.json(
      { error: 'Failed to submit message. Please try again.' },
      { status: 500 }
    );
  }
}
