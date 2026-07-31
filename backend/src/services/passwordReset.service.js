import crypto from 'crypto';
import { getRedis } from '../config/redis.js';
import AppError from '../errors/AppError.js';
import HttpStatus from '../constants/httpStatus.js';
import ErrorCodes from '../errors/ErrorCodes.js';
import logger from '../config/logger.js';

const RESET_TTL_SECONDS = 15 * 60; // 15 minutes

const resetKey = (token) => `hv:pwdreset:${token}`;

export const createPasswordResetToken = async (userId) => {
  const redis = getRedis();
  const token = crypto.randomBytes(32).toString('hex');
  await redis.set(resetKey(token), String(userId), { ex: RESET_TTL_SECONDS });
  logger.info(`Password reset token stored for user ${userId}`);
  return { token, expiresIn: RESET_TTL_SECONDS };
};

export const consumePasswordResetToken = async (token) => {
  const redis = getRedis();
  const key = resetKey(token);
  const userId = await redis.get(key);

  if (!userId) {
    throw new AppError(
      'Reset link is invalid or has expired',
      HttpStatus.BAD_REQUEST,
      ErrorCodes.VALIDATION_ERROR
    );
  }

  await redis.del(key);
  return String(userId);
};

export default {
  createPasswordResetToken,
  consumePasswordResetToken,
};
