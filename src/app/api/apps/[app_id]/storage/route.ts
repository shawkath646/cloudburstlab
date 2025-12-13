import { NextRequest, NextResponse } from 'next/server';
import { validateAppAuthentication, createApplicationStorage } from '@/actions/database/applicationStorage';
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

    const storageColRef = db.collection('applications').doc(app_id).collection('storage');
    let totalDeleted = 0;

    while (true) {
      const snapshot = await storageColRef.limit(50).get();

      if (snapshot.empty) {
        break;
      }

      const batch = db.batch();
      let operationCount = 0;

      for (const doc of snapshot.docs) {
        const subCollections = await doc.ref.listCollections();
        
        for (const subCol of subCollections) {
          const subSnapshot = await subCol.get();
          for (const subDoc of subSnapshot.docs) {
            batch.delete(subDoc.ref);
            operationCount++;
          }
        }

        batch.delete(doc.ref);
        operationCount++;
      }

      await batch.commit();
      totalDeleted += snapshot.size;
    }

    return NextResponse.json({ success: true, deletedCount: totalDeleted }, { status: 200 });
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

