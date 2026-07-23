import submissionRepository from '../repositories/submission.repository.js';
import teamRepository from '../repositories/team.repository.js';
import hackathonRepository from '../repositories/hackathon.repository.js';
import AppError from '../errors/AppError.js';
import HttpStatus from '../constants/httpStatus.js';
import ErrorCodes from '../errors/ErrorCodes.js';
import logger from '../config/logger.js';
import Team from '../models/Team.js';
import { assertOrganizerOwnsHackathonOrAdmin, isAdmin } from '../utils/authorization.js';

/**
 * @desc Create a project submission for a team
 * @param {string} userId - Object ID of the requesting user
 * @param {string} hackathonId - Object ID of the hackathon
 * @param {Object} payload - Create parameters
 * @returns {Promise<Object>} Created Submission document
 */
export const createSubmission = async (userId, hackathonId, payload) => {
  // 1. Verify user is leader of a team in this hackathon
  const team = await teamRepository.findByLeader(userId, hackathonId);
  if (!team) {
    logger.warn(`Unauthorized submission attempt: User "${userId}" is not a team leader in hackathon "${hackathonId}"`);
    throw new AppError(
      "Access denied: Only team leaders can submit projects",
      HttpStatus.FORBIDDEN,
      ErrorCodes.FORBIDDEN
    );
  }

  // 2. Fetch hackathon details to verify submission window
  const hackathon = await hackathonRepository.findById(hackathonId);
  if (!hackathon || hackathon.isDeleted) {
    throw new AppError("Hackathon not found", HttpStatus.NOT_FOUND, ErrorCodes.NOT_FOUND);
  }

  const now = new Date();
  if (now > new Date(hackathon.hackathonEnd)) {
    throw new AppError(
      "Submission deadline has passed",
      HttpStatus.BAD_REQUEST,
      ErrorCodes.VALIDATION_ERROR
    );
  }

  // 3. Duplicate check (one active submission per team)
  const existingSubmission = await submissionRepository.findByTeam(team._id);
  if (existingSubmission) {
    throw new AppError(
      "A project has already been submitted for this team",
      HttpStatus.CONFLICT,
      ErrorCodes.CONFLICT
    );
  }

  // 4. Save submission
  const submission = await submissionRepository.create({
    ...payload,
    team: team._id,
    hackathon: hackathonId,
    submittedAt: now
  });

  logger.info(`Submission Created [ID: ${submission._id}] [Team: ${team._id}] [Leader: ${userId}]`);
  return submission;
};

/**
 * @desc Fetch active project submission details of a team where user is leader
 * @param {string} userId - Object ID of the team leader
 * @param {string} hackathonId - Object ID of the hackathon
 * @returns {Promise<Object>} Populated Submission document
 */
export const getMySubmission = async (userId, hackathonId) => {
  // 1. Fetch team where user is leader
  const team = await teamRepository.findByLeader(userId, hackathonId);
  if (!team) {
    throw new AppError(
      "You are not a team leader in this hackathon",
      HttpStatus.FORBIDDEN,
      ErrorCodes.FORBIDDEN
    );
  }

  // 2. Fetch submission matching team ID
  const submission = await submissionRepository.findByTeam(team._id);
  if (!submission) {
    throw new AppError(
      "No project submission found for this team",
      HttpStatus.NOT_FOUND,
      ErrorCodes.NOT_FOUND
    );
  }

  return submission;
};

/**
 * @desc Update submission properties (leader authorization required)
 * @param {string} submissionId - Object ID of the submission
 * @param {string} userId - Object ID of the team leader
 * @param {Object} payload - Update parameters
 * @returns {Promise<Object>} Updated Submission document
 */
export const updateSubmission = async (submissionId, userId, payload) => {
  // 1. Fetch submission details
  const submission = await submissionRepository.findById(submissionId);
  if (!submission || submission.isDeleted) {
    throw new AppError("Submission not found", HttpStatus.NOT_FOUND, ErrorCodes.NOT_FOUND);
  }

  // 2. Validate leader permissions
  const team = await teamRepository.findById(submission.team._id || submission.team);
  const teamLeaderId = team.leader._id || team.leader;
  if (teamLeaderId.toString() !== userId.toString()) {
    logger.warn(`Unauthorized submission update attempt on "${submissionId}" by user "${userId}"`);
    throw new AppError(
      "Access denied: Only the team leader can update this submission",
      HttpStatus.FORBIDDEN,
      ErrorCodes.FORBIDDEN
    );
  }

  // 3. Verify deadline has not crossed
  const hackathon = await hackathonRepository.findById(submission.hackathon._id || submission.hackathon);
  const now = new Date();
  if (now > new Date(hackathon.hackathonEnd)) {
    throw new AppError(
      "Submission deadline has passed",
      HttpStatus.BAD_REQUEST,
      ErrorCodes.VALIDATION_ERROR
    );
  }

  // 4. Strip out immutable fields during update
  const { team: t, hackathon: h, isDeleted, ...cleanPayload } = payload;
  const updatedSubmission = await submissionRepository.update(submissionId, cleanPayload);

  logger.info(`Submission Updated [ID: ${submissionId}] [Team: ${team._id}] [Leader: ${userId}]`);
  return updatedSubmission;
};

/**
 * @desc Delete project submission (leader or admin only)
 * @param {string} submissionId - Object ID of the submission
 * @param {string} userId - Object ID of the requesting user
 * @param {string} userRole - Role profile of the user
 * @returns {Promise<void>}
 */
export const deleteSubmission = async (submissionId, userId, userRole) => {
  // 1. Fetch submission details
  const submission = await submissionRepository.findById(submissionId);
  if (!submission || submission.isDeleted) {
    throw new AppError("Submission not found", HttpStatus.NOT_FOUND, ErrorCodes.NOT_FOUND);
  }

  // 2. Validate permissions (leader or admin)
  const team = await teamRepository.findById(submission.team._id || submission.team);
  const teamLeaderId = team.leader._id || team.leader;
  const isLeader = teamLeaderId.toString() === userId.toString();
  const hasAdminBypass = isAdmin(userRole);

  if (!isLeader && !hasAdminBypass) {
    logger.warn(`Unauthorized submission delete attempt on "${submissionId}" by user "${userId}"`);
    throw new AppError(
      "Access denied: Only the team leader or an admin can delete this submission",
      HttpStatus.FORBIDDEN,
      ErrorCodes.FORBIDDEN
    );
  }

  // 3. Execute soft delete
  await submissionRepository.softDelete(submissionId);

  logger.info(`Submission Deleted [ID: ${submissionId}] [Team: ${team._id}] [User: ${userId}]`);
};

/**
 * @desc Retrieve all submissions under a hackathon (organizer and admin only)
 * @param {string} hackathonId - Object ID of the hackathon
 * @param {string} userId - Object ID of the requesting organizer/admin
 * @param {string} userRole - Role profile of the requesting user
 * @param {Object} query - Query parameters (search and pagination)
 * @returns {Promise<Object>} Object containing submissions array and pagination metadata
 */
export const getOrganizerSubmissions = async (hackathonId, userId, userRole, query) => {
  const hackathon = await hackathonRepository.findById(hackathonId);
  if (!hackathon || hackathon.isDeleted) {
    throw new AppError("Hackathon not found", HttpStatus.NOT_FOUND, ErrorCodes.NOT_FOUND);
  }
  assertOrganizerOwnsHackathonOrAdmin(
    hackathon,
    userId,
    userRole,
    "Access denied: Only the hackathon organizer or an admin can view submissions"
  );

  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const filter = { hackathon: hackathonId, isDeleted: false };

  // Support search by team name
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

export default {
  createSubmission,
  getMySubmission,
  updateSubmission,
  deleteSubmission,
  getOrganizerSubmissions
};
