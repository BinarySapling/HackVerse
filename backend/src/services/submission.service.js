import submissionRepository from '../repositories/submission.repository.js';
import teamRepository from '../repositories/team.repository.js';
import hackathonRepository from '../repositories/hackathon.repository.js';
import registrationRepository from '../repositories/registration.repository.js';
import AppError from '../errors/AppError.js';
import HttpStatus from '../constants/httpStatus.js';
import ErrorCodes from '../errors/ErrorCodes.js';
import logger from '../config/logger.js';
import Team from '../models/Team.js';
import { assertOrganizerOwnsHackathonOrAdmin, isAdmin } from '../utils/authorization.js';
import notificationService from './notification.service.js';
import emailService from './email.service.js';
import User from '../models/User.js';
import { applyUploadedFiles, removeSubmissionFile } from '../utils/submissionFiles.js';

const getSubmissionWindow = (hackathon) => {
  const start = new Date(hackathon.submissionStart || hackathon.hackathonStart);
  const end = new Date(hackathon.submissionDeadline || hackathon.hackathonEnd);
  return { start, end };
};

const assertSubmissionWindowOpen = (hackathon) => {
  const now = new Date();
  const { start, end } = getSubmissionWindow(hackathon);

  if (now < start) {
    throw new AppError(
      'Submission window has not opened yet',
      HttpStatus.BAD_REQUEST,
      ErrorCodes.VALIDATION_ERROR
    );
  }
  if (now > end) {
    throw new AppError(
      'Submission deadline has passed',
      HttpStatus.BAD_REQUEST,
      ErrorCodes.VALIDATION_ERROR
    );
  }
};

const assertTeamReadyForSubmission = async (team, hackathon) => {
  if (team.members.length < hackathon.minTeamSize) {
    throw new AppError(
      `Team must have at least ${hackathon.minTeamSize} member(s) to submit`,
      HttpStatus.BAD_REQUEST,
      ErrorCodes.VALIDATION_ERROR
    );
  }

  const hackathonId = hackathon._id || hackathon;
  for (const member of team.members) {
    const memberId = member._id || member;
    const registration = await registrationRepository.findByUserAndHackathon(memberId, hackathonId);
    if (!registration || registration.status !== 'registered') {
      throw new AppError(
        'All team members must have approved registrations before submitting',
        HttpStatus.FORBIDDEN,
        ErrorCodes.FORBIDDEN
      );
    }
  }
};

export const createSubmission = async (userId, hackathonId, payload, files) => {
  const team = await teamRepository.findByLeader(userId, hackathonId);
  if (!team) {
    logger.warn(`Unauthorized submission attempt: User "${userId}" is not a team leader in hackathon "${hackathonId}"`);
    throw new AppError(
      'Access denied: Only team leaders can submit projects',
      HttpStatus.FORBIDDEN,
      ErrorCodes.FORBIDDEN
    );
  }

  const hackathon = await hackathonRepository.findById(hackathonId);
  if (!hackathon || hackathon.isDeleted) {
    throw new AppError('Hackathon not found', HttpStatus.NOT_FOUND, ErrorCodes.NOT_FOUND);
  }

  assertSubmissionWindowOpen(hackathon);
  await assertTeamReadyForSubmission(team, hackathon);

  const submissionPayload = applyUploadedFiles(payload, files);
  const existingSubmission = await submissionRepository.findByTeam(team._id);
  const now = new Date();

  let submission;
  if (existingSubmission) {
    const { team: t, hackathon: h, isDeleted, ...cleanPayload } = submissionPayload;
    if (files?.screenshot?.[0] && existingSubmission.screenshotUrl) {
      removeSubmissionFile(existingSubmission.screenshotUrl);
    }
    if (files?.presentation?.[0] && existingSubmission.presentationUrl) {
      removeSubmissionFile(existingSubmission.presentationUrl);
    }
    submission = await submissionRepository.update(existingSubmission._id, {
      ...cleanPayload,
      submittedAt: now
    });
    logger.info(`Submission Updated (resubmit) [ID: ${submission._id}] [Team: ${team._id}] [Leader: ${userId}]`);
  } else {
    submission = await submissionRepository.create({
      ...submissionPayload,
      team: team._id,
      hackathon: hackathonId,
      submittedAt: now
    });
    logger.info(`Submission Created [ID: ${submission._id}] [Team: ${team._id}] [Leader: ${userId}]`);
  }

  try {
    const leader = await User.findById(userId);
    void emailService.sendSubmissionSuccess({ participant: leader, hackathon, team });
    await notificationService.createNotification({
      userId,
      type: 'submission_success',
      title: 'Submission saved',
      message: `Your project for ${hackathon.title} was submitted successfully.`,
      meta: { hackathonId, teamId: team._id, submissionId: submission._id }
    });

    const organizerId = hackathon.organizer?._id || hackathon.organizer;
    await notificationService.createNotification({
      userId: organizerId,
      type: 'submission_received',
      title: 'New submission received',
      message: `Team ${team.name} submitted a project for ${hackathon.title}.`,
      meta: { hackathonId, teamId: team._id, submissionId: submission._id }
    });
  } catch (error) {
    logger.error('Post-submission notifications failed', { reason: error.message });
  }

  return submission;
};

export const getMySubmission = async (userId, hackathonId) => {
  const team = await teamRepository.findByLeader(userId, hackathonId);
  if (!team) {
    throw new AppError(
      'You are not a team leader in this hackathon',
      HttpStatus.FORBIDDEN,
      ErrorCodes.FORBIDDEN
    );
  }

  const submission = await submissionRepository.findByTeam(team._id);
  if (!submission) {
    throw new AppError(
      'No project submission found for this team',
      HttpStatus.NOT_FOUND,
      ErrorCodes.NOT_FOUND
    );
  }

  return submission;
};

export const updateSubmission = async (submissionId, userId, payload, files) => {
  const submission = await submissionRepository.findById(submissionId);
  if (!submission || submission.isDeleted) {
    throw new AppError('Submission not found', HttpStatus.NOT_FOUND, ErrorCodes.NOT_FOUND);
  }

  const team = await teamRepository.findById(submission.team._id || submission.team);
  const teamLeaderId = team.leader._id || team.leader;
  if (teamLeaderId.toString() !== userId.toString()) {
    logger.warn(`Unauthorized submission update attempt on "${submissionId}" by user "${userId}"`);
    throw new AppError(
      'Access denied: Only the team leader can update this submission',
      HttpStatus.FORBIDDEN,
      ErrorCodes.FORBIDDEN
    );
  }

  const hackathon = await hackathonRepository.findById(submission.hackathon._id || submission.hackathon);
  assertSubmissionWindowOpen(hackathon);

  const submissionPayload = applyUploadedFiles(payload, files);
  const { team: t, hackathon: h, isDeleted, ...cleanPayload } = submissionPayload;

  if (files?.screenshot?.[0] && submission.screenshotUrl) {
    removeSubmissionFile(submission.screenshotUrl);
  }
  if (files?.presentation?.[0] && submission.presentationUrl) {
    removeSubmissionFile(submission.presentationUrl);
  }

  const updatedSubmission = await submissionRepository.update(submissionId, {
    ...cleanPayload,
    submittedAt: new Date()
  });

  logger.info(`Submission Updated [ID: ${submissionId}] [Team: ${team._id}] [Leader: ${userId}]`);
  return updatedSubmission;
};

export const deleteSubmission = async (submissionId, userId, userRole) => {
  const submission = await submissionRepository.findById(submissionId);
  if (!submission || submission.isDeleted) {
    throw new AppError('Submission not found', HttpStatus.NOT_FOUND, ErrorCodes.NOT_FOUND);
  }

  const team = await teamRepository.findById(submission.team._id || submission.team);
  const teamLeaderId = team.leader._id || team.leader;
  const isLeader = teamLeaderId.toString() === userId.toString();
  const hasAdminBypass = isAdmin(userRole);

  if (!isLeader && !hasAdminBypass) {
    logger.warn(`Unauthorized submission delete attempt on "${submissionId}" by user "${userId}"`);
    throw new AppError(
      'Access denied: Only the team leader or an admin can delete this submission',
      HttpStatus.FORBIDDEN,
      ErrorCodes.FORBIDDEN
    );
  }

  const hackathon = await hackathonRepository.findById(submission.hackathon._id || submission.hackathon);
  if (!hasAdminBypass) {
    assertSubmissionWindowOpen(hackathon);
  }

  await submissionRepository.softDelete(submissionId);
  logger.info(`Submission Deleted [ID: ${submissionId}] [Team: ${team._id}] [User: ${userId}]`);
};

export const getOrganizerSubmissions = async (hackathonId, userId, userRole, query) => {
  const hackathon = await hackathonRepository.findById(hackathonId);
  if (!hackathon || hackathon.isDeleted) {
    throw new AppError('Hackathon not found', HttpStatus.NOT_FOUND, ErrorCodes.NOT_FOUND);
  }
  assertOrganizerOwnsHackathonOrAdmin(
    hackathon,
    userId,
    userRole,
    'Access denied: Only the hackathon organizer or an admin can view submissions'
  );

  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const filter = { hackathon: hackathonId, isDeleted: false };

  if (query.search) {
    const searchRegex = new RegExp(query.search.trim(), 'i');
    const matchedTeams = await Team.find({
      name: { $regex: searchRegex },
      hackathon: hackathonId,
      isDeleted: false
    }).select('_id');
    const teamIds = matchedTeams.map((t) => t._id);
    filter.team = { $in: teamIds };
  }

  const submissions = await submissionRepository.findAll(filter, { createdAt: -1 }, skip, limit);
  const total = await submissionRepository.count(filter);

  return {
    submissions,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    }
  };
};

export const reviewSubmission = async (submissionId, userId, userRole, status) => {
  const submission = await submissionRepository.findById(submissionId);
  if (!submission || submission.isDeleted) {
    throw new AppError('Submission not found', HttpStatus.NOT_FOUND, ErrorCodes.NOT_FOUND);
  }

  const hackathon = submission.hackathon;
  assertOrganizerOwnsHackathonOrAdmin(
    hackathon,
    userId,
    userRole,
    'Access denied: Only the hackathon organizer or an admin can review submissions'
  );

  const updated = await submissionRepository.update(submissionId, { status });
  logger.info(`Submission ${submissionId} marked as ${status} by ${userId}`);
  return updated;
};

export const getJudgeSubmissions = async (hackathonId, judgeId, query) => {
  const hackathon = await hackathonRepository.findById(hackathonId);
  if (!hackathon || hackathon.isDeleted) {
    throw new AppError('Hackathon not found', HttpStatus.NOT_FOUND, ErrorCodes.NOT_FOUND);
  }

  const isAssigned = hackathon.judges?.some((j) => j.toString() === judgeId.toString());
  if (!isAssigned) {
    throw new AppError(
      'Access denied: You are not assigned as a judge for this hackathon',
      HttpStatus.FORBIDDEN,
      ErrorCodes.FORBIDDEN
    );
  }

  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 50;
  const skip = (page - 1) * limit;
  const filter = { hackathon: hackathonId, isDeleted: false };

  const submissions = await submissionRepository.findAll(filter, { createdAt: -1 }, skip, limit);
  const total = await submissionRepository.count(filter);

  return {
    submissions,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    }
  };
};

export default {
  createSubmission,
  getMySubmission,
  updateSubmission,
  deleteSubmission,
  getOrganizerSubmissions,
  reviewSubmission,
  getJudgeSubmissions
};
