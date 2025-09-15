import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '@/lib/db'; // Adjust import path based on your database setup

export async function POST(request: NextRequest) {
  try {
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
      organizationName,
      supportingDocument,
    } = await request.json();

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

    // Validate age (must be 18 or older)
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    if (age < 18) {
      return NextResponse.json(
        { error: 'You must be at least 18 years old to register' },
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

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Insert new user with pending status using correct column names
    const result = await db.query(
      `INSERT INTO users (first_name, last_name, email, phone, date_of_birth, ic_passport_type, ic_passport_number, address, password, role, organization_name, supporting_document, status, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW(), NOW())`,
      [
        firstName,
        lastName,
        email,
        phone || null,
        dateOfBirth,
        idType,
        idNumber,
        address,
        hashedPassword,
        role,
        organizationName || null,
        supportingDocument || null,
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
