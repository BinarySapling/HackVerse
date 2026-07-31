import Notification from '../models/Notification.js';
import logger from '../config/logger.js';

export const createNotification = async ({ userId, type, title, message, meta = {} }) => {
  if (!userId) return null;
  try {
    return await Notification.create({
      user: userId,
      type,
      title,
      message,
      meta
    });
  } catch (error) {
    logger.error('Failed to create notification', { userId, type, reason: error.message });
    return null;
  }
};

export const createNotifications = async (items = []) => {
  const results = await Promise.allSettled(items.map((item) => createNotification(item)));
  return results.filter((r) => r.status === 'fulfilled').map((r) => r.value);
};

export const getMyNotifications = async (userId, query = {}) => {
  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 20;
  const skip = (page - 1) * limit;
  const filter = { user: userId };

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Notification.countDocuments(filter),
    Notification.countDocuments({ ...filter, isRead: false })
  ]);

  return {
    notifications,
    unreadCount,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    }
  };
};

export const markAsRead = async (notificationId, userId) => {
  return Notification.findOneAndUpdate(
    { _id: notificationId, user: userId },
    { isRead: true },
    { returnDocument: 'after' }
  );
};

export const markAllAsRead = async (userId) => {
  await Notification.updateMany({ user: userId, isRead: false }, { isRead: true });
  return { success: true };
};

export default {
  createNotification,
  createNotifications,
  getMyNotifications,
  markAsRead,
  markAllAsRead
};
