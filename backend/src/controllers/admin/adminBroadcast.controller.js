import prisma from '../../config/prisma.js';
import { getApps } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';

/**
 * 1. SEND BROADCAST TO USERS (DATABASE BATCH INSERT + FCM PUSH)
 * Route: POST /api/v1/admin-broadcast
 */
export const sendBroadcast = async (req, res) => {
  try {
    const { audience = 'ALL', title, body, type = 'promo', link = '' } = req.body;

    if (!title || !title.trim() || !body || !body.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Broadcast title and message body are required.'
      });
    }

    // 1. Resolve Target Audience
    const userWhere = { isActive: true, isDeleted: false };
    if (audience === 'CUSTOMER') userWhere.role = 'CUSTOMER';
    else if (audience === 'SUPPLIER') userWhere.role = 'SUPPLIER';
    else if (audience === 'DROPSHIPPER') userWhere.role = 'DROPSHIPPER';
    // If 'ALL', userWhere remains open to all roles

    const targetUsers = await prisma.profile.findMany({
      where: userWhere,
      select: { id: true, role: true }
    });

    if (targetUsers.length === 0) {
      return res.status(400).json({
        success: false,
        message: `No active users found for audience: ${audience}`
      });
    }

    // 2. Batch insert in PostgreSQL Notification table for persistent in-app bell
    const notificationPayloads = targetUsers.map((u) => ({
      userId: u.id,
      title: title.trim(),
      body: body.trim(),
      type: type || 'promo',
      isRead: false,
      data: {
        link: link ? link.trim() : '',
        targetAudience: audience,
        broadcastTime: new Date().toISOString()
      }
    }));

    await prisma.notification.createMany({
      data: notificationPayloads
    });

    // 3. Trigger Firebase FCM Push Notification (Topic-Based)
    let fcmSuccess = false;
    let fcmNote = null;

    if (getApps().length > 0) {
      try {
        const topicName = audience === 'ALL' ? 'mshoppy_all' : `mshoppy_${audience.toLowerCase()}`;
        const fcmPayload = {
          notification: {
            title: title.trim(),
            body: body.trim()
          },
          data: {
            link: link ? link.trim() : '/notifications',
            type: type || 'promo',
            audience: audience
          },
          topic: topicName
        };

        await getMessaging().send(fcmPayload);
        fcmSuccess = true;
      } catch (pushErr) {
        console.warn('FCM Topic Push notification notice:', pushErr.message);
        fcmNote = pushErr.message;
      }
    }

    return res.status(200).json({
      success: true,
      message: `Broadcast successfully delivered to ${targetUsers.length} users! 📢`,
      data: {
        recipientsCount: targetUsers.length,
        audience,
        fcmPushDispatched: fcmSuccess,
        fcmNote
      }
    });
  } catch (error) {
    console.error('Error sending broadcast:', error);
    return res.status(500).json({
      success: false,
      message: `Failed to deliver broadcast: ${error.message}`
    });
  }
};

/**
 * 2. GET BROADCAST RECENT LOGS
 * Route: GET /api/v1/admin-broadcast/history
 */
export const getBroadcastHistory = async (req, res) => {
  try {
    const recentNotifications = await prisma.notification.findMany({
      take: 100,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        body: true,
        type: true,
        data: true,
        createdAt: true
      }
    });

    // Deduplicate by unique title & created minute to show summary feed
    const uniqueBroadcasts = [];
    const seenKeys = new Set();

    for (const notif of recentNotifications) {
      const minuteStamp = new Date(notif.createdAt).toISOString().slice(0, 16);
      const key = `${notif.title}_${minuteStamp}`;
      if (!seenKeys.has(key)) {
        seenKeys.add(key);
        uniqueBroadcasts.push({
          id: notif.id,
          title: notif.title,
          body: notif.body,
          type: notif.type,
          data: notif.data,
          createdAt: notif.createdAt
        });
      }
    }

    return res.status(200).json({
      success: true,
      data: uniqueBroadcasts
    });
  } catch (error) {
    console.error('Error fetching broadcast history:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * 3. GET AUDIENCE COUNTER METRICS
 * Route: GET /api/v1/admin-broadcast/audience-counts
 */
export const getAudienceCounts = async (req, res) => {
  try {
    const [allCount, customerCount, supplierCount, dropshipperCount] = await Promise.all([
      prisma.profile.count({ where: { isActive: true, isDeleted: false } }),
      prisma.profile.count({ where: { role: 'CUSTOMER', isActive: true, isDeleted: false } }),
      prisma.profile.count({ where: { role: 'SUPPLIER', isActive: true, isDeleted: false } }),
      prisma.profile.count({ where: { role: 'DROPSHIPPER', isActive: true, isDeleted: false } })
    ]);

    return res.status(200).json({
      success: true,
      data: {
        ALL: allCount,
        CUSTOMER: customerCount,
        SUPPLIER: supplierCount,
        DROPSHIPPER: dropshipperCount
      }
    });
  } catch (error) {
    console.error('Error fetching audience counts:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

