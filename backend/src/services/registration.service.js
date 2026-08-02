import registrationRepository from '../repositories/registration.repository.js';
import hackathonRepository from '../repositories/hackathon.repository.js';
import AppError from '../errors/AppError.js';
import HttpStatus from '../constants/httpStatus.js';
import ErrorCodes from '../errors/ErrorCodes.js';
import logger from '../config/logger.js';
import Roles from '../constants/roles.js';
import authRepository from '../repositories/auth.repository.js';
import emailService from './email.service.js';

export const registerForHackathon = async (userId, userRole, hackathonId) => {
  // 1. Enforce participant-only registration rule
  if (userRole !== Roles.PARTICIPANT) {
    logger.warn(`Registration attempt rejected: User "${userId}" with role "${userRole}" tried to register for hackathon "${hackathonId}"`);
    throw new AppError(
      "Only participants can register for hackathons",
      HttpStatus.FORBIDDEN,
      ErrorCodes.FORBIDDEN
    );
  }

  // 2. Fetch and check target hackathon
  const hackathon = await hackathonRepository.findById(hackathonId);
  if (!hackathon || hackathon.isDeleted) {
    throw new AppError(
      "Hackathon not found",
      HttpStatus.NOT_FOUND,
      ErrorCodes.NOT_FOUND
    );
  }

  // 3. Enforce registration window limits
  const now = new Date();
  const registrationStart = new Date(hackathon.registrationStart);
  const registrationEnd = new Date(hackathon.registrationEnd);

  if (now < registrationStart) {
    throw new AppError(
      "Registration has not started yet",
      HttpStatus.BAD_REQUEST,
      ErrorCodes.VALIDATION_ERROR
    );
  }
  if (now > registrationEnd) {
    throw new AppError(
      "Registration is closed for this hackathon",
      HttpStatus.BAD_REQUEST,
      ErrorCodes.VALIDATION_ERROR
    );
  }

  if (hackathon.status === 'draft' || hackathon.status === 'archived') {
    throw new AppError(
      'This hackathon is not open for registration yet',
      HttpStatus.BAD_REQUEST,
      ErrorCodes.VALIDATION_ERROR
    );
  }

  if (hackathon.status !== 'registration_open') {
    throw new AppError(
      'Registration is not open for this hackathon',
      HttpStatus.BAD_REQUEST,
      ErrorCodes.VALIDATION_ERROR
    );
  }

  if (hackathon.maxTeams) {
    const Team = (await import('../models/Team.js')).default;
    const teamCount = await Team.countDocuments({ hackathon: hackathonId, isDeleted: false });
    if (teamCount >= hackathon.maxTeams) {
      throw new AppError(
        'Maximum number of teams has been reached for this hackathon',
        HttpStatus.BAD_REQUEST,
        ErrorCodes.VALIDATION_ERROR
      );
    }
  }

  // 4. Handle duplicates and potential re-registrations
  const existingRegistration = await registrationRepository.findByUserAndHackathon(userId, hackathonId);
  if (existingRegistration) {
    if (existingRegistration.status === 'registered' || existingRegistration.status === 'pending') {
      throw new AppError(
        existingRegistration.status === 'pending'
          ? 'Your registration is pending organizer approval'
          : 'You are already registered for this hackathon',
        HttpStatus.CONFLICT,
        ErrorCodes.CONFLICT
      );
    }

    // Reactivate cancelled or rejected registration as pending
    if (existingRegistration.status === 'cancelled' || existingRegistration.status === 'rejected') {
      existingRegistration.status = 'pending';
      existingRegistration.registrationDate = new Date();
      await existingRegistration.save();
      logger.info(`Re-submitted registration [ID: ${existingRegistration._id}] for user: ${userId}`);
      return { registration: existingRegistration, isReactivated: true };
    }
  }

  // 5. Create new registration (needs organizer approval)
  const registration = await registrationRepository.create({
    user: userId,
    hackathon: hackathonId,
    status: 'pending'
  });

  logger.info(`User "${userId}" registered for hackathon "${hackathonId}" (pending). Registration ID: "${registration._id}"`);

  return { registration, isReactivated: false };
};

export const getMyRegistrations = async (userId, query) => {
  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const registrations = await registrationRepository.findMyRegistrations(userId, skip, limit);
  const total = await registrationRepository.countMyRegistrations(userId);

  return {
    registrations,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    }
  };
};

export const getHackathonRegistrations = async (hackathonId, userId, userRole) => {
  const hackathon = await hackathonRepository.findById(hackathonId);
  if (!hackathon || hackathon.isDeleted) {
    throw new AppError('Hackathon not found', HttpStatus.NOT_FOUND, ErrorCodes.NOT_FOUND);
  }

  const organizerId = (hackathon.organizer._id || hackathon.organizer).toString();
  if (userRole !== Roles.ADMIN && organizerId !== userId.toString()) {
    throw new AppError(
      'Only the organizer can view registrations',
      HttpStatus.FORBIDDEN,
      ErrorCodes.FORBIDDEN
    );
  }

  const registrations = await registrationRepository.findByHackathon(hackathonId);
  return registrations;
};

export const reviewRegistration = async (registrationId, userId, userRole, decision) => {
  if (!['approve', 'reject'].includes(decision)) {
    throw new AppError('Decision must be approve or reject', HttpStatus.BAD_REQUEST, ErrorCodes.VALIDATION_ERROR);
  }

  const registration = await registrationRepository.findById(registrationId);
  if (!registration || registration.isDeleted) {
    throw new AppError('Registration not found', HttpStatus.NOT_FOUND, ErrorCodes.NOT_FOUND);
  }

  const hackathon = registration.hackathon;
  const organizerId = (hackathon.organizer._id || hackathon.organizer).toString();
  if (userRole !== Roles.ADMIN && organizerId !== userId.toString()) {
    throw new AppError(
      'Only the organizer can review registrations',
      HttpStatus.FORBIDDEN,
      ErrorCodes.FORBIDDEN
    );
  }

  if (registration.status !== 'pending') {
    throw new AppError(
      'Only pending registrations can be reviewed',
      HttpStatus.BAD_REQUEST,
      ErrorCodes.VALIDATION_ERROR
    );
  }

  const nextStatus = decision === 'approve' ? 'registered' : 'rejected';
  const updated = await registrationRepository.updateStatus(registrationId, nextStatus);

  if (decision === 'approve') {
    try {
      const participant = await authRepository.findUserById(registration.user._id || registration.user);
      void emailService.sendParticipantConfirmation({
        participant,
        hackathon,
      });
    } catch (error) {
      logger.error(`Approval email failed: ${error.message}`);
    }
  }

  logger.info(`Registration ${registrationId} ${decision}d by ${userId}`);
  return updated;
};

export const cancelRegistration = async (registrationId, userId) => {
  // 1. Fetch registration
  const registration = await registrationRepository.findById(registrationId);
  if (!registration || registration.isDeleted) {
    throw new AppError(
      "Registration not found",
      HttpStatus.NOT_FOUND,
      ErrorCodes.NOT_FOUND
    );
  }

  // 2. Validate ownership (only the registered user can cancel)
  const registrationUserId = registration.user._id || registration.user;
  if (registrationUserId.toString() !== userId.toString()) {
    logger.warn(`Unauthorized cancel attempt on registration "${registrationId}" by user "${userId}"`);
    throw new AppError(
      "Access denied: You do not own this registration",
      HttpStatus.FORBIDDEN,
      ErrorCodes.FORBIDDEN
    );
  }

  // 3. Mark status as cancelled
  const updatedRegistration = await registrationRepository.updateStatus(registrationId, 'cancelled');

  logger.info(`Registration "${registrationId}" cancelled successfully by owner "${userId}"`);
  return updatedRegistration;
};

export default {
  registerForHackathon,
  getMyRegistrations,
  getHackathonRegistrations,
  reviewRegistration,
  cancelRegistration
};
