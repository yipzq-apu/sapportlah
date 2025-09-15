import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  try {
    const { id: campaignId, imageId } = await params;

    // Get image details first to extract public_id for Cloudinary deletion
    const images = await db.query(
      'SELECT * FROM campaign_images WHERE id = ? AND campaign_id = ?',
      [imageId, campaignId]
    );

    if (!Array.isArray(images) || images.length === 0) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    const image = images[0] as any;
    console.log('Image to delete:', image);

    // Extract public_id from Cloudinary URL and delete from Cloudinary first
    try {
      const imageUrl = image.image_url;
      console.log('Image URL:', imageUrl);

      // Extract public_id from Cloudinary URL
      // URL formats:
      // https://res.cloudinary.com/[cloud_name]/image/upload/[public_id].[format]
      // https://res.cloudinary.com/[cloud_name]/image/upload/v[version]/[public_id].[format]
      // https://res.cloudinary.com/[cloud_name]/image/upload/[transformations]/[public_id].[format]

      if (imageUrl.includes('cloudinary.com')) {
        // Split by '/' and find the upload index
        const urlParts = imageUrl.split('/');
        const uploadIndex: number = urlParts.findIndex(
          (part: string) => part === 'upload'
        );

        if (uploadIndex !== -1 && uploadIndex < urlParts.length - 1) {
          // Get everything after 'upload/' and before the file extension
          const afterUpload = urlParts.slice(uploadIndex + 1);

          // If there's a version (v1234567890), skip it
          let publicIdParts = afterUpload;
          if (
            afterUpload[0] &&
            afterUpload[0].startsWith('v') &&
            /^v\d+$/.test(afterUpload[0])
          ) {
            publicIdParts = afterUpload.slice(1);
          }

          // Join remaining parts and remove file extension
          const fileNameWithExtension = publicIdParts.join('/');
          const publicId = fileNameWithExtension.replace(/\.[^/.]+$/, '');

          console.log('Extracted public_id:', publicId);

          // Delete from Cloudinary
          const result = await cloudinary.uploader.destroy(publicId);
          console.log('Cloudinary deletion result:', result);

          if (result.result !== 'ok' && result.result !== 'not found') {
            console.warn('Cloudinary deletion failed:', result);
          }
        } else {
          console.error('Could not find upload path in URL:', imageUrl);
        }
      } else {
        console.log('Not a Cloudinary URL, skipping Cloudinary deletion');
      }
    } catch (cloudinaryError) {
      console.error('Error deleting from Cloudinary:', cloudinaryError);
      // Continue with database deletion even if Cloudinary fails
    }

    // Delete from database
    await db.query(
      'DELETE FROM campaign_images WHERE id = ? AND campaign_id = ?',
      [imageId, campaignId]
    );

    return NextResponse.json({
      success: true,
      message: 'Image deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting campaign image:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  try {
    const { id: campaignId, imageId } = await params;
    const { caption } = await request.json();

    // Update image caption
    await db.query(
      'UPDATE campaign_images SET caption = ? WHERE id = ? AND campaign_id = ?',
      [caption || null, imageId, campaignId]
    );

    return NextResponse.json({
      success: true,
      message: 'Image caption updated successfully',
    });
  } catch (error) {
    console.error('Error updating image caption:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
