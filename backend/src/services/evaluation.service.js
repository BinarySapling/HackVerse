import evaluationRepository from '../repositories/evaluation.repository.js';
import hackathonRepository from '../repositories/hackathon.repository.js';
import submissionRepository from '../repositories/submission.repository.js';
import User from '../models/User.js';
import AppError from '../errors/AppError.js';
import HttpStatus from '../constants/httpStatus.js';
import ErrorCodes from '../errors/ErrorCodes.js';
import logger from '../config/logger.js';
import Roles from '../constants/roles.js';
import { assertOrganizerOwnsHackathonOrAdmin, isAdmin, isOwner } from '../utils/authorization.js';
import emailService from './email.service.js';

/**
 * @desc Assign a judge to a hackathon (Organizer and Admin only)
 * @param {string} organizerId - Object ID of the organizer/admin user
 * @param {string} organizerRole - Role profile of the requesting user
 * @param {string} hackathonId - Object ID of the hackathon
 * @param {string} judgeId - Object ID of the judge user to assign
 * @returns {Promise<Object>} Updated Hackathon document
 */
export const assignJudge = async (organizerId, organizerRole, hackathonId, judgeId) => {
  // 1. Fetch hackathon details
  const hackathon = await hackathonRepository.findById(hackathonId);
  if (!hackathon || hackathon.isDeleted) {
    throw new AppError("Hackathon not found", HttpStatus.NOT_FOUND, ErrorCodes.NOT_FOUND);
  }

  // 2. Validate organizer permissions (handles both populated and unpopulated organizer refs)
  const ownsHackathon = isOwner(hackathon.organizer, organizerId);
  const hasAdminBypass = isAdmin(organizerRole);
  if (!ownsHackathon && !hasAdminBypass) {
    throw new AppError(
      "Access denied: Only the hackathon organizer or an admin can assign judges",
      HttpStatus.FORBIDDEN,
      ErrorCodes.FORBIDDEN
    );
  }

  // 3. Verify target judge user exists and has role 'judge'
  const judge = await User.findById(judgeId);
  if (!judge) {
    throw new AppError("Judge user not found", HttpStatus.NOT_FOUND, ErrorCodes.NOT_FOUND);
  }
  if (judge.role !== Roles.JUDGE) {
    throw new AppError(
      "Target user is not registered as a judge",
      HttpStatus.BAD_REQUEST,
      ErrorCodes.VALIDATION_ERROR
    );
  }

  // 4. Save assignment if not already assigned
  const isAssigned = hackathon.judges && hackathon.judges.some(j => j.toString() === judgeId.toString());
  if (!isAssigned) {
    if (!hackathon.judges) {
      hackathon.judges = [];
    }
    hackathon.judges.push(judgeId);
    await hackathon.save();
    logger.info(`Judge Assigned: Judge [ID: ${judgeId}] assigned to hackathon [ID: ${hackathonId}] by organizer [ID: ${organizerId}]`);
  }

  try {
    const organizer = await User.findById(organizerId);
    await emailService.sendJudgeInvitation({
      judge,
      hackathon,
      organizer
    });
  } catch (error) {
    logger.error('Judge invitation email failed after successful assignment', {
      type: 'judge_invitation',
      recipient: judge.email,
      timestamp: new Date().toISOString(),
      reason: error.message
    });
  }

  return hackathon;
};

/**
 * @desc Evaluate a hackathon submission (assigned Judge only)
 * @param {string} judgeId - Object ID of the judge
 * @param {string} judgeRole - Role profile of the judge
 * @param {string} submissionId - Object ID of the submission to score
 * @param {Object} payload - Scoring values and remarks
 * @returns {Promise<Object>} Saved Evaluation document
 */
export const evaluateSubmission = async (judgeId, judgeRole, submissionId, payload) => {
  // 1. Fetch submission details
  const submission = await submissionRepository.findById(submissionId);
  if (!submission || submission.isDeleted) {
    throw new AppError("Submission not found", HttpStatus.NOT_FOUND, ErrorCodes.NOT_FOUND);
  }

  // 2. Fetch hackathon details to verify judge assignment
  const hackathonId = submission.hackathon._id || submission.hackathon;
  const hackathon = await hackathonRepository.findById(hackathonId);
  if (!hackathon || hackathon.isDeleted) {
    throw new AppError("Hackathon not found", HttpStatus.NOT_FOUND, ErrorCodes.NOT_FOUND);
  }

  const isAssigned = hackathon.judges && hackathon.judges.some(j => j.toString() === judgeId.toString());
  if (!isAssigned) {
    logger.warn(`Unauthorized evaluation attempt: Judge "${judgeId}" is not assigned to hackathon "${hackathonId}"`);
    throw new AppError(
      "Access denied: You are not assigned as a judge for this hackathon",
      HttpStatus.FORBIDDEN,
      ErrorCodes.FORBIDDEN
    );
  }

  // 3. Duplicate check (one evaluation per judge per submission)
  const existing = await evaluationRepository.findOne({ judge: judgeId, submission: submissionId });
  if (existing) {
    throw new AppError(
      "You have already evaluated this submission",
      HttpStatus.CONFLICT,
      ErrorCodes.CONFLICT
    );
  }

  // 4. Calculate totalScore
  const { innovationScore, technicalScore, presentationScore, remarks } = payload;
  const totalScore = innovationScore + technicalScore + presentationScore;

  // 5. Create evaluation document
  const evaluation = await evaluationRepository.create({
    hackathon: hackathonId,
    submission: submissionId,
    judge: judgeId,
    innovationScore,
    technicalScore,
    presentationScore,
    remarks,
    totalScore,
    evaluatedAt: new Date()
  });

  logger.info(`Evaluation Created [ID: ${evaluation._id}] [Submission: ${submissionId}] [Judge: ${judgeId}] [Total Score: ${totalScore}]`);
  return evaluation;
};

/**
 * @desc Update evaluation details (assigned Judge owner only)
 * @param {string} evaluationId - Object ID of the evaluation to edit
 * @param {string} judgeId - Object ID of the judge user
 * @param {Object} payload - Updates payload
 * @returns {Promise<Object>} Updated Evaluation document
 */
export const updateEvaluation = async (evaluationId, judgeId, payload) => {
  // 1. Fetch evaluation details
  const evaluation = await evaluationRepository.findById(evaluationId);
  if (!evaluation) {
    throw new AppError("Evaluation not found", HttpStatus.NOT_FOUND, ErrorCodes.NOT_FOUND);
  }

  // 2. Validate judge ownership
  const evalJudgeId = evaluation.judge._id || evaluation.judge;
  if (evalJudgeId.toString() !== judgeId.toString()) {
    logger.warn(`Unauthorized evaluation update attempt on "${evaluationId}" by user "${judgeId}"`);
    throw new AppError(
      "Access denied: You are not authorized to update this evaluation",
      HttpStatus.FORBIDDEN,
      ErrorCodes.FORBIDDEN
    );
  }

  // 3. Recalculate totalScore
  const innovation = payload.innovationScore !== undefined ? payload.innovationScore : evaluation.innovationScore;
  const technical = payload.technicalScore !== undefined ? payload.technicalScore : evaluation.technicalScore;
  const presentation = payload.presentationScore !== undefined ? payload.presentationScore : evaluation.presentationScore;
  const totalScore = innovation + technical + presentation;

  // 4. Exclude immutable fields
  const { judge, submission, hackathon, ...cleanPayload } = payload;
  const updateData = {
    ...cleanPayload,
    totalScore
  };

  const updated = await evaluationRepository.update(evaluationId, updateData);

  logger.info(`Evaluation Updated [ID: ${evaluationId}] [Judge: ${judgeId}] [Total Score: ${totalScore}]`);
  return updated;
};

/**
 * @desc Get evaluations scored by the authenticated judge user
 * @param {string} judgeId - Object ID of the judge
 * @param {Object} query - Query parameters (pagination)
 * @returns {Promise<Object>} Evaluations list and pagination metadata
 */
export const getMyEvaluations = async (judgeId, query) => {
  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const filter = { judge: judgeId };

  const evaluations = await evaluationRepository.findAll(filter, { createdAt: -1 }, skip, limit);
  const total = await evaluationRepository.count(filter);

  return {
    evaluations,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    }
  };
};

/**
 * @desc Get all evaluations under a hackathon (organizer and admin only)
 * @param {string} hackathonId - Object ID of the hackathon
 * @param {string} userId - Object ID of the requesting organizer/admin
 * @param {string} userRole - Role profile of the requesting user
 * @param {Object} query - Query parameters (pagination)
 * @returns {Promise<Object>} Evaluations list sorted by totalScore, and pagination metadata
 */
export const getOrganizerEvaluations = async (hackathonId, userId, userRole, query) => {
  const hackathon = await hackathonRepository.findById(hackathonId);
  if (!hackathon || hackathon.isDeleted) {
    throw new AppError("Hackathon not found", HttpStatus.NOT_FOUND, ErrorCodes.NOT_FOUND);
  }
  assertOrganizerOwnsHackathonOrAdmin(
    hackathon,
    userId,
    userRole,
    "Access denied: Only the hackathon organizer or an admin can view evaluations"
  );

  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const filter = { hackathon: hackathonId };

  const evaluations = await evaluationRepository.findAll(filter, { totalScore: -1 }, skip, limit);
  const total = await evaluationRepository.count(filter);

  return {
    evaluations,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    }
  };
};

export default {
  assignJudge,
  evaluateSubmission,
  updateEvaluation,
  getMyEvaluations,
  getOrganizerEvaluations
};
