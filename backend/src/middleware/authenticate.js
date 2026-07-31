import logger from '../config/logger.js';
import AppError from '../errors/AppError.js';
import HttpStatus from '../constants/httpStatus.js';
import ErrorCodes from '../errors/ErrorCodes.js';
import { verifyAccessToken } from '../utils/jwt.js';
import authRepository from '../repositories/auth.repository.js';
import asyncHandler from '../utils/asyncHandler.js';

export const authenticate = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const logMetadata = { requestId: req.requestId };

  // 1. Read the JWT from the Authorization header (reject missing or malformed)
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    logger.warn('Authentication failed: Missing or malformed authorization header', logMetadata);
    throw new AppError(
      "Access token is missing or malformed",
      HttpStatus.UNAUTHORIZED,
      ErrorCodes.UNAUTHORIZED
    );
  }

  const token = authHeader.split(' ')[1];

  let decoded;
  try {
    // 2. Verify access token signature
    decoded = verifyAccessToken(token);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      logger.warn('Authentication failed: Expired access token', logMetadata);
      throw new AppError(
        "Access token has expired",
        HttpStatus.UNAUTHORIZED,
        ErrorCodes.UNAUTHORIZED
      );
    }
    logger.warn(`Authentication failed: Invalid access token signature: ${err.message}`, logMetadata);
    throw new AppError(
      "Invalid access token",
      HttpStatus.UNAUTHORIZED,
      ErrorCodes.UNAUTHORIZED
    );
  }

  // 3. Fetch latest user from DB (avoiding cached outdated details)
  const user = await authRepository.findUserById(decoded.id);

  if (!user || user.isDeleted) {
    logger.warn(`Authentication failed: User account ID ${decoded.id} does not exist or is soft deleted`, logMetadata);
    throw new AppError(
      "Authentication failed: User no longer exists",
      HttpStatus.UNAUTHORIZED,
      ErrorCodes.UNAUTHORIZED
    );
  }

  // 4. Reject inactive/suspended user sessions
  if (!user.isActive) {
    logger.warn(`Authentication failed: Deactivated account access attempt by "${user.email}"`, logMetadata);
    throw new AppError(
      "Your account has been deactivated. Please contact support.",
      HttpStatus.FORBIDDEN,
      ErrorCodes.FORBIDDEN
    );
  }

  // 5. Attach sanitized user details to request object (excluding password and session hashes)
  req.user = {
    id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    isVerified: user.isVerified,
    avatar: user.avatar || null,
  };

  logger.info(`Authentication success: validated user session "${user.email}"`, logMetadata);
  next();
});

authenticate.rbacRequiresAuthentication = true;

export default authenticate;
