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
      'SELECT id FROM users WHERE email = ? OR ic_passport_number = ?',
      [email, idNumber]
    );

    if (Array.isArray(existingUser) && existingUser.length > 0) {
      return NextResponse.json(
        { error: 'User with this email or ID number already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert user into database
    const result = (await db.query(
      `INSERT INTO users (
        email, 
        password, 
        first_name, 
        last_name, 
        phone, 
        date_of_birth, 
        ic_passport_number, 
        ic_passport_type, 
        address, 
        role,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
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
    )) as any;

    const insertId = result.insertId || result[0]?.insertId;

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: insertId,
        email: email,
        role: role,
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    return NextResponse.json(
      {
        message: 'User registered successfully',
        token: token,
        user: {
          id: insertId,
          email: email,
          firstName: firstName,
          lastName: lastName,
          role: role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);

    // Handle specific database errors
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      error.code === 'ER_DUP_ENTRY'
    ) {
      return NextResponse.json(
        { error: 'User with this email or ID number already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
