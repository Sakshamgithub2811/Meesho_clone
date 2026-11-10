import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const AUDIT_FILE = path.resolve(__dirname, '../config/auditLogs.json');

/**
 * Global Admin Activity Audit Logger
 * Records administrative operations for security compliance, arbitration, and oversight.
 */
export async function logAdminAction({
  adminEmail = 'admin@meesho.com',
  adminName = 'Admin',
  action = 'GENERAL_ACTION',
  targetType = 'GENERAL',
  targetId = null,
  details = '',
  ipAddress = '127.0.0.1'
}) {
  try {
    let logs = [];
    if (fs.existsSync(AUDIT_FILE)) {
      try {
        logs = JSON.parse(fs.readFileSync(AUDIT_FILE, 'utf-8'));
      } catch (e) {
        logs = [];
      }
    }

    const newLog = {
      id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      adminEmail,
      adminName,
      action,
      targetType,
      targetId,
      details,
      ipAddress,
      timestamp: new Date().toISOString()
    };

    // Keep chronological order with newest first (capped at 500 items)
    logs.unshift(newLog);
    if (logs.length > 500) {
      logs = logs.slice(0, 500);
    }

    fs.writeFileSync(AUDIT_FILE, JSON.stringify(logs, null, 2), 'utf-8');
    return newLog;
  } catch (err) {
    console.warn('Audit logger warning:', err.message);
  }
}

