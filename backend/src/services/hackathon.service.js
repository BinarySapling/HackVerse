import hackathonRepository from '../repositories/hackathon.repository.js';
import AppError from '../errors/AppError.js';
import HttpStatus from '../constants/httpStatus.js';
import ErrorCodes from '../errors/ErrorCodes.js';
import HackathonStatus from '../constants/hackathonStatus.js';
import logger from '../config/logger.js';
import User from '../models/User.js';
import Roles from '../constants/roles.js';
import { isAdmin, isOwner } from '../utils/authorization.js';
import emailService from './email.service.js';

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

const resolveJudgeEmails = async (judgeEmails = []) => {
  const uniqueEmails = [...new Set(judgeEmails.map(email => email.trim().toLowerCase()).filter(Boolean))];
  if (uniqueEmails.length === 0) {
    return [];
  }

  const judges = await User.find({ email: { $in: uniqueEmails }, isDeleted: false });
  const foundEmails = new Set(judges.map(judge => judge.email));
  const missingEmails = uniqueEmails.filter(email => !foundEmails.has(email));
  if (missingEmails.length > 0) {
    throw new AppError(
      `Judge account not found for: ${missingEmails.join(', ')}`,
      HttpStatus.BAD_REQUEST,
      ErrorCodes.VALIDATION_ERROR
    );
  }

  const nonJudgeEmails = judges
    .filter(judge => judge.role !== Roles.JUDGE)
    .map(judge => judge.email);
  if (nonJudgeEmails.length > 0) {
    throw new AppError(
      `These users are not registered as judges: ${nonJudgeEmails.join(', ')}`,
      HttpStatus.BAD_REQUEST,
      ErrorCodes.VALIDATION_ERROR
    );
  }

  return judges;
};

const assertHackathonAccess = (hackathon, userId, userRole) => {
  const ownsHackathon = isOwner(hackathon.organizer, userId);
  const hasAdminBypass = isAdmin(userRole);
  if (!ownsHackathon && !hasAdminBypass) {
    throw new AppError(
      'Access denied: You do not own this hackathon',
      HttpStatus.FORBIDDEN,
      ErrorCodes.FORBIDDEN
    );
  }
};

export const resolveStatusFromDates = (hackathon, now = new Date()) => {
  const status = hackathon.status;
  if (status === HackathonStatus.DRAFT || status === HackathonStatus.ARCHIVED) {
    return status;
  }

  const hackEnd = new Date(hackathon.hackathonEnd);
  const hackStart = new Date(hackathon.hackathonStart);
  const regEnd = new Date(hackathon.registrationEnd);

  if (now >= hackEnd) {
    return hackathon.evaluationClosed ? HackathonStatus.COMPLETED : HackathonStatus.JUDGING;
  }
  if (now >= hackStart) {
    return HackathonStatus.ONGOING;
  }
  if (now > regEnd && status === HackathonStatus.REGISTRATION_OPEN) {
    return HackathonStatus.ONGOING;
  }

  return status;
};

const refreshHackathonStatus = async (hackathon) => {
  if (!hackathon || hackathon.isDeleted) {
    return hackathon;
  }

  const nextStatus = resolveStatusFromDates(hackathon);
  if (nextStatus === hackathon.status) {
    return hackathon;
  }

  await hackathonRepository.update(hackathon._id, { status: nextStatus });
  hackathon.status = nextStatus;
  logger.info(
    `Hackathon status auto-advanced: "${hackathon.title}" [ID: ${hackathon._id}] -> ${nextStatus}`
  );
  return hackathon;
};

export const createHackathon = async (organizerId, payload) => {
  const {
    title,
    registrationStart,
    registrationEnd,
    hackathonStart,
    hackathonEnd,
    minTeamSize,
    maxTeamSize,
    judgeEmails = []
  } = payload;

  // 1. Validate timelines & team sizes
  validateDates(registrationStart, registrationEnd, hackathonStart, hackathonEnd);
  validateTeamSizes(minTeamSize, maxTeamSize);
  const judges = await resolveJudgeEmails(judgeEmails);

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
    judgeEmails: undefined,
    judges: judges.map(judge => judge._id),
    slug,
    organizer: organizerId
  });

  logger.info(`Hackathon Created: "${hackathon.title}" [ID: ${hackathon._id}] [Organizer: ${organizerId}]`);

  if (judges.length > 0) {
    const organizer = await User.findById(organizerId);
    await Promise.allSettled(judges.map(judge => emailService.sendJudgeInvitation({
      judge,
      hackathon,
      organizer
    })));
    logger.info(`Judge invitations queued for hackathon "${hackathon._id}": ${judges.length}`);
  }

  return hackathon;
};

export const getHackathons = async (query) => {
  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  // Default to excluding soft-deleted documents
  const filter = { isDeleted: false };

  if (query.status) {
    filter.status = query.status;
  } else if (query.includeDrafts !== 'true') {
    // Public/default listing hides unpublished drafts
    filter.status = { $ne: 'draft' };
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
  if (query.mode) {
    filter.mode = query.mode;
  }
  if (query.theme) {
    filter.theme = { $regex: new RegExp(query.theme.trim(), 'i') };
  }

  // Sort mappings
  let sort = { createdAt: -1 }; // Default: newest first
  if (query.sort === 'oldest') {
    sort = { createdAt: 1 };
  } else if (query.sort === 'title') {
    sort = { title: 1 };
  }

  const hackathons = await hackathonRepository.findAll(filter, sort, skip, limit);
  const refreshedHackathons = await Promise.all(hackathons.map((h) => refreshHackathonStatus(h)));
  const total = await hackathonRepository.count(filter);

  return {
    hackathons: refreshedHackathons,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    }
  };
};

export const getHackathonBySlug = async (slug) => {
  const hackathon = await hackathonRepository.findBySlugOrId(slug);
  if (!hackathon) {
    throw new AppError("Hackathon not found", HttpStatus.NOT_FOUND, ErrorCodes.NOT_FOUND);
  }
  return refreshHackathonStatus(hackathon);
};

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

  if (['completed', 'archived'].includes(hackathon.status)) {
    throw new AppError(
      'Completed hackathons cannot be edited',
      HttpStatus.FORBIDDEN,
      ErrorCodes.FORBIDDEN
    );
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

  const updatedHackathon = await hackathonRepository.update(hackathonId, cleanPayload);

  logger.info(`Hackathon Updated: "${updatedHackathon.title}" [ID: ${updatedHackathon._id}] [User: ${userId}]`);
  return updatedHackathon;
};

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

export const publishHackathon = async (hackathonId, userId, userRole) => {
  const hackathon = await hackathonRepository.findById(hackathonId);
  if (!hackathon || hackathon.isDeleted) {
    throw new AppError('Hackathon not found', HttpStatus.NOT_FOUND, ErrorCodes.NOT_FOUND);
  }

  const ownsHackathon = isOwner(hackathon.organizer, userId);
  const hasAdminBypass = isAdmin(userRole);
  if (!ownsHackathon && !hasAdminBypass) {
    throw new AppError('Access denied: You do not own this hackathon', HttpStatus.FORBIDDEN, ErrorCodes.FORBIDDEN);
  }

  const now = new Date();
  let status = 'published';
  if (now >= new Date(hackathon.registrationStart) && now <= new Date(hackathon.registrationEnd)) {
    status = 'registration_open';
  } else if (now >= new Date(hackathon.hackathonStart) && now <= new Date(hackathon.hackathonEnd)) {
    status = 'ongoing';
  }

  const updated = await hackathonRepository.update(hackathonId, { status });
  logger.info(`Hackathon Published: "${updated.title}" [ID: ${hackathonId}] [Status: ${status}]`);
  return updated;
};

export const openRegistration = async (hackathonId, userId, userRole) => {
  const hackathon = await hackathonRepository.findById(hackathonId);
  if (!hackathon || hackathon.isDeleted) {
    throw new AppError('Hackathon not found', HttpStatus.NOT_FOUND, ErrorCodes.NOT_FOUND);
  }

  assertHackathonAccess(hackathon, userId, userRole);

  if ([HackathonStatus.DRAFT, HackathonStatus.ARCHIVED, HackathonStatus.COMPLETED].includes(hackathon.status)) {
    throw new AppError(
      'Registration cannot be opened for this hackathon',
      HttpStatus.BAD_REQUEST,
      ErrorCodes.VALIDATION_ERROR
    );
  }

  const updated = await hackathonRepository.update(hackathonId, {
    status: HackathonStatus.REGISTRATION_OPEN,
  });
  logger.info(`Registration opened: "${updated.title}" [ID: ${hackathonId}]`);
  return updated;
};

export const closeRegistration = async (hackathonId, userId, userRole) => {
  const hackathon = await hackathonRepository.findById(hackathonId);
  if (!hackathon || hackathon.isDeleted) {
    throw new AppError('Hackathon not found', HttpStatus.NOT_FOUND, ErrorCodes.NOT_FOUND);
  }

  assertHackathonAccess(hackathon, userId, userRole);

  if (hackathon.status !== HackathonStatus.REGISTRATION_OPEN) {
    throw new AppError(
      'Registration is not currently open',
      HttpStatus.BAD_REQUEST,
      ErrorCodes.VALIDATION_ERROR
    );
  }

  const updated = await hackathonRepository.update(hackathonId, {
    status: HackathonStatus.PUBLISHED,
  });
  logger.info(`Registration closed: "${updated.title}" [ID: ${hackathonId}]`);
  return updated;
};

export default {
  createHackathon,
  getHackathons,
  getHackathonBySlug,
  updateHackathon,
  deleteHackathon,
  publishHackathon,
  openRegistration,
  closeRegistration,
  resolveStatusFromDates,
};
