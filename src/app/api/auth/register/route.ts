import { NextRequest, NextResponse } from 'next/server';
import { queryService } from '../../../../database';
import { hashPassword, generateToken } from '../../../../lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Received registration data:', {
      ...body,
      password: '[HIDDEN]',
    });

    // Validate required fields
    const requiredFields = [
      'email',
      'password',
      'firstName',
      'lastName',
      'phone',
      'dateOfBirth',
      'idNumber',
      'idType',
      'address',
      'role',
    ];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Test database connection
    try {
      console.log('Testing database connection...');
      await queryService.customQuery('SELECT 1 as test');
      console.log('Database connection successful');
    } catch (dbError: any) {
      console.error('Database connection failed:', dbError);

      if (dbError.code === 'ER_BAD_DB_ERROR') {
        return NextResponse.json(
          {
            error: 'Database not found',
            details:
              'Please create the "sapportlah" database in phpMyAdmin first',
            instructions: [
              '1. Open phpMyAdmin',
              '2. Click on "Databases" tab',
              '3. Create new database named "sapportlah"',
              '4. Run the SQL migration to create the users table',
            ],
          },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { error: 'Database connection failed', details: dbError.message },
        { status: 500 }
      );
    }

    // Check if user already exists
    console.log('Checking for existing user with email:', body.email);
    const existingUsers = await queryService.findWhere('users', {
      email: body.email,
    });
    console.log('Existing users found:', existingUsers);

    if (Array.isArray(existingUsers) && existingUsers.length > 0) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    console.log('Hashing password...');
    const hashedPassword = await hashPassword(body.password);
    console.log('Password hashed successfully');

    // Prepare user data for database insertion
    const userData = {
      email: body.email,
      password: hashedPassword,
      first_name: body.firstName,
      last_name: body.lastName,
      phone: body.phone,
      date_of_birth: body.dateOfBirth,
      ic_passport_number: body.idNumber,
      ic_passport_type: body.idType,
      address: body.address,
      role: body.role,
    };

    console.log('Attempting to insert user data:', {
      ...userData,
      password: '[HIDDEN]',
    });

    // Insert user into database
    const newUser = await queryService.insert('users', userData);
    console.log('User inserted successfully:', {
      ...newUser,
      password: '[HIDDEN]',
    });

    if (!newUser || !newUser.id) {
      throw new Error('User insertion failed - no user returned');
    }

    // Generate JWT token
    const token = generateToken(newUser.id, newUser.email);

    // Remove password from response
    const { password, ...userResponse } = newUser;

    // Return success response
    return NextResponse.json(
      {
        message: 'User registered successfully',
        user: userResponse,
        token,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Registration error:', error);
    console.error('Error stack:', error.stack);

    return NextResponse.json(
      { error: 'Failed to register user', details: error.message },
      { status: 500 }
    );
  }
}
