import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export async function GET(request: NextRequest) {
  try {
    // Get total messages count
    const totalResult = (await db.query(
      'SELECT COUNT(*) as count FROM contact_us'
    )) as RowDataPacket[];
    const total = Array.isArray(totalResult) ? totalResult[0].count : 0;

    // Get new messages count
    const newResult = (await db.query(
      'SELECT COUNT(*) as count FROM contact_us WHERE status = ?',
      ['new']
    )) as RowDataPacket[];
    const newCount = Array.isArray(newResult) ? newResult[0].count : 0;

    // Get in progress messages count
    const inProgressResult = (await db.query(
      'SELECT COUNT(*) as count FROM contact_us WHERE status = ?',
      ['in progress']
    )) as RowDataPacket[];
    const inProgressCount = Array.isArray(inProgressResult)
      ? inProgressResult[0].count
      : 0;

    // Get resolved messages count
    const resolvedResult = (await db.query(
      'SELECT COUNT(*) as count FROM contact_us WHERE status = ?',
      ['resolved']
    )) as RowDataPacket[];
    const resolvedCount = Array.isArray(resolvedResult)
      ? resolvedResult[0].count
      : 0;

    return NextResponse.json({
      total,
      new: newCount,
      inProgress: inProgressCount,
      resolved: resolvedCount,
    });
  } catch (error) {
    console.error('Error fetching message stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
