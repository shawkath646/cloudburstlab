import { NextRequest, NextResponse } from 'next/server';
import { validateAppAuthentication, createApplicationStorage } from '@/actions/applicationStorage';

interface RouteParams {
    params: Promise<{
        app_id: string;
    }>;
}

export async function POST(
    request: NextRequest,
    { params }: RouteParams
) {
    try {
        const { app_id } = await params;

        const appSecret = request.headers.get('X-App-Secret');

        if (!appSecret) {
            return NextResponse.json(
                { success: false, error: 'Missing authentication header: X-App-Secret' },
                { status: 401 }
            );
        }

        const authResult = await validateAppAuthentication(app_id, appSecret);

        if (!authResult.valid) {
            return NextResponse.json(
                { success: false, error: authResult.error },
                { status: authResult.error === 'App is not active' ? 403 : 401 }
            );
        }

        const data = await request.json();

        if (!data || typeof data !== 'object') {
            return NextResponse.json(
                { success: false, error: 'Invalid data format' },
                { status: 400 }
            );
        }

        const result = await createApplicationStorage(app_id, data);

        if (!result.success) {
            return NextResponse.json(
                { success: false, error: result.error },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            databaseId: result.databaseId
        }, { status: 201 });

    } catch (error) {
        console.error('Error saving app storage:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
