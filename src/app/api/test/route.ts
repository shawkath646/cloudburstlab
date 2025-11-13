import { NextResponse } from 'next/server';
import { bucket } from '@/lib/firebase';

export async function GET() {
    // Disable this route in production
    if (process.env.NODE_ENV === 'production') {
        return NextResponse.json(
            { error: 'This endpoint is not available in production' },
            { status: 403 }
        );
    }

    try {
        // Define your image paths in Firebase Storage
        const imagePaths = [
            'cloudburst_lab_logo_transparent.svg'
        ];

        // Fetch permanent public download URLs for both images
        const urlPromises = imagePaths.map(async (path) => {
            const file = bucket().file(path);
            
            // Make the file publicly accessible
            await file.makePublic();            
            return file.publicUrl();;
        });

        const imageUrls = await Promise.all(urlPromises);
        return NextResponse.json(imageUrls);

    } catch (error) {
        console.error('Error fetching images:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch images' },
            { status: 500 }
        );
    }
}