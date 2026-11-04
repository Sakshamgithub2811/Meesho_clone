import nodemailer from "nodemailer";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envCandidates = [
  path.resolve(__dirname, "../../.env"),
  path.resolve(__dirname, "../../../.env"),
  path.resolve(process.cwd(), ".env"),
  path.resolve(process.cwd(), "Meesho_clone/backend/.env")
];

for (const p of envCandidates) {
  if (fs.existsSync(p)) {
    dotenv.config({ path: p });
    break;
  }
}
dotenv.config();

const hasSmtpConfig = Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);

let realTransporter = null;
if (hasSmtpConfig) {
  try {
    realTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      },
    });
    console.log("📧 Email Transporter Configured with User:", process.env.SMTP_USER);
  } catch (err) {
    console.warn("⚠️ Email Transporter Init Warning:", err.message);
  }
} else {
  console.log("ℹ️ Optional SMTP credentials not provided; email notifications will be safely mocked in runtime.");
}

export const transporter = {
  sendMail: async (options) => {
    if (realTransporter) {
      try {
        return await realTransporter.sendMail(options);
      } catch (err) {
        console.warn("⚠️ SMTP Send Mail Error (skipped):", err.message);
        return { messageId: 'mock-mail-id-' + Date.now(), error: err.message, skipped: true };
      }
    }
    console.log(`ℹ️ [Email Mock] To: ${options?.to}, Subject: "${options?.subject}" (SMTP not configured)`);
    return { messageId: 'mock-mail-id-' + Date.now(), skipped: true };
  }
};

export default transporter;
