import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let firebaseApp = null;
let auth = null;

const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');

try {
  if (getApps().length > 0) {
    firebaseApp = getApps()[0];
    auth = getAuth(firebaseApp);
  } else if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    firebaseApp = initializeApp({
      credential: cert(serviceAccount),
    });
    auth = getAuth(firebaseApp);
    console.log('✅ Firebase Admin SDK Initialized from serviceAccountKey.json! (Project: ' + serviceAccount.project_id + ')');
  } else if (
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY
  ) {
    firebaseApp = initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    });
    auth = getAuth(firebaseApp);
    console.log('✅ Firebase Admin SDK Initialized from .env variables! (Project: ' + process.env.FIREBASE_PROJECT_ID + ')');
  } else {
    console.log('ℹ️  Firebase credentials not configured yet.');
  }
} catch (error) {
  console.warn('⚠️  Firebase Admin initialization warning:', error.message);
}

export default firebaseApp;
export { auth };
