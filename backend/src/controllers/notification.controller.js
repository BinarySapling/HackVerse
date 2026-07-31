import notificationService from '../services/notification.service.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import HttpStatus from '../constants/httpStatus.js';
import AppError from '../errors/AppError.js';
import ErrorCodes from '../errors/ErrorCodes.js';

export const getMyNotifications = asyncHandler(async (req, res) => {
  const result = await notificationService.getMyNotifications(req.user.id, req.query);
  return ApiResponse.success(
    res,
    HttpStatus.OK,
    'Notifications retrieved successfully',
    result.notifications,
    { ...result.pagination, unreadCount: result.unreadCount }
  );
});

export const markNotificationRead = asyncHandler(async (req, res) => {
  const notification = await notificationService.markAsRead(req.params.id, req.user.id);
  if (!notification) {
    throw new AppError('Notification not found', HttpStatus.NOT_FOUND, ErrorCodes.NOT_FOUND);
  }
  return ApiResponse.success(res, HttpStatus.OK, 'Notification marked as read', notification);
});

export const markAllNotificationsRead = asyncHandler(async (req, res) => {
  const result = await notificationService.markAllAsRead(req.user.id);
  return ApiResponse.success(res, HttpStatus.OK, 'All notifications marked as read', result);
});

export default {
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead
};
