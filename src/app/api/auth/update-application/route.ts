import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const {
      email,
      firstName,
      lastName,
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
      !email ||
      !firstName ||
      !lastName ||
      !phone ||
      !dateOfBirth ||
      !idType ||
      !idNumber ||
      !address ||
      !role
    ) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
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

    // Check if user exists
    const existingUser = (await db.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    )) as any[];

    if (!Array.isArray(existingUser) || existingUser.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userId = existingUser[0].id;

    // Prepare update query with correct column names
    let updateQuery = `
      UPDATE users SET 
        first_name = ?, 
        last_name = ?, 
        phone = ?, 
        date_of_birth = ?, 
        ic_passport_type = ?, 
        ic_passport_number = ?, 
        address = ?, 
        role = ?, 
        organization_name = ?, 
        supporting_document = ?, 
        status = 'pending', 
        updated_at = NOW()
    `;

    let queryParams = [
      firstName,
      lastName,
      phone,
      dateOfBirth,
      idType,
      idNumber,
      address,
      role,
      organizationName || null,
      supportingDocument || null,
    ];

    // Add password update if provided
    if (password && password.trim()) {
      const hashedPassword = await bcrypt.hash(password, 12);
      updateQuery += ', password = ?';
      queryParams.push(hashedPassword);
    }

    updateQuery += ' WHERE id = ?';
    queryParams.push(userId);

    await db.query(updateQuery, queryParams);

    return NextResponse.json({
      success: true,
      message: 'Application updated successfully. It will be reviewed again.',
    });
  } catch (error) {
    console.error('Update application error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
