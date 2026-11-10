import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { readFileSync, existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let serviceAccount = null;

// 1. Check direct JSON string or base64 in environment variables (Vercel Production)
const envJson = process.env.FIREBASE_SERVICE_ACCOUNT || process.env.FIREBASE_SERVICE_ACCOUNT_KEY || process.env.FIREBASE_CONFIG;
if (envJson) {
  try {
    const raw = envJson.trim();
    if (raw.startsWith('{')) {
      serviceAccount = JSON.parse(raw);
    } else {
      const decoded = Buffer.from(raw, 'base64').toString('utf-8');
      serviceAccount = JSON.parse(decoded);
    }
  } catch (err) {
    console.warn("⚠️ Failed to parse FIREBASE_SERVICE_ACCOUNT from environment:", err.message);
  }
}

// 2. Check individual environment variables
if (!serviceAccount && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
  serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID || "meesho-clone-d1709",
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  };
}

// 3. Check local file candidates (local development fallback)
if (!serviceAccount) {
  const localCandidates = [
    path.resolve(__dirname, "serviceAccountKey.json"),
    path.resolve(process.cwd(), "serviceAccountKey.json"),
    path.resolve(process.cwd(), "backend/serviceAccountKey.json")
  ];
  for (const cand of localCandidates) {
    if (existsSync(cand)) {
      try {
        serviceAccount = JSON.parse(readFileSync(cand, "utf-8"));
        break;
      } catch (e) {}
    }
  }
}

// 4. Initialize Firebase Admin if serviceAccount is found
if (serviceAccount) {
  try {
    if (getApps().length === 0) {
      initializeApp({
        credential: cert(serviceAccount),
      });
      console.log("🔥 Firebase Admin SDK initialized successfully!");
    }
  } catch (error) {
    console.warn("⚠️ Firebase Admin Initialization Warning:", error.message);
  }
} else {
  console.log("ℹ️ Firebase service account credentials not configured in environment; running with client token fallback mode.");
}

// Export auth helper and admin object for verifying tokens in middleware
export const auth = getApps().length > 0 ? getAuth() : null;
export { serviceAccount };

const admin = {
  auth: () => (getApps().length > 0 ? getAuth() : null),
};
if (auth) {
  Object.assign(admin.auth, auth);
}

export default admin;
