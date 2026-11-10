import { Router } from 'express';
import { verifyAuth } from '../middlewares/auth.middleware.js';
import {
  getUserNotifications,
  markNotificationRead,
  markAllNotificationsRead
} from '../controllers/notification.controller.js';

const router = Router();

router.use(verifyAuth);

router.get('/', getUserNotifications);
router.patch('/:id/read', markNotificationRead);
router.patch('/read-all', markAllNotificationsRead);

export default router;
