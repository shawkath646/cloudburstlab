import admin from "firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

let app: admin.app.App | null = null;

function initializeApp() {
    if (app) return app;
    
    if (admin.apps.length) {
        app = admin.app();
        return app;
    }

    const firebaseConfig = {
        type: process.env.FIREBASE_TYPE,
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID,
        auth_uri: process.env.FIREBASE_AUTH_URI,
        token_uri: process.env.FIREBASE_TOKEN_URI,
        auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
        client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
        universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN,
    };

    app = admin.initializeApp({
        credential: admin.credential.cert(firebaseConfig as admin.ServiceAccount),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });

    return app;
}

const db = (() => {
    let instance: admin.firestore.Firestore | null = null;
    return {
        collection: (name: string) => {
            if (!instance) {
                instance = admin.firestore(initializeApp());
            }
            return instance.collection(name);
        }
    };
})();

const bucket = (() => {
    let instance: ReturnType<ReturnType<typeof admin.storage>['bucket']> | null = null;
    return () => {
        if (!instance) {
            instance = admin.storage(initializeApp()).bucket();
        }
        return instance;
    };
})();

export { db, bucket, FieldValue };
