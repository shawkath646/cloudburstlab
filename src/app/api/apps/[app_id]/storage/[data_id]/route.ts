import { NextRequest, NextResponse } from 'next/server';
import { validateAppAuthentication, getApplicationStorage, updateApplicationStorage as updateStorage, deleteApplicationStorage as deleteStorage } from '@/actions/database/applicationStorage';

interface RouteParams {
    params: Promise<{
        app_id: string;
        data_id: string;
    }>;
}

export async function GET(
    request: NextRequest,
    { params }: RouteParams
) {
    try {
        const { app_id, data_id } = await params;

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

        const storageData = await getApplicationStorage(app_id, data_id);
        
        if (!storageData) {
            return NextResponse.json(
                { success: false, error: 'Data not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: storageData
        }, { status: 200 });

    } catch (error) {
        console.error('Error fetching app storage:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    { params }: RouteParams
) {
    try {
        const { app_id, data_id } = await params;

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

        const existingData = await getApplicationStorage(app_id, data_id);
        
        if (!existingData) {
            return NextResponse.json(
                { success: false, error: 'Data not found' },
                { status: 404 }
            );
        }

        const data = await request.json();

        if (!data || typeof data !== 'object') {
            return NextResponse.json(
                { success: false, error: 'Invalid data format' },
                { status: 400 }
            );
        }

        const result = await updateStorage(app_id, data_id, data);

        if (!result.success) {
            return NextResponse.json(
                { success: false, error: result.error },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            databaseId: data_id
        }, { status: 200 });

    } catch (error) {
        console.error('Error updating app storage:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: RouteParams
) {
    try {
        const { app_id, data_id } = await params;

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

        const existingData = await getApplicationStorage(app_id, data_id);
        
        if (!existingData) {
            return NextResponse.json(
                { success: false, error: 'Data not found' },
                { status: 404 }
            );
        }

        const result = await deleteStorage(app_id, data_id);

        if (!result.success) {
            return NextResponse.json(
                { success: false, error: result.error },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Data deleted successfully'
        }, { status: 200 });

    } catch (error) {
        console.error('Error deleting app storage:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
