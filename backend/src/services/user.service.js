import path from 'path';
import fs from 'fs';
import authRepository from '../repositories/auth.repository.js';
import AppError from '../errors/AppError.js';
import HttpStatus from '../constants/httpStatus.js';
import ErrorCodes from '../errors/ErrorCodes.js';
import logger from '../config/logger.js';
import Roles from '../constants/roles.js';
import { avatarsDir } from '../middleware/upload.js';

export const listUsers = async (query = {}) => {
  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 50;
  const skip = (page - 1) * limit;

  const filter = {};
  if (query.role) filter.role = query.role;
  if (query.search) {
    filter.$or = [
      { email: { $regex: query.search, $options: 'i' } },
      { firstName: { $regex: query.search, $options: 'i' } },
      { lastName: { $regex: query.search, $options: 'i' } },
    ];
  }

  const users = await authRepository.listUsers(filter, skip, limit);
  const total = await authRepository.countUsers(filter);

  return {
    users,
    pagination: { total, page, limit, pages: Math.ceil(total / limit) || 1 },
  };
};

export const setUserBlocked = async (targetUserId, adminId, block) => {
  const user = await authRepository.findUserById(targetUserId);
  if (!user || user.isDeleted) {
    throw new AppError('User not found', HttpStatus.NOT_FOUND, ErrorCodes.NOT_FOUND);
  }
  if (user.role === Roles.ADMIN) {
    throw new AppError('Admin accounts cannot be blocked', HttpStatus.FORBIDDEN, ErrorCodes.FORBIDDEN);
  }
  if (user._id.toString() === adminId.toString()) {
    throw new AppError('You cannot block yourself', HttpStatus.BAD_REQUEST, ErrorCodes.VALIDATION_ERROR);
  }

  const updated = await authRepository.setUserActive(targetUserId, !block);
  if (block) {
    await authRepository.clearRefreshToken(targetUserId);
  }
  logger.info(`User ${targetUserId} ${block ? 'blocked' : 'unblocked'} by admin ${adminId}`);
  return updated;
};

export const deleteUser = async (targetUserId, adminId) => {
  const user = await authRepository.findUserById(targetUserId);
  if (!user || user.isDeleted) {
    throw new AppError('User not found', HttpStatus.NOT_FOUND, ErrorCodes.NOT_FOUND);
  }
  if (user.role === Roles.ADMIN) {
    throw new AppError('Admin accounts cannot be deleted', HttpStatus.FORBIDDEN, ErrorCodes.FORBIDDEN);
  }
  if (user._id.toString() === adminId.toString()) {
    throw new AppError('You cannot delete yourself', HttpStatus.BAD_REQUEST, ErrorCodes.VALIDATION_ERROR);
  }

  await authRepository.softDeleteUser(targetUserId);
  logger.info(`User ${targetUserId} soft-deleted by admin ${adminId}`);
  return true;
};

const toPublicUser = (user) => ({
  id: user._id || user.id,
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  role: user.role,
  isVerified: user.isVerified,
  avatar: user.avatar || null,
});

export const updateUserByAdmin = async (targetUserId, adminId, { firstName, lastName, role }) => {
  const user = await authRepository.findUserById(targetUserId);
  if (!user || user.isDeleted) {
    throw new AppError('User not found', HttpStatus.NOT_FOUND, ErrorCodes.NOT_FOUND);
  }

  const updates = {};
  if (typeof firstName === 'string' && firstName.trim()) {
    updates.firstName = firstName.trim();
  }
  if (typeof lastName === 'string' && lastName.trim()) {
    updates.lastName = lastName.trim();
  }
  if (role) {
    updates.role = role;
  }

  if (Object.keys(updates).length === 0) {
    throw new AppError(
      'Provide at least one field to update',
      HttpStatus.BAD_REQUEST,
      ErrorCodes.VALIDATION_ERROR
    );
  }

  const isSelf = user._id.toString() === adminId.toString();
  if (isSelf && role && role !== Roles.ADMIN) {
    throw new AppError(
      'You cannot change your own role',
      HttpStatus.BAD_REQUEST,
      ErrorCodes.VALIDATION_ERROR
    );
  }

  if (user.role === Roles.ADMIN && role && role !== Roles.ADMIN) {
    const adminCount = await authRepository.countUsers({ role: Roles.ADMIN });
    if (adminCount <= 1) {
      throw new AppError(
        'Cannot remove the last admin',
        HttpStatus.BAD_REQUEST,
        ErrorCodes.VALIDATION_ERROR
      );
    }
  }

  const updated = await authRepository.updateProfile(targetUserId, updates);
  logger.info(`User ${targetUserId} updated by admin ${adminId}`);
  return {
    id: updated._id,
    firstName: updated.firstName,
    lastName: updated.lastName,
    email: updated.email,
    role: updated.role,
    isVerified: updated.isVerified,
  };
};

export const updateMyProfile = async (userId, { firstName, lastName }, file) => {
  const current = await authRepository.findUserById(userId);
  if (!current || current.isDeleted) {
    throw new AppError('User not found', HttpStatus.NOT_FOUND, ErrorCodes.NOT_FOUND);
  }

  const updates = {};
  if (typeof firstName === 'string' && firstName.trim()) {
    updates.firstName = firstName.trim();
  }
  if (typeof lastName === 'string' && lastName.trim()) {
    updates.lastName = lastName.trim();
  }

  if (file) {
    const previousAvatar = current.avatar;
    updates.avatar = `/uploads/avatars/${file.filename}`;

    if (previousAvatar && previousAvatar.startsWith('/uploads/avatars/')) {
      const oldPath = path.join(avatarsDir, path.basename(previousAvatar));
      fs.promises.unlink(oldPath).catch(() => {});
    }
  }

  if (Object.keys(updates).length === 0) {
    throw new AppError(
      'Provide a name field or an avatar image to update',
      HttpStatus.BAD_REQUEST,
      ErrorCodes.VALIDATION_ERROR
    );
  }

  const updated = await authRepository.updateProfile(userId, updates);
  logger.info(`Profile updated for user: ${updated.email}`);
  return toPublicUser(updated);
};

export default {
  listUsers,
  setUserBlocked,
  deleteUser,
  updateUserByAdmin,
  updateMyProfile,
};
