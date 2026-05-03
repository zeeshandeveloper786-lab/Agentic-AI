import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

// To use Firebase, you need to add these to your .env:
// FIREBASE_PROJECT_ID=...
// FIREBASE_CLIENT_EMAIL=...
// FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

try {
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
        // Clean the key: Handle quotes, escaped newlines, and potential double-escaping
        let privateKey = process.env.FIREBASE_PRIVATE_KEY.trim();

        // Remove surrounding quotes (both ' and ")
        if ((privateKey.startsWith('"') && privateKey.endsWith('"')) ||
            (privateKey.startsWith("'") && privateKey.endsWith("'"))) {
            privateKey = privateKey.substring(1, privateKey.length - 1);
        }

        // Replace literal \n and \r with actual newlines
        privateKey = privateKey.replace(/\\n/g, '\n').replace(/\\r/g, '');

        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                privateKey: privateKey,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            }),
        });
        console.log('🔥 Firebase Admin initialized successfully');
    } else {
        console.warn('⚠️ Firebase environment variables missing. Social login will not work.');
    }
} catch (error) {
    console.error('❌ Firebase initialization error:', error.message);
}

export default admin;
