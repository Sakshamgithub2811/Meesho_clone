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

const smtpUser = process.env.SMTP_USER || "pramodlodhi2003born@gmail.com";
const smtpPass = process.env.SMTP_PASS || "rtgichrdgjzxnkux";
const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
const smtpPort = Number(process.env.SMTP_PORT) || 465;

const hasSmtpConfig = Boolean(smtpUser && smtpPass);

let realTransporter = null;
if (hasSmtpConfig) {
  try {
    const isGmail = smtpHost.includes('gmail.com');
    if (isGmail) {
      realTransporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: smtpUser,
          pass: smtpPass
        },
        pool: false,
        connectionTimeout: 10000,
        greetingTimeout: 5000,
        socketTimeout: 15000
      });
    } else {
      realTransporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass
        },
        pool: false,
        connectionTimeout: 10000,
        greetingTimeout: 5000,
        socketTimeout: 15000
      });
    }
    console.log("📧 Email Transporter Configured with User:", smtpUser);
  } catch (err) {
    console.warn("⚠️ Email Transporter Init Warning:", err.message);
  }
} else {
  console.warn("⚠️ SMTP credentials not configured in environment (SMTP_USER/SMTP_PASS). Email delivery will be disabled.");
}

export const transporter = {
  sendMail: async (options) => {
    if (realTransporter) {
      try {
        if (!options.from) {
          options.from = process.env.EMAIL_FROM || `"MShoppy" <${smtpUser}>`;
        }
        return await realTransporter.sendMail(options);
      } catch (err) {
        console.error("❌ SMTP Send Mail Error:", err.message);
        throw err;
      }
    }
    console.error(`❌ [Email Delivery Blocked] Cannot send email to ${options?.to}: SMTP credentials not configured.`);
    return { success: false, error: 'SMTP credentials not configured in server environment.', skipped: true };
  }
};

export default transporter;
