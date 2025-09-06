import { NextRequest, NextResponse } from 'next/server';
import { queryService } from '../../../../database';
import { verifyToken } from '../../../../lib/auth';

export async function PUT(request: NextRequest) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();

    // Extract updateable fields
    const updateData: any = {};

    if (body.firstName) updateData.first_name = body.firstName;
    if (body.lastName) updateData.last_name = body.lastName;
    if (body.email) updateData.email = body.email;
    if (body.phone) updateData.phone = body.phone;
    if (body.address) updateData.address = body.address;
    if (body.profileImage) updateData.profile_image = body.profileImage;

    // Update user in database
    const updatedUser = await queryService.update(
      'users',
      decoded.userId,
      updateData
    );

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'Failed to update user' },
        { status: 500 }
      );
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = updatedUser;

    return NextResponse.json(
      {
        message: 'Profile updated successfully',
        user: userWithoutPassword,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Update profile error:', error);

    if (error.message === 'Invalid token') {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update profile', details: error.message },
      { status: 500 }
    );
  }
}
