import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const AUDIT_FILE = path.resolve(__dirname, '../../config/auditLogs.json');

/**
 * 1. GET ALL ADMIN ACTIVITY AUDIT LOGS
 * Supports query params: ?category=PRODUCT&search=Saksham
 * Route: GET /api/v1/admin-audit
 */
export const getAuditLogs = async (req, res) => {
  try {
    if (!fs.existsSync(AUDIT_FILE)) {
      return res.status(200).json({ success: true, data: [] });
    }

    let logs = [];
    try {
      logs = JSON.parse(fs.readFileSync(AUDIT_FILE, 'utf-8'));
    } catch (e) {
      logs = [];
    }

    const { category, search } = req.query;

    let filtered = logs;

    if (category && category.toUpperCase() !== 'ALL') {
      filtered = filtered.filter(
        (l) => l.targetType?.toUpperCase() === category.toUpperCase()
      );
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter(
        (l) =>
          l.adminName?.toLowerCase().includes(q) ||
          l.adminEmail?.toLowerCase().includes(q) ||
          l.action?.toLowerCase().includes(q) ||
          l.details?.toLowerCase().includes(q)
      );
    }

    return res.status(200).json({
      success: true,
      data: filtered,
      totalCount: filtered.length
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
