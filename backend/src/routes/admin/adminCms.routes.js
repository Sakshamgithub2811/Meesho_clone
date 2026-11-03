import { Router } from 'express';
import { verifyAuth, authorizeRole } from '../../middlewares/auth.middleware.js';
import {
  getAllAdminCmsPages,
  getAdminCmsPageById,
  createAdminCmsPage,
  updateAdminCmsPage,
  toggleAdminCmsPageStatus,
  deleteAdminCmsPage
} from '../../controllers/admin/adminCms.controller.js';

const router = Router();

// Protect all admin CMS endpoints with Admin auth
router.use(verifyAuth, authorizeRole('ADMIN'));

router.get('/', getAllAdminCmsPages);
router.get('/:id', getAdminCmsPageById);
router.post('/', createAdminCmsPage);
router.put('/:id', updateAdminCmsPage);
router.patch('/:id/status', toggleAdminCmsPageStatus);
router.delete('/:id', deleteAdminCmsPage);

export default router;
