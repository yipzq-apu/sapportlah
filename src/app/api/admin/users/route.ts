import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

function generatePassword(length = 12) {
  const charset =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}

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
        u.organization_name,
        u.supporting_document,
        u.ic_passport_type,
        u.ic_passport_number,
        u.address,
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
    const { first_name, last_name, email, role } = await request.json();

    // Validate required fields (password is no longer required from admin)
    if (!first_name || !last_name || !email || !role) {
      return NextResponse.json(
        { error: 'First name, last name, email, and role are required' },
        { status: 400 }
      );
    }

    // Validate role
    if (!['donor', 'creator', 'admin'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role specified' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUsers = await db.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (Array.isArray(existingUsers) && existingUsers.length > 0) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Generate a secure random password
    const generatedPassword = generatePassword(12);

    // Hash password
    const hashedPassword = await bcrypt.hash(generatedPassword, 12);

    // Create user
    const result = await db.query(
      `INSERT INTO users (first_name, last_name, email, password, role, status, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, 'active', NOW(), NOW())`,
      [first_name, last_name, email, hashedPassword, role]
    );

    // Send welcome email with login credentials
    try {
      await resend.emails.send({
        from: 'SapportLah Admin <onboarding@resend.dev>',
        to: email,
        subject: 'Welcome to SapportLah - Your Account Has Been Created',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Welcome to SapportLah!</h2>
            
            <p>Dear ${first_name} ${last_name},</p>
            
            <p>Your account has been successfully created by our admin team. Here are your login credentials:</p>
            
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #374151;">Login Credentials</h3>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Temporary Password:</strong> <code style="background-color: #e5e7eb; padding: 2px 6px; border-radius: 4px; font-family: monospace;">${generatedPassword}</code></p>
              <p><strong>Role:</strong> ${
                role.charAt(0).toUpperCase() + role.slice(1)
              }</p>
            </div>
            
            <p style="color: #dc2626; font-weight: bold;">⚠️ Important Security Notice:</p>
            <ul style="color: #374151;">
              <li><strong>You must change your password immediately after your first login</strong></li>
              <li>This is a temporary password generated by our system</li>
              <li>Keep your login credentials secure and do not share them</li>
              <li>Use a strong, unique password when changing from the temporary one</li>
            </ul>
            
            <div style="background-color: #eff6ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h4 style="margin-top: 0; color: #1d4ed8;">Getting Started</h4>
              <p style="margin-bottom: 0;">You can now log in to your SapportLah account and start ${
                role === 'creator'
                  ? 'creating fundraising campaigns'
                  : role === 'donor'
                  ? 'supporting amazing campaigns'
                  : 'managing the platform'
              }.</p>
            </div>
            
            <p>
              <a href="${
                process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
              }/login" 
                 style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Login to Your Account
              </a>
            </p>
            
            <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            
            <p style="color: #6b7280; font-size: 14px;">
              Best regards,<br>
              The SapportLah Team
            </p>
            
            <p style="color: #9ca3af; font-size: 12px;">
              This is an automated message. Please do not reply to this email.<br>
              For security reasons, this temporary password will expire after first use or 7 days.
            </p>
          </div>
        `,
      });

      console.log(`Welcome email with temporary password sent to: ${email}`);
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Don't fail the user creation if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'User created successfully with auto-generated password',
      user: {
        id: (result as any).insertId,
        first_name,
        last_name,
        email,
        role,
        status: 'active',
        passwordGenerated: true,
      },
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ...existing PUT and DELETE functions...
