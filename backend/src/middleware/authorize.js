import logger from '../config/logger.js';
import AppError from '../errors/AppError.js';
import HttpStatus from '../constants/httpStatus.js';
import ErrorCodes from '../errors/ErrorCodes.js';

export const authorize = (...allowedRoles) => {
  const roles = allowedRoles.flat();

  const middleware = (req, res, next) => {
    const logMetadata = { requestId: req.requestId };

    // 1. Safety check to make sure authentication middleware ran first
    if (!req.user) {
      logger.error('Authorization failed: req.user is undefined. Mount authenticate middleware first.', logMetadata);
      throw new AppError(
        "Authentication required",
        HttpStatus.UNAUTHORIZED,
        ErrorCodes.UNAUTHORIZED
      );
    }

    // 2. Validate user role matches at least one of the allowed parameters
    if (!roles.includes(req.user.role)) {
      logger.warn(
        `Authorization denied: user "${req.user.email}" with role "${req.user.role}" denied access to route requiring: [${roles.join(", ")}]`,
        logMetadata
      );
      throw new AppError(
        "Access denied: Insufficient privileges",
        HttpStatus.FORBIDDEN,
        ErrorCodes.FORBIDDEN
      );
    }

    logger.info(`Authorization success: user "${req.user.email}" authorized for route`, logMetadata);
    next();
  };

  middleware.rbacAllowedRoles = Object.freeze([...roles]);
  return middleware;
};

export default authorize;
