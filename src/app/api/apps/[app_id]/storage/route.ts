import { NextRequest, NextResponse } from 'next/server';
import { validateAppAuthentication, createApplicationStorage } from '@/actions/applicationStorage';
import { db } from '@/lib/firebase';

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

export async function DELETE(request: NextRequest, { params }: RouteParams) {
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

        const storageRef = db
            .collection('applications')
            .doc(app_id)
            .collection('storage');
        const snapshot = await storageRef.get();

        const batch = db.collection('applications').firestore.batch();
        snapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
        });
        await batch.commit();

        return NextResponse.json({ success: true, deletedCount: snapshot.size }, { status: 200 });
    } catch (error) {
        console.error('Error deleting all app storage:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
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

        const storageSnapshot = await db
            .collection('applications')
            .doc(app_id)
            .collection('storage')
            .get();

        const data = storageSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        return NextResponse.json({ success: true, data }, { status: 200 });
    } catch (error) {
        console.error('Error fetching all app storage:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}

