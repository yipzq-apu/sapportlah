import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '@/lib/db'; // Adjust import path based on your database setup

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      idType,
      idNumber,
      address,
      password,
      role,
    } = body;

    // Validate required fields
    if (
      !firstName ||
      !lastName ||
      !email ||
      !phone ||
      !dateOfBirth ||
      !idType ||
      !idNumber ||
      !address ||
      !password ||
      !role
    ) {
      return NextResponse.json(
        { error: 'All fields are required' },
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

    // Validate role
    if (!['donor', 'creator'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    // Validate ID type
    if (!['ic', 'passport'].includes(idType)) {
      return NextResponse.json({ error: 'Invalid ID type' }, { status: 400 });
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

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Insert new user with pending status
    await db.query(
      `INSERT INTO users (
        email, password, first_name, last_name, phone, date_of_birth,
        ic_passport_number, ic_passport_type, address, role, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW(), NOW())`,
      [
        email,
        hashedPassword,
        firstName,
        lastName,
        phone,
        dateOfBirth,
        idNumber,
        idType,
        address,
        role,
      ]
    );

    return NextResponse.json({
      success: true,
      message: 'Registration successful. Your account is pending approval.',
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
