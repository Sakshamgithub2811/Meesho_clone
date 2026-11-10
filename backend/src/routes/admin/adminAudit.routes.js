import { Router } from 'express';
import { verifyAuth, authorizeRole } from '../../middlewares/auth.middleware.js';
import { getAuditLogs } from '../../controllers/admin/adminAudit.controller.js';

const router = Router();

router.use(verifyAuth, authorizeRole('ADMIN'));

router.get('/', getAuditLogs);

export default router;

