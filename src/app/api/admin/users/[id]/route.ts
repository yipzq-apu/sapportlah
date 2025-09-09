import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

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
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
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

    // Check if user exists
    const existingUser = await db.query(
      'SELECT id, status FROM users WHERE id = ?',
      [id]
    );

    if (!Array.isArray(existingUser) || existingUser.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

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
