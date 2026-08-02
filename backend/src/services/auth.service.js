import authRepository from '../repositories/auth.repository.js';
import AppError from '../errors/AppError.js';
import HttpStatus from '../constants/httpStatus.js';
import ErrorCodes from '../errors/ErrorCodes.js';
import logger from '../config/logger.js';
import bcrypt from 'bcrypt';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken
} from '../utils/jwt.js';
import crypto from 'crypto';
import otpService from './otp.service.js';
import emailService from './email.service.js';
import passwordResetService from './passwordReset.service.js';
import config from '../config/env.js';

export const hashToken = (token) => {
  if (!token) return null;
  return crypto.createHash('sha256').update(token).digest('hex');
};

const issueAndSendSignupOtp = async (user) => {
  const otp = otpService.generateOtp();
  const { expiresIn } = await otpService.storeSignupOtp(user.email, otp);

  try {
    await emailService.sendSignupOtp({
      user,
      otp,
      expiresInMinutes: Math.ceil(expiresIn / 60),
    });
  } catch (err) {
    throw new AppError(
      err.message || 'Could not send verification email. Please try again.',
      HttpStatus.BAD_GATEWAY,
      ErrorCodes.INTERNAL_ERROR
    );
  }

  // Welcome email is best-effort and must not block OTP delivery success
  emailService.sendWelcomeEmail({ user }).catch((err) => {
    logger.warn(`Welcome email failed for ${user.email}: ${err.message}`);
  });

  return { expiresIn };
};

export const registerUser = async (userData) => {
  const { email, password } = userData;
  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = await authRepository.findByEmail(normalizedEmail);

  if (existingUser && existingUser.isVerified) {
    logger.warn(`Duplicate registration attempt for email: ${normalizedEmail}`);
    throw new AppError(
      'Email address is already in use',
      HttpStatus.CONFLICT,
      ErrorCodes.CONFLICT
    );
  }

  // Unverified account: refresh OTP instead of creating a duplicate
  if (existingUser && !existingUser.isVerified) {
    await otpService.assertResendAllowed(normalizedEmail);
    const { expiresIn } = await issueAndSendSignupOtp(existingUser);

    logger.info(`Resent signup OTP for unverified user: ${normalizedEmail}`);
    return {
      user: existingUser,
      otpExpiresIn: expiresIn,
      verificationRequired: true,
      resent: true,
    };
  }

  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(password, salt);

  const createdUser = await authRepository.createUser({
    ...userData,
    email: normalizedEmail,
    password: hashedPassword,
    isVerified: false,
  });

  const { expiresIn } = await issueAndSendSignupOtp(createdUser);

  logger.info(`User registered successfully (pending OTP): ${createdUser.email}`);
  return {
    user: createdUser,
    otpExpiresIn: expiresIn,
    verificationRequired: true,
    resent: false,
  };
};

export const verifySignupEmail = async (email, otp) => {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await authRepository.findByEmail(normalizedEmail);

  if (!user || user.isDeleted) {
    throw new AppError('Account not found', HttpStatus.NOT_FOUND, ErrorCodes.NOT_FOUND);
  }

  if (user.isVerified) {
    return { alreadyVerified: true, user };
  }

  await otpService.verifySignupOtp(normalizedEmail, otp);
  const verifiedUser = await authRepository.markEmailVerified(user._id);

  logger.info(`Email verified for user: ${normalizedEmail}`);
  return { alreadyVerified: false, user: verifiedUser };
};

export const resendSignupOtp = async (email) => {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await authRepository.findByEmail(normalizedEmail);

  if (!user || user.isDeleted) {
    throw new AppError('Account not found', HttpStatus.NOT_FOUND, ErrorCodes.NOT_FOUND);
  }

  if (user.isVerified) {
    throw new AppError(
      'Email is already verified. Please log in.',
      HttpStatus.BAD_REQUEST,
      ErrorCodes.VALIDATION_ERROR
    );
  }

  await otpService.assertResendAllowed(normalizedEmail);
  const { expiresIn } = await issueAndSendSignupOtp(user);

  return { expiresIn };
};

export const loginUser = async (email, password) => {
  if (!email || !password) {
    throw new AppError(
      'Email and password are required',
      HttpStatus.BAD_REQUEST,
      ErrorCodes.VALIDATION_ERROR
    );
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = await authRepository.findUserByEmailWithPassword(normalizedEmail);

  if (!user || user.isDeleted) {
    logger.warn(`Login failed: email "${normalizedEmail}" does not exist or is deleted`);
    throw new AppError(
      'Invalid email or password',
      HttpStatus.UNAUTHORIZED,
      ErrorCodes.UNAUTHORIZED
    );
  }

  if (!user.isActive) {
    logger.warn(`Login failed: suspended account login attempt for email "${normalizedEmail}"`);
    throw new AppError(
      'Your account has been deactivated. Please contact support.',
      HttpStatus.UNAUTHORIZED,
      ErrorCodes.UNAUTHORIZED
    );
  }

  const isPasswordMatch = await bcrypt.compare(password, user.password);
  if (!isPasswordMatch) {
    logger.warn(`Login failed: invalid password attempt for email "${normalizedEmail}"`);
    throw new AppError(
      'Invalid email or password',
      HttpStatus.UNAUTHORIZED,
      ErrorCodes.UNAUTHORIZED
    );
  }

  if (!user.isVerified) {
    throw new AppError(
      'Please verify your email with the OTP we sent before logging in.',
      HttpStatus.FORBIDDEN,
      ErrorCodes.EMAIL_NOT_VERIFIED,
      true,
      { email: user.email, verificationRequired: true }
    );
  }

  await authRepository.updateLastLogin(user._id);

  const accessToken = generateAccessToken({ id: user._id, role: user.role });
  const refreshToken = generateRefreshToken({ id: user._id });

  const hashedRefreshToken = hashToken(refreshToken);
  await authRepository.updateRefreshToken(user._id, hashedRefreshToken);

  logger.info(`User login successful: ${user.email}`);

  return {
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      avatar: user.avatar || null,
    },
    accessToken,
    refreshToken,
  };
};

export const refreshUserSession = async (token) => {
  if (!token) {
    logger.warn('Refresh session failed: Missing refresh token parameter');
    throw new AppError(
      'Refresh token is required',
      HttpStatus.UNAUTHORIZED,
      ErrorCodes.UNAUTHORIZED
    );
  }

  let decoded;
  try {
    decoded = verifyRefreshToken(token);
  } catch (err) {
    logger.warn('Refresh session failed: Invalid or expired refresh token signature');
    throw new AppError(
      'Invalid or expired refresh token',
      HttpStatus.UNAUTHORIZED,
      ErrorCodes.UNAUTHORIZED
    );
  }

  const hashedToken = hashToken(token);
  const user = await authRepository.findUserByRefreshToken(hashedToken);
  if (!user || user.isDeleted) {
    logger.warn('Refresh session failed: Hashed refresh token mismatch or user is soft deleted');
    throw new AppError(
      'Invalid refresh token session',
      HttpStatus.UNAUTHORIZED,
      ErrorCodes.UNAUTHORIZED
    );
  }

  if (!user.isActive) {
    logger.warn(`Refresh session failed: Suspended account token rotation attempt: ${user.email}`);
    throw new AppError(
      'Your account has been deactivated. Please contact support.',
      HttpStatus.UNAUTHORIZED,
      ErrorCodes.UNAUTHORIZED
    );
  }

  const newAccessToken = generateAccessToken({ id: user._id, role: user.role });
  const newRefreshToken = generateRefreshToken({ id: user._id });

  const hashedNewRefreshToken = hashToken(newRefreshToken);
  await authRepository.updateRefreshToken(user._id, hashedNewRefreshToken);

  logger.info(`Session rotated successfully for user: ${user.email}`);

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};

export const logoutUser = async (token) => {
  if (!token) {
    logger.info('Logout requested without active token session (noop)');
    return;
  }

  try {
    const hashedToken = hashToken(token);
    const user = await authRepository.findUserByRefreshToken(hashedToken);
    if (user) {
      await authRepository.clearRefreshToken(user._id);
      logger.info(`User logged out successfully: ${user.email}`);
    } else {
      logger.info('Logout: Hashed refresh token not associated with any active user sessions');
    }
  } catch (err) {
    logger.error(`Error during user logout execution: ${err.message}`);
  }
};

export const changePassword = async (userId, currentPassword, newPassword) => {
  if (!currentPassword || !newPassword) {
    throw new AppError(
      'Current password and new password are required',
      HttpStatus.BAD_REQUEST,
      ErrorCodes.VALIDATION_ERROR
    );
  }

  const user = await authRepository.findUserByIdWithPassword(userId);
  if (!user || user.isDeleted) {
    throw new AppError('User not found', HttpStatus.NOT_FOUND, ErrorCodes.NOT_FOUND);
  }

  const matches = await bcrypt.compare(currentPassword, user.password);
  if (!matches) {
    throw new AppError(
      'Current password is incorrect',
      HttpStatus.UNAUTHORIZED,
      ErrorCodes.UNAUTHORIZED
    );
  }

  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(newPassword, salt);
  await authRepository.updatePassword(userId, hashedPassword);
  await authRepository.clearRefreshToken(userId);

  logger.info(`Password changed successfully for user: ${user.email}`);
  return true;
};

export const requestPasswordReset = async (email) => {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await authRepository.findByEmail(normalizedEmail);

  // Always return success so emails cannot be guessed
  if (!user || user.isDeleted) {
    logger.info(`Password reset requested for unknown email: ${normalizedEmail}`);
    return { sent: false };
  }

  const { token } = await passwordResetService.createPasswordResetToken(user._id);
  const resetUrl = `${config.frontendUrl}/reset-password?token=${encodeURIComponent(token)}`;

  const emailResult = await emailService.sendPasswordResetEmail({ user, resetUrl });
  if (emailResult?.skipped || emailResult?.failed) {
    logger.error('Password reset email was not delivered', {
      to: user.email,
      reason: emailResult?.reason,
    });

    if (config.nodeEnv !== 'production') {
      logger.warn(`DEV password reset link for ${user.email}: ${resetUrl}`);
      return { sent: false, resetUrl, reason: emailResult?.reason };
    }

    throw new AppError(
      emailResult?.reason
        ? `Could not send reset email: ${emailResult.reason}`
        : 'Could not send reset email. Check SMTP configuration.',
      HttpStatus.SERVICE_UNAVAILABLE,
      ErrorCodes.INTERNAL_ERROR
    );
  }

  return { sent: true };
};

export const resetPasswordWithToken = async (token, newPassword) => {
  if (!token || !newPassword) {
    throw new AppError(
      'Token and new password are required',
      HttpStatus.BAD_REQUEST,
      ErrorCodes.VALIDATION_ERROR
    );
  }

  const userId = await passwordResetService.consumePasswordResetToken(token);
  const user = await authRepository.findUserById(userId);
  if (!user || user.isDeleted) {
    throw new AppError('User not found', HttpStatus.NOT_FOUND, ErrorCodes.NOT_FOUND);
  }

  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(newPassword, salt);
  await authRepository.updatePassword(userId, hashedPassword);
  await authRepository.clearRefreshToken(userId);

  logger.info(`Password reset completed for user: ${user.email}`);
  return true;
};

export default {
  registerUser,
  verifySignupEmail,
  resendSignupOtp,
  loginUser,
  refreshUserSession,
  logoutUser,
  changePassword,
  requestPasswordReset,
  resetPasswordWithToken,
  hashToken,
};
