import prisma from '../config/prisma.js';

/**
 * GET USER NOTIFICATIONS
 * Route: GET /api/v1/notifications
 */
export const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 50
      }),
      prisma.notification.count({
        where: { userId, isRead: false }
      })
    ]);

    return res.status(200).json({
      success: true,
      data: {
        notifications,
        unreadCount
      }
    });
  } catch (error) {
    console.error('Error fetching user notifications:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * MARK NOTIFICATION AS READ
 * Route: PATCH /api/v1/notifications/:id/read
 */
export const markNotificationRead = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    const updated = await prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true }
    });

    return res.status(200).json({ success: true, data: updated });
  } catch (error) {
    console.error('Error marking notification read:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * MARK ALL NOTIFICATIONS AS READ
 * Route: PATCH /api/v1/notifications/read-all
 */
export const markAllNotificationsRead = async (req, res) => {
  try {
    const userId = req.user?.id;

    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true }
    });

    return res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications read:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
