import hackathonRepository from '../repositories/hackathon.repository.js';
import AppError from '../errors/AppError.js';
import HttpStatus from '../constants/httpStatus.js';
import ErrorCodes from '../errors/ErrorCodes.js';
import logger from '../config/logger.js';
import { isAdmin, isOwner } from '../utils/authorization.js';

// Convert a string to an URL-safe slug
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start
    .replace(/-+$/, '');            // Trim - from end
};

// Common helper to validate timelines
const validateDates = (regStart, regEnd, hackStart, hackEnd) => {
  const rs = new Date(regStart);
  const re = new Date(regEnd);
  const hs = new Date(hackStart);
  const he = new Date(hackEnd);

  if (rs >= re) {
    throw new AppError(
      "Registration start date must occur before registration end date",
      HttpStatus.BAD_REQUEST,
      ErrorCodes.VALIDATION_ERROR
    );
  }
  if (re > hs) {
    throw new AppError(
      "Registration end date must occur on or before hackathon start date",
      HttpStatus.BAD_REQUEST,
      ErrorCodes.VALIDATION_ERROR
    );
  }
  if (hs >= he) {
    throw new AppError(
      "Hackathon start date must occur before hackathon end date",
      HttpStatus.BAD_REQUEST,
      ErrorCodes.VALIDATION_ERROR
    );
  }
};

// Common helper to validate team bounds
const validateTeamSizes = (minTeamSize, maxTeamSize) => {
  if (minTeamSize > maxTeamSize) {
    throw new AppError(
      "Minimum team size must be less than or equal to maximum team size",
      HttpStatus.BAD_REQUEST,
      ErrorCodes.VALIDATION_ERROR
    );
  }
  if (minTeamSize < 1 || maxTeamSize < 1) {
    throw new AppError(
      "Team sizes must be positive integers",
      HttpStatus.BAD_REQUEST,
      ErrorCodes.VALIDATION_ERROR
    );
  }
};

/**
 * @desc Create and save a new Hackathon record
 * @param {string} organizerId - Object ID of the organizer creating it
 * @param {Object} payload - Create parameters
 * @returns {Promise<Object>} The saved hackathon document
 */
export const createHackathon = async (organizerId, payload) => {
  const {
    title,
    registrationStart,
    registrationEnd,
    hackathonStart,
    hackathonEnd,
    minTeamSize,
    maxTeamSize
  } = payload;

  // 1. Validate timelines & team sizes
  validateDates(registrationStart, registrationEnd, hackathonStart, hackathonEnd);
  validateTeamSizes(minTeamSize, maxTeamSize);

  // 2. Generate unique slug (resolving conflicts by appending sequential suffixes)
  let baseSlug = slugify(title);
  if (!baseSlug) {
    baseSlug = 'hackathon';
  }
  let slug = baseSlug;
  let counter = 1;
  while (await hackathonRepository.existsBySlug(slug)) {
    counter++;
    slug = `${baseSlug}-${counter}`;
  }

  // 3. Persist document
  const hackathon = await hackathonRepository.create({
    ...payload,
    slug,
    organizer: organizerId
  });

  logger.info(`Hackathon Created: "${hackathon.title}" [ID: ${hackathon._id}] [Organizer: ${organizerId}]`);
  return hackathon;
};

/**
 * @desc Fetch a paginated, sorted, and filtered list of active hackathons
 * @param {Object} query - Express request query parameters
 * @returns {Promise<Object>} Object containing matched records and pagination metadata
 */
export const getHackathons = async (query) => {
  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  // Default to excluding soft-deleted documents
  const filter = { isDeleted: false };

  if (query.status) {
    filter.status = query.status;
  }
  if (query.visibility) {
    filter.visibility = query.visibility;
  }
  if (query.search) {
    const searchRegex = new RegExp(query.search.trim(), 'i');
    filter.$or = [
      { title: { $regex: searchRegex } },
      { tagline: { $regex: searchRegex } }
    ];
  }

  // Sort mappings
  let sort = { createdAt: -1 }; // Default: newest first
  if (query.sort === 'oldest') {
    sort = { createdAt: 1 };
  } else if (query.sort === 'title') {
    sort = { title: 1 };
  }

  const hackathons = await hackathonRepository.findAll(filter, sort, skip, limit);
  const total = await hackathonRepository.count(filter);

  return {
    hackathons,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    }
  };
};

/**
 * @desc Retrieve active hackathon details by URL slug
 * @param {string} slug - Unique slug string
 * @returns {Promise<Object>} The matched hackathon document
 */
export const getHackathonBySlug = async (slug) => {
  const hackathon = await hackathonRepository.findBySlug(slug);
  if (!hackathon) {
    throw new AppError("Hackathon not found", HttpStatus.NOT_FOUND, ErrorCodes.NOT_FOUND);
  }
  return hackathon;
};

/**
 * @desc Update hackathon properties with ownership validation guards
 * @param {string} hackathonId - Object ID of the hackathon
 * @param {string} userId - Object ID of the user request
 * @param {string} userRole - Privileged role of the user
 * @param {Object} updatePayload - Parameters to update
 * @returns {Promise<Object>} The updated hackathon document
 */
export const updateHackathon = async (hackathonId, userId, userRole, updatePayload) => {
  // 1. Retrieve the document
  const hackathon = await hackathonRepository.findById(hackathonId);
  if (!hackathon || hackathon.isDeleted) {
    throw new AppError("Hackathon not found", HttpStatus.NOT_FOUND, ErrorCodes.NOT_FOUND);
  }

  // 2. Validate ownership or Admin authorization
  const ownsHackathon = isOwner(hackathon.organizer, userId);
  const hasAdminBypass = isAdmin(userRole);
  if (!ownsHackathon && !hasAdminBypass) {
    logger.warn(`Unauthorized update attempt on hackathon "${hackathonId}" by user "${userId}"`);
    throw new AppError("Access denied: You do not own this hackathon", HttpStatus.FORBIDDEN, ErrorCodes.FORBIDDEN);
  }

  // 3. Validate timelines if either is updated
  const regStart = updatePayload.registrationStart || hackathon.registrationStart;
  const regEnd = updatePayload.registrationEnd || hackathon.registrationEnd;
  const hackStart = updatePayload.hackathonStart || hackathon.hackathonStart;
  const hackEnd = updatePayload.hackathonEnd || hackathon.hackathonEnd;
  validateDates(regStart, regEnd, hackStart, hackEnd);

  // 4. Validate team bounds if either is updated
  const minSize = updatePayload.minTeamSize !== undefined ? updatePayload.minTeamSize : hackathon.minTeamSize;
  const maxSize = updatePayload.maxTeamSize !== undefined ? updatePayload.maxTeamSize : hackathon.maxTeamSize;
  validateTeamSizes(minSize, maxSize);

  // 5. Filter out immutable columns to prevent overrides
  const { organizer, slug, isDeleted, ...cleanPayload } = updatePayload;

  // 6. Update database record
  const updatedHackathon = await hackathonRepository.update(hackathonId, cleanPayload);

  logger.info(`Hackathon Updated: "${updatedHackathon.title}" [ID: ${updatedHackathon._id}] [User: ${userId}]`);
  return updatedHackathon;
};

/**
 * @desc Soft-delete a hackathon record with ownership validation guards
 * @param {string} hackathonId - Object ID of the hackathon
 * @param {string} userId - Object ID of the user request
 * @param {string} userRole - Privileged role of the user
 * @returns {Promise<void>}
 */
export const deleteHackathon = async (hackathonId, userId, userRole) => {
  // 1. Retrieve the document
  const hackathon = await hackathonRepository.findById(hackathonId);
  if (!hackathon || hackathon.isDeleted) {
    throw new AppError("Hackathon not found", HttpStatus.NOT_FOUND, ErrorCodes.NOT_FOUND);
  }

  // 2. Validate ownership or Admin authorization
  const ownsHackathon = isOwner(hackathon.organizer, userId);
  const hasAdminBypass = isAdmin(userRole);
  if (!ownsHackathon && !hasAdminBypass) {
    logger.warn(`Unauthorized delete attempt on hackathon "${hackathonId}" by user "${userId}"`);
    throw new AppError("Access denied: You do not own this hackathon", HttpStatus.FORBIDDEN, ErrorCodes.FORBIDDEN);
  }

  // 3. Mark isDeleted = true in DB
  await hackathonRepository.softDelete(hackathonId);

  logger.info(`Hackathon Deleted: "${hackathon.title}" [ID: ${hackathonId}] [User: ${userId}]`);
};

export default {
  createHackathon,
  getHackathons,
  getHackathonBySlug,
  updateHackathon,
  deleteHackathon
};
