import crypto from 'crypto';
import { getRedis } from '../config/redis.js';
import config from '../config/env.js';
import AppError from '../errors/AppError.js';
import HttpStatus from '../constants/httpStatus.js';
import ErrorCodes from '../errors/ErrorCodes.js';
import logger from '../config/logger.js';

const otpKey = (email) => `hv:otp:signup:${email}`;
const cooldownKey = (email) => `hv:otp:signup:cooldown:${email}`;
const attemptsKey = (email) => `hv:otp:signup:attempts:${email}`;

const hashOtp = (otp) => crypto.createHash('sha256').update(String(otp)).digest('hex');

export const generateOtp = () => {
  const n = crypto.randomInt(0, 1_000_000);
  return String(n).padStart(6, '0');
};

export const storeSignupOtp = async (email, otp) => {
  const redis = getRedis();
  const normalized = email.trim().toLowerCase();
  const ttl = config.otp.ttlSeconds;

  await redis.set(otpKey(normalized), hashOtp(otp), { ex: ttl });
  await redis.set(cooldownKey(normalized), '1', { ex: config.otp.resendCooldownSeconds });
  await redis.del(attemptsKey(normalized));

  logger.info(`Signup OTP stored in Upstash for ${normalized} (ttl=${ttl}s)`);
  return { expiresIn: ttl };
};

export const assertResendAllowed = async (email) => {
  const redis = getRedis();
  const normalized = email.trim().toLowerCase();
  const remaining = await redis.ttl(cooldownKey(normalized));
  if (remaining > 0) {
    throw new AppError(
      `Please wait ${remaining}s before requesting another code`,
      HttpStatus.TOO_MANY_REQUESTS,
      ErrorCodes.TOO_MANY_REQUESTS
    );
  }
};

export const verifySignupOtp = async (email, otp) => {
  const redis = getRedis();
  const normalized = email.trim().toLowerCase();
  const key = otpKey(normalized);
  const storedHash = await redis.get(key);

  if (!storedHash) {
    throw new AppError(
      'Verification code expired or not found. Please request a new one.',
      HttpStatus.BAD_REQUEST,
      ErrorCodes.VALIDATION_ERROR
    );
  }

  const attempts = await redis.incr(attemptsKey(normalized));
  if (attempts === 1) {
    await redis.expire(attemptsKey(normalized), config.otp.ttlSeconds);
  }

  if (attempts > config.otp.maxAttempts) {
    await redis.del(key);
    await redis.del(attemptsKey(normalized));
    throw new AppError(
      'Too many invalid attempts. Please request a new verification code.',
      HttpStatus.TOO_MANY_REQUESTS,
      ErrorCodes.TOO_MANY_REQUESTS
    );
  }

  const incoming = hashOtp(otp);
  const stored = String(storedHash);
  const match =
    stored.length === incoming.length &&
    crypto.timingSafeEqual(Buffer.from(stored), Buffer.from(incoming));

  if (!match) {
    const left = Math.max(config.otp.maxAttempts - attempts, 0);
    throw new AppError(
      `Invalid verification code. ${left} attempt${left === 1 ? '' : 's'} remaining.`,
      HttpStatus.BAD_REQUEST,
      ErrorCodes.VALIDATION_ERROR
    );
  }

  await redis.del(key);
  await redis.del(attemptsKey(normalized));
  await redis.del(cooldownKey(normalized));
  logger.info(`Signup OTP verified for ${normalized}`);
  return true;
};

export const clearSignupOtp = async (email) => {
  const redis = getRedis();
  const normalized = email.trim().toLowerCase();
  await redis.del(otpKey(normalized));
  await redis.del(attemptsKey(normalized));
  await redis.del(cooldownKey(normalized));
};

export default {
  generateOtp,
  storeSignupOtp,
  assertResendAllowed,
  verifySignupOtp,
  clearSignupOtp,
};
