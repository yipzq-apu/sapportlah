import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const role = searchParams.get('role');
    const status = searchParams.get('status');

    let query = `
      SELECT 
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        u.role,
        u.status,
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
      WHERE 1=1
    `;

    const params: any[] = [];

    // Add search filter
    if (search && search.trim()) {
      query += ` AND (u.first_name LIKE ? OR u.last_name LIKE ? OR u.email LIKE ?)`;
      const searchTerm = `%${search.trim()}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    // Add role filter
    if (role && role !== 'all') {
      query += ` AND u.role = ?`;
      params.push(role);
    }

    // Add status filter
    if (status && status !== 'all') {
      query += ` AND u.status = ?`;
      params.push(status);
    }

    query += ` ORDER BY u.created_at DESC`;

    const users = await db.query(query, params);

    return NextResponse.json({
      users,
      total: Array.isArray(users) ? users.length : 0,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { first_name, last_name, email, phone, role } = await request.json();

    // Validate required fields
    if (!first_name || !last_name || !email || !role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await db.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (Array.isArray(existingUser) && existingUser.length > 0) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Generate temporary password
    const tempPassword = Math.random().toString(36).slice(-8) + 'A1!';
    const hashedPassword = await bcrypt.hash(tempPassword, 12);

    // Insert new user
    const result = await db.query(
      `INSERT INTO users (
        email, password, first_name, last_name, phone, role, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, 'active', NOW(), NOW())`,
      [email, hashedPassword, first_name, last_name, phone, role]
    );

    // In production, send email with temporary password
    console.log(`Temporary password for ${email}: ${tempPassword}`);

    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      tempPassword, // Remove this in production
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
