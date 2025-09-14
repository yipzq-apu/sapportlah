import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const messages = await db.query(
      `SELECT 
        id,
        name,
        email,
        message,
        status,
        created_at,
        updated_at
      FROM contact_us 
      WHERE id = ?`,
      [id]
    );

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    return NextResponse.json({ message: messages[0] });
  } catch (error) {
    console.error('Error fetching message:', error);
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
    const { status } = await request.json();

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ['new', 'in progress', 'resolved'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // Check if message exists
    const existingMessage = await db.query(
      'SELECT id FROM contact_us WHERE id = ?',
      [id]
    );

    if (!Array.isArray(existingMessage) || existingMessage.length === 0) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    // Update message status
    await db.query(
      'UPDATE contact_us SET status = ?, updated_at = NOW() WHERE id = ?',
      [status, id]
    );

    // Fetch updated message
    const updatedMessage = await db.query(
      `SELECT 
        id,
        name,
        email,
        message,
        status,
        created_at,
        updated_at
      FROM contact_us 
      WHERE id = ?`,
      [id]
    );

    return NextResponse.json({
      success: true,
      message: `Message status updated to ${status}`,
      data: Array.isArray(updatedMessage) ? updatedMessage[0] : updatedMessage,
    });
  } catch (error) {
    console.error('Error updating message status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
