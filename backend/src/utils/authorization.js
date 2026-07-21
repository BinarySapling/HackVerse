import AppError from '../errors/AppError.js';
import ErrorCodes from '../errors/ErrorCodes.js';
import HttpStatus from '../constants/httpStatus.js';
import Roles from '../constants/roles.js';

export const getObjectIdString = (value) => {
  if (!value) return '';
  return (value._id || value).toString();
};

export const isAdmin = (role) => role === Roles.ADMIN;

export const isOwner = (ownerId, userId) => {
  return getObjectIdString(ownerId) === getObjectIdString(userId);
};

export const assertOrganizerOwnsHackathonOrAdmin = (
  hackathon,
  userId,
  userRole,
  message = 'Access denied: Only the hackathon organizer or an admin can access this resource'
) => {
  if (isAdmin(userRole) || isOwner(hackathon?.organizer, userId)) {
    return;
  }

  throw new AppError(message, HttpStatus.FORBIDDEN, ErrorCodes.FORBIDDEN);
};
