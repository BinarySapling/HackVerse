import bcrypt from 'bcrypt';
import crypto from 'crypto';
import authRepository from '../repositories/auth.repository.js';
import AppError from '../errors/AppError.js';
import HttpStatus from '../constants/httpStatus.js';
import ErrorCodes from '../errors/ErrorCodes.js';
import logger from '../config/logger.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken
} from '../utils/jwt.js';

export const hashToken = (token) => {
  if (!token) return null;
  return crypto.createHash('sha256').update(token).digest('hex');
};

export const registerUser = async (userData) => {
  const { email, password } = userData;

  // 1. Validate if user email already exists (Duplicate detection)
  const existingUser = await authRepository.findByEmail(email);
  if (existingUser) {
    logger.warn(`Duplicate registration attempt for email: ${email}`);
    throw new AppError(
      "Email address is already in use",
      HttpStatus.CONFLICT,
      ErrorCodes.CONFLICT
    );
  }

  // 2. Hash the password securely using bcrypt with 12 salt rounds
  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(password, salt);

  // 3. Insert user profile document into storage
  const createdUser = await authRepository.createUser({
    ...userData,
    password: hashedPassword
  });

  logger.info(`User registered successfully: ${createdUser.email}`);
  return createdUser;
};

export const loginUser = async (email, password) => {
  if (!email || !password) {
    throw new AppError(
      "Email and password are required",
      HttpStatus.BAD_REQUEST,
      ErrorCodes.VALIDATION_ERROR
    );
  }

  // 1. Normalize input email
  const normalizedEmail = email.trim().toLowerCase();

  // 2. Fetch user by email with select("+password")
  const user = await authRepository.findUserByEmailWithPassword(normalizedEmail);

  // 3. If user does not exist or soft-deleted, throw UNAUTHORIZED
  if (!user || user.isDeleted) {
    logger.warn(`Login failed: email "${normalizedEmail}" does not exist or is deleted`);
    throw new AppError(
      "Invalid email or password",
      HttpStatus.UNAUTHORIZED,
      ErrorCodes.UNAUTHORIZED
    );
  }

  // 4. Check if account is suspended (isActive === false)
  if (!user.isActive) {
    logger.warn(`Login failed: suspended account login attempt for email "${normalizedEmail}"`);
    throw new AppError(
      "Your account has been deactivated. Please contact support.",
      HttpStatus.UNAUTHORIZED,
      ErrorCodes.UNAUTHORIZED
    );
  }

  // 5. Verify input password hash
  const isPasswordMatch = await bcrypt.compare(password, user.password);
  if (!isPasswordMatch) {
    logger.warn(`Login failed: invalid password attempt for email "${normalizedEmail}"`);
    throw new AppError(
      "Invalid email or password",
      HttpStatus.UNAUTHORIZED,
      ErrorCodes.UNAUTHORIZED
    );
  }

  // 6. Update lastLogin timestamp in storage
  await authRepository.updateLastLogin(user._id);

  // 7. Generate JWT access and refresh tokens
  const accessToken = generateAccessToken({ id: user._id, role: user.role });
  const refreshToken = generateRefreshToken({ id: user._id });

  // 8. Hash and save refresh token to user document
  const hashedRefreshToken = hashToken(refreshToken);
  await authRepository.updateRefreshToken(user._id, hashedRefreshToken);

  logger.info(`User login successful: ${user.email}`);

  // 9. Return sanitized user object, access token, and raw refresh token
  return {
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role
    },
    accessToken,
    refreshToken
  };
};

export const refreshUserSession = async (token) => {
  if (!token) {
    logger.warn("Refresh session failed: Missing refresh token parameter");
    throw new AppError(
      "Refresh token is required",
      HttpStatus.UNAUTHORIZED,
      ErrorCodes.UNAUTHORIZED
    );
  }

  let decoded;
  try {
    // 1. Verify token signature and expiry
    decoded = verifyRefreshToken(token);
  } catch (err) {
    logger.warn("Refresh session failed: Invalid or expired refresh token signature");
    throw new AppError(
      "Invalid or expired refresh token",
      HttpStatus.UNAUTHORIZED,
      ErrorCodes.UNAUTHORIZED
    );
  }

  // 2. Fetch user matching the hashed refresh token
  const hashedToken = hashToken(token);
  const user = await authRepository.findUserByRefreshToken(hashedToken);
  if (!user || user.isDeleted) {
    logger.warn("Refresh session failed: Hashed refresh token mismatch or user is soft deleted");
    throw new AppError(
      "Invalid refresh token session",
      HttpStatus.UNAUTHORIZED,
      ErrorCodes.UNAUTHORIZED
    );
  }

  // 3. Confirm account status
  if (!user.isActive) {
    logger.warn(`Refresh session failed: Suspended account token rotation attempt: ${user.email}`);
    throw new AppError(
      "Your account has been deactivated. Please contact support.",
      HttpStatus.UNAUTHORIZED,
      ErrorCodes.UNAUTHORIZED
    );
  }

  // 4. Generate new tokens (Refresh Token Rotation)
  const newAccessToken = generateAccessToken({ id: user._id, role: user.role });
  const newRefreshToken = generateRefreshToken({ id: user._id });

  // 5. Update stored hashed refresh token in user document
  const hashedNewRefreshToken = hashToken(newRefreshToken);
  await authRepository.updateRefreshToken(user._id, hashedNewRefreshToken);

  logger.info(`Session rotated successfully for user: ${user.email}`);

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken
  };
};

export const logoutUser = async (token) => {
  if (!token) {
    logger.info("Logout requested without active token session (noop)");
    return;
  }

  try {
    // Look up user by hashed token
    const hashedToken = hashToken(token);
    const user = await authRepository.findUserByRefreshToken(hashedToken);
    if (user) {
      // Clear token from user document
      await authRepository.clearRefreshToken(user._id);
      logger.info(`User logged out successfully: ${user.email}`);
    } else {
      logger.info("Logout: Hashed refresh token not associated with any active user sessions");
    }
  } catch (err) {
    logger.error(`Error during user logout execution: ${err.message}`);
  }
};

export default {
  registerUser,
  loginUser,
  refreshUserSession,
  logoutUser,
  hashToken
};
