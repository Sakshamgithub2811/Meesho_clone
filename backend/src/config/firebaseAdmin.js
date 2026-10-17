import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { readFileSync, existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const serviceAccountPath = path.resolve(__dirname, "serviceAccountKey.json");
let serviceAccount = null;

if (!existsSync(serviceAccountPath)) {
  console.error(`❌ Service account key not found at: ${serviceAccountPath}`);
} else {
  try {
    serviceAccount = JSON.parse(readFileSync(serviceAccountPath, "utf-8"));

    if (getApps().length === 0) {
      initializeApp({
        credential: cert(serviceAccount),
      });
      console.log("🔥 Firebase Admin SDK initialized successfully!");
    }
  } catch (error) {
    console.error("❌ Firebase Admin Initialization Error:", error.message);
  }
}

// Export auth helper and admin object for verifying tokens in middleware
export const auth = getApps().length > 0 ? getAuth() : null;
export { serviceAccount };

const admin = {
  auth: () => auth,
};
if (auth) {
  Object.assign(admin.auth, auth);
}

export default admin;