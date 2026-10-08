import { Router } from 'express';
// Note: Controller path might need to be adjusted based on your folder structure
import { registerAdmin, loginAdmin } from '../../controllers/admin/adminAuth.controller.js';

const router = Router();

router.post('/register', registerAdmin);
router.post('/login', loginAdmin);

export default router;

/* =========================================
   EXAMPLE: How to use auth middleware
   (Commented out to prevent errors)
========================================= */

/*
import { verifyAuth, authorizeRole } from '../../middlewares/auth.middleware.js'; 

// Aapke controllers (Example)
import { getAdminDashboardData, deleteUser } from '../../controllers/admin/admin.controller.js';
import { getDropshipperWallet } from '../../controllers/dropshipper/dropshipper.controller.js';
import { viewCommonReports } from '../../controllers/common/common.controller.js';

// --- 1. ADMIN ONLY ROUTES ---
// Yahan humne verifyAuth lagaya (Token check), fir authorizeRole('ADMIN') lagaya
// router.get('/admin-dashboard', verifyAuth, authorizeRole('ADMIN'), getAdminDashboardData);
// router.delete('/delete-user', verifyAuth, authorizeRole('ADMIN'), deleteUser);

// --- 2. DROPSHIPPER ONLY ROUTES ---
// Yahan same middleware use hua, par permission sirf 'DROPSHIPPER' ko di
// router.get('/my-wallet', verifyAuth, authorizeRole('DROPSHIPPER'), getDropshipperWallet);

// --- 3. COMMON ROUTES (Dono access kar sakte hain) ---
// Yahan humne dono roles pass kar diye! Isliye ye generic banana itna powerfull hota hai.
// router.get('/reports', verifyAuth, authorizeRole('ADMIN', 'DROPSHIPPER'), viewCommonReports);
*/